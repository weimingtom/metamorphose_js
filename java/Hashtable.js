;(function(metamorphose) {

var HashtableEnum = metamorphose ? metamorphose.HashtableEnum : require("./HashtableEnum.js");
    
var Hashtable = function(initialCapacity) {
    if (initialCapacity === undefined) {
        initialCapacity = 11;
    }
    //Dictionary支持用Object作为键，而Array会对键进行toString的转换
    this._dic = new Object();
};

Hashtable.prototype.rehash = function() {

};

Hashtable.prototype.keys = function() {
    var enum_ = new HashtableEnum();
    var arr = new Array();
    for (var key in this._dic) {
        arr.push(key);
    }
    enum_.setArr(arr);
    return enum_;
};

Hashtable.prototype._get = function(key) {
//    if (typeof this._dic === 'undefined') {
//        console.log('here');
//    }
    return this._dic[key];
};

Hashtable.prototype.put = function(key, value) {
//    if (typeof this._dic === 'undefined') {
//        console.log('here');
//    }
    var pre = this._dic[key];
    this._dic[key] = value;
    return pre;
};

Hashtable.prototype.remove = function(key) {
    var pre = null;
    if (this._dic[key]) {
        pre = this._dic[key];
        this._dic[key] = null;
        delete this._dic[key];
    }
    return pre;
};

if (typeof module !== 'undefined') {
    module.exports = Hashtable;
} else if (metamorphose) {
    metamorphose.Hashtable = Hashtable;
}
})(typeof window !== 'undefined' && window.metamorphose);
