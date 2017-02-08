var Runtime = function() {

}

Runtime._instance = new Runtime();

Runtime.getRuntime = function() {
    return Runtime._instance;
};

Runtime.prototype.totalMemory() {
    return flash.system.System.totalMemory;
}

Runtime.prototype.freeMemory = function() {
    console.log("Runtime.freeMemory() not implement");
    return 0;
};

module.exports = Runtime;
