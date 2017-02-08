var NullPointerException = funcion(str) {
    if (str == undefined) {
        str = "";
    }
	this.message = str;
}

NullPointerException.prototype = new Error();

module.exports = NullPointerException;
