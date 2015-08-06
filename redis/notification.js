module.exports = function(redis, io) {

	var emptyFunction = function() {};
	var notification = {
		onlineAlert: function(user_id, socket, callback){
			callback = callback || emptyFunction;
			redis.get("user:" + user_id + ":team", function(err, team_id){
				if (err) {callback(false);return;}
				redis.smembers("team:" + team_id + ":members", function(error, members){
					if (error) {callback(false);return;}
					

				});
			});
		}

	};
	return notification;

};