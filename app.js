var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');
var rClient = redis.createClient();
const User = require('./user.js')(rClient);
const Team = require('./team.js')(rClient);
var session = require('client-sessions');
app.use(session({
  cookieName: 'session',
  secret: 'iWonderIfAnyoneWouldGuessThis',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

function requireLogin (req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
};

app.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html')
});

module.exports(app);