;(function(metamorphose) {

var RuntimeException = function(str) {
    if (str === undefined) {
        str = "";
    }
	this.message = str;
    this._stackTrace = new Error(str).stack;
};

RuntimeException.prototype = new Error();

RuntimeException.prototype.getStackTrace = function() {
    return this._stackTrace;
};

if (typeof module !== 'undefined') {
    module.exports = RuntimeException;
} else if (metamorphose) {
    metamorphose.RuntimeException = RuntimeException;
}
})(typeof window !== 'undefined' && window.metamorphose);
