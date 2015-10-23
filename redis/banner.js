module.exports = function(redis){
	var emptyFunction = function() {};
    
	var banner = {
		updateBanner: function(string, expire){ //expire is in minutes
			redis.zadd("banner", expire, string);
		},

		getBanner: function(){
			//get banner from db here
		},

		minute_tick: function(){

		}
	};







};