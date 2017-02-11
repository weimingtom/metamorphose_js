;(function(metamorphose) {

var IllegalArgumentException = function(str) {
    if (str === undefined) {
        str = "";
    }
	this.message = str;
};

IllegalArgumentException.prototype = new Error();

if (typeof module !== 'undefined') {
    module.exports = IllegalArgumentException;
} else if (metamorphose) {
    metamorphose.IllegalArgumentException = IllegalArgumentException;
}
})(typeof window !== 'undefined' && window.metamorphose);
