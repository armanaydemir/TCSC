const crypto = require('crypto');
const passwordHashAlgorithm = 'sha1';
// todo
// have some thing to keep track of stats from questions point of view (ya know?);
// creating questions too
// write explanation of all the different types of questions

module.exports = function(redis) {
	var computeSHA1 = function(str) { return crypto.createHash(passwordHashAlgorithm).update(str).digest('hex'); };
	var emptyFunction = function() {};

	var question = {
		getQuestion: function(id, callback){
			redis
				.multi()
				.get("question:" + id + ":name")
                .get("question:" + id + ":category")
                .get("question:" + id + ":description")
                .get("question:" + id + ":points")
                .get("question:" + id + ":type")
                .exec(function (error, results) {
            		if (error) {
                		callback(false);
                		return;
            		}
            		callback({id:id, name: results[0], category: results[1], description: results[2], points:results[3], type:results[4]});
            		return;
        		});
		},

        getQuestionStats: function(q_id, callback){
            redis.get("question:" + q_id + ":temp_attempts", function(err, t){
                if(!err)    callback(q_id, t);
            });
        },

		answerQuestion: function(user_id, team_id, question_id, answer, callback){
			callback = callback || emptyFunction;
			redis.zrange("team:" + team_id + ":questions", 0, -1, function(error, q){
				if(error){console.log('error');console.log(error);callback(false);return;}
				if(q && q.indexOf(question_id) != -1){
					callback(false);return; //means they already answered the question
				}else {
					redis.get("question:" + question_id + ":answer", function(err, ans){
                    	if (err) {callback(false);return;}
                    	redis.incr("question:" + question_id + ":temp_attempts");
                        console.log(answer);
                        console.log(ans);
                    	callback(computeSHA1(answer) == ans);
                    });
				}
			});
		},


		pushQuestion: function(user_id, name, category, type, description, expire, flag, points, callback){
			redis.get("user:" + user_id + ":admin", function(error, admin){
				if(error){callback(0); return;}
				if(admin == 1){
					redis.incr("global:question_id", function(err, id){
						if(err){callback(false); return;}
						redis.setnx("question_name:" + name + ":id", id, function(e, set){
							if(e){callback(false); return;}
							if (set == 0) {
                        		callback(false);
                        		return;
                    		} //means question name is already taken
                    		redis
                    			.multi()
                    			.set("question:" + id + ":name", name)
                    			.set("question:" + id + ":category", category)
                    			.set("question:" + id + ":type", type)
                                .set("question:" + id + ":points", points)
                    			.set("question:" + id + ":description", description)
                    			.set("question:" + id + ":expire", expire)
                    			.set("question:" + id + ":answer", computeSHA1(flag))
                    			.exec(function (error, results) {
                            		if (error) {
                                		callback(false);
                                		return;
                            		}
                            		callback(true);
                            		return;
                        		});
						});
					});

				}else{
					callback(0); return;
				}
			});
			//do this for when you make/push a new question out to the competition
		},

		statsTick: function(){
            redis.get("global:question_id", function(err, id){
                if(err){return;}
                id --;

                var d = new Date();
                var time = d.getTime();

                for(var x = 0; x < id; x++){
                    redis.hset("question:" + x + ":stats", time, "numberofteamscorrect:numberofteamsattempted");
                }
            });
        }
	};
	return question;
};