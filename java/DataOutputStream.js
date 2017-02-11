;(function(metamorphose) {

/**
 * 数据输出流允许应用程序以适当方式将基本 Java 数据类型写入输出流中。
 * 然后，应用程序可以使用数据输入流将数据读入。
 * 
 * 封装构造函数中的OutputStream，而这个类的特点是统计了写入字节数。
 * 实现这个类，基本上只用writeByte处理
 */
/**
 * 实际传入的是 ByteArrayOutputStream，见StringLib
 */
var DataOutputStream = function(writer) {
    this.written = 0;
    this._writer = writer;
};

DataOutputStream.prototype.flush = function() {
    this._writer.flush();
};

DataOutputStream.prototype.size = function() {
    return this.written;
};

DataOutputStream.prototype.write = function(b, off, len) {
    if (off === undefined) {
        off = 0;
    }
    if (len === undefined) {
        len = 0;
    }
    var bytes = new ByteArray();
    bytes.writeBytes(b, off, len);
    this._writer.write(bytes);
    this.written += bytes.length;
};

//public function write(b:int):void
//{
//	
//}

DataOutputStream.prototype.writeBoolean = function(v) {
    var bytes = new ByteArray();
    bytes.writeBoolean(v);
    this._writer.write(bytes);
    this.written += bytes.length;
};

DataOutputStream.prototype.writeByte = function(v) {
    //???
    //this._writer.writeChar(v);
    var bytes = new ByteArray();
    bytes.writeByte(v);
    this._writer.write(bytes);
    this.written += bytes.length;
};

DataOutputStream.prototype.writeBytes = function(s) {
    var bytes = new ByteArray();
    bytes.writeMultiByte(s, "");
    this._writer.write(bytes);
    this.written += bytes.length;
};

//TODO: 这个方法有待修改
DataOutputStream.prototype.writeChar = function(v) {
    var bytes = new ByteArray();
    bytes.writeMultiByte(String.fromCharCode(v), "");
    this._writer.write(bytes);
    this.written += bytes.length;
};

//TODO: 这个方法有待修改
DataOutputStream.prototype.writeChars = function(s) {
    var bytes = new ByteArray();
    bytes.writeMultiByte(s, "");
    this._writer.write(bytes);
    this.written += bytes.length;
};

DataOutputStream.prototype.writeDouble = function(v) {
    var bytes = new ByteArray();
    bytes.writeDouble(v);
    this._writer.write(bytes);
    this.written += bytes.length;
};

DataOutputStream.prototype.writeFloat = function(v) {
    var bytes = new ByteArray();
    bytes.writeFloat(v);
    this._writer.write(bytes);
    this.written += bytes.length;
};

DataOutputStream.prototype.writeInt = function(v) {
    var bytes = new ByteArray();
    bytes.writeInt(v);
    this._writer.write(bytes);
    this.written += bytes.length;
};

//这里可能有问题
DataOutputStream.prototype.writeLong = function(v) {
    var bytes = new ByteArray();
    bytes.writeInt(v);
    this._writer.write(bytes);
    this.written += bytes.length;
};

DataOutputStream.prototype.writeShort = function(v) {
    var bytes = new ByteArray();
    bytes.writeShort(v);
    this._writer.write(bytes);
    this.written += bytes.length;
};

DataOutputStream.prototype.writeUTF = function(str) {
    var bytes = new ByteArray();
    bytes.writeUTFBytes(str);
    this._writer.write(bytes);
    this.written += bytes.length;
};

if (typeof module !== 'undefined') {
    module.exports = DataOutputStream;
} else if (metamorphose) {
    metamorphose.DataOutputStream = DataOutputStream;
}
})(typeof window !== 'undefined' && window.metamorphose);