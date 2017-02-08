var IllegalArgumentException = funcion(str) {
    if (str == undefined) {
        str = "";
    }
	this.message = str;
}

IllegalArgumentException.prototype = new Error();

module.exports = IllegalArgumentException;
