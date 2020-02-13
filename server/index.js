const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs')
const cookieParser = require('cookie-parser');
const { URLSearchParams } = require('url');
var mysql = require('mysql');
var moment = require('moment');
moment().format();

const app = express();
const port = 5000;

app.use(cookieParser());

const pool = mysql.createPool({
    host: 'db',
    user: 'admin',
    password: 'root',
    database: 'db'
});

const db_time_format = '%Y-%m-%d %H:%M:%S';

const authData = JSON.parse(fs.readFileSync('authentication.json'));
var access_token = JSON.parse(fs.readFileSync('tokens.json'))['access_token'];
var refresh_token = JSON.parse(fs.readFileSync('tokens.json'))['refresh_token'];

console.log(`Client ID: ${ authData['client_id'] }, secret: ${ authData['client_secret'] }.`);
const authorization_header = Buffer.from(`${ authData['client_id'] }:${ authData['client_secret']}`).toString('base64');

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/api/request_code', async(req, res) => {
    const params = new URLSearchParams({ 
        client_id: authData['client_id'],
        response_type: 'code',
        redirect_uri: 'http://localhost:5000/api/request_token/callback',
        scope: 'user-read-recently-played'
    });

    let code = await fetch('https://accounts.spotify.com/authorize?' + params);
    let response = code.url;
    
    res.redirect(response);
});

app.get('/api/request_token/callback', async(req, res) => {
    res.cookie('authentication_code', req.query.code, { expires: new Date(Date.now() + 9000000),  sameSite: true });
    res.redirect('/api/request_token');
});

app.get('/api/request_token', async (req, res) => {
    const url = 'https://accounts.spotify.com/api/token'
    const params = new URLSearchParams()
    params.append('grant_type', 'authorization_code');
    params.append('code', req.cookies.authentication_code);
    params.append('redirect_uri', 'http://localhost:5000/api/request_token/callback');
    
    
    let token_response = await fetch(url, {
        method: 'POST',
        body: params,
        headers: {
            Authorization: 'Basic ' + authorization_header
        }
    })
    .then(res => res.json());
    
    var access_token = token_response.access_token;
    var refresh_token = token_response.refresh_token;
    var tokens_json = `{"access_token": "${access_token}",\n "refresh_token": "${refresh_token}"}`

    fs.writeFile('tokens.json', tokens_json, 'utf8', function (err) {
        if (err) {
            console.log("An error occured writing JSON to file");
            return console.log(err);
        }
    })
    
    console.log(access_token);
    res.send(access_token);
});

app.get('/api/mysql_test', async (req, res) => {
    pool.getConnection(function (err, connection) {
        connection.query("SELECT * FROM tracks", function (err, result, fields) {
            connection.release();
            if (err) throw err;
            res.send(result)
        });
    });
});

app.get('/api/update_tracks', async (req, res) => {
    var latest_play_date = await get_latest_db_date()
    var tracks = await get_recently_played_tracks();
    
    index = 0;

    tracks.some(track => {
        if (moment(track[2]).isSameOrBefore(latest_play_date)){
            return true; // break
        }
        index +=1;
    });

    
    let new_tracks = tracks.slice(0, index);

    if (index > 0) {
        console.log("pushing to db")
        pool.getConnection(function (err, connection) {
            let sql = 'INSERT INTO tracks (spotifyid, title, play_date, valence, acousticness, danceability, energy, speechiness, tempo) VALUES ?'
            connection.query(sql, [new_tracks], function (err, result, fields) {
                if (err) console.log(err);
            });
        });
    }

    res.send(new_tracks);
});

async function refresh_access_token(){
    const params = new URLSearchParams()
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refresh_token);

    let r = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + authorization_header
        },
        body: params
    })
    .catch(err => {
        console.log("error in refresh access token")
    });
    
    let json = await r.json();
    access_token = json.access_token;
    console.log("changed token to " + json.access_token)
    
    var tokens_json = `{"access_token": "${access_token}",\n "refresh_token": "${refresh_token}"}`
    fs.writeFile('tokens.json', tokens_json, 'utf8', function (err) {
        if (err) {
            console.log("An error occured writing JSON to file");
            return console.log(err);
        }
    })
}

function get_latest_db_date() {

    return new Promise(function(resolve, reject) {
        pool.getConnection(function (err, connection) {
            connection.query("SELECT play_date FROM tracks ORDER BY play_date DESC LIMIT 1;", function (err, result, fields) {
                if (result.length == 0) {
                    resolve(new moment('1995-12-17 03:24:00'));
                }
                else {
                    console.log(result[0]);
                    resolve(moment(result[0].play_date));
                }
                if (err) reject("error");
                
            });
        });
    })
};

async function get_recently_played_tracks() {
    return new Promise(async (resolve, reject) => {
        const url = 'https://api.spotify.com/v1/me/player/recently-played?limit=50';

        var history;
        var tracksPlayed = [];
        var spotifyIDs = [];
        
        while (true) {
            try {
                await fetch(url, {
                    headers: {
                        'Authorization': 'Bearer ' + access_token
                    }
                })
                .then(async function (res) {
                    if (res.status == 401) throw "401 Error";
                    else history = await res.json();

                });
            }
            catch(e){
                if (e == "401 Error") {
                    console.log(e);
                    refresh_access_token();
                    continue;
                } 
            }
            break;
        };
    
        history.items.forEach(item => {
            let trackArray = [item.track.id, item.track.name, moment(item.played_at).format('YYYY-MM-DD HH:mm:ss')];
          
            tracksPlayed.push(trackArray);
            spotifyIDs.push(item.track.id);
        });

        let r2 = await fetch(`https://api.spotify.com/v1/audio-features?ids=${spotifyIDs.join(',')}`, {
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        });
        
        let json = await r2.json();
        let audio_features = json.audio_features;

        for (let i = 0; i < tracksPlayed.length; i++) {
            tracksPlayed[i].push(
                audio_features[i].valence, 
                audio_features[i].acousticness, 
                audio_features[i].danceability, 
                audio_features[i].energy, 
                audio_features[i].speechiness,
                audio_features[i].tempo);
        }
    
        resolve(tracksPlayed);
    })
}

app.listen(port, () => console.log(`App listening on port ${port}!`));