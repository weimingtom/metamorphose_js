;(function(metamorphose) {

var IOException = function(str) {
    if (str === undefined) {
        str = "";
    }
	this.message = str;
    this._stackTrace = new Error(this.message).stack;
};

IOException.prototype = new Error();

IOException.prototype.getStackTrace = function() {
    //this._stackTrace = new Error(this.message).stack;
    return this._stackTrace;
};

if (typeof module !== 'undefined') {
    module.exports = IOException;
} else if (metamorphose) {
    metamorphose.IOException = IOException;
}
})(typeof window !== 'undefined' && window.metamorphose);
