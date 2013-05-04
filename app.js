var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

// Force long polling for Cedar stack
io.configure(function () {
  io.set('transports', ['xhr-polling']);
  io.set('polling duration', 10);
});

// Start server
var port = process.env.PORT || 8080;
server.listen(port);
console.log("Server started on port " + port);

// Load pages from 'static' directory
app.use(express.static('static'));

// Set up the game using the socket io interface
require('./game').run(io);
