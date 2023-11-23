const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;
const DATA_FILE_PATH = path.join(__dirname, 'eyePositions.json');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('Cliente conectado');

  setInterval(() => {
    const eyePositions = { left: Math.random(), right: Math.random() };
    socket.emit('eyePositions', eyePositions);

    // Grava os valores em um arquivo JSON
    appendToJsonFile(DATA_FILE_PATH, eyePositions);
  }, 2000);
});

function appendToJsonFile(filePath, data) {
  fs.readFile(filePath, 'utf8', (err, fileData) => {
    if (err) {
      console.error('Erro ao ler o arquivo JSON:', err);
      return;
    }

    let jsonData = [];
    try {
      jsonData = JSON.parse(fileData);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
    }

    jsonData.push({ timestamp: new Date().toISOString(), ...data });

    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Erro ao escrever no arquivo JSON:', writeErr);
      } else {
        console.log('Valores gravados com sucesso no arquivo JSON.');
      }
    });
  });
}

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
