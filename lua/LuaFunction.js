;(function(metamorphose) {

var NullPointerException = metamorphose ? metamorphose.NullPointerException : require('../java/NullPointerException.js');
var IllegalArgumentException = metamorphose ? metamorphose.IllegalArgumentException : require('../java/IllegalArgumentException.js');

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/LuaFunction.java#1 $
 * Copyright (c) 2006 Nokia Corporation and/or its subsidiary(-ies).
 * All rights reserved.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject
 * to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR
 * ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

//see jillcode(Java Implementation of Lua Language, Jill):
//	http://code.google.com/p/jillcode/
//这里的代码移植自jillcode(Lua的Java实现，Jill):
//	http://code.google.com/p/jillcode/	

/**
* Models a Lua function.
* Note that whilst the class is public, its constructors are not.
* Functions are created by loading Lua chunks (in source or binary
* form) or executing Lua code which defines functions (and, for
* example, places them in the global table).  {@link
* Lua#load(InputStream, String) Lua.load} is used
* to load a Lua chunk (it returns a <code>LuaFunction</code>),
* and {@link Lua#call Lua.call} is used to call a function.
*/
/**
 * Constructs an instance from a triple of {Proto, upvalues,
 * environment}.  Deliberately not public, See {@link
 * Lua#load(InputStream, String) Lua.load} for
 * public construction.  All arguments are referenced from the
 * instance.  The <code>upval</code> array must have exactly the same
 * number of elements as the number of upvalues in <code>proto</code>
 * (the value of the <code>nups</code> parameter in the
 * <code>Proto</code> constructor).
 *
 * @param proto  A Proto object.
 * @param upval  Array of upvalues.
 * @param env    The function's environment.
 * @throws NullPointerException if any arguments are null.
 * @throws IllegalArgumentsException if upval.length is wrong.
 */
var LuaFunction = function(proto, upval, env) {
    if (null == proto || null == upval || null == env) {
        throw new NullPointerException();
    }
    if (upval.length != proto.nups) {
        throw new IllegalArgumentException();
    }
    this._p = proto;
    this._upval = upval;
    this._env = env;
};

/** Get nth UpVal. */
LuaFunction.prototype.upVal = function(n) {
    return this._upval[n];
};

/** Get the Proto object. */
LuaFunction.prototype.getProto = function() {
    return this._p;
};

/** Getter for environment. */
LuaFunction.prototype.getEnv = function() {
    return this._env;
};

/** Setter for environment. */
LuaFunction.prototype.setEnv = function(env) {
    if (null == env) {
        throw new NullPointerException();
    }
    this.env = env;
};

if (typeof module !== 'undefined') {
    module.exports = LuaFunction;
} else if (metamorphose) {
    metamorphose.LuaFunction = LuaFunction;
}
})(typeof window !== 'undefined' && window.metamorphose);

