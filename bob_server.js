const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(express.json());
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'bob.html')));

let sharedKey = null;

io.on('connection', socket => {
  console.log('Bob connected');
  socket.emit('system', '👋 Welcome to Bob\'s terminal');
  if (sharedKey) socket.emit('setBB84Key', sharedKey);

  socket.on('sendDecryptedToAlice', data => {
    axios.post('http://localhost:3001/api/from-bob-plain', data)
      .catch(e => io.emit('system', '❌ Could not send to Alice: ' + e.message));
  });
});

app.post('/api/set-key', (req, res) => {
  sharedKey = req.body.keyHex;
  io.emit('setBB84Key', sharedKey);
  res.json({ ok: true });
});

app.post('/api/receive-encrypted', (req, res) => {
  io.emit('receiveEncrypted', req.body);
  res.json({ ok: true });
});

const PORT = 3002;
server.listen(PORT, () => console.log("Bob server at http://localhost:" + PORT));
