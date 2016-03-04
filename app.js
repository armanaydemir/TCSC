// todo
// add server side stats for us
// make sure rielle makes shit happen for the shit under this
// make an invite to team thing and a you have no team dumbass thing
// make sure we scrub and clean any input, especially chat lol, cant even do a fucking apostraphe
// maybe change dash connect to be like stat connect with callback instead of socket for data.


var express = require('express');
var app = express();
var multer = require('multer');
var path = require("path");
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cookie = require('cookie');
var encode = require('client-sessions').util.encode,
    decode = require('client-sessions').util.decode;
var fs = require('fs');
var util = require('util');
var exec = require('child_process').exec;
var async = require('async');
var Files = {};



var bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

//ayo remember to turn on the redis-server when you run this
var redis = require('redis').createClient();
const Overload = require('jshelpers').Overload;
const User = require('./redis/user.js')(redis);
const Team = require('./redis/team.js')(redis);
const Chat = require('./redis/message.js')(redis,io);
const Question = require('./redis/question.js')(redis);
const Banner = require('./redis/banner.js')(redis);


//this is for debug only ___________________
const Test = require('./test.js')(redis);
Test.setUp();
app.get('/fresh_team', function(req, res){res.render(__dirname + "/views/dashboard_new_team.jade");});
//__________________________


var Alert = require('./redis/notification.js')(redis,io);
var session_opts = {
  cookieName: 'session',
  secret: 'iWonderIfAnyoneWouldn\'GuessThis...',
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
    redis.get("signup_key:" + req.session.signup_id, function(err, user_id){
      if(!err && user_id){
        req.session.user_id = user_id;
        User.getUser(user_id, function(user){
          console.log("sign: " + user);
          if(user){req.session.user = user;}
          var comp_id = req.session.signup_id;
          redis.del("signup_key:" + req.session.signup_id);
          delete req.session.signup_id;
          req.session.comp_id = comp_id;
          next();
        });
      }else if(req.session.comp_id && req.session.user.id) {
        User.getUser(req.session.user.id, function(user){
          if(user){req.session.user = user;}
          next();
        });
      }else if(req.session.user && req.session.user.id){
        req.session.comp_id = makeCompID();
        User.getUser(req.session.user.id, function(user){
          if(user){req.session.user = user;}
          next();
        });
      }else{res.redirect('login');}
    });
  }

  else if(req.session.login_id) {
    redis.get("login_key:" + req.session.login_id, function(err, user_id){
      if(!err && user_id){
        req.session.user_id = user_id;
        User.getUser(user_id, function(user){
          console.log("used: " + user);
          if(user){req.session.user = user;}
          var comp_id = req.session.login_id;
          redis.del("login_key:" + req.session.login_id);
          delete req.session.login_id
          req.session.comp_id = comp_id;
          next();
        });}
      else if(req.session.comp_id && req.session.user.id) {
        User.getUser(req.session.user.id, function(user){
          if(user){req.session.user = user;}
          next();
        });
      }else if(req.session.user && req.session.user.id){
        req.session.comp_id = makeCompID();
        User.getUser(req.session.user.id, function(user){
          if(user){req.session.user = user;}
          next();
        });
      }else{res.redirect('login');}
    });
  }else if(req.session.comp_id && req.session.user.id) {
    User.getUser(req.session.user.id, function(user){
      if(user){req.session.user = user;}
      next();
    });
  }else if(req.session.user && req.session.user.id){
    req.session.comp_id = makeCompID();
    User.getUser(req.session.user.id, function(user){
      if(user){req.session.user = user;}
      next();
    });
  }else{res.redirect('login');}
}

//99% sure we don't need these but just incase... 
//app.get('/_/js/bootstrap.js', function(req, res){res.sendFile(__dirname + '/views/_/js/bootstrap.js');});
//app.get('/_/js/jquery.js', function(req, res){res.sendFile(__dirname + '/views/_/js/jquery.js');});
//app.get('/_/js/myscript.js', function(req, res){res.sendFile(__dirname + '/views/_/js/myscript.js');});
//


//_________________________
//simple routes ---------------------
app.get('/images/emblem.png', function(req, res){res.sendFile(__dirname + "/views/images/emblem.png");});
app.get('/images/tcsclogo.png', function(req, res){res.sendFile(__dirname + "/views/images/tcsclogo.png");});
app.get('/js.cookie.js', function(req, res){res.sendFile(__dirname + "/views/_/js/js.cookie.js");});
app.get('/images/useridenticon3.png', function(req, res){res.sendFile(__dirname + "/prof_pics/useridenticon3.png");});
app.get('/images/useridenticon2.png', function(req, res){res.sendFile(__dirname + "/prof_pics/useridenticon2.png");});
app.get('/images/useridenticon1.png', function(req, res){res.sendFile(__dirname + "/prof_pics/useridenticon1.png");});


