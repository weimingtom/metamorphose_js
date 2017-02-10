var IOException = function(str) {
    if (str === undefined) {
        str = "";
    }
	this.message = str;
};

IOException.prototype = new Error();

module.exports = IOException;
