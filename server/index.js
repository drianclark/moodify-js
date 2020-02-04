const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs')
const cookieParser = require('cookie-parser');
const { URLSearchParams } = require('url');
const app = express();
const port = 5000;

app.use(cookieParser());

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
    res.send('Made it to callback');
});

app.get('/api/request_token', async (req, res) => {
    const url = 'https://accounts.spotify.com/api/token'
    console.log("Basic " + authorization_header);
    console.log(req.cookies.authentication_code);
    console.log(req.cookies);
    const params = new URLSearchParams()
    params.append('grant_type', 'authorization_code');
    params.append('code', req.cookies.authentication_code);
    params.append('redirect_uri', 'http://localhost:5000/api/request_token/callback');
    
    
    let token_response = await fetch(url, {
        method: 'POST',
        body: params,
        headers: {
            Authorization: "Basic " + authorization_header,
            ConentEncoding: 'application/x-www-form-urlencoded'
        }
    })
    .then(res => res.text());

    // let json = await token_response.body

    console.log(token_response);
    
});
// app.get('/', async (req, res) => {
//     let todos = await fetch('http://jsonplaceholder.typicode.com/todos/1');
//     let json = await todos.json();
//     console.log(json);
//     res.send(json);
    
// })

app.listen(port, () => console.log(`Example app listening on port ${port}!`));