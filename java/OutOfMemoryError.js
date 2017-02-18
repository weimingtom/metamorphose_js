;(function(metamorphose) {

var OutOfMemoryError = function(str) {
    if (str === undefined) {
        str = "";
    }
	this.message = str;
    this._stackTrace = new Error(this.message).stack;
};

OutOfMemoryError.prototype = new Error();

OutOfMemoryError.prototype.getStackTrace = function() {
    //this._stackTrace = new Error(this.message).stack;
    return this._stackTrace;
};

if (typeof module !== 'undefined') {
    module.exports = OutOfMemoryError;
} else if (metamorphose) {
    metamorphose.OutOfMemoryError = OutOfMemoryError;
}
})(typeof window !== 'undefined' && window.metamorphose);
