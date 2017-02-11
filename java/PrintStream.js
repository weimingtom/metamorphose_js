;(function(metamorphose) {

var PrintStream = function() {
    this.init();
};

PrintStream.OutputArr = null;

PrintStream.init = function() {
    PrintStream.OutputArr = new Array();
    PrintStream.OutputArr.push("");
};

//TODO:
PrintStream.prototype.print = function(str) {
    PrintStream.OutputArr[PrintStream.OutputArr.length - 1] += str;
    console.log(str);
};

//TODO:
PrintStream.prototype.println = function() {
    PrintStream.OutputArr.push("");
    console.log("\n");
};

if (typeof module !== 'undefined') {
    module.exports = PrintStream;
} else if (metamorphose) {
    metamorphose.PrintStream = PrintStream;
}
})(typeof window !== 'undefined' && window.metamorphose);
