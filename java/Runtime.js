;(function(metamorphose) {

var Runtime = function() {

};

Runtime._instance = new Runtime();

Runtime.getRuntime = function() {
    return Runtime._instance;
};

Runtime.prototype.totalMemory = function() {
    return flash.system.System.totalMemory;
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
