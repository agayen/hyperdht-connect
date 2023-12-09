const { app, BrowserWindow , systemPreferences} = require('electron')
// include the Node.js 'path' module at the top of your file
const path = require('node:path')

// modify your existing createWindow() function
const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800, 
    minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      webSecurity: true
    }
  })

  // win.webContents.openDevTools()
  win.loadFile('index.html')
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
    createWindow()
    // createWindow()
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})


systemPreferences.askForMediaAccess('camera').then((allowed)=>{
  if(allowed){
    console.log('Camera is allowed')
  }else{
    console.log('camera is not allowed')
  }
})

systemPreferences.askForMediaAccess('microphone').then((allowed)=>{
  if(allowed){
    console.log('microphone is allowed')
  }else{
    console.log('microphone is not allowed')
  }
})