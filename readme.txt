------------------------

() Lua.as
() Syntax.as
() FuncState.as
() BaseLib.as
() MatchState.as
() LuaTable.as
() Loader.as
() Proto.as
() StringLib.as
() FormatItem.as
() PackageLib.as
() OSLib.as
() TableLib.as
() MathLib.as

========================

DumpState.as
Expdesc.as
UpVal.as
LuaInternal.as
LuaFunction.as
CallInfo.as
Debug.as
BaseLibReader.as
Slot.as
LuaUserdata.as
StringReader.as
DumpedInput.as
FromReader.as
Enum.as
LocVar.as
LuaJavaCallback.as
LHSAssign.as
BlockCnt.as
ConsControl.as
LuaError.as
Hook.as

-------------------------

DataOutputStream.as
Calendar.as
StringBuffer.as
InputStreamReader.as
Stack.as
InputStream.as
Reader.as
OutputStream.as
Hashtable.as
ByteArrayOutputStream.as
TimeZone.as
SystemUtil.as
HashtableEnum.as
Character.as
Runtime.as
PrintStream.as
MathUtil.as
Random.as
IllegalArgumentException.as
NullPointerException.as
NumberFormatException.as
OutOfMemoryError.as
RuntimeException.as
IOException.as
Enumeration.as

-----------------------

int.MAX_VALUE -> Number.MAX_SAFE_INTEGER

-----------------------

FuncState (over)

-----------------------
jscheck:
(x) BlockCnt/ConsControl constructor ending is file end
(x) Proto.->newProto.
(X) LuaTable.remove->base class
(x) getQualifiedClassName -> Object.getPrototypeOf

-----------------------
getter, setter:
(java search: function set )
(x) Expdesc
...
(x) MatchState
(x) Proto
(x) Slot
(x)     set r
(x)     set d
(x) UpVal
(java search: function get )
(x) Expdesc function get t()
(x) FuncState function get actvar()
(x) LuaFunction function get env()
(-) Proto
    (x) source
    (x) linedefined
    (x) nups
    (x) code
    (x) locvars
    (x) sizeupvalues
(x) ...
-----------------------

todo:
e.getStackTrace()->e.stack
as int->parseInt()
r = Number(this._i); //FIXME:new Number
xx].xxx -> xx] as xxx).getXXX


-----------------------

javascript specific : 

if (o instanceof Number) {
if (o instanceof Boolean) {
if (o instanceof String) {
->
if (o instanceof Number || typeof(o) === 'number') {
if (o instanceof Boolean || typeof(o) === 'boolean') {
if (o instanceof String || typeof(o) === 'string') {
    
search instanceof Number/Boolean/String

------------------------
??????(no need?)
== Lua.NUMBER
->
=== Lua.NUMBER

== Lua.NIL
->
=== Lua.NIL

-------------------------
[TypeError: SystemUtil.arraycopy is not a function]
???(running nodejs error, couldn't search all)
require('./LuaJavaCallback.js');
->
require('xxxx');

required file not equal to var name


//console.log("arraycopyxxx 001"); //FIXME:
//console.log("arraycopyxxx 002"); //FIXME:
//console.log("arraycopyxxx 003"); //FIXME:
//console.log("arraycopyxxx 004"); //FIXME:
------------------------
