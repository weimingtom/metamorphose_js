;(function(metamorphose) {
var Expdesc = metamorphose ? metamorphose.Expdesc : require("./Expdesc.js");

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

var ConsControl = function(t) {
    this.v = new Expdesc() ;  /* last list item read */
    this.t = t;  /* table descriptor */
    this.nh = 0;  /* total number of `record' elements */
    this.na = 0;  /* total number of array elements */
    this.tostore = 0;  /* number of array elements pending to be stored */    
};

if (typeof module !== 'undefined') {
    module.exports = ConsControl;
} else if (metamorphose) {
    metamorphose.ConsControl = ConsControl;
}
})(typeof window !== 'undefined' && window.metamorphose);
