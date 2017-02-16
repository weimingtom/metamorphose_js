;(function(metamorphose) {

var TimeZone = function() {
  this._id = null;  
};

TimeZone.tz = new TimeZone();
TimeZone.tzGMT = new TimeZone();
		
//Flash自动调整夏令时
TimeZone.prototype.useDaylightTime = function() {
    return true;
};

//获取本地时间
TimeZone.getDefault = function() {
    if (TimeZone.tz._id == null)
        TimeZone.tz._id = "default";
    return TimeZone.tz;
};

//获取GMT时间
TimeZone.getTimeZone = function(ID) {
    if (ID != "GMT") {
        console.log("TimeZone.getTimeZone(): not support name");
        throw new Error("TimeZone.getTimeZone(): not support name");
        //return TimeZone.tz; //FIXME:
    }
    if (TimeZone.tzGMT._id == null)
        TimeZone.tzGMT._id = "GMT";
    return TimeZone.tzGMT;
};

//时区字符串
TimeZone.prototype.getID = function() {
    return this._id;
};

if (typeof module !== 'undefined') {
    module.exports = TimeZone;
} else if (metamorphose) {
    metamorphose.TimeZone = TimeZone;
}
})(typeof window !== 'undefined' && window.metamorphose);
