module.exports = {
    devServer: {
      https: true,
      key: fs.readFileSync('./certs/key.pem'),
      cert: fs.readFileSync('./certs/cert.pem'),
      disableHostCheck: true,
      proxy: {
        '/.well-known': {
          target: 'https://35.230.138.23:5000',
          ws: true,
          changeOrigin: true
        }
      }
    }
  }