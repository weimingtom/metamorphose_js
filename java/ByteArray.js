;(function(metamorphose) {

var ByteArray = function() {
    //FIXME:
};
    
ByteArray.prototype.clear = function() {
    //TODO:
};

ByteArray.prototype.writeBytes = function(b, off, len) {
    //TODO:
};

ByteArray.prototype.writeMultiByte = function(str, charset) {
    //TODO:
}; 

if (typeof module !== 'undefined') {
    module.exports = ByteArray;
} else if (metamorphose) {
    metamorphose.ByteArray = ByteArray;
}
})(typeof window !== 'undefined' && window.metamorphose);
