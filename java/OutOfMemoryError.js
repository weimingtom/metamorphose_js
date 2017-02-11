;(function(metamorphose) {

var OutOfMemoryError = function(str) {
    if (str === undefined) {
        str = "";
    }
	this.message = str;
};

OutOfMemoryError.prototype = new Error();

if (typeof module !== 'undefined') {
    module.exports = OutOfMemoryError;
} else if (metamorphose) {
    metamorphose.OutOfMemoryError = OutOfMemoryError;
}
})(typeof window !== 'undefined' && window.metamorphose);
