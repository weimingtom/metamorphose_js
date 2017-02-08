var NumberFormatException = funcion(str) {
    if (str == undefined) {
        str = "";
    }
	this.message = str;
}

NumberFormatException.prototype = new Error();

module.exports = NumberFormatException;
