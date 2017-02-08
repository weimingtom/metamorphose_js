/**
 * 此抽象类是表示输出字节流的所有类的超类。
 * 输出流接受输出字节并将这些字节发送到某个接收器。
 * 需要定义 OutputStream 子类的应用程序必须始终提供
 * 至少一种可写入一个输出字节的方法。
 * 
 * 这个类不应该实例化
 * 略加修改，让所有写方法都可以返回写入字节数
 */ 
var OutputStream = function() {

};
		
OutputStream.prototype.close = function() {
    throwError("OutputStream.close() not implement");
};

OutputStream.prototype.flush = function() {
    throwError("OutputStream.flush() not implement");			
};

OutputStream.prototype.write = function(b) {
    throwError("OutputStream.write() not implement");
};

OutputStream.prototype.writeBytes = function(b, off, len) {
    throwError("OutputStream.writeBytes() not implement");
};

OutputStream.prototype.writeChar = function(b) {
    throwError("OutputStream.writeChar() not implement");				
};

OutputStream.prototype.throwError = function(str) {
    console.log(str);
    throw new Error(str);
};

module.exports = OutputStream;
