;(function(metamorphose) {

var StringBuffer = function(str) {
    if (str === undefined) {
        str = "";
    }
    this._str = str;
};
		
//并不创建任何字符，只是预留空间
StringBuffer.prototype.init = function(i) {

};

//主要用于清空长度，一般为0
StringBuffer.prototype.setLength = function(i) {
    if (i == 0) {
        this._str = "";
    } else if(i > 0) {
        this._str = this._str.substr(0, i);
    } else {
        throw new Error("StringBuffer.setLength() error: i < 0");
    }
};

StringBuffer.prototype.toString = function() {
    return this._str;
};

StringBuffer.prototype.append = function(ch) {
    this._str = this._str.concat(String.fromCharCode(ch));
};

StringBuffer.prototype.appendStringBuffer = function(buf) {
    this._str = this._str.concat(buf._str);
};

StringBuffer.prototype.appendString = function(str) {
    this._str = this._str.concat(str);
};

/**
 * 移除此序列的子字符串中的字符。该子字符串从指定的 start 处开始，
 * 一直到索引 end - 1 处的字符，如果不存在这种字符，则一直到序列尾部。
 * 如果 start 等于 end，则不发生任何更改。
 * 
 * delete在Java中不是关键字，但在AS3中是关键字
 */
StringBuffer.prototype._delete = function(start, end) {
    //trace("StringBuffer._delete(" + start + "," + end + ")");
    if(end > this._str.length) {
        end = this._str.length; //end可能是个过大的数
    }

    if(0 <= start && start < end && end <= this._str.length) {
        this._str = this._str.substring(0, start) + 
            this._str.substring(end);
        return this;
    } else {
        throw new Error("StringBuffer.delete() error");
    }
};

StringBuffer.prototype.insert = function(at, ch) {
    this._str = this._str.substring(0, at) + 
        String(ch) + 
        this._str.substring(at);
};

StringBuffer.prototype.insertStringBuffer = function(at, buf) {
    this._str = this._str.substring(0, at) + 
        buf._str + 
        this._str.substring(at);			
};

StringBuffer.prototype.length = function() {
    return this._str.length;
};

StringBuffer.prototype.charAt = function(index) {
    return this._str.charCodeAt(index);
};

StringBuffer.prototype.deleteCharAt = function(index) {
    return this._delete(index, index + 1);
};

if (typeof module !== 'undefined') {
    module.exports = StringBuffer;
} else if (metamorphose) {
    metamorphose.StringBuffer = StringBuffer;
}
})(typeof window !== 'undefined' && window.metamorphose);
