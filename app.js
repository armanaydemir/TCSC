var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use(express.cookieParser());
app.use(express.session({secret: 'iWonderIfAnyoneWouldGuessThis'}));

app.get('/', function(req, res){
	
	res.sendFile(__dirname + '/index.html')
})