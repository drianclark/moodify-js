module.exports = {
    devServer: {
      https: true,
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