module.exports = function(redis, io) {
	var emptyFunction = function() {};
	var url_regex = /^((?:http(?:s)?\:\/\/)?[a-zA-Z0-9_-]+(?:.[a-zA-Z0-9_-]+)*.[a-zA-Z]{2,4}(?:\/[a-zA-Z0-9_]+)*(?:\/[a-zA-Z0-9_]+.[a-zA-Z]{2,4}(?:\?[a-zA-Z0-9_]+\=[a-zA-Z0-9_]+)?)?(?:\&[a-zA-Z0-9_]+\=[a-zA-Z0-9_]+)*)$/;
	const User = require('./user.js')(redis);
	
	var message = {
		createMessage: function(message, user_id, callback){
			callback = callback || emptyFunction;
			redis.get("user:" + user_id + ":team", function(er, team_id){
				if (er) {callback(false);return;}
				redis.incr("team:" + team_id + ":message_order", function(error, id){
					if (error) {callback(false);return;}
	                var d = new Date();
	                var time = d.getTime();
	                //remember to parse messages backwards
					redis.zadd("team:" + team_id + ":messages", time, message + ":" + time + ":" + user_id, function(err, set){ 
						if (error) {callback(false);return;}
						if (set == 0) {callback(false); console.log("red_alert... get to yo laptop now");} //if this goes off, some fucked up shit is going on
						callback(true); return;
					});
				});
			});
		},

		fileMessage: function(user_id, file_name, file_time, callback){
			callback = callback || emptyFunction;
			redis.get("user:" + user_id + ":team", function(er, team_id){
				if (er) {callback(false);return;}
				redis.incr("team:" + team_id + ":message_order", function(error, id){
					if (error) {callback(false);return;}
	                var d = new Date();
	                var time = d.getTime();
	                //remember to parse messages backwards
					redis.zadd("team:" + team_id + ":messages", time,  file_time + ":" + file_name + ":" + user_id + "!", function(err, set){ 
						if (error) {callback(false);return;}
						if (set == 0) {callback(false); console.log("red_alert... get to yo laptop now");} //if this goes off, some fucked up shit is going on
						callback(true); return;
					});
				});
			});
		},

		getMessages: function(user_id, callback){
			callback = callback || emptyFunction;
			User.getUser(user_id, function(user){
				if(user.team){
					// change this so it only gets the last 10
					redis.zrange("team:" + user.team + ":messages", 0, -1, function(err, tool){
						if(!err && tool){
							callback(tool);return;
						}
						callback(false);return;
					});
				}else{
					callback(false);return;
				}
			});
		},

		getMessagesPage:function(user_id, num, callback){
			//fill this so it gets the next 10 or so
		}
	};
	return message;
};