const crypto = require('crypto');
const passwordHashAlgorithm = 'sha1';

//todo
//have thing to keep track of questions stats from team point of view (who has been answering and stuff)

module.exports = function(redis) {
    var computeSHA1 = function(str) { return crypto.createHash(passwordHashAlgorithm).update(str).digest('hex'); };
    var emptyFunction = function() {};

    function nextLetter(s){
        return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function(a){
            var c= a.charCodeAt(0);
            switch(c){
                case 90: return 'A';
                case 122: return 'a';
                default: return String.fromCharCode(++c);
            }
        });
    }


    var team = {
        createTeam: function (name, school, leader_id, password, callback) {
            callback = callback || emptyFunction;
            redis.incr('global:nextTeamId', function (error, id) {
                if (error) {
                    callback(false);
                    return;
                }

                redis.setnx("team_name:" + name.toLowerCase() + ":id", id, function (err, set) {
                    if (err) {
                        callback(false);
                        return;
                    }
                    if (set == 0) {
                        callback("name");
                        return;
                    } //means team name is already taken
                    redis
                        .multi()
                        .set("user:" + leader_id + ":team", id)
                        .set("team:" + id + ":name", name)
                        .set("team:" + id + ":points", 0)
                        .set("team:" + id + ":school", school)
                        .sadd("team:" + id + ":members", leader_id)
                        .set("team:" + id + ":leader", leader_id)
                        .set("team:" + id + ":password", computeSHA1(password))
                        .set("team:" + id + ":message_order", 0)
                        .sadd("school:" + school + ":teams", id)
                        .exec(function (error, results) {
                            if (error) {
                                callback(false);
                                return;
                            }
                            callback(true);
                        });
                });
            });
        },

        getTeamMembers: function (team_id, callback) {
            callback = callback || emptyFunction;
            redis.smembers("team:" + team_id + ":members", function (err, mems) {
                if (err) {
                    callback(false);
                    return;
                }
                callback(true);
                return mems;
            });
        },

        addMember: function (team_id, user_id, callback) {
            callback = callback || emptyFunction;
            //add a test to make sure not too many people in team
            redis.sadd("team:" + team_id + ":members", user_id, function (err, set) {
                if (err) {
                    callback(false);
                    return;
                }
                if (set == 0) {
                    callback(false);
                    return;
                } //means user was already part of this team
                callback(true);
                return(true);
            });
        },

        removeMember: function (team_id, user_id, callback) {
            callback = callback || emptyFunction;
            redis.srem("team:" + team_id + ":members", user_id, function (err, set) {
                if (err) {
                    callback(false);
                    return;
                }
                if (set == 0) {
                    callback(false);
                    return;
                } //means user was not part of this team, lol
                callback(true);
            });
        },

        validateTeam: function (team_name, pass, callback) {
            callback = callback || emptyFunction;
            redis.get("team_name:" + team_name.toLowerCase() + ":id", function (error, team_id) {
                if (error) {
                    callback(false);
                    return;
                }
                console.log(team_name);
                console.log(error);
                console.log(team_id);
                redis.get("team:" + team_id + ":password", function (err, password) {
                    if (err) {
                        callback(false);
                        return;
                    }
                    console.log(password);
                    console.log(computeSHA1(pass));
                    if(computeSHA1(pass) === password){
                        callback(true);
                        return(true);
                    }else{
                        callback("invalid_pass");
                        return("invalid_pass");
                    }
                });
            });
        },

        searchTeam: function (input, callback) {
            //console.log("woaj");
            redis.zrangebylex("global:leaderboard", "[" + input, "(" + input.substring(0, input.length -1) + nextLetter(input.slice(-1)), function(err, array){
                console.log(array.toString());
                callback(array);
            });
            //console.log(query.toString());
        },

        followTeam: function (other_id, team_id, callback) {
            callback = callback || emptyFunction;
            redis.sadd("team:" + team_id + ":following", other_id, function (err, set) {
                if (err) {
                    callback(false);
                    return;
                }
                if (set == 0) {
                    callback(false);
                    return;
                } //means team was already following other team
                redis.sadd("team:" + other_id + "followers", team_id, function (e) {
                    if (e) {
                        callback(false);
                        return;
                    }
                    callback(true);
                });
            });
        },


        unfollowTeam: function (other_id, team_id, callback) {
            callback = callback || emptyFunction;
            redis.srem("team:" + team_id + ":following", other_id, function (err, num) {
                if (err) {
                    callback(false);
                    return;
                }
                if (num == 0) {
                    callback(false);
                    return;
                } //means they weren't following the team already
                redis.srem("team:" + other_id + "followers", team_id, function (e) {
                    if (e) {
                        callback(false);
                        return;
                    }
                    callback(true);
                });
            });
        },

        getLeaderboard: function(callback) {
            callback = callback || emptyFunction;
            redis.zrange("global:leaderboard", 0 ,-1, function(err, board){
                if (err) {
                    callback(false);
                    return;
                }
                callback(board);
            });
        },

        getFollowingLeaderboard: function(team_id, callback) {
            callback = callback || emptyFunction;
            redis.zrange("team:" + team_id + ":local_board", 0, -1, function(err, board){
                if (err) {
                    callback(false);
                    return;
                }
                callback(board);
            });
        },

        getQuestions: function(team_id, callback){
            redis.zrange("team:" + team_id + ":questions", 0, -1, function(err, questions){
                console.log(questions);

            });
        },

        answeredQuestions: function (team_id, callback) {
            callback = callback || emptyFunction;
            redis.get("team:" + team_id + ":questions", function (err, q) {
                if (err) {
                    callback(false);
                    return;
                }
                callback(q);
                return q;
            });
        },

        attemptedQuestion: function (team_id, user_id, question_id, correct, callback) {
            callback = callback || emptyFunction;
            var d = new Date();
            var time = d.getTime();
            if (correct) {
                redis.zadd("team:" + team_id + ":questions", time, question_id + ":" + user_id + ":" + time, function (err, set) {
                    if (err) {
                        callback(false);
                        return;
                    }
                    if (set == 0) {
                        callback(false);
                        return;
                    } //means team already answered question
                });
                redis.zadd("team:" + team_id + ":question_order", -1, question_id);
                redis.get("question:" + question_id + ":score", function(err, score){
                    if (err) {
                        callback(false);
                        return;
                    }
                    redis.incrby("question:" + question_id + ":teams_answered", 1);
                    redis.incrby("team:" + team_id + ":points", score);
                });
            }
            else {
                redis.zincrby("team:" + team_id + ":question_order", 1, question_id);
                redis.sadd("team:" + team_id + ":question:" + question_id + ":working_on", user_id);
            }
            redis.zadd("team:" + team_id + ":attempts", time, question_id + ":" + user_id + ":" + time, function (err, set) {
                if (err) {
                    callback(false);
                    return;
                }
                if (set == 0) {
                    callback(false);
                    return;
                }
                callback(true);
            });
        },

        notifyTeam: function (team_id, io, type, data, except, callback) {
            callback = callback || emptyFunction;
            redis.smembers("team:" + team_id + ":members", function(err, members){
                if (error) {callback(false);return;}

                //for each member
                    //if member != except
                        //io.emit("notification:" + member, type, data)
            });
        },
    };

    return team;
};