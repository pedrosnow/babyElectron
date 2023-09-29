const express = require('express');
const expressApp = express();
const db = require('./sqlite')
const request = require('request');
const { execFile } = require('child_process');
const path = require('path')

expressApp.use(express.json());

let pythonProcess;

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
  
  
  expressApp.post('/download-video', (req, res) => {
  
    const { chave } = req.body;
    const diskLocal = path.parse(__dirname).root
    const videoPath = path.join(diskLocal, 'streamdata', 'data', `${chave}.mp4`);
    
    res.download(videoPath, `${chave}.mp4`)
  
  });

  expressApp.post('/upload-video', (req, res) => {

    const { pacienteid, chave } = req.body

    db.all('SELECT servidor_principal, token, servidor_stream FROM tb_conexao', (err, rows) =>{

      db.all(`INSERT INTO tb_log (pacienteid,chave,console)VALUES('${pacienteid}', '${chave}', 'Enviando o arquivo')`)

      let options = {
          'method': 'POST',
          'url': `${rows[0].servidor_principal}/getvideo/babe/stream`,
          'headers': {
            'Content-Type': 'application/json',
            'authorization': `${rows[0].token}`
          },
          body: JSON.stringify({
            "serverStream": `${rows[0].servidor_stream}`,
            "chave": chave,
            "pacienteid": pacienteid,
            "updatedAt": new Date(), 
            "createdAt": new Date(),
          })
      };
      request(options, function (error, response) {
        if (error){
          db.all(`INSERT INTO tb_log (pacienteid,chave,console)VALUES('${pacienteid}', '${chave}', '${error}')`)
        }else{
          db.all(`INSERT INTO tb_log (pacienteid,chave,console)VALUES('${pacienteid}', '${chave}', 'Envio com sucesso')`)
        }
        
        res.status(200)
      });
  
    })
  
  })

  
  module.exports = expressApp