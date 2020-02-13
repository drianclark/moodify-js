const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs')
const cookieParser = require('cookie-parser');
const { URLSearchParams } = require('url');
var mysql = require('mysql');
const app = express();
const port = 5000;

app.use(cookieParser());

const connection = mysql.createConnection({
    host: 'db',
    user: 'admin',
    password: 'root',
    database: 'db'
});

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
    connection.connect(function(err) {
        if (err) throw err;
        connection.query("SELECT * FROM tracks", function (err, result, fields) {
            if (err) throw err;
            res.send(result)
        });
    });
});

app.get('/api/update_tracks', async (req, res) => {
    // console.log("Updating tracks with access token" + access_token);
    const url = 'https://api.spotify.com/v1/me/player/recently-played?limit=50';
    // console.log(access_token);

    var history; 
    var tracksPlayed = [];
    var spotifyIDs = [];   

    while (true) {
        try {
            var r = await fetch(url, {
                headers: {
                    'Authorization': 'Bearer ' + access_token
                }
            })
            .then(async res => {
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
        console.log("done with while");
        
        break;
    };

    console.log(history.items);
    // res.send(json.items)

    history.items.forEach(item => {
        let trackObject = {
            'id' : item.track.id,
            'title' : item.track.name,
            'date' : item.played_at
        }

        tracksPlayed.push(trackObject);
        spotifyIDs.push(item.track.id);
    });

    let r2 = await fetch(`https://api.spotify.com/v1/audio-features?ids=${spotifyIDs.join(',')}`, {
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    });
    
    let audio_features = await r2.json();

    res.send(audio_features)
});

async function refresh_access_token(){
    console.log("in refresh_access_token")
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
    return json.access_token;
}

app.listen(port, () => console.log(`App listening on port ${port}!`));