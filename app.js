// todo
// add server side stats for us
// make sure rielle makes shit happen for the shit under this
// make an invite to team thing and a you have no team dumbass thing

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cookie = require('cookie');
var encode = require('client-sessions').util.encode,
    decode = require('client-sessions').util.decode;
var fs = require('fs');


//ayo remember to turn on the redis-server when you run this
var redis = require('redis');
var rClient = redis.createClient();
const Overload = require('jshelpers').Overload;
const User = require('./redis/user.js')(rClient);
const Team = require('./redis/team.js')(rClient);
const Chat = require('./redis/message.js')(rClient,io);
const Question = require('./redis/question.js')(rClient);
const Banner = require('./redis/banner.js')(rClient);

var Alert = require('./redis/notification.js')(rClient,io);
var session_opts = {
  cookieName: 'session',
  secret: 'iWonderIfAnyoneWouldGuessThis...',
  duration: 14 * 24 * 60 * 60 * 1000, //2 weeks ... i think
  activeDuration: 3 * 24 * 60 * 60 * 1000, //3 days ... i think
  httpOnly: true,
  secure: true
};
var session = require('client-sessions');
app.use(session(session_opts));

function makeCompID(){
  var d = new Date();
  return d.getTime() + (Math.random() * 9900000) + (Math.random() * 99000300);
}

function dashboard_check(req, res, next){
  if(req.session.signup_id) {
    rClient.get("signup_key:" + req.session.signup_id, function(err, user_id){
      if(!err && user_id){
        //console.log(user_id);
        req.session.user_id = user_id;
        var comp_id = req.session.signup_id;
        console.log("debug: " + comp_id);
        rClient.del("signup_key:" + req.session.signup_id);
        delete req.session.signup_id;
        req.session.comp_id = comp_id;
        next();
      }
      else{
        console.log("debug1");
        res.redirect('login');
      }
    });

  }
  else if(req.session.login_id) {
    rClient.get("login_key:" + req.session.login_id, function(err, user_id){
      if(!err && user_id){
        //console.log(user_id);
        req.session.user_id = user_id;
        var comp_id = req.session.login_id;
        console.log("debug: " + comp_id);
        rClient.del("login_key:" + req.session.login_id);
        delete req.session.login_id
        req.session.comp_id = comp_id;
        next();
      }
      else{
        console.log("debug2");
        res.redirect('login');
      }
    });
  }else if(req.session.comp_id && req.session.user_id) {
    next();
  }else if(req.session.user_id){
    req.session.comp_id = makeCompID();
    next();
  }else{
    console.log("debug3");
    res.redirect('login');
  }
}

app.get('/', function(req, res){
  res.render(__dirname + "/views/index.jade");
});

app.get('images/emblem.png', function(req, res){
  res.sendFile(__dirname + "/views/images/emblem.png")
});

app.get('/images/tcsclogo.png', function(req, res){
  res.sendFile(__dirname + "/views/images/tcsclogo.png")
});

app.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});

app.get('/login', function(req, res){
  req.session.login_id = makeCompID(); //change name to log in key
  app.locals.config = {login_id: req.session.login_id};
  req.session.user_id = 0;
  res.render(__dirname + "/views/login.jade/");
});

app.get('/signup', function(req, res){ 
  req.session.signup_id = makeCompID(); //change name to sign up key ... have comp_id be seperate thing from signups... (more secure)
  console.log(req.session.signup_id); 
  app.locals.config = {signup_id: req.session.signup_id};
  req.session.user_id = 0;
  res.render(__dirname + "/views/signup.jade/");
});

