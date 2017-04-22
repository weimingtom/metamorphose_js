;(function(metamorphose) {

var Lua = metamorphose ? metamorphose.Lua : require("./lua/Lua.js");
var PackageLib = metamorphose ? metamorphose.PackageLib : require("./lua/PackageLib.js");
var MathLib = metamorphose ? metamorphose.MathLib : require("./lua/MathLib.js");
var BaseLib = metamorphose ? metamorphose.BaseLib : require("./lua/BaseLib.js");
var OSLib = metamorphose ? metamorphose.OSLib : require("./lua/OSLib.js");
var TableLib = metamorphose ? metamorphose.TableLib : require("./lua/TableLib.js");
var StringLib = metamorphose ? metamorphose.StringLib : require("./lua/StringLib.js");

function trace(s) {
    if (typeof document !== 'undefined' && document) {
        document.write(s.replace(/\n/g, '<br>'));
        document.write('<br>');
    }
    console.log(s);
}

var test001 = "n = 99 + (1 * 10) / 2 - 0.5;\n" +
    "if n > 10 then return 'Oh, 真的比10还大哦:'..n end\n" +
    "return n\n";
var test002 = "return _VERSION";
var test003 = "return nil";

var isLoadLib = true;
try {
    trace("Start test...");
    var L = new Lua();
    if (isLoadLib) {
        BaseLib.open(L);
        PackageLib.open(L);
        MathLib.open(L);
        OSLib.open(L);
        StringLib.open(L);
        TableLib.open(L);
    }
    var status = L.doString(test003); //FIXME:modify here : test001/test002/test003
    if (status != 0) {
        var errObj = L.value(1);
        var tostring = L.getGlobal("tostring");
        L.pushObject(tostring);
        L.pushObject(errObj);
        L.call(1, 1);
        var errObjStr = L.toString(L.value(-1));
        throw new Error("Error compiling : " + L.value(1));
    } else {
        var result = L.value(1);
        var tostring_ = L.getGlobal("tostring");
        L.pushObject(tostring_);
        L.pushObject(result);
        L.call(1, 1); // call BaseLib.tostring = function() {...}
        var resultStr = L.toString(L.value(-1));
        trace("Result >>> " + resultStr);
    }
} catch (e) {
    //trace(e.getStackTrace()); //FIXME:
    trace(e.stack);
}

})(typeof window !== 'undefined' && window.metamorphose);