app.get('/new_question', function(req, res){res.render(__dirname + "/views/new_question.jade");});
app.get('/about', function(req, res){res.render(__dirname + "/views/about.jade");});
app.get('/', function(req, res){res.render(__dirname + "/views/index.jade");});
app.get('/logout', function(req, res) {req.session.reset();res.redirect('/');});
//-----------------------

//complicated routes----------------
app.get('/settings', dashboard_check, function(req, res){res.render(__dirname + "/views/settings.jade");});

app.get('/stats', dashboard_check, function(req, res){
  res.render(__dirname + "/views/stats.jade");
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
  var user = req.session.user;
  console.log(user.team);
  if(!user.team){
    console.log("type check bitch");
    console.log(typeof req.session.comp_id);
    console.log("type check done biatch");
    app.locals.config = {comp_id: req.session.comp_id, user:user};
    res.render(__dirname + "/views/dashboard_no_team.jade/")
    //res.render(__dirname + "/views/dashboard.jade");
  }
  else{
    Team.getTeam(user.team, function(team){
      if(team){
        redis.get("global:question_id", function(total_worst_thing_ever_woahhhhh, top_id){
          console.log("type check bitch");
          console.log(typeof req.session.comp_id);
          console.log("type check done biatch");
          var woahh = String(req.session.comp_id);
          console.log(typeof woahh);
          app.locals.config = {comp_id: woahh, user:user, team:team, q_tracker:top_id};
          res.render(__dirname + "/views/dashboard.jade/");
        });
      } 
    });
  }
});
//--------------

//upload testssssss ________________
app.get('/test', dashboard_check, function(req, res){//console.log(req.session); 
  app.locals.config = {comp_id: req.session.comp_id, user:user};var user = req.session.user; res.sendFile(__dirname + "/views/testUpload.html");});

app.use('/prof_pics', express.static( __dirname + '/prof_pics'));

app.use('/upteams', express.static( __dirname + '/upteams'));

app.use('/inv', express.static(__dirname + '/redis/inv'));

app.post('/upload', dashboard_check, function(req,res){
  var profUpload = multer({ dest: './prof_pics/' + req.session.user.id,
    rename: function(fieldname, file) {return file.originalname + Date.now();},
    onFileUploadStart: function (file) {console.log(file.originalname + ' is starting ...');},
    onFileUploadComplete: function (file) {console.log(file.fieldname + ' uploaded to  ' + file.path);redis.set("user:" + req.session.user.id + ":prof_pic", file.name, function(err){});}
  });
  profUpload(req,res,function(err) {
    if(err) {
      console.log(err);
      return res.end("Error uploading file.");
    }
    res.end("File is uploaded");
  });
});

app.post('/dashUpload', dashboard_check, function(req,res){

    console.log('ehhh?????');
    var teamUpload = multer({ dest: './upteams/' + req.session.user.team, 
      rename: function(fieldname, file) {return Date.now();},
      onFileUploadStart: function (file) {console.log(file.originalname + ' uploading...');}, 
      onFileUploadComplete: function (file) {console.log('uploaded to ' + file.path);}
    });
    teamUpload(req,res,function(err) {
      if(err) {
        return res.end("error");
      }
      Chat.fileMessage(req.session.user.id, req.files.userPhoto.originalname, req.files.userPhoto.name, function(suc){
        if(suc){
          res.end(suc);
        }
      });
    });
  
});

app.set('view engine', 'jade');
//____________________



