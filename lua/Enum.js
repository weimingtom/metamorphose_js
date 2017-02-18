;(function(metamorphose) {

//var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/Syntax.java#1 $
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
var Enum = function(t, e) {
    this._t = t;
    this._i = 0;        // = 0
    this._e = null;
	this.inci();
};

Enum.prototype.inci = function() {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    while (this._i < this._t.sizeArray && this._t.array[this._i] == Lua.NIL) {
        ++this._i;
    }
};

Enum.prototype.hasMoreElements = function() {
    if (this._i < this._t.sizeArray) {
        return true;
    }
    return this._e.hasMoreElements();
};

Enum.prototype.nextElement = function() {
    var r;
    if (this._i < this._t.sizeArray) {
        ++this._i;      // array index i corresponds to key i+1
        r = Number(this._i); //FIXME:new Number
        this.inci();
    } else {
        r = this._e.nextElement();
    }
    return r;
};

if (typeof module !== 'undefined') {
    module.exports = Enum;
} else if (metamorphose) {
    metamorphose.Enum = Enum;
}
})(typeof window !== 'undefined' && window.metamorphose);

