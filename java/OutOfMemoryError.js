var OutOfMemoryError = function(str) {
    if (str === undefined) {
        str = "";
    }
	this.message = str;
};

OutOfMemoryError.prototype = new Error();

module.exports = OutOfMemoryError;
