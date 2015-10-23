module.exports = function(redis) {
	const User = require('./redis/user.js')(redis);
	const Team = require('./redis/team.js')(redis);
	const Question = require('./redis/question.js')(redis);
	var emptyFunction = function() {};

	var test = {
		setUp: function(){

			//"Woah" team and users
			User.createUser("Arman", "Aydemir", "arman", "17", "16aydemir@da.org", "arman", function(a_id){
				redis.set("user:" + a_id + ":admin", 1);
				if(a_id === "email"){
					return;
				}else{
					Team.createTeam("Woah", "Durham Academy", a_id, "woah", function(w_id){
						User.createUser("Nick", "Colvin", "nick", "18", "16colvin@da.org", "nick", function(n_id){
							redis.set("user:" + n_id + ":admin", 1);
							User.addToTeam(n_id, w_id, function(v){
								Team.addMember(w_id, n_id, function(d){
								});
							});
						});
					});

			// some other teams from Ravenscroft (fuck them)
			User.createUser("Matt", "Sale", "matt", "17", "16sale@da.org", "matt", function(m_id){
				Team.createTeam("Gay", "Ravenscroft", m_id, "gay", function(g_id){
						User.createUser("Stillman", "Hansen", "stillman", "18", "15hansen@da.org", "stillman", function(s_id){
							User.addToTeam(s_id, g_id, function(v){
								Team.addMember(g_id, s_id, function(d){
			});});});});});

			// some other teams from Durham Academy
			User.createUser("Tad", "Ghanem", "tad", "17", "16ghanem@da.org", "tad", function(t_id){
				Team.createTeam("HumDuck", "Durham Academy", t_id, "humduck", function(h_id){
						User.createUser("Loften", "Deprez", "loften", "18", "16deprez@da.org", "loften", function(m_id){
							User.addToTeam(m_id, h_id, function(v){
								Team.addMember(h_id, m_id, function(d){
			});});});});});
			User.createUser("Nash", "Wilhelm-Hilkey", "nash", "17", "16wilhem-hilkey@da.org", "nash", function(n_id){
				Team.createTeam("Gandhi", "Durham Academy", n_id, "gandhi", function(g_id){
						User.createUser("Kiran", "Nagar", "kiran", "17", "16nagar@da.org", "kiran", function(k_id){
							User.addToTeam(k_id, g_id, function(v){
								Team.addMember(g_id, k_id, function(d){
			});});});});});


			//users without team
			User.createUser("Gabe", "Young", "gabe", "17", "16young@da.org", "gabe", function(g_id){
				User.createUser("Abe", "Dunderdale", "abe", "17", "16dunderdale@da.org", "abe", function(a_id){
				});
			});


			//team with only one member
			User.createUser("Lonely", "Man", "lonely", "17", "16man@da.org", "lonely", function(l_id){
				Team.createTeam("Lonely", "", a_id, "lonely", function(l_team_id){
				});
			});

			//questions
			Question.pushQuestion("1", "Test Question 1", "Algorithm", null, "This is a great description for this question", null, "this_is_flag", 100, function(g){
				Question.pushQuestion("1", "Test Question 2", "Cryptography", null, "This is a great description for this question", null, "this_is_flag", 200,function(g){
					Question.pushQuestion("1", "Test Question 3", "Algorithm", null, "This is a great description for this question", null, "this_is_flag", 300,function(g){	
					});
				});
			});
									
						
			}});
			return;
		}
	};
	return test;
};