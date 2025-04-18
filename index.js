
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let rooms = {};

io.on('connection', socket => {
  socket.on('createRoom', () => {
    const roomCode = Math.random().toString(36).substr(2, 6);
    rooms[roomCode] = [socket.id];
    socket.join(roomCode);
    socket.emit('roomCreated', roomCode);
  });

  socket.on('joinRoom', (roomCode) => {
    const room = rooms[roomCode];
    if (room && room.length === 1) {
      rooms[roomCode].push(socket.id);
      socket.join(roomCode);
      io.to(roomCode).emit('startChat');
    } else {
      socket.emit('errorMsg', 'Invalid or full room');
    }
  });

  socket.on('sendMsg', ({ roomCode, msg }) => {
    socket.to(roomCode).emit('receiveMsg', { msg });
  });

  socket.on('vanish', (roomCode) => {
    io.to(roomCode).emit('chatEnded');
    delete rooms[roomCode];
  });

  socket.on('disconnecting', () => {
    for (let roomCode in rooms) {
      if (rooms[roomCode].includes(socket.id)) {
        io.to(roomCode).emit('chatEnded');
        delete rooms[roomCode];
      }
    }
  });
});

http.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
