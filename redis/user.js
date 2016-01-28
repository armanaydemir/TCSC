const Overload = require('jshelpers').Overload;
const crypto = require('crypto');
const passwordHashAlgorithm = 'sha1';
const email_regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

//todo
//get the user image thing set up

module.exports = function(redis) {
    var computeSHA1 = function(str) { return crypto.createHash(passwordHashAlgorithm).update(str).digest('hex'); };
    var emptyFunction = function() {};
    
    var user = {
    	createUser: function(fname, lname, username, age, email, password, callback){
            //age should actually be birthdate bruh
    		callback = callback || emptyFunction;

    		redis.incr('global:nextUserId', function(error, id) {
    			if (error) {callback("err");return;}

            	redis.setnx("email:" + email.toLowerCase() + ":id", id, function(err, set){
            		if (err) {callback(null);return;}
            		if (set==0) {callback("email");return;} //means email is already taken
            		redis.setnx("username:" + username + ":id", id, function(err, set){
            			if (err) {callback(null);return;}
            			if (set==0) {callback("username");return;} //means username is already taken
        				redis
        					.multi()
                            .set('user:' + id + ':prof_pic', (Math.floor(Math.random() * 3) + 1) + ".png")
        					.set('user:' + id + ':email', email.toLowerCase() + ':' + email)
        					.set('user:' + id + ':username', username.toLowerCase() + ':' + username)
        					.set('user:' + id + ':fname', fname)
                            .set('user:' + id + ':lname', lname)
        					.set('user:' + id + ':age', age)
        					.set('user:' + id + ':admin', '0')
        					.set('user:' + id + ':password', computeSHA1(password))
        					.exec(function(error, results) {
                        		if (error) {
                            		callback(null);
                            		return;
                        		}
                            });
                        callback(id);
                        return;
            		});
            	});
    		});
    	},

    	//returns all identifiers of user [id, email, username]
    	getUser: function(id, callback) {
            redis
                .multi()
                .get('user:' + id + ':email')
                .get('user:' + id + ':username')
                .get('user:' + id + ':age')
                .get('user:' + id + ':fname')
                .get('user:' + id + ':lname')
                .get('user:' + id + ':team')
                .get('user:' + id + ':prof_pic')
                .exec(function(error, results) {
                    if (error) {
                        callback(null);
                        return;
                    }
                    callback({
                        id: id,
                        email: results[0].slice(results[0].indexOf(':')+1,results[0].length),
                        username: results[1].slice(results[1].indexOf(':')+1,results[1].length),
                        age: results[2],
                        fname: results[3],
                        lname: results[4],
                        team: results[5],
                        prof_pic: results[6]
                    });
                });
        },

        editUser: function(id, fname, lname, prof_pic, username, age, new_pass, pass){
            if(id){
                redis.set('user:' + id + ':prof_pic', prof_pic);
            }
        },

    	validateUser: function(log, pass, callback){
    		callback = callback || emptyFunction;
    		if(email_regex.test(log)){
                redis.get("email:" + log + ":id", function(err, id){
                    if (err) {
                        callback("false", null, null);
                        return;
                    }
        			
    				if(id == null){callback("invalid_log", null, null);return;}

    				redis.get('user:' + id + ':password', function(error, password){
    					if (error) {
                        	callback("false", null, null);
                        	return;
                    	}
                        console.log(password);
                    	if(computeSHA1(pass) == password){
                            callback("true", id, pass);
                        }else{
                            callback("invalid_pass", null, null);
                        }
    				});
                });
    		}else{
                redis.get("username:" + log + ":id", function(err, id){
                    if(err) {
                        callback("false", null, null);
                        return;
                    }
                    if(id == null){
                        callback("invalid_log", null, null);
                        return;
                    }
                    redis.get("user:" + id + ":password", function(error, password){
                        if(error) {
                            callback("false", null, null);
                            return;
                        }
                        console.log(password);
                        console.log(computeSHA1(pass));
                        if(computeSHA1(pass)==password){
                            callback("true", id, pass);
                        }else{
                            callback("invalid_pass", null, null);
                        }
                    });
                });    
            }
    	},

        addToTeam: function(user_id, team_id, callback){
            callback = callback || emptyFunction;
            redis.setnx("user:" + user_id + ":team", team_id, function(err, set){
                if (err) {callback(false);return;}
                if (set==0) {callback("over_team");return;} //is already part of team (must leave)
                callback(true);
                return(true);
            });
        },

        leaveFromTeam: function(user_id, team_id, callback){
            callback = callback || emptyFunction;
            redis.del("user:" + user_id + ":team", function(err) {
                if (err) {callback(false);return;}
                callback(true);
            });
        },

        confirmUser: function(user){
            
        }
    };
    return user;
};