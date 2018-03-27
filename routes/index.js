var Repeat = require('repeat');
var axios = require('axios');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = io => {

  var connected = 0;
  var totalWins = 0;  // lifetime wins
  var wins = 0;       // wins this session
  var games = 0;      // lifetime games
  var streak = 0;     // current win streak

  getStats().then(response => {
    games = response.data.lifeTimeStats[7].value;
    totalWins = response.data.lifeTimeStats[8].value;
  });

  io.on('connection', function(socket) {
    connected += 1;
    console.log('User connected');
    socket.on('disconnect', () => {
      console.log('User disconnected!');
      connected -= 1;
    });
  });

  Repeat(() => {
      if (connected == 0) return;
      console.log('updating wins');
      getStats().then(response => {
        var newGames = response.data.lifeTimeStats[7].value;
        var newWins = response.data.lifeTimeStats[8].value;
        
        // played a match and lost
        if (newGames > games && newWins == totalWins) {
          streak = 0;
        } 
        // played a match and won
        else if (newGames > games && newWins > wins) {
          wins += 1;
          streak += 1;
        }

        games = newGames;
        totalWins = newWins;

        io.emit('wins', { wins: wins, streak: streak });
      });
    })
    .every(5, 's')
    .start.now();

  return router;
}

function getStats(cb) {
  var url = "https://api.fortnitetracker.com/v1/profile/pc/foreignn";
  return axios({
    method: 'get',
    url: url,
    headers: {'TRN-Api-Key': '4be7a9d3-a73c-484e-ace1-23b3018a714b'},
  });
}