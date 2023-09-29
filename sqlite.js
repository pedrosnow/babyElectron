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


db.run('CREATE TABLE IF NOT EXISTS tb_log(id INTEGER PRIMARY KEY, pacienteid TEXT NULL, chave TEXT NULL, console TEXT NULL)')
db.run('CREATE TABLE IF NOT EXISTS tb_conexao(id INTEGER PRIMARY KEY,servidor_rmtp VARCHAR(50) NOT NULL,servidor_principal VARCHAR(50) NOT NULL, token TEXT NULL,servidor_stream VARCHAR(50) NULL)')
db.run('CREATE TABLE IF NOT EXISTS tb_dispositivo(id INTEGER PRIMARY KEY,video VARCHAR(100) NOT NULL, audio VARCHAR(100) NOT NULL)')
db.run(`CREATE TABLE IF NOT EXISTS tb_ffmpeg(id INTEGER PRIMARY KEY,resolucao_largura INTEGER NOT NULL,resolucao_altura INTEGER NOT NULL,taxa_mostragem_audio VARCHAR(50) NOT NULL,taxa_bits_audio VARCHAR(50) NOT NULL,codec_audio VARCHAR(50) NULL,fps VARCHAR(50) NULL)`)
db.run(`CREATE TABLE IF NOT EXISTS tb_registro(id INTEGER PRIMARY KEY,pacienteid INTEGER NOT NULL,chave TEXT NOT NULL,arquivo TEXT NOT NULL,create_at DATETIME NULL,)`)

module.exports = db