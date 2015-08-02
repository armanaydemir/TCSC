var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');
var rClient = redis.createClient();
const User = require('./user.js')(rClient);
const Team = require('./team.js')(rClient);
var session_store = require('connect-mongo')(require('express'));

app.use(express.cookieParser());
app.use(express.session({
	store: new MongoStore({
    	url: 'mongodb://root:myPassword@mongo.onmodulus.net:27017/3xam9l3'
  	}),
  	secret: 'iWonderIfAnyoneWouldGuessThis'
}));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html')
})

module.exports(app);