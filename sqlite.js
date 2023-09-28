const sqlite3 = require('sqlite3');
const path = require('path');

const diskLocal = path.parse(__dirname).root
const logFolderPath = path.join(diskLocal, 'streamdata');


const db = new sqlite3.Database(`${logFolderPath}\\task_manager.db`, (err) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
      console.log('Conectado ao banco de dados SQLite');
    }
});


module.exports = db