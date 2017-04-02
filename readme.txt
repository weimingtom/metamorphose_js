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
(-)
-----------------------

todo:
e.getStackTrace()->e.stack
as int->parseInt()
