exports.run = function (io) {

// Read the list of GIF urls
var gif_list = require('fs').readdirSync('static/img/gifs/');

// Collection of data about each active room
var games = {};

io.sockets.on('connection', function (socket) {

  socket.room = -1;
  socket.name = "";
  socket.gifs = [];
  socket.choice = -1;
  var game;

  function round_init() {
    game.choices = {};

    scenario = "This is a random scenario";
    io.sockets.in(socket.room).emit('scenario', scenario);
  }
  
  // A player wants to join a game
  socket.on('join_game', function (room, name) {
    socket.room = room;
    socket.name = name;

    socket.join(socket.room);

    if (!(socket.room in games)) {
      game = {};
      game.leader = socket;
      game.active_gifs = [];
      game.state = 'waiting';

      games[socket.room] = game;

      socket.emit('leader_notif', false);
    }
    else {
      game = games[socket.room];
    }
  });

  // The game leader has decided to start the game
  socket.on('start_game', function (scenario) {
    if (game.leader != socket) {
      // Either cheating or a glitch!
      return;
    }
    
    players = io.sockets.clients(socket.room);
    for (i in players) {
      // Deal a hand of Gifs to each player
      while (players[i].gifs.length != 5) {
        var g = gif_list[Math.round(Math.random()*gif_list.length)];
        if (g in game.active_gifs) {
          continue;
        }
        else {
          players[i].gifs.push(g);
          game.active_gifs.push(g);
        }
      }

      players[i].emit('gif_hand', players[i].gifs);
    }

    round_init();

  });

  // Choose which card to play
  socket.on('choose_card', function (choice) {
    socket.choice = choice;
    if (socket.gifs.indexOf(choice) == -1) {
      // Error or cheating
      return;
    }

    game.choices[socket] = choice;

    var choice_count = 0;
    for (var c in game.choices) { choice_count++; }
    if (choice_count == io.sockets.clients(socket.room).length-1) {
      var chosen = [];
      for (var g in game.choices)
        chosen.push(game.choices[g]);
      io.sockets.in(socket.room).emit('review', chosen);
    }
  });

  // The game leader has chosen a winner
  socket.on('choose_winner', function (winning_gif) {
    if(game.leader != socket) {
      // Error or cheating
      return;
    }    

    var players = io.sockets.clients(socket.room);
    for(var i in players) {
      if(players[i] == socket) continue;

      if(players[i].gifs.indexOf(winning_gif) != -1) {
        io.sockets.in(socket.room).emit('winner_notif', players[i].name);
      }

      // Give gif to all players who used one
      var new_gif = gif_list[Math.floor(Math.random()*gif_list.length)];
      while (game.active_gifs.indexOf(new_gif) != -1) { new_gif = gif_list[Math.floor(Math.random()*gif_list.length)]; };

      game.active_gifs.splice(game.active_gifs.indexOf(players[i].choice), 1);
      players[i].gifs.splice(players[i].choice, 1);
      players[i].gifs.push(new_gif);
      game.active_gifs.push(new_gif);
      players[i].emit('new_gif', new_gif);
    }

    // Assign new leader
    var players = io.sockets.clients(socket.room);
    game.leader = players[(players.indexOf(socket)+1)%players.length];
    game.leader.emit('leader_notif', true);

    // Initialize new round
    round_init();
  });

  socket.on('disconnect', function () {
    if (socket.room != -1) {
      socket.leave(socket.room);

      // With no more players, the game is over
      if (io.sockets.clients(socket.room).length == 0) {
        delete games[socket.room];
      }

      else if (game.leader == socket) {
        // TODO: Handle leader leaving
      }
    }
  });

  // Broadcast the chat messages to others in the room
  socket.on('message', function (message) {
    console.log(message);
    io.sockets.in(socket.room).emit('message', socket.name, message);
  });

});
}