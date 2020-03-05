const app = require('./index.js');
const port = process.env.DEBUG == 0 ? 80 : 5000;

app.main.listen(port);