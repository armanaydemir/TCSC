module.exports = function(redis, io) {
	
	var message = {
		createMessage: function(message, user_id, callback){
			callback = callback || emptyFunction;
			redis.get("user:" + user_id + ":team_id", function(er, team_id){
				if (er) {callback(false);return;}
				redis.incr("team:" + team_id + ":message_order", function(error, id){
					if (error) {callback(false);return;}
	                id --;


	                var d = new Date();
	                var time = d.getTime();
	                //remember to parse messages backwards
					redis.zadd("team:" + team_id + ":messages", time, message +":"+ user_id +":"+ time, function(err, set){ 
						if (error) {callback(false);return;}
						if (set == 0) {callback(false);return;} //if this goes off, some fucked up shit is going on
					});
				});
			});
		},

		getMessages: function(team_id, callback){
			callback = callback || emptyFunction;
			redis.zrevrange("team:" + team_id + ":messages", 0, -1, function(error)) 
			// update this later when the chat UI is up
		}
	};
};