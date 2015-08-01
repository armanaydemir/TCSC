const crypto = require('crypto');
const passwordHashAlgorithm = 'sha1';

module.exports = function(redis) {
    var computeSHA1 = function(str) { return crypto.createHash(passwordHashAlgorithm).update(str).digest('hex'); };
    var emptyFunction = function() {};
    
    var team = {
    	createTeam: function(name, points, school, members, leader, following, followers, answered, password, callback){
    		callback = callback || emptyFunction;
    		redis.incr('global:nextTeamId', function(error, id) {
    			if (error) {callback(false);return;}
                id --;

                redis.setnx("team:" + name + ":id", id, function(err, set){
                	if (err) {callback(false);return;}
                	if (set==0){callback(false);return;} //means team name is already taken)
						redis
							.multi()
							.

                };
    		}
    	}
    };

    return team;
};