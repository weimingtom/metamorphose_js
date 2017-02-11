;(function(metamorphose) {
/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/BlockCnt.java#1 $
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
var Slot = function() {
	this._r = null;
	this._d = 0;
};
		
Slot.prototype.init1 = function(s) {
    this._r = s._r;
    this._d = s._d;
};

//TODO:
Slot.prototype.init2 = function(o) {
    this.setObject(o);
};
		
Slot.prototype.asObject = function() {
    if (this._r == Lua.NUMBER) {
        return new Number(this._d);
    }
    return this._r;
};

Slot.prototype.setObject = function(o) {
    //trace("setObject:", o.toString());
    this._r = o;
    if (typeof(o) === "number") {
        this._r = Lua.NUMBER;
        this._d = (Number)(o);
    }
};

//新增
Slot.prototype.setR = function(r) {
    this._r = r;
};
		
//新增
Slot.prototype.getR = function() {
    return this._r;
};
		
//新增
Slot.prototype.setD = function(d) {
    this._d = d;
};

//新增
Slot.prototype.getD = function() {
    return this._d;
};


if (typeof module !== 'undefined') {
    module.exports = Slot;
} else if (metamorphose) {
    metamorphose.Slot = Slot;
}
})(typeof window !== 'undefined' && window.metamorphose);
