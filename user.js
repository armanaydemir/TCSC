const crypto = require('crypto');
const passwordHashAlgorithm = 'sha1';

module.exports = function(redis) {
    var computeSHA1 = function(str) { return crypto.createHash(passwordHashAlgorithm).update(str).digest('hex'); };
    var emptyFunction = function() {};
    
    var user = {
    	createUser: function(name, username, age, email, password, leader){
    		
    	}
    }
}