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

    // let json = await token_response.body
    
    var access_token = token_response.access_token;
    var access_token_json = `{ "access_token": "${access_token}"}`;

    fs.writeFile('access_token.json', access_token_json, 'utf8', function (err) {
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
    const url = 'https://api.spotify.com/v1/me/player/recently-played?limit=50';
    console.log(access_token);
    
    let r = await fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    });

    let json = await r.json();
    console.log(json.items);
    res.send(json.items)
});

app.listen(port, () => console.log(`App listening on port ${port}!`));