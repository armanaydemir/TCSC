var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var redis = require('redis');
var rClient = redis.createClient();
const User = require('./redis/user.js')(rClient);
const Team = require('./redis/team.js')(rClient);
const Chat = require('./redis/message.js')(rClient);

var session = require('client-sessions');
app.use(session({
  cookieName: 'session',
  secret: 'iWonderIfAnyoneWouldGuessThis...',
  duration: 14 * 24 * 60 * 60 * 1000, //2 weeks ... i think
  activeDuration: 3 * 24 * 60 * 60 * 1000, //3 days ... i think
  httpOnly: true,
  secure: true,
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

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

app.get('/dashboard', requireLogin, function(req, res) {

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});