module.exports = function(redis, io) {

	var emptyFunction = function() {};
	var notification = {
		onlineAlert: function(user_id, callback){
			callback = callback || emptyFunction;
			redis.get("user:" + user_id + ":team", function(err, team_id){
				if (err) {callback(false);return;}
				redis.smembers("team:" + team_id + ":members", function(error, members){
					if (error) {callback(false);return;}
					
					//for each member
						//io.emit("notification:" + member, online, user_id)
				});
			});
		},

		answeredQuestion: function(user_id, question_id, callback){
			callback = callback || emptyFunction;
			redis.get("user:" + user_id + ":team", function(err, team_id){
				if (err) {callback(false);return;}
				redis.smembers("team:" + team_id + ":members", function(error, members){
					if (error) {callback(false);return;}
					//for each member
						//io.emit("notification:" + member, answered_question, (user_id, ))
					

				});
			});
		}

	};
	return notification;

};