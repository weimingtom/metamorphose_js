//注意：这个类不应该由Hashtable以外的类创建
var HashtableEnum = function() {
    this._arr = null;
    this._idx = 0;
    this._len = 0;
};

HashtableEnum.prototype.hasMoreElements = function() {
    return this._idx < this._len;
};

HashtableEnum.prototype.nextElement() {
    return this._arr[this._idx++];
};

//注意：仅暴露给Hashtable使用的方法
HashtableEnum.prototype.setArr(arr) {
    if (arr != null) {
        this._arr = arr;
        this._idx = 0;
        this._len = this._arr.length;
    }
};

module.exports = HashtableEnum;
