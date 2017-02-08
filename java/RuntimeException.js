var RuntimeException = funcion(str) {
    if (str == undefined) {
        str = "";
    }
	this.message = str;
}

RuntimeException.prototype = new Error();

module.exports = RuntimeException;
