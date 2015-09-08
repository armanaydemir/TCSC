var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');


//ayo remember to turn on the redis-server when you run this
var redis = require('redis');
var rClient = redis.createClient();
const User = require('./redis/user.js')(rClient);
const Team = require('./redis/team.js')(rClient);
const Chat = require('./redis/message.js')(rClient,io);
const Question = require('./redis/question.js')(rClient);
const Banner = require('./redis/banner.js')(rClient);

var Alert = require('./redis/notification.js')(rClient,io);

var session = require('client-sessions');
app.use(session({
  cookieName: 'session',
  secret: 'iWonderIfAnyoneWouldGuessThis...',
  duration: 14 * 24 * 60 * 60 * 1000, //2 weeks ... i think
  activeDuration: 3 * 24 * 60 * 60 * 1000, //3 days ... i think
  httpOnly: true,
  secure: true
}));

function requireLogin (req, res, next) {
  if (!req.user_id) {
    res.redirect('/login');
  } else {
    next();
  }
}

app.get('/', function(req, res){
  res.render(__dirname + "/views/index.jade");
});


app.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});

app.get('/login', function(req, res){

});

app.post('/login', function(req, res){

});

app.get('/signup', function(req, res){
  res.render(__dirname + "/views/signup.jade/");
});

app.post('/signup', function(req, res){
  console.log('asdfadsf');
});

app.get('/dashboard', function(req, res) {
  res.render(__dirname + "/views/dashboard.jade");
});

app.use('/_/js/bootstrap.js', function(req, res){
  res.sendFile(__dirname + '/views/_/js/bootstrap.js');
});

app.get('/_/js/jquery.js', function(req, res){
  res.sendFile(__dirname + '/views/_/js/jquery.js');
});

app.get('/_/js/myscript.js', function(req, res){
  res.sendFile(__dirname + '/views/_/js/myscript.js');
});


io.on('connection', function(socket){
  console.log(socket.handshake.headers.cookie);
  console.log("omg we did something");

  socket.on('send_message', function(msg){
    rClient.get("user:" + req.session.user_id + ":team_id", function(error, team_id){
      if(!error){
        Chat.createMessage(msg, req.session.user_id);
        io.emit('new_message:' + team_id, (msg, req.session.user_id));
      }
    });
  });

  socket.on('answer_question', function(answer, question, type){
    omg_you_got_the_banner_question = false;
    if(question == id_of_banner_question && answer[0] == "-" && answer[answer.length-1] == "-"){
      omg_you_got_the_banner_question = true;
    }
    rClient.get("user:" + req.session.user_id + ":team_id", function(error, team_id){
      Question.answerQuestion(req.session.user_id, team_id, question, answer, function(correct){
        Team.attemptedQuestion(team_id, req.session.user_id, question, correct);
        if (correct){
          Alert.answerQuestion(req.session.user_id, question);
        }else if(omg_you_got_the_banner_question){
          Alert.answerQuestion(req.session.user_id, id_of_banner_question); //update this variable later
          Banner.updateBanner(redis.get("team:" + team_id + ":name"), 2);
        }else{
          io.emit("incorrect" + req.session.user_id, (question));
        }
      });
    });
  });

  socket.on('signup', function(name, username, age, email, password, callback){
    console.log(name);

  });

  socket.on('login', function(log, pass){
    User.validateUser(log, pass, function(v, user_id, pass){
      if(v == 'true'){
        req.session.user_id = user_id;
        res.redirect('/dashboard');
      }else if(v == 'invalid_pass'){
        io.emit(req.session.comp_id, 'invalid_pass');
      }else if(v == 'invalid_log'){
        io.emit(req.session.comp_id, 'invalid_log');
      }else{
        io.emit(req.session.comp_id, 'error');
      }
    });
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

setInterval(function() {
  Question.statsTick();
}, 1000);