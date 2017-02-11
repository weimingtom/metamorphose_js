;(function(metamorphose) {

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/LocVar.java#1 $
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

var LocVar = function() {
    this._varname = null;
    this._startpc = 0;
    this._endpc = 0;
};

LocVar.prototype.init = function(varname, startpc, endpc) {
    this._varname = varname;
    this._startpc = startpc;
    this._endpc = endpc;
};

//新增
LocVar.prototype.getVarname = function() {
    return this._varname;
};

//新增
LocVar.prototype.setVarname = function(varname) {
    this._varname = varname;
};

//新增
LocVar.prototype.getStartpc = function() {
    return this._startpc;
};

//新增
LocVar.prototype.setStartpc = function(startpc) {
    this._startpc = startpc;
};

//新增
LocVar.prototype.getEndpc = function() {
    return this._endpc;
};

//新增
LocVar.prototype.setEndpc = function(endpc) {
    this._endpc = endpc;
};

if (typeof module !== 'undefined') {
    module.exports = LocVar;
} else if (metamorphose) {
    metamorphose.LocVar = LocVar;
}
})(typeof window !== 'undefined' && window.metamorphose);

