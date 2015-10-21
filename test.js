module.exports = function(redis) {
	const User = require('./redis/user.js')(redis);
	const Team = require('./redis/team.js')(redis);
	const Question = require('./redis/question.js')(redis);
	var emptyFunction = function() {};

	var test = {
		setUp: function(){
			User.createUser("Arman", "Aydemir", "arman", "17", "16aydemir@da.org", "arman111", function(a_id){
				redis.set("user:" + a_id + ":admin", 1);
				if(a_id === "email"){
					return;
				}else{
					Team.createTeam("Woah", "Durham Academy", a_id, "passwoah", function(w_id){
						User.createUser("Nick", "Colvin", "nick", "18", "16colvin@da.org", "nick111", function(n_id){
							redis.set("user:" + n_id + ":admin", 1);
							User.addToTeam(n_id, w_id, function(v){
								Team.addMember(w_id, n_id, function(d){
									
			Question.pushQuestion(n_id, "Test Question 1", "Algorithm", null, "This is a great description for this question", null, "this_is_flag", function(g){
				Question.pushQuestion(n_id, "Test Question 2", "Cryptography", null, "This is a great description for this question", null, "this_is_flag", function(g){
					Question.pushQuestion(n_id, "Test Question 3", "Algorithm", null, "This is a great description for this question", null, "this_is_flag", function(g){
						return;
					});
				});
			});
								});
							});
						});
					});
				}
			});
		}
	};
	return test;
};