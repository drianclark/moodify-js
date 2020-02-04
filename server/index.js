const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 5000

app.get('/', (req, res) => res.send('Hello World!'))

app. get('/api/request_token', async(req, res) => {
    const params = new URLSearchParams({ 
        client_id: '44ef850b66114e6ea1d2fd3c9124af70',
        response_type: 'code',
        redirect_uri: '/api/request_token/callback',
        scope: 'user-read-recently-played'
    });

    let code = await fetch('https://accounts.spotify.com/authorize' + params)
    let response = code.url;
});


app.get('/test', async (req, res) => {
    let todos = await fetch('http://jsonplaceholder.typicode.com/todos/1')
    let json = await todos.json()
    console.log(json);
    res.send(json)
    
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))