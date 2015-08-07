const crypto = require('crypto');
const passwordHashAlgorithm = 'sha1';

module.exports = function(redis) {
	var computeSHA1 = function(str) { return crypto.createHash(passwordHashAlgorithm).update(str).digest('hex'); };
	var emptyFunction = function() {};

	var question = {
		answerQuestion: function(user_id, team_id, question_id, answer, callback){
			callback = callback || emptyFunction;
			redis.get("team:" + team_id + ":questions", function(error, q){
				if(error){callback(false);return;}
				if q.contains(question_id){
					callback(false);return; //means they already answered the question
				}else {
					redis.get("question:" + question_id + ":answer", function(err, ans){
                    	if (err) {callback(false);return;}
                    	callback(computeSHA1(answer) == ans);
                    });
				}
			});
		},


		pushQuestion: function(){
			//do this for when you make/push a new question out to the competition
		}
	};
	return question;
};