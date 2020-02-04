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
    console.log(req.query.code);
    
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
            Authorization: 'Basic ' + authorization_header,
        }
    })
    .then(res => res.json());

    // let json = await token_response.body

    console.log(token_response);
    res.send(token_response);
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

app.listen(port, () => console.log(`App listening on port ${port}!`));