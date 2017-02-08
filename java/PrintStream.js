var PrintStream = function() {
    init();
};

PrintStream.OutputArr = null;

PrintStream.init = function() {
    OutputArr = new Array();
    OutputArr.push("");
};

//TODO:
PrintStream.prototype.print = function(str) {
    OutputArr[OutputArr.length - 1] += str;
    console.log(str);
};

//TODO:
PrintStream.prototype.println() {
    OutputArr.push("");
    console.log("\n");
};

module.exports = PrintStream;
