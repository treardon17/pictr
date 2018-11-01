const electron = require('electron') // eslint-disable-line

const { app } = electron
const { BrowserWindow } = electron

const isProd = process.env.NODE_ENV !== 'DEV'

const url = isProd ? `file://${__dirname}/build/index.html` : 'http://localhost:8080/'

app.on('ready', () => {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegrationInWorker: true
    }
  })
  window.loadURL(url)
  !isProd && window.openDevTools()
})
