const app = require('./index.js');
const fetch = require('node-fetch');
const https = require('https');
const fs = require('fs');

const port = process.env.PORT || 5000;
const url = process.env.URL || 'http://localhost:5000';

app.main.listen(port, () => {
    console.log('App listening on port ' + port);
});