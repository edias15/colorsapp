const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const mysql = require('mysql2')
require('dotenv').config()

let conn, win, progressInterval

function connect () {
	try {
		conn = (mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: process.env.DB_PORT,
    }));
	} catch (error) {
		console.log(error);
	}
}connect()

function createWindow () {
  win = new BrowserWindow({
    width: 990,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  // win.webContents.openDevTools();
  win.loadFile('index.html')
}

ipcMain.on('add-color', (event, color) => {
  nameColorTrimmed = color.name.trim()
  const sql = `SELECT hex FROM color WHERE name = '${nameColorTrimmed}'`
  conn.query(sql, (err, result) => {
    if (err) {
      console.log(err)
    } else {
      if (result.length === 0) {
        const sql = `INSERT INTO color (name, hex) VALUES (${nameColorTrimmed}, ${color.hex})`
        conn.query(sql, (err, result) => {
          if (err) {
            console.log(err)
          } else {
            event.sender.send('color-name-reply', 'Color added')
          }
        })
      } else {
        event.sender.send('color-name-reply', 'Name already exists in DB. ' + result[0].hex + ' - ' + nameColorTrimmed)
      }
    }
  })
})

ipcMain.on('color-name', (event, data) => {
  event.sender.send('show-bar', 1)
  
  const sql = `SELECT name FROM color WHERE hex = '${data}'`
  conn.query(sql, (err, result ) => {
    if (err) {
      console.log(err)
    }
    const Increment = 0.3
    const INTERVAL_DELAY = 90
    let c = 0
    progressInterval = setInterval(() => {
      // update progress bar to next value
      // values between 0 and 1 will show progress, >1 will show indeterminate or stick at 100%
      
      win.setProgressBar(c)  
      // increment or reset progress bar
      if (c < 2) {
        c += Increment
      } else {
        c = (Increment * (-5)) // reset to a bit less than 0 to show reset state
      }
    }, INTERVAL_DELAY)
    setTimeout(() => {
      if (result === undefined || result.length === 0) {
        event.sender.send('color-name-reply', 'No name found')
      } else {
        event.sender.send('color-name-reply', result[0].name)
      }
      clearInterval(progressInterval),
      win.setProgressBar(-1)
    }, 2000)
    event.sender.send('move-bar', 0)
    setTimeout(() => {
      event.sender.send('show-bar', 0)
    },2000)
  })
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  clearInterval(progressInterval)
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()

})
app.on('window-all-closed', e => e.preventDefault())

app.on('close', () => {
  app = null;
});
