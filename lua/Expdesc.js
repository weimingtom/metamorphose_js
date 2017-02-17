;(function(metamorphose) {
var FuncState = metamorphose ? metamorphose.FuncState : require('./FuncState.js');

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/Expdesc.java#1 $
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

/** Equivalent to struct expdesc. */
var Expdesc = function() {
    this._k = 0; // one of V* enums above
    this._info = 0;
    this._aux = 0;
    this._nval = 0.0;
    this._t = 0;
    this._f = 0;
};

Expdesc.VVOID = 0;           // no value
Expdesc.VNIL = 1;
Expdesc.VTRUE = 2;
Expdesc.VFALSE = 3;
Expdesc.VK = 4;              // info = index into 'k'
Expdesc.VKNUM = 5;           // nval = numerical value
Expdesc.VLOCAL = 6;          // info = local register
Expdesc.VUPVAL = 7;          // info = index into 'upvalues'
Expdesc.VGLOBAL = 8;         // info = index of table;
                                         // aux = index of global name in 'k'
Expdesc.VINDEXED = 9;        // info = table register
                                         // aux = index register (or 'k')
Expdesc.VJMP = 10;           // info = instruction pc
Expdesc.VRELOCABLE = 11;     // info = instruction pc
Expdesc.VNONRELOC = 12;      // info = result register
Expdesc.VCALL = 13;          // info = instruction pc
Expdesc.VVARARG = 14;        // info = instruction pc

//public function Expdesc(k:int, i:int):void
//{
    //init(k, i);
//}

/** Equivalent to init_exp from lparser.c */
Expdesc.prototype.init = function(kind, i) {
    this._t = FuncState.NO_JUMP;
    this._f = FuncState.NO_JUMP;
    this._k = kind;
    this._info = i;
};

Expdesc.prototype.copy = function(e) {
    // Must initialise all members of this.
    this._k = e._k;
    this._info = e._info;
    this._aux = e._aux;
    this._nval = e._nval;
    this._t = e._t;
    this._f = e._f;
};

Expdesc.prototype.getKind = function(){
    return this._k;
};

Expdesc.prototype.setKind = function(kind) {
    this._k = kind;
};

Expdesc.prototype.getK = function() {
    return this._k;
};

Expdesc.prototype.setK = function(kind) {
    this._k = kind;
};

Expdesc.prototype.getInfo = function() {
    return this._info;
};

Expdesc.prototype.setInfo = function(i) {
    this._info = i;
};

Expdesc.prototype.getAux = function() {
    return this._aux;
};

Expdesc.prototype.setAux = function(aux) {
    this._aux = aux;
};

Expdesc.prototype.getNval = function() {
    return this._nval;
};

Expdesc.prototype.setNval = function(d) {
    this._nval = d;
};

/** Equivalent to hasmultret from lparser.c */
Expdesc.prototype.hasmultret = function() {
    return this._k == Expdesc.VCALL || this._k == Expdesc.VVARARG;
};

/** Equivalent to hasjumps from lcode.c. */
Expdesc.prototype.hasjumps = function() {
    return this._t != this._f;
};

Expdesc.prototype.nonreloc = function(i) {
    this._k = Expdesc.VNONRELOC;
    this._info = i;
};

Expdesc.prototype.reloc = function(i) {
    this._k = Expdesc.VRELOCABLE;
    this._info = i;
};

Expdesc.prototype.upval = function(i) {
    this._k = Expdesc.VUPVAL;
    this._info = i;
};

//新增
Expdesc.prototype.getF = function(){
    return this._f;
};

//新增
Expdesc.prototype.setF = function(f) {
    this._f = f;
};

//新增
Expdesc.prototype.getT = function() {
    return this._t;
};

//新增
Expdesc.prototype.setT = function(t) {
    this._t = t;
};

if (typeof module !== 'undefined') {
    module.exports = Expdesc;
} else if (metamorphose) {
    metamorphose.Expdesc = Expdesc;
}
})(typeof window !== 'undefined' && window.metamorphose);

