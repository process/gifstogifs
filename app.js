var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

// Start server
var port = process.env.PORT || 8080;
server.listen(port);

// Load pages from 'static' directory
app.use(express.static('static'));

io.sockets.on('connection', function (socket) {

  // Broadcast the current state of the game to players in the room
  function game_info () {
  }
  
  // A player wants to join a game
  socket.on('join_game', function (data) {
  });

  // Broadcast the chat messages to others in the room
  socket.on('chat_message', function (data) {
  });

  // Choose which card to play
  socket.on('choose_card', function (data) {
  });

  // Get gifs to update hand
  socket.on('get_gifs', function (data) {
  });

  // The game leader has decided to start the game
  socket.on('start_game', function (data) {
  });

  // The game leader has chosen a winner
  socket.on('choose_winner', function (data) {
  });

});



