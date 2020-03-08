const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");
const { URLSearchParams } = require("url");
const sqlite3 = require("sqlite3");
var moment = require("moment");

moment().format();

const app = express();

const port = process.env.PORT || 5000;
const APP_URL = process.env.URL || `http://localhost:${port}`;
const dbName = (app.get('env') === 'test') ? './sqlite-db/test.db' : './sqlite-db/tracks.db';
console.log(dbName);

app.use(cookieParser());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const dbPath = path.resolve(__dirname, dbName);
const db = new sqlite3.Database(dbPath, err => {
    if (err) {
        console.log(dbPath);
        console.log(err.message);
        return;
    }
});

const db_time_format = "%Y-%m-%d %H:%M:%S";

const authData = JSON.parse(fs.readFileSync("authentication.json"));

try {
    var access_token = JSON.parse(fs.readFileSync("tokens.json"))["access_token"];
    var refresh_token = JSON.parse(fs.readFileSync("tokens.json"))["refresh_token"];
} catch (err) {
    console.log("No tokens found. Create tokens first by visiting /api/request_code")};


console.log(
    `Client ID: ${authData["client_id"]}, secret: ${authData["client_secret"]}.`
);
console.log(`Port: ${port}`);
console.log(`URL: ${APP_URL}`);

const authorization_header = Buffer.from(
    `${authData["client_id"]}:${authData["client_secret"]}`
).toString("base64");

app.get("/", (req, res) => res.send("Hello World!"));

app.get("/api/request_code", async (req, res) => {
    console.log("in request_code");
    const params = new URLSearchParams({
        client_id: authData["client_id"],
        response_type: "code",
        redirect_uri: `${APP_URL}/api/request_token/callback`,
        scope: "user-read-recently-played"
    });

    let code = await fetch("https://accounts.spotify.com/authorize?" + params);
    let response = code.url;

    console.log("redirecting from request code");
    return res.redirect(response);
});

app.get("/api/request_token/callback", async (req, res) => {
    console.log("in callback")
    res.cookie("authentication_code", req.query.code, {
        expires: new Date(Date.now() + 9000000),
        sameSite: true
    });
    console.log("redirecting from callback");
    return res.redirect("/api/request_token");
});

app.get("/api/request_token", async (req, res) => {
    console.log("in request token");
    const url = "https://accounts.spotify.com/api/token";
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", req.cookies.authentication_code);
    params.append(
        "redirect_uri",
        `${APP_URL}/api/request_token/callback`
    );
    
    console.log("redirect uri in request_token is " + `${APP_URL}/api/request_token/callback`);

    let token_response = await fetch(url, {
        method: "POST",
        body: params,
        headers: {
            Authorization: "Basic " + authorization_header
        }
    }).then(res => res.json());

    console.log(token_response);

    access_token = token_response.access_token;
    refresh_token = token_response.refresh_token;

    var tokens_json = `{"access_token": "${access_token}",\n "refresh_token": "${refresh_token}"}`;
    fs.writeFile("tokens.json", tokens_json, "utf8", function (err) {
        if (err) {
            console.log("An error occured writing JSON to file");
            return console.log(err);
        }
    });

    console.log("updated refresh token via redirect to " + refresh_token);
    if (req.cookies.redirect_to == 'update_tracks'){
        res.clearCookie('redirect_to');
        return res.redirect('/api/update_tracks');
    }
    return res.send(access_token);
});

app.get("/api/get_mean_valence_by_days", async (req, res) => {
    let q = "SELECT avg(valence) AS avg_valence FROM tracks WHERE play_date > datetime('now', '-' || ? || ' days');";

    db.get(q, [req.query.days],
        (err, row) => {
            if (err) {
                res.status(500).send(err);
                return;
            }

            row["avg_valence"] == null ? res.status(204).send() : res.send(row["avg_valence"].toString());
        });
});

app.get("/api/get_tracks_by_days", async (req, res) => {
    let q = "SELECT play_date AS date, title, valence, spotifyid FROM tracks WHERE play_date > datetime('now', '-' || ? || ' days') ORDER BY play_date ASC;";

    db.all(q, [req.query.days],
        (err, rows) => {
            if (err) {
                res.status(500).send(err);
                return;
            }

            rows.length == 0 ? res.status(204).send() : res.send(rows);
        });
});

