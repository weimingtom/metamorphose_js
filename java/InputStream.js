/**
 * 
 * 此抽象类是表示字节输入流的所有类的超类。
 * 需要定义 InputStream 的子类的应用程序
 * 必须始终提供返回下一个输入字节的方法。
 * 
 */
var InputStream = function() {

};

InputStream.prototype.readBytes = function(bytes) {
    this.throwError("InputStream.readBytes() not implement");	
    return 0;
};

//从输入流读取下一个数据字节。
InputStream.prototype.read = function() {
    this.throwError("InputStream.readChar() not implement");	
    return 0;
};

InputStream.prototype.reset = function() {
    this.throwError("InputStream.reset() not implement");				
};

InputStream.prototype.mark = function(i) {
    this.throwError("InputStream.mark() not implement");			
};

InputStream.prototype.markSupported = function() {
    this.throwError("InputStream.markSupported() not implement");	
    return false;
};

InputStream.prototype.close = function() {
    this.throwError("InputStream.close() not implement");			
};

InputStream.prototype.available = function() {
    this.throwError("InputStream.available() not implement");
    return 0;
};

InputStream.prototype.skip = function(n) {
    this.throwError("InputStream.skip() not implement");
    return 0;
};

InputStream.prototype.readMultiBytes = function(bytes,  off, len) {
    this.throwError("InputStream.readBytes() not implement");	
    return 0;
};

InputStream.prototype.throwError = function(str) {
    console.log(str);
    throw new Error(str);
};

module.exports = InputStream;
