const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const app = express();
const port = 5000;

const authData = JSON.parse(fs.readFileSync('authentication.json'));

console.log(`Client ID: ${ authData['client_id'] }, secret: ${ authData['client_secret'] }.`);


app.get('/', (req, res) => res.send('Hello World!'));

app.get('/api/request_token', async(req, res) => {
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



// app.get('/', async (req, res) => {
//     let todos = await fetch('http://jsonplaceholder.typicode.com/todos/1');
//     let json = await todos.json();
//     console.log(json);
//     res.send(json);
    
// })

app.listen(port, () => console.log(`Example app listening on port ${port}!`));