module.exports = function(redis, io) {
	const User = require('./user.js')(redis);
	const Team = require('./team.js')(redis);
	var emptyFunction = function() {};

	var notification = {
		onlineAlert: function(user_id, callback){
			callback = callback || emptyFunction;
			redis.get("user:" + user_id + ":team", function(err, team_id){
				if (err) {callback(false);return;}
				Team.notifyTeam(team_id, io, "online", user_id, user_id);

			});
		},

		answeredQuestion: function(user_id, question_id, callback){
			callback = callback || emptyFunction;
			redis.get("user:" + user_id + ":team", function(err, team_id){
				if (err) {callback(false);return;}
				Team.notifyTeam(team_id, io, "answered_question", (user_id, question_id));
				redis.smembers("team:" + team_id + ":followers", function(error, teams){
					//foreach team in teams
						//see if some shit happens


				});
			});
		},

		newMessage: function(user_id, team_id, callback){
			callback = callback || emptyFunction;
		}

	};
	return notification;

};