const {app, BrowserWindow} = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')

let win
app.on('ready', () => {
    win = new BrowserWindow({
        width: 600,
        height: 300,
        webPreferences: {
            nodeIntegration: true
        }
    })
    if (isDev) {
        // 开发环境
        win.loadURL('http://localhost:3000')
    } else {
        // 生产环境
        win.loadFile(path.resolve(__dirname, '../render/pages/main/index.html'))
    }
})