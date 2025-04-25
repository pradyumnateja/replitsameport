module.exports = {
  devServer: {
    allowedHosts: ['localhost'],
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
};
