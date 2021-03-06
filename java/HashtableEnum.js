;(function(metamorphose) {

var Enumeration = metamorphose ? metamorphose.Enumeration : require('./Enumeration.js');

//注意：这个类不应该由Hashtable以外的类创建
var HashtableEnum = function() {
    this._arr = null;
    this._idx = 0;
    this._len = 0;
};

HashtableEnum.prototype = new Enumeration();  
    
HashtableEnum.prototype.hasMoreElements = function() {
    return this._idx < this._len;
};

HashtableEnum.prototype.nextElement = function() {
    return this._arr[this._idx++];
};

//注意：仅暴露给Hashtable使用的方法
HashtableEnum.prototype.setArr = function(arr) {
    if (arr != null) {
        this._arr = arr;
        this._idx = 0;
        this._len = this._arr.length;
    }
};

if (typeof module !== 'undefined') {
    module.exports = HashtableEnum;
} else if (metamorphose) {
    metamorphose.HashtableEnum = HashtableEnum;
}
})(typeof window !== 'undefined' && window.metamorphose);
