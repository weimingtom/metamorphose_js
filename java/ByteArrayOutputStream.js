;(function(metamorphose) {

var ByteArray = metamorphose ? metamorphose.ByteArray : require('./ByteArray.js');
var OutputStream = metamorphose ? metamorphose.OutputStream : require('./OutputStream.js');

var ByteArrayOutputStream = function() {
    this._bytes = new ByteArray();
};

ByteArrayOutputStream.prototype = new OutputStream();

ByteArrayOutputStream.prototype.toByteArray = function() {
    return this._bytes;
};

ByteArrayOutputStream.prototype.close = function() {
    this._bytes.clear();
};

ByteArrayOutputStream.prototype.flush = function() {

};

ByteArrayOutputStream.prototype.write = function(b) {
    this._bytes.writeBytes(b);
};

ByteArrayOutputStream.prototype.writeBytes = function(b, off, len) {
    this._bytes.writeBytes(b, off, len);
};

//TODO: 这个方法有待修改
//Writes a char to the underlying output stream as a 2-byte value, high byte first
ByteArrayOutputStream.prototype.writeChar = function(b) {
    var bytes = new ByteArray();
    bytes.writeMultiByte(String.fromCharCode(b), "");
    this._bytes.writeBytes(bytes);
};

if (typeof module !== 'undefined') {
    module.exports = ByteArrayOutputStream;
} else if (metamorphose) {
    metamorphose.ByteArrayOutputStream = ByteArrayOutputStream;
}
})(typeof window !== 'undefined' && window.metamorphose);
