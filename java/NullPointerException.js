var NullPointerException = function(str) {
    if (str === undefined) {
        str = "";
    }
	this.message = str;
};

NullPointerException.prototype = new Error();

module.exports = NullPointerException;
