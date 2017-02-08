TimeZone = new function() {
  this._id = null;  
};

TimeZone.tz = new TimeZone();
TimeZone.tzGMT = new TimeZone();
		
//Flash自动调整夏令时
TimeZone.prototype.useDaylightTime() {
    return true;
};

//获取本地时间
TimeZone.getDefault = function() {
    if (tz._id == null)
        tz._id = "default";
    return tz;
};

//获取GMT时间
TimeZone.getTimeZone = function(ID) {
    if (ID != "GMT") {
        trace("TimeZone.getTimeZone(): not support name");
        throw new Error("TimeZone.getTimeZone(): not support name");
        return tz;
    }
    if (tzGMT._id == null)
        tzGMT._id = "GMT";
    return tzGMT;
};

//时区字符串
TimeZone.prototype.getID = function() {
    return this._id;
};

module.exports = TimeZone;
