/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/CallInfo.java#1 $
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
/** Only used to create the first instance. */
var CallInfo = function() {
    this._savedpc = 0;
    this._func = 0;
    this._base = 0;
    this._top = 0;
    this._nresults = 0;
    this._tailcalls = 0;
};

/**
 * @param func  stack index of function
 * @param base  stack base for this frame
 * @param top   top-of-stack for this frame
 * @param nresults  number of results expected by caller
 */
CallInfo.prototype.init = function(func, base, top, nresults) {
    this._func = func;
    this._base = base;
    this._top = top;
    this._nresults = nresults;
};

/** Setter for savedpc. */
CallInfo.prototype.setSavedpc = function(pc) {
    this._savedpc = pc;
};

/** Getter for savedpc. */
CallInfo.prototype.getSavedpc = function() {
    return this._savedpc;
};

/**
 * Get the stack index for the function object for this record.
 */
CallInfo.prototype.getFunc = function() {
    return this._func;
};

/**
 * Get stack index where results should end up.  This is an absolute
 * stack index, not relative to L.base.
 */
CallInfo.prototype.res = function() {
    // Same location as function.
    return this._func;
};

/**
 * Get stack base for this record.
 */
CallInfo.prototype.getBase = function() {
    return this._base;
};

/**
 * Get top-of-stack for this record.  This is the number of elements
 * in the stack (or will be when the function is resumed).
 */
CallInfo.prototype.getTop = function() {
    return this._top;
};

/**
 * Setter for top.
 */
CallInfo.prototype.setTop = function(top) {
    this._top = top;
};

/**
 * Get number of results expected by the caller of this function.
 * Used to adjust the returned results to the correct number.
 */
CallInfo.prototype.getNresults = function() {
    return this._nresults;
};

/**
 * Get number of tailcalls
 */
CallInfo.prototype.getTailcalls = function() {
    return this._tailcalls;
};

/**
 * Used during tailcall to set the base and top members.
 */
CallInfo.prototype.tailcall = function(baseArg, topArg) {
    this._base = baseArg;
    this._top = topArg;
    ++this._tailcalls;
};

module.exports = CallInfo;
