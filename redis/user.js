const Overload = require('jshelpers').Overload;
const crypto = require('crypto');
const passwordHashAlgorithm = 'sha1';

module.exports = function(redis) {
    var computeSHA1 = function(str) { return crypto.createHash(passwordHashAlgorithm).update(str).digest('hex'); };
    var emptyFunction = function() {};
    
    var user = {
    	createUser: function(name, username, age, email, password, callback){
    		callback = callback || emptyFunction;
    		redis.incr('global:nextUserId', function(error, id) {
    			if (error) {callback(false);return;}
                id --;

            	redis.setnx("email:" + email.toLowerCase() + ":id", id, function(err, set){
            		if (err) {callback(false);return;}
            		if (set==0) {callback(false);return;} //means email is already taken
            		redis.setnx("username:" + username + ":id", id, function(err, set){
            			if (err) {callback(false);return;}
            			if (set==0) {callback(false);return;} //means username is already taken
            				redis
            					.multi()
            					.set('user:' + id + ':email', email)
            					.set('user:' + id + ':username', username)
            					.set('user:' + id + ':name', name)
            					.set('user:' + id + ':age', age)
            					.set('user:' + id + ':admin', '0')
            					.set('user:' + id + ':password', computeSHA1(password))
            					.exec(function(error, results) {
                            		if (error) {
                                		callback(false);
                                		return;
                            		}
                            		callback(true);
                        });
            		});
            	});
    		});
    	},

    	//returns all identifiers of user [id, email, username]
    	getUser: Overload
    		.add([Number], function(id) { user.getUser(id, emptyFunction); })
            .add([String], function(log) { user.getUser(log, emptyFunction); })
            .add([Number, Function], function(id, callback) {
                redis
                    .multi()
                    .get('user:' + id + ':email')
                    .get('user:' + id + 'username')
                    .exec(function(error, results) {
                        if (error) {
                            callback(null);
                            return;
                        }
                        callback({
                            id: id,
                            email: results[0],
                            username: results[1]
                        });
                    });
            })
            .add([String, Function], function(log, callback) {
            	if(email_regex.test(log)){
	                redis.get('email:' + email.toLowerCase() + ':id', function(error, id) {
	                    if (error) {
	                        callback(null);
	                        return;
	                    }
	                    if (id == null) {
	                        callback(null);
	                        return;
	                    }
	                    user.getUser(parseInt(id), callback);
	                });
	            }else{
	            	redis.get('username:' + username + ':id', function(error, id) {
	                    if (error) {
	                        callback(null);
	                        return;
	                    }
	                    if (id == null) {
	                        callback(null);
	                        return;
	                    }
	                    user.getUser(parseInt(id), callback);
	                });
	            }
            }),

    	validateUser: function(log, pass, callback){
    		callback = callback || emptyFunction;
    		if(email_regex.test(log)){
    			User.getUser(log, function(user){
    				if(user == null){callback(false);return;}

    				redis.get('user' + user.id + ':password', function(error, password){
    					if (error) {
                        	callback(false);
                        	return;
                    	}
                    	callback(computeSHA1(passwordToValidate) == password);
    				});
    			});
    		}
    	},

        addToTeam: function(user_id, team_id, callback){
            callback = callback || emptyFunction;
            user.setnx("user:" + user_id + "team_id", team_id, function(err, set){
                if (err) {callback(false);return;}
                if (set==0) {callback(false);return;} //is already part of team (must leave)
            });
        }
    };
    return user;
};