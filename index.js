;(function(metamorphose) {

var ByteArrayOutputStream = metamorphose ? metamorphose.ByteArrayOutputStream : require('./java/ByteArrayOutputStream.js');
var Calendar = metamorphose ? metamorphose.Calendar : require('./java/Calendar.js');
var Character = metamorphose ? metamorphose.Character : require('./java/Character.js');
var DataOutputStream = metamorphose ? metamorphose.DataOutputStream : require('./java/DataOutputStream.js');
    
var Slot = metamorphose ? metamorphose.Slot : require('./lua/Slot.js');
var UpVal = metamorphose ? metamorphose.UpVal : require('./lua/UpVal.js');

var byteArrayOutputStream = new ByteArrayOutputStream();
var canlendar = new Calendar();
var character = new Character();
var dataOutputStream = new DataOutputStream();
    
//var upVal = new UpVal(123, new Slot());
var upVal = new UpVal(123, null);
console.log(upVal.getOffset());
upVal.close();

//console.log("upVal instanceof UpVal = " + (upVal instanceof UpVal));
    
})(typeof window !== 'undefined' && window.metamorphose);
