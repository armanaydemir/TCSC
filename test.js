module.exports = function(redis) {
	const User = require('./redis/user.js')(redis);
	const Team = require('./redis/team.js')(redis);
	var emptyFunction = function() {};

	var test = {
		setUp: function(){
			User.createUser("Arman Aydemir", "arman", "17", "16aydemir@da.org", "arman111", function(a_id){
				Team.createTeam("Woah", "Durham Academy", a_id, "passwoah", function(w_id){
					User.createUser("Nick Colvin", "nick", "18", "16colvin@da.org", "nick111", function(n_id){
						User.addToTeam(n_id, w_id, function(v){
							Team.addMember(w_id, n_id, function(d){
								return;
							});
						});
					});
				});
			});
		}
	};
	return test;
};