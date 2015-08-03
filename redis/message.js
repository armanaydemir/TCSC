const User = require('./user.js')(rClient);
const Team = require('./team.js')(rClient);s

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

		getMessages: function(team_id, user_id, callback){


		}
	};
};