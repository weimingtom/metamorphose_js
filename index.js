;(function(metamorphose) {

var Slot = metamorphose ? metamorphose.Slot : require('./lua/Slot.js');
var UpVal = metamorphose ? metamorphose.UpVal : require('./lua/UpVal.js');

//var upVal = new UpVal(123, new Slot());
var upVal = new UpVal(123, null);
console.log(upVal.getOffset());
upVal.close();

console.log("upVal instanceof UpVal = " + (upVal instanceof UpVal));
    
})(typeof window !== 'undefined' && window.metamorphose);
