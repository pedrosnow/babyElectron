
const { app, BrowserWindow } = require('electron')
const path = require('path')
const express = require('express');
const expressApp = express();
const { execFile } = require('child_process');
const db = require('./sqlite')
const expressPort = 3001;
const timeout = require('connect-timeout');
let pythonProcess;



expressApp.use(express.json());

expressApp.post('/start-server', (req, res) => {
  
  const backend = path.join(__dirname, '..', 'BabyPy', 'dist', 'run', 'run.exe')

  pythonProcess = execFile( backend, { windowsHide: true  }, (err, stdout, stderr) => {
    if (err) {
      console.log(`ERRO ${err}`);
    }
    if (stdout) {
      console.log(`SAIDA ${stdout}`);
    }
    if (stderr) {
      console.log(`SAIDA ${stderr}`);
    }

  });
  
  res.status(200).json('ola')

});

expressApp.use(timeout('5m'));

expressApp.post('/download-video', (req, res) => {

  const { chave } = req.body;
  const diskLocal = path.parse(__dirname).root
  const videoPath = path.join(diskLocal, 'streamdata', 'data', `${chave}.mp4`);
  
  res.download(videoPath, `${chave}.mp4`)

});

expressApp.listen(expressPort, () => {
  console.log(`Servidor Express rodando em http://localhost:${expressPort}`);
});


expressApp.post('/upload-video', (req, res) => {

})


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Algumas APIs podem ser usadas somente depois que este evento ocorre.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. Você também pode colocar eles em arquivos separados e requeridos-as aqui.




