module.exports = {
    devServer: {
      https: true,
      disableHostCheck: true,
      proxy: 'https://35.230.138.23:5000'
    }
  }