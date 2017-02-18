;(function(metamorphose) {

var IllegalArgumentException = function(str) {
    if (str === undefined) {
        str = "";
    }
	this.message = str;
    this._stackTrace = new Error(this.message).stack;
};

IllegalArgumentException.prototype = new Error();

IllegalArgumentException.prototype.getStackTrace = function() {
    //this._stackTrace = new Error(this.message).stack;
    return this._stackTrace;
};

if (typeof module !== 'undefined') {
    module.exports = IllegalArgumentException;
} else if (metamorphose) {
    metamorphose.IllegalArgumentException = IllegalArgumentException;
}
})(typeof window !== 'undefined' && window.metamorphose);
