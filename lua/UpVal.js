/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/UpVal.java#1 $
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
 * Models an upvalue.  This class is internal to Jill and should not be
 * used by clients.
 * This is the analogue of the UpVal type in PUC-Rio's Lua
 * implementation, hence the name.
 * An UpVal instance is a reference to a variable.
 * When initially created generally the variable is kept on the VM
 * stack.  When the function that defines that variable returns, the
 * corresponding stack slots are destroyed.  In order that the UpVal
 * continues to reference the variable, it is closed (using the
 * <code>close</code> method).  Lua functions that reference, via an
 * upvalue, the same instance of the same variable, will share an
 * <code>UpVal</code> (somewhere in their <code>upval</code> array
 * member); hence they share updates to the variable.
 */

var Slot = require("./Slot.js");

//http://www.cnblogs.com/dolphinX/p/3485260.html
//http://www.ruanyifeng.com/blog/2010/05/object-oriented_javascript_encapsulation.html
var UpVal = function(offset, s) {
    this._offset = offset;
    this._s = null;
};

/**
 * Getter for underlying value.
 */
UpVal.prototype.getValue = function() {
    return this._s.asObject();
};

/**
 * Setter for underlying value.
 */
UpVal.prototype.setValue = function(o) {
    this._s.setObject(o);
};

/**
 * The offset.
 */
UpVal.prototype.getOffset = function() {
    return this._offset;
};

/**
 * Closes an UpVal.  This ensures that the storage operated on by
 * {@link #getValue() getValue} and {@link #setValue(Object) setValue}
 * is not shared by any other object.
 * This is typically used when a function returns (executes
 * the <code>OP_RET</code> VM instruction).  Effectively this
 * transfers a variable binding from the stack to the heap.
 */
UpVal.prototype.close = function() {
    this._s = new Slot();
    this._s.init1(this._s); //TODO:
    this._offset = -1;
};

module.exports = UpVal;
