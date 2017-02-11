;(function(metamorphose) {

var Enumeration = function(){
};

Enumeration.prototype.hasMoreElements = function() {
    
};

Enumeration.prototype.nextElement = function() {
    
};

if (typeof module !== 'undefined') {
    module.exports = Enumeration;
} else if (metamorphose) {
    metamorphose.Enumeration = Enumeration;
}
})(typeof window !== 'undefined' && window.metamorphose);
