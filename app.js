var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


//ayo remember to turn on the redis server when you run this
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
  if (!req.user_id) {
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

  socket.on('send_message', function(msg){
    rClient.get("user:" + req.session.user_id + ":", function(error, team_id){
      Chat.createMessage(msg, req.session.user_id);
      io.emit('new_message:' + team_id, (msg, req.session.user_id));
    });
  });

});

app.get('/dashboard', requireLogin, function(req, res) {

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});