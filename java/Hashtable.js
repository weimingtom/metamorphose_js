var Hashtable = function(initialCapacity) {
    if (initialCapacity == undefined) {
        initialCapacity = 11;
    }
    //Dictionary支持用Object作为键，而Array会对键进行toString的转换
    this._dic = new Dictionary();
};

Hashtable.prototype.rehash = function() {

};

Hashtable.prototype.keys() {
    var enum = new HashtableEnum();
    var arr = new Array();
    for (var key in this._dic) {
        arr.push(key);
    }
    enum.arr = arr;
    return enum;
};

Hashtable.prototype._get(key) {
    return this._dic[key];
};

Hashtable.prototype.put = function(key, value) {
    var pre:Object = this._dic[key];
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

module.exports = Hashtable;
