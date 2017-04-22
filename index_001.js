;(function(metamorphose) {

var SystemUtil = metamorphose ? metamorphose.ByteArrayOutputStream : require('./java/SystemUtil.js');
var LuaTable = metamorphose ? metamorphose.ByteArrayOutputStream : require('./lua/LuaTable.js');

var t = new LuaTable();    

console.log(t._dic);
    
SystemUtil.arraycopy({}, 0, {}, 0, 1);

})(typeof window !== 'undefined' && window.metamorphose);
