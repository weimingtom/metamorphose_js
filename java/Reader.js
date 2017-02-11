;(function(metamorphose) {

/**
 *	用于读取字符流的抽象类。
 *	子类必须实现的方法只有 read(char[], int, int) 和 close()。
 *	但是，多数子类将重写此处定义的一些方法，
 *	以提供更高的效率和/或其他功能。
 */
var Reader = function() {

};

Reader.prototype.close = function() {
    this.throwError("Reader.close() not implement");				
};

Reader.prototype.mark = function(readAheadLimit) {
    this.throwError("Reader.mark() not implement");			
};

Reader.prototype.markSupported = function() {
    this.throwError("Reader.markSupported() not implement");
    return false;
};

Reader.prototype.read = function() {
    this.throwError("Reader.read() not implement");
    return 0;
};

Reader.prototype.readBytes = function(cbuf/*char[]*/) {
    this.throwError("Reader.readBytes() not implement");
    return 0;
};

Reader.prototype.readMultiBytes = function(cbuf/*char[] */, off, len) {
    this.throwError("Reader.readMultiBytes() not implement");
    return 0;
};

Reader.prototype.ready = function() {
    this.throwError("Reader.ready() not implement");
    return false;
};

Reader.prototype.reset = function() {
    this.throwError("Reader.reset() not implement");			
};

Reader.prototype.skip = function(n){
    this.throwError("Reader.skip() not implement");
    return 0;
};

//新增
Reader.prototype.throwError = function(str) {
    console.log(str);
    throw new Error(str);
};

if (typeof module !== 'undefined') {
    module.exports = Reader;
} else if (metamorphose) {
    metamorphose.Reader = Reader;
}
})(typeof window !== 'undefined' && window.metamorphose);
