;(function(metamorphose) {

var IOException = function(str) {
    if (str === undefined) {
        str = "";
    }
	this.message = str;
};

IOException.prototype = new Error();

if (typeof module !== 'undefined') {
    module.exports = IOException;
} else if (metamorphose) {
    metamorphose.IOException = IOException;
}
})(typeof window !== 'undefined' && window.metamorphose);