app.get("/api/get_tracks_by_date", async (req, res) => {
    let q = "SELECT play_date AS date, title, valence, spotifyid FROM tracks WHERE play_date > date(?) AND play_date < date(?) ORDER BY play_date ASC;";

    db.all(q, [req.query.startDate, req.query.endDate],
        (err, rows) => {
            if (err) {
                res.status(500).send(err);
                return;
            }

            rows.length == 0 ? res.status(204).send() : res.send(rows);
        });
});




app.get("/api/update_tracks", async (req, res) => {
    if (refresh_token == undefined) {
        res.cookie('redirect_to', 'update_tracks', {
            expires: new Date(Date.now() + 9000000),
            sameSite: true
        });

        console.log("undefined refresh token ");
        console.log("redirecting...");

        return res.redirect('/api/request_code');
    }

    console.log("in update tracks with refresh token " + refresh_token);
    console.log("retrieving latest db date");
    var latest_play_date = await get_latest_db_date();
    console.log("got latest db date");
    console.log("getting recently played tracks");
    var tracks = await get_recently_played_tracks();
    console.log("got recently played tracks");

    index = 0;

    tracks.some(track => {
        if (moment(track[2]).isSameOrBefore(latest_play_date)) {
            return true; // break
        }
        index += 1;
    });

    let new_tracks = tracks.slice(0, index);

    if (index == 0) console.log("No new tracks to add");
    
    else {
        console.log("pushing to db");

        let placeholders = new_tracks
            .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .join(", ");
        let sql =
            "INSERT INTO tracks (spotifyid, title, play_date, valence, acousticness, danceability, energy, speechiness, tempo) VALUES " +
            placeholders;

        let flattenedTracks = new_tracks.flat();
        // console.log(flattenedTracks);

        db.serialize(function() {
            db.run(sql, flattenedTracks, err => {
                if (err) {
                    console.error(err.message);
                }
            });
        });
        
        console.log("added new_tracks");
    }

   
    res.send(new_tracks);
});

async function refresh_access_token() {
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refresh_token);

    let r = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: "Basic " + authorization_header
        },
        body: params
    }).catch(err => {
        console.log("error in refresh access token");
    });

    let json = await r.json();
    console.log(json);
    access_token = json.access_token;

    console.log("changed token to " + json.access_token);
}

function get_latest_db_date() {
    return new Promise(function(resolve, reject) {

        const query =
            "SELECT play_date date FROM tracks ORDER BY play_date DESC LIMIT 1;";

        db.serialize(function() {
            db.get(query, [], (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject("error getting latest track date");
                }
                if (!row) {
                    resolve(new moment("1995-12-17 03:24:00"));
                } else {
                    console.log(row.date);
                    resolve(moment(row.date));
                }
            });
        });
    });
}

async function get_recently_played_tracks() {
    return new Promise(async (resolve, reject) => {
        const url =
            "https://api.spotify.com/v1/me/player/recently-played?limit=50";

        var history;
        var tracksPlayed = [];
        var spotifyIDs = [];

        while (true) {
            try {
                await fetch(url, {
                    headers: {
                        Authorization: "Bearer " + access_token
                    }
                }).then(async function(res) {
                    if (res.status == 401) throw "401 Error";
                    else history = await res.json();
                });
            } catch (e) {
                if (e == "401 Error") {
                    refresh_access_token();
                    continue;
                }
            }
            break;
        }

        history.items.forEach(item => {
            let trackArray = [
                item.track.id,
                item.track.name,
                moment(item.played_at).format("YYYY-MM-DD HH:mm:ss")
            ];

            tracksPlayed.push(trackArray);
            spotifyIDs.push(item.track.id);
        });

        let r2 = await fetch(
            `https://api.spotify.com/v1/audio-features?ids=${spotifyIDs.join(
                ","
            )}`,
            {
                headers: {
                    Authorization: "Bearer " + access_token
                }
            }
        );

        let json = await r2.json();
        let audio_features = json.audio_features;

        for (let i = 0; i < tracksPlayed.length; i++) {
            tracksPlayed[i].push(
                audio_features[i].valence,
                audio_features[i].acousticness,
                audio_features[i].danceability,
                audio_features[i].energy,
                audio_features[i].speechiness,
                audio_features[i].tempo
            );
        }

        resolve(tracksPlayed);
    });
}

process.on('SIGINT', () => {
  db.close();
  process.exit();
});

// app.listen(port, () => console.log(`App listening on port ${port}!`));
exports.main = app;
exports.get_latest_db_date = get_latest_db_date;
exports.get_recently_played_tracks = get_recently_played_tracks;
