;(function(metamorphose) {

var NumberFormatException = function(str) {
    if (str === undefined) {
        str = "";
    }
	this.message = str;
};

NumberFormatException.prototype = new Error();

if (typeof module !== 'undefined') {
    module.exports = NumberFormatException;
} else if (metamorphose) {
    metamorphose.NumberFormatException = NumberFormatException;
}
})(typeof window !== 'undefined' && window.metamorphose);