io.on('connection', function(socket){
  console.log("next");

  socket.on('dashboard_connect', function(user_id){
    Chat.getMessages(user_id, function(chat){
      io.emit('chat_log:' + user_id, chat);
    });
    Team.getQuestionsWithStats(1, function(q, a){
        console.log(q);
        console.log(a);
        console.log("avo");
        io.emit('question_stats:' + user_id, q, a);
      },function(q){
        io.emit('question_log:' + user_id, q);
    });
    ///user.getprof essentially
    redis.get('user:' + user_id + ':prof_pic', function(err, val){
      io.emit('prof_pic_load:' + user_id, val);
    });
  });

  socket.on('stat_connect', function(callback){
    console.log("suck my mother fucking dick");
    Team.getLeaderboard(function(b){
      var lb = [];
      for (i = 0; i < b.length; i++) { 
        Team.getTeam(b[i], function(team){
          console.log(team);
          lb.push(team);
          console.log('');
          if(team.id == b[b.length-1]){
            console.log(lb);
            callback(lb);
          }
        });
      }
    });
  });


  socket.on('send_message', function(msg){
    var session_data = decode(session_opts, cookie.parse(socket.handshake.headers.cookie).session).content;
    var user = session_data['user'];
    if(msg && user.team){
      Chat.createMessage(msg, user.id, function(data){
        io.emit('new_message:' + user.team, user.id, msg);
      });
    }
  });
  
  socket.on('answer_question', function(answer, question, type){
    var session_data = decode(session_opts, cookie.parse(socket.handshake.headers.cookie).session).content;
    var user = session_data['user'];
    console.log("AAAAA cha cha cha chia");
    console.log(question);
    console.log(answer);
    omg_you_got_the_banner_question = false;
    if(answer[0] == "-" && answer[answer.length-1] == "-" && question == id_of_banner_question){
      omg_you_got_the_banner_question = true;
    }
    if(user.team){
      Question.answerQuestion(user.id, user.team, question, answer, function(correct){
        console.log(correct);
        console.log("asdfdddddd");
        Team.attemptedQuestion(user.team, user.id, question, correct, function(mess){
          if (mess) {return;} // what a mess
          if (correct){
            Alert.answeredQuestion(user.id, question);
          }else if(omg_you_got_the_banner_question){
            Alert.answeredQuestion(user.id, id_of_banner_question); //update this variable later
            Banner.updateBanner(redis.get("team:" + user.team + ":name"), 2);
          }else{
            io.emit("incorrect" + user.id, (question));
          }
        }); 
      });
    }
  });
  socket.on('signup', function(fname, lname, username, age, email, password){
    console.log("signup_server_socket");
    User.createUser(fname, lname, username, age, email, password, function(v){

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
        redis.setnx("signup_key:" + session_id, v, function(err, set){
          if (err) {return;}
          if (set==0) {return;} //means session_id was already taken is already taken ... some fucked up shit
          io.emit(session_id, 'success_sign_up');
        });
      }
    });
  });

  socket.on('login', function(log, pass){
    console.log("logogogogog");
    var session_data = decode(session_opts, cookie.parse(socket.handshake.headers.cookie).session).content;
    session_id = session_data["login_id"];
    User.validateUser(log, pass, function(v, user_id, pass){
      console.log("check");
      if(v === "true"){
        console.log('true');
        redis.setnx("login_key:" + session_id, user_id, function(err, set){
          if (err) {return;}
          if (set==0) {return;} //means session_id was already taken is already taken ... some fucked up shit
          io.emit(session_id, 'success_login');
        });
      }else if(v === "invalid_pass"){
        io.emit(session_id, 'invalid_pass');
        console.log("invalid_pass");
      }else if(v === "invalid_log"){
        io.emit(session_id, 'invalid_log');
        console.log("invalid_log");
      }else{
        console.log("jjj");
        io.emit(session_id, 'error');
      }
    });
    console.log("pastpast");
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
      if(!data[0]){
        //error
      }else if(data[0] === "name"){
        io.emit(user.id, "register_name");
      }
      else{
        io.emit(user.id, "success_register");
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
      console.log("woah dbug jwow");
      if(!data){
        //error
      }else if(data === "invalid_pass"){
        console.log("oh no pass");
        io.emit(user.id, "join_pass");
      }
      else{
        var team_id = redis.get("team_name:" + team_name + ":id")
        User.addToTeam(user.id, team_id, function (val){
          console.log("we good good man?");
          if(!val){
            //err
          }else if("over_team"){
            //already part of team
          }else{
            Team.addMember(team_id, user.id, function (ill){
              if(!ill){
                //still err
              }else if(ill === "member_overload"){
                //to many peeeeeps
                User.leaveFromTeam(user.id, team_id);
              }else{
                io.emit(user.id, "success_join");
              }
            });
          }
        });
      }
    });
  });
  
  socket.on('search_team', function (team_str){
    var session_data = decode(session_opts, cookie.parse(socket.handshake.headers.cookie).session).content;
    user = session_data["user"];
    console.log(user);
    console.log(team_str);
    Team.searchTeam(team_str, function(array){
      console.log(array);
      socket.emit('complete_tsearch:' + user.id, array);
    })
  });

  socket.on('register_question', function (name, category, description, flag){
    Question.pushQuestion(1, name, category, null,  description, 0, flag, function(success){
      if(!success){
        console.log("uhoh.debug");
        io.emit("woah", "nope");
      }else{
        console.log("goodgood.debug");
        io.emit("woah", "sucess");
      }
    });
  });

  socket.on('inv_team', function (shaname){
    var session_data = decode(session_opts, cookie.parse(socket.handshake.headers.cookie).session).content;
    user = session_data["user"];
    console.log("jjajaj");
    if(User.confirmUser(user)){
      redis.get("shaname:" + shaname + ":id", function(team_id){
      User.addToTeam(user.id, team_id, function (val){
        console.log("we good good man?");
        if(!val){
          //err
        }else if("over_team"){
          //already part of team
        }else{
          Team.addMember(team_id, user.id, function (ill){
            if(!ill){
              //still err
            }else if(ill === "member_overload"){
              //to many peeeeeps
              User.leaveFromTeam(user.id, team_id);
            }else{
              io.emit(user.id, team_id);
            }
          });
        }
      });
      });
    }
  });

  socket.on('inviter', function(email){
    var session_data = decode(session_opts, cookie.parse(socket.handshake.headers.cookie).session).content;
    user = session_data["user"];
    
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

setInterval(function ()
{
  //put stats tick in here
}, 1500);
