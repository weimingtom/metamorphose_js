/**
 *	用于读取字符流的抽象类。
 *	子类必须实现的方法只有 read(char[], int, int) 和 close()。
 *	但是，多数子类将重写此处定义的一些方法，
 *	以提供更高的效率和/或其他功能。
 */
var Reader = function() {

};

Reader.prototype.close = function() {
    throwError("Reader.close() not implement");				
}

Reader.prototype.mark = function(readAheadLimit) {
    throwError("Reader.mark() not implement");			
};

Reader.prototype.markSupported = function() {
    throwError("Reader.markSupported() not implement");
    return false;
};

Reader.prototype.read = function() {
    throwError("Reader.read() not implement");
    return 0;
};

Reader.prototype.readBytes = function(cbuf/*char[]*/) {
    throwError("Reader.readBytes() not implement");
    return 0;
};

Reader.prototype.readMultiBytes = function(cbuf/*char[] */, off, len) {
    throwError("Reader.readMultiBytes() not implement");
    return 0;
};

Reader.prototype.ready = function() {
    throwError("Reader.ready() not implement");
    return false;
};

Reader.prototype.reset = function() {
    throwError("Reader.reset() not implement");			
};

Reader.prototype.skip = function(n){
    throwError("Reader.skip() not implement");
    return 0;
};

//新增
Reader.prototype.throwError = function(str) {
    trace(str);
    throw new Error(str);
};

module.exports = Reader;