app.get('/dashboard', dashboard_check, function(req, res){
  console.log(req.session);
  User.getUser(req.session.user_id, function(user){
    if(!user.team){
      app.locals.config = {comp_id: req.session.comp_id, user:user};
      console.log(user);
      res.render(__dirname + "/views/dashboard_no_team.jade")
    }
    else{
      app.locals.config = {comp_id: req.session.comp_id, user:user};
      console.log(user);
      res.render(__dirname + "/views/dashboard.jade");
    }
  });
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
  //console.log("omg i did something... for once in my goddamn life...");

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

  socket.on('signup', function(name, username, age, email, password){
    console.log("signup_server_socket")
    //Team.searchTeam("a", function(){});
    User.createUser(name, username, age, email, password, function(v){

      //check to see how the shit here works with multiple connections... its fishy ===============
      var session_data = decode(session_opts, cookie.parse(socket.handshake.headers.cookie).session).content;
      session_id = session_data["signup_id"];
      console.log(session_id);
      console.log();
      console.log(v);
      console.log();
      //===================
      if(!v){
        console.log("woah");
        //we got some fucked up error shit, check it out biatch 
        //(put some debug prints in here so we can attempts to fix it if it ever actually comes up)

      //make sure rielle makes shit happen for the shit under this
      }else if(v === "email"){
        io.emit(session_id, 'sign_up_error[email]'); //means email is taken 

      }else if(v === "username"){
        io.emit(session_id, 'sign_up_error[username]'); //means username is taken ... get the pattern with this ish yet?

      }else{
        //console.log("hey");
        rClient.setnx("signup_key:" + session_id, v, function(err, set){
          if (err) {return;}
          if (set==0) {return;} //means session_id was already taken is already taken ... some fucked up shit
          io.emit(session_id, 'success_sign_up');
        });
      }
    });
  });

  socket.on('login', function(log, pass){
    var session_data = decode(session_opts, cookie.parse(socket.handshake.headers.cookie).session).content;
    session_id = session_data["login_id"];
    User.validateUser(log, pass, function(v, user_id, pass){
      if(v === 'true'){
        rClient.setnx("login_key:" + session_id, v, function(err, set){
          if (err) {return;}
          if (set==0) {return;} //means session_id was already taken is already taken ... some fucked up shit
          io.emit(session_id, 'success_login');
        });
      }else if(v == 'invalid_pass'){
        io.emit(session_id, 'invalid_pass');
      }else if(v == 'invalid_log'){
        io.emit(session_id, 'invalid_log');
      }else{
        //console.log("jjj");
        io.emit(session_id, 'error');
      }
    });
  });

  socket.on('register_team', function(team_name, school, pass){
    //have a check to make sure team name is not innapropro
    var session_data = decode(session_opts, cookie.parse(socket.handshake.headers.cookie).session).content;
    console.log(session_data);
    user = session_data["user"];
    console.log(user);
    u = session_data["comp_id"];
    console.log(u);
    Team.createTeam(team_name, school, user.id, pass, function(data){
      if(!data){
        //error
      }else if(data === "name"){
        io.emit(session_data["comp_id"], "register_name");
      }
      else{
        io.emit(session_data["comp_id"], "success_register");
      }
    });
  });

  socket.on('join_team', function(team_name, pass){
    var session_data = decode(session_opts, cookie.parse(socket.handshake.headers.cookie).session).content;
    console.log(session_data);
    user = session_data["user"];
    console.log(user);
    u = session_data["comp_id"];
    console.log(u);
    Team.validateTeam(team_name, pass, function(data){
      if(!data){
        //error
      }else if(data === "invalid_pass"){
        io.emit(session_data["comp_id"], "join_pass");
      }
      else{
        var team_id = rClient.get("team_name:" + team_name + ":id")
        User.addToTeam(user.id, team_id, function(val){
          if(!val){
            //err
          }else if("over_team"){
            //already part of team
          }else{
            Team.addMember(team_id, user.id, function(ill){
              if(!ill){
                //still err
              }else if(ill === "member_overload"){
                //to many peeeeeps
                User.leaveFromTeam(user.id, team_id);
              }else{
                io.emit(session_data["comp_id"], "success_join");
              }
            });
          }
        });
      }
    });
  });
  
  socket.on('search_team', function(team_id){
    
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

setInterval(function() {
  Question.statsTick();
}, 1000);