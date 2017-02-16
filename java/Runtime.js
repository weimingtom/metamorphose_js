;(function(metamorphose) {

var Runtime = function() {

};

Runtime._instance = new Runtime();

Runtime.getRuntime = function() {
    return Runtime._instance;
};

Runtime.prototype.totalMemory = function() {
    return 0; //FIXME:
};

Runtime.prototype.freeMemory = function() {
    console.log("Runtime.freeMemory() not implement");
    return 0;
};

if (typeof module !== 'undefined') {
    module.exports = Runtime;
} else if (metamorphose) {
    metamorphose.Runtime = Runtime;
}
})(typeof window !== 'undefined' && window.metamorphose);
