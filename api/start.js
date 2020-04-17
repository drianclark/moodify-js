const app = require('./index.js');
const fetch = require('node-fetch');
const https = require('https');
const fs = require('fs');

const port = process.env.PORT || 5000;

// app.main.listen(port, () => {
//     console.log('App listening on port ' + port);
// });

https.createServer({
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.cert')
  }, app.main)
  .listen(port, function () {
    console.log('App listening on port ' + port);
  })