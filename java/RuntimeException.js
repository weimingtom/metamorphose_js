;(function(metamorphose) {

var RuntimeException = function(str) {
    if (str === undefined) {
        str = "";
    }
	this.message = str;
};

RuntimeException.prototype = new Error();

if (typeof module !== 'undefined') {
    module.exports = RuntimeException;
} else if (metamorphose) {
    metamorphose.RuntimeException = RuntimeException;
}
})(typeof window !== 'undefined' && window.metamorphose);
