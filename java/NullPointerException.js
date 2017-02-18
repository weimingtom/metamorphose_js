;(function(metamorphose) {

var NullPointerException = function(str) {
    if (str === undefined) {
        str = "";
    }
	this.message = str;
    this._stackTrace = new Error(this.message).stack;
};

NullPointerException.prototype = new Error();

NullPointerException.prototype.getStackTrace = function() {
    //this._stackTrace = new Error(this.message).stack;
    return this._stackTrace;
};

if (typeof module !== 'undefined') {
    module.exports = NullPointerException;
} else if (metamorphose) {
    metamorphose.NullPointerException = NullPointerException;
}
})(typeof window !== 'undefined' && window.metamorphose);
