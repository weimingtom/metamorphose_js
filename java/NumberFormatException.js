;(function(metamorphose) {

var NumberFormatException = function(str) {
    if (str === undefined) {
        str = "";
    }
	this.message = str;
    this._stackTrace = new Error(this.message).stack;
};

NumberFormatException.prototype = new Error();

NumberFormatException.prototype.getStackTrace = function() {
    //this._stackTrace = new Error(this.message).stack;
    return this._stackTrace;
};

if (typeof module !== 'undefined') {
    module.exports = NumberFormatException;
} else if (metamorphose) {
    metamorphose.NumberFormatException = NumberFormatException;
}
})(typeof window !== 'undefined' && window.metamorphose);
