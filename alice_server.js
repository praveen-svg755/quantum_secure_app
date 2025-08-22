const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
app.use(express.json());
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/alice', (req, res) => res.sendFile(path.join(__dirname, 'public', 'alice.html')));
app.get('/bob', (req, res) => res.sendFile(path.join(__dirname, 'public', 'bob.html')));

let sharedKey = null;

io.of('/alice').on('connection', socket => {
  console.log('Alice connected');
  if (sharedKey) socket.emit('bb84KeySync', sharedKey);

  socket.on('bb84Key', keyHex => {
    sharedKey = keyHex;
    io.of('/alice').emit('system', '🔑 BB84 key generated!');
    io.of('/bob').emit('bb84KeySync', sharedKey);
    io.of('/alice').emit('system', '🔗 Key shared with Bob!');
    io.of('/bob').emit('system', '🔗 Key received from Alice!');
  });

  socket.on('sendEncryptedToBob', payload => {
    io.of('/bob').emit('receiveEncrypted', payload);
    io.of('/alice').emit('system', '🛰️ Sent encrypted message to Bob.');
    io.of('/bob').emit('system', '🛰️ Received encrypted message from Alice.');
  });

  // Receive decrypted message back from Bob
  socket.on('fromBobDecrypted', plain => {
    io.of('/alice').emit('bobDecrypted', { message: plain });
  });
});

io.of('/bob').on('connection', socket => {
  console.log('Bob connected');
  if (sharedKey) socket.emit('bb84KeySync', sharedKey);

  socket.on('sendDecryptedToAlice', plain => {
    io.of('/alice').emit('bobDecrypted', { message: plain });
    io.of('/alice').emit('system', '📩 Got decrypted message from Bob.');
    io.of('/bob').emit('system', '📝 Sent decrypted message to Alice.');
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Unified server running at http://localhost:${PORT}/alice and /bob`));
