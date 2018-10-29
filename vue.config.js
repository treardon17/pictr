const path = require('path')

const BUILD_DIR = path.resolve(__dirname, 'build')
const APP_DIR = path.resolve(__dirname, 'src')

module.exports = {
  outputDir: BUILD_DIR,
  baseUrl: process.env.NODE_ENV === 'production' ? `${__dirname}/build/` : '/'
}