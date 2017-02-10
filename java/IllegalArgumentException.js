var IllegalArgumentException = function(str) {
    if (str === undefined) {
        str = "";
    }
	this.message = str;
};

IllegalArgumentException.prototype = new Error();

module.exports = IllegalArgumentException;
