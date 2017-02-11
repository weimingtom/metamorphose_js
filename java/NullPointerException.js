;(function(metamorphose) {

var NullPointerException = function(str) {
    if (str === undefined) {
        str = "";
    }
	this.message = str;
};

NullPointerException.prototype = new Error();

if (typeof module !== 'undefined') {
    module.exports = NullPointerException;
} else if (metamorphose) {
    metamorphose.NullPointerException = NullPointerException;
}
})(typeof window !== 'undefined' && window.metamorphose);
