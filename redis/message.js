module.exports = function(redis) {

	var message = {
		createMessage: function(message, user_id, callback){
			callback = callback || emptyFunction;
			team_id = redis.get("user:" + user_id + ":team_id");
			redis.incr("team:" + team_id + ":message_order", function(error, id){
				if (error) {callback(false);return;}
                id --;

                //remember to parse messages backwards
				redis.zadd("team:" + team_id + "messages", id, message +":"+ user_id +":"+ id, function(err, set){ 
					if (error) {callback(false);return;}
					if (set == 0) {callback(false);return;} //if this goes off, some fucked up shit is going on
				});
			});
		},

		getMessages: function(team_id, callback){
			callback = callback || emptyFunction;
			redis.zrevrange("team:" + team_id + "messages", 0, -1, function(error)) 
			// update this later when the chat UI is up
		}
	};
};