const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

let url
if (process.env.NODE_ENV === 'DEV') {
  url = 'http://localhost:8080/'
} else {
  url = `file://${__dirname}/build/index.html`
}

app.on('ready', () => {
  let window = new BrowserWindow({ width: 800, height: 600 })
  window.loadURL(url)
  console.log(url)
  window.openDevTools()
})