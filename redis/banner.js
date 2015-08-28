module.exports = function(redis){
	var emptyFunction = function() {};
    
	var banner = {
		updateBanner: function(string, expire){ //expire is in minutes
			redis.zadd("banner", expire, string);
		},

		minute_tick: function(){

		}
	};







};