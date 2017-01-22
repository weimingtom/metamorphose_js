/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/BaseLibReader.java#1 $
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
* Extends {@link java.io.Reader} to create a Reader from a Lua
* function.  So that the <code>load</code> function from Lua's base
* library can be implemented.
*/
var BaseLibReader = function(L, f) {
    this._s = "";
    this._i = 0; // = 0;
    this._mark = -1;
    this._L = L;
    this._f = f;
};

BaseLibReader.prototype.close = function() {
    this._f = null;
};

BaseLibReader.prototype.mark = function(l) {
    if (l > 1) {
        throw new IOException("Readahead must be <= 1");
    }
    this._mark = this._i;
};

BaseLibReader.prototype.markSupported = function() {
    return true;
};

BaseLibReader.prototype.read = function() {
    if (this._i >= this._s.length) {
        this._L.pushObject(this._f);
        this._L.call(0, 1);
        if (Lua.isNil(this._L.value(-1))) {
            return -1;
        } else if(Lua.isString(this._L.value(-1))) {
            this._s = this._L.toString(this._L.value(-1));
            if (this._s.length == 0) {
                return -1;
            }
            if (this._mark == this._i) {
                this._mark = 0;
            } else {
                this._mark = -1;
            }
            this._i = 0;
        } else {
            this._L.error("reader function must return a string");
        }
    }
    return this._s.charCodeAt(this._i++);
};

BaseLibReader.prototype.readMultiBytes = function(cbuf, off, len) {
    var j = 0;  // loop index required after loop
    for (j = 0; j < len; ++j) {
        var c = read();
        if (c == -1) {
            if (j == 0) {
                return -1;
            } else {
                return j;
            }
        }
        cbuf[off + j] = c as uint;
    }
    return j;
};

BaseLibReader.prototype.reset() {
    if (this._mark < 0) {
        throw new IOException("reset() not supported now");
    }
    this._i = this._mark;
};

module.exports = BaseLibReader;
