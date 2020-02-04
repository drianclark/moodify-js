const express = require('express')
const fetch = require('node-fetch');
const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/test', async (req, res) => {
    let todos = await fetch('http://jsonplaceholder.typicode.com/todos/1')
    let json = await todos.json()
    console.log(json);
    res.send(json)
    
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))