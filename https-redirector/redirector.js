const express = require('express');
const http = require('http');

const app = express();

app.get('*', (request, response, next) =>  {
    console.log(`redirecting ${request.url} to https`);
    response.redirect('https://' + request.headers.host + request.url);
});

http.createServer(app).listen(80, () => {
    console.log('App listening on port ' + 80);
});
