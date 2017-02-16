;(function(metamorphose) {
var InputStreamReader = metamorphose ? metamorphose.InputStreamReader : require('../java/InputStreamReader.js');

var Loader = metamorphose ? metamorphose.Loader : require('./Loader.js');
var Syntax = metamorphose ? metamorphose.Syntax : require('./Syntax.js');
var FromReader = metamorphose ? metamorphose.FromReader : require('./FromReader.js');
var LuaFunction = metamorphose ? metamorphose.LuaFunction : require('./LuaFunction.js');
var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/LuaInternal.java#1 $
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
 * Class used to implement internal callbacks.  Currently there is only
 * one callback used, one that parses or loads a Lua chunk into binary
 * form.
 */
var LuaInternal = function() {
    this._stream = null;
    this._reader = null;
    this._chunkname = null;
};

LuaInternal.prototype.init1 = function(_in, chunkname) {
    this._stream = _in;
    this._chunkname = chunkname;
};

LuaInternal.prototype.init2 = function(_in, chunkname) {
    this._reader = _in;
    this._chunkname = chunkname;
};

LuaInternal.prototype.luaFunction = function(L) {
    try {
        var p = null;

        // In either the stream or the reader case there is a way of
        // converting the input to the other type.
        if (this._stream != null) {
            this._stream.mark(1);
            var c = this._stream.read();
            this._stream.reset();

            // Convert to Reader if looks like source code instead of
            // binary.
            if (c == Loader.HEADER[0]) {
                var l = new Loader(this._stream, this._chunkname);
                p = l.undump();
            } else {
                this._reader = new InputStreamReader(this._stream, "UTF-8");
                p = Syntax.parser(L, this._reader, this._chunkname);
            }
        } else {
            // Convert to Stream if looks like binary (dumped via
            // string.dump) instead of source code.
            if (this._reader.markSupported()) {
                this._reader.mark(1);
                var c2 = this._reader.read();
                this._reader.reset();
                if (c2 == Loader.HEADER[0]) {
                    this._stream = new FromReader(this._reader);
                    var l2 = new Loader(this._stream, this._chunkname);
                    p = l2.undump();
                } else {
                    p = Syntax.parser(L, this._reader, this._chunkname);
                }
            } else {
                p = Syntax.parser(L, this._reader, this._chunkname);
            }
        }
        //
        //new UpVal[0] : 
        //Error #1007: 尝试实例化的函数不是构造函数。
        //TypeError: Error #1007: Instantiation attempted on a non-constructor.
        //
        //L.push(new LuaFunction(p, new UpVal[0], L.getGlobals()));
        L.pushObject(new LuaFunction(p, new Array(), L.getGlobals()));
        return 1;
    } catch (e) {
        console.log(e);
        L.pushString("cannot read " + this._chunkname + ": " + e.toString());
        L.dThrow(Lua.ERRFILE);
        return 0;
    }
    //unreachable
    return 0;
};

if (typeof module !== 'undefined') {
    module.exports = LuaInternal;
} else if (metamorphose) {
    metamorphose.LuaInternal = LuaInternal;
}
})(typeof window !== 'undefined' && window.metamorphose);
