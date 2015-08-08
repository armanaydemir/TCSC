var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//todo
//make sessions safer by implementing password


//ayo remember to turn on the redis server when you run this
var redis = require('redis');
var rClient = redis.createClient();
const User = require('./redis/user.js')(rClient);
const Team = require('./redis/team.js')(rClient);
const Chat = require('./redis/message.js')(rClient,io);
const Question = require('./redis/question.js')(rClient);

var Alert = require('./redis/notification.js')(rClient,io);

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

app.post('/new_user', function(req, res){

});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html')
});

app.post('/login', function(req, res){


});

io.on('connection', function(socket){
  var d = new Date();
  var m = new Math();
  var time = d.getTime() + (m.random() * 100);
  req.session.comp_id = time;
  Alert.onlineAlert(req.session.user_id, socket)

  socket.on('send_message', function(msg){
    rClient.get("user:" + req.session.user_id + ":team_id", function(error, team_id){
      if(!error){
        Chat.createMessage(msg, req.session.user_id);
        io.emit('new_message:' + team_id, (msg, req.session.user_id));
      }
    });
  });

  socket.on('answer_question', function(answer, question){
    rClient.get("user:" + req.session.user_id + ":team_id", function(error, team_id){
      Question.answerQuestion(req.session.user_id, team_id, question, answer, function(correct){
        Team.attemptedQuestion(team_id, req.session.user_id, question, correct);
        if (correct){
          Alert.answerQuestion(req.session.user_id, question);
        }else{
          
        }
      });
    });
  });

  socket.on('login', function(log, pass){
    User.validateUser(log, pass, function(v, user_id, pass){
      if(v == 'true'){
        req.session.user_id = user_id;
        req.session.password = pass;
        res.redirect('./dashboard');
      }else if(v == 'invalid_pass'){
        io.emit(req.session.comp_id, 'invalid_pass');
      }else if(v == 'invalid_log'){
        io.emit(req.session.comp_id, 'invalid_log');
      }else{
        io.emit(req.session.comp_id, 'error');
      }
    });
  });

  socket.on('notification' + user_id, function(type, data){

  });
});

app.get('/dashboard', requireLogin, function(req, res) {

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});