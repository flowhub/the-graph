(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.TheGraph = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

// Module object
var TheGraph = {};

// Bundle and expose fbp-graph as public API
TheGraph.fbpGraph = require('fbp-graph');

// Pull in Ease from NPM, react.animate needs it as a global
TheGraph.Ease = require('ease-component');
if (typeof window !== 'undefined' && typeof window.Ease === 'undefined') {
    window.Ease = TheGraph.Ease;
}

var defaultNodeSize = 72;
var defaultNodeRadius = 8;

var moduleVars = {
  // Context menus
  contextPortSize: 36,
  // Zoom breakpoints
  zbpBig: 1.2,
  zbpNormal: 0.4,
  zbpSmall: 0.01,
  config: {
    nodeSize: defaultNodeSize,
    nodeWidth: defaultNodeSize,
    nodeRadius: defaultNodeRadius,
    nodeHeight: defaultNodeSize,
    autoSizeNode: true,
    maxPortCount: 9,
    nodeHeightIncrement: 12,
    focusAnimationDuration: 1500
  },
};
for (var key in moduleVars) {
  TheGraph[key] = moduleVars[key];
}

if (typeof window !== 'undefined') {
  // rAF shim
  window.requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame;
}

// HACK, goes away when everything is CommonJS compatible
var g = { TheGraph: TheGraph };

TheGraph.factories = require('./the-graph/factories.js');
TheGraph.merge = require('./the-graph/merge.js');

require("./the-graph/the-graph-app.js").register(g);
require("./the-graph/the-graph-graph.js").register(g);
require("./the-graph/the-graph-node.js").register(g);
require("./the-graph/the-graph-node-menu.js").register(g);
require("./the-graph/the-graph-node-menu-port.js").register(g);
require("./the-graph/the-graph-node-menu-ports.js").register(g);
require("./the-graph/the-graph-port.js").register(g);
require("./the-graph/the-graph-edge.js").register(g);
require("./the-graph/the-graph-iip.js").register(g);
require("./the-graph/the-graph-group.js").register(g);

TheGraph.menu = require("./the-graph/the-graph-menu.js");
// compat
TheGraph.Menu = TheGraph.menu.Menu;
TheGraph.factories.menu = TheGraph.menu.factories;
TheGraph.config.menu = TheGraph.menu.config;
TheGraph.config.menu.iconRect.rx = TheGraph.config.nodeRadius;
TheGraph.config.menu.iconRect.ry = TheGraph.config.nodeRadius;

TheGraph.modalbg = require("./the-graph/the-graph-modalbg.js");
// compat
TheGraph.ModalBG = TheGraph.modalbg.ModalBG;
TheGraph.config.ModalBG = TheGraph.config.factories;
TheGraph.factories.ModalBG = TheGraph.modalbg.factories;

TheGraph.FONT_AWESOME = require("./the-graph/font-awesome-unicode-map.js");

var geometryutils = require('./the-graph/geometryutils');
// compat
TheGraph.findMinMax = geometryutils.findMinMax;
TheGraph.findNodeFit = geometryutils.findNodeFit;
TheGraph.findFit = geometryutils.findFit;

TheGraph.tooltip = require("./the-graph/the-graph-tooltip.js");
// compat
TheGraph.Tooltip = TheGraph.tooltip.Tooltip;
TheGraph.config.tooltip = TheGraph.tooltip.config;
TheGraph.factories.tooltip = TheGraph.tooltip.factories; 

TheGraph.mixins = require("./the-graph/mixins.js");
TheGraph.arcs = require('./the-graph/arcs.js');

TheGraph.TextBG = require('./the-graph/TextBG.js');
TheGraph.SVGImage = require('./the-graph/SVGImage.js');

TheGraph.thumb = require('./the-graph-thumb/the-graph-thumb.js');

TheGraph.nav = require('./the-graph-nav/the-graph-nav.js');

TheGraph.autolayout = require('./the-graph/the-graph-autolayout.js');
TheGraph.library = require('./the-graph/the-graph-library.js');

TheGraph.clipboard = require("./the-graph-editor/clipboard.js");
TheGraph.editor = require('./the-graph-editor/menus.js');

module.exports = TheGraph;

},{"./the-graph-editor/clipboard.js":18,"./the-graph-editor/menus.js":19,"./the-graph-nav/the-graph-nav.js":20,"./the-graph-thumb/the-graph-thumb.js":21,"./the-graph/SVGImage.js":22,"./the-graph/TextBG.js":23,"./the-graph/arcs.js":24,"./the-graph/factories.js":25,"./the-graph/font-awesome-unicode-map.js":26,"./the-graph/geometryutils":27,"./the-graph/merge.js":29,"./the-graph/mixins.js":30,"./the-graph/the-graph-app.js":31,"./the-graph/the-graph-autolayout.js":32,"./the-graph/the-graph-edge.js":33,"./the-graph/the-graph-graph.js":34,"./the-graph/the-graph-group.js":35,"./the-graph/the-graph-iip.js":36,"./the-graph/the-graph-library.js":37,"./the-graph/the-graph-menu.js":38,"./the-graph/the-graph-modalbg.js":39,"./the-graph/the-graph-node-menu-port.js":40,"./the-graph/the-graph-node-menu-ports.js":41,"./the-graph/the-graph-node-menu.js":42,"./the-graph/the-graph-node.js":43,"./the-graph/the-graph-port.js":44,"./the-graph/the-graph-tooltip.js":45,"ease-component":6,"fbp-graph":8}],2:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],3:[function(require,module,exports){

},{}],4:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":2,"ieee754":14,"isarray":15}],5:[function(require,module,exports){
(function (Buffer){
var clone = (function() {
'use strict';

function _instanceof(obj, type) {
  return type != null && obj instanceof type;
}

var nativeMap;
try {
  nativeMap = Map;
} catch(_) {
  // maybe a reference error because no `Map`. Give it a dummy value that no
  // value will ever be an instanceof.
  nativeMap = function() {};
}

var nativeSet;
try {
  nativeSet = Set;
} catch(_) {
  nativeSet = function() {};
}

var nativePromise;
try {
  nativePromise = Promise;
} catch(_) {
  nativePromise = function() {};
}

/**
 * Clones (copies) an Object using deep copying.
 *
 * This function supports circular references by default, but if you are certain
 * there are no circular references in your object, you can save some CPU time
 * by calling clone(obj, false).
 *
 * Caution: if `circular` is false and `parent` contains circular references,
 * your program may enter an infinite loop and crash.
 *
 * @param `parent` - the object to be cloned
 * @param `circular` - set to true if the object to be cloned may contain
 *    circular references. (optional - true by default)
 * @param `depth` - set to a number if the object is only to be cloned to
 *    a particular depth. (optional - defaults to Infinity)
 * @param `prototype` - sets the prototype to be used when cloning an object.
 *    (optional - defaults to parent prototype).
 * @param `includeNonEnumerable` - set to true if the non-enumerable properties
 *    should be cloned as well. Non-enumerable properties on the prototype
 *    chain will be ignored. (optional - false by default)
*/
function clone(parent, circular, depth, prototype, includeNonEnumerable) {
  if (typeof circular === 'object') {
    depth = circular.depth;
    prototype = circular.prototype;
    includeNonEnumerable = circular.includeNonEnumerable;
    circular = circular.circular;
  }
  // maintain two arrays for circular references, where corresponding parents
  // and children have the same index
  var allParents = [];
  var allChildren = [];

  var useBuffer = typeof Buffer != 'undefined';

  if (typeof circular == 'undefined')
    circular = true;

  if (typeof depth == 'undefined')
    depth = Infinity;

  // recurse this function so we don't reset allParents and allChildren
  function _clone(parent, depth) {
    // cloning null always returns null
    if (parent === null)
      return null;

    if (depth === 0)
      return parent;

    var child;
    var proto;
    if (typeof parent != 'object') {
      return parent;
    }

    if (_instanceof(parent, nativeMap)) {
      child = new nativeMap();
    } else if (_instanceof(parent, nativeSet)) {
      child = new nativeSet();
    } else if (_instanceof(parent, nativePromise)) {
      child = new nativePromise(function (resolve, reject) {
        parent.then(function(value) {
          resolve(_clone(value, depth - 1));
        }, function(err) {
          reject(_clone(err, depth - 1));
        });
      });
    } else if (clone.__isArray(parent)) {
      child = [];
    } else if (clone.__isRegExp(parent)) {
      child = new RegExp(parent.source, __getRegExpFlags(parent));
      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
    } else if (clone.__isDate(parent)) {
      child = new Date(parent.getTime());
    } else if (useBuffer && Buffer.isBuffer(parent)) {
      child = new Buffer(parent.length);
      parent.copy(child);
      return child;
    } else if (_instanceof(parent, Error)) {
      child = Object.create(parent);
    } else {
      if (typeof prototype == 'undefined') {
        proto = Object.getPrototypeOf(parent);
        child = Object.create(proto);
      }
      else {
        child = Object.create(prototype);
        proto = prototype;
      }
    }

    if (circular) {
      var index = allParents.indexOf(parent);

      if (index != -1) {
        return allChildren[index];
      }
      allParents.push(parent);
      allChildren.push(child);
    }

    if (_instanceof(parent, nativeMap)) {
      parent.forEach(function(value, key) {
        var keyChild = _clone(key, depth - 1);
        var valueChild = _clone(value, depth - 1);
        child.set(keyChild, valueChild);
      });
    }
    if (_instanceof(parent, nativeSet)) {
      parent.forEach(function(value) {
        var entryChild = _clone(value, depth - 1);
        child.add(entryChild);
      });
    }

    for (var i in parent) {
      var attrs;
      if (proto) {
        attrs = Object.getOwnPropertyDescriptor(proto, i);
      }

      if (attrs && attrs.set == null) {
        continue;
      }
      child[i] = _clone(parent[i], depth - 1);
    }

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(parent);
      for (var i = 0; i < symbols.length; i++) {
        // Don't need to worry about cloning a symbol because it is a primitive,
        // like a number or string.
        var symbol = symbols[i];
        var descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
        if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
          continue;
        }
        child[symbol] = _clone(parent[symbol], depth - 1);
        if (!descriptor.enumerable) {
          Object.defineProperty(child, symbol, {
            enumerable: false
          });
        }
      }
    }

    if (includeNonEnumerable) {
      var allPropertyNames = Object.getOwnPropertyNames(parent);
      for (var i = 0; i < allPropertyNames.length; i++) {
        var propertyName = allPropertyNames[i];
        var descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);
        if (descriptor && descriptor.enumerable) {
          continue;
        }
        child[propertyName] = _clone(parent[propertyName], depth - 1);
        Object.defineProperty(child, propertyName, {
          enumerable: false
        });
      }
    }

    return child;
  }

  return _clone(parent, depth);
}

/**
 * Simple flat clone using prototype, accepts only objects, usefull for property
 * override on FLAT configuration object (no nested props).
 *
 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
 * works.
 */
clone.clonePrototype = function clonePrototype(parent) {
  if (parent === null)
    return null;

  var c = function () {};
  c.prototype = parent;
  return new c();
};

// private utility functions

function __objToStr(o) {
  return Object.prototype.toString.call(o);
}
clone.__objToStr = __objToStr;

function __isDate(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Date]';
}
clone.__isDate = __isDate;

function __isArray(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Array]';
}
clone.__isArray = __isArray;

function __isRegExp(o) {
  return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
}
clone.__isRegExp = __isRegExp;

function __getRegExpFlags(re) {
  var flags = '';
  if (re.global) flags += 'g';
  if (re.ignoreCase) flags += 'i';
  if (re.multiline) flags += 'm';
  return flags;
}
clone.__getRegExpFlags = __getRegExpFlags;

return clone;
})();

if (typeof module === 'object' && module.exports) {
  module.exports = clone;
}

}).call(this,require("buffer").Buffer)
},{"buffer":4}],6:[function(require,module,exports){

// easing functions from "Tween.js"

exports.linear = function(n){
  return n;
};

exports.inQuad = function(n){
  return n * n;
};

exports.outQuad = function(n){
  return n * (2 - n);
};

exports.inOutQuad = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n;
  return - 0.5 * (--n * (n - 2) - 1);
};

exports.inCube = function(n){
  return n * n * n;
};

exports.outCube = function(n){
  return --n * n * n + 1;
};

exports.inOutCube = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n * n;
  return 0.5 * ((n -= 2 ) * n * n + 2);
};

exports.inQuart = function(n){
  return n * n * n * n;
};

exports.outQuart = function(n){
  return 1 - (--n * n * n * n);
};

exports.inOutQuart = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n * n * n;
  return -0.5 * ((n -= 2) * n * n * n - 2);
};

exports.inQuint = function(n){
  return n * n * n * n * n;
}

exports.outQuint = function(n){
  return --n * n * n * n * n + 1;
}

exports.inOutQuint = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n * n * n * n;
  return 0.5 * ((n -= 2) * n * n * n * n + 2);
};

exports.inSine = function(n){
  return 1 - Math.cos(n * Math.PI / 2 );
};

exports.outSine = function(n){
  return Math.sin(n * Math.PI / 2);
};

exports.inOutSine = function(n){
  return .5 * (1 - Math.cos(Math.PI * n));
};

exports.inExpo = function(n){
  return 0 == n ? 0 : Math.pow(1024, n - 1);
};

exports.outExpo = function(n){
  return 1 == n ? n : 1 - Math.pow(2, -10 * n);
};

exports.inOutExpo = function(n){
  if (0 == n) return 0;
  if (1 == n) return 1;
  if ((n *= 2) < 1) return .5 * Math.pow(1024, n - 1);
  return .5 * (-Math.pow(2, -10 * (n - 1)) + 2);
};

exports.inCirc = function(n){
  return 1 - Math.sqrt(1 - n * n);
};

exports.outCirc = function(n){
  return Math.sqrt(1 - (--n * n));
};

exports.inOutCirc = function(n){
  n *= 2
  if (n < 1) return -0.5 * (Math.sqrt(1 - n * n) - 1);
  return 0.5 * (Math.sqrt(1 - (n -= 2) * n) + 1);
};

exports.inBack = function(n){
  var s = 1.70158;
  return n * n * (( s + 1 ) * n - s);
};

exports.outBack = function(n){
  var s = 1.70158;
  return --n * n * ((s + 1) * n + s) + 1;
};

exports.inOutBack = function(n){
  var s = 1.70158 * 1.525;
  if ( ( n *= 2 ) < 1 ) return 0.5 * ( n * n * ( ( s + 1 ) * n - s ) );
  return 0.5 * ( ( n -= 2 ) * n * ( ( s + 1 ) * n + s ) + 2 );
};

exports.inBounce = function(n){
  return 1 - exports.outBounce(1 - n);
};

exports.outBounce = function(n){
  if ( n < ( 1 / 2.75 ) ) {
    return 7.5625 * n * n;
  } else if ( n < ( 2 / 2.75 ) ) {
    return 7.5625 * ( n -= ( 1.5 / 2.75 ) ) * n + 0.75;
  } else if ( n < ( 2.5 / 2.75 ) ) {
    return 7.5625 * ( n -= ( 2.25 / 2.75 ) ) * n + 0.9375;
  } else {
    return 7.5625 * ( n -= ( 2.625 / 2.75 ) ) * n + 0.984375;
  }
};

exports.inOutBounce = function(n){
  if (n < .5) return exports.inBounce(n * 2) * .5;
  return exports.outBounce(n * 2 - 1) * .5 + .5;
};

// aliases

exports['in-quad'] = exports.inQuad;
exports['out-quad'] = exports.outQuad;
exports['in-out-quad'] = exports.inOutQuad;
exports['in-cube'] = exports.inCube;
exports['out-cube'] = exports.outCube;
exports['in-out-cube'] = exports.inOutCube;
exports['in-quart'] = exports.inQuart;
exports['out-quart'] = exports.outQuart;
exports['in-out-quart'] = exports.inOutQuart;
exports['in-quint'] = exports.inQuint;
exports['out-quint'] = exports.outQuint;
exports['in-out-quint'] = exports.inOutQuint;
exports['in-sine'] = exports.inSine;
exports['out-sine'] = exports.outSine;
exports['in-out-sine'] = exports.inOutSine;
exports['in-expo'] = exports.inExpo;
exports['out-expo'] = exports.outExpo;
exports['in-out-expo'] = exports.inOutExpo;
exports['in-circ'] = exports.inCirc;
exports['out-circ'] = exports.outCirc;
exports['in-out-circ'] = exports.inOutCirc;
exports['in-back'] = exports.inBack;
exports['out-back'] = exports.outBack;
exports['in-out-back'] = exports.inOutBack;
exports['in-bounce'] = exports.inBounce;
exports['out-bounce'] = exports.outBounce;
exports['in-out-bounce'] = exports.inOutBounce;

},{}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],8:[function(require,module,exports){
exports.graph = require('./lib/Graph');
exports.Graph = exports.graph.Graph;

exports.journal = require('./lib/Journal');
exports.Journal = exports.journal.Journal;

},{"./lib/Graph":9,"./lib/Journal":10}],9:[function(require,module,exports){
(function() {
  var EventEmitter, Graph, clone, mergeResolveTheirsNaive, platform, resetGraph,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = require('events').EventEmitter;

  clone = require('clone');

  platform = require('./Platform');

  Graph = (function(superClass) {
    extend(Graph, superClass);

    Graph.prototype.name = '';

    Graph.prototype.caseSensitive = false;

    Graph.prototype.properties = {};

    Graph.prototype.nodes = [];

    Graph.prototype.edges = [];

    Graph.prototype.initializers = [];

    Graph.prototype.exports = [];

    Graph.prototype.inports = {};

    Graph.prototype.outports = {};

    Graph.prototype.groups = [];

    function Graph(name1, options) {
      this.name = name1 != null ? name1 : '';
      if (options == null) {
        options = {};
      }
      this.properties = {};
      this.nodes = [];
      this.edges = [];
      this.initializers = [];
      this.exports = [];
      this.inports = {};
      this.outports = {};
      this.groups = [];
      this.transaction = {
        id: null,
        depth: 0
      };
      this.caseSensitive = options.caseSensitive || false;
    }

    Graph.prototype.getPortName = function(port) {
      if (this.caseSensitive) {
        return port;
      } else {
        return port.toLowerCase();
      }
    };

    Graph.prototype.startTransaction = function(id, metadata) {
      if (this.transaction.id) {
        throw Error("Nested transactions not supported");
      }
      this.transaction.id = id;
      this.transaction.depth = 1;
      return this.emit('startTransaction', id, metadata);
    };

    Graph.prototype.endTransaction = function(id, metadata) {
      if (!this.transaction.id) {
        throw Error("Attempted to end non-existing transaction");
      }
      this.transaction.id = null;
      this.transaction.depth = 0;
      return this.emit('endTransaction', id, metadata);
    };

    Graph.prototype.checkTransactionStart = function() {
      if (!this.transaction.id) {
        return this.startTransaction('implicit');
      } else if (this.transaction.id === 'implicit') {
        return this.transaction.depth += 1;
      }
    };

    Graph.prototype.checkTransactionEnd = function() {
      if (this.transaction.id === 'implicit') {
        this.transaction.depth -= 1;
      }
      if (this.transaction.depth === 0) {
        return this.endTransaction('implicit');
      }
    };

    Graph.prototype.setProperties = function(properties) {
      var before, item, val;
      this.checkTransactionStart();
      before = clone(this.properties);
      for (item in properties) {
        val = properties[item];
        this.properties[item] = val;
      }
      this.emit('changeProperties', this.properties, before);
      return this.checkTransactionEnd();
    };

    Graph.prototype.addExport = function(publicPort, nodeKey, portKey, metadata) {
      var exported;
      if (metadata == null) {
        metadata = {
          x: 0,
          y: 0
        };
      }
      platform.deprecated('fbp-graph.Graph exports is deprecated: please use specific inport or outport instead');
      if (!this.getNode(nodeKey)) {
        return;
      }
      this.checkTransactionStart();
      exported = {
        "public": this.getPortName(publicPort),
        process: nodeKey,
        port: this.getPortName(portKey),
        metadata: metadata
      };
      this.exports.push(exported);
      this.emit('addExport', exported);
      return this.checkTransactionEnd();
    };

    Graph.prototype.removeExport = function(publicPort) {
      var exported, found, i, idx, len, ref;
      platform.deprecated('fbp-graph.Graph exports is deprecated: please use specific inport or outport instead');
      publicPort = this.getPortName(publicPort);
      found = null;
      ref = this.exports;
      for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
        exported = ref[idx];
        if (exported["public"] === publicPort) {
          found = exported;
        }
      }
      if (!found) {
        return;
      }
      this.checkTransactionStart();
      this.exports.splice(this.exports.indexOf(found), 1);
      this.emit('removeExport', found);
      return this.checkTransactionEnd();
    };

    Graph.prototype.addInport = function(publicPort, nodeKey, portKey, metadata) {
      if (!this.getNode(nodeKey)) {
        return;
      }
      publicPort = this.getPortName(publicPort);
      this.checkTransactionStart();
      this.inports[publicPort] = {
        process: nodeKey,
        port: this.getPortName(portKey),
        metadata: metadata
      };
      this.emit('addInport', publicPort, this.inports[publicPort]);
      return this.checkTransactionEnd();
    };

    Graph.prototype.removeInport = function(publicPort) {
      var port;
      publicPort = this.getPortName(publicPort);
      if (!this.inports[publicPort]) {
        return;
      }
      this.checkTransactionStart();
      port = this.inports[publicPort];
      this.setInportMetadata(publicPort, {});
      delete this.inports[publicPort];
      this.emit('removeInport', publicPort, port);
      return this.checkTransactionEnd();
    };

    Graph.prototype.renameInport = function(oldPort, newPort) {
      oldPort = this.getPortName(oldPort);
      newPort = this.getPortName(newPort);
      if (!this.inports[oldPort]) {
        return;
      }
      this.checkTransactionStart();
      this.inports[newPort] = this.inports[oldPort];
      delete this.inports[oldPort];
      this.emit('renameInport', oldPort, newPort);
      return this.checkTransactionEnd();
    };

    Graph.prototype.setInportMetadata = function(publicPort, metadata) {
      var before, item, val;
      publicPort = this.getPortName(publicPort);
      if (!this.inports[publicPort]) {
        return;
      }
      this.checkTransactionStart();
      before = clone(this.inports[publicPort].metadata);
      if (!this.inports[publicPort].metadata) {
        this.inports[publicPort].metadata = {};
      }
      for (item in metadata) {
        val = metadata[item];
        if (val != null) {
          this.inports[publicPort].metadata[item] = val;
        } else {
          delete this.inports[publicPort].metadata[item];
        }
      }
      this.emit('changeInport', publicPort, this.inports[publicPort], before);
      return this.checkTransactionEnd();
    };

    Graph.prototype.addOutport = function(publicPort, nodeKey, portKey, metadata) {
      if (!this.getNode(nodeKey)) {
        return;
      }
      publicPort = this.getPortName(publicPort);
      this.checkTransactionStart();
      this.outports[publicPort] = {
        process: nodeKey,
        port: this.getPortName(portKey),
        metadata: metadata
      };
      this.emit('addOutport', publicPort, this.outports[publicPort]);
      return this.checkTransactionEnd();
    };

    Graph.prototype.removeOutport = function(publicPort) {
      var port;
      publicPort = this.getPortName(publicPort);
      if (!this.outports[publicPort]) {
        return;
      }
      this.checkTransactionStart();
      port = this.outports[publicPort];
      this.setOutportMetadata(publicPort, {});
      delete this.outports[publicPort];
      this.emit('removeOutport', publicPort, port);
      return this.checkTransactionEnd();
    };

    Graph.prototype.renameOutport = function(oldPort, newPort) {
      oldPort = this.getPortName(oldPort);
      newPort = this.getPortName(newPort);
      if (!this.outports[oldPort]) {
        return;
      }
      this.checkTransactionStart();
      this.outports[newPort] = this.outports[oldPort];
      delete this.outports[oldPort];
      this.emit('renameOutport', oldPort, newPort);
      return this.checkTransactionEnd();
    };

    Graph.prototype.setOutportMetadata = function(publicPort, metadata) {
      var before, item, val;
      publicPort = this.getPortName(publicPort);
      if (!this.outports[publicPort]) {
        return;
      }
      this.checkTransactionStart();
      before = clone(this.outports[publicPort].metadata);
      if (!this.outports[publicPort].metadata) {
        this.outports[publicPort].metadata = {};
      }
      for (item in metadata) {
        val = metadata[item];
        if (val != null) {
          this.outports[publicPort].metadata[item] = val;
        } else {
          delete this.outports[publicPort].metadata[item];
        }
      }
      this.emit('changeOutport', publicPort, this.outports[publicPort], before);
      return this.checkTransactionEnd();
    };

    Graph.prototype.addGroup = function(group, nodes, metadata) {
      var g;
      this.checkTransactionStart();
      g = {
        name: group,
        nodes: nodes,
        metadata: metadata
      };
      this.groups.push(g);
      this.emit('addGroup', g);
      return this.checkTransactionEnd();
    };

    Graph.prototype.renameGroup = function(oldName, newName) {
      var group, i, len, ref;
      this.checkTransactionStart();
      ref = this.groups;
      for (i = 0, len = ref.length; i < len; i++) {
        group = ref[i];
        if (!group) {
          continue;
        }
        if (group.name !== oldName) {
          continue;
        }
        group.name = newName;
        this.emit('renameGroup', oldName, newName);
      }
      return this.checkTransactionEnd();
    };

    Graph.prototype.removeGroup = function(groupName) {
      var group, i, len, ref;
      this.checkTransactionStart();
      ref = this.groups;
      for (i = 0, len = ref.length; i < len; i++) {
        group = ref[i];
        if (!group) {
          continue;
        }
        if (group.name !== groupName) {
          continue;
        }
        this.setGroupMetadata(group.name, {});
        this.groups.splice(this.groups.indexOf(group), 1);
        this.emit('removeGroup', group);
      }
      return this.checkTransactionEnd();
    };

    Graph.prototype.setGroupMetadata = function(groupName, metadata) {
      var before, group, i, item, len, ref, val;
      this.checkTransactionStart();
      ref = this.groups;
      for (i = 0, len = ref.length; i < len; i++) {
        group = ref[i];
        if (!group) {
          continue;
        }
        if (group.name !== groupName) {
          continue;
        }
        before = clone(group.metadata);
        for (item in metadata) {
          val = metadata[item];
          if (val != null) {
            group.metadata[item] = val;
          } else {
            delete group.metadata[item];
          }
        }
        this.emit('changeGroup', group, before);
      }
      return this.checkTransactionEnd();
    };

    Graph.prototype.addNode = function(id, component, metadata) {
      var node;
      this.checkTransactionStart();
      if (!metadata) {
        metadata = {};
      }
      node = {
        id: id,
        component: component,
        metadata: metadata
      };
      this.nodes.push(node);
      this.emit('addNode', node);
      this.checkTransactionEnd();
      return node;
    };

    Graph.prototype.removeNode = function(id) {
      var edge, exported, group, i, index, initializer, j, k, l, len, len1, len2, len3, len4, len5, len6, len7, len8, m, n, node, o, p, priv, pub, q, ref, ref1, ref2, ref3, ref4, ref5, toRemove;
      node = this.getNode(id);
      if (!node) {
        return;
      }
      this.checkTransactionStart();
      toRemove = [];
      ref = this.edges;
      for (i = 0, len = ref.length; i < len; i++) {
        edge = ref[i];
        if ((edge.from.node === node.id) || (edge.to.node === node.id)) {
          toRemove.push(edge);
        }
      }
      for (j = 0, len1 = toRemove.length; j < len1; j++) {
        edge = toRemove[j];
        this.removeEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port);
      }
      toRemove = [];
      ref1 = this.initializers;
      for (k = 0, len2 = ref1.length; k < len2; k++) {
        initializer = ref1[k];
        if (initializer.to.node === node.id) {
          toRemove.push(initializer);
        }
      }
      for (l = 0, len3 = toRemove.length; l < len3; l++) {
        initializer = toRemove[l];
        this.removeInitial(initializer.to.node, initializer.to.port);
      }
      toRemove = [];
      ref2 = this.exports;
      for (m = 0, len4 = ref2.length; m < len4; m++) {
        exported = ref2[m];
        if (this.getPortName(id) === exported.process) {
          toRemove.push(exported);
        }
      }
      for (n = 0, len5 = toRemove.length; n < len5; n++) {
        exported = toRemove[n];
        this.removeExport(exported["public"]);
      }
      toRemove = [];
      ref3 = this.inports;
      for (pub in ref3) {
        priv = ref3[pub];
        if (priv.process === id) {
          toRemove.push(pub);
        }
      }
      for (o = 0, len6 = toRemove.length; o < len6; o++) {
        pub = toRemove[o];
        this.removeInport(pub);
      }
      toRemove = [];
      ref4 = this.outports;
      for (pub in ref4) {
        priv = ref4[pub];
        if (priv.process === id) {
          toRemove.push(pub);
        }
      }
      for (p = 0, len7 = toRemove.length; p < len7; p++) {
        pub = toRemove[p];
        this.removeOutport(pub);
      }
      ref5 = this.groups;
      for (q = 0, len8 = ref5.length; q < len8; q++) {
        group = ref5[q];
        if (!group) {
          continue;
        }
        index = group.nodes.indexOf(id);
        if (index === -1) {
          continue;
        }
        group.nodes.splice(index, 1);
      }
      this.setNodeMetadata(id, {});
      if (-1 !== this.nodes.indexOf(node)) {
        this.nodes.splice(this.nodes.indexOf(node), 1);
      }
      this.emit('removeNode', node);
      return this.checkTransactionEnd();
    };

    Graph.prototype.getNode = function(id) {
      var i, len, node, ref;
      ref = this.nodes;
      for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];
        if (!node) {
          continue;
        }
        if (node.id === id) {
          return node;
        }
      }
      return null;
    };

    Graph.prototype.renameNode = function(oldId, newId) {
      var edge, exported, group, i, iip, index, j, k, l, len, len1, len2, len3, node, priv, pub, ref, ref1, ref2, ref3, ref4, ref5;
      this.checkTransactionStart();
      node = this.getNode(oldId);
      if (!node) {
        return;
      }
      node.id = newId;
      ref = this.edges;
      for (i = 0, len = ref.length; i < len; i++) {
        edge = ref[i];
        if (!edge) {
          continue;
        }
        if (edge.from.node === oldId) {
          edge.from.node = newId;
        }
        if (edge.to.node === oldId) {
          edge.to.node = newId;
        }
      }
      ref1 = this.initializers;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        iip = ref1[j];
        if (!iip) {
          continue;
        }
        if (iip.to.node === oldId) {
          iip.to.node = newId;
        }
      }
      ref2 = this.inports;
      for (pub in ref2) {
        priv = ref2[pub];
        if (priv.process === oldId) {
          priv.process = newId;
        }
      }
      ref3 = this.outports;
      for (pub in ref3) {
        priv = ref3[pub];
        if (priv.process === oldId) {
          priv.process = newId;
        }
      }
      ref4 = this.exports;
      for (k = 0, len2 = ref4.length; k < len2; k++) {
        exported = ref4[k];
        if (exported.process === oldId) {
          exported.process = newId;
        }
      }
      ref5 = this.groups;
      for (l = 0, len3 = ref5.length; l < len3; l++) {
        group = ref5[l];
        if (!group) {
          continue;
        }
        index = group.nodes.indexOf(oldId);
        if (index === -1) {
          continue;
        }
        group.nodes[index] = newId;
      }
      this.emit('renameNode', oldId, newId);
      return this.checkTransactionEnd();
    };

    Graph.prototype.setNodeMetadata = function(id, metadata) {
      var before, item, node, val;
      node = this.getNode(id);
      if (!node) {
        return;
      }
      this.checkTransactionStart();
      before = clone(node.metadata);
      if (!node.metadata) {
        node.metadata = {};
      }
      for (item in metadata) {
        val = metadata[item];
        if (val != null) {
          node.metadata[item] = val;
        } else {
          delete node.metadata[item];
        }
      }
      this.emit('changeNode', node, before);
      return this.checkTransactionEnd();
    };

    Graph.prototype.addEdge = function(outNode, outPort, inNode, inPort, metadata) {
      var edge, i, len, ref;
      if (metadata == null) {
        metadata = {};
      }
      outPort = this.getPortName(outPort);
      inPort = this.getPortName(inPort);
      ref = this.edges;
      for (i = 0, len = ref.length; i < len; i++) {
        edge = ref[i];
        if (edge.from.node === outNode && edge.from.port === outPort && edge.to.node === inNode && edge.to.port === inPort) {
          return;
        }
      }
      if (!this.getNode(outNode)) {
        return;
      }
      if (!this.getNode(inNode)) {
        return;
      }
      this.checkTransactionStart();
      edge = {
        from: {
          node: outNode,
          port: outPort
        },
        to: {
          node: inNode,
          port: inPort
        },
        metadata: metadata
      };
      this.edges.push(edge);
      this.emit('addEdge', edge);
      this.checkTransactionEnd();
      return edge;
    };

    Graph.prototype.addEdgeIndex = function(outNode, outPort, outIndex, inNode, inPort, inIndex, metadata) {
      var edge;
      if (metadata == null) {
        metadata = {};
      }
      if (!this.getNode(outNode)) {
        return;
      }
      if (!this.getNode(inNode)) {
        return;
      }
      outPort = this.getPortName(outPort);
      inPort = this.getPortName(inPort);
      if (inIndex === null) {
        inIndex = void 0;
      }
      if (outIndex === null) {
        outIndex = void 0;
      }
      if (!metadata) {
        metadata = {};
      }
      this.checkTransactionStart();
      edge = {
        from: {
          node: outNode,
          port: outPort,
          index: outIndex
        },
        to: {
          node: inNode,
          port: inPort,
          index: inIndex
        },
        metadata: metadata
      };
      this.edges.push(edge);
      this.emit('addEdge', edge);
      this.checkTransactionEnd();
      return edge;
    };

    Graph.prototype.removeEdge = function(node, port, node2, port2) {
      var edge, i, index, j, k, len, len1, len2, ref, ref1, toKeep, toRemove;
      this.checkTransactionStart();
      port = this.getPortName(port);
      port2 = this.getPortName(port2);
      toRemove = [];
      toKeep = [];
      if (node2 && port2) {
        ref = this.edges;
        for (index = i = 0, len = ref.length; i < len; index = ++i) {
          edge = ref[index];
          if (edge.from.node === node && edge.from.port === port && edge.to.node === node2 && edge.to.port === port2) {
            this.setEdgeMetadata(edge.from.node, edge.from.port, edge.to.node, edge.to.port, {});
            toRemove.push(edge);
          } else {
            toKeep.push(edge);
          }
        }
      } else {
        ref1 = this.edges;
        for (index = j = 0, len1 = ref1.length; j < len1; index = ++j) {
          edge = ref1[index];
          if ((edge.from.node === node && edge.from.port === port) || (edge.to.node === node && edge.to.port === port)) {
            this.setEdgeMetadata(edge.from.node, edge.from.port, edge.to.node, edge.to.port, {});
            toRemove.push(edge);
          } else {
            toKeep.push(edge);
          }
        }
      }
      this.edges = toKeep;
      for (k = 0, len2 = toRemove.length; k < len2; k++) {
        edge = toRemove[k];
        this.emit('removeEdge', edge);
      }
      return this.checkTransactionEnd();
    };

    Graph.prototype.getEdge = function(node, port, node2, port2) {
      var edge, i, index, len, ref;
      port = this.getPortName(port);
      port2 = this.getPortName(port2);
      ref = this.edges;
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
        edge = ref[index];
        if (!edge) {
          continue;
        }
        if (edge.from.node === node && edge.from.port === port) {
          if (edge.to.node === node2 && edge.to.port === port2) {
            return edge;
          }
        }
      }
      return null;
    };

    Graph.prototype.setEdgeMetadata = function(node, port, node2, port2, metadata) {
      var before, edge, item, val;
      edge = this.getEdge(node, port, node2, port2);
      if (!edge) {
        return;
      }
      this.checkTransactionStart();
      before = clone(edge.metadata);
      if (!edge.metadata) {
        edge.metadata = {};
      }
      for (item in metadata) {
        val = metadata[item];
        if (val != null) {
          edge.metadata[item] = val;
        } else {
          delete edge.metadata[item];
        }
      }
      this.emit('changeEdge', edge, before);
      return this.checkTransactionEnd();
    };

    Graph.prototype.addInitial = function(data, node, port, metadata) {
      var initializer;
      if (!this.getNode(node)) {
        return;
      }
      port = this.getPortName(port);
      this.checkTransactionStart();
      initializer = {
        from: {
          data: data
        },
        to: {
          node: node,
          port: port
        },
        metadata: metadata
      };
      this.initializers.push(initializer);
      this.emit('addInitial', initializer);
      this.checkTransactionEnd();
      return initializer;
    };

    Graph.prototype.addInitialIndex = function(data, node, port, index, metadata) {
      var initializer;
      if (!this.getNode(node)) {
        return;
      }
      if (index === null) {
        index = void 0;
      }
      port = this.getPortName(port);
      this.checkTransactionStart();
      initializer = {
        from: {
          data: data
        },
        to: {
          node: node,
          port: port,
          index: index
        },
        metadata: metadata
      };
      this.initializers.push(initializer);
      this.emit('addInitial', initializer);
      this.checkTransactionEnd();
      return initializer;
    };

    Graph.prototype.addGraphInitial = function(data, node, metadata) {
      var inport;
      inport = this.inports[node];
      if (!inport) {
        return;
      }
      return this.addInitial(data, inport.process, inport.port, metadata);
    };

    Graph.prototype.addGraphInitialIndex = function(data, node, index, metadata) {
      var inport;
      inport = this.inports[node];
      if (!inport) {
        return;
      }
      return this.addInitialIndex(data, inport.process, inport.port, index, metadata);
    };

    Graph.prototype.removeInitial = function(node, port) {
      var edge, i, index, j, len, len1, ref, toKeep, toRemove;
      port = this.getPortName(port);
      this.checkTransactionStart();
      toRemove = [];
      toKeep = [];
      ref = this.initializers;
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
        edge = ref[index];
        if (edge.to.node === node && edge.to.port === port) {
          toRemove.push(edge);
        } else {
          toKeep.push(edge);
        }
      }
      this.initializers = toKeep;
      for (j = 0, len1 = toRemove.length; j < len1; j++) {
        edge = toRemove[j];
        this.emit('removeInitial', edge);
      }
      return this.checkTransactionEnd();
    };

    Graph.prototype.removeGraphInitial = function(node) {
      var inport;
      inport = this.inports[node];
      if (!inport) {
        return;
      }
      return this.removeInitial(inport.process, inport.port);
    };

    Graph.prototype.toDOT = function() {
      var cleanID, cleanPort, data, dot, edge, i, id, initializer, j, k, len, len1, len2, node, ref, ref1, ref2;
      cleanID = function(id) {
        return id.replace(/\s*/g, "");
      };
      cleanPort = function(port) {
        return port.replace(/\./g, "");
      };
      dot = "digraph {\n";
      ref = this.nodes;
      for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];
        dot += "    " + (cleanID(node.id)) + " [label=" + node.id + " shape=box]\n";
      }
      ref1 = this.initializers;
      for (id = j = 0, len1 = ref1.length; j < len1; id = ++j) {
        initializer = ref1[id];
        if (typeof initializer.from.data === 'function') {
          data = 'Function';
        } else {
          data = initializer.from.data;
        }
        dot += "    data" + id + " [label=\"'" + data + "'\" shape=plaintext]\n";
        dot += "    data" + id + " -> " + (cleanID(initializer.to.node)) + "[headlabel=" + (cleanPort(initializer.to.port)) + " labelfontcolor=blue labelfontsize=8.0]\n";
      }
      ref2 = this.edges;
      for (k = 0, len2 = ref2.length; k < len2; k++) {
        edge = ref2[k];
        dot += "    " + (cleanID(edge.from.node)) + " -> " + (cleanID(edge.to.node)) + "[taillabel=" + (cleanPort(edge.from.port)) + " headlabel=" + (cleanPort(edge.to.port)) + " labelfontcolor=blue labelfontsize=8.0]\n";
      }
      dot += "}";
      return dot;
    };

    Graph.prototype.toYUML = function() {
      var edge, i, initializer, j, len, len1, ref, ref1, yuml;
      yuml = [];
      ref = this.initializers;
      for (i = 0, len = ref.length; i < len; i++) {
        initializer = ref[i];
        yuml.push("(start)[" + initializer.to.port + "]->(" + initializer.to.node + ")");
      }
      ref1 = this.edges;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        edge = ref1[j];
        yuml.push("(" + edge.from.node + ")[" + edge.from.port + "]->(" + edge.to.node + ")");
      }
      return yuml.join(",");
    };

    Graph.prototype.toJSON = function() {
      var connection, edge, exported, group, groupData, i, initializer, j, json, k, l, len, len1, len2, len3, len4, m, node, priv, property, pub, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, value;
      json = {
        caseSensitive: this.caseSensitive,
        properties: {},
        inports: {},
        outports: {},
        groups: [],
        processes: {},
        connections: []
      };
      if (this.name) {
        json.properties.name = this.name;
      }
      ref = this.properties;
      for (property in ref) {
        value = ref[property];
        json.properties[property] = value;
      }
      ref1 = this.inports;
      for (pub in ref1) {
        priv = ref1[pub];
        json.inports[pub] = priv;
      }
      ref2 = this.outports;
      for (pub in ref2) {
        priv = ref2[pub];
        json.outports[pub] = priv;
      }
      ref3 = this.exports;
      for (i = 0, len = ref3.length; i < len; i++) {
        exported = ref3[i];
        if (!json.exports) {
          json.exports = [];
        }
        json.exports.push(exported);
      }
      ref4 = this.groups;
      for (j = 0, len1 = ref4.length; j < len1; j++) {
        group = ref4[j];
        groupData = {
          name: group.name,
          nodes: group.nodes
        };
        if (Object.keys(group.metadata).length) {
          groupData.metadata = group.metadata;
        }
        json.groups.push(groupData);
      }
      ref5 = this.nodes;
      for (k = 0, len2 = ref5.length; k < len2; k++) {
        node = ref5[k];
        json.processes[node.id] = {
          component: node.component
        };
        if (node.metadata) {
          json.processes[node.id].metadata = node.metadata;
        }
      }
      ref6 = this.edges;
      for (l = 0, len3 = ref6.length; l < len3; l++) {
        edge = ref6[l];
        connection = {
          src: {
            process: edge.from.node,
            port: edge.from.port,
            index: edge.from.index
          },
          tgt: {
            process: edge.to.node,
            port: edge.to.port,
            index: edge.to.index
          }
        };
        if (Object.keys(edge.metadata).length) {
          connection.metadata = edge.metadata;
        }
        json.connections.push(connection);
      }
      ref7 = this.initializers;
      for (m = 0, len4 = ref7.length; m < len4; m++) {
        initializer = ref7[m];
        json.connections.push({
          data: initializer.from.data,
          tgt: {
            process: initializer.to.node,
            port: initializer.to.port,
            index: initializer.to.index
          }
        });
      }
      return json;
    };

    Graph.prototype.save = function(file, callback) {
      var json;
      if (platform.isBrowser()) {
        return callback(new Error("Saving graphs not supported on browser"));
      }
      json = JSON.stringify(this.toJSON(), null, 4);
      return require('fs').writeFile(file + ".json", json, "utf-8", function(err, data) {
        if (err) {
          throw err;
        }
        return callback(file);
      });
    };

    return Graph;

  })(EventEmitter);

  exports.Graph = Graph;

  exports.createGraph = function(name, options) {
    return new Graph(name, options);
  };

  exports.loadJSON = function(definition, callback, metadata) {
    var caseSensitive, conn, def, exported, graph, group, i, id, j, k, len, len1, len2, portId, priv, processId, properties, property, pub, ref, ref1, ref2, ref3, ref4, ref5, ref6, split, value;
    if (metadata == null) {
      metadata = {};
    }
    if (typeof definition === 'string') {
      definition = JSON.parse(definition);
    }
    if (!definition.properties) {
      definition.properties = {};
    }
    if (!definition.processes) {
      definition.processes = {};
    }
    if (!definition.connections) {
      definition.connections = [];
    }
    caseSensitive = definition.caseSensitive || false;
    graph = new Graph(definition.properties.name, {
      caseSensitive: caseSensitive
    });
    graph.startTransaction('loadJSON', metadata);
    properties = {};
    ref = definition.properties;
    for (property in ref) {
      value = ref[property];
      if (property === 'name') {
        continue;
      }
      properties[property] = value;
    }
    graph.setProperties(properties);
    ref1 = definition.processes;
    for (id in ref1) {
      def = ref1[id];
      if (!def.metadata) {
        def.metadata = {};
      }
      graph.addNode(id, def.component, def.metadata);
    }
    ref2 = definition.connections;
    for (i = 0, len = ref2.length; i < len; i++) {
      conn = ref2[i];
      metadata = conn.metadata ? conn.metadata : {};
      if (conn.data !== void 0) {
        if (typeof conn.tgt.index === 'number') {
          graph.addInitialIndex(conn.data, conn.tgt.process, graph.getPortName(conn.tgt.port), conn.tgt.index, metadata);
        } else {
          graph.addInitial(conn.data, conn.tgt.process, graph.getPortName(conn.tgt.port), metadata);
        }
        continue;
      }
      if (typeof conn.src.index === 'number' || typeof conn.tgt.index === 'number') {
        graph.addEdgeIndex(conn.src.process, graph.getPortName(conn.src.port), conn.src.index, conn.tgt.process, graph.getPortName(conn.tgt.port), conn.tgt.index, metadata);
        continue;
      }
      graph.addEdge(conn.src.process, graph.getPortName(conn.src.port), conn.tgt.process, graph.getPortName(conn.tgt.port), metadata);
    }
    if (definition.exports && definition.exports.length) {
      ref3 = definition.exports;
      for (j = 0, len1 = ref3.length; j < len1; j++) {
        exported = ref3[j];
        if (exported["private"]) {
          split = exported["private"].split('.');
          if (split.length !== 2) {
            continue;
          }
          processId = split[0];
          portId = split[1];
          for (id in definition.processes) {
            if (graph.getPortName(id) === graph.getPortName(processId)) {
              processId = id;
            }
          }
        } else {
          processId = exported.process;
          portId = graph.getPortName(exported.port);
        }
        graph.addExport(exported["public"], processId, portId, exported.metadata);
      }
    }
    if (definition.inports) {
      ref4 = definition.inports;
      for (pub in ref4) {
        priv = ref4[pub];
        graph.addInport(pub, priv.process, graph.getPortName(priv.port), priv.metadata);
      }
    }
    if (definition.outports) {
      ref5 = definition.outports;
      for (pub in ref5) {
        priv = ref5[pub];
        graph.addOutport(pub, priv.process, graph.getPortName(priv.port), priv.metadata);
      }
    }
    if (definition.groups) {
      ref6 = definition.groups;
      for (k = 0, len2 = ref6.length; k < len2; k++) {
        group = ref6[k];
        graph.addGroup(group.name, group.nodes, group.metadata || {});
      }
    }
    graph.endTransaction('loadJSON');
    return callback(null, graph);
  };

  exports.loadFBP = function(fbpData, callback, metadata, caseSensitive) {
    var definition, e, error;
    if (metadata == null) {
      metadata = {};
    }
    if (caseSensitive == null) {
      caseSensitive = false;
    }
    try {
      definition = require('fbp').parse(fbpData, {
        caseSensitive: caseSensitive
      });
    } catch (error) {
      e = error;
      return callback(e);
    }
    return exports.loadJSON(definition, callback, metadata);
  };

  exports.loadHTTP = function(url, callback) {
    var req;
    req = new XMLHttpRequest;
    req.onreadystatechange = function() {
      if (req.readyState !== 4) {
        return;
      }
      if (req.status !== 200) {
        return callback(new Error("Failed to load " + url + ": HTTP " + req.status));
      }
      return callback(null, req.responseText);
    };
    req.open('GET', url, true);
    return req.send();
  };

  exports.loadFile = function(file, callback, metadata, caseSensitive) {
    if (metadata == null) {
      metadata = {};
    }
    if (caseSensitive == null) {
      caseSensitive = false;
    }
    if (platform.isBrowser()) {
      exports.loadHTTP(file, function(err, data) {
        var definition;
        if (err) {
          return callback(err);
        }
        if (file.split('.').pop() === 'fbp') {
          return exports.loadFBP(data, callback, metadata);
        }
        definition = JSON.parse(data);
        return exports.loadJSON(definition, callback, metadata);
      });
      return;
    }
    return require('fs').readFile(file, "utf-8", function(err, data) {
      var definition;
      if (err) {
        return callback(err);
      }
      if (file.split('.').pop() === 'fbp') {
        return exports.loadFBP(data, callback, {}, caseSensitive);
      }
      definition = JSON.parse(data);
      return exports.loadJSON(definition, callback, {});
    });
  };

  resetGraph = function(graph) {
    var edge, exp, group, i, iip, j, k, l, len, len1, len2, len3, len4, m, node, port, ref, ref1, ref2, ref3, ref4, ref5, ref6, results, v;
    ref = (clone(graph.groups)).reverse();
    for (i = 0, len = ref.length; i < len; i++) {
      group = ref[i];
      if (group != null) {
        graph.removeGroup(group.name);
      }
    }
    ref1 = clone(graph.outports);
    for (port in ref1) {
      v = ref1[port];
      graph.removeOutport(port);
    }
    ref2 = clone(graph.inports);
    for (port in ref2) {
      v = ref2[port];
      graph.removeInport(port);
    }
    ref3 = clone(graph.exports.reverse());
    for (j = 0, len1 = ref3.length; j < len1; j++) {
      exp = ref3[j];
      graph.removeExport(exp["public"]);
    }
    graph.setProperties({});
    ref4 = (clone(graph.initializers)).reverse();
    for (k = 0, len2 = ref4.length; k < len2; k++) {
      iip = ref4[k];
      graph.removeInitial(iip.to.node, iip.to.port);
    }
    ref5 = (clone(graph.edges)).reverse();
    for (l = 0, len3 = ref5.length; l < len3; l++) {
      edge = ref5[l];
      graph.removeEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port);
    }
    ref6 = (clone(graph.nodes)).reverse();
    results = [];
    for (m = 0, len4 = ref6.length; m < len4; m++) {
      node = ref6[m];
      results.push(graph.removeNode(node.id));
    }
    return results;
  };

  mergeResolveTheirsNaive = function(base, to) {
    var edge, exp, group, i, iip, j, k, l, len, len1, len2, len3, len4, m, node, priv, pub, ref, ref1, ref2, ref3, ref4, ref5, ref6, results;
    resetGraph(base);
    ref = to.nodes;
    for (i = 0, len = ref.length; i < len; i++) {
      node = ref[i];
      base.addNode(node.id, node.component, node.metadata);
    }
    ref1 = to.edges;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      edge = ref1[j];
      base.addEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port, edge.metadata);
    }
    ref2 = to.initializers;
    for (k = 0, len2 = ref2.length; k < len2; k++) {
      iip = ref2[k];
      base.addInitial(iip.from.data, iip.to.node, iip.to.port, iip.metadata);
    }
    ref3 = to.exports;
    for (l = 0, len3 = ref3.length; l < len3; l++) {
      exp = ref3[l];
      base.addExport(exp["public"], exp.node, exp.port, exp.metadata);
    }
    base.setProperties(to.properties);
    ref4 = to.inports;
    for (pub in ref4) {
      priv = ref4[pub];
      base.addInport(pub, priv.process, priv.port, priv.metadata);
    }
    ref5 = to.outports;
    for (pub in ref5) {
      priv = ref5[pub];
      base.addOutport(pub, priv.process, priv.port, priv.metadata);
    }
    ref6 = to.groups;
    results = [];
    for (m = 0, len4 = ref6.length; m < len4; m++) {
      group = ref6[m];
      results.push(base.addGroup(group.name, group.nodes, group.metadata));
    }
    return results;
  };

  exports.equivalent = function(a, b, options) {
    var A, B;
    if (options == null) {
      options = {};
    }
    A = JSON.stringify(a);
    B = JSON.stringify(b);
    return A === B;
  };

  exports.mergeResolveTheirs = mergeResolveTheirsNaive;

}).call(this);

},{"./Platform":11,"clone":5,"events":7,"fbp":12,"fs":3}],10:[function(require,module,exports){
(function() {
  var EventEmitter, Journal, JournalStore, MemoryJournalStore, calculateMeta, clone, entryToPrettyString,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  EventEmitter = require('events').EventEmitter;

  clone = require('clone');

  entryToPrettyString = function(entry) {
    var a;
    a = entry.args;
    switch (entry.cmd) {
      case 'addNode':
        return a.id + "(" + a.component + ")";
      case 'removeNode':
        return "DEL " + a.id + "(" + a.component + ")";
      case 'renameNode':
        return "RENAME " + a.oldId + " " + a.newId;
      case 'changeNode':
        return "META " + a.id;
      case 'addEdge':
        return a.from.node + " " + a.from.port + " -> " + a.to.port + " " + a.to.node;
      case 'removeEdge':
        return a.from.node + " " + a.from.port + " -X> " + a.to.port + " " + a.to.node;
      case 'changeEdge':
        return "META " + a.from.node + " " + a.from.port + " -> " + a.to.port + " " + a.to.node;
      case 'addInitial':
        return "'" + a.from.data + "' -> " + a.to.port + " " + a.to.node;
      case 'removeInitial':
        return "'" + a.from.data + "' -X> " + a.to.port + " " + a.to.node;
      case 'startTransaction':
        return ">>> " + entry.rev + ": " + a.id;
      case 'endTransaction':
        return "<<< " + entry.rev + ": " + a.id;
      case 'changeProperties':
        return "PROPERTIES";
      case 'addGroup':
        return "GROUP " + a.name;
      case 'renameGroup':
        return "RENAME GROUP " + a.oldName + " " + a.newName;
      case 'removeGroup':
        return "DEL GROUP " + a.name;
      case 'changeGroup':
        return "META GROUP " + a.name;
      case 'addInport':
        return "INPORT " + a.name;
      case 'removeInport':
        return "DEL INPORT " + a.name;
      case 'renameInport':
        return "RENAME INPORT " + a.oldId + " " + a.newId;
      case 'changeInport':
        return "META INPORT " + a.name;
      case 'addOutport':
        return "OUTPORT " + a.name;
      case 'removeOutport':
        return "DEL OUTPORT " + a.name;
      case 'renameOutport':
        return "RENAME OUTPORT " + a.oldId + " " + a.newId;
      case 'changeOutport':
        return "META OUTPORT " + a.name;
      default:
        throw new Error("Unknown journal entry: " + entry.cmd);
    }
  };

  calculateMeta = function(oldMeta, newMeta) {
    var k, setMeta, v;
    setMeta = {};
    for (k in oldMeta) {
      v = oldMeta[k];
      setMeta[k] = null;
    }
    for (k in newMeta) {
      v = newMeta[k];
      setMeta[k] = v;
    }
    return setMeta;
  };

  JournalStore = (function(superClass) {
    extend(JournalStore, superClass);

    JournalStore.prototype.lastRevision = 0;

    function JournalStore(graph1) {
      this.graph = graph1;
      this.lastRevision = 0;
    }

    JournalStore.prototype.putTransaction = function(revId, entries) {
      if (revId > this.lastRevision) {
        this.lastRevision = revId;
      }
      return this.emit('transaction', revId);
    };

    JournalStore.prototype.fetchTransaction = function(revId, entries) {};

    return JournalStore;

  })(EventEmitter);

  MemoryJournalStore = (function(superClass) {
    extend(MemoryJournalStore, superClass);

    function MemoryJournalStore(graph) {
      MemoryJournalStore.__super__.constructor.call(this, graph);
      this.transactions = [];
    }

    MemoryJournalStore.prototype.putTransaction = function(revId, entries) {
      MemoryJournalStore.__super__.putTransaction.call(this, revId, entries);
      return this.transactions[revId] = entries;
    };

    MemoryJournalStore.prototype.fetchTransaction = function(revId) {
      return this.transactions[revId];
    };

    return MemoryJournalStore;

  })(JournalStore);

  Journal = (function(superClass) {
    extend(Journal, superClass);

    Journal.prototype.graph = null;

    Journal.prototype.entries = [];

    Journal.prototype.subscribed = true;

    function Journal(graph, metadata, store) {
      this.endTransaction = bind(this.endTransaction, this);
      this.startTransaction = bind(this.startTransaction, this);
      var edge, group, iip, j, k, l, len, len1, len2, len3, m, n, node, ref, ref1, ref2, ref3, ref4, ref5, v;
      this.graph = graph;
      this.entries = [];
      this.subscribed = true;
      this.store = store || new MemoryJournalStore(this.graph);
      if (this.store.transactions.length === 0) {
        this.currentRevision = -1;
        this.startTransaction('initial', metadata);
        ref = this.graph.nodes;
        for (j = 0, len = ref.length; j < len; j++) {
          node = ref[j];
          this.appendCommand('addNode', node);
        }
        ref1 = this.graph.edges;
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          edge = ref1[l];
          this.appendCommand('addEdge', edge);
        }
        ref2 = this.graph.initializers;
        for (m = 0, len2 = ref2.length; m < len2; m++) {
          iip = ref2[m];
          this.appendCommand('addInitial', iip);
        }
        if (Object.keys(this.graph.properties).length > 0) {
          this.appendCommand('changeProperties', this.graph.properties, {});
        }
        ref3 = this.graph.inports;
        for (k in ref3) {
          v = ref3[k];
          this.appendCommand('addInport', {
            name: k,
            port: v
          });
        }
        ref4 = this.graph.outports;
        for (k in ref4) {
          v = ref4[k];
          this.appendCommand('addOutport', {
            name: k,
            port: v
          });
        }
        ref5 = this.graph.groups;
        for (n = 0, len3 = ref5.length; n < len3; n++) {
          group = ref5[n];
          this.appendCommand('addGroup', group);
        }
        this.endTransaction('initial', metadata);
      } else {
        this.currentRevision = this.store.lastRevision;
      }
      this.graph.on('addNode', (function(_this) {
        return function(node) {
          return _this.appendCommand('addNode', node);
        };
      })(this));
      this.graph.on('removeNode', (function(_this) {
        return function(node) {
          return _this.appendCommand('removeNode', node);
        };
      })(this));
      this.graph.on('renameNode', (function(_this) {
        return function(oldId, newId) {
          var args;
          args = {
            oldId: oldId,
            newId: newId
          };
          return _this.appendCommand('renameNode', args);
        };
      })(this));
      this.graph.on('changeNode', (function(_this) {
        return function(node, oldMeta) {
          return _this.appendCommand('changeNode', {
            id: node.id,
            "new": node.metadata,
            old: oldMeta
          });
        };
      })(this));
      this.graph.on('addEdge', (function(_this) {
        return function(edge) {
          return _this.appendCommand('addEdge', edge);
        };
      })(this));
      this.graph.on('removeEdge', (function(_this) {
        return function(edge) {
          return _this.appendCommand('removeEdge', edge);
        };
      })(this));
      this.graph.on('changeEdge', (function(_this) {
        return function(edge, oldMeta) {
          return _this.appendCommand('changeEdge', {
            from: edge.from,
            to: edge.to,
            "new": edge.metadata,
            old: oldMeta
          });
        };
      })(this));
      this.graph.on('addInitial', (function(_this) {
        return function(iip) {
          return _this.appendCommand('addInitial', iip);
        };
      })(this));
      this.graph.on('removeInitial', (function(_this) {
        return function(iip) {
          return _this.appendCommand('removeInitial', iip);
        };
      })(this));
      this.graph.on('changeProperties', (function(_this) {
        return function(newProps, oldProps) {
          return _this.appendCommand('changeProperties', {
            "new": newProps,
            old: oldProps
          });
        };
      })(this));
      this.graph.on('addGroup', (function(_this) {
        return function(group) {
          return _this.appendCommand('addGroup', group);
        };
      })(this));
      this.graph.on('renameGroup', (function(_this) {
        return function(oldName, newName) {
          return _this.appendCommand('renameGroup', {
            oldName: oldName,
            newName: newName
          });
        };
      })(this));
      this.graph.on('removeGroup', (function(_this) {
        return function(group) {
          return _this.appendCommand('removeGroup', group);
        };
      })(this));
      this.graph.on('changeGroup', (function(_this) {
        return function(group, oldMeta) {
          return _this.appendCommand('changeGroup', {
            name: group.name,
            "new": group.metadata,
            old: oldMeta
          });
        };
      })(this));
      this.graph.on('addExport', (function(_this) {
        return function(exported) {
          return _this.appendCommand('addExport', exported);
        };
      })(this));
      this.graph.on('removeExport', (function(_this) {
        return function(exported) {
          return _this.appendCommand('removeExport', exported);
        };
      })(this));
      this.graph.on('addInport', (function(_this) {
        return function(name, port) {
          return _this.appendCommand('addInport', {
            name: name,
            port: port
          });
        };
      })(this));
      this.graph.on('removeInport', (function(_this) {
        return function(name, port) {
          return _this.appendCommand('removeInport', {
            name: name,
            port: port
          });
        };
      })(this));
      this.graph.on('renameInport', (function(_this) {
        return function(oldId, newId) {
          return _this.appendCommand('renameInport', {
            oldId: oldId,
            newId: newId
          });
        };
      })(this));
      this.graph.on('changeInport', (function(_this) {
        return function(name, port, oldMeta) {
          return _this.appendCommand('changeInport', {
            name: name,
            "new": port.metadata,
            old: oldMeta
          });
        };
      })(this));
      this.graph.on('addOutport', (function(_this) {
        return function(name, port) {
          return _this.appendCommand('addOutport', {
            name: name,
            port: port
          });
        };
      })(this));
      this.graph.on('removeOutport', (function(_this) {
        return function(name, port) {
          return _this.appendCommand('removeOutport', {
            name: name,
            port: port
          });
        };
      })(this));
      this.graph.on('renameOutport', (function(_this) {
        return function(oldId, newId) {
          return _this.appendCommand('renameOutport', {
            oldId: oldId,
            newId: newId
          });
        };
      })(this));
      this.graph.on('changeOutport', (function(_this) {
        return function(name, port, oldMeta) {
          return _this.appendCommand('changeOutport', {
            name: name,
            "new": port.metadata,
            old: oldMeta
          });
        };
      })(this));
      this.graph.on('startTransaction', (function(_this) {
        return function(id, meta) {
          return _this.startTransaction(id, meta);
        };
      })(this));
      this.graph.on('endTransaction', (function(_this) {
        return function(id, meta) {
          return _this.endTransaction(id, meta);
        };
      })(this));
    }

    Journal.prototype.startTransaction = function(id, meta) {
      if (!this.subscribed) {
        return;
      }
      if (this.entries.length > 0) {
        throw Error("Inconsistent @entries");
      }
      this.currentRevision++;
      return this.appendCommand('startTransaction', {
        id: id,
        metadata: meta
      }, this.currentRevision);
    };

    Journal.prototype.endTransaction = function(id, meta) {
      if (!this.subscribed) {
        return;
      }
      this.appendCommand('endTransaction', {
        id: id,
        metadata: meta
      }, this.currentRevision);
      this.store.putTransaction(this.currentRevision, this.entries);
      return this.entries = [];
    };

    Journal.prototype.appendCommand = function(cmd, args, rev) {
      var entry;
      if (!this.subscribed) {
        return;
      }
      entry = {
        cmd: cmd,
        args: clone(args)
      };
      if (rev != null) {
        entry.rev = rev;
      }
      return this.entries.push(entry);
    };

    Journal.prototype.executeEntry = function(entry) {
      var a;
      a = entry.args;
      switch (entry.cmd) {
        case 'addNode':
          return this.graph.addNode(a.id, a.component);
        case 'removeNode':
          return this.graph.removeNode(a.id);
        case 'renameNode':
          return this.graph.renameNode(a.oldId, a.newId);
        case 'changeNode':
          return this.graph.setNodeMetadata(a.id, calculateMeta(a.old, a["new"]));
        case 'addEdge':
          return this.graph.addEdge(a.from.node, a.from.port, a.to.node, a.to.port);
        case 'removeEdge':
          return this.graph.removeEdge(a.from.node, a.from.port, a.to.node, a.to.port);
        case 'changeEdge':
          return this.graph.setEdgeMetadata(a.from.node, a.from.port, a.to.node, a.to.port, calculateMeta(a.old, a["new"]));
        case 'addInitial':
          return this.graph.addInitial(a.from.data, a.to.node, a.to.port);
        case 'removeInitial':
          return this.graph.removeInitial(a.to.node, a.to.port);
        case 'startTransaction':
          return null;
        case 'endTransaction':
          return null;
        case 'changeProperties':
          return this.graph.setProperties(a["new"]);
        case 'addGroup':
          return this.graph.addGroup(a.name, a.nodes, a.metadata);
        case 'renameGroup':
          return this.graph.renameGroup(a.oldName, a.newName);
        case 'removeGroup':
          return this.graph.removeGroup(a.name);
        case 'changeGroup':
          return this.graph.setGroupMetadata(a.name, calculateMeta(a.old, a["new"]));
        case 'addInport':
          return this.graph.addInport(a.name, a.port.process, a.port.port, a.port.metadata);
        case 'removeInport':
          return this.graph.removeInport(a.name);
        case 'renameInport':
          return this.graph.renameInport(a.oldId, a.newId);
        case 'changeInport':
          return this.graph.setInportMetadata(a.name, calculateMeta(a.old, a["new"]));
        case 'addOutport':
          return this.graph.addOutport(a.name, a.port.process, a.port.port, a.port.metadata(a.name));
        case 'removeOutport':
          return this.graph.removeOutport;
        case 'renameOutport':
          return this.graph.renameOutport(a.oldId, a.newId);
        case 'changeOutport':
          return this.graph.setOutportMetadata(a.name, calculateMeta(a.old, a["new"]));
        default:
          throw new Error("Unknown journal entry: " + entry.cmd);
      }
    };

    Journal.prototype.executeEntryInversed = function(entry) {
      var a;
      a = entry.args;
      switch (entry.cmd) {
        case 'addNode':
          return this.graph.removeNode(a.id);
        case 'removeNode':
          return this.graph.addNode(a.id, a.component);
        case 'renameNode':
          return this.graph.renameNode(a.newId, a.oldId);
        case 'changeNode':
          return this.graph.setNodeMetadata(a.id, calculateMeta(a["new"], a.old));
        case 'addEdge':
          return this.graph.removeEdge(a.from.node, a.from.port, a.to.node, a.to.port);
        case 'removeEdge':
          return this.graph.addEdge(a.from.node, a.from.port, a.to.node, a.to.port);
        case 'changeEdge':
          return this.graph.setEdgeMetadata(a.from.node, a.from.port, a.to.node, a.to.port, calculateMeta(a["new"], a.old));
        case 'addInitial':
          return this.graph.removeInitial(a.to.node, a.to.port);
        case 'removeInitial':
          return this.graph.addInitial(a.from.data, a.to.node, a.to.port);
        case 'startTransaction':
          return null;
        case 'endTransaction':
          return null;
        case 'changeProperties':
          return this.graph.setProperties(a.old);
        case 'addGroup':
          return this.graph.removeGroup(a.name);
        case 'renameGroup':
          return this.graph.renameGroup(a.newName, a.oldName);
        case 'removeGroup':
          return this.graph.addGroup(a.name, a.nodes, a.metadata);
        case 'changeGroup':
          return this.graph.setGroupMetadata(a.name, calculateMeta(a["new"], a.old));
        case 'addInport':
          return this.graph.removeInport(a.name);
        case 'removeInport':
          return this.graph.addInport(a.name, a.port.process, a.port.port, a.port.metadata);
        case 'renameInport':
          return this.graph.renameInport(a.newId, a.oldId);
        case 'changeInport':
          return this.graph.setInportMetadata(a.name, calculateMeta(a["new"], a.old));
        case 'addOutport':
          return this.graph.removeOutport(a.name);
        case 'removeOutport':
          return this.graph.addOutport(a.name, a.port.process, a.port.port, a.port.metadata);
        case 'renameOutport':
          return this.graph.renameOutport(a.newId, a.oldId);
        case 'changeOutport':
          return this.graph.setOutportMetadata(a.name, calculateMeta(a["new"], a.old));
        default:
          throw new Error("Unknown journal entry: " + entry.cmd);
      }
    };

    Journal.prototype.moveToRevision = function(revId) {
      var entries, entry, i, j, l, len, m, n, r, ref, ref1, ref2, ref3, ref4, ref5;
      if (revId === this.currentRevision) {
        return;
      }
      this.subscribed = false;
      if (revId > this.currentRevision) {
        for (r = j = ref = this.currentRevision + 1, ref1 = revId; ref <= ref1 ? j <= ref1 : j >= ref1; r = ref <= ref1 ? ++j : --j) {
          ref2 = this.store.fetchTransaction(r);
          for (l = 0, len = ref2.length; l < len; l++) {
            entry = ref2[l];
            this.executeEntry(entry);
          }
        }
      } else {
        for (r = m = ref3 = this.currentRevision, ref4 = revId + 1; m >= ref4; r = m += -1) {
          entries = this.store.fetchTransaction(r);
          for (i = n = ref5 = entries.length - 1; n >= 0; i = n += -1) {
            this.executeEntryInversed(entries[i]);
          }
        }
      }
      this.currentRevision = revId;
      return this.subscribed = true;
    };

    Journal.prototype.undo = function() {
      if (!this.canUndo()) {
        return;
      }
      return this.moveToRevision(this.currentRevision - 1);
    };

    Journal.prototype.canUndo = function() {
      return this.currentRevision > 0;
    };

    Journal.prototype.redo = function() {
      if (!this.canRedo()) {
        return;
      }
      return this.moveToRevision(this.currentRevision + 1);
    };

    Journal.prototype.canRedo = function() {
      return this.currentRevision < this.store.lastRevision;
    };

    Journal.prototype.toPrettyString = function(startRev, endRev) {
      var e, entry, j, l, len, lines, r, ref, ref1;
      startRev |= 0;
      endRev |= this.store.lastRevision;
      lines = [];
      for (r = j = ref = startRev, ref1 = endRev; ref <= ref1 ? j < ref1 : j > ref1; r = ref <= ref1 ? ++j : --j) {
        e = this.store.fetchTransaction(r);
        for (l = 0, len = e.length; l < len; l++) {
          entry = e[l];
          lines.push(entryToPrettyString(entry));
        }
      }
      return lines.join('\n');
    };

    Journal.prototype.toJSON = function(startRev, endRev) {
      var entries, entry, j, l, len, r, ref, ref1, ref2;
      startRev |= 0;
      endRev |= this.store.lastRevision;
      entries = [];
      for (r = j = ref = startRev, ref1 = endRev; j < ref1; r = j += 1) {
        ref2 = this.store.fetchTransaction(r);
        for (l = 0, len = ref2.length; l < len; l++) {
          entry = ref2[l];
          entries.push(entryToPrettyString(entry));
        }
      }
      return entries;
    };

    Journal.prototype.save = function(file, success) {
      var json;
      json = JSON.stringify(this.toJSON(), null, 4);
      return require('fs').writeFile(file + ".json", json, "utf-8", function(err, data) {
        if (err) {
          throw err;
        }
        return success(file);
      });
    };

    return Journal;

  })(EventEmitter);

  exports.Journal = Journal;

  exports.JournalStore = JournalStore;

  exports.MemoryJournalStore = MemoryJournalStore;

}).call(this);

},{"clone":5,"events":7,"fs":3}],11:[function(require,module,exports){
(function (process){
(function() {
  exports.isBrowser = function() {
    if (typeof process !== 'undefined' && process.execPath && process.execPath.match(/node|iojs/)) {
      return false;
    }
    return true;
  };

  exports.deprecated = function(message) {
    if (exports.isBrowser()) {
      if (window.NOFLO_FATAL_DEPRECATED) {
        throw new Error(message);
      }
      console.warn(message);
      return;
    }
    if (process.env.NOFLO_FATAL_DEPRECATED) {
      throw new Error(message);
    }
    return console.warn(message);
  };

}).call(this);

}).call(this,require('_process'))
},{"_process":16}],12:[function(require,module,exports){
module.exports = (function() {
  "use strict";

  /*
   * Generated by PEG.js 0.9.0.
   *
   * http://pegjs.org/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function peg$SyntaxError(message, expected, found, location) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.location = location;
    this.name     = "SyntaxError";

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, peg$SyntaxError);
    }
  }

  peg$subclass(peg$SyntaxError, Error);

  function peg$parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},
        parser  = this,

        peg$FAILED = {},

        peg$startRuleFunctions = { start: peg$parsestart },
        peg$startRuleFunction  = peg$parsestart,

        peg$c0 = function() { return parser.getResult();  },
        peg$c1 = "INPORT=",
        peg$c2 = { type: "literal", value: "INPORT=", description: "\"INPORT=\"" },
        peg$c3 = ".",
        peg$c4 = { type: "literal", value: ".", description: "\".\"" },
        peg$c5 = ":",
        peg$c6 = { type: "literal", value: ":", description: "\":\"" },
        peg$c7 = function(node, port, pub) {return parser.registerInports(node,port,pub)},
        peg$c8 = "OUTPORT=",
        peg$c9 = { type: "literal", value: "OUTPORT=", description: "\"OUTPORT=\"" },
        peg$c10 = function(node, port, pub) {return parser.registerOutports(node,port,pub)},
        peg$c11 = "DEFAULT_INPORT=",
        peg$c12 = { type: "literal", value: "DEFAULT_INPORT=", description: "\"DEFAULT_INPORT=\"" },
        peg$c13 = function(name) { defaultInPort = name},
        peg$c14 = "DEFAULT_OUTPORT=",
        peg$c15 = { type: "literal", value: "DEFAULT_OUTPORT=", description: "\"DEFAULT_OUTPORT=\"" },
        peg$c16 = function(name) { defaultOutPort = name},
        peg$c17 = function(annotation) { return parser.registerAnnotation(annotation[0], annotation[1]); },
        peg$c18 = function(edges) {return parser.registerEdges(edges);},
        peg$c19 = ",",
        peg$c20 = { type: "literal", value: ",", description: "\",\"" },
        peg$c21 = /^[\n\r\u2028\u2029]/,
        peg$c22 = { type: "class", value: "[\\n\\r\\u2028\\u2029]", description: "[\\n\\r\\u2028\\u2029]" },
        peg$c23 = "#",
        peg$c24 = { type: "literal", value: "#", description: "\"#\"" },
        peg$c25 = "->",
        peg$c26 = { type: "literal", value: "->", description: "\"->\"" },
        peg$c27 = function(x, y) { return [x,y]; },
        peg$c28 = function(x, proc, y) { return [{"tgt":makeInPort(proc, x)},{"src":makeOutPort(proc, y)}]; },
        peg$c29 = function(proc, port) { return {"src":makeOutPort(proc, port)} },
        peg$c30 = function(port, proc) { return {"tgt":makeInPort(proc, port)} },
        peg$c31 = "'",
        peg$c32 = { type: "literal", value: "'", description: "\"'\"" },
        peg$c33 = function(iip) { return {"data":iip.join("")} },
        peg$c34 = function(iip) { return {"data":iip} },
        peg$c35 = function(name) { return name},
        peg$c36 = /^[a-zA-Z_]/,
        peg$c37 = { type: "class", value: "[a-zA-Z_]", description: "[a-zA-Z_]" },
        peg$c38 = /^[a-zA-Z0-9_\-]/,
        peg$c39 = { type: "class", value: "[a-zA-Z0-9_\\-]", description: "[a-zA-Z0-9_\\-]" },
        peg$c40 = function(name) { return makeName(name)},
        peg$c41 = function(name, comp) { parser.addNode(name,comp); return name},
        peg$c42 = function(comp) { return parser.addAnonymousNode(comp, location().start.offset) },
        peg$c43 = "(",
        peg$c44 = { type: "literal", value: "(", description: "\"(\"" },
        peg$c45 = /^[a-zA-Z\/\-0-9_]/,
        peg$c46 = { type: "class", value: "[a-zA-Z/\\-0-9_]", description: "[a-zA-Z/\\-0-9_]" },
        peg$c47 = ")",
        peg$c48 = { type: "literal", value: ")", description: "\")\"" },
        peg$c49 = function(comp, meta) { var o = {}; comp ? o.comp = comp.join("") : o.comp = ''; meta ? o.meta = meta.join("").split(',') : null; return o; },
        peg$c50 = /^[a-zA-Z\/=_,0-9]/,
        peg$c51 = { type: "class", value: "[a-zA-Z/=_,0-9]", description: "[a-zA-Z/=_,0-9]" },
        peg$c52 = function(meta) {return meta},
        peg$c53 = "@",
        peg$c54 = { type: "literal", value: "@", description: "\"@\"" },
        peg$c55 = /^[a-zA-Z0-9\-_]/,
        peg$c56 = { type: "class", value: "[a-zA-Z0-9\\-_]", description: "[a-zA-Z0-9\\-_]" },
        peg$c57 = /^[a-zA-Z0-9\-_ .]/,
        peg$c58 = { type: "class", value: "[a-zA-Z0-9\\-_ \\.]", description: "[a-zA-Z0-9\\-_ \\.]" },
        peg$c59 = function(key, value) { return [key.join(''), value.join('')]; },
        peg$c60 = function(portname, portindex) {return { port: options.caseSensitive? portname : portname.toLowerCase(), index: portindex != null ? portindex : undefined }},
        peg$c61 = function(port) { return port; },
        peg$c62 = /^[a-zA-Z.0-9_]/,
        peg$c63 = { type: "class", value: "[a-zA-Z.0-9_]", description: "[a-zA-Z.0-9_]" },
        peg$c64 = function(portname) {return makeName(portname)},
        peg$c65 = "[",
        peg$c66 = { type: "literal", value: "[", description: "\"[\"" },
        peg$c67 = /^[0-9]/,
        peg$c68 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c69 = "]",
        peg$c70 = { type: "literal", value: "]", description: "\"]\"" },
        peg$c71 = function(portindex) {return parseInt(portindex.join(''))},
        peg$c72 = /^[^\n\r\u2028\u2029]/,
        peg$c73 = { type: "class", value: "[^\\n\\r\\u2028\\u2029]", description: "[^\\n\\r\\u2028\\u2029]" },
        peg$c74 = /^[\\]/,
        peg$c75 = { type: "class", value: "[\\\\]", description: "[\\\\]" },
        peg$c76 = /^[']/,
        peg$c77 = { type: "class", value: "[']", description: "[']" },
        peg$c78 = function() { return "'"; },
        peg$c79 = /^[^']/,
        peg$c80 = { type: "class", value: "[^']", description: "[^']" },
        peg$c81 = " ",
        peg$c82 = { type: "literal", value: " ", description: "\" \"" },
        peg$c83 = function(value) { return value; },
        peg$c84 = "{",
        peg$c85 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c86 = "}",
        peg$c87 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c88 = { type: "other", description: "whitespace" },
        peg$c89 = /^[ \t\n\r]/,
        peg$c90 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },
        peg$c91 = "false",
        peg$c92 = { type: "literal", value: "false", description: "\"false\"" },
        peg$c93 = function() { return false; },
        peg$c94 = "null",
        peg$c95 = { type: "literal", value: "null", description: "\"null\"" },
        peg$c96 = function() { return null;  },
        peg$c97 = "true",
        peg$c98 = { type: "literal", value: "true", description: "\"true\"" },
        peg$c99 = function() { return true;  },
        peg$c100 = function(head, m) { return m; },
        peg$c101 = function(head, tail) {
                  var result = {}, i;

                  result[head.name] = head.value;

                  for (i = 0; i < tail.length; i++) {
                    result[tail[i].name] = tail[i].value;
                  }

                  return result;
                },
        peg$c102 = function(members) { return members !== null ? members: {}; },
        peg$c103 = function(name, value) {
                return { name: name, value: value };
              },
        peg$c104 = function(head, v) { return v; },
        peg$c105 = function(head, tail) { return [head].concat(tail); },
        peg$c106 = function(values) { return values !== null ? values : []; },
        peg$c107 = { type: "other", description: "number" },
        peg$c108 = function() { return parseFloat(text()); },
        peg$c109 = /^[1-9]/,
        peg$c110 = { type: "class", value: "[1-9]", description: "[1-9]" },
        peg$c111 = /^[eE]/,
        peg$c112 = { type: "class", value: "[eE]", description: "[eE]" },
        peg$c113 = "-",
        peg$c114 = { type: "literal", value: "-", description: "\"-\"" },
        peg$c115 = "+",
        peg$c116 = { type: "literal", value: "+", description: "\"+\"" },
        peg$c117 = "0",
        peg$c118 = { type: "literal", value: "0", description: "\"0\"" },
        peg$c119 = { type: "other", description: "string" },
        peg$c120 = function(chars) { return chars.join(""); },
        peg$c121 = "\"",
        peg$c122 = { type: "literal", value: "\"", description: "\"\\\"\"" },
        peg$c123 = "\\",
        peg$c124 = { type: "literal", value: "\\", description: "\"\\\\\"" },
        peg$c125 = "/",
        peg$c126 = { type: "literal", value: "/", description: "\"/\"" },
        peg$c127 = "b",
        peg$c128 = { type: "literal", value: "b", description: "\"b\"" },
        peg$c129 = function() { return "\b"; },
        peg$c130 = "f",
        peg$c131 = { type: "literal", value: "f", description: "\"f\"" },
        peg$c132 = function() { return "\f"; },
        peg$c133 = "n",
        peg$c134 = { type: "literal", value: "n", description: "\"n\"" },
        peg$c135 = function() { return "\n"; },
        peg$c136 = "r",
        peg$c137 = { type: "literal", value: "r", description: "\"r\"" },
        peg$c138 = function() { return "\r"; },
        peg$c139 = "t",
        peg$c140 = { type: "literal", value: "t", description: "\"t\"" },
        peg$c141 = function() { return "\t"; },
        peg$c142 = "u",
        peg$c143 = { type: "literal", value: "u", description: "\"u\"" },
        peg$c144 = function(digits) {
                    return String.fromCharCode(parseInt(digits, 16));
                  },
        peg$c145 = function(sequence) { return sequence; },
        peg$c146 = /^[^\0-\x1F"\\]/,
        peg$c147 = { type: "class", value: "[^\\0-\\x1F\\x22\\x5C]", description: "[^\\0-\\x1F\\x22\\x5C]" },
        peg$c148 = /^[0-9a-f]/i,
        peg$c149 = { type: "class", value: "[0-9a-f]i", description: "[0-9a-f]i" },

        peg$currPos          = 0,
        peg$savedPos         = 0,
        peg$posDetailsCache  = [{ line: 1, column: 1, seenCR: false }],
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$savedPos, peg$currPos);
    }

    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        input.substring(peg$savedPos, peg$currPos),
        peg$computeLocation(peg$savedPos, peg$currPos)
      );
    }

    function error(message) {
      throw peg$buildException(
        message,
        null,
        input.substring(peg$savedPos, peg$currPos),
        peg$computeLocation(peg$savedPos, peg$currPos)
      );
    }

    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos],
          p, ch;

      if (details) {
        return details;
      } else {
        p = pos - 1;
        while (!peg$posDetailsCache[p]) {
          p--;
        }

        details = peg$posDetailsCache[p];
        details = {
          line:   details.line,
          column: details.column,
          seenCR: details.seenCR
        };

        while (p < pos) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }

          p++;
        }

        peg$posDetailsCache[pos] = details;
        return details;
      }
    }

    function peg$computeLocation(startPos, endPos) {
      var startPosDetails = peg$computePosDetails(startPos),
          endPosDetails   = peg$computePosDetails(endPos);

      return {
        start: {
          offset: startPos,
          line:   startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line:   endPosDetails.line,
          column: endPosDetails.column
        }
      };
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, found, location) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0100-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1000-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new peg$SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        location
      );
    }

    function peg$parsestart() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseline();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parseline();
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c0();
      }
      s0 = s1;

      return s0;
    }

    function peg$parseline() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 7) === peg$c1) {
          s2 = peg$c1;
          peg$currPos += 7;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c2); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenode();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 46) {
              s4 = peg$c3;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c4); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseportName();
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 58) {
                  s6 = peg$c5;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c6); }
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseportName();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse_();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parseLineTerminator();
                      if (s9 === peg$FAILED) {
                        s9 = null;
                      }
                      if (s9 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c7(s3, s5, s7);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (s1 !== peg$FAILED) {
          if (input.substr(peg$currPos, 8) === peg$c8) {
            s2 = peg$c8;
            peg$currPos += 8;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c9); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parsenode();
            if (s3 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 46) {
                s4 = peg$c3;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c4); }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parseportName();
                if (s5 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 58) {
                    s6 = peg$c5;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c6); }
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parseportName();
                    if (s7 !== peg$FAILED) {
                      s8 = peg$parse_();
                      if (s8 !== peg$FAILED) {
                        s9 = peg$parseLineTerminator();
                        if (s9 === peg$FAILED) {
                          s9 = null;
                        }
                        if (s9 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c10(s3, s5, s7);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parse_();
          if (s1 !== peg$FAILED) {
            if (input.substr(peg$currPos, 15) === peg$c11) {
              s2 = peg$c11;
              peg$currPos += 15;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c12); }
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parseportName();
              if (s3 !== peg$FAILED) {
                s4 = peg$parse_();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseLineTerminator();
                  if (s5 === peg$FAILED) {
                    s5 = null;
                  }
                  if (s5 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c13(s3);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parse_();
            if (s1 !== peg$FAILED) {
              if (input.substr(peg$currPos, 16) === peg$c14) {
                s2 = peg$c14;
                peg$currPos += 16;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c15); }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parseportName();
                if (s3 !== peg$FAILED) {
                  s4 = peg$parse_();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parseLineTerminator();
                    if (s5 === peg$FAILED) {
                      s5 = null;
                    }
                    if (s5 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c16(s3);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parseannotation();
              if (s1 !== peg$FAILED) {
                s2 = peg$parsenewline();
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c17(s1);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parsecomment();
                if (s1 !== peg$FAILED) {
                  s2 = peg$parsenewline();
                  if (s2 === peg$FAILED) {
                    s2 = null;
                  }
                  if (s2 !== peg$FAILED) {
                    s1 = [s1, s2];
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$parse_();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parsenewline();
                    if (s2 !== peg$FAILED) {
                      s1 = [s1, s2];
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parse_();
                    if (s1 !== peg$FAILED) {
                      s2 = peg$parseconnection();
                      if (s2 !== peg$FAILED) {
                        s3 = peg$parse_();
                        if (s3 !== peg$FAILED) {
                          s4 = peg$parseLineTerminator();
                          if (s4 === peg$FAILED) {
                            s4 = null;
                          }
                          if (s4 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c18(s2);
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseLineTerminator() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 44) {
          s2 = peg$c19;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c20); }
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsecomment();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsenewline();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s1 = [s1, s2, s3, s4];
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsenewline() {
      var s0;

      if (peg$c21.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c22); }
      }

      return s0;
    }

    function peg$parsecomment() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 35) {
          s2 = peg$c23;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c24); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseanychar();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseanychar();
          }
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseconnection() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parsesource();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c25) {
            s3 = peg$c25;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c26); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseconnection();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c27(s1, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parsedestination();
      }

      return s0;
    }

    function peg$parsesource() {
      var s0;

      s0 = peg$parsebridge();
      if (s0 === peg$FAILED) {
        s0 = peg$parseoutport();
        if (s0 === peg$FAILED) {
          s0 = peg$parseiip();
        }
      }

      return s0;
    }

    function peg$parsedestination() {
      var s0;

      s0 = peg$parseinport();
      if (s0 === peg$FAILED) {
        s0 = peg$parsebridge();
      }

      return s0;
    }

    function peg$parsebridge() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseport__();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsenode();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__port();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c28(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseport__();
        if (s1 === peg$FAILED) {
          s1 = null;
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parsenodeWithComponent();
          if (s2 !== peg$FAILED) {
            s3 = peg$parse__port();
            if (s3 === peg$FAILED) {
              s3 = null;
            }
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c28(s1, s2, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }

      return s0;
    }

    function peg$parseoutport() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parsenode();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__port();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c29(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseinport() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseport__();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsenode();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c30(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseiip() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 39) {
        s1 = peg$c31;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c32); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseiipchar();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseiipchar();
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 39) {
            s3 = peg$c31;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c32); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c33(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseJSON_text();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c34(s1);
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parsenode() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parsenodeNameAndComponent();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c35(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsenodeName();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c35(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsenodeComponent();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c35(s1);
          }
          s0 = s1;
        }
      }

      return s0;
    }

    function peg$parsenodeName() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (peg$c36.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c37); }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        if (peg$c38.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c39); }
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          if (peg$c38.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c39); }
          }
        }
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c40(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsenodeNameAndComponent() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parsenodeName();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsecomponent();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c41(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsenodeComponent() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parsecomponent();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c42(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsenodeWithComponent() {
      var s0;

      s0 = peg$parsenodeNameAndComponent();
      if (s0 === peg$FAILED) {
        s0 = peg$parsenodeComponent();
      }

      return s0;
    }

    function peg$parsecomponent() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c43;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c44); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c45.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c46); }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (peg$c45.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c46); }
          }
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsecompMeta();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 41) {
              s4 = peg$c47;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c48); }
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c49(s2, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsecompMeta() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 58) {
        s1 = peg$c5;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c6); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c50.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c51); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c50.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c51); }
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c52(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseannotation() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 35) {
        s1 = peg$c23;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c24); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 64) {
            s3 = peg$c53;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c54); }
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            if (peg$c55.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c56); }
            }
            if (s5 !== peg$FAILED) {
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                if (peg$c55.test(input.charAt(peg$currPos))) {
                  s5 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c56); }
                }
              }
            } else {
              s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse__();
              if (s5 !== peg$FAILED) {
                s6 = [];
                if (peg$c57.test(input.charAt(peg$currPos))) {
                  s7 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c58); }
                }
                if (s7 !== peg$FAILED) {
                  while (s7 !== peg$FAILED) {
                    s6.push(s7);
                    if (peg$c57.test(input.charAt(peg$currPos))) {
                      s7 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s7 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c58); }
                    }
                  }
                } else {
                  s6 = peg$FAILED;
                }
                if (s6 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c59(s4, s6);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseport() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseportName();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseportIndex();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c60(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseport__() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseport();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c61(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parse__port() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parse__();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseport();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c61(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseportName() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (peg$c36.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c37); }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        if (peg$c62.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c63); }
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          if (peg$c62.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c63); }
          }
        }
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c64(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseportIndex() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 91) {
        s1 = peg$c65;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c66); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c67.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c68); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c67.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c68); }
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 93) {
            s3 = peg$c69;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c70); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c71(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseanychar() {
      var s0;

      if (peg$c72.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c73); }
      }

      return s0;
    }

    function peg$parseiipchar() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (peg$c74.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c75); }
      }
      if (s1 !== peg$FAILED) {
        if (peg$c76.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c77); }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c78();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        if (peg$c79.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c80); }
        }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1;

      s0 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s1 = peg$c81;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c82); }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        if (input.charCodeAt(peg$currPos) === 32) {
          s1 = peg$c81;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c82); }
        }
      }
      if (s0 === peg$FAILED) {
        s0 = null;
      }

      return s0;
    }

    function peg$parse__() {
      var s0, s1;

      s0 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s1 = peg$c81;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c82); }
      }
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          if (input.charCodeAt(peg$currPos) === 32) {
            s1 = peg$c81;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c82); }
          }
        }
      } else {
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseJSON_text() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsews();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsevalue();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsews();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c83(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsebegin_array() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsews();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 91) {
          s2 = peg$c65;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c66); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsews();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsebegin_object() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsews();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 123) {
          s2 = peg$c84;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c85); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsews();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseend_array() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsews();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 93) {
          s2 = peg$c69;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c70); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsews();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseend_object() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsews();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 125) {
          s2 = peg$c86;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c87); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsews();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsename_separator() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsews();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 58) {
          s2 = peg$c5;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c6); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsews();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsevalue_separator() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsews();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 44) {
          s2 = peg$c19;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c20); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsews();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsews() {
      var s0, s1;

      peg$silentFails++;
      s0 = [];
      if (peg$c89.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c90); }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        if (peg$c89.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c90); }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c88); }
      }

      return s0;
    }

    function peg$parsevalue() {
      var s0;

      s0 = peg$parsefalse();
      if (s0 === peg$FAILED) {
        s0 = peg$parsenull();
        if (s0 === peg$FAILED) {
          s0 = peg$parsetrue();
          if (s0 === peg$FAILED) {
            s0 = peg$parseobject();
            if (s0 === peg$FAILED) {
              s0 = peg$parsearray();
              if (s0 === peg$FAILED) {
                s0 = peg$parsenumber();
                if (s0 === peg$FAILED) {
                  s0 = peg$parsestring();
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parsefalse() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c91) {
        s1 = peg$c91;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c92); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c93();
      }
      s0 = s1;

      return s0;
    }

    function peg$parsenull() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c94) {
        s1 = peg$c94;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c95); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c96();
      }
      s0 = s1;

      return s0;
    }

    function peg$parsetrue() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c97) {
        s1 = peg$c97;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c98); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c99();
      }
      s0 = s1;

      return s0;
    }

    function peg$parseobject() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parsebegin_object();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$parsemember();
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$currPos;
          s6 = peg$parsevalue_separator();
          if (s6 !== peg$FAILED) {
            s7 = peg$parsemember();
            if (s7 !== peg$FAILED) {
              peg$savedPos = s5;
              s6 = peg$c100(s3, s7);
              s5 = s6;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$currPos;
            s6 = peg$parsevalue_separator();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsemember();
              if (s7 !== peg$FAILED) {
                peg$savedPos = s5;
                s6 = peg$c100(s3, s7);
                s5 = s6;
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          }
          if (s4 !== peg$FAILED) {
            peg$savedPos = s2;
            s3 = peg$c101(s3, s4);
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseend_object();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c102(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsemember() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsestring();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsename_separator();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsevalue();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c103(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsearray() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parsebegin_array();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$parsevalue();
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$currPos;
          s6 = peg$parsevalue_separator();
          if (s6 !== peg$FAILED) {
            s7 = peg$parsevalue();
            if (s7 !== peg$FAILED) {
              peg$savedPos = s5;
              s6 = peg$c104(s3, s7);
              s5 = s6;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$currPos;
            s6 = peg$parsevalue_separator();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsevalue();
              if (s7 !== peg$FAILED) {
                peg$savedPos = s5;
                s6 = peg$c104(s3, s7);
                s5 = s6;
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          }
          if (s4 !== peg$FAILED) {
            peg$savedPos = s2;
            s3 = peg$c105(s3, s4);
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseend_array();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c106(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsenumber() {
      var s0, s1, s2, s3, s4;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseminus();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseint();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsefrac();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseexp();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c108();
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c107); }
      }

      return s0;
    }

    function peg$parsedecimal_point() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 46) {
        s0 = peg$c3;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c4); }
      }

      return s0;
    }

    function peg$parsedigit1_9() {
      var s0;

      if (peg$c109.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c110); }
      }

      return s0;
    }

    function peg$parsee() {
      var s0;

      if (peg$c111.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c112); }
      }

      return s0;
    }

    function peg$parseexp() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parsee();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseminus();
        if (s2 === peg$FAILED) {
          s2 = peg$parseplus();
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseDIGIT();
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseDIGIT();
            }
          } else {
            s3 = peg$FAILED;
          }
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsefrac() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsedecimal_point();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseDIGIT();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseDIGIT();
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseint() {
      var s0, s1, s2, s3;

      s0 = peg$parsezero();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsedigit1_9();
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseDIGIT();
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseDIGIT();
          }
          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }

      return s0;
    }

    function peg$parseminus() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 45) {
        s0 = peg$c113;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c114); }
      }

      return s0;
    }

    function peg$parseplus() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 43) {
        s0 = peg$c115;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c116); }
      }

      return s0;
    }

    function peg$parsezero() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 48) {
        s0 = peg$c117;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c118); }
      }

      return s0;
    }

    function peg$parsestring() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parsequotation_mark();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsechar();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsechar();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsequotation_mark();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c120(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c119); }
      }

      return s0;
    }

    function peg$parsechar() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      s0 = peg$parseunescaped();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseescape();
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s2 = peg$c121;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c122); }
          }
          if (s2 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 92) {
              s2 = peg$c123;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c124); }
            }
            if (s2 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 47) {
                s2 = peg$c125;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c126); }
              }
              if (s2 === peg$FAILED) {
                s2 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 98) {
                  s3 = peg$c127;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c128); }
                }
                if (s3 !== peg$FAILED) {
                  peg$savedPos = s2;
                  s3 = peg$c129();
                }
                s2 = s3;
                if (s2 === peg$FAILED) {
                  s2 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 102) {
                    s3 = peg$c130;
                    peg$currPos++;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c131); }
                  }
                  if (s3 !== peg$FAILED) {
                    peg$savedPos = s2;
                    s3 = peg$c132();
                  }
                  s2 = s3;
                  if (s2 === peg$FAILED) {
                    s2 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 110) {
                      s3 = peg$c133;
                      peg$currPos++;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c134); }
                    }
                    if (s3 !== peg$FAILED) {
                      peg$savedPos = s2;
                      s3 = peg$c135();
                    }
                    s2 = s3;
                    if (s2 === peg$FAILED) {
                      s2 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 114) {
                        s3 = peg$c136;
                        peg$currPos++;
                      } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c137); }
                      }
                      if (s3 !== peg$FAILED) {
                        peg$savedPos = s2;
                        s3 = peg$c138();
                      }
                      s2 = s3;
                      if (s2 === peg$FAILED) {
                        s2 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 116) {
                          s3 = peg$c139;
                          peg$currPos++;
                        } else {
                          s3 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c140); }
                        }
                        if (s3 !== peg$FAILED) {
                          peg$savedPos = s2;
                          s3 = peg$c141();
                        }
                        s2 = s3;
                        if (s2 === peg$FAILED) {
                          s2 = peg$currPos;
                          if (input.charCodeAt(peg$currPos) === 117) {
                            s3 = peg$c142;
                            peg$currPos++;
                          } else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c143); }
                          }
                          if (s3 !== peg$FAILED) {
                            s4 = peg$currPos;
                            s5 = peg$currPos;
                            s6 = peg$parseHEXDIG();
                            if (s6 !== peg$FAILED) {
                              s7 = peg$parseHEXDIG();
                              if (s7 !== peg$FAILED) {
                                s8 = peg$parseHEXDIG();
                                if (s8 !== peg$FAILED) {
                                  s9 = peg$parseHEXDIG();
                                  if (s9 !== peg$FAILED) {
                                    s6 = [s6, s7, s8, s9];
                                    s5 = s6;
                                  } else {
                                    peg$currPos = s5;
                                    s5 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s5;
                                  s5 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s5;
                                s5 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s5;
                              s5 = peg$FAILED;
                            }
                            if (s5 !== peg$FAILED) {
                              s4 = input.substring(s4, peg$currPos);
                            } else {
                              s4 = s5;
                            }
                            if (s4 !== peg$FAILED) {
                              peg$savedPos = s2;
                              s3 = peg$c144(s4);
                              s2 = s3;
                            } else {
                              peg$currPos = s2;
                              s2 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s2;
                            s2 = peg$FAILED;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c145(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }

      return s0;
    }

    function peg$parseescape() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 92) {
        s0 = peg$c123;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c124); }
      }

      return s0;
    }

    function peg$parsequotation_mark() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 34) {
        s0 = peg$c121;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c122); }
      }

      return s0;
    }

    function peg$parseunescaped() {
      var s0;

      if (peg$c146.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c147); }
      }

      return s0;
    }

    function peg$parseDIGIT() {
      var s0;

      if (peg$c67.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c68); }
      }

      return s0;
    }

    function peg$parseHEXDIG() {
      var s0;

      if (peg$c148.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c149); }
      }

      return s0;
    }


      var parser, edges, nodes;

      var defaultInPort = "IN", defaultOutPort = "OUT";

      parser = this;
      delete parser.properties;
      delete parser.inports;
      delete parser.outports;
      delete parser.groups;

      edges = parser.edges = [];

      nodes = {};

      var serialize, indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      parser.validateContents = function(graph, options) {
        // Ensure all nodes have a component
        if (graph.processes) {
          Object.keys(graph.processes).forEach(function (node) {
            if (!graph.processes[node].component) {
              throw new Error('Node "' + node + '" does not have a component defined');
            }
          });
        }
        // Ensure all inports point to existing nodes
        if (graph.inports) {
          Object.keys(graph.inports).forEach(function (port) {
            var portDef = graph.inports[port];
            if (!graph.processes[portDef.process]) {
              throw new Error('Inport "' + port + '" is connected to an undefined target node "' + portDef.process + '"');
            }
          });
        }
        // Ensure all outports point to existing nodes
        if (graph.outports) {
          Object.keys(graph.outports).forEach(function (port) {
            var portDef = graph.outports[port];
            if (!graph.processes[portDef.process]) {
              throw new Error('Outport "' + port + '" is connected to an undefined source node "' + portDef.process + '"');
            }
          });
        }
        // Ensure all edges have nodes defined
        if (graph.connections) {
          graph.connections.forEach(function (edge) {
            if (edge.tgt && !graph.processes[edge.tgt.process]) {
              if (edge.data) {
                throw new Error('IIP containing "' + edge.data + '" is connected to an undefined target node "' + edge.tgt.process + '"');
              }
              throw new Error('Edge from "' + edge.src.process + '" port "' + edge.src.port + '" is connected to an undefined target node "' + edge.tgt.process + '"');
            }
            if (edge.src && !graph.processes[edge.src.process]) {
              throw new Error('Edge to "' + edge.tgt.process + '" port "' + edge.tgt.port + '" is connected to an undefined source node "' + edge.src.process + '"');
            }
          });
        }
      };

      parser.serialize = function(graph) {
        var conn, getInOutName, getName, i, inPort, input, len, name, namedComponents, outPort, output, process, ref, ref1, ref2, src, srcName, srcPort, srcProcess, tgt, tgtName, tgtPort, tgtProcess;
        if (options == null) {
          options = {};
        }
        if (typeof(graph) === 'string') {
          input = JSON.parse(graph);
        } else {
          input = graph;
        }
        namedComponents = [];
        output = "";
        getName = function(name) {
          if (input.processes[name].metadata != null) {
            name = input.processes[name].metadata.label;
          }
          if (name.indexOf('/') > -1) {
            name = name.split('/').pop();
          }
          return name;
        };
        getInOutName = function(name, data) {
          if ((data.process != null) && (input.processes[data.process].metadata != null)) {
            name = input.processes[data.process].metadata.label;
          } else if (data.process != null) {
            name = data.process;
          }
          if (name.indexOf('/') > -1) {
            name = name.split('/').pop();
          }
          return name;
        };
        if (input.properties) {
          if (input.properties.environment && input.properties.environment.type) {
            output += "# @runtime " + input.properties.environment.type + "\n";
          }
          Object.keys(input.properties).forEach(function (prop) {
            if (!prop.match(/^[a-zA-Z0-9\-_]+$/)) {
              return;
            }
            var propval = input.properties[prop];
            if (typeof propval !== 'string') {
              return;
            }
            if (!propval.match(/^[a-zA-Z0-9\-_\s\.]+$/)) {
              return;
            }
            output += "# @" + prop + " " + propval + '\n';
          });
        }
        ref = input.inports;
        for (name in ref) {
          inPort = ref[name];
          process = getInOutName(name, inPort);
          name = input.caseSensitive ? name : name.toUpperCase();
          inPort.port = input.caseSensitive ? inPort.port : inPort.port.toUpperCase();
          output += "INPORT=" + process + "." + inPort.port + ":" + name + "\n";
        }
        ref1 = input.outports;
        for (name in ref1) {
          outPort = ref1[name];
          process = getInOutName(name, inPort);
          name = input.caseSensitive ? name : name.toUpperCase();
          outPort.port = input.caseSensitive ? outPort.port : outPort.port.toUpperCase();
          output += "OUTPORT=" + process + "." + outPort.port + ":" + name + "\n";
        }
        output += "\n";
        ref2 = input.connections;
        for (i = 0, len = ref2.length; i < len; i++) {
          conn = ref2[i];
          if (conn.data != null) {
            tgtPort = input.caseSensitive ? conn.tgt.port : conn.tgt.port.toUpperCase();
            tgtName = conn.tgt.process;
            tgtProcess = input.processes[tgtName].component;
            tgt = getName(tgtName);
            if (indexOf.call(namedComponents, tgtProcess) < 0) {
              tgt += "(" + tgtProcess + ")";
              namedComponents.push(tgtProcess);
            }
            output += '"' + conn.data + '"' + (" -> " + tgtPort + " " + tgt + "\n");
          } else {
            srcPort = input.caseSensitive ? conn.src.port : conn.src.port.toUpperCase();
            srcName = conn.src.process;
            srcProcess = input.processes[srcName].component;
            src = getName(srcName);
            if (indexOf.call(namedComponents, srcProcess) < 0) {
              src += "(" + srcProcess + ")";
              namedComponents.push(srcProcess);
            }
            tgtPort = input.caseSensitive ? conn.tgt.port : conn.tgt.port.toUpperCase();
            tgtName = conn.tgt.process;
            tgtProcess = input.processes[tgtName].component;
            tgt = getName(tgtName);
            if (indexOf.call(namedComponents, tgtProcess) < 0) {
              tgt += "(" + tgtProcess + ")";
              namedComponents.push(tgtProcess);
            }
            output += src + " " + srcPort + " -> " + tgtPort + " " + tgt + "\n";
          }
        }
        return output;
      };

      parser.addNode = function (nodeName, comp) {
        if (!nodes[nodeName]) {
          nodes[nodeName] = {}
        }
        if (!!comp.comp) {
          nodes[nodeName].component = comp.comp;
        }
        if (!!comp.meta) {
          var metadata = {};
          for (var i = 0; i < comp.meta.length; i++) {
            var item = comp.meta[i].split('=');
            if (item.length === 1) {
              item = ['routes', item[0]];
            }
            var key = item[0];
            var value = item[1];
            if (key==='x' || key==='y') {
              value = parseFloat(value);
            }
            metadata[key] = value;
          }
          nodes[nodeName].metadata=metadata;
        }

      }

      var anonymousIndexes = {};
      var anonymousNodeNames = {};
      parser.addAnonymousNode = function(comp, offset) {
          if (!anonymousNodeNames[offset]) {
              var componentName = comp.comp.replace(/[^a-zA-Z0-9]+/, "_");
              anonymousIndexes[componentName] = (anonymousIndexes[componentName] || 0) + 1;
              anonymousNodeNames[offset] = "_" + componentName + "_" + anonymousIndexes[componentName];
              this.addNode(anonymousNodeNames[offset], comp);
          }
          return anonymousNodeNames[offset];
      }

      parser.getResult = function () {
        var result = {
          inports: parser.inports || {},
          outports: parser.outports || {},
          groups: parser.groups || [],
          processes: nodes || {},
          connections: parser.processEdges()
        };

        if (parser.properties) {
          result.properties = parser.properties;
        }
        result.caseSensitive = options.caseSensitive || false;

        var validateSchema = parser.validateSchema; // default
        if (typeof(options.validateSchema) !== 'undefined') { validateSchema = options.validateSchema; } // explicit option
        if (validateSchema) {
          if (typeof(tv4) === 'undefined') {
            var tv4 = require("tv4");
          }
          var schema = require("../schema/graph.json");
          var validation = tv4.validateMultiple(result, schema);
          if (!validation.valid) {
            throw new Error("fbp: Did not validate againt graph schema:\n" + JSON.stringify(validation.errors, null, 2));
          }
        }

        if (typeof options.validateContents === 'undefined' || options.validateContents) {
          parser.validateContents(result);
        }

        return result;
      }

      var flatten = function (array, isShallow) {
        var index = -1,
          length = array ? array.length : 0,
          result = [];

        while (++index < length) {
          var value = array[index];

          if (value instanceof Array) {
            Array.prototype.push.apply(result, isShallow ? value : flatten(value));
          }
          else {
            result.push(value);
          }
        }
        return result;
      }

      parser.registerAnnotation = function (key, value) {
        if (!parser.properties) {
          parser.properties = {};
        }

        if (key === 'runtime') {
          parser.properties.environment = {};
          parser.properties.environment.type = value;
          return;
        }

        parser.properties[key] = value;
      };

      parser.registerInports = function (node, port, pub) {
        if (!parser.inports) {
          parser.inports = {};
        }

        if (!options.caseSensitive) {
          pub = pub.toLowerCase();
          port = port.toLowerCase();
        }

        parser.inports[pub] = {process:node, port:port};
      }
      parser.registerOutports = function (node, port, pub) {
        if (!parser.outports) {
          parser.outports = {};
        }

        if (!options.caseSensitive) {
          pub = pub.toLowerCase();
          port = port.toLowerCase();
        }

        parser.outports[pub] = {process:node, port:port};
      }

      parser.registerEdges = function (edges) {
        if (Array.isArray(edges)) {
          edges.forEach(function (o, i) {
            parser.edges.push(o);
          });
        }
      }

      parser.processEdges = function () {
        var flats, grouped;
        flats = flatten(parser.edges);
        grouped = [];
        var current = {};
        for (var i = 1; i < flats.length; i += 1) {
            // skip over default ports at the beginning of lines (could also handle this in grammar)
            if (("src" in flats[i - 1] || "data" in flats[i - 1]) && "tgt" in flats[i]) {
                flats[i - 1].tgt = flats[i].tgt;
                grouped.push(flats[i - 1]);
                i++;
            }
        }
        return grouped;
      }

      function makeName(s) {
        return s[0] + s[1].join("");
      }

      function makePort(process, port, defaultPort) {
        if (!options.caseSensitive) {
          defaultPort = defaultPort.toLowerCase()
        }
        var p = {
            process: process,
            port: port ? port.port : defaultPort
        };
        if (port && port.index != null) {
            p.index = port.index;
        }
        return p;
    }

      function makeInPort(process, port) {
          return makePort(process, port, defaultInPort);
      }
      function makeOutPort(process, port) {
          return makePort(process, port, defaultOutPort);
      }


    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(
        null,
        peg$maxFailExpected,
        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
        peg$maxFailPos < input.length
          ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
          : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
      );
    }
  }

  return {
    SyntaxError: peg$SyntaxError,
    parse:       peg$parse
  };
})();
},{"../schema/graph.json":13,"tv4":17}],13:[function(require,module,exports){
module.exports={
  "$schema": "http://json-schema.org/draft-04/schema",
  "id": "graph.json",
  "title": "FBP graph",
  "description": "A graph of FBP processes and connections between them.\nThis is the primary way of specifying FBP programs.\n",
  "name": "graph",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "caseSensitive": {
      "type": "boolean",
      "description": "Whether the graph port identifiers should be treated as case-sensitive"
    },
    "properties": {
      "type": "object",
      "description": "User-defined properties attached to the graph.",
      "additionalProperties": true,
      "properties": {
        "name": {
          "type": "string",
          "description": "Name of the graph"
        },
        "environment": {
          "type": "object",
          "description": "Information about the execution environment for the graph",
          "additionalProperties": true,
          "required": [
            "type"
          ],
          "properties": {
            "type": {
              "type": "string",
              "description": "Runtime type the graph is for",
              "example": "noflo-nodejs"
            },
            "content": {
              "type": "string",
              "description": "HTML fixture for browser-based graphs"
            }
          }
        },
        "description": {
          "type": "string",
          "description": "Graph description"
        },
        "icon": {
          "type": "string",
          "description": "Name of the icon that can be used for depicting the graph"
        }
      }
    },
    "inports": {
      "type": [
        "object",
        "undefined"
      ],
      "description": "Exported inports of the graph",
      "additionalProperties": true,
      "patternProperties": {
        "[a-z0-9]+": {
          "type": "object",
          "properties": {
            "process": {
              "type": "string"
            },
            "port": {
              "type": "string"
            },
            "metadata": {
              "type": "object",
              "additionalProperties": true,
              "required": [],
              "properties": {
                "x": {
                  "type": "integer",
                  "description": "X coordinate of a graph inport"
                },
                "y": {
                  "type": "integer",
                  "description": "Y coordinate of a graph inport"
                }
              }
            }
          }
        }
      }
    },
    "outports": {
      "type": [
        "object",
        "undefined"
      ],
      "description": "Exported outports of the graph",
      "additionalProperties": true,
      "patternProperties": {
        "[a-z0-9]+": {
          "type": "object",
          "properties": {
            "process": {
              "type": "string"
            },
            "port": {
              "type": "string"
            },
            "metadata": {
              "type": "object",
              "required": [],
              "additionalProperties": true,
              "properties": {
                "x": {
                  "type": "integer",
                  "description": "X coordinate of a graph outport"
                },
                "y": {
                  "type": "integer",
                  "description": "Y coordinate of a graph outport"
                }
              }
            }
          }
        }
      }
    },
    "groups": {
      "type": "array",
      "description": "List of groups of processes",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string"
          },
          "nodes": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "metadata": {
            "type": "object",
            "additionalProperties": true,
            "required": [],
            "properties": {
              "description": {
                "type": "string"
              }
            }
          }
        }
      }
    },
    "processes": {
      "type": "object",
      "description": "The processes of this graph.\nEach process is an instance of a component.\n",
      "additionalProperties": false,
      "patternProperties": {
        "[a-zA-Z0-9_]+": {
          "type": "object",
          "properties": {
            "component": {
              "type": "string"
            },
            "metadata": {
              "type": "object",
              "additionalProperties": true,
              "required": [],
              "properties": {
                "x": {
                  "type": "integer",
                  "description": "X coordinate of a graph node"
                },
                "y": {
                  "type": "integer",
                  "description": "Y coordinate of a graph node"
                }
              }
            }
          }
        }
      }
    },
    "connections": {
      "type": "array",
      "description": "Connections of the graph.\nA connection either connects ports of two processes, or specifices an IIP as initial input packet to a port.\n",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "src": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "process": {
                "type": "string"
              },
              "port": {
                "type": "string"
              },
              "index": {
                "type": "integer"
              }
            }
          },
          "tgt": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "process": {
                "type": "string"
              },
              "port": {
                "type": "string"
              },
              "index": {
                "type": "integer"
              }
            }
          },
          "data": {},
          "metadata": {
            "type": "object",
            "additionalProperties": true,
            "required": [],
            "properties": {
              "route": {
                "type": "integer",
                "description": "Route identifier of a graph edge"
              },
              "schema": {
                "type": "string",
                "format": "uri",
                "description": "JSON schema associated with a graph edge"
              },
              "secure": {
                "type": "boolean",
                "description": "Whether edge data should be treated as secure"
              }
            }
          }
        }
      }
    }
  }
}
},{}],14:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],15:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],16:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],17:[function(require,module,exports){
/*
Author: Geraint Luff and others
Year: 2013

This code is released into the "public domain" by its author(s).  Anybody may use, alter and distribute the code without restriction.  The author makes no guarantees, and takes no liability of any kind for use of this code.

If you find a bug or make an improvement, it would be courteous to let the author know, but it is not compulsory.
*/
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module !== 'undefined' && module.exports){
    // CommonJS. Define export.
    module.exports = factory();
  } else {
    // Browser globals
    global.tv4 = factory();
  }
}(this, function () {

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FObject%2Fkeys
if (!Object.keys) {
	Object.keys = (function () {
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
			dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			],
			dontEnumsLength = dontEnums.length;

		return function (obj) {
			if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) {
				throw new TypeError('Object.keys called on non-object');
			}

			var result = [];

			for (var prop in obj) {
				if (hasOwnProperty.call(obj, prop)) {
					result.push(prop);
				}
			}

			if (hasDontEnumBug) {
				for (var i=0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i])) {
						result.push(dontEnums[i]);
					}
				}
			}
			return result;
		};
	})();
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
if (!Object.create) {
	Object.create = (function(){
		function F(){}

		return function(o){
			if (arguments.length !== 1) {
				throw new Error('Object.create implementation only accepts one parameter.');
			}
			F.prototype = o;
			return new F();
		};
	})();
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FArray%2FisArray
if(!Array.isArray) {
	Array.isArray = function (vArg) {
		return Object.prototype.toString.call(vArg) === "[object Array]";
	};
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FArray%2FindexOf
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
		if (this === null) {
			throw new TypeError();
		}
		var t = Object(this);
		var len = t.length >>> 0;

		if (len === 0) {
			return -1;
		}
		var n = 0;
		if (arguments.length > 1) {
			n = Number(arguments[1]);
			if (n !== n) { // shortcut for verifying if it's NaN
				n = 0;
			} else if (n !== 0 && n !== Infinity && n !== -Infinity) {
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}
		}
		if (n >= len) {
			return -1;
		}
		var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
		for (; k < len; k++) {
			if (k in t && t[k] === searchElement) {
				return k;
			}
		}
		return -1;
	};
}

// Grungey Object.isFrozen hack
if (!Object.isFrozen) {
	Object.isFrozen = function (obj) {
		var key = "tv4_test_frozen_key";
		while (obj.hasOwnProperty(key)) {
			key += Math.random();
		}
		try {
			obj[key] = true;
			delete obj[key];
			return false;
		} catch (e) {
			return true;
		}
	};
}
// Based on: https://github.com/geraintluff/uri-templates, but with all the de-substitution stuff removed

var uriTemplateGlobalModifiers = {
	"+": true,
	"#": true,
	".": true,
	"/": true,
	";": true,
	"?": true,
	"&": true
};
var uriTemplateSuffices = {
	"*": true
};

function notReallyPercentEncode(string) {
	return encodeURI(string).replace(/%25[0-9][0-9]/g, function (doubleEncoded) {
		return "%" + doubleEncoded.substring(3);
	});
}

function uriTemplateSubstitution(spec) {
	var modifier = "";
	if (uriTemplateGlobalModifiers[spec.charAt(0)]) {
		modifier = spec.charAt(0);
		spec = spec.substring(1);
	}
	var separator = "";
	var prefix = "";
	var shouldEscape = true;
	var showVariables = false;
	var trimEmptyString = false;
	if (modifier === '+') {
		shouldEscape = false;
	} else if (modifier === ".") {
		prefix = ".";
		separator = ".";
	} else if (modifier === "/") {
		prefix = "/";
		separator = "/";
	} else if (modifier === '#') {
		prefix = "#";
		shouldEscape = false;
	} else if (modifier === ';') {
		prefix = ";";
		separator = ";";
		showVariables = true;
		trimEmptyString = true;
	} else if (modifier === '?') {
		prefix = "?";
		separator = "&";
		showVariables = true;
	} else if (modifier === '&') {
		prefix = "&";
		separator = "&";
		showVariables = true;
	}

	var varNames = [];
	var varList = spec.split(",");
	var varSpecs = [];
	var varSpecMap = {};
	for (var i = 0; i < varList.length; i++) {
		var varName = varList[i];
		var truncate = null;
		if (varName.indexOf(":") !== -1) {
			var parts = varName.split(":");
			varName = parts[0];
			truncate = parseInt(parts[1], 10);
		}
		var suffices = {};
		while (uriTemplateSuffices[varName.charAt(varName.length - 1)]) {
			suffices[varName.charAt(varName.length - 1)] = true;
			varName = varName.substring(0, varName.length - 1);
		}
		var varSpec = {
			truncate: truncate,
			name: varName,
			suffices: suffices
		};
		varSpecs.push(varSpec);
		varSpecMap[varName] = varSpec;
		varNames.push(varName);
	}
	var subFunction = function (valueFunction) {
		var result = "";
		var startIndex = 0;
		for (var i = 0; i < varSpecs.length; i++) {
			var varSpec = varSpecs[i];
			var value = valueFunction(varSpec.name);
			if (value === null || value === undefined || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0)) {
				startIndex++;
				continue;
			}
			if (i === startIndex) {
				result += prefix;
			} else {
				result += (separator || ",");
			}
			if (Array.isArray(value)) {
				if (showVariables) {
					result += varSpec.name + "=";
				}
				for (var j = 0; j < value.length; j++) {
					if (j > 0) {
						result += varSpec.suffices['*'] ? (separator || ",") : ",";
						if (varSpec.suffices['*'] && showVariables) {
							result += varSpec.name + "=";
						}
					}
					result += shouldEscape ? encodeURIComponent(value[j]).replace(/!/g, "%21") : notReallyPercentEncode(value[j]);
				}
			} else if (typeof value === "object") {
				if (showVariables && !varSpec.suffices['*']) {
					result += varSpec.name + "=";
				}
				var first = true;
				for (var key in value) {
					if (!first) {
						result += varSpec.suffices['*'] ? (separator || ",") : ",";
					}
					first = false;
					result += shouldEscape ? encodeURIComponent(key).replace(/!/g, "%21") : notReallyPercentEncode(key);
					result += varSpec.suffices['*'] ? '=' : ",";
					result += shouldEscape ? encodeURIComponent(value[key]).replace(/!/g, "%21") : notReallyPercentEncode(value[key]);
				}
			} else {
				if (showVariables) {
					result += varSpec.name;
					if (!trimEmptyString || value !== "") {
						result += "=";
					}
				}
				if (varSpec.truncate != null) {
					value = value.substring(0, varSpec.truncate);
				}
				result += shouldEscape ? encodeURIComponent(value).replace(/!/g, "%21"): notReallyPercentEncode(value);
			}
		}
		return result;
	};
	subFunction.varNames = varNames;
	return {
		prefix: prefix,
		substitution: subFunction
	};
}

function UriTemplate(template) {
	if (!(this instanceof UriTemplate)) {
		return new UriTemplate(template);
	}
	var parts = template.split("{");
	var textParts = [parts.shift()];
	var prefixes = [];
	var substitutions = [];
	var varNames = [];
	while (parts.length > 0) {
		var part = parts.shift();
		var spec = part.split("}")[0];
		var remainder = part.substring(spec.length + 1);
		var funcs = uriTemplateSubstitution(spec);
		substitutions.push(funcs.substitution);
		prefixes.push(funcs.prefix);
		textParts.push(remainder);
		varNames = varNames.concat(funcs.substitution.varNames);
	}
	this.fill = function (valueFunction) {
		var result = textParts[0];
		for (var i = 0; i < substitutions.length; i++) {
			var substitution = substitutions[i];
			result += substitution(valueFunction);
			result += textParts[i + 1];
		}
		return result;
	};
	this.varNames = varNames;
	this.template = template;
}
UriTemplate.prototype = {
	toString: function () {
		return this.template;
	},
	fillFromObject: function (obj) {
		return this.fill(function (varName) {
			return obj[varName];
		});
	}
};
var ValidatorContext = function ValidatorContext(parent, collectMultiple, errorReporter, checkRecursive, trackUnknownProperties) {
	this.missing = [];
	this.missingMap = {};
	this.formatValidators = parent ? Object.create(parent.formatValidators) : {};
	this.schemas = parent ? Object.create(parent.schemas) : {};
	this.collectMultiple = collectMultiple;
	this.errors = [];
	this.handleError = collectMultiple ? this.collectError : this.returnError;
	if (checkRecursive) {
		this.checkRecursive = true;
		this.scanned = [];
		this.scannedFrozen = [];
		this.scannedFrozenSchemas = [];
		this.scannedFrozenValidationErrors = [];
		this.validatedSchemasKey = 'tv4_validation_id';
		this.validationErrorsKey = 'tv4_validation_errors_id';
	}
	if (trackUnknownProperties) {
		this.trackUnknownProperties = true;
		this.knownPropertyPaths = {};
		this.unknownPropertyPaths = {};
	}
	this.errorReporter = errorReporter || defaultErrorReporter('en');
	if (typeof this.errorReporter === 'string') {
		throw new Error('debug');
	}
	this.definedKeywords = {};
	if (parent) {
		for (var key in parent.definedKeywords) {
			this.definedKeywords[key] = parent.definedKeywords[key].slice(0);
		}
	}
};
ValidatorContext.prototype.defineKeyword = function (keyword, keywordFunction) {
	this.definedKeywords[keyword] = this.definedKeywords[keyword] || [];
	this.definedKeywords[keyword].push(keywordFunction);
};
ValidatorContext.prototype.createError = function (code, messageParams, dataPath, schemaPath, subErrors, data, schema) {
	var error = new ValidationError(code, messageParams, dataPath, schemaPath, subErrors);
	error.message = this.errorReporter(error, data, schema);
	return error;
};
ValidatorContext.prototype.returnError = function (error) {
	return error;
};
ValidatorContext.prototype.collectError = function (error) {
	if (error) {
		this.errors.push(error);
	}
	return null;
};
ValidatorContext.prototype.prefixErrors = function (startIndex, dataPath, schemaPath) {
	for (var i = startIndex; i < this.errors.length; i++) {
		this.errors[i] = this.errors[i].prefixWith(dataPath, schemaPath);
	}
	return this;
};
ValidatorContext.prototype.banUnknownProperties = function (data, schema) {
	for (var unknownPath in this.unknownPropertyPaths) {
		var error = this.createError(ErrorCodes.UNKNOWN_PROPERTY, {path: unknownPath}, unknownPath, "", null, data, schema);
		var result = this.handleError(error);
		if (result) {
			return result;
		}
	}
	return null;
};

ValidatorContext.prototype.addFormat = function (format, validator) {
	if (typeof format === 'object') {
		for (var key in format) {
			this.addFormat(key, format[key]);
		}
		return this;
	}
	this.formatValidators[format] = validator;
};
ValidatorContext.prototype.resolveRefs = function (schema, urlHistory) {
	if (schema['$ref'] !== undefined) {
		urlHistory = urlHistory || {};
		if (urlHistory[schema['$ref']]) {
			return this.createError(ErrorCodes.CIRCULAR_REFERENCE, {urls: Object.keys(urlHistory).join(', ')}, '', '', null, undefined, schema);
		}
		urlHistory[schema['$ref']] = true;
		schema = this.getSchema(schema['$ref'], urlHistory);
	}
	return schema;
};
ValidatorContext.prototype.getSchema = function (url, urlHistory) {
	var schema;
	if (this.schemas[url] !== undefined) {
		schema = this.schemas[url];
		return this.resolveRefs(schema, urlHistory);
	}
	var baseUrl = url;
	var fragment = "";
	if (url.indexOf('#') !== -1) {
		fragment = url.substring(url.indexOf("#") + 1);
		baseUrl = url.substring(0, url.indexOf("#"));
	}
	if (typeof this.schemas[baseUrl] === 'object') {
		schema = this.schemas[baseUrl];
		var pointerPath = decodeURIComponent(fragment);
		if (pointerPath === "") {
			return this.resolveRefs(schema, urlHistory);
		} else if (pointerPath.charAt(0) !== "/") {
			return undefined;
		}
		var parts = pointerPath.split("/").slice(1);
		for (var i = 0; i < parts.length; i++) {
			var component = parts[i].replace(/~1/g, "/").replace(/~0/g, "~");
			if (schema[component] === undefined) {
				schema = undefined;
				break;
			}
			schema = schema[component];
		}
		if (schema !== undefined) {
			return this.resolveRefs(schema, urlHistory);
		}
	}
	if (this.missing[baseUrl] === undefined) {
		this.missing.push(baseUrl);
		this.missing[baseUrl] = baseUrl;
		this.missingMap[baseUrl] = baseUrl;
	}
};
ValidatorContext.prototype.searchSchemas = function (schema, url) {
	if (Array.isArray(schema)) {
		for (var i = 0; i < schema.length; i++) {
			this.searchSchemas(schema[i], url);
		}
	} else if (schema && typeof schema === "object") {
		if (typeof schema.id === "string") {
			if (isTrustedUrl(url, schema.id)) {
				if (this.schemas[schema.id] === undefined) {
					this.schemas[schema.id] = schema;
				}
			}
		}
		for (var key in schema) {
			if (key !== "enum") {
				if (typeof schema[key] === "object") {
					this.searchSchemas(schema[key], url);
				} else if (key === "$ref") {
					var uri = getDocumentUri(schema[key]);
					if (uri && this.schemas[uri] === undefined && this.missingMap[uri] === undefined) {
						this.missingMap[uri] = uri;
					}
				}
			}
		}
	}
};
ValidatorContext.prototype.addSchema = function (url, schema) {
	//overload
	if (typeof url !== 'string' || typeof schema === 'undefined') {
		if (typeof url === 'object' && typeof url.id === 'string') {
			schema = url;
			url = schema.id;
		}
		else {
			return;
		}
	}
	if (url === getDocumentUri(url) + "#") {
		// Remove empty fragment
		url = getDocumentUri(url);
	}
	this.schemas[url] = schema;
	delete this.missingMap[url];
	normSchema(schema, url);
	this.searchSchemas(schema, url);
};

ValidatorContext.prototype.getSchemaMap = function () {
	var map = {};
	for (var key in this.schemas) {
		map[key] = this.schemas[key];
	}
	return map;
};

ValidatorContext.prototype.getSchemaUris = function (filterRegExp) {
	var list = [];
	for (var key in this.schemas) {
		if (!filterRegExp || filterRegExp.test(key)) {
			list.push(key);
		}
	}
	return list;
};

ValidatorContext.prototype.getMissingUris = function (filterRegExp) {
	var list = [];
	for (var key in this.missingMap) {
		if (!filterRegExp || filterRegExp.test(key)) {
			list.push(key);
		}
	}
	return list;
};

ValidatorContext.prototype.dropSchemas = function () {
	this.schemas = {};
	this.reset();
};
ValidatorContext.prototype.reset = function () {
	this.missing = [];
	this.missingMap = {};
	this.errors = [];
};

ValidatorContext.prototype.validateAll = function (data, schema, dataPathParts, schemaPathParts, dataPointerPath) {
	var topLevel;
	schema = this.resolveRefs(schema);
	if (!schema) {
		return null;
	} else if (schema instanceof ValidationError) {
		this.errors.push(schema);
		return schema;
	}

	var startErrorCount = this.errors.length;
	var frozenIndex, scannedFrozenSchemaIndex = null, scannedSchemasIndex = null;
	if (this.checkRecursive && data && typeof data === 'object') {
		topLevel = !this.scanned.length;
		if (data[this.validatedSchemasKey]) {
			var schemaIndex = data[this.validatedSchemasKey].indexOf(schema);
			if (schemaIndex !== -1) {
				this.errors = this.errors.concat(data[this.validationErrorsKey][schemaIndex]);
				return null;
			}
		}
		if (Object.isFrozen(data)) {
			frozenIndex = this.scannedFrozen.indexOf(data);
			if (frozenIndex !== -1) {
				var frozenSchemaIndex = this.scannedFrozenSchemas[frozenIndex].indexOf(schema);
				if (frozenSchemaIndex !== -1) {
					this.errors = this.errors.concat(this.scannedFrozenValidationErrors[frozenIndex][frozenSchemaIndex]);
					return null;
				}
			}
		}
		this.scanned.push(data);
		if (Object.isFrozen(data)) {
			if (frozenIndex === -1) {
				frozenIndex = this.scannedFrozen.length;
				this.scannedFrozen.push(data);
				this.scannedFrozenSchemas.push([]);
			}
			scannedFrozenSchemaIndex = this.scannedFrozenSchemas[frozenIndex].length;
			this.scannedFrozenSchemas[frozenIndex][scannedFrozenSchemaIndex] = schema;
			this.scannedFrozenValidationErrors[frozenIndex][scannedFrozenSchemaIndex] = [];
		} else {
			if (!data[this.validatedSchemasKey]) {
				try {
					Object.defineProperty(data, this.validatedSchemasKey, {
						value: [],
						configurable: true
					});
					Object.defineProperty(data, this.validationErrorsKey, {
						value: [],
						configurable: true
					});
				} catch (e) {
					//IE 7/8 workaround
					data[this.validatedSchemasKey] = [];
					data[this.validationErrorsKey] = [];
				}
			}
			scannedSchemasIndex = data[this.validatedSchemasKey].length;
			data[this.validatedSchemasKey][scannedSchemasIndex] = schema;
			data[this.validationErrorsKey][scannedSchemasIndex] = [];
		}
	}

	var errorCount = this.errors.length;
	var error = this.validateBasic(data, schema, dataPointerPath)
		|| this.validateNumeric(data, schema, dataPointerPath)
		|| this.validateString(data, schema, dataPointerPath)
		|| this.validateArray(data, schema, dataPointerPath)
		|| this.validateObject(data, schema, dataPointerPath)
		|| this.validateCombinations(data, schema, dataPointerPath)
		|| this.validateHypermedia(data, schema, dataPointerPath)
		|| this.validateFormat(data, schema, dataPointerPath)
		|| this.validateDefinedKeywords(data, schema, dataPointerPath)
		|| null;

	if (topLevel) {
		while (this.scanned.length) {
			var item = this.scanned.pop();
			delete item[this.validatedSchemasKey];
		}
		this.scannedFrozen = [];
		this.scannedFrozenSchemas = [];
	}

	if (error || errorCount !== this.errors.length) {
		while ((dataPathParts && dataPathParts.length) || (schemaPathParts && schemaPathParts.length)) {
			var dataPart = (dataPathParts && dataPathParts.length) ? "" + dataPathParts.pop() : null;
			var schemaPart = (schemaPathParts && schemaPathParts.length) ? "" + schemaPathParts.pop() : null;
			if (error) {
				error = error.prefixWith(dataPart, schemaPart);
			}
			this.prefixErrors(errorCount, dataPart, schemaPart);
		}
	}

	if (scannedFrozenSchemaIndex !== null) {
		this.scannedFrozenValidationErrors[frozenIndex][scannedFrozenSchemaIndex] = this.errors.slice(startErrorCount);
	} else if (scannedSchemasIndex !== null) {
		data[this.validationErrorsKey][scannedSchemasIndex] = this.errors.slice(startErrorCount);
	}

	return this.handleError(error);
};
ValidatorContext.prototype.validateFormat = function (data, schema) {
	if (typeof schema.format !== 'string' || !this.formatValidators[schema.format]) {
		return null;
	}
	var errorMessage = this.formatValidators[schema.format].call(null, data, schema);
	if (typeof errorMessage === 'string' || typeof errorMessage === 'number') {
		return this.createError(ErrorCodes.FORMAT_CUSTOM, {message: errorMessage}, '', '/format', null, data, schema);
	} else if (errorMessage && typeof errorMessage === 'object') {
		return this.createError(ErrorCodes.FORMAT_CUSTOM, {message: errorMessage.message || "?"}, errorMessage.dataPath || '', errorMessage.schemaPath || "/format", null, data, schema);
	}
	return null;
};
ValidatorContext.prototype.validateDefinedKeywords = function (data, schema, dataPointerPath) {
	for (var key in this.definedKeywords) {
		if (typeof schema[key] === 'undefined') {
			continue;
		}
		var validationFunctions = this.definedKeywords[key];
		for (var i = 0; i < validationFunctions.length; i++) {
			var func = validationFunctions[i];
			var result = func(data, schema[key], schema, dataPointerPath);
			if (typeof result === 'string' || typeof result === 'number') {
				return this.createError(ErrorCodes.KEYWORD_CUSTOM, {key: key, message: result}, '', '', null, data, schema).prefixWith(null, key);
			} else if (result && typeof result === 'object') {
				var code = result.code;
				if (typeof code === 'string') {
					if (!ErrorCodes[code]) {
						throw new Error('Undefined error code (use defineError): ' + code);
					}
					code = ErrorCodes[code];
				} else if (typeof code !== 'number') {
					code = ErrorCodes.KEYWORD_CUSTOM;
				}
				var messageParams = (typeof result.message === 'object') ? result.message : {key: key, message: result.message || "?"};
				var schemaPath = result.schemaPath || ("/" + key.replace(/~/g, '~0').replace(/\//g, '~1'));
				return this.createError(code, messageParams, result.dataPath || null, schemaPath, null, data, schema);
			}
		}
	}
	return null;
};

function recursiveCompare(A, B) {
	if (A === B) {
		return true;
	}
	if (A && B && typeof A === "object" && typeof B === "object") {
		if (Array.isArray(A) !== Array.isArray(B)) {
			return false;
		} else if (Array.isArray(A)) {
			if (A.length !== B.length) {
				return false;
			}
			for (var i = 0; i < A.length; i++) {
				if (!recursiveCompare(A[i], B[i])) {
					return false;
				}
			}
		} else {
			var key;
			for (key in A) {
				if (B[key] === undefined && A[key] !== undefined) {
					return false;
				}
			}
			for (key in B) {
				if (A[key] === undefined && B[key] !== undefined) {
					return false;
				}
			}
			for (key in A) {
				if (!recursiveCompare(A[key], B[key])) {
					return false;
				}
			}
		}
		return true;
	}
	return false;
}

ValidatorContext.prototype.validateBasic = function validateBasic(data, schema, dataPointerPath) {
	var error;
	if (error = this.validateType(data, schema, dataPointerPath)) {
		return error.prefixWith(null, "type");
	}
	if (error = this.validateEnum(data, schema, dataPointerPath)) {
		return error.prefixWith(null, "type");
	}
	return null;
};

ValidatorContext.prototype.validateType = function validateType(data, schema) {
	if (schema.type === undefined) {
		return null;
	}
	var dataType = typeof data;
	if (data === null) {
		dataType = "null";
	} else if (Array.isArray(data)) {
		dataType = "array";
	}
	var allowedTypes = schema.type;
	if (!Array.isArray(allowedTypes)) {
		allowedTypes = [allowedTypes];
	}

	for (var i = 0; i < allowedTypes.length; i++) {
		var type = allowedTypes[i];
		if (type === dataType || (type === "integer" && dataType === "number" && (data % 1 === 0))) {
			return null;
		}
	}
	return this.createError(ErrorCodes.INVALID_TYPE, {type: dataType, expected: allowedTypes.join("/")}, '', '', null, data, schema);
};

ValidatorContext.prototype.validateEnum = function validateEnum(data, schema) {
	if (schema["enum"] === undefined) {
		return null;
	}
	for (var i = 0; i < schema["enum"].length; i++) {
		var enumVal = schema["enum"][i];
		if (recursiveCompare(data, enumVal)) {
			return null;
		}
	}
	return this.createError(ErrorCodes.ENUM_MISMATCH, {value: (typeof JSON !== 'undefined') ? JSON.stringify(data) : data}, '', '', null, data, schema);
};

ValidatorContext.prototype.validateNumeric = function validateNumeric(data, schema, dataPointerPath) {
	return this.validateMultipleOf(data, schema, dataPointerPath)
		|| this.validateMinMax(data, schema, dataPointerPath)
		|| this.validateNaN(data, schema, dataPointerPath)
		|| null;
};

var CLOSE_ENOUGH_LOW = Math.pow(2, -51);
var CLOSE_ENOUGH_HIGH = 1 - CLOSE_ENOUGH_LOW;
ValidatorContext.prototype.validateMultipleOf = function validateMultipleOf(data, schema) {
	var multipleOf = schema.multipleOf || schema.divisibleBy;
	if (multipleOf === undefined) {
		return null;
	}
	if (typeof data === "number") {
		var remainder = (data/multipleOf)%1;
		if (remainder >= CLOSE_ENOUGH_LOW && remainder < CLOSE_ENOUGH_HIGH) {
			return this.createError(ErrorCodes.NUMBER_MULTIPLE_OF, {value: data, multipleOf: multipleOf}, '', '', null, data, schema);
		}
	}
	return null;
};

ValidatorContext.prototype.validateMinMax = function validateMinMax(data, schema) {
	if (typeof data !== "number") {
		return null;
	}
	if (schema.minimum !== undefined) {
		if (data < schema.minimum) {
			return this.createError(ErrorCodes.NUMBER_MINIMUM, {value: data, minimum: schema.minimum}, '', '/minimum', null, data, schema);
		}
		if (schema.exclusiveMinimum && data === schema.minimum) {
			return this.createError(ErrorCodes.NUMBER_MINIMUM_EXCLUSIVE, {value: data, minimum: schema.minimum}, '', '/exclusiveMinimum', null, data, schema);
		}
	}
	if (schema.maximum !== undefined) {
		if (data > schema.maximum) {
			return this.createError(ErrorCodes.NUMBER_MAXIMUM, {value: data, maximum: schema.maximum}, '', '/maximum', null, data, schema);
		}
		if (schema.exclusiveMaximum && data === schema.maximum) {
			return this.createError(ErrorCodes.NUMBER_MAXIMUM_EXCLUSIVE, {value: data, maximum: schema.maximum}, '', '/exclusiveMaximum', null, data, schema);
		}
	}
	return null;
};

ValidatorContext.prototype.validateNaN = function validateNaN(data, schema) {
	if (typeof data !== "number") {
		return null;
	}
	if (isNaN(data) === true || data === Infinity || data === -Infinity) {
		return this.createError(ErrorCodes.NUMBER_NOT_A_NUMBER, {value: data}, '', '/type', null, data, schema);
	}
	return null;
};

ValidatorContext.prototype.validateString = function validateString(data, schema, dataPointerPath) {
	return this.validateStringLength(data, schema, dataPointerPath)
		|| this.validateStringPattern(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateStringLength = function validateStringLength(data, schema) {
	if (typeof data !== "string") {
		return null;
	}
	if (schema.minLength !== undefined) {
		if (data.length < schema.minLength) {
			return this.createError(ErrorCodes.STRING_LENGTH_SHORT, {length: data.length, minimum: schema.minLength}, '', '/minLength', null, data, schema);
		}
	}
	if (schema.maxLength !== undefined) {
		if (data.length > schema.maxLength) {
			return this.createError(ErrorCodes.STRING_LENGTH_LONG, {length: data.length, maximum: schema.maxLength}, '', '/maxLength', null, data, schema);
		}
	}
	return null;
};

ValidatorContext.prototype.validateStringPattern = function validateStringPattern(data, schema) {
	if (typeof data !== "string" || (typeof schema.pattern !== "string" && !(schema.pattern instanceof RegExp))) {
		return null;
	}
	var regexp;
	if (schema.pattern instanceof RegExp) {
	  regexp = schema.pattern;
	}
	else {
	  var body, flags = '';
	  // Check for regular expression literals
	  // @see http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.5
	  var literal = schema.pattern.match(/^\/(.+)\/([img]*)$/);
	  if (literal) {
	    body = literal[1];
	    flags = literal[2];
	  }
	  else {
	    body = schema.pattern;
	  }
	  regexp = new RegExp(body, flags);
	}
	if (!regexp.test(data)) {
		return this.createError(ErrorCodes.STRING_PATTERN, {pattern: schema.pattern}, '', '/pattern', null, data, schema);
	}
	return null;
};

ValidatorContext.prototype.validateArray = function validateArray(data, schema, dataPointerPath) {
	if (!Array.isArray(data)) {
		return null;
	}
	return this.validateArrayLength(data, schema, dataPointerPath)
		|| this.validateArrayUniqueItems(data, schema, dataPointerPath)
		|| this.validateArrayItems(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateArrayLength = function validateArrayLength(data, schema) {
	var error;
	if (schema.minItems !== undefined) {
		if (data.length < schema.minItems) {
			error = this.createError(ErrorCodes.ARRAY_LENGTH_SHORT, {length: data.length, minimum: schema.minItems}, '', '/minItems', null, data, schema);
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	if (schema.maxItems !== undefined) {
		if (data.length > schema.maxItems) {
			error = this.createError(ErrorCodes.ARRAY_LENGTH_LONG, {length: data.length, maximum: schema.maxItems}, '', '/maxItems', null, data, schema);
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateArrayUniqueItems = function validateArrayUniqueItems(data, schema) {
	if (schema.uniqueItems) {
		for (var i = 0; i < data.length; i++) {
			for (var j = i + 1; j < data.length; j++) {
				if (recursiveCompare(data[i], data[j])) {
					var error = this.createError(ErrorCodes.ARRAY_UNIQUE, {match1: i, match2: j}, '', '/uniqueItems', null, data, schema);
					if (this.handleError(error)) {
						return error;
					}
				}
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateArrayItems = function validateArrayItems(data, schema, dataPointerPath) {
	if (schema.items === undefined) {
		return null;
	}
	var error, i;
	if (Array.isArray(schema.items)) {
		for (i = 0; i < data.length; i++) {
			if (i < schema.items.length) {
				if (error = this.validateAll(data[i], schema.items[i], [i], ["items", i], dataPointerPath + "/" + i)) {
					return error;
				}
			} else if (schema.additionalItems !== undefined) {
				if (typeof schema.additionalItems === "boolean") {
					if (!schema.additionalItems) {
						error = (this.createError(ErrorCodes.ARRAY_ADDITIONAL_ITEMS, {}, '/' + i, '/additionalItems', null, data, schema));
						if (this.handleError(error)) {
							return error;
						}
					}
				} else if (error = this.validateAll(data[i], schema.additionalItems, [i], ["additionalItems"], dataPointerPath + "/" + i)) {
					return error;
				}
			}
		}
	} else {
		for (i = 0; i < data.length; i++) {
			if (error = this.validateAll(data[i], schema.items, [i], ["items"], dataPointerPath + "/" + i)) {
				return error;
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateObject = function validateObject(data, schema, dataPointerPath) {
	if (typeof data !== "object" || data === null || Array.isArray(data)) {
		return null;
	}
	return this.validateObjectMinMaxProperties(data, schema, dataPointerPath)
		|| this.validateObjectRequiredProperties(data, schema, dataPointerPath)
		|| this.validateObjectProperties(data, schema, dataPointerPath)
		|| this.validateObjectDependencies(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateObjectMinMaxProperties = function validateObjectMinMaxProperties(data, schema) {
	var keys = Object.keys(data);
	var error;
	if (schema.minProperties !== undefined) {
		if (keys.length < schema.minProperties) {
			error = this.createError(ErrorCodes.OBJECT_PROPERTIES_MINIMUM, {propertyCount: keys.length, minimum: schema.minProperties}, '', '/minProperties', null, data, schema);
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	if (schema.maxProperties !== undefined) {
		if (keys.length > schema.maxProperties) {
			error = this.createError(ErrorCodes.OBJECT_PROPERTIES_MAXIMUM, {propertyCount: keys.length, maximum: schema.maxProperties}, '', '/maxProperties', null, data, schema);
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateObjectRequiredProperties = function validateObjectRequiredProperties(data, schema) {
	if (schema.required !== undefined) {
		for (var i = 0; i < schema.required.length; i++) {
			var key = schema.required[i];
			if (data[key] === undefined) {
				var error = this.createError(ErrorCodes.OBJECT_REQUIRED, {key: key}, '', '/required/' + i, null, data, schema);
				if (this.handleError(error)) {
					return error;
				}
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateObjectProperties = function validateObjectProperties(data, schema, dataPointerPath) {
	var error;
	for (var key in data) {
		var keyPointerPath = dataPointerPath + "/" + key.replace(/~/g, '~0').replace(/\//g, '~1');
		var foundMatch = false;
		if (schema.properties !== undefined && schema.properties[key] !== undefined) {
			foundMatch = true;
			if (error = this.validateAll(data[key], schema.properties[key], [key], ["properties", key], keyPointerPath)) {
				return error;
			}
		}
		if (schema.patternProperties !== undefined) {
			for (var patternKey in schema.patternProperties) {
				var regexp = new RegExp(patternKey);
				if (regexp.test(key)) {
					foundMatch = true;
					if (error = this.validateAll(data[key], schema.patternProperties[patternKey], [key], ["patternProperties", patternKey], keyPointerPath)) {
						return error;
					}
				}
			}
		}
		if (!foundMatch) {
			if (schema.additionalProperties !== undefined) {
				if (this.trackUnknownProperties) {
					this.knownPropertyPaths[keyPointerPath] = true;
					delete this.unknownPropertyPaths[keyPointerPath];
				}
				if (typeof schema.additionalProperties === "boolean") {
					if (!schema.additionalProperties) {
						error = this.createError(ErrorCodes.OBJECT_ADDITIONAL_PROPERTIES, {key: key}, '', '/additionalProperties', null, data, schema).prefixWith(key, null);
						if (this.handleError(error)) {
							return error;
						}
					}
				} else {
					if (error = this.validateAll(data[key], schema.additionalProperties, [key], ["additionalProperties"], keyPointerPath)) {
						return error;
					}
				}
			} else if (this.trackUnknownProperties && !this.knownPropertyPaths[keyPointerPath]) {
				this.unknownPropertyPaths[keyPointerPath] = true;
			}
		} else if (this.trackUnknownProperties) {
			this.knownPropertyPaths[keyPointerPath] = true;
			delete this.unknownPropertyPaths[keyPointerPath];
		}
	}
	return null;
};

ValidatorContext.prototype.validateObjectDependencies = function validateObjectDependencies(data, schema, dataPointerPath) {
	var error;
	if (schema.dependencies !== undefined) {
		for (var depKey in schema.dependencies) {
			if (data[depKey] !== undefined) {
				var dep = schema.dependencies[depKey];
				if (typeof dep === "string") {
					if (data[dep] === undefined) {
						error = this.createError(ErrorCodes.OBJECT_DEPENDENCY_KEY, {key: depKey, missing: dep}, '', '', null, data, schema).prefixWith(null, depKey).prefixWith(null, "dependencies");
						if (this.handleError(error)) {
							return error;
						}
					}
				} else if (Array.isArray(dep)) {
					for (var i = 0; i < dep.length; i++) {
						var requiredKey = dep[i];
						if (data[requiredKey] === undefined) {
							error = this.createError(ErrorCodes.OBJECT_DEPENDENCY_KEY, {key: depKey, missing: requiredKey}, '', '/' + i, null, data, schema).prefixWith(null, depKey).prefixWith(null, "dependencies");
							if (this.handleError(error)) {
								return error;
							}
						}
					}
				} else {
					if (error = this.validateAll(data, dep, [], ["dependencies", depKey], dataPointerPath)) {
						return error;
					}
				}
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateCombinations = function validateCombinations(data, schema, dataPointerPath) {
	return this.validateAllOf(data, schema, dataPointerPath)
		|| this.validateAnyOf(data, schema, dataPointerPath)
		|| this.validateOneOf(data, schema, dataPointerPath)
		|| this.validateNot(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateAllOf = function validateAllOf(data, schema, dataPointerPath) {
	if (schema.allOf === undefined) {
		return null;
	}
	var error;
	for (var i = 0; i < schema.allOf.length; i++) {
		var subSchema = schema.allOf[i];
		if (error = this.validateAll(data, subSchema, [], ["allOf", i], dataPointerPath)) {
			return error;
		}
	}
	return null;
};

ValidatorContext.prototype.validateAnyOf = function validateAnyOf(data, schema, dataPointerPath) {
	if (schema.anyOf === undefined) {
		return null;
	}
	var errors = [];
	var startErrorCount = this.errors.length;
	var oldUnknownPropertyPaths, oldKnownPropertyPaths;
	if (this.trackUnknownProperties) {
		oldUnknownPropertyPaths = this.unknownPropertyPaths;
		oldKnownPropertyPaths = this.knownPropertyPaths;
	}
	var errorAtEnd = true;
	for (var i = 0; i < schema.anyOf.length; i++) {
		if (this.trackUnknownProperties) {
			this.unknownPropertyPaths = {};
			this.knownPropertyPaths = {};
		}
		var subSchema = schema.anyOf[i];

		var errorCount = this.errors.length;
		var error = this.validateAll(data, subSchema, [], ["anyOf", i], dataPointerPath);

		if (error === null && errorCount === this.errors.length) {
			this.errors = this.errors.slice(0, startErrorCount);

			if (this.trackUnknownProperties) {
				for (var knownKey in this.knownPropertyPaths) {
					oldKnownPropertyPaths[knownKey] = true;
					delete oldUnknownPropertyPaths[knownKey];
				}
				for (var unknownKey in this.unknownPropertyPaths) {
					if (!oldKnownPropertyPaths[unknownKey]) {
						oldUnknownPropertyPaths[unknownKey] = true;
					}
				}
				// We need to continue looping so we catch all the property definitions, but we don't want to return an error
				errorAtEnd = false;
				continue;
			}

			return null;
		}
		if (error) {
			errors.push(error.prefixWith(null, "" + i).prefixWith(null, "anyOf"));
		}
	}
	if (this.trackUnknownProperties) {
		this.unknownPropertyPaths = oldUnknownPropertyPaths;
		this.knownPropertyPaths = oldKnownPropertyPaths;
	}
	if (errorAtEnd) {
		errors = errors.concat(this.errors.slice(startErrorCount));
		this.errors = this.errors.slice(0, startErrorCount);
		return this.createError(ErrorCodes.ANY_OF_MISSING, {}, "", "/anyOf", errors, data, schema);
	}
};

ValidatorContext.prototype.validateOneOf = function validateOneOf(data, schema, dataPointerPath) {
	if (schema.oneOf === undefined) {
		return null;
	}
	var validIndex = null;
	var errors = [];
	var startErrorCount = this.errors.length;
	var oldUnknownPropertyPaths, oldKnownPropertyPaths;
	if (this.trackUnknownProperties) {
		oldUnknownPropertyPaths = this.unknownPropertyPaths;
		oldKnownPropertyPaths = this.knownPropertyPaths;
	}
	for (var i = 0; i < schema.oneOf.length; i++) {
		if (this.trackUnknownProperties) {
			this.unknownPropertyPaths = {};
			this.knownPropertyPaths = {};
		}
		var subSchema = schema.oneOf[i];

		var errorCount = this.errors.length;
		var error = this.validateAll(data, subSchema, [], ["oneOf", i], dataPointerPath);

		if (error === null && errorCount === this.errors.length) {
			if (validIndex === null) {
				validIndex = i;
			} else {
				this.errors = this.errors.slice(0, startErrorCount);
				return this.createError(ErrorCodes.ONE_OF_MULTIPLE, {index1: validIndex, index2: i}, "", "/oneOf", null, data, schema);
			}
			if (this.trackUnknownProperties) {
				for (var knownKey in this.knownPropertyPaths) {
					oldKnownPropertyPaths[knownKey] = true;
					delete oldUnknownPropertyPaths[knownKey];
				}
				for (var unknownKey in this.unknownPropertyPaths) {
					if (!oldKnownPropertyPaths[unknownKey]) {
						oldUnknownPropertyPaths[unknownKey] = true;
					}
				}
			}
		} else if (error) {
			errors.push(error);
		}
	}
	if (this.trackUnknownProperties) {
		this.unknownPropertyPaths = oldUnknownPropertyPaths;
		this.knownPropertyPaths = oldKnownPropertyPaths;
	}
	if (validIndex === null) {
		errors = errors.concat(this.errors.slice(startErrorCount));
		this.errors = this.errors.slice(0, startErrorCount);
		return this.createError(ErrorCodes.ONE_OF_MISSING, {}, "", "/oneOf", errors, data, schema);
	} else {
		this.errors = this.errors.slice(0, startErrorCount);
	}
	return null;
};

ValidatorContext.prototype.validateNot = function validateNot(data, schema, dataPointerPath) {
	if (schema.not === undefined) {
		return null;
	}
	var oldErrorCount = this.errors.length;
	var oldUnknownPropertyPaths, oldKnownPropertyPaths;
	if (this.trackUnknownProperties) {
		oldUnknownPropertyPaths = this.unknownPropertyPaths;
		oldKnownPropertyPaths = this.knownPropertyPaths;
		this.unknownPropertyPaths = {};
		this.knownPropertyPaths = {};
	}
	var error = this.validateAll(data, schema.not, null, null, dataPointerPath);
	var notErrors = this.errors.slice(oldErrorCount);
	this.errors = this.errors.slice(0, oldErrorCount);
	if (this.trackUnknownProperties) {
		this.unknownPropertyPaths = oldUnknownPropertyPaths;
		this.knownPropertyPaths = oldKnownPropertyPaths;
	}
	if (error === null && notErrors.length === 0) {
		return this.createError(ErrorCodes.NOT_PASSED, {}, "", "/not", null, data, schema);
	}
	return null;
};

ValidatorContext.prototype.validateHypermedia = function validateCombinations(data, schema, dataPointerPath) {
	if (!schema.links) {
		return null;
	}
	var error;
	for (var i = 0; i < schema.links.length; i++) {
		var ldo = schema.links[i];
		if (ldo.rel === "describedby") {
			var template = new UriTemplate(ldo.href);
			var allPresent = true;
			for (var j = 0; j < template.varNames.length; j++) {
				if (!(template.varNames[j] in data)) {
					allPresent = false;
					break;
				}
			}
			if (allPresent) {
				var schemaUrl = template.fillFromObject(data);
				var subSchema = {"$ref": schemaUrl};
				if (error = this.validateAll(data, subSchema, [], ["links", i], dataPointerPath)) {
					return error;
				}
			}
		}
	}
};

// parseURI() and resolveUrl() are from https://gist.github.com/1088850
//   -  released as public domain by author ("Yaffle") - see comments on gist

function parseURI(url) {
	var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
	// authority = '//' + user + ':' + pass '@' + hostname + ':' port
	return (m ? {
		href     : m[0] || '',
		protocol : m[1] || '',
		authority: m[2] || '',
		host     : m[3] || '',
		hostname : m[4] || '',
		port     : m[5] || '',
		pathname : m[6] || '',
		search   : m[7] || '',
		hash     : m[8] || ''
	} : null);
}

function resolveUrl(base, href) {// RFC 3986

	function removeDotSegments(input) {
		var output = [];
		input.replace(/^(\.\.?(\/|$))+/, '')
			.replace(/\/(\.(\/|$))+/g, '/')
			.replace(/\/\.\.$/, '/../')
			.replace(/\/?[^\/]*/g, function (p) {
				if (p === '/..') {
					output.pop();
				} else {
					output.push(p);
				}
		});
		return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
	}

	href = parseURI(href || '');
	base = parseURI(base || '');

	return !href || !base ? null : (href.protocol || base.protocol) +
		(href.protocol || href.authority ? href.authority : base.authority) +
		removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
		(href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
		href.hash;
}

function getDocumentUri(uri) {
	return uri.split('#')[0];
}
function normSchema(schema, baseUri) {
	if (schema && typeof schema === "object") {
		if (baseUri === undefined) {
			baseUri = schema.id;
		} else if (typeof schema.id === "string") {
			baseUri = resolveUrl(baseUri, schema.id);
			schema.id = baseUri;
		}
		if (Array.isArray(schema)) {
			for (var i = 0; i < schema.length; i++) {
				normSchema(schema[i], baseUri);
			}
		} else {
			if (typeof schema['$ref'] === "string") {
				schema['$ref'] = resolveUrl(baseUri, schema['$ref']);
			}
			for (var key in schema) {
				if (key !== "enum") {
					normSchema(schema[key], baseUri);
				}
			}
		}
	}
}

function defaultErrorReporter(language) {
	language = language || 'en';

	var errorMessages = languages[language];

	return function (error) {
		var messageTemplate = errorMessages[error.code] || ErrorMessagesDefault[error.code];
		if (typeof messageTemplate !== 'string') {
			return "Unknown error code " + error.code + ": " + JSON.stringify(error.messageParams);
		}
		var messageParams = error.params;
		// Adapted from Crockford's supplant()
		return messageTemplate.replace(/\{([^{}]*)\}/g, function (whole, varName) {
			var subValue = messageParams[varName];
			return typeof subValue === 'string' || typeof subValue === 'number' ? subValue : whole;
		});
	};
}

var ErrorCodes = {
	INVALID_TYPE: 0,
	ENUM_MISMATCH: 1,
	ANY_OF_MISSING: 10,
	ONE_OF_MISSING: 11,
	ONE_OF_MULTIPLE: 12,
	NOT_PASSED: 13,
	// Numeric errors
	NUMBER_MULTIPLE_OF: 100,
	NUMBER_MINIMUM: 101,
	NUMBER_MINIMUM_EXCLUSIVE: 102,
	NUMBER_MAXIMUM: 103,
	NUMBER_MAXIMUM_EXCLUSIVE: 104,
	NUMBER_NOT_A_NUMBER: 105,
	// String errors
	STRING_LENGTH_SHORT: 200,
	STRING_LENGTH_LONG: 201,
	STRING_PATTERN: 202,
	// Object errors
	OBJECT_PROPERTIES_MINIMUM: 300,
	OBJECT_PROPERTIES_MAXIMUM: 301,
	OBJECT_REQUIRED: 302,
	OBJECT_ADDITIONAL_PROPERTIES: 303,
	OBJECT_DEPENDENCY_KEY: 304,
	// Array errors
	ARRAY_LENGTH_SHORT: 400,
	ARRAY_LENGTH_LONG: 401,
	ARRAY_UNIQUE: 402,
	ARRAY_ADDITIONAL_ITEMS: 403,
	// Custom/user-defined errors
	FORMAT_CUSTOM: 500,
	KEYWORD_CUSTOM: 501,
	// Schema structure
	CIRCULAR_REFERENCE: 600,
	// Non-standard validation options
	UNKNOWN_PROPERTY: 1000
};
var ErrorCodeLookup = {};
for (var key in ErrorCodes) {
	ErrorCodeLookup[ErrorCodes[key]] = key;
}
var ErrorMessagesDefault = {
	INVALID_TYPE: "Invalid type: {type} (expected {expected})",
	ENUM_MISMATCH: "No enum match for: {value}",
	ANY_OF_MISSING: "Data does not match any schemas from \"anyOf\"",
	ONE_OF_MISSING: "Data does not match any schemas from \"oneOf\"",
	ONE_OF_MULTIPLE: "Data is valid against more than one schema from \"oneOf\": indices {index1} and {index2}",
	NOT_PASSED: "Data matches schema from \"not\"",
	// Numeric errors
	NUMBER_MULTIPLE_OF: "Value {value} is not a multiple of {multipleOf}",
	NUMBER_MINIMUM: "Value {value} is less than minimum {minimum}",
	NUMBER_MINIMUM_EXCLUSIVE: "Value {value} is equal to exclusive minimum {minimum}",
	NUMBER_MAXIMUM: "Value {value} is greater than maximum {maximum}",
	NUMBER_MAXIMUM_EXCLUSIVE: "Value {value} is equal to exclusive maximum {maximum}",
	NUMBER_NOT_A_NUMBER: "Value {value} is not a valid number",
	// String errors
	STRING_LENGTH_SHORT: "String is too short ({length} chars), minimum {minimum}",
	STRING_LENGTH_LONG: "String is too long ({length} chars), maximum {maximum}",
	STRING_PATTERN: "String does not match pattern: {pattern}",
	// Object errors
	OBJECT_PROPERTIES_MINIMUM: "Too few properties defined ({propertyCount}), minimum {minimum}",
	OBJECT_PROPERTIES_MAXIMUM: "Too many properties defined ({propertyCount}), maximum {maximum}",
	OBJECT_REQUIRED: "Missing required property: {key}",
	OBJECT_ADDITIONAL_PROPERTIES: "Additional properties not allowed",
	OBJECT_DEPENDENCY_KEY: "Dependency failed - key must exist: {missing} (due to key: {key})",
	// Array errors
	ARRAY_LENGTH_SHORT: "Array is too short ({length}), minimum {minimum}",
	ARRAY_LENGTH_LONG: "Array is too long ({length}), maximum {maximum}",
	ARRAY_UNIQUE: "Array items are not unique (indices {match1} and {match2})",
	ARRAY_ADDITIONAL_ITEMS: "Additional items not allowed",
	// Format errors
	FORMAT_CUSTOM: "Format validation failed ({message})",
	KEYWORD_CUSTOM: "Keyword failed: {key} ({message})",
	// Schema structure
	CIRCULAR_REFERENCE: "Circular $refs: {urls}",
	// Non-standard validation options
	UNKNOWN_PROPERTY: "Unknown property (not in schema)"
};

function ValidationError(code, params, dataPath, schemaPath, subErrors) {
	Error.call(this);
	if (code === undefined) {
		throw new Error ("No error code supplied: " + schemaPath);
	}
	this.message = '';
	this.params = params;
	this.code = code;
	this.dataPath = dataPath || "";
	this.schemaPath = schemaPath || "";
	this.subErrors = subErrors || null;

	var err = new Error(this.message);
	this.stack = err.stack || err.stacktrace;
	if (!this.stack) {
		try {
			throw err;
		}
		catch(err) {
			this.stack = err.stack || err.stacktrace;
		}
	}
}
ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;
ValidationError.prototype.name = 'ValidationError';

ValidationError.prototype.prefixWith = function (dataPrefix, schemaPrefix) {
	if (dataPrefix !== null) {
		dataPrefix = dataPrefix.replace(/~/g, "~0").replace(/\//g, "~1");
		this.dataPath = "/" + dataPrefix + this.dataPath;
	}
	if (schemaPrefix !== null) {
		schemaPrefix = schemaPrefix.replace(/~/g, "~0").replace(/\//g, "~1");
		this.schemaPath = "/" + schemaPrefix + this.schemaPath;
	}
	if (this.subErrors !== null) {
		for (var i = 0; i < this.subErrors.length; i++) {
			this.subErrors[i].prefixWith(dataPrefix, schemaPrefix);
		}
	}
	return this;
};

function isTrustedUrl(baseUrl, testUrl) {
	if(testUrl.substring(0, baseUrl.length) === baseUrl){
		var remainder = testUrl.substring(baseUrl.length);
		if ((testUrl.length > 0 && testUrl.charAt(baseUrl.length - 1) === "/")
			|| remainder.charAt(0) === "#"
			|| remainder.charAt(0) === "?") {
			return true;
		}
	}
	return false;
}

var languages = {};
function createApi(language) {
	var globalContext = new ValidatorContext();
	var currentLanguage;
	var customErrorReporter;
	var api = {
		setErrorReporter: function (reporter) {
			if (typeof reporter === 'string') {
				return this.language(reporter);
			}
			customErrorReporter = reporter;
			return true;
		},
		addFormat: function () {
			globalContext.addFormat.apply(globalContext, arguments);
		},
		language: function (code) {
			if (!code) {
				return currentLanguage;
			}
			if (!languages[code]) {
				code = code.split('-')[0]; // fall back to base language
			}
			if (languages[code]) {
				currentLanguage = code;
				return code; // so you can tell if fall-back has happened
			}
			return false;
		},
		addLanguage: function (code, messageMap) {
			var key;
			for (key in ErrorCodes) {
				if (messageMap[key] && !messageMap[ErrorCodes[key]]) {
					messageMap[ErrorCodes[key]] = messageMap[key];
				}
			}
			var rootCode = code.split('-')[0];
			if (!languages[rootCode]) { // use for base language if not yet defined
				languages[code] = messageMap;
				languages[rootCode] = messageMap;
			} else {
				languages[code] = Object.create(languages[rootCode]);
				for (key in messageMap) {
					if (typeof languages[rootCode][key] === 'undefined') {
						languages[rootCode][key] = messageMap[key];
					}
					languages[code][key] = messageMap[key];
				}
			}
			return this;
		},
		freshApi: function (language) {
			var result = createApi();
			if (language) {
				result.language(language);
			}
			return result;
		},
		validate: function (data, schema, checkRecursive, banUnknownProperties) {
			var def = defaultErrorReporter(currentLanguage);
			var errorReporter = customErrorReporter ? function (error, data, schema) {
				return customErrorReporter(error, data, schema) || def(error, data, schema);
			} : def;
			var context = new ValidatorContext(globalContext, false, errorReporter, checkRecursive, banUnknownProperties);
			if (typeof schema === "string") {
				schema = {"$ref": schema};
			}
			context.addSchema("", schema);
			var error = context.validateAll(data, schema, null, null, "");
			if (!error && banUnknownProperties) {
				error = context.banUnknownProperties(data, schema);
			}
			this.error = error;
			this.missing = context.missing;
			this.valid = (error === null);
			return this.valid;
		},
		validateResult: function () {
			var result = {toString: function () {
				return this.valid ? 'valid' : this.error.message;
			}};
			this.validate.apply(result, arguments);
			return result;
		},
		validateMultiple: function (data, schema, checkRecursive, banUnknownProperties) {
			var def = defaultErrorReporter(currentLanguage);
			var errorReporter = customErrorReporter ? function (error, data, schema) {
				return customErrorReporter(error, data, schema) || def(error, data, schema);
			} : def;
			var context = new ValidatorContext(globalContext, true, errorReporter, checkRecursive, banUnknownProperties);
			if (typeof schema === "string") {
				schema = {"$ref": schema};
			}
			context.addSchema("", schema);
			context.validateAll(data, schema, null, null, "");
			if (banUnknownProperties) {
				context.banUnknownProperties(data, schema);
			}
			var result = {toString: function () {
				return this.valid ? 'valid' : this.error.message;
			}};
			result.errors = context.errors;
			result.missing = context.missing;
			result.valid = (result.errors.length === 0);
			return result;
		},
		addSchema: function () {
			return globalContext.addSchema.apply(globalContext, arguments);
		},
		getSchema: function () {
			return globalContext.getSchema.apply(globalContext, arguments);
		},
		getSchemaMap: function () {
			return globalContext.getSchemaMap.apply(globalContext, arguments);
		},
		getSchemaUris: function () {
			return globalContext.getSchemaUris.apply(globalContext, arguments);
		},
		getMissingUris: function () {
			return globalContext.getMissingUris.apply(globalContext, arguments);
		},
		dropSchemas: function () {
			globalContext.dropSchemas.apply(globalContext, arguments);
		},
		defineKeyword: function () {
			globalContext.defineKeyword.apply(globalContext, arguments);
		},
		defineError: function (codeName, codeNumber, defaultMessage) {
			if (typeof codeName !== 'string' || !/^[A-Z]+(_[A-Z]+)*$/.test(codeName)) {
				throw new Error('Code name must be a string in UPPER_CASE_WITH_UNDERSCORES');
			}
			if (typeof codeNumber !== 'number' || codeNumber%1 !== 0 || codeNumber < 10000) {
				throw new Error('Code number must be an integer > 10000');
			}
			if (typeof ErrorCodes[codeName] !== 'undefined') {
				throw new Error('Error already defined: ' + codeName + ' as ' + ErrorCodes[codeName]);
			}
			if (typeof ErrorCodeLookup[codeNumber] !== 'undefined') {
				throw new Error('Error code already used: ' + ErrorCodeLookup[codeNumber] + ' as ' + codeNumber);
			}
			ErrorCodes[codeName] = codeNumber;
			ErrorCodeLookup[codeNumber] = codeName;
			ErrorMessagesDefault[codeName] = ErrorMessagesDefault[codeNumber] = defaultMessage;
			for (var langCode in languages) {
				var language = languages[langCode];
				if (language[codeName]) {
					language[codeNumber] = language[codeNumber] || language[codeName];
				}
			}
		},
		reset: function () {
			globalContext.reset();
			this.error = null;
			this.missing = [];
			this.valid = true;
		},
		missing: [],
		error: null,
		valid: true,
		normSchema: normSchema,
		resolveUrl: resolveUrl,
		getDocumentUri: getDocumentUri,
		errorCodes: ErrorCodes
	};
	api.language(language || 'en');
	return api;
}

var tv4 = createApi();
tv4.addLanguage('en-gb', ErrorMessagesDefault);

//legacy property
tv4.tv4 = tv4;

return tv4; // used by _header.js to globalise.

}));
},{}],18:[function(require,module,exports){

var clipboardContent = {}; // XXX: hidden state

function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function makeNewId(label) {
  var num = 60466176; // 36^5
  num = Math.floor(Math.random() * num);
  var id = label + '_' + num.toString(36);
  return id;
}

function copy(graph, keys) {
  //Duplicate all the nodes before putting them in clipboard
  //this will make this work also with cut/Paste and once we
  //decide if/how we will implement cross-document copy&paste will work there too
  clipboardContent = {nodes:[], edges:[]};
  var map = {};
  var i, len;
  for (i = 0, len = keys.length; i < len; i++) {
    var node = graph.getNode(keys[i]);
    var newNode = cloneObject(node);
    newNode.id = makeNewId(node.component);
    clipboardContent.nodes.push(newNode);
    map[node.id] = newNode.id;
  }
  for (i = 0, len = graph.edges.length; i < len; i++) {
    var edge = graph.edges[i];
    var fromNode = edge.from.node;
    var toNode = edge.to.node;
    if (map.hasOwnProperty(fromNode) && map.hasOwnProperty(toNode)) {
      var newEdge = cloneObject(edge);
      newEdge.from.node = map[fromNode];
      newEdge.to.node = map[toNode];
      clipboardContent.edges.push(newEdge);
    }
  }

}

function paste(graph) {
  var map = {};
  var pasted = {nodes:[], edges:[]};
  var i, len;
  for (i = 0, len = clipboardContent.nodes.length; i < len; i++) {
    var node = clipboardContent.nodes[i];
    var meta = cloneObject(node.metadata);
    meta.x += 36;
    meta.y += 36;
    var newNode = graph.addNode(makeNewId(node.component), node.component, meta);
    map[node.id] = newNode.id;
    pasted.nodes.push(newNode);
  }
  for (i = 0, len = clipboardContent.edges.length; i < len; i++) {
    var edge = clipboardContent.edges[i];
    var newEdgeMeta = cloneObject(edge.metadata);
    var newEdge;
    if (edge.from.hasOwnProperty('index') || edge.to.hasOwnProperty('index')) {
      // One or both ports are addressable
      var fromIndex = edge.from.index || null;
      var toIndex = edge.to.index || null;
      newEdge = graph.addEdgeIndex(map[edge.from.node], edge.from.port, fromIndex, map[edge.to.node], edge.to.port, toIndex, newEdgeMeta);
    } else {
      newEdge = graph.addEdge(map[edge.from.node], edge.from.port, map[edge.to.node], edge.to.port, newEdgeMeta);
    }
    pasted.edges.push(newEdge);
  }
  return pasted;
}

module.exports = {
  copy: copy,
  paste: paste,
};

},{}],19:[function(require,module,exports){

var Clipboard = require('./clipboard');

// Returns a new datastructure to prevent accidental sharing between diffent editor instances
function getDefaultMenus(editor) {
  console.error('DEPRECATED: TheGraph.menus.getDefaultMenus() will be removed in next version. Specify menus prop manually');

  // FIXME: provide a proper interface for actions to manipulate section, remove @editor
  var pasteAction = function (graph, itemKey, item) {
    var pasted = Clipboard.paste(graph);
    this.selectedNodes = pasted.nodes;
    this.selectedEdges = [];
  }.bind(editor);
  var pasteMenu = {
    icon: "paste",
    iconLabel: "paste",
    action: pasteAction
  };
  // Default context menu defs

  var nodeActions = {
    delete: function (graph, itemKey, item) {
      graph.removeNode(itemKey);
      // Remove selection
      var newSelection = [];
      for (var i=0, len=this.selectedNodes.length; i<len; i++){
        var selected = this.selectedNodes[i];
        if (selected !== item) {
          newSelection.push(selected);
        }
      }
      this.selectedNodes = newSelection;
    }.bind(editor),
    copy: function (graph, itemKey, item) {
      Clipboard.copy(graph, [itemKey]);
    }
  }, edgeActions = {
    delete: function (graph, itemKey, item) {
      graph.removeEdge(item.from.node, item.from.port, item.to.node, item.to.port);
      // Remove selection
      var newSelection = [];
      for (var i=0, len=this.selectedEdges.length; i<len; i++){
        var selected = this.selectedEdges[i];
        if (selected !== item) {
          newSelection.push(selected);
        }
      }
      this.selectedEdges = newSelection;
    }.bind(editor)
  };

  var menus = {
    main: {
      icon: "sitemap",
      e4: pasteMenu
    },
    edge: {
      actions: edgeActions,
      icon: "long-arrow-right",
      s4: {
        icon: "trash-o",
        iconLabel: "delete",
        action: edgeActions.delete
      }
    },
    node: {
      actions: nodeActions,
      s4: {
        icon: "trash-o",
        iconLabel: "delete",
        action: nodeActions.delete
      },
      w4: {
        icon: "copy",
        iconLabel: "copy",
        action:  nodeActions.copy
      }
    },
    nodeInport: {
      w4: {
        icon: "sign-in",
        iconLabel: "export",
        action: function (graph, itemKey, item) {
          var pub = item.port;
          if (pub === 'start') {
            pub = 'start1';
          }
          if (pub === 'graph') {
            pub = 'graph1';
          }
          var count = 0;
          // Make sure public is unique
          while (graph.inports[pub]) {
            count++;
            pub = item.port + count;
          }
          var priNode = graph.getNode(item.process);
          var metadata = {x:priNode.metadata.x-144, y:priNode.metadata.y};
          graph.addInport(pub, item.process, item.port, metadata);
        }
      }
    },
    nodeOutport: {
      e4: {
        icon: "sign-out",
        iconLabel: "export",
        action: function (graph, itemKey, item) {
          var pub = item.port;
          var count = 0;
          // Make sure public is unique
          while (graph.outports[pub]) {
            count++;
            pub = item.port + count;
          }
          var priNode = graph.getNode(item.process);
          var metadata = {x:priNode.metadata.x+144, y:priNode.metadata.y};
          graph.addOutport(pub, item.process, item.port, metadata);
        }
      }
    },
    graphInport: {
      icon: "sign-in",
      iconColor: 2,
      n4: {
        label: "inport"
      },
      s4: {
        icon: "trash-o",
        iconLabel: "delete",
        action: function (graph, itemKey, item) {
          graph.removeInport(itemKey);
        }
      }
    },
    graphOutport: {
      icon: "sign-out",
      iconColor: 5,
      n4: {
        label: "outport"
      },
      s4: {
        icon: "trash-o",
        iconLabel: "delete",
        action: function (graph, itemKey, item) {
          graph.removeOutport(itemKey);
        }
      }
    },
    group: {
      icon: "th",
      s4: {
        icon: "trash-o",
        iconLabel: "ungroup",
        action: function (graph, itemKey, item) {
          graph.removeGroup(itemKey);
        }
      },
      // TODO copy group?
      e4: pasteMenu
    },
    selection: {
      icon: "th",
      w4: {
        icon: "copy",
        iconLabel: "copy",
        action: function (graph, itemKey, item) {
          Clipboard.copy(graph, item.nodes);
        }
      },
      e4: pasteMenu
    }
  };
  return menus;
}

module.exports = {
  getDefaultMenus: getDefaultMenus, 
};

},{"./clipboard":18}],20:[function(require,module,exports){

var React = require('react');
var createReactClass = require('create-react-class');
var Hammer = require('hammerjs');
var thumb = require('../the-graph-thumb/the-graph-thumb.js');

function calculateStyleFromTheme(theme) {
  var style = {};
  if (theme === "dark") {
    style.viewBoxBorder =  "hsla(190, 100%, 80%, 0.4)";
    style.viewBoxBorder2 = "hsla( 10,  60%, 32%, 0.3)";
    style.outsideFill = "hsla(0, 0%, 0%, 0.4)";
    style.backgroundColor = "hsla(0, 0%, 0%, 0.9)";
  } else {
    style.viewBoxBorder =  "hsla(190, 100%, 20%, 0.8)";
    style.viewBoxBorder2 = "hsla( 10,  60%, 80%, 0.8)";
    style.outsideFill = "hsla(0, 0%, 100%, 0.4)";
    style.backgroundColor = "hsla(0, 0%, 100%, 0.9)";
  }
  return style;
}

function renderViewRectangle(context, viewrect, props) {

  context.clearRect(0, 0, props.width, props.height);
  context.fillStyle = props.outsideFill;

  // Scaled view rectangle
  var x = Math.round( (props.viewrectangle[0]/props.scale - props.thumbrectangle[0]) * props.thumbscale );
  var y = Math.round( (props.viewrectangle[1]/props.scale - props.thumbrectangle[1]) * props.thumbscale );
  var w = Math.round( props.viewrectangle[2] * props.thumbscale / props.scale );
  var h = Math.round( props.viewrectangle[3] * props.thumbscale / props.scale );

  var hide = false;
  if (x<0 && y<0 && w>props.width-x && h>props.height-y) {
    // Hide map
    hide = true;
    return {
      hide: hide
    };
  } else {
    // Show map
    hide = false;
  }

  // Clip to bounds
  // Left
  if (x < 0) { 
    w += x; 
    x = 0;
    viewrect.style.borderLeftColor = props.viewBoxBorder2;
  } else {
    viewrect.style.borderLeftColor = props.viewBoxBorder;
    context.fillRect(0, 0, x, props.height);
  }
  // Top
  if (y < 0) { 
    h += y; 
    y = 0;
    viewrect.style.borderTopColor = props.viewBoxBorder2;
  } else {
    viewrect.style.borderTopColor = props.viewBoxBorder;
    context.fillRect(x, 0, w, y);
  }
  // Right
  if (w > props.width-x) { 
    w = props.width-x;
    viewrect.style.borderRightColor = props.viewBoxBorder2;
  } else {
    viewrect.style.borderRightColor = props.viewBoxBorder;
    context.fillRect(x+w, 0, props.width-(x+w), props.height);
  }
  // Bottom
  if (h > props.height-y) { 
    h = props.height-y;
    viewrect.style.borderBottomColor = props.viewBoxBorder2;
  } else {
    viewrect.style.borderBottomColor = props.viewBoxBorder;
    context.fillRect(x, y+h, w, props.height-(y+h));
  }

  // Size and translate rect
  viewrect.style.left = x+"px";
  viewrect.style.top = y+"px";
  viewrect.style.width = w+"px";
  viewrect.style.height = h+"px";

  return {
    hide: hide
  };

}

function renderThumbnailFromProps(context, props) {
    var style = {};
    for (var name in props) {
      style[name] = props[name];
    }
    style.graph = null;
    style.lineWidth = props.nodeLineWidth;
    var info = thumb.render(context, props.graph, style);
    return info;
}
function renderViewboxFromProps(context, viewbox, thumbInfo, props) {
    var style = {};
    for (var name in props) {
      style[name] = props[name];
    }
    style.graph = null;
    style.scale = props.viewscale;
    var thumbW = thumbInfo.rectangle[2];
    var thumbH = thumbInfo.rectangle[3];
    style.thumbscale = (thumbW>thumbH) ? props.width/thumbW : props.height/thumbH;
    style.thumbrectangle = thumbInfo.rectangle;
    var info = renderViewRectangle(context, viewbox, style);
    return info;
}

// https://toddmotto.com/react-create-class-versus-component/
var Component = createReactClass({
  propTypes: {
  },
  getDefaultProps: function() {
    return {
      width: 200,
      height: 150,
      hidden: false, // FIXME: drop??
      backgroundColor: "hsla(184, 8%, 75%, 0.9)",
      outsideFill: "hsla(0, 0%, 0%, 0.4)",
      nodeSize: 60,
      nodeLineWidth: 1,
      viewrectangle: [0, 0, 0, 0],
      viewscale: 1.0,
      viewBoxBorder: "hsla(190, 100%, 80%, 0.4)",
      viewBoxBorder2: "hsla( 10,  60%, 32%, 0.3)",
      viewBoxBorderStyle: 'dotted',
      graph: null, // NOTE: should not attach to events, that is responsibility of outer code
    };
  },
  getInitialState: function() {
    return {
      thumbscale: 1.0,
      currentPan: [0.0, 0.0],
    };
  },
  render: function() {
    var p = this.props;
    var thumbStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
    };
    var wrapperStyle = {
      height: p.height,
      width: p.width,
      overflow: "hidden",
      cursor: "move",
      backgroundColor: p.backgroundColor,
    };
    var thumbProps = {
      key: 'thumb',
      ref: this._refThumbCanvas,
      width: p.width,
      height: p.height,
      style: thumbStyle,
    };
    var viewboxCanvas = {
      key: 'viewbox',
      ref: this._refViewboxCanvas,
      width: p.width,
      height: p.height,
      style: thumbStyle,
    };
    // FIXME: find better way to populate the props from render function
    var viewboxDiv = {
      key: 'viewboxdiv',
      ref: this._refViewboxElement,
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: p.width,
        height: p.height,
        borderStyle: 'dotted',
        borderWidth: 1,
      },
    };
    // Elements
    return React.createElement('div', { key: 'nav', style: wrapperStyle, ref: this._refTopElement }, [
      React.createElement('div', viewboxDiv ),
      React.createElement('canvas', viewboxCanvas ),
      React.createElement('canvas', thumbProps ),
    ]);
  },
  componentDidUpdate: function() {
    this._updatePan();
    this._renderElements();
  },
  componentDidMount: function() {
    this._updatePan();
    this._renderElements();
    this._setupEvents();
  },
  _refThumbCanvas: function(canvas) {
      this._thumbContext = canvas.getContext('2d');
  },
  _refViewboxCanvas: function(canvas) {
      this._viewboxContext = canvas.getContext('2d');
  },
  _refViewboxElement: function(el) {
      this._viewboxElement = el;
  },
  _refTopElement: function(el) {
      this._topElement = el;
  },
  _renderElements: function() {
    var t = renderThumbnailFromProps(this._thumbContext, this.props);
    //this.state.thumbscale = t.scale;
    renderViewboxFromProps(this._viewboxContext, this._viewboxElement, t, this.props);
  },
  _updatePan: function() {
    this.state.currentPan = [
      -(this.props.viewrectangle[0]),
      -(this.props.viewrectangle[1]),
    ];
  },
  _setupEvents: function() {
    this.hammer = new Hammer.Manager(this._topElement, {
      recognizers: [
        [ Hammer.Tap ],
        [ Hammer.Pan, { direction: Hammer.DIRECTION_ALL } ],
      ],
    });
    this.hammer.on('tap', (function(event) {
      if (this.props.onTap) {
        this.props.onTap(null, event);
      }
    }).bind(this));
    this.hammer.on('panmove', (function(event) {
      if (this.props.onPanTo) {
        // Calculate where event pans to, in editor coordinates
        var x = this.state.currentPan[0];
        var y = this.state.currentPan[1];
        var panscale = this.state.thumbscale / this.props.viewscale;
        x -= event.deltaX / panscale;
        y -= event.deltaY / panscale;
        var panTo = { x: Math.round(x), y: Math.round(y) };
        // keep track of the current pan, because prop/component update
        // may be delayed, or never arrive.
        this.state.currentPan[0] = panTo.x;
        this.state.currentPan[1] = panTo.y;
        this.props.onPanTo(panTo, event);
      }
    }).bind(this));
  }
});


module.exports = {
  render: renderViewRectangle,
  calculateStyleFromTheme: calculateStyleFromTheme,
  Component: Component,
};

},{"../the-graph-thumb/the-graph-thumb.js":21,"create-react-class":"create-react-class","hammerjs":"hammerjs","react":"react"}],21:[function(require,module,exports){

function drawEdge(context, scale, source, target, route, properties) {
  // Draw path
  try {
    context.strokeStyle = properties.edgeColors[0];
    if (route) {
      // Color if route defined
      context.strokeStyle = properties.edgeColors[route];
    }
    var fromX = Math.round(source.metadata.x*scale)-0.5;
    var fromY = Math.round(source.metadata.y*scale)-0.5;
    var toX = Math.round(target.metadata.x*scale)-0.5;
    var toY = Math.round(target.metadata.y*scale)-0.5;
    context.beginPath();
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.stroke();
  } catch (error) {
    // FIXME: handle?
  }
}

function styleFromTheme(theme) {
  var style = {};
  if (theme === "dark") {
    style.fill = "hsl(184, 8%, 10%)";
    style.stroke = "hsl(180, 11%, 70%)";
    style.edgeColors = [
      "white",
      "hsl(  0, 100%, 46%)",
      "hsl( 35, 100%, 46%)",
      "hsl( 60, 100%, 46%)",
      "hsl(135, 100%, 46%)",
      "hsl(160, 100%, 46%)",
      "hsl(185, 100%, 46%)",
      "hsl(210, 100%, 46%)",
      "hsl(285, 100%, 46%)",
      "hsl(310, 100%, 46%)",
      "hsl(335, 100%, 46%)"
    ];

  } else {
    // Light
    style.fill = "hsl(184, 8%, 75%)";
    style.stroke = "hsl(180, 11%, 20%)";
    // Tweaked to make thin lines more visible
    style.edgeColors = [
      "hsl(  0,   0%, 50%)",
      "hsl(  0, 100%, 40%)",
      "hsl( 29, 100%, 40%)",
      "hsl( 47, 100%, 40%)",
      "hsl(138, 100%, 40%)",
      "hsl(160,  73%, 50%)",
      "hsl(181, 100%, 40%)",
      "hsl(216, 100%, 40%)",
      "hsl(260, 100%, 40%)",
      "hsl(348, 100%, 50%)",
      "hsl(328, 100%, 40%)"
    ];
  }
  return style;
}

function renderThumbnail(context, graph, properties) {

    // Reset origin
    context.setTransform(1,0,0,1,0,0);
    // Clear
    context.clearRect(0, 0, properties.width, properties.height);
    context.lineWidth = properties.lineWidth;

    // Find dimensions
    var toDraw = [];
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    var nodes = {};

    // Process nodes
    graph.nodes.forEach(function(process){
      if ( process.metadata && !isNaN(process.metadata.x) && !isNaN(process.metadata.y) ) {
        toDraw.push(process);
        nodes[process.id] = process;
        minX = Math.min(minX, process.metadata.x);
        minY = Math.min(minY, process.metadata.y);
        maxX = Math.max(maxX, process.metadata.x);
        maxY = Math.max(maxY, process.metadata.y);
      }
    }.bind(this));

    // Process exported ports
    if (graph.inports) {
      Object.keys(graph.inports).forEach(function(key){
        var exp = graph.inports[key];
        if ( exp.metadata && !isNaN(exp.metadata.x) && !isNaN(exp.metadata.y) ) {
          toDraw.push(exp);
          minX = Math.min(minX, exp.metadata.x);
          minY = Math.min(minY, exp.metadata.y);
          maxX = Math.max(maxX, exp.metadata.x);
          maxY = Math.max(maxY, exp.metadata.y);
        }
      }.bind(this));
    }
    if (graph.outports) {
      Object.keys(graph.outports).forEach(function(key){
        var exp = graph.outports[key];
        if ( exp.metadata && !isNaN(exp.metadata.x) && !isNaN(exp.metadata.y) ) {
          toDraw.push(exp);
          minX = Math.min(minX, exp.metadata.x);
          minY = Math.min(minY, exp.metadata.y);
          maxX = Math.max(maxX, exp.metadata.x);
          maxY = Math.max(maxY, exp.metadata.y);
        }
      }.bind(this));
    }

    // Nothing to draw
    if (toDraw.length === 0) {
      return { scale: 1.0, rectangle: [0, 0, 0, 0] };
    }

    // Sanity check graph size
    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY) ) {
      throw new Error("the-graph-thumb: Invalid space spanned");
    }

    minX -= properties.nodeSize;
    minY -= properties.nodeSize;
    maxX += properties.nodeSize*2;
    maxY += properties.nodeSize*2;
    var w = maxX - minX;
    var h = maxY - minY;
    // For the-graph-nav to bind
    var thumbrectangle = [];
    thumbrectangle[0] = minX;
    thumbrectangle[1] = minY;
    thumbrectangle[2] = w;
    thumbrectangle[3] = h;
    // Scale dimensions
    var scale = (w > h) ? properties.width/w : properties.height/h;
    var thumbscale = scale;
    var size = Math.round(properties.nodeSize * scale);
    var sizeHalf = size / 2;
    // Translate origin to match
    context.setTransform(1,0,0,1,0-minX*scale,0-minY*scale);

    // Draw connection from inports to nodes
    if (graph.inports) {
      Object.keys(graph.inports).forEach(function(key){
        var exp = graph.inports[key];
        if ( exp.metadata && !isNaN(exp.metadata.x) && !isNaN(exp.metadata.y) ) {
          var target = nodes[exp.process];
          if (!target) {
            return;
          }
          drawEdge(context, scale, exp, target, 2, properties);
        }
      }.bind(this));
    }
    // Draw connection from nodes to outports
    if (graph.outports) {
      Object.keys(graph.outports).forEach(function(key){
        var exp = graph.outports[key];
        if ( exp.metadata && !isNaN(exp.metadata.x) && !isNaN(exp.metadata.y) ) {
          var source = nodes[exp.process];
          if (!source) {
            return;
          }
          drawEdge(context, scale, source, exp, 5, properties);
        }
      }.bind(this));
    }

    // Draw edges
    graph.edges.forEach(function (connection){
      var source = nodes[connection.from.node];
      var target = nodes[connection.to.node];
      if (!source || !target) {
        return;
      }
      drawEdge(context, scale, source, target, connection.metadata.route, properties);
    }.bind(this));

    // Draw nodes
    toDraw.forEach(function (node){
      var x = Math.round(node.metadata.x * scale);
      var y = Math.round(node.metadata.y * scale);

      // Outer circle
      context.strokeStyle = properties.strokeStyle;
      context.fillStyle = properties.fillStyle;
      context.beginPath();
      if (node.process && !node.component) {
        context.arc(x, y, sizeHalf / 2, 0, 2*Math.PI, false);
      } else {
        context.arc(x, y, sizeHalf, 0, 2*Math.PI, false);
      }
      context.fill();
      context.stroke();

      // Inner circle
      context.beginPath();
      var smallRadius = Math.max(sizeHalf-1.5, 1);
      if (node.process && !node.component) {
        // Exported port
        context.arc(x, y, smallRadius / 2, 0, 2*Math.PI, false);
      } else {
        // Regular node
        context.arc(x, y, smallRadius, 0, 2*Math.PI, false);
      }
      context.fill();

    }.bind(this));

    return {
      rectangle: thumbrectangle,
      scale: thumbscale
    };
}

module.exports = {
  render: renderThumbnail,
  styleFromTheme: styleFromTheme,
};

},{}],22:[function(require,module,exports){
var React = require('react');
var createReactClass = require('create-react-class');

var SVGImage = React.createFactory( createReactClass({
  displayName: "TheGraphSVGImage",
  render: function() {
      var html = '<image ';
      html = html +'xlink:href="'+ this.props.src + '"';
      html = html +'x="' + this.props.x + '"';
      html = html +'y="' + this.props.y + '"';
      html = html +'width="' + this.props.width + '"';
      html = html +'height="' + this.props.height + '"';
      html = html +'/>';

      return React.createElement('g', {
          className: this.props.className,
          dangerouslySetInnerHTML:{__html: html}
      });
  }
}));

module.exports = SVGImage;

},{"create-react-class":"create-react-class","react":"react"}],23:[function(require,module,exports){
var React = require('react');
var createReactClass = require('create-react-class');

var TextBG = React.createFactory( createReactClass({
  displayName: "TheGraphTextBG",
  render: function() {
    var text = this.props.text;
    if (!text) {
      text = "";
    }
    var height = this.props.height;
    var width = text.length * this.props.height * 2/3;
    var radius = this.props.height/2;

    var textAnchor = "start";
    var dominantBaseline = "central";
    var x = this.props.x;
    var y = this.props.y - height/2;

    if (this.props.halign === "center") {
      x -= width/2;
      textAnchor = "middle";
    }
    if (this.props.halign === "right") {
      x -= width;
      textAnchor = "end";
    }

    return React.createElement(
      'g',
      {
        className: (this.props.className ? this.props.className : "text-bg"),
      },
      React.createElement('rect', {
        className: "text-bg-rect",
        x: x,
        y: y,
        rx: radius,
        ry: radius,
        height: height * 1.1,
        width: width
      }),
      React.createElement('text', {
        className: (this.props.textClassName ? this.props.textClassName : "text-bg-text"),
        x: this.props.x,
        y: this.props.y,
        children: text
      })
    );
  }
}));

module.exports = TextBG;

},{"create-react-class":"create-react-class","react":"react"}],24:[function(require,module,exports){
// SVG arc math
var angleToX = function (percent, radius) {
  return radius * Math.cos(2*Math.PI * percent);
};
var angleToY = function (percent, radius) {
  return radius * Math.sin(2*Math.PI * percent);
};
var makeArcPath = function (startPercent, endPercent, radius) {
  return [ 
    "M", angleToX(startPercent, radius), angleToY(startPercent, radius),
    "A", radius, radius, 0, 0, 0, angleToX(endPercent, radius), angleToY(endPercent, radius)
  ].join(" ");
};
var arcs = {
  n4: makeArcPath(7/8, 5/8, 36),
  s4: makeArcPath(3/8, 1/8, 36),
  e4: makeArcPath(1/8, -1/8, 36),
  w4: makeArcPath(5/8, 3/8, 36),
  inport: makeArcPath(-1/4, 1/4, 4),
  outport: makeArcPath(1/4, -1/4, 4),
  inportBig: makeArcPath(-1/4, 1/4, 6),
  outportBig: makeArcPath(1/4, -1/4, 6),
};
module.exports = arcs;

},{}],25:[function(require,module,exports){
var React = require('react');

var SVGImage = require('./SVGImage'); 

// Standard functions for creating SVG/HTML elements
exports.createGroup = function(options, content) {
  var args = ['g', options];

  if (Array.isArray(content)) {
    args = args.concat(content);
  }

  return React.createElement.apply(React, args);
};

exports.createRect = function(options) {
  return React.createElement('rect', options);
};

exports.createText = function(options) {
  return React.createElement('text', options);
};

exports.createCircle = function(options) {
  return React.createElement('circle', options);
};

exports.createPath = function(options) {
  return React.createElement('path', options);
};

exports.createPolygon = function(options) {
  return React.createElement('polygon', options);
};

exports.createImg = function(options) {
  return TheGraph.SVGImage(options);
};

exports.createCanvas = function(options) {
  return React.createElement('canvas', options);
};

exports.createSvg = function(options, content) {

  var args = ['svg', options];

  if (Array.isArray(content)) {
    args = args.concat(content);
  }

  return React.createElement.apply(React, args);
};

},{"./SVGImage":22,"react":"react"}],26:[function(require,module,exports){
/*
  this file is generated via `grunt build` 
*/


FONT_AWESOME = {
  "500px": "",
  "address-book": "",
  "address-book-o": "",
  "address-card": "",
  "address-card-o": "",
  "adjust": "",
  "adn": "",
  "align-center": "",
  "align-justify": "",
  "align-left": "",
  "align-right": "",
  "amazon": "",
  "ambulance": "",
  "american-sign-language-interpreting": "",
  "anchor": "",
  "android": "",
  "angellist": "",
  "angle-double-down": "",
  "angle-double-left": "",
  "angle-double-right": "",
  "angle-double-up": "",
  "angle-down": "",
  "angle-left": "",
  "angle-right": "",
  "angle-up": "",
  "apple": "",
  "archive": "",
  "area-chart": "",
  "arrow-circle-down": "",
  "arrow-circle-left": "",
  "arrow-circle-o-down": "",
  "arrow-circle-o-left": "",
  "arrow-circle-o-right": "",
  "arrow-circle-o-up": "",
  "arrow-circle-right": "",
  "arrow-circle-up": "",
  "arrow-down": "",
  "arrow-left": "",
  "arrow-right": "",
  "arrow-up": "",
  "arrows": "",
  "arrows-alt": "",
  "arrows-h": "",
  "arrows-v": "",
  "asl-interpreting": "",
  "assistive-listening-systems": "",
  "asterisk": "",
  "at": "",
  "audio-description": "",
  "automobile": "",
  "backward": "",
  "balance-scale": "",
  "ban": "",
  "bandcamp": "",
  "bank": "",
  "bar-chart": "",
  "bar-chart-o": "",
  "barcode": "",
  "bars": "",
  "bath": "",
  "bathtub": "",
  "battery": "",
  "battery-0": "",
  "battery-1": "",
  "battery-2": "",
  "battery-3": "",
  "battery-4": "",
  "battery-empty": "",
  "battery-full": "",
  "battery-half": "",
  "battery-quarter": "",
  "battery-three-quarters": "",
  "bed": "",
  "beer": "",
  "behance": "",
  "behance-square": "",
  "bell": "",
  "bell-o": "",
  "bell-slash": "",
  "bell-slash-o": "",
  "bicycle": "",
  "binoculars": "",
  "birthday-cake": "",
  "bitbucket": "",
  "bitbucket-square": "",
  "bitcoin": "",
  "black-tie": "",
  "blind": "",
  "bluetooth": "",
  "bluetooth-b": "",
  "bold": "",
  "bolt": "",
  "bomb": "",
  "book": "",
  "bookmark": "",
  "bookmark-o": "",
  "braille": "",
  "briefcase": "",
  "btc": "",
  "bug": "",
  "building": "",
  "building-o": "",
  "bullhorn": "",
  "bullseye": "",
  "bus": "",
  "buysellads": "",
  "cab": "",
  "calculator": "",
  "calendar": "",
  "calendar-check-o": "",
  "calendar-minus-o": "",
  "calendar-o": "",
  "calendar-plus-o": "",
  "calendar-times-o": "",
  "camera": "",
  "camera-retro": "",
  "car": "",
  "caret-down": "",
  "caret-left": "",
  "caret-right": "",
  "caret-square-o-down": "",
  "caret-square-o-left": "",
  "caret-square-o-right": "",
  "caret-square-o-up": "",
  "caret-up": "",
  "cart-arrow-down": "",
  "cart-plus": "",
  "cc": "",
  "cc-amex": "",
  "cc-diners-club": "",
  "cc-discover": "",
  "cc-jcb": "",
  "cc-mastercard": "",
  "cc-paypal": "",
  "cc-stripe": "",
  "cc-visa": "",
  "certificate": "",
  "chain": "",
  "chain-broken": "",
  "check": "",
  "check-circle": "",
  "check-circle-o": "",
  "check-square": "",
  "check-square-o": "",
  "chevron-circle-down": "",
  "chevron-circle-left": "",
  "chevron-circle-right": "",
  "chevron-circle-up": "",
  "chevron-down": "",
  "chevron-left": "",
  "chevron-right": "",
  "chevron-up": "",
  "child": "",
  "chrome": "",
  "circle": "",
  "circle-o": "",
  "circle-o-notch": "",
  "circle-thin": "",
  "clipboard": "",
  "clock-o": "",
  "clone": "",
  "close": "",
  "cloud": "",
  "cloud-download": "",
  "cloud-upload": "",
  "cny": "",
  "code": "",
  "code-fork": "",
  "codepen": "",
  "codiepie": "",
  "coffee": "",
  "cog": "",
  "cogs": "",
  "columns": "",
  "comment": "",
  "comment-o": "",
  "commenting": "",
  "commenting-o": "",
  "comments": "",
  "comments-o": "",
  "compass": "",
  "compress": "",
  "connectdevelop": "",
  "contao": "",
  "copy": "",
  "copyright": "",
  "creative-commons": "",
  "credit-card": "",
  "credit-card-alt": "",
  "crop": "",
  "crosshairs": "",
  "css3": "",
  "cube": "",
  "cubes": "",
  "cut": "",
  "cutlery": "",
  "dashboard": "",
  "dashcube": "",
  "database": "",
  "deaf": "",
  "deafness": "",
  "dedent": "",
  "delicious": "",
  "desktop": "",
  "deviantart": "",
  "diamond": "",
  "digg": "",
  "dollar": "",
  "dot-circle-o": "",
  "download": "",
  "dribbble": "",
  "drivers-license": "",
  "drivers-license-o": "",
  "dropbox": "",
  "drupal": "",
  "edge": "",
  "edit": "",
  "eercast": "",
  "eject": "",
  "ellipsis-h": "",
  "ellipsis-v": "",
  "empire": "",
  "envelope": "",
  "envelope-o": "",
  "envelope-open": "",
  "envelope-open-o": "",
  "envelope-square": "",
  "envira": "",
  "eraser": "",
  "etsy": "",
  "eur": "",
  "euro": "",
  "exchange": "",
  "exclamation": "",
  "exclamation-circle": "",
  "exclamation-triangle": "",
  "expand": "",
  "expeditedssl": "",
  "external-link": "",
  "external-link-square": "",
  "eye": "",
  "eye-slash": "",
  "eyedropper": "",
  "fa": "",
  "facebook": "",
  "facebook-f": "",
  "facebook-official": "",
  "facebook-square": "",
  "fast-backward": "",
  "fast-forward": "",
  "fax": "",
  "feed": "",
  "female": "",
  "fighter-jet": "",
  "file": "",
  "file-archive-o": "",
  "file-audio-o": "",
  "file-code-o": "",
  "file-excel-o": "",
  "file-image-o": "",
  "file-movie-o": "",
  "file-o": "",
  "file-pdf-o": "",
  "file-photo-o": "",
  "file-picture-o": "",
  "file-powerpoint-o": "",
  "file-sound-o": "",
  "file-text": "",
  "file-text-o": "",
  "file-video-o": "",
  "file-word-o": "",
  "file-zip-o": "",
  "files-o": "",
  "film": "",
  "filter": "",
  "fire": "",
  "fire-extinguisher": "",
  "firefox": "",
  "first-order": "",
  "flag": "",
  "flag-checkered": "",
  "flag-o": "",
  "flash": "",
  "flask": "",
  "flickr": "",
  "floppy-o": "",
  "folder": "",
  "folder-o": "",
  "folder-open": "",
  "folder-open-o": "",
  "font": "",
  "font-awesome": "",
  "fonticons": "",
  "fort-awesome": "",
  "forumbee": "",
  "forward": "",
  "foursquare": "",
  "free-code-camp": "",
  "frown-o": "",
  "futbol-o": "",
  "gamepad": "",
  "gavel": "",
  "gbp": "",
  "ge": "",
  "gear": "",
  "gears": "",
  "genderless": "",
  "get-pocket": "",
  "gg": "",
  "gg-circle": "",
  "gift": "",
  "git": "",
  "git-square": "",
  "github": "",
  "github-alt": "",
  "github-square": "",
  "gitlab": "",
  "gittip": "",
  "glass": "",
  "glide": "",
  "glide-g": "",
  "globe": "",
  "google": "",
  "google-plus": "",
  "google-plus-circle": "",
  "google-plus-official": "",
  "google-plus-square": "",
  "google-wallet": "",
  "graduation-cap": "",
  "gratipay": "",
  "grav": "",
  "group": "",
  "h-square": "",
  "hacker-news": "",
  "hand-grab-o": "",
  "hand-lizard-o": "",
  "hand-o-down": "",
  "hand-o-left": "",
  "hand-o-right": "",
  "hand-o-up": "",
  "hand-paper-o": "",
  "hand-peace-o": "",
  "hand-pointer-o": "",
  "hand-rock-o": "",
  "hand-scissors-o": "",
  "hand-spock-o": "",
  "hand-stop-o": "",
  "handshake-o": "",
  "hard-of-hearing": "",
  "hashtag": "",
  "hdd-o": "",
  "header": "",
  "headphones": "",
  "heart": "",
  "heart-o": "",
  "heartbeat": "",
  "history": "",
  "home": "",
  "hospital-o": "",
  "hotel": "",
  "hourglass": "",
  "hourglass-1": "",
  "hourglass-2": "",
  "hourglass-3": "",
  "hourglass-end": "",
  "hourglass-half": "",
  "hourglass-o": "",
  "hourglass-start": "",
  "houzz": "",
  "html5": "",
  "i-cursor": "",
  "id-badge": "",
  "id-card": "",
  "id-card-o": "",
  "ils": "",
  "image": "",
  "imdb": "",
  "inbox": "",
  "indent": "",
  "industry": "",
  "info": "",
  "info-circle": "",
  "inr": "",
  "instagram": "",
  "institution": "",
  "internet-explorer": "",
  "intersex": "",
  "ioxhost": "",
  "italic": "",
  "joomla": "",
  "jpy": "",
  "jsfiddle": "",
  "key": "",
  "keyboard-o": "",
  "krw": "",
  "language": "",
  "laptop": "",
  "lastfm": "",
  "lastfm-square": "",
  "leaf": "",
  "leanpub": "",
  "legal": "",
  "lemon-o": "",
  "level-down": "",
  "level-up": "",
  "life-bouy": "",
  "life-buoy": "",
  "life-ring": "",
  "life-saver": "",
  "lightbulb-o": "",
  "line-chart": "",
  "link": "",
  "linkedin": "",
  "linkedin-square": "",
  "linode": "",
  "linux": "",
  "list": "",
  "list-alt": "",
  "list-ol": "",
  "list-ul": "",
  "location-arrow": "",
  "lock": "",
  "long-arrow-down": "",
  "long-arrow-left": "",
  "long-arrow-right": "",
  "long-arrow-up": "",
  "low-vision": "",
  "magic": "",
  "magnet": "",
  "mail-forward": "",
  "mail-reply": "",
  "mail-reply-all": "",
  "male": "",
  "map": "",
  "map-marker": "",
  "map-o": "",
  "map-pin": "",
  "map-signs": "",
  "mars": "",
  "mars-double": "",
  "mars-stroke": "",
  "mars-stroke-h": "",
  "mars-stroke-v": "",
  "maxcdn": "",
  "meanpath": "",
  "medium": "",
  "medkit": "",
  "meetup": "",
  "meh-o": "",
  "mercury": "",
  "microchip": "",
  "microphone": "",
  "microphone-slash": "",
  "minus": "",
  "minus-circle": "",
  "minus-square": "",
  "minus-square-o": "",
  "mixcloud": "",
  "mobile": "",
  "mobile-phone": "",
  "modx": "",
  "money": "",
  "moon-o": "",
  "mortar-board": "",
  "motorcycle": "",
  "mouse-pointer": "",
  "music": "",
  "navicon": "",
  "neuter": "",
  "newspaper-o": "",
  "object-group": "",
  "object-ungroup": "",
  "odnoklassniki": "",
  "odnoklassniki-square": "",
  "opencart": "",
  "openid": "",
  "opera": "",
  "optin-monster": "",
  "outdent": "",
  "pagelines": "",
  "paint-brush": "",
  "paper-plane": "",
  "paper-plane-o": "",
  "paperclip": "",
  "paragraph": "",
  "paste": "",
  "pause": "",
  "pause-circle": "",
  "pause-circle-o": "",
  "paw": "",
  "paypal": "",
  "pencil": "",
  "pencil-square": "",
  "pencil-square-o": "",
  "percent": "",
  "phone": "",
  "phone-square": "",
  "photo": "",
  "picture-o": "",
  "pie-chart": "",
  "pied-piper": "",
  "pied-piper-alt": "",
  "pied-piper-pp": "",
  "pinterest": "",
  "pinterest-p": "",
  "pinterest-square": "",
  "plane": "",
  "play": "",
  "play-circle": "",
  "play-circle-o": "",
  "plug": "",
  "plus": "",
  "plus-circle": "",
  "plus-square": "",
  "plus-square-o": "",
  "podcast": "",
  "power-off": "",
  "print": "",
  "product-hunt": "",
  "puzzle-piece": "",
  "qq": "",
  "qrcode": "",
  "question": "",
  "question-circle": "",
  "question-circle-o": "",
  "quora": "",
  "quote-left": "",
  "quote-right": "",
  "ra": "",
  "random": "",
  "ravelry": "",
  "rebel": "",
  "recycle": "",
  "reddit": "",
  "reddit-alien": "",
  "reddit-square": "",
  "refresh": "",
  "registered": "",
  "remove": "",
  "renren": "",
  "reorder": "",
  "repeat": "",
  "reply": "",
  "reply-all": "",
  "resistance": "",
  "retweet": "",
  "rmb": "",
  "road": "",
  "rocket": "",
  "rotate-left": "",
  "rotate-right": "",
  "rouble": "",
  "rss": "",
  "rss-square": "",
  "rub": "",
  "ruble": "",
  "rupee": "",
  "s15": "",
  "safari": "",
  "save": "",
  "scissors": "",
  "scribd": "",
  "search": "",
  "search-minus": "",
  "search-plus": "",
  "sellsy": "",
  "send": "",
  "send-o": "",
  "server": "",
  "share": "",
  "share-alt": "",
  "share-alt-square": "",
  "share-square": "",
  "share-square-o": "",
  "shekel": "",
  "sheqel": "",
  "shield": "",
  "ship": "",
  "shirtsinbulk": "",
  "shopping-bag": "",
  "shopping-basket": "",
  "shopping-cart": "",
  "shower": "",
  "sign-in": "",
  "sign-language": "",
  "sign-out": "",
  "signal": "",
  "signing": "",
  "simplybuilt": "",
  "sitemap": "",
  "skyatlas": "",
  "skype": "",
  "slack": "",
  "sliders": "",
  "slideshare": "",
  "smile-o": "",
  "snapchat": "",
  "snapchat-ghost": "",
  "snapchat-square": "",
  "snowflake-o": "",
  "soccer-ball-o": "",
  "sort": "",
  "sort-alpha-asc": "",
  "sort-alpha-desc": "",
  "sort-amount-asc": "",
  "sort-amount-desc": "",
  "sort-asc": "",
  "sort-desc": "",
  "sort-down": "",
  "sort-numeric-asc": "",
  "sort-numeric-desc": "",
  "sort-up": "",
  "soundcloud": "",
  "space-shuttle": "",
  "spinner": "",
  "spoon": "",
  "spotify": "",
  "square": "",
  "square-o": "",
  "stack-exchange": "",
  "stack-overflow": "",
  "star": "",
  "star-half": "",
  "star-half-empty": "",
  "star-half-full": "",
  "star-half-o": "",
  "star-o": "",
  "steam": "",
  "steam-square": "",
  "step-backward": "",
  "step-forward": "",
  "stethoscope": "",
  "sticky-note": "",
  "sticky-note-o": "",
  "stop": "",
  "stop-circle": "",
  "stop-circle-o": "",
  "street-view": "",
  "strikethrough": "",
  "stumbleupon": "",
  "stumbleupon-circle": "",
  "subscript": "",
  "subway": "",
  "suitcase": "",
  "sun-o": "",
  "superpowers": "",
  "superscript": "",
  "support": "",
  "table": "",
  "tablet": "",
  "tachometer": "",
  "tag": "",
  "tags": "",
  "tasks": "",
  "taxi": "",
  "telegram": "",
  "television": "",
  "tencent-weibo": "",
  "terminal": "",
  "text-height": "",
  "text-width": "",
  "th": "",
  "th-large": "",
  "th-list": "",
  "themeisle": "",
  "thermometer": "",
  "thermometer-0": "",
  "thermometer-1": "",
  "thermometer-2": "",
  "thermometer-3": "",
  "thermometer-4": "",
  "thermometer-empty": "",
  "thermometer-full": "",
  "thermometer-half": "",
  "thermometer-quarter": "",
  "thermometer-three-quarters": "",
  "thumb-tack": "",
  "thumbs-down": "",
  "thumbs-o-down": "",
  "thumbs-o-up": "",
  "thumbs-up": "",
  "ticket": "",
  "times": "",
  "times-circle": "",
  "times-circle-o": "",
  "times-rectangle": "",
  "times-rectangle-o": "",
  "tint": "",
  "toggle-down": "",
  "toggle-left": "",
  "toggle-off": "",
  "toggle-on": "",
  "toggle-right": "",
  "toggle-up": "",
  "trademark": "",
  "train": "",
  "transgender": "",
  "transgender-alt": "",
  "trash": "",
  "trash-o": "",
  "tree": "",
  "trello": "",
  "tripadvisor": "",
  "trophy": "",
  "truck": "",
  "try": "",
  "tty": "",
  "tumblr": "",
  "tumblr-square": "",
  "turkish-lira": "",
  "tv": "",
  "twitch": "",
  "twitter": "",
  "twitter-square": "",
  "umbrella": "",
  "underline": "",
  "undo": "",
  "universal-access": "",
  "university": "",
  "unlink": "",
  "unlock": "",
  "unlock-alt": "",
  "unsorted": "",
  "upload": "",
  "usb": "",
  "usd": "",
  "user": "",
  "user-circle": "",
  "user-circle-o": "",
  "user-md": "",
  "user-o": "",
  "user-plus": "",
  "user-secret": "",
  "user-times": "",
  "users": "",
  "vcard": "",
  "vcard-o": "",
  "venus": "",
  "venus-double": "",
  "venus-mars": "",
  "viacoin": "",
  "viadeo": "",
  "viadeo-square": "",
  "video-camera": "",
  "vimeo": "",
  "vimeo-square": "",
  "vine": "",
  "vk": "",
  "volume-control-phone": "",
  "volume-down": "",
  "volume-off": "",
  "volume-up": "",
  "warning": "",
  "wechat": "",
  "weibo": "",
  "weixin": "",
  "whatsapp": "",
  "wheelchair": "",
  "wheelchair-alt": "",
  "wifi": "",
  "wikipedia-w": "",
  "window-close": "",
  "window-close-o": "",
  "window-maximize": "",
  "window-minimize": "",
  "window-restore": "",
  "windows": "",
  "won": "",
  "wordpress": "",
  "wpbeginner": "",
  "wpexplorer": "",
  "wpforms": "",
  "wrench": "",
  "xing": "",
  "xing-square": "",
  "y-combinator": "",
  "y-combinator-square": "",
  "yahoo": "",
  "yc": "",
  "yc-square": "",
  "yelp": "",
  "yen": "",
  "yoast": "",
  "youtube": "",
  "youtube-play": "",
  "youtube-square": ""
};

module.exports = FONT_AWESOME;

},{}],27:[function(require,module,exports){
var findMinMax = function (graph, nodes) {
  var inports, outports;
  if (nodes === undefined) {
    nodes = graph.nodes.map( function (node) {
      return node.id;
    });
    // Only look at exports when calculating the whole graph
    inports = graph.inports;
    outports = graph.outports;
  }
  if (nodes.length < 1) {
    return undefined;
  }
  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;

  // Loop through nodes
  var len = nodes.length;
  for (var i=0; i<len; i++) {
    var key = nodes[i];
    var node = graph.getNode(key);
    if (!node || !node.metadata) {
      continue;
    }
    if (node.metadata.x < minX) { minX = node.metadata.x; }
    if (node.metadata.y < minY) { minY = node.metadata.y; }
    var x = node.metadata.x + node.metadata.width;
    var y = node.metadata.y + node.metadata.height;
    if (x > maxX) { maxX = x; }
    if (y > maxY) { maxY = y; }
  }
  // Loop through exports
  var keys, exp;
  if (inports) {
    keys = Object.keys(inports);
    len = keys.length;
    for (i=0; i<len; i++) {
      exp = inports[keys[i]];
      if (!exp.metadata) { continue; }
      if (exp.metadata.x < minX) { minX = exp.metadata.x; }
      if (exp.metadata.y < minY) { minY = exp.metadata.y; }
      if (exp.metadata.x > maxX) { maxX = exp.metadata.x; }
      if (exp.metadata.y > maxY) { maxY = exp.metadata.y; }
    }
  }
  if (outports) {
    keys = Object.keys(outports);
    len = keys.length;
    for (i=0; i<len; i++) {
      exp = outports[keys[i]];
      if (!exp.metadata) { continue; }
      if (exp.metadata.x < minX) { minX = exp.metadata.x; }
      if (exp.metadata.y < minY) { minY = exp.metadata.y; }
      if (exp.metadata.x > maxX) { maxX = exp.metadata.x; }
      if (exp.metadata.y > maxY) { maxY = exp.metadata.y; }
    }
  }

  if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
    return null;
  }
  return {
    minX: minX,
    minY: minY,
    maxX: maxX,
    maxY: maxY
  };
};

var findFit = function (graph, width, height, sizeLimit) {
  var limits = findMinMax(graph);
  if (!limits) {
    return {x:0, y:0, scale:1};
  }
  limits.minX -= sizeLimit;
  limits.minY -= sizeLimit;
  limits.maxX += sizeLimit * 2;
  limits.maxY += sizeLimit * 2;

  var gWidth = limits.maxX - limits.minX;
  var gHeight = limits.maxY - limits.minY;

  var scaleX = width / gWidth;
  var scaleY = height / gHeight;

  var scale, x, y;
  if (scaleX < scaleY) {
    scale = scaleX;
    x = 0 - limits.minX * scale;
    y = 0 - limits.minY * scale + (height-(gHeight*scale))/2;
  } else {
    scale = scaleY;
    x = 0 - limits.minX * scale + (width-(gWidth*scale))/2;
    y = 0 - limits.minY * scale;
  }

  return {
    x: x,
    y: y,
    scale: scale
  };
};

var findAreaFit = function (point1, point2, width, height, sizeLimit) {
  var limits = {
    minX: point1.x < point2.x ? point1.x : point2.x,
    minY: point1.y < point2.y ? point1.y : point2.y,
    maxX: point1.x > point2.x ? point1.x : point2.x,
    maxY: point1.y > point2.y ? point1.y : point2.y
  };

  limits.minX -= sizeLimit;
  limits.minY -= sizeLimit;
  limits.maxX += sizeLimit * 2;
  limits.maxY += sizeLimit * 2;

  var gWidth = limits.maxX - limits.minX;
  var gHeight = limits.maxY - limits.minY;

  var scaleX = width / gWidth;
  var scaleY = height / gHeight;

  var scale, x, y;
  if (scaleX < scaleY) {
    scale = scaleX;
    x = 0 - limits.minX * scale;
    y = 0 - limits.minY * scale + (height-(gHeight*scale))/2;
  } else {
    scale = scaleY;
    x = 0 - limits.minX * scale + (width-(gWidth*scale))/2;
    y = 0 - limits.minY * scale;
  }

  return {
    x: x,
    y: y,
    scale: scale
  };
};

var findNodeFit = function (node, width, height, sizeLimit) {
  var limits = {
    minX: node.metadata.x - sizeLimit,
    minY: node.metadata.y - sizeLimit,
    maxX: node.metadata.x + sizeLimit * 2,
    maxY: node.metadata.y + sizeLimit * 2
  };

  var gWidth = limits.maxX - limits.minX;
  var gHeight = limits.maxY - limits.minY;

  var scaleX = width / gWidth;
  var scaleY = height / gHeight;

  var scale, x, y;
  if (scaleX < scaleY) {
    scale = scaleX;
    x = 0 - limits.minX * scale;
    y = 0 - limits.minY * scale + (height-(gHeight*scale))/2;
  } else {
    scale = scaleY;
    x = 0 - limits.minX * scale + (width-(gWidth*scale))/2;
    y = 0 - limits.minY * scale;
  }

  return {
    x: x,
    y: y,
    scale: scale
  };
};

module.exports = {
  findMinMax: findMinMax,
  findNodeFit: findNodeFit,
  findFit: findFit,
};

},{}],28:[function(require,module,exports){
var Hammer = require('hammerjs');
// Contains code from hammmer.js
// https://github.com/hammerjs/hammer.js
// The MIT License (MIT)
// Copyright (C) 2011-2014 by Jorik Tangelder (Eight Media)
//
// With customizations to get it to work as we like/need,
// particularly we track all events on the target element itself

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];

function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';
// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

function PointerInput() {
  // OVERRIDE: listen for all event on the element, not on window
  // This is needed for event propagation to get the right targets
  this.evEl = POINTER_ELEMENT_EVENTS + ' ' + POINTER_WINDOW_EVENTS;
  this.evWin = '';
  Hammer.Input.apply(this, arguments);
  this.store = (this.manager.session.pointerEvents = []);
}
Hammer.inherit(PointerInput, Hammer.PointerEventInput, {});
PointerInput.prototype.constructor = function() { }; // STUB, avoids init() being called too early

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

function MouseInput() {
  // OVERRIDE: listen for all event on the element, not on window
  // This is needed for event propagation to get the right targets
  this.evEl = MOUSE_ELEMENT_EVENTS + ' ' + MOUSE_WINDOW_EVENTS;
  this.evWin = '';

  this.pressed = false; // mousedown state
  Hammer.Input.apply(this, arguments);
}
Hammer.inherit(MouseInput, Hammer.MouseInput, {});
MouseInput.prototype.constructor = function() { }; // STUB, avoids overridden constructor being called

function TouchMouseInput() {
    Hammer.Input.apply(this, arguments);

    var handler = this.handler.bind(this);
    this.touch = new Hammer.TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}
Hammer.inherit(TouchMouseInput, Hammer.TouchMouseInput, {});
TouchMouseInput.prototype.constructor = function() { }; // STUB, avoids overridden constructor being called

var Input = null;
if (SUPPORT_POINTER_EVENTS) {
    Input = PointerInput;
} else if (SUPPORT_ONLY_TOUCH) {
    Input = Hammer.TouchInput;
} else if (!SUPPORT_TOUCH) {
    Input = MouseInput;
} else {
    Input = TouchMouseInput;
}


module.exports = {
  Input: Input,
};

},{"hammerjs":"hammerjs"}],29:[function(require,module,exports){
// The `merge` function provides simple property merging.
module.exports = function(src, dest, overwrite) {
  // Do nothing if neither are true objects.
  if (Array.isArray(src) || Array.isArray(dest) || typeof src !== 'object' || typeof dest !== 'object')
    return dest;

  // Default overwriting of existing properties to false.
  overwrite = overwrite || false;

  for (var key in src) {
    // Only copy properties, not functions.
    if (typeof src[key] !== 'function' && (!dest[key] || overwrite))
      dest[key] = src[key];
  }

  return dest;
};

},{}],30:[function(require,module,exports){
var ReactDOM = require('react-dom');
// React mixins

// Show fake tooltip
// Class must have getTooltipTrigger (dom node) and shouldShowTooltip (boolean)
var Tooltip = {
  showTooltip: function (event) {
    if ( !this.shouldShowTooltip() ) { return; }

    var tooltipEvent = new CustomEvent('the-graph-tooltip', { 
      detail: {
        tooltip: this.props.label,
        x: event.clientX,
        y: event.clientY
      }, 
      bubbles: true
    });
    ReactDOM.findDOMNode(this).dispatchEvent(tooltipEvent);
  },
  hideTooltip: function (event) {
    if ( !this.shouldShowTooltip() ) { return; }

    var tooltipEvent = new CustomEvent('the-graph-tooltip-hide', { 
      bubbles: true
    });
    if (this.mounted) {
      ReactDOM.findDOMNode(this).dispatchEvent(tooltipEvent);
    }
  },
  componentDidMount: function () {
    this.mounted = true;
    if (navigator && navigator.userAgent.indexOf("Firefox") !== -1) {
      // HACK Ff does native tooltips on svg elements
      return;
    }
    var tooltipper = this.getTooltipTrigger();
    tooltipper.addEventListener("tap", this.showTooltip);
    tooltipper.addEventListener("mouseenter", this.showTooltip);
    tooltipper.addEventListener("mouseleave", this.hideTooltip);
  },
  componentWillUnmount: function () {
    this.mounted = false;
  }
};

module.exports = {
  Tooltip: Tooltip,
};

},{"react-dom":"react-dom"}],31:[function(require,module,exports){
var React = require('react');
var ReactDOM = require('react-dom');
var createReactClass = require('create-react-class');
var Hammer = require('hammerjs');

var hammerhacks = require('./hammer.js');
var ModalBG = require('./the-graph-modalbg').ModalBG;
var geometryutils = require('./geometryutils');

// Trivial polyfill for Polymer/webcomponents/shadowDOM element unwrapping
var unwrap = (window.unwrap) ? window.unwrap : function(e) { return e; };

var hotKeys = {
  // Escape
  27: function(app) {
    if (!app.refs.graph) {
      return;
    }
    app.refs.graph.cancelPreviewEdge();
  },
  // Delete
  46: function (app) {
    var graph = app.refs.graph.props.graph;
    var selectedNodes = app.refs.graph.state.selectedNodes;
    var selectedEdges = app.refs.graph.state.selectedEdges;
    var menus = app.props.menus;

    for (var nodeKey in selectedNodes) {
      if (selectedNodes.hasOwnProperty(nodeKey)) {
        var node = graph.getNode(nodeKey);
        menus.node.actions.delete(graph, nodeKey, node);
      }
    }
    selectedEdges.map(function (edge) {
      menus.edge.actions.delete(graph, null, edge);
    });
  },
  // f for fit
  70: function (app) {
    app.triggerFit();
  },
  // s for selected
  83: function (app) {
    var graph = app.refs.graph.props.graph;
    var selectedNodes = app.refs.graph.state.selectedNodes;

    for (var nodeKey in selectedNodes) {
      if (selectedNodes.hasOwnProperty(nodeKey)) {
        var node = graph.getNode(nodeKey);
        app.focusNode(node);
        break;
      }
    }
  },
};
// these don't change state, so also allowed when readonly
var readOnlyActions = [70, 83, 27];

module.exports.register = function (context) {

  var TheGraph = context.TheGraph;

  TheGraph.config.app = {
    container: {
      className: "the-graph-app",
      name: "app"
    },
    canvas: {
      ref: "canvas",
      className: "app-canvas"
    },
    svg: {
      className: "app-svg",
      ref: 'svg',
    },
    svgGroup: {
      className: "view"
    },
    graph: {
      ref: "graph"
    },
    tooltip: {
      ref: "tooltip"
    },
    modal: {
      className: "context"
    }
  };

  TheGraph.factories.app = {
    createAppContainer: createAppContainer,
    createAppCanvas: TheGraph.factories.createCanvas,
    createAppSvg: TheGraph.factories.createSvg,
    createAppSvgGroup: TheGraph.factories.createGroup,
    createAppGraph: createAppGraph,
    createAppTooltip: createAppTooltip,
    createAppModalGroup: TheGraph.factories.createGroup,
    createAppModalBackground: createAppModalBackground
  };

  // No need to promote DIV creation to TheGraph.js.
  function createAppContainer(options, content) {
    var args = ['div', options];

    if (Array.isArray(content)) {
      args = args.concat(content);
    }

    return React.createElement.apply(React, args);
  }

  function createAppGraph(options) {
    return TheGraph.Graph(options);
  }

  function createAppTooltip(options) {
    return TheGraph.Tooltip(options);
  }

  function createAppModalBackground(options) {
    return ModalBG(options);
  }

  var mixins = [];
  if (React.Animate) {
    mixins.push(React.Animate);
  }

  function defaultGetMenu(options) {
    // Options: type, graph, itemKey, item
    if (options.type && this.menus[options.type]) {
      var defaultMenu = this.menus[options.type];
      if (defaultMenu.callback) {
        return defaultMenu.callback(defaultMenu, options);
      }
      return defaultMenu;
    }
    return null;
  }

  TheGraph.App = React.createFactory( createReactClass({
    displayName: "TheGraphApp",
    mixins: mixins,
    getDefaultProps: function() {
      return {
        width: null,
        height: null,
        readonly: false,
        nodeIcons: {},
        minZoom: 0.15,
        maxZoom: 15.0,
        offsetX: 0.0,
        offsetY: 0.0,
        menus: null,
        getMenuDef: null,
        onPanScale: null,
        onNodeSelection: null,
        onEdgeSelection: null,
      };
    },
    getInitialState: function() {
      // Autofit
      var fit = geometryutils.findFit(this.props.graph, this.props.width, this.props.height, TheGraph.config.nodeSize);

      return {
        x: fit.x,
        y: fit.y,
        scale: fit.scale,
        width: this.props.width,
        height: this.props.height,
        minZoom: this.props.minZoom,
        maxZoom: this.props.maxZoom,
        trackStartX: null,
        trackStartY: null,
        tooltip: "",
        tooltipX: 0,
        tooltipY: 0,
        tooltipVisible: false,
        contextElement: null,
        contextType: null,
        offsetY: this.props.offsetY,
        offsetX: this.props.offsetX,
      };
    },
    zoomFactor: 0,
    zoomX: 0,
    zoomY: 0,
    onWheel: function (event) {
      // Don't bounce
      event.preventDefault();

      if (!this.zoomFactor) { // WAT
        this.zoomFactor = 0;
      }

      // Safari is wheelDeltaY
      this.zoomFactor += event.deltaY ? event.deltaY : 0-event.wheelDeltaY;
      this.zoomX = event.clientX;
      this.zoomY = event.clientY;
      requestAnimationFrame(this.scheduleWheelZoom);
    },
    scheduleWheelZoom: function () {
      if (isNaN(this.zoomFactor)) { return; }

      // Speed limit
      var zoomFactor = this.zoomFactor/-500;
      zoomFactor = Math.min(0.5, Math.max(-0.5, zoomFactor));
      var scale = this.state.scale + (this.state.scale * zoomFactor);
      this.zoomFactor = 0;

      if (scale < this.state.minZoom) {
        scale = this.state.minZoom;
      }
      else if (scale > this.state.maxZoom) {
        scale = this.state.maxZoom;
      }
      if (scale === this.state.scale) { return; }

      // Zoom and pan transform-origin equivalent
      var scaleD = scale / this.state.scale;
      var currentX = this.state.x;
      var currentY = this.state.y;
      var oX = this.zoomX;
      var oY = this.zoomY;
      var x = scaleD * (currentX - oX) + oX;
      var y = scaleD * (currentY - oY) + oY;

      this.setState({
        scale: scale,
        x: x,
        y: y,
        tooltipVisible: false
      });
    },
    lastScale: 1,
    lastX: 0,
    lastY: 0,
    pinching: false,
    onTransformStart: function (event) {
      // Don't drag nodes
      event.srcEvent.stopPropagation();
      event.srcEvent.stopImmediatePropagation();

      // Hammer.js
      this.lastScale = 1;
      this.lastX = event.center.x;
      this.lastY = event.center.y;
      this.pinching = true;
    },
    onTransform: function (event) {
      // Don't drag nodes
      event.srcEvent.stopPropagation();
      event.srcEvent.stopImmediatePropagation();

      // Hammer.js
      var currentScale = this.state.scale;
      var currentX = this.state.x;
      var currentY = this.state.y;

      var scaleEvent = event.scale;
      var scaleDelta = 1 + (scaleEvent - this.lastScale);
      this.lastScale = scaleEvent;
      var scale = scaleDelta * currentScale;
      scale = Math.max(scale, this.props.minZoom);

      // Zoom and pan transform-origin equivalent
      var oX = event.center.x;
      var oY = event.center.y;
      var deltaX = oX - this.lastX;
      var deltaY = oY - this.lastY;
      var x = scaleDelta * (currentX - oX) + oX + deltaX;
      var y = scaleDelta * (currentY - oY) + oY + deltaY;

      this.lastX = oX;
      this.lastY = oY;

      this.setState({
        scale: scale,
        x: x,
        y: y,
        tooltipVisible: false
      });
    },
    onTransformEnd: function (event) {
      // Don't drag nodes
      event.srcEvent.stopPropagation();
      event.srcEvent.stopImmediatePropagation();

      // Hammer.js
      this.pinching = false;
    },
    onTrackStart: function (event) {
      var domNode = ReactDOM.findDOMNode(this);
      domNode.addEventListener("panmove", this.onTrack);
      domNode.addEventListener("panend", this.onTrackEnd);

      this.setState({ trackStartX: this.state.x, trackStartY: this.state.y });
    },
    onTrack: function (event) {
      if ( this.pinching ) { return; }
      if ( this.menuShown ) { return; }
      this.setState({
        x: this.state.trackStartX + event.gesture.deltaX,
        y: this.state.trackStartY + event.gesture.deltaY,
      });
    },
    onTrackEnd: function (event) {
      // Don't click app (unselect)
      event.stopPropagation();

      var domNode = ReactDOM.findDOMNode(this);
      domNode.removeEventListener("panmove", this.onTrack);
      domNode.removeEventListener("panend", this.onTrackEnd);

      this.setState({ trackStartX: null, trackStartY: null });
    },
    onPanScale: function () {
      // Pass pan/scale out to the-graph
      if (this.props.onPanScale) {
        this.props.onPanScale(this.state.x, this.state.y, this.state.scale);
      }
    },
    defaultGetMenuDef: function(options) {
      // Options: type, graph, itemKey, item
      if (options.type && this.props.menus && this.props.menus[options.type]) {
        var defaultMenu = this.props.menus[options.type];
        if (defaultMenu.callback) {
          return defaultMenu.callback(defaultMenu, options);
        }
        return defaultMenu;
      }
      return null;
    },
    showContext: function (options) {
      this.setState({
        contextMenu: options,
        tooltipVisible: false
      });
    },
    hideContext: function (event) {
      this.setState({
        contextMenu: null
      });
    },
    changeTooltip: function (event) {
      var tooltip = event.detail.tooltip;

      // Don't go over right edge
      var x = event.detail.x + 10;
      var width = tooltip.length*6;
      if (x + width > this.props.width) {
        x = event.detail.x - width - 10;
      }

      this.setState({
        tooltip: tooltip,
        tooltipVisible: true,
        tooltipX: x,
        tooltipY: event.detail.y + 20
      });
    },
    hideTooltip: function (event) {
      this.setState({
        tooltip: "",
        tooltipVisible: false
      });
    },
    triggerFit: function (event) {
      var fit = geometryutils.findFit(this.props.graph, this.props.width, this.props.height, TheGraph.config.nodeSize);
      this.setState({
        x: fit.x,
        y: fit.y,
        scale: fit.scale
      });
    },
    focusNode: function (node) {
      var duration = TheGraph.config.focusAnimationDuration;
      var fit = geometryutils.findNodeFit(node, this.state.width, this.state.height, TheGraph.config.nodeSize);
      var start_point = {
        x: -(this.state.x - this.state.width / 2) / this.state.scale,
        y: -(this.state.y - this.state.height / 2) / this.state.scale,
      }, end_point = {
        x: node.metadata.x,
        y: node.metadata.y,
      };
      var graphfit = geometryutils.findAreaFit(start_point, end_point, this.state.width, this.state.height, TheGraph.config.nodeSize);
      var scale_ratio_1 = Math.abs(graphfit.scale - this.state.scale);
      var scale_ratio_2 = Math.abs(fit.scale - graphfit.scale);
      var scale_ratio_diff = scale_ratio_1 + scale_ratio_2;

      // Animation not available, jump right there
      if (!this.animate) {
        this.setState({ x: fit.x, y: fit.y, scale: fit.scale });
        return;
      }

      // Animate zoom-out then zoom-in
      this.animate({
        x: graphfit.x,
        y: graphfit.y,
        scale: graphfit.scale,
      }, duration * (scale_ratio_1 / scale_ratio_diff), 'in-quint', function() {
        this.animate({
          x: fit.x,
          y: fit.y,
          scale: fit.scale,
        }, duration * (scale_ratio_2 / scale_ratio_diff), 'out-quint');
      }.bind(this));
    },
    edgeStart: function (event) {
      // Listened from PortMenu.edgeStart() and Port.edgeStart()
      this.refs.graph.edgeStart(event);
      this.hideContext();
    },
    componentDidMount: function () {
      var domNode = ReactDOM.findDOMNode(this.refs.svg);

      // Unselect edges and nodes
      if (this.props.onNodeSelection) {
        domNode.addEventListener("tap", this.unselectAll);
      }

      // Setup Hammer.js events for this and all children
      // The events are injected into the DOM to follow regular propagation rules
      var hammertime = new Hammer.Manager(domNode, {
        domEvents: true,
        inputClass: hammerhacks.Input,
        recognizers: [
          [ Hammer.Tap, { } ],
          [ Hammer.Press, { time: 500 } ],
          [ Hammer.Pan, { direction: Hammer.DIRECTION_ALL, threshold: 5 } ],
          [ Hammer.Pinch, { } ],
        ],
      });

      // Gesture event for pan
      domNode.addEventListener("panstart", this.onTrackStart);

      var isTouchDevice = 'ontouchstart' in document.documentElement;
      if( isTouchDevice && hammertime ){
        hammertime.on("pinchstart", this.onTransformStart);
        hammertime.on("pinch", this.onTransform);
        hammertime.on("pinchend", this.onTransformEnd);
      }

      // Wheel to zoom
      if ('onwheel' in domNode) {
        // Chrome and Firefox
        domNode.addEventListener("wheel", this.onWheel);
      } else if ('onmousewheel' in domNode) {
        // Safari
        domNode.addEventListener("mousewheel", this.onWheel);
      }

      // Tooltip listener
      domNode.addEventListener("the-graph-tooltip", this.changeTooltip);
      domNode.addEventListener("the-graph-tooltip-hide", this.hideTooltip);

      // Edge preview
      domNode.addEventListener("the-graph-edge-start", this.edgeStart);

      domNode.addEventListener("contextmenu",this.onShowContext);

      // Start zoom from middle if zoom before mouse move
      this.mouseX = Math.floor( this.props.width/2 );
      this.mouseY = Math.floor( this.props.height/2 );

      // FIXME: instead access the shiftKey of event instead of keeping metaKey
      document.addEventListener('keydown', this.keyDown);
      document.addEventListener('keyup', this.keyUp);

      // Canvas background
      bgCanvas = unwrap(ReactDOM.findDOMNode(this.refs.canvas));
      this.bgContext = unwrap(bgCanvas.getContext('2d'));
      this.componentDidUpdate();


      // Rerender graph once to fix edges
      setTimeout(function () {
        this.renderGraph();
      }.bind(this), 500);
    },
    onShowContext: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.preventTap) { event.preventTap(); }

      // Get mouse position
      var x = event.x || event.clientX || 0;
      var y = event.y || event.clientY || 0;
      if (event.touches && event.touches.length) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
      }

      // App.showContext
      this.showContext({
        element: this,
        type: "main",
        x: x,
        y: y,
        graph: this.props.graph,
        itemKey: 'graph',
        item: this.props.graph
      });
    },
    keyDown: function (event) {
      // HACK metaKey global for taps
      if (event.metaKey || event.ctrlKey) {
        TheGraph.metaKeyPressed = true;
      }

      var code = event.keyCode;
      var handler = hotKeys[code];
      if (handler) {
        var readonly = this.props.readonly;
        if (!readonly || (readonly && readOnlyActions[code])) {
          handler(this);
        }
      }
    },
    keyUp: function (event) {
      // HACK metaKey global for taps
      if (TheGraph.metaKeyPressed) {
        TheGraph.metaKeyPressed = false;
      }
    },
    unselectAll: function (event) {
      // No arguments = clear selection
      this.props.onNodeSelection();
      this.props.onEdgeSelection();
    },
    renderGraph: function () {
      this.refs.graph.markDirty();
    },
    componentDidUpdate: function (prevProps, prevState) {
      this.renderCanvas(this.bgContext);
      if (!prevState || prevState.x!==this.state.x || prevState.y!==this.state.y || prevState.scale!==this.state.scale) {
        this.onPanScale();
      }
    },
    renderCanvas: function (c) {
      // Comment this line to go plaid
      c.clearRect(0, 0, this.state.width, this.state.height);

      // Background grid pattern
      var scale = this.state.scale;
      var g = TheGraph.config.nodeSize * scale;

      var dx = this.state.x % g;
      var dy = this.state.y % g;
      var cols = Math.floor(this.state.width / g) + 1;
      var row = Math.floor(this.state.height / g) + 1;
      // Origin row/col index
      var oc = Math.floor(this.state.x / g) + (this.state.x<0 ? 1 : 0);
      var or = Math.floor(this.state.y / g) + (this.state.y<0 ? 1 : 0);

      while (row--) {
        var col = cols;
        while (col--) {
          var x = Math.round(col*g+dx);
          var y = Math.round(row*g+dy);
          if ((oc-col)%3===0 && (or-row)%3===0) {
            // 3x grid
            c.fillStyle = "white";
            c.fillRect(x, y, 1, 1);
          } else if (scale > 0.5) {
            // 1x grid
            c.fillStyle = "grey";
            c.fillRect(x, y, 1, 1);
          }
        }
      }

    },

    getContext: function (menu, options, hide) {
        return TheGraph.Menu({
            menu: menu,
            options: options,
            triggerHideContext: hide,
            label: "Hello",
            graph: this.props.graph,
            node: this,
            ports: [],
            process: [],
            processKey: null,
            x: options.x,
            y: options.y,
            nodeWidth: this.props.width,
            nodeHeight: this.props.height,
            deltaX: 0,
            deltaY: 0,
            highlightPort: false
        });
    },
    render: function() {
      // console.timeEnd("App.render");
      // console.time("App.render");

      // pan and zoom
      var sc = this.state.scale;
      var x = this.state.x;
      var y = this.state.y;
      var transform = "matrix("+sc+",0,0,"+sc+","+x+","+y+")";

      var scaleClass = sc > TheGraph.zbpBig ? "big" : ( sc > TheGraph.zbpNormal ? "normal" : "small");

      var contextMenu = null;
      var getMenuDef = this.props.getMenuDef || this.defaultGetMenuDef;
      if ( this.state.contextMenu ) {
        var options = this.state.contextMenu;
        var menu = getMenuDef(options);
        if (menu && Object.keys(menu).length) {
          contextMenu = options.element.getContext(menu, options, this.hideContext);
        }
      }
      var contextModal = null;
      if (contextMenu) {

        var modalBGOptions ={
          width: this.state.width,
          height: this.state.height,
          triggerHideContext: this.hideContext,
          children: contextMenu
        };

        contextModal = [
          TheGraph.factories.app.createAppModalBackground(modalBGOptions)
        ];
        this.menuShown = true;
      } else {
        this.menuShown = false;
      }

      var graphElementOptions = {
        graph: this.props.graph,
        scale: this.state.scale,
        app: this,
        library: this.props.library,
        nodeIcons: this.props.nodeIcons,
        onNodeSelection: this.props.onNodeSelection,
        onEdgeSelection: this.props.onEdgeSelection,
        showContext: this.showContext,
        allowEdgeStart: !this.props.readonly,
      };
      graphElementOptions = TheGraph.merge(TheGraph.config.app.graph, graphElementOptions);
      var graphElement = TheGraph.factories.app.createAppGraph.call(this, graphElementOptions);

      var svgGroupOptions = TheGraph.merge(TheGraph.config.app.svgGroup, { transform: transform });
      var svgGroup = TheGraph.factories.app.createAppSvgGroup.call(this, svgGroupOptions, [graphElement]);

      var tooltipOptions = {
        x: this.state.tooltipX,
        y: this.state.tooltipY,
        visible: this.state.tooltipVisible,
        label: this.state.tooltip
      };

      tooltipOptions = TheGraph.merge(TheGraph.config.app.tooltip, tooltipOptions);
      var tooltip = TheGraph.factories.app.createAppTooltip.call(this, tooltipOptions);

      var modalGroupOptions = TheGraph.merge(TheGraph.config.app.modal, { children: contextModal });
      var modalGroup = TheGraph.factories.app.createAppModalGroup.call(this, modalGroupOptions);

      var svgContents = [
        svgGroup,
        tooltip,
        modalGroup
      ];

      var svgOptions = TheGraph.merge(TheGraph.config.app.svg, { width: this.state.width, height: this.state.height });
      var svg = TheGraph.factories.app.createAppSvg.call(this, svgOptions, svgContents);

      var canvasOptions = TheGraph.merge(TheGraph.config.app.canvas, { width: this.state.width, height: this.state.height });
      var canvas = TheGraph.factories.app.createAppCanvas.call(this, canvasOptions);

      var appContents = [
        canvas,
        svg
      ];
      var containerOptions = TheGraph.merge(TheGraph.config.app.container, { style: { width: this.state.width, height: this.state.height } });
      containerOptions.className += " " + scaleClass;
      return TheGraph.factories.app.createAppContainer.call(this, containerOptions, appContents);
    }
  }));


};

},{"./geometryutils":27,"./hammer.js":28,"./the-graph-modalbg":39,"create-react-class":"create-react-class","hammerjs":"hammerjs","react":"react","react-dom":"react-dom"}],32:[function(require,module,exports){

// NOTE: caller should wrap in a graph transaction, to group all changes made to @graph
function applyAutolayout(graph, keilerGraph, props) {
  console.error('DEPRECATED: TheGraph.autolayout.applyAutolayout() will be removed in next version');

  // Update original graph nodes with the new coordinates from KIELER graph
  var children = keilerGraph.children.slice();

  var i, len;
  for (i=0, len = children.length; i<len; i++) {
    var klayNode = children[i];
    var fbpNode = graph.getNode(klayNode.id);

    // Encode nodes inside groups
    if (klayNode.children) {
      var klayChildren = klayNode.children;
      var idx;
      for (idx in klayChildren) {
        var klayChild = klayChildren[idx];
        if (klayChild.id) {
          graph.setNodeMetadata(klayChild.id, {
            x: Math.round((klayNode.x + klayChild.x)/props.snap)*props.snap,
            y: Math.round((klayNode.y + klayChild.y)/props.snap)*props.snap
          });
        }
      }
    }

    // Encode nodes outside groups
    if (fbpNode) {
      graph.setNodeMetadata(klayNode.id, {
        x: Math.round(klayNode.x/props.snap)*props.snap,
        y: Math.round(klayNode.y/props.snap)*props.snap
      });
    } else {
      // Find inport or outport
      var idSplit = klayNode.id.split(":::");
      var expDirection = idSplit[0];
      var expKey = idSplit[1];
      if (expDirection==="inport" && graph.inports[expKey]) {
        graph.setInportMetadata(expKey, {
          x: Math.round(klayNode.x/props.snap)*props.snap,
          y: Math.round(klayNode.y/props.snap)*props.snap
        });
      } else if (expDirection==="outport" && graph.outports[expKey]) {
        graph.setOutportMetadata(expKey, {
          x: Math.round(klayNode.x/props.snap)*props.snap,
          y: Math.round(klayNode.y/props.snap)*props.snap
        });
      }
    }
  }
}

module.exports = {
  applyToGraph: applyAutolayout,
};

},{}],33:[function(require,module,exports){
var React = require('react');
var ReactDOM = require('react-dom');
var createReactClass = require('create-react-class');
var TooltipMixin = require('./mixins').Tooltip;

module.exports.register = function (context) {

  var TheGraph = context.TheGraph;

  TheGraph.config.edge = {
    curve: TheGraph.config.nodeSize,
    container: {
      className: "edge"
    },
    backgroundPath: {
      className: "edge-bg"
    },
    foregroundPath: {
      ref: "route",
      className: "edge-fg stroke route"
    },
    touchPath: {
      className: "edge-touch",
      ref: "touch"
    }
  };

  TheGraph.factories.edge = {
    createEdgeGroup: TheGraph.factories.createGroup,
    createEdgeBackgroundPath: TheGraph.factories.createPath,
    createEdgeForegroundPath: TheGraph.factories.createPath,
    createEdgeTouchPath: TheGraph.factories.createPath,
    createEdgePathArray: createEdgePathArray,
    createArrow: TheGraph.factories.createPolygon
  };

  function createEdgePathArray(sourceX, sourceY, c1X, c1Y, c2X, c2Y, targetX, targetY) {
      return [
        "M",
        sourceX, sourceY,
        "C",
        c1X, c1Y,
        c2X, c2Y,
        targetX, targetY
      ];
  }

  // Const
  var CURVE = TheGraph.config.edge.curve;

  // Point along cubic bezier curve
  // See http://en.wikipedia.org/wiki/File:Bezier_3_big.gif
  var findPointOnCubicBezier = function (p, sx, sy, c1x, c1y, c2x, c2y, ex, ey) {
    // p is percentage from 0 to 1
    var op = 1 - p;
    // 3 green points between 4 points that define curve
    var g1x = sx * p + c1x * op;
    var g1y = sy * p + c1y * op;
    var g2x = c1x * p + c2x * op;
    var g2y = c1y * p + c2y * op;
    var g3x = c2x * p + ex * op;
    var g3y = c2y * p + ey * op;
    // 2 blue points between green points
    var b1x = g1x * p + g2x * op;
    var b1y = g1y * p + g2y * op;
    var b2x = g2x * p + g3x * op;
    var b2y = g2y * p + g3y * op;
    // Point on the curve between blue points
    var x = b1x * p + b2x * op;
    var y = b1y * p + b2y * op;
    return [x, y];    
  };


  // Edge view

  TheGraph.Edge = React.createFactory( createReactClass({
    displayName: "TheGraphEdge",
    mixins: [
      TooltipMixin
    ],
    componentWillMount: function() {
    },
    componentDidMount: function () {
      var domNode = ReactDOM.findDOMNode(this);

      // Select
      if (this.props.onEdgeSelection) {
        // Needs to be click (not tap) to get event.shiftKey
        domNode.addEventListener("tap", this.onEdgeSelection);
      }
      // Open menu
      if (this.props.showContext) {
        domNode.addEventListener("contextmenu", this.showContext);
        domNode.addEventListener('press', this.showContext);
      }
    },
    onEdgeSelection: function (event) {
      // Don't click app
      event.stopPropagation();

      var toggle = (TheGraph.metaKeyPressed || event.pointerType==="touch");
      this.props.onEdgeSelection(this.props.edgeID, this.props.edge, toggle);
    },
    showContext: function (event) {
      // Don't show native context menu
      event.preventDefault();

      // Don't tap graph on hold event
      if (event.stopPropagation) { event.stopPropagation(); }
      if (event.preventTap) { event.preventTap(); }

      // Get mouse position
      if (event.gesture) {
        event = event.gesture.srcEvent; // unpack hammer.js gesture event 
      }
      var x = event.x || event.clientX || 0;
      var y = event.y || event.clientY || 0;
      if (event.touches && event.touches.length) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
      }

      // App.showContext
      this.props.showContext({
        element: this,
        type: (this.props.export ? (this.props.isIn ? "graphInport" : "graphOutport") : "edge"),
        x: x,
        y: y,
        graph: this.props.graph,
        itemKey: (this.props.export ? this.props.exportKey : null),
        item: (this.props.export ? this.props.export : this.props.edge)
      });

    },
    getContext: function (menu, options, hide) {
      return TheGraph.Menu({
        menu: menu,
        options: options,
        triggerHideContext: hide,
        label: this.props.label,
        iconColor: this.props.route
      });
    },
    shouldComponentUpdate: function (nextProps, nextState) {
      // Only rerender if changed
      return (
        nextProps.sX !== this.props.sX || 
        nextProps.sY !== this.props.sY ||
        nextProps.tX !== this.props.tX || 
        nextProps.tY !== this.props.tY ||
        nextProps.selected !== this.props.selected ||
        nextProps.animated !== this.props.animated ||
        nextProps.route !== this.props.route
      );
    },
    getTooltipTrigger: function () {
      return ReactDOM.findDOMNode(this.refs.touch);
    },
    shouldShowTooltip: function () {
      return true;
    },
    render: function () {
      var sourceX = this.props.sX;
      var sourceY = this.props.sY;
      var targetX = this.props.tX;
      var targetY = this.props.tY;

      // Organic / curved edge
      var c1X, c1Y, c2X, c2Y;
      if (targetX-5 < sourceX) {
        var curveFactor = (sourceX - targetX) * CURVE / 200;
        if (Math.abs(targetY-sourceY) < TheGraph.config.nodeSize/2) {
          // Loopback
          c1X = sourceX + curveFactor;
          c1Y = sourceY - curveFactor;
          c2X = targetX - curveFactor;
          c2Y = targetY - curveFactor;
        } else {
          // Stick out some
          c1X = sourceX + curveFactor;
          c1Y = sourceY + (targetY > sourceY ? curveFactor : -curveFactor);
          c2X = targetX - curveFactor;
          c2Y = targetY + (targetY > sourceY ? -curveFactor : curveFactor);
        }
      } else {
        // Controls halfway between
        c1X = sourceX + (targetX - sourceX)/2;
        c1Y = sourceY;
        c2X = c1X;
        c2Y = targetY;
      }

      // Make SVG path

      var path = TheGraph.factories.edge.createEdgePathArray(sourceX, sourceY, c1X, c1Y, c2X, c2Y, targetX, targetY);
      path = path.join(" ");

      var backgroundPathOptions = TheGraph.merge(TheGraph.config.edge.backgroundPath, { d: path });
      var backgroundPath = TheGraph.factories.edge.createEdgeBackgroundPath(backgroundPathOptions);

      var foregroundPathClassName = TheGraph.config.edge.foregroundPath.className + this.props.route;
      var foregroundPathOptions = TheGraph.merge(TheGraph.config.edge.foregroundPath, { d: path, className: foregroundPathClassName });
      var foregroundPath = TheGraph.factories.edge.createEdgeForegroundPath(foregroundPathOptions);

      var touchPathOptions = TheGraph.merge(TheGraph.config.edge.touchPath, { d: path });
      var touchPath = TheGraph.factories.edge.createEdgeTouchPath(touchPathOptions);

      var containerOptions = {
        className: "edge"+
          (this.props.selected ? " selected" : "")+
          (this.props.animated ? " animated" : ""),
        title: this.props.label
      };

      containerOptions = TheGraph.merge(TheGraph.config.edge.container, containerOptions);

      var epsilon = 0.01;
      var center = findPointOnCubicBezier(0.5, sourceX, sourceY, c1X, c1Y, c2X, c2Y, targetX, targetY);

      // estimate slope and intercept of tangent line
      var getShiftedPoint = function (epsilon) {
        return findPointOnCubicBezier(
          0.5 + epsilon, sourceX, sourceY, c1X, c1Y, c2X, c2Y, targetX, targetY);
      };
      var plus = getShiftedPoint(epsilon);
      var minus = getShiftedPoint(-epsilon);
      var m = 1 * (plus[1] - minus[1]) / (plus[0] - minus[0]);
      var b = center[1] - (m * center[0]);

      // find point on line y = mx + b that is `offset` away from x,y
      var findLinePoint = function (x, y, m, b, offset, flip) {
        var x1 = x + offset/Math.sqrt(1 + m*m);
        var y1;
        if (Math.abs(m) === Infinity) {
          y1 = y + (flip || 1) *offset;
        } else {
          y1 = (m * x1) + b;
        }
        return [x1, y1];
      };

      var arrowLength = 12;
      // Which direction should arrow point
      if (plus[0] > minus[0]) {
        arrowLength *= -1;
      }
      center = findLinePoint(center[0], center[1], m, b, -1*arrowLength/2);

      // find points of perpendicular line length l centered at x,y
      var perpendicular = function (x, y, oldM, l) {
        var m = -1/oldM;
        var b = y - m*x;
        var point1 = findLinePoint(x, y, m, b, l/2);
        var point2 = findLinePoint(x, y, m, b, l/-2);
        return [point1, point2];
      };

      var points = perpendicular(center[0], center[1], m, arrowLength * 0.9);
      // For m === 0, figure out if arrow should be straight up or down
      var flip = plus[1] > minus[1] ? -1 : 1;
      var arrowTip = findLinePoint(center[0], center[1], m, b, arrowLength, flip);
      points.push(arrowTip);

      var pointsArray = points.map(
        function (point) {return point.join(',');}).join(' ');
      var arrowBg = TheGraph.factories.edge.createArrow({
        points: pointsArray,
        className: 'arrow-bg'
      });

      var arrow = TheGraph.factories.edge.createArrow({
        points: pointsArray,
        className: 'arrow fill route' + this.props.route
      });

      return TheGraph.factories.edge.createEdgeGroup(containerOptions,
         [backgroundPath, arrowBg, foregroundPath, touchPath, arrow]);
    }
  }));

};

},{"./mixins":30,"create-react-class":"create-react-class","react":"react","react-dom":"react-dom"}],34:[function(require,module,exports){
var React = require('react');
var ReactDOM = require('react-dom');
var createReactClass = require('create-react-class');

var geometryutils = require('./geometryutils');

module.exports.register = function (context) {

  var TheGraph = context.TheGraph;

  TheGraph.config.graph = {
    container: {},
    groupsGroup: {
      className: "groups"
    },
    edgesGroup: {
      className: "edges"
    },
    iipsGroup: {
      className: "iips"
    },
    nodesGroup: {
      className: "nodes"
    },
    inportsGroup: {
      className: "ex-inports"
    },
    outportsGroup: {
      className: "ex-outports"
    },
    node: {},
    iip: {},
    inportEdge: {},
    inportNode: {},
    outportEdge: {},
    outportNode: {},
    nodeGroup: {},
    selectionGroup: {
      key: "selectiongroup",
      isSelectionGroup: true,
      label: "",
      description: ""
    },
    edgePreview: {
      key: "edge-preview",
      label: ""
    }
  };

  TheGraph.factories.graph = {
    createGraphContainerGroup: TheGraph.factories.createGroup,
    createGraphGroupsGroup: TheGraph.factories.createGroup,
    createGraphEdgesGroup: TheGraph.factories.createGroup,
    createGraphIIPGroup: TheGraph.factories.createGroup,
    createGraphNodesGroup: TheGraph.factories.createGroup,
    createGraphInportsGroup: TheGraph.factories.createGroup,
    createGraphOutportsGroup: TheGraph.factories.createGroup,
    createGraphNode: createGraphNode,
    createGraphEdge: createGraphEdge,
    createGraphIIP: createGraphIIP,
    createGraphGroup: createGraphGroup,
    createGraphEdgePreview: createGraphEdgePreview
  };

  function createGraphNode(options) {
    return TheGraph.Node(options);
  }

  function createGraphEdge(options) {
    return TheGraph.Edge(options);
  }

  function createGraphIIP(options) {
    return TheGraph.IIP(options);
  }

  function createGraphGroup(options) {
    return TheGraph.Group(options);
  }

  function createGraphEdgePreview(options) {
    return TheGraph.Edge(options);
  }


  // Graph view

  TheGraph.Graph = React.createFactory( createReactClass({
    displayName: "TheGraphGraph",
    mixins: [],
    getDefaultProps: function () {
        return {
            library: {},
            graph: null,
            app: null,
            offsetX: 0,
            offsetY: 0,
            nodeIcons: {}, // allows overriding icon of a node
        };
    },
    getInitialState: function() {
      return {
        displaySelectionGroup: true,
        edgePreview: null,
        edgePreviewX: 0,
        edgePreviewY: 0,
        forceSelection: false,
        selectedNodes: [],
        errorNodes: [],
        selectedEdges: [],
        animatedEdges: [],
        offsetX: this.props.offsetX,
        offsetY: this.props.offsetY
      };
    },
    componentDidMount: function () {
        this.mounted = true;
        this.subscribeGraph(null, this.props.graph);
        ReactDOM.findDOMNode(this).addEventListener("the-graph-node-remove", this.removeNode);
    },
    componentWillUnmount: function () {
        this.mounted = false;
    },
    componentWillReceiveProps: function(nextProps) {
      this.subscribeGraph(this.props.graph, nextProps.graph);
      this.markDirty();
    },
    subscribeGraph: function(previous, next) {
      if (previous) {
        previous.removeListener("addEdge", this.resetPortRoute);
        previous.removeListener("changeEdge", this.resetPortRoute);
        previous.removeListener("removeEdge", this.resetPortRoute);
        previous.removeListener("removeInitial", this.resetPortRoute);

        previous.removeListener("changeNode", this.markDirty);
        previous.removeListener("changeInport", this.markDirty);
        previous.removeListener("changeOutport", this.markDirty);
        previous.removeListener("endTransaction", this.markDirty);
      }
      if (next) {
        // To change port colors
        next.on("addEdge", this.resetPortRoute);
        next.on("changeEdge", this.resetPortRoute);
        next.on("removeEdge", this.resetPortRoute);
        next.on("removeInitial", this.resetPortRoute);

        // Listen to fbp-graph graph object's events
        next.on("changeNode", this.markDirty);
        next.on("changeInport", this.markDirty);
        next.on("changeOutport", this.markDirty);
        next.on("endTransaction", this.markDirty);
      }
    },
    edgePreview: null,
    edgeStart: function (event) {
      // Forwarded from App.edgeStart()

      // Port that triggered this
      var port = event.detail.port;

      // Complete edge if this is the second tap and ports are compatible
      if (this.state.edgePreview && this.state.edgePreview.isIn !== event.detail.isIn) {
        // TODO also check compatible types
        var halfEdge = this.state.edgePreview;
        if (event.detail.isIn) {
          halfEdge.to = port;
        } else {
          halfEdge.from = port;
        }
        this.addEdge(halfEdge);
        this.cancelPreviewEdge();
        return;
      }

      var edge;
      if (event.detail.isIn) {
        edge = { to: port };
      } else {
        edge = { from: port };
      }
      edge.isIn = event.detail.isIn;
      edge.metadata = { route: event.detail.route };
      edge.type = event.detail.port.type;

      var appDomNode = ReactDOM.findDOMNode(this.props.app);
      appDomNode.addEventListener("mousemove", this.renderPreviewEdge);
      appDomNode.addEventListener("panmove", this.renderPreviewEdge);
      // TODO tap to add new node here
      appDomNode.addEventListener("tap", this.cancelPreviewEdge);

      this.setState({edgePreview: edge});
    },
    cancelPreviewEdge: function (event) {
      var appDomNode = ReactDOM.findDOMNode(this.props.app);
      appDomNode.removeEventListener("mousemove", this.renderPreviewEdge);
      appDomNode.removeEventListener("panmove", this.renderPreviewEdge);
      appDomNode.removeEventListener("tap", this.cancelPreviewEdge);
      if (this.state.edgePreview) {
        this.setState({edgePreview: null});
        this.markDirty();
      }
    },
    renderPreviewEdge: function (event) {
      if (event.gesture) {
        event = event.gesture.srcEvent; // unpack hammer.js gesture event 
      }

      var x = event.x || event.clientX || 0;
      var y = event.y || event.clientY || 0;
      if (event.touches && event.touches.length) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
      }

      x -= this.props.app.state.offsetX || 0;
      y -= this.props.app.state.offsetY || 0;
      var scale = this.props.app.state.scale;
      this.setState({
        edgePreviewX: (x - this.props.app.state.x) / scale,
        edgePreviewY: (y - this.props.app.state.y) / scale
      });
      this.markDirty();
    },
    addEdge: function (edge) {
      this.props.graph.addEdge(edge.from.process, edge.from.port, edge.to.process, edge.to.port, edge.metadata);
    },
    moveGroup: function (nodes, dx, dy) {
      var graph = this.props.graph;

      // Move each group member
      var len = nodes.length;
      for (var i=0; i<len; i++) {
        var node = graph.getNode(nodes[i]);
        if (!node) { continue; }
        if (dx !== undefined) {
          // Move by delta
          graph.setNodeMetadata(node.id, {
            x: node.metadata.x + dx,
            y: node.metadata.y + dy
          });
        } else {
          // Snap to grid
          var snap = TheGraph.config.nodeHeight / 2;
          graph.setNodeMetadata(node.id, {
            x: Math.round(node.metadata.x/snap) * snap,
            y: Math.round(node.metadata.y/snap) * snap
          });
        }
      }
    },
    getComponentInfo: function (componentName) {
      console.error("DEPRECATED: getComponentInfo() will be removed in next version of the-graph. Use 'library' in props instead");
      return this.props.library[componentName];
    },
    portInfo: {},
    getPorts: function (graph, processName, componentName) {
      var node = graph.getNode(processName);

      var ports = this.portInfo[processName];
      if (!ports) {
        var inports = {};
        var outports = {};
        if (componentName && this.props.library) {
          // Copy ports from library object
          var component = this.props.library[componentName];
          if (!component) {
            return {
              inports: inports,
              outports: outports
            };
          }
          
          var i, port, len;
          for (i=0, len=component.outports.length; i<len; i++) {
            port = component.outports[i];
            if (!port.name) { continue; }
            outports[port.name] = {
              label: port.name,
              type: port.type,
              x: node.metadata.width,
              y: node.metadata.height / (len+1) * (i+1)
            };
          }
          for (i=0, len=component.inports.length; i<len; i++) {
            port = component.inports[i];
            if (!port.name) { continue; }
            inports[port.name] = {
              label: port.name,
              type: port.type,
              x: 0,
              y: node.metadata.height / (len+1) * (i+1)
            };
          }
        }
        ports = {
          inports: inports,
          outports: outports
        };
        this.portInfo[processName] = ports;
      }
      return ports;
    },
    getNodeOutport: function (graph, processName, portName, route, componentName) {
      var ports = this.getPorts(graph, processName, componentName);
      if ( !ports.outports[portName] ) {
        ports.outports[portName] = {
          label: portName,
          x: TheGraph.config.nodeWidth,
          y: TheGraph.config.nodeHeight / 2
        };
        this.dirty = true;
      }
      var port = ports.outports[portName];
      // Port will have top edge's color
      if (route !== undefined) {
        port.route = route;
      }
      return port;
    },
    getNodeInport: function (graph, processName, portName, route, componentName) {
      var ports = this.getPorts(graph, processName, componentName);
      if ( !ports.inports[portName] ) {
        ports.inports[portName] = {
          label: portName,
          x: 0,
          y: TheGraph.config.nodeHeight / 2
        };
        this.dirty = true;
      }
      var port = ports.inports[portName];
      // Port will have top edge's color
      if (route !== undefined) {
        port.route = route;
      }
      return port;
    },
    resetPortRoute: function (event) {
      // Trigger nodes with changed ports to rerender
      if (event.from && event.from.node) {
        var fromNode = this.portInfo[event.from.node];
        if (fromNode) {
          fromNode.dirty = true;
          var outport = fromNode.outports[event.from.port];
          if (outport) {
            outport.route = null;
          }
        }
      }
      if (event.to && event.to.node) {
        var toNode = this.portInfo[event.to.node];
        if (toNode) {
          toNode.dirty = true;
          var inport = toNode.inports[event.to.port];
          if (inport) {
            inport.route = null;
          }
        }
      }
    },
    graphOutports: {},
    getGraphOutport: function (key) {
      var exp = this.graphOutports[key];
      if (!exp) {
        exp = {inports:{},outports:{}};
        exp.inports[key] = {
          label: key,
          type: "all",
          route: 5,
          x: 0,
          y: TheGraph.config.nodeHeight / 2
        };
        this.graphOutports[key] = exp;
      }
      return exp;
    },
    graphInports: {},
    getGraphInport: function (key) {
      var exp = this.graphInports[key];
      if (!exp) {
        exp = {inports:{},outports:{}};
        exp.outports[key] = {
          label: key,
          type: "all",
          route: 2,
          x: TheGraph.config.nodeWidth,
          y: TheGraph.config.nodeHeight / 2
        };
        this.graphInports[key] = exp;
      }
      return exp;
    },
    setSelectedNodes: function (nodes) {
      this.setState({
        selectedNodes: nodes
      });
      this.markDirty();
    },
    setErrorNodes: function (errors) {
      this.setState({
        errorNodes: errors
      });
      this.markDirty();
    },
    setSelectedEdges: function (edges) {
      this.setState({
        selectedEdges: edges
      });
      this.markDirty();
    },
    setAnimatedEdges: function (edges) {
      this.setState({
        animatedEdges: edges
      });
      this.markDirty();
    },
    updateIcon: function (nodeId, icon) {
      console.error("DEPRECATED: updateIcon() will be removed in next version of the-graph. Pass nodeIcons through props instead");
      // FIXME: deprecated function, to be removed
      this.props.nodeIcons[nodeId] = icon;
      this.markDirty();
    },
    dirty: false,
    libraryDirty: false,
    markDirty: function (event) {
      if (event && event.libraryDirty) {
        this.libraryDirty = true;
      }
      window.requestAnimationFrame(this.triggerRender);
    },
    triggerRender: function (time) {
      if (!this.mounted) {
        return;
      }
      if (this.dirty) {
        return;
      }
      this.dirty = true;
      this.forceUpdate();
    },
    shouldComponentUpdate: function () {
      // If ports change or nodes move, then edges need to rerender, so we do the whole graph
      return this.dirty;
    },
    render: function() {
      this.dirty = false;

      var self = this;
      var graph = this.props.graph;
      var library = this.props.library;
      var selectedIds = [];

      // Reset ports if library has changed
      if (this.libraryDirty) {
        this.libraryDirty = false;
        this.portInfo = {};
      }

      // Highlight compatible ports
      var highlightPort = null;
      if (this.state.edgePreview && this.state.edgePreview.type) {
        highlightPort = {
          type: this.state.edgePreview.type,
          isIn: !this.state.edgePreview.isIn
        };
      }

      // Nodes
      var nodes = graph.nodes.map(function (node) {
        var componentInfo = self.props.library[node.component];
        if (!componentInfo) {
            throw new Error("Component " + node.component + " is not in library");
        }
        var key = node.id;
        if (!node.metadata) {
          node.metadata = {};
        }
        if (node.metadata.x === undefined) { 
          node.metadata.x = 0; 
        }
        if (node.metadata.y === undefined) { 
          node.metadata.y = 0; 
        }
        if (node.metadata.width === undefined) { 
          node.metadata.width = TheGraph.config.nodeWidth; 
        }
        node.metadata.height = TheGraph.config.nodeHeight;
        if (TheGraph.config.autoSizeNode && componentInfo) {
          // Adjust node height based on number of ports.
          var portCount = Math.max(componentInfo.inports.length, componentInfo.outports.length);
          if (portCount > TheGraph.config.maxPortCount) {
            var diff = portCount - TheGraph.config.maxPortCount;
            node.metadata.height = TheGraph.config.nodeHeight + (diff * TheGraph.config.nodeHeightIncrement);
          }
        }
        if (!node.metadata.label || node.metadata.label === "") {
          node.metadata.label = key;
        }
        var icon = "cog";
        var iconsvg = "";
        if (self.props.nodeIcons[key]) {
          icon = self.props.nodeIcons[key];
        } else if (componentInfo && componentInfo.icon) {
          icon = componentInfo.icon;
        } else if (componentInfo && componentInfo.iconsvg) {
          iconsvg = componentInfo.iconsvg;
        }
        var selected = (self.state.selectedNodes[key] === true);
        if (selected) {
          selectedIds.push(key);
        }

        var nodeOptions = {
          key: key,
          nodeID: key,
          x: node.metadata.x,
          y: node.metadata.y,
          label: node.metadata.label,
          sublabel: node.metadata.sublabel || node.component,
          width: node.metadata.width,
          height: node.metadata.height,
          app: self.props.app,
          graphView: self,
          graph: graph,
          node: node,
          icon: icon,
          iconsvg: iconsvg,
          ports: self.getPorts(graph, key, node.component),
          onNodeSelection: self.props.onNodeSelection,
          selected: selected,
          error: (self.state.errorNodes[key] === true),
          showContext: self.props.showContext,
          highlightPort: highlightPort,
          allowEdgeStart: self.props.allowEdgeStart,
        };

        nodeOptions = TheGraph.merge(TheGraph.config.graph.node, nodeOptions);
        return TheGraph.factories.graph.createGraphNode.call(this, nodeOptions);
      });

      // Edges
      var edges = graph.edges.map(function (edge) {
        var source = graph.getNode(edge.from.node);
        var target = graph.getNode(edge.to.node);
        if (!source || !target) {
          return;
        }

        var route = 0;
        if (edge.metadata && edge.metadata.route) {
          route = edge.metadata.route;
        }

        // Initial ports from edges, and give port top/last edge color
        var sourcePort = self.getNodeOutport(graph, edge.from.node, edge.from.port, route, source.component);
        var targetPort = self.getNodeInport(graph, edge.to.node, edge.to.port, route, target.component);

        var label = source.metadata.label + '() ' +
          edge.from.port.toUpperCase() +
          (edge.from.hasOwnProperty('index') ? '['+edge.from.index+']' : '') + ' -> ' +
          edge.to.port.toUpperCase() +
          (edge.to.hasOwnProperty('index') ? '['+edge.to.index+']' : '') + ' ' +
          target.metadata.label + '()';
        var key = edge.from.node + '() ' +
          edge.from.port.toUpperCase() +
          (edge.from.hasOwnProperty('index') ? '['+edge.from.index+']' : '') + ' -> ' +
          edge.to.port.toUpperCase() +
          (edge.to.hasOwnProperty('index') ? '['+edge.to.index+']' : '') + ' ' +
          edge.to.node + '()';

        var edgeOptions = {
          key: key,
          edgeID: key,
          graph: graph,
          edge: edge,
          app: self.props.app,
          sX: source.metadata.x + source.metadata.width,
          sY: source.metadata.y + sourcePort.y,
          tX: target.metadata.x,
          tY: target.metadata.y + targetPort.y,
          label: label,
          route: route,
          onEdgeSelection: self.props.onEdgeSelection,
          selected: (self.state.selectedEdges.indexOf(edge) !== -1),
          animated: (self.state.animatedEdges.indexOf(edge) !== -1),
          showContext: self.props.showContext
        };

        edgeOptions = TheGraph.merge(TheGraph.config.graph.edge, edgeOptions);
        return TheGraph.factories.graph.createGraphEdge.call(this, edgeOptions);
      });

      // IIPs
      var iips = graph.initializers.map(function (iip) {
        var target = graph.getNode(iip.to.node);
        if (!target) { return; }
        
        var targetPort = self.getNodeInport(graph, iip.to.node, iip.to.port, 0, target.component);
        var tX = target.metadata.x;
        var tY = target.metadata.y + targetPort.y;

        var data = iip.from.data;
        var type = typeof data;
        var label = data === true || data === false || type === "number" || type === "string" ? data : type;

        var iipOptions = {
          graph: graph,
          label: label,
          x: tX,
          y: tY
        };

        iipOptions = TheGraph.merge(TheGraph.config.graph.iip, iipOptions);
        return TheGraph.factories.graph.createGraphIIP.call(this, iipOptions);

      });


      // Inport exports
      var inports = Object.keys(graph.inports).map(function (key) {
        var inport = graph.inports[key];
        // Export info
        var label = key;
        var nodeKey = inport.process;
        var portKey = inport.port;
        if (!inport.metadata) { 
          inport.metadata = {x:0, y:0}; 
        }
        var metadata = inport.metadata;
        if (!metadata.x) { metadata.x = 0; }
        if (!metadata.y) { metadata.y = 0; }
        if (!metadata.width) { metadata.width = TheGraph.config.nodeWidth; }
        if (!metadata.height) { metadata.height = TheGraph.config.nodeHeight; }
        // Private port info
        var portInfo = self.portInfo[nodeKey];
        if (!portInfo) {
          console.warn("Node "+nodeKey+" not found for graph inport "+label);
          return;
        }
        var privatePort = portInfo.inports[portKey];
        if (!privatePort) {
          console.warn("Port "+nodeKey+"."+portKey+" not found for graph inport "+label);
          return;
        }
        // Private node
        var privateNode = graph.getNode(nodeKey);
        if (!privateNode) {
          console.warn("Node "+nodeKey+" not found for graph inport "+label);
          return;
        }
        // Node view
        var expNode = {
          key: "inport.node."+key,
          export: inport,
          exportKey: key,
          x: metadata.x,
          y: metadata.y,
          width: metadata.width,
          height: metadata.height,
          label: label,
          app: self.props.app,
          graphView: self,
          graph: graph,
          node: {},
          ports: self.getGraphInport(key),
          isIn: true,
          icon: (metadata.icon ? metadata.icon : "sign-in"),
          showContext: self.props.showContext
        };
        expNode = TheGraph.merge(TheGraph.config.graph.inportNode, expNode);
        // Edge view
        var expEdge = {
          key: "inport.edge."+key,
          export: inport,
          exportKey: key,
          graph: graph,
          app: self.props.app,
          edge: {},
          route: (metadata.route ? metadata.route : 2),
          isIn: true,
          label: "export in " + label.toUpperCase() + " -> " + portKey.toUpperCase() + " " + privateNode.metadata.label,
          sX: expNode.x + TheGraph.config.nodeWidth,
          sY: expNode.y + TheGraph.config.nodeHeight / 2,
          tX: privateNode.metadata.x + privatePort.x,
          tY: privateNode.metadata.y + privatePort.y,
          showContext: self.props.showContext,
          allowEdgeStart: self.props.allowEdgeStart,
        };
        expEdge = TheGraph.merge(TheGraph.config.graph.inportEdge, expEdge);
        edges.unshift(TheGraph.factories.graph.createGraphEdge.call(this, expEdge));
        return TheGraph.factories.graph.createGraphNode.call(this, expNode);
      });


      // Outport exports
      var outports = Object.keys(graph.outports).map(function (key) {
        var outport = graph.outports[key];
        // Export info
        var label = key;
        var nodeKey = outport.process;
        var portKey = outport.port;
        if (!outport.metadata) { 
          outport.metadata = {x:0, y:0}; 
        }
        var metadata = outport.metadata;
        if (!metadata.x) { metadata.x = 0; }
        if (!metadata.y) { metadata.y = 0; }
        if (!metadata.width) { metadata.width = TheGraph.config.nodeWidth; }
        if (!metadata.height) { metadata.height = TheGraph.config.nodeHeight; }
        // Private port info
        var portInfo = self.portInfo[nodeKey];
        if (!portInfo) {
          console.warn("Node "+nodeKey+" not found for graph outport "+label);
          return;
        }
        var privatePort = portInfo.outports[portKey];
        if (!privatePort) {
          console.warn("Port "+nodeKey+"."+portKey+" not found for graph outport "+label);
          return;
        }
        // Private node
        var privateNode = graph.getNode(nodeKey);
        if (!privateNode) {
          console.warn("Node "+nodeKey+" not found for graph outport "+label);
          return;
        }
        // Node view
        var expNode = {
          key: "outport.node."+key,
          export: outport,
          exportKey: key,
          x: metadata.x,
          y: metadata.y,
          width: metadata.width,
          height: metadata.height,
          label: label,
          app: self.props.app,
          graphView: self,
          graph: graph,
          node: {},
          ports: self.getGraphOutport(key),
          isIn: false,
          icon: (metadata.icon ? metadata.icon : "sign-out"),
          showContext: self.props.showContext
        };
        expNode = TheGraph.merge(TheGraph.config.graph.outportNode, expNode);
        // Edge view
        var expEdge = {
          key: "outport.edge."+key,
          export: outport,
          exportKey: key,
          graph: graph,
          app: self.props.app,
          edge: {},
          route: (metadata.route ? metadata.route : 4),
          isIn: false,
          label: privateNode.metadata.label + " " + portKey.toUpperCase() + " -> " + label.toUpperCase() + " export out",
          sX: privateNode.metadata.x + privatePort.x,
          sY: privateNode.metadata.y + privatePort.y,
          tX: expNode.x,
          tY: expNode.y + TheGraph.config.nodeHeight / 2,
          showContext: self.props.showContext,
          allowEdgeStart: self.props.allowEdgeStart,
        };
        expEdge = TheGraph.merge(TheGraph.config.graph.outportEdge, expEdge);
        edges.unshift(TheGraph.factories.graph.createGraphEdge.call(this, expEdge));
        return TheGraph.factories.graph.createGraphNode.call(this, expNode);
      });


      // Groups
      var groups = graph.groups.map(function (group) {
        if (group.nodes.length < 1) {
          return;
        }
        var limits = geometryutils.findMinMax(graph, group.nodes);
        if (!limits) {
          return;
        }
        var groupOptions = {
          key: "group."+group.name,
          graph: graph,
          item: group,
          app: self.props.app,
          minX: limits.minX,
          minY: limits.minY,
          maxX: limits.maxX,
          maxY: limits.maxY,
          scale: self.props.scale,
          label: group.name,
          nodes: group.nodes,
          description: group.metadata.description,
          color: group.metadata.color,
          triggerMoveGroup: self.moveGroup,
          showContext: self.props.showContext
        };
        groupOptions = TheGraph.merge(TheGraph.config.graph.nodeGroup, groupOptions);
        return TheGraph.factories.graph.createGraphGroup.call(this, groupOptions);
      });

      // Selection pseudo-group
      if (this.state.displaySelectionGroup &&
          selectedIds.length >= 2) {
        var limits = geometryutils.findMinMax(graph, selectedIds);
        if (limits) {
          var pseudoGroup = {
            name: "selection",
            nodes: selectedIds,
            metadata: {color:1}
          };
          var selectionGroupOptions = {
            graph: graph,
            app: self.props.app,
            item: pseudoGroup,
            minX: limits.minX,
            minY: limits.minY,
            maxX: limits.maxX,
            maxY: limits.maxY,
            scale: self.props.scale,
            color: pseudoGroup.metadata.color,
            triggerMoveGroup: self.moveGroup,
            showContext: self.props.showContext
          };
          selectionGroupOptions = TheGraph.merge(TheGraph.config.graph.selectionGroup, selectionGroupOptions);
          var selectionGroup = TheGraph.factories.graph.createGraphGroup.call(this, selectionGroupOptions);
          groups.push(selectionGroup);
        }
      }


      // Edge preview
      var edgePreview = this.state.edgePreview;
      if (edgePreview) {
        var edgePreviewOptions;
        if (edgePreview.from) {
          var source = graph.getNode(edgePreview.from.process);
          var sourcePort = this.getNodeOutport(graph, edgePreview.from.process, edgePreview.from.port);
          edgePreviewOptions = {
            sX: source.metadata.x + source.metadata.width,
            sY: source.metadata.y + sourcePort.y,
            tX: this.state.edgePreviewX,
            tY: this.state.edgePreviewY,
            route: edgePreview.metadata.route
          };
        } else {
          var target = graph.getNode(edgePreview.to.process);
          var targetPort = this.getNodeInport(graph, edgePreview.to.process, edgePreview.to.port);
          edgePreviewOptions = {
            sX: this.state.edgePreviewX,
            sY: this.state.edgePreviewY,
            tX: target.metadata.x,
            tY: target.metadata.y + targetPort.y,
            route: edgePreview.metadata.route
          };
        }
        edgePreviewOptions = TheGraph.merge(TheGraph.config.graph.edgePreview, edgePreviewOptions);
        var edgePreviewView = TheGraph.factories.graph.createGraphEdgePreview.call(this, edgePreviewOptions);
        edges.push(edgePreviewView);
      }

      var groupsOptions = TheGraph.merge(TheGraph.config.graph.groupsGroup, { children: groups });
      var groupsGroup = TheGraph.factories.graph.createGraphGroupsGroup.call(this, groupsOptions);

      var edgesOptions = TheGraph.merge(TheGraph.config.graph.edgesGroup, { children: edges });
      var edgesGroup = TheGraph.factories.graph.createGraphEdgesGroup.call(this, edgesOptions);

      var iipsOptions = TheGraph.merge(TheGraph.config.graph.iipsGroup, { children: iips });
      var iipsGroup = TheGraph.factories.graph.createGraphIIPGroup.call(this, iipsOptions);

      var nodesOptions = TheGraph.merge(TheGraph.config.graph.nodesGroup, { children: nodes });
      var nodesGroup = TheGraph.factories.graph.createGraphNodesGroup.call(this, nodesOptions);

      var inportsOptions = TheGraph.merge(TheGraph.config.graph.inportsGroup, { children: inports });
      var inportsGroup = TheGraph.factories.graph.createGraphInportsGroup.call(this, inportsOptions);

      var outportsOptions = TheGraph.merge(TheGraph.config.graph.outportsGroup, { children: outports });
      var outportsGroup = TheGraph.factories.graph.createGraphGroupsGroup.call(this, outportsOptions);

      var containerContents = [
        groupsGroup,
        edgesGroup,
        iipsGroup,
        nodesGroup,
        inportsGroup,
        outportsGroup
      ];

      var selectedClass = (this.state.forceSelection ||
                           selectedIds.length>0) ? ' selection' : '';

      var containerOptions = TheGraph.merge(TheGraph.config.graph.container, { className: 'graph' + selectedClass });
      return TheGraph.factories.graph.createGraphContainerGroup.call(this, containerOptions, containerContents);

    }
  }));  

};

},{"./geometryutils":27,"create-react-class":"create-react-class","react":"react","react-dom":"react-dom"}],35:[function(require,module,exports){
var React = require('react');
var ReactDOM = require('react-dom');
var createReactClass = require('create-react-class');

module.exports.register = function (context) {

  var TheGraph = context.TheGraph;

  TheGraph.config.group = {
    container: {
      className: "group"
    },
    boxRect: {
      rx: TheGraph.config.nodeRadius,
      ry: TheGraph.config.nodeRadius
    },
    labelText: {
      className: "group-label"
    },
    descriptionText: {
      className: "group-description"
    }
  };

  TheGraph.factories.group = {
    createGroupGroup: TheGraph.factories.createGroup,
    createGroupBoxRect: TheGraph.factories.createRect,
    createGroupLabelText: TheGraph.factories.createText,
    createGroupDescriptionText: TheGraph.factories.createText
  };

  // Group view

  TheGraph.Group = React.createFactory( createReactClass({
    displayName: "TheGraphGroup",
    getInitialState: function () {
        return {
            moving: false,
            lastTrackX: null,
            lastTrackY: null,
        };
    },
    componentDidMount: function () {

      // Move group
      var dragNode = ReactDOM.findDOMNode(this.refs.events);
      dragNode.addEventListener('panstart', this.onTrackStart);

      // Context menu
      var domNode = ReactDOM.findDOMNode(this);
      if (this.props.showContext) {
        domNode.addEventListener("contextmenu", this.showContext);
        domNode.addEventListener("press", this.showContext);
      }

    },
    showContext: function (event) {
      // Don't show native context menu
      event.preventDefault();

      // Don't tap graph on hold event
      if (event.stopPropagation) { event.stopPropagation(); }
      if (event.preventTap) { event.preventTap(); }

      // Get mouse position
      if (event.gesture) {
        event = event.gesture.srcEvent; // unpack hammer.js gesture event 
      }
      var x = event.x || event.clientX || 0;
      var y = event.y || event.clientY || 0;
      if (event.touches && event.touches.length) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
      }

      // App.showContext
      this.props.showContext({
        element: this,
        type: (this.props.isSelectionGroup ? "selection" : "group"),
        x: x,
        y: y,
        graph: this.props.graph,
        itemKey: this.props.label,
        item: this.props.item
      });
    },
    getContext: function (menu, options, hide) {
      return TheGraph.Menu({
        menu: menu,
        options: options,
        label: this.props.label,
        triggerHideContext: hide
      });
    },
    onTrackStart: function (event) {
      // Don't pan graph
      event.stopPropagation();
      this.setState({ moving: true });
      this.setState({ lastTrackX: 0, lastTrackY: 0});

      var dragNode = ReactDOM.findDOMNode(this.refs.events);
      dragNode.addEventListener("panmove", this.onTrack);
      dragNode.addEventListener("panend", this.onTrackEnd);

      this.props.graph.startTransaction('movegroup');
    },
    onTrack: function (event) {
      // Don't pan graph
      event.stopPropagation();

      // Reconstruct relative motion since last event
      var x = event.gesture.deltaX;
      var y = event.gesture.deltaY;
      var movementX = x - this.state.lastTrackX;
      var movementY = y - this.state.lastTrackY;

      var deltaX = Math.round( movementX / this.props.scale );
      var deltaY = Math.round( movementY / this.props.scale );

      this.setState({ lastTrackX: x , lastTrackY: y });
      this.props.triggerMoveGroup(this.props.item.nodes, deltaX, deltaY);
    },
    onTrackEnd: function (event) {
      this.setState({ moving: false });
      // Don't pan graph
      event.stopPropagation();

      // Snap to grid
      this.props.triggerMoveGroup(this.props.item.nodes);

      var dragNode = ReactDOM.findDOMNode(this.refs.events);
      dragNode.addEventListener("panmove", this.onTrack);
      dragNode.addEventListener("panend", this.onTrackEnd);

      this.setState({ lastTrackX: null, lastTrackY: null});
      this.props.graph.endTransaction('movegroup');
    },
    render: function() {
      var x = this.props.minX - TheGraph.config.nodeWidth / 2;
      var y = this.props.minY - TheGraph.config.nodeHeight / 2;
      var color = (this.props.color ? this.props.color : 0);
      var selection = (this.props.isSelectionGroup ? ' selection drag' : '');

      var boxRectOptions = {
        x: x,
        y: y,
        width: this.props.maxX - x + TheGraph.config.nodeWidth*0.5,
        height: this.props.maxY - y + TheGraph.config.nodeHeight*0.75,
        className: "group-box color"+color + selection,
      };
      boxRectOptions = TheGraph.merge(TheGraph.config.group.boxRect, boxRectOptions);
      var boxRect =  TheGraph.factories.group.createGroupBoxRect.call(this, boxRectOptions);

      var labelTextOptions = {
        x: x + TheGraph.config.nodeRadius,
        y: y + 9,
        children: this.props.label,
      };
      labelTextOptions = TheGraph.merge(TheGraph.config.group.labelText, labelTextOptions);
      var labelText = TheGraph.factories.group.createGroupLabelText.call(this, labelTextOptions);

      var descriptionTextOptions = {
        x: x + TheGraph.config.nodeRadius,
        y: y + 24,
        children: this.props.description
      };
      descriptionTextOptions = TheGraph.merge(TheGraph.config.group.descriptionText, descriptionTextOptions);
      var descriptionText = TheGraph.factories.group.createGroupDescriptionText.call(this, descriptionTextOptions);

      // When moving, expand bounding box of element
      // to catch events when pointer moves faster than we can move the element
      var eventOptions = {
        className: 'eventcatcher drag',
        ref: 'events',
      };
      if (this.props.isSelectionGroup) {
        eventOptions.x = boxRectOptions.x;
        eventOptions.y = boxRectOptions.y;
        eventOptions.width = boxRectOptions.width;
        eventOptions.height = boxRectOptions.height;
      } else {
        eventOptions.x = boxRectOptions.x;
        eventOptions.y = boxRectOptions.y;
        eventOptions.width = 24 * this.props.label.length * 0.75;
        eventOptions.height = 24 * 2;
      }
      if (this.state.moving) {
        var extend = 1000;
        eventOptions.width += extend*2;
        eventOptions.height += extend*2;
        eventOptions.x -= extend;
        eventOptions.y -= extend;
      }
      var eventCatcher = TheGraph.factories.createRect(eventOptions);

      var groupContents = [
        boxRect,
        labelText,
        descriptionText,
        eventCatcher,
      ];

      var containerOptions = TheGraph.merge(TheGraph.config.group.container, {});
      return TheGraph.factories.group.createGroupGroup.call(this, containerOptions, groupContents);

    }
  }));


};

},{"create-react-class":"create-react-class","react":"react","react-dom":"react-dom"}],36:[function(require,module,exports){
var React = require('react');
var createReactClass = require('create-react-class');

var TextBG = require('./TextBG');

module.exports.register = function (context) {

  var TheGraph = context.TheGraph;

  TheGraph.config.iip = {
    container: {
      className: "iip"
    },
    path: {
      className: "iip-path"
    },
    text: {
      className: "iip-info",
      height: 5,
      halign: "right"
    }
  };

  TheGraph.factories.iip = {
    createIIPContainer: TheGraph.factories.createGroup,
    createIIPPath: TheGraph.factories.createPath,
    createIIPText: createIIPText
  };

  function createIIPText(options) {
    return TextBG(options);
  }

  // Const
  var CURVE = 50;


  // Edge view

  TheGraph.IIP = React.createFactory( createReactClass({
    displayName: "TheGraphIIP",
    shouldComponentUpdate: function (nextProps, nextState) {
      // Only rerender if changed

      return (
        nextProps.x !== this.props.x || 
        nextProps.y !== this.props.y ||
        nextProps.label !== this.props.label
      );
    },
    render: function () {
      var x = this.props.x;
      var y = this.props.y;

      var path = [
        "M", x, y,
        "L", x-10, y
      ].join(" ");

      // Make a string
      var label = this.props.label+"";
      // TODO make this smarter with ZUI
      if (label.length > 12) {
        label = label.slice(0, 9) + "...";
      }

      var pathOptions = TheGraph.merge(TheGraph.config.iip.path, {d: path});
      var iipPath = TheGraph.factories.iip.createIIPPath.call(this, pathOptions);

      var textOptions = TheGraph.merge(TheGraph.config.iip.text, {x: x - 10, y: y, text: label});
      var text = TheGraph.factories.iip.createIIPText.call(this, textOptions);

      var containerContents = [iipPath, text];

      var containerOptions = TheGraph.merge(TheGraph.config.iip.container, {title: this.props.label});
      return TheGraph.factories.iip.createIIPContainer.call(this, containerOptions, containerContents);
    }
  }));

};

},{"./TextBG":23,"create-react-class":"create-react-class","react":"react"}],37:[function(require,module,exports){
// Component library functionality
function mergeComponentDefinition(component, definition) {
  // In cases where a component / subgraph ports change,
  // we don't want the connections hanging in middle of node
  // TODO visually indicate that port is a ghost
  if (component === definition) {
    return definition;
  }
  var _i, _j, _len, _len1, exists;
  var cInports = component.inports;
  var dInports = definition.inports;

  if (cInports !== dInports) {
    for (_i = 0, _len = cInports.length; _i < _len; _i++) {
      var cInport = cInports[_i];
      exists = false;
      for (_j = 0, _len1 = dInports.length; _j < _len1; _j++) {
        var dInport = dInports[_j];
        if (cInport.name === dInport.name) {
          exists = true;
        }
      }
      if (!exists) {
        dInports.push(cInport);
      }
    }
  }

  var cOutports = component.outports;
  var dOutports = definition.outports;

  if (cOutports !== dOutports) {
    for (_i = 0, _len = cOutports.length; _i < _len; _i++) {
      var cOutport = cOutports[_i];
      exists = false;
      for (_j = 0, _len1 = dOutports.length; _j < _len1; _j++) {
        var dOutport = dOutports[_j];
        if (cOutport.name === dOutport.name) {
          exists = true;
        }
      }
      if (!exists) {
        dOutports.push(cOutport);
      }
    }
  }

  if (definition.icon !== 'cog') {
    // Use the latest icon given
    component.icon = definition.icon;
  } else {
    // we should use the icon from the library
    definition.icon = component.icon;
  }
  // a component could also define a svg icon
  definition.iconsvg = component.iconsvg;

  return definition;
}

function componentsFromGraph(fbpGraph) {
  var components = [];

  fbpGraph.nodes.forEach(function (node) {
    var component = {
      name: node.component,
      icon: 'cog',
      description: '',
      inports: [],
      outports: []
    };

    Object.keys(fbpGraph.inports).forEach(function (pub) {
      var exported = fbpGraph.inports[pub];
      if (exported.process === node.id) {
        for (var i = 0; i < component.inports.length; i++) {
          if (component.inports[i].name === exported.port) {
            return;
          }
        }
        component.inports.push({
          name: exported.port,
          type: 'all'
        });
      }
    });
    Object.keys(fbpGraph.outports).forEach(function (pub) {
      var exported = fbpGraph.outports[pub];
      if (exported.process === node.id) {
        for (var i = 0; i < component.outports.length; i++) {
          if (component.outports[i].name === exported.port) {
            return;
          }
        }
        component.outports.push({
          name: exported.port,
          type: 'all'
        });
      }
    });
    fbpGraph.initializers.forEach(function (iip) {
      if (iip.to.node === node.id) {
        for (var i = 0; i < component.inports.length; i++) {
          if (component.inports[i].name === iip.to.port) {
            return;
          }
        }
        component.inports.push({
          name: iip.to.port,
          type: 'all'
        });
      }
    });

    fbpGraph.edges.forEach(function (edge) {
      var i;
      if (edge.from.node === node.id) {
        for (i = 0; i < component.outports.length; i++) {
          if (component.outports[i].name === edge.from.port) {
            return;
          }
        }
        component.outports.push({
          name: edge.from.port,
          type: 'all'
        });
      }
      if (edge.to.node === node.id) {
        for (i = 0; i < component.inports.length; i++) {
          if (component.inports[i].name === edge.to.port) {
            return;
          }
        }
        component.inports.push({
          name: edge.to.port,
          type: 'all'
        });
      }
    });
    components.push(component);
  });
  return components;
}

function libraryFromGraph(fbpGraph) {
    var library = {};
    var components = componentsFromGraph(fbpGraph);
    components.forEach(function(c) {
        library[c.name] = c;
    });
    return library;
}

module.exports = {
  mergeComponentDefinition: mergeComponentDefinition,
  componentsFromGraph: componentsFromGraph,
  libraryFromGraph: libraryFromGraph,
};

},{}],38:[function(require,module,exports){
var React = require('react');
var ReactDOM = require('react-dom');
var createReactClass = require('create-react-class');

var arcs = require('./arcs');
var merge = require('./merge');
var FONT_AWESOME = require('./font-awesome-unicode-map.js');
var baseFactories = require('./factories');

var config = {
  radius: 72,
  positions: {
    n4IconX: 0,
    n4IconY: -52,
    n4LabelX: 0,
    n4LabelY: -35,
    s4IconX: 0,
    s4IconY: 52,
    s4LabelX: 0,
    s4LabelY: 35,
    e4IconX: 45,
    e4IconY: -5,
    e4LabelX: 45,
    e4LabelY: 15,
    w4IconX: -45,
    w4IconY: -5,
    w4LabelX: -45,
    w4LabelY: 15
  },
  container: {
    className: "context-menu"
  },
  arcPath: {
    className: "context-arc context-node-info-bg"
  },
  sliceIconText: {
    className: "icon context-icon context-node-info-icon"
  },
  sliceLabelText: {
    className: "context-arc-label"
  },
  sliceIconLabelText: {
    className: "context-arc-icon-label"
  },
  circleXPath: {
    className: "context-circle-x",
    d: "M -51 -51 L 51 51 M -51 51 L 51 -51"
  },
  outlineCircle: {
    className: "context-circle"
  },
  labelText: {
    className: "context-node-label"
  },
  iconRect: {
    className: "context-node-rect",
    x: -24,
    y: -24,
    width: 48,
    height: 48,
    rx: 8,
    ry: 8,
  }
};

var factories = {
  createMenuGroup: baseFactories.createGroup,
  createMenuSlice: createMenuSlice,
  createMenuSliceArcPath: baseFactories.createPath,
  createMenuSliceText: baseFactories.createText,
  createMenuSliceIconText: baseFactories.createText,
  createMenuSliceLabelText: baseFactories.createText,
  createMenuSliceIconLabelText: baseFactories.createText,
  createMenuCircleXPath: baseFactories.createPath,
  createMenuOutlineCircle: baseFactories.createCircle,
  createMenuLabelText: baseFactories.createText,
  createMenuMiddleIconRect: baseFactories.createRect,
  createMenuMiddleIconText: baseFactories.createText
};

function createMenuSlice(options) {
  /*jshint validthis:true */
  var direction = options.direction;
  var arcPathOptions = merge(config.arcPath, { d: arcs[direction] });
  var children = [
    factories.createMenuSliceArcPath(arcPathOptions)
  ];

  if (this.props.menu[direction]) {
    var slice = this.props.menu[direction];
    if (slice.icon) {
      var sliceIconTextOptions = {
        x: config.positions[direction+"IconX"],
        y: config.positions[direction+"IconY"],
        children: FONT_AWESOME[ slice.icon ]
      };
      sliceIconTextOptions = merge(config.sliceIconText, sliceIconTextOptions);
      children.push(factories.createMenuSliceIconText.call(this, sliceIconTextOptions));
    }
    if (slice.label) {
      var sliceLabelTextOptions = {
        x: config.positions[direction+"IconX"],
        y: config.positions[direction+"IconY"],
        children: slice.label
      };
      sliceLabelTextOptions = merge(config.sliceLabelText, sliceLabelTextOptions);
      children.push(factories.createMenuSliceLabelText.call(this, sliceLabelTextOptions));
    }
    if (slice.iconLabel) {
      var sliceIconLabelTextOptions = {
        x: config.positions[direction+"LabelX"],
        y: config.positions[direction+"LabelY"],
        children: slice.iconLabel
      };
      sliceIconLabelTextOptions = merge(config.sliceIconLabelText, sliceIconLabelTextOptions);
      children.push(factories.createMenuSliceIconLabelText.call(this, sliceIconLabelTextOptions));
    }
  }

  var containerOptions = {
    ref: direction,
    className: "context-slice context-node-info" + (this.state[direction+"tappable"] ? " click" : ""),
    children: children
  };
  containerOptions = merge(config.container, containerOptions);
  return factories.createMenuGroup.call(this, containerOptions);
}

var Menu = React.createFactory( createReactClass({
  displayName: "TheGraphMenu",
  radius: config.radius,
  getInitialState: function() {
    // Use these in CSS for cursor and hover, and to attach listeners
    return {
      n4tappable: (this.props.menu.n4 && this.props.menu.n4.action),
      s4tappable: (this.props.menu.s4 && this.props.menu.s4.action),
      e4tappable: (this.props.menu.e4 && this.props.menu.e4.action),
      w4tappable: (this.props.menu.w4 && this.props.menu.w4.action),
    };
  },
  onTapN4: function () {
    var options = this.props.options;
    this.props.menu.n4.action(options.graph, options.itemKey, options.item);
    this.props.triggerHideContext();
  },
  onTapS4: function () {
    var options = this.props.options;
    this.props.menu.s4.action(options.graph, options.itemKey, options.item);
    this.props.triggerHideContext();
  },
  onTapE4: function () {
    var options = this.props.options;
    this.props.menu.e4.action(options.graph, options.itemKey, options.item);
    this.props.triggerHideContext();
  },
  onTapW4: function () {
    var options = this.props.options;
    this.props.menu.w4.action(options.graph, options.itemKey, options.item);
    this.props.triggerHideContext();
  },
  componentDidMount: function () {
    if (this.state.n4tappable) {
      this.refs.n4.addEventListener("tap", this.onTapN4);
    }
    if (this.state.s4tappable) {
      this.refs.s4.addEventListener("tap", this.onTapS4);
    }
    if (this.state.e4tappable) {
      this.refs.e4.addEventListener("tap", this.onTapE4);
    }
    if (this.state.w4tappable) {
      this.refs.w4.addEventListener("tap", this.onTapW4);
    }

    // Prevent context menu
    ReactDOM.findDOMNode(this).addEventListener("contextmenu", function (event) {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
    }, false);
  },
  getPosition: function () {
    return {
      x: this.props.x !== undefined ? this.props.x : this.props.options.x || 0,
      y: this.props.y !== undefined ? this.props.y : this.props.options.y || 0
    };
  },
  render: function() {
    var menu = this.props.menu;
    var options = this.props.options;
    var position = this.getPosition();

    var circleXOptions = merge(config.circleXPath, {});
    var outlineCircleOptions = merge(config.outlineCircle, {r: this.radius });

    var children = [
      // Directional slices
      factories.createMenuSlice.call(this, { direction: "n4" }),
      factories.createMenuSlice.call(this, { direction: "s4" }),
      factories.createMenuSlice.call(this, { direction: "e4" }),
      factories.createMenuSlice.call(this, { direction: "w4" }),
      // Outline and X
      factories.createMenuCircleXPath.call(this, circleXOptions),
      factories.createMenuOutlineCircle.call(this, outlineCircleOptions)
    ];
    // Menu label
    if (this.props.label || menu.icon) {

      var labelTextOptions = {
        x: 0,
        y: 0 - this.radius - 15,
        children: (this.props.label ? this.props.label : menu.label)
      };

      labelTextOptions = merge(config.labelText, labelTextOptions);
      children.push(factories.createMenuLabelText.call(this, labelTextOptions));
    }
    // Middle icon
    if (this.props.icon || menu.icon) {
      var iconColor = (this.props.iconColor!==undefined ? this.props.iconColor : menu.iconColor);
      var iconStyle = "";
      if (iconColor) {
        iconStyle = " fill route"+iconColor;
      }

      var middleIconRectOptions = merge(config.iconRect, {});
      var middleIcon = factories.createMenuMiddleIconRect.call(this, middleIconRectOptions);

      var middleIconTextOptions = {
        className: "icon context-node-icon"+iconStyle,
        children: FONT_AWESOME[ (this.props.icon ? this.props.icon : menu.icon) ]
      };
      middleIconTextOptions = merge(config.iconText, middleIconTextOptions);
      var iconText = factories.createMenuMiddleIconText.call(this, middleIconTextOptions);

      children.push(middleIcon, iconText);
    }

    var containerOptions = {
      transform: "translate("+position.x+","+position.y+")",
      children: children
    };

    containerOptions = merge(config.container, containerOptions);
    return factories.createMenuGroup.call(this, containerOptions);

  }
}));

module.exports = {
  Menu: Menu,
  config: config,
  factories: factories,
};


},{"./arcs":24,"./factories":25,"./font-awesome-unicode-map.js":26,"./merge":29,"create-react-class":"create-react-class","react":"react","react-dom":"react-dom"}],39:[function(require,module,exports){
var React = require('react');
var ReactDOM = require('react-dom');
var createReactClass = require('create-react-class');
var baseFactories = require('./factories');

var config = {
  container: {},
  rect: {
    ref: "rect",
    className: "context-modal-bg"
  }
};

var factories = {
  createModalBackgroundGroup: baseFactories.createGroup,
  createModalBackgroundRect: baseFactories.createRect
};


var ModalBG = React.createFactory( createReactClass({
  displayName: "TheGraphModalBG",
  componentDidMount: function () {
    var domNode = ReactDOM.findDOMNode(this);
    var rectNode = this.refs.rect; 


    // Right-click on another item will show its menu
    domNode.addEventListener("mousedown", function (event) {
      // Only if outside of menu
      if (event && event.target===rectNode) {
        this.hideModal();
      }
    }.bind(this));
  },
  hideModal: function (event) {
    this.props.triggerHideContext();
  },
  render: function () {
    var rectOptions = {
      width: this.props.width,
      height: this.props.height
    };

    rectOptions = merge(config.rect, rectOptions);
    var rect = factories.createModalBackgroundRect.call(this, rectOptions);

    var containerContents = [rect, this.props.children];
    var containerOptions = merge(config.container, {});
    return factories.createModalBackgroundGroup.call(this, containerOptions, containerContents);
  }
}));

module.exports = {
  ModalBG: ModalBG,
  config: config,
  factories: factories,
};

},{"./factories":25,"create-react-class":"create-react-class","react":"react","react-dom":"react-dom"}],40:[function(require,module,exports){
var React = require('react');
var ReactDOM = require('react-dom');
var createReactClass = require('create-react-class');

module.exports.register = function (context) {

  var TheGraph = context.TheGraph;

  TheGraph.config.nodeMenuPort = {
    container: {},
    backgroundRect: {
      rx: TheGraph.config.nodeRadius,
      ry: TheGraph.config.nodeRadius,
      height: TheGraph.contextPortSize - 1
    },
    circle: {
      r: 10
    },
    text: {}
  };

  TheGraph.factories.nodeMenuPort = {
    createNodeMenuPortGroup: TheGraph.factories.createGroup,
    createNodeMenuBackgroundRect: TheGraph.factories.createRect,
    createNodeMenuPortCircle: TheGraph.factories.createCircle,
    createNodeMenuPortText: TheGraph.factories.createText
  };


  TheGraph.NodeMenuPort = React.createFactory( createReactClass({
    displayName: "TheGraphNodeMenuPort",
    componentDidMount: function () {
      ReactDOM.findDOMNode(this).addEventListener("tap", this.edgeStart);
    },
    edgeStart: function (event) {
      // Don't tap graph
      event.stopPropagation();

      var port = {
        process: this.props.processKey,
        port: this.props.label,
        type: this.props.port.type
      };

      var edgeStartEvent = new CustomEvent('the-graph-edge-start', { 
        detail: {
          isIn: this.props.isIn,
          port: port,
          route: this.props.route
        },
        bubbles: true
      });
      ReactDOM.findDOMNode(this).dispatchEvent(edgeStartEvent);
    },
    render: function() {
      var labelLen = this.props.label.length;
      var bgWidth = (labelLen>12 ? labelLen*8+40 : 120);
      // Highlight compatible port
      var highlightPort = this.props.highlightPort;
      var highlight = (highlightPort && highlightPort.isIn === this.props.isIn && highlightPort.type === this.props.port.type);

      var rectOptions = {
        className: "context-port-bg"+(highlight ? " highlight" : ""),
        x: this.props.x + (this.props.isIn ? -bgWidth : 0),
        y: this.props.y - TheGraph.contextPortSize/2,
        width: bgWidth
      };

      rectOptions = TheGraph.merge(TheGraph.config.nodeMenuPort.backgroundRect, rectOptions);
      var rect = TheGraph.factories.nodeMenuPort.createNodeMenuBackgroundRect.call(this, rectOptions);

      var circleOptions = {
        className: "context-port-hole stroke route"+this.props.route,
        cx: this.props.x,
        cy: this.props.y,
      };
      circleOptions = TheGraph.merge(TheGraph.config.nodeMenuPort.circle, circleOptions);
      var circle = TheGraph.factories.nodeMenuPort.createNodeMenuPortCircle.call(this, circleOptions);

      var textOptions = {
        className: "context-port-label fill route"+this.props.route,
        x: this.props.x + (this.props.isIn ? -20 : 20),
        y: this.props.y,
        children: this.props.label.replace(/(.*)\/(.*)(_.*)\.(.*)/, '$2.$4')
      };

      textOptions = TheGraph.merge(TheGraph.config.nodeMenuPort.text, textOptions);
      var text = TheGraph.factories.nodeMenuPort.createNodeMenuPortText.call(this, textOptions);

      var containerContents = [rect, circle, text];

      var containerOptions = TheGraph.merge(TheGraph.config.nodeMenuPort.container, { className: "context-port click context-port-"+(this.props.isIn ? "in" : "out") });
      return TheGraph.factories.nodeMenuPort.createNodeMenuPortGroup.call(this, containerOptions, containerContents);

    }
  }));


};

},{"create-react-class":"create-react-class","react":"react","react-dom":"react-dom"}],41:[function(require,module,exports){
var React = require('react');
var createReactClass = require('create-react-class');

module.exports.register = function (context) {

  var TheGraph = context.TheGraph;

  TheGraph.config.nodeMenuPorts = {
    container: {},
    linesGroup: {
      className: "context-ports-lines"
    },
    portsGroup: {
      className: "context-ports-ports"
    },
    portPath: {
      className: "context-port-path"
    },
    nodeMenuPort: {}
  };

  TheGraph.factories.menuPorts = {
    createNodeMenuPortsGroup: TheGraph.factories.createGroup,
    createNodeMenuPortsLinesGroup: TheGraph.factories.createGroup,
    createNodeMenuPortsPortsGroup: TheGraph.factories.createGroup,
    createNodeMenuPortsPortPath: TheGraph.factories.createPath,
    createNodeMenuPortsNodeMenuPort: createNodeMenuPort
  };

  function createNodeMenuPort(options) {
    return TheGraph.NodeMenuPort(options);
  }

  TheGraph.NodeMenuPorts = React.createFactory( createReactClass({
    displayName: "TheGraphNodeMenuPorts",
    render: function() {
      var portViews = [];
      var lines = [];

      var scale = this.props.scale;
      var ports = this.props.ports;
      var deltaX = this.props.deltaX;
      var deltaY = this.props.deltaY;

      var keys = Object.keys(this.props.ports);
      var h = keys.length * TheGraph.contextPortSize;
      var len = keys.length;
      for (var i=0; i<len; i++) {
        var key = keys[i];
        var port = ports[key];

        var x = (this.props.isIn ? -100 : 100);
        var y = 0 - h/2 + i*TheGraph.contextPortSize + TheGraph.contextPortSize/2;
        var ox = (port.x - this.props.nodeWidth/2) * scale + deltaX;
        var oy = (port.y - this.props.nodeHeight/2) * scale + deltaY;

        // Make path from graph port to menu port
        var lineOptions = TheGraph.merge(TheGraph.config.nodeMenuPorts.portPath, { d: [ "M", ox, oy, "L", x, y ].join(" ") });
        var line = TheGraph.factories.menuPorts.createNodeMenuPortsPortPath.call(this, lineOptions);

        var portViewOptions = {
          label: key,
          port: port,
          processKey: this.props.processKey,
          isIn: this.props.isIn,
          x: x,
          y: y,
          route: port.route,
          highlightPort: this.props.highlightPort
        };
        portViewOptions = TheGraph.merge(TheGraph.config.nodeMenuPorts.nodeMenuPort, portViewOptions);
        var portView = TheGraph.factories.menuPorts.createNodeMenuPortsNodeMenuPort.call(this, portViewOptions);

        lines.push(line);
        portViews.push(portView);
      }

      var transform = "";
      if (this.props.translateX !== undefined) {
        transform = "translate("+this.props.translateX+","+this.props.translateY+")";
      }

      var linesGroupOptions = TheGraph.merge(TheGraph.config.nodeMenuPorts.linesGroup, { children: lines });
      var linesGroup = TheGraph.factories.menuPorts.createNodeMenuPortsLinesGroup.call(this, linesGroupOptions);

      var portsGroupOptions = TheGraph.merge(TheGraph.config.nodeMenuPorts.portsGroup, { children: portViews });
      var portsGroup = TheGraph.factories.menuPorts.createNodeMenuPortsGroup.call(this, portsGroupOptions);

      var containerContents = [linesGroup, portsGroup];
      var containerOptions = {
        className: "context-ports context-ports-"+(this.props.isIn ? "in" : "out"),
        transform: transform
      };
      containerOptions = TheGraph.merge(TheGraph.config.nodeMenuPorts.container, containerOptions);
      return TheGraph.factories.menuPorts.createNodeMenuPortsGroup.call(this, containerOptions, containerContents);
    }
  }));


};

},{"create-react-class":"create-react-class","react":"react"}],42:[function(require,module,exports){
var React = require('react');
var ReactDOM = require('react-dom');
var createReactClass = require('create-react-class');

module.exports.register = function (context) {

  var TheGraph = context.TheGraph;

  TheGraph.config.nodeMenu = {
    container: {
      className: "context-node"
    },
    inports: {},
    outports: {},
    menu: {
      x: 0,
      y: 0
    }
  };

  TheGraph.factories.nodeMenu = {
    createNodeMenuGroup: TheGraph.factories.createGroup,
    createNodeMenuInports: createNodeMenuPorts,
    createNodeMenuOutports: createNodeMenuPorts,
    createNodeMenuMenu: createNodeMenuMenu
  };

  function createNodeMenuPorts(options) {
    return TheGraph.NodeMenuPorts(options);
  }

  function createNodeMenuMenu(options) {
    return TheGraph.Menu(options);
  }

  TheGraph.NodeMenu = React.createFactory( createReactClass({
    displayName: "TheGraphNodeMenu",
    radius: 72,
    stopPropagation: function (event) {
      // Don't drag graph
      event.stopPropagation();
    },
    componentDidMount: function () {
      // Prevent context menu
      ReactDOM.findDOMNode(this).addEventListener("contextmenu", function (event) {
        event.stopPropagation();
        event.preventDefault();
      }, false);
    },
    render: function() {
      var scale = this.props.node.props.app.state.scale;
      var ports = this.props.ports;
      var deltaX = this.props.deltaX;
      var deltaY = this.props.deltaY;

      var inportsOptions = {
        ports: ports.inports,
        isIn: true,
        scale: scale,
        processKey: this.props.processKey,
        deltaX: deltaX,
        deltaY: deltaY,
        nodeWidth: this.props.nodeWidth,
        nodeHeight: this.props.nodeHeight,
        highlightPort: this.props.highlightPort
      };

      inportsOptions = TheGraph.merge(TheGraph.config.nodeMenu.inports, inportsOptions);
      var inports = TheGraph.factories.nodeMenu.createNodeMenuInports.call(this, inportsOptions);

      var outportsOptions = {
        ports: ports.outports,
        isIn: false,
        scale: scale,
        processKey: this.props.processKey,
        deltaX: deltaX,
        deltaY: deltaY,
        nodeWidth: this.props.nodeWidth,
        nodeHeight: this.props.nodeHeight,
        highlightPort: this.props.highlightPort
      };

      outportsOptions = TheGraph.merge(TheGraph.config.nodeMenu.outports, outportsOptions);
      var outports = TheGraph.factories.nodeMenu.createNodeMenuOutports.call(this, outportsOptions);

      var menuOptions = {
        menu: this.props.menu,
        options: this.props.options,
        triggerHideContext: this.props.triggerHideContext,
        icon: this.props.icon,
        label: this.props.label
      };

      menuOptions = TheGraph.merge(TheGraph.config.nodeMenu.menu, menuOptions);
      var menu = TheGraph.factories.nodeMenu.createNodeMenuMenu.call(this, menuOptions);

      var children = [
        inports, outports, menu
      ];

      var containerOptions = {
        transform: "translate("+this.props.x+","+this.props.y+")",
        children: children
      };
      containerOptions = TheGraph.merge(TheGraph.config.nodeMenu.container, containerOptions);
      return TheGraph.factories.nodeMenu.createNodeMenuGroup.call(this, containerOptions);

    }
  }));


};

},{"create-react-class":"create-react-class","react":"react","react-dom":"react-dom"}],43:[function(require,module,exports){
var React = require('react');
var ReactDOM = require('react-dom');
var createReactClass = require('create-react-class');
var TooltipMixin = require('./mixins').Tooltip;

module.exports.register = function (context) {

  var TheGraph = context.TheGraph;

  // Initialize namespace for configuration and factory functions.
  TheGraph.config.node = {
    snap: TheGraph.config.nodeSize,
    container: {},
    background: {
      className: "node-bg"
    },
    border: {
      className: "node-border drag",
      rx: TheGraph.config.nodeRadius,
      ry: TheGraph.config.nodeRadius
    },
    innerRect: {
      className: "node-rect drag",
      x: 3,
      y: 3,
      rx: TheGraph.config.nodeRadius - 2,
      ry: TheGraph.config.nodeRadius - 2
    },
    icon: {
      ref: "icon",
      className: "icon node-icon drag"
    },
    iconsvg: {
      className: "icon node-icon drag"
    },
    inports: {
      className: "inports"
    },
    outports: {
      className: "outports"
    },
    labelBackground: {
      className: "node-label-bg"
    },
    labelRect: {
      className: "text-bg-rect"
    },
    labelText: {
      className: "node-label"
    },
    sublabelBackground: {
      className: "node-sublabel-bg"
    },
    sublabelRect: {
      className: "text-bg-rect"
    },
    sublabelText: {
      className: "node-sublabel"
    }
  };

  // These factories use generic factories from the core, but
  // each is called separately allowing developers to intercept
  // individual elements of the node creation.
  TheGraph.factories.node = {
    createNodeGroup: TheGraph.factories.createGroup,
    createNodeBackgroundRect: TheGraph.factories.createRect,
    createNodeBorderRect: TheGraph.factories.createRect,
    createNodeInnerRect: TheGraph.factories.createRect,
    createNodeIconText: TheGraph.factories.createText,
    createNodeIconSVG: TheGraph.factories.createImg,
    createNodeInportsGroup: TheGraph.factories.createGroup,
    createNodeOutportsGroup: TheGraph.factories.createGroup,
    createNodeLabelGroup: TheGraph.factories.createGroup,
    createNodeLabelRect: TheGraph.factories.createRect,
    createNodeLabelText: TheGraph.factories.createText,
    createNodeSublabelGroup: TheGraph.factories.createGroup,
    createNodeSublabelRect: TheGraph.factories.createRect,
    createNodeSublabelText: TheGraph.factories.createText,
    createNodePort: createNodePort
  };

  function createNodePort(options) {
    return TheGraph.Port(options);
  }

  // Node view
  TheGraph.Node = React.createFactory( createReactClass({
    displayName: "TheGraphNode",
    mixins: [
      TooltipMixin
    ],
    getInitialState: function () {
        return {
          moving: false,
          lastTrackX: null,
          lastTrackY: null,
        };
    },
    componentDidMount: function () {
      var domNode = ReactDOM.findDOMNode(this);
      
      // Dragging
      domNode.addEventListener("panstart", this.onTrackStart);

      // Tap to select
      if (this.props.onNodeSelection) {
        domNode.addEventListener("tap", this.onNodeSelection);
      }

      // Context menu
      if (this.props.showContext) {
        domNode.addEventListener("contextmenu", this.showContext);
        domNode.addEventListener("press", this.showContext);
      }

    },
    onNodeSelection: function (event) {
      // Don't tap app (unselect)
      event.stopPropagation();

      var toggle = (TheGraph.metaKeyPressed || event.pointerType==="touch");
      this.props.onNodeSelection(this.props.nodeID, this.props.node, toggle);
    },
    onTrackStart: function (event) {
      // Don't drag graph
      event.stopPropagation();

      // Don't drag under menu
      if (this.props.app.menuShown) { return; }

      // Don't drag while pinching
      if (this.props.app.pinching) { return; }

      var domNode = ReactDOM.findDOMNode(this);
      domNode.addEventListener("panmove", this.onTrack);
      domNode.addEventListener("panend", this.onTrackEnd);
      domNode.addEventListener("pancancel", this.onTrackEnd);

      // Moving a node should only be a single transaction
      if (this.props.export) {
        this.props.graph.startTransaction('moveexport');
      } else {
        this.props.graph.startTransaction('movenode');
      }
      this.setState({ moving: true });
      this.setState({ lastTrackX: 0, lastTrackY: 0});
    },
    onTrack: function (event) {
      // Don't fire on graph
      event.stopPropagation();

      // Reconstruct relative motion since last event
      var x = event.gesture.deltaX;
      var y = event.gesture.deltaY;
      var movementX = x - this.state.lastTrackX;
      var movementY = y - this.state.lastTrackY;
      this.setState({ lastTrackX: x , lastTrackY: y });

      var scale = this.props.app.state.scale;
      var deltaX = Math.round( movementX / scale );
      var deltaY = Math.round( movementY / scale );

      // Fires a change event on fbp-graph graph, which triggers redraw
      if (this.props.export) {
        var newPos = {
          x: this.props.export.metadata.x + deltaX,
          y: this.props.export.metadata.y + deltaY
        };
        if (this.props.isIn) {
          this.props.graph.setInportMetadata(this.props.exportKey, newPos);
        } else {
          this.props.graph.setOutportMetadata(this.props.exportKey, newPos);
        }
      } else {
        this.props.graph.setNodeMetadata(this.props.nodeID, {
          x: this.props.node.metadata.x + deltaX,
          y: this.props.node.metadata.y + deltaY
        });
      }
    },
    onTrackEnd: function (event) {
      // Don't fire on graph
      event.stopPropagation();
      this.setState({ moving: false });
      this.setState({ lastTrackX: null, lastTrackY: null});

      var domNode = ReactDOM.findDOMNode(this);
      domNode.removeEventListener("panmove", this.onTrack);
      domNode.removeEventListener("panend", this.onTrackEnd);
      domNode.removeEventListener("pancanel", this.onTrackEnd);

      // Snap to grid
      var snapToGrid = true;
      var snap = TheGraph.config.node.snap / 2;
      if (snapToGrid) {
        var x, y;
        if (this.props.export) {
          var newPos = {
            x: Math.round(this.props.export.metadata.x/snap) * snap,
            y: Math.round(this.props.export.metadata.y/snap) * snap
          };
          if (this.props.isIn) {
            this.props.graph.setInportMetadata(this.props.exportKey, newPos);
          } else {
            this.props.graph.setOutportMetadata(this.props.exportKey, newPos);
          }
        } else {
          this.props.graph.setNodeMetadata(this.props.nodeID, {
            x: Math.round(this.props.node.metadata.x/snap) * snap,
            y: Math.round(this.props.node.metadata.y/snap) * snap
          });
        }
      }

      // Moving a node should only be a single transaction
      if (this.props.export) {
        this.props.graph.endTransaction('moveexport');
      } else {
        this.props.graph.endTransaction('movenode');
      }
    },
    showContext: function (event) {
      // Don't show native context menu
      event.preventDefault();

      // Don't tap graph on hold event
      event.stopPropagation();
      if (event.preventTap) { event.preventTap(); }

      // Get mouse position
      if (event.gesture) {
        event = event.gesture.srcEvent; // unpack hammer.js gesture event 
      }
      var x = event.x || event.clientX || 0;
      var y = event.y || event.clientY || 0;
      if (event.touches && event.touches.length) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
      }

      // App.showContext
      this.props.showContext({
        element: this,
        type: (this.props.export ? (this.props.isIn ? "graphInport" : "graphOutport") : "node"),
        x: x,
        y: y,
        graph: this.props.graph,
        itemKey: (this.props.export ? this.props.exportKey : this.props.nodeID),
        item: (this.props.export ? this.props.export : this.props.node)
      });
    },
    getContext: function (menu, options, hide) {
      // If this node is an export
      if (this.props.export) {
        return TheGraph.Menu({
          menu: menu,
          options: options,
          triggerHideContext: hide,
          label: this.props.exportKey
        });
      }

      // Absolute position of node
      var x = options.x;
      var y = options.y;
      var scale = this.props.app.state.scale;
      var appX = this.props.app.state.x;
      var appY = this.props.app.state.y;
      var nodeX = (this.props.x + this.props.width / 2) * scale + appX;
      var nodeY = (this.props.y + this.props.height / 2) * scale + appY;
      var deltaX = nodeX - x;
      var deltaY = nodeY - y;
      var ports = this.props.ports;
      var processKey = this.props.nodeID;
      var highlightPort = this.props.highlightPort;

      // If there is a preview edge started, only show connectable ports
      if (this.props.graphView.state.edgePreview) {
        if (this.props.graphView.state.edgePreview.isIn) {
          // Show outputs
          return TheGraph.NodeMenuPorts({
            ports: ports.outports,
            triggerHideContext: hide,
            isIn: false,
            scale: scale,
            processKey: processKey,
            deltaX: deltaX,
            deltaY: deltaY,
            translateX: x,
            translateY: y,
            nodeWidth: this.props.width,
            nodeHeight: this.props.height,
            highlightPort: highlightPort
          });
        } else {
          // Show inputs
          return TheGraph.NodeMenuPorts({
            ports: ports.inports,
            triggerHideContext: hide,
            isIn: true,
            scale: scale,
            processKey: processKey,
            deltaX: deltaX,
            deltaY: deltaY,
            translateX: x,
            translateY: y,
            nodeWidth: this.props.width,
            nodeHeight: this.props.height,
            highlightPort: highlightPort
          });
        }
      }

      // Default, show whole node menu
      return TheGraph.NodeMenu({
        menu: menu,
        options: options,
        triggerHideContext: hide,
        label: this.props.label,
        graph: this.props.graph,
        graphView: this.props.graphView,
        node: this,
        icon: this.props.icon,
        ports: ports,
        process: this.props.node,
        processKey: processKey,
        x: x,
        y: y,
        nodeWidth: this.props.width,
        nodeHeight: this.props.height,
        deltaX: deltaX,
        deltaY: deltaY,
        highlightPort: highlightPort
      });
    },
    getTooltipTrigger: function () {
      return ReactDOM.findDOMNode(this);
    },
    shouldShowTooltip: function () {
      return (this.props.app.state.scale < TheGraph.zbpNormal);
    },
    shouldComponentUpdate: function (nextProps, nextState) {
      // Only rerender if changed
      return (
        nextProps.x !== this.props.x || 
        nextProps.y !== this.props.y ||
        nextProps.icon !== this.props.icon ||
        nextProps.label !== this.props.label ||
        nextProps.sublabel !== this.props.sublabel ||
        nextProps.ports !== this.props.ports ||
        nextProps.selected !== this.props.selected ||
        nextProps.error !== this.props.error ||
        nextProps.highlightPort !== this.props.highlightPort ||
        nextProps.ports.dirty === true
      );
    },
    render: function() {
      if (this.props.ports.dirty) {
        // This tag is set when an edge or iip changes port colors
        this.props.ports.dirty = false;
      }

      var label = this.props.label;
      var sublabel = this.props.sublabel;
      if (!sublabel || sublabel === label) {
        sublabel = "";
      }
      var x = this.props.x;
      var y = this.props.y;
      var width = this.props.width;
      var height = this.props.height;

      // Ports
      var keys, count;
      var processKey = this.props.nodeID;
      var app = this.props.app;
      var graph = this.props.graph;
      var node = this.props.node;
      var isExport = (this.props.export !== undefined);
      var showContext = this.props.showContext;
      var highlightPort = this.props.highlightPort;

      // Inports
      var inports = this.props.ports.inports;
      keys = Object.keys(inports);
      count = keys.length;
      // Make views
      var inportViews = keys.map(function(key){
        var info = inports[key];
        var props = {
          app: app,
          graph: graph,
          node: node,
          key: processKey + ".in." + info.label,
          label: info.label,
          processKey: processKey,
          isIn: true,
          isExport: isExport,
          nodeX: x,
          nodeY: y,
          nodeWidth: width,
          nodeHeight: height,
          x: info.x,
          y: info.y,
          port: {process:processKey, port:info.label, type:info.type},
          highlightPort: highlightPort,
          route: info.route,
          showContext: showContext,
          allowEdgeStart: this.props.allowEdgeStart,
        };
        return TheGraph.factories.node.createNodePort(props);
      }.bind(this));

      // Outports
      var outports = this.props.ports.outports;
      keys = Object.keys(outports);
      count = keys.length;
      var outportViews = keys.map(function(key){
        var info = outports[key];
        var props = {
          app: app,
          graph: graph,
          node: node,
          key: processKey + ".out." + info.label,
          label: info.label,
          processKey: processKey,
          isIn: false,
          isExport: isExport,
          nodeX: x,
          nodeY: y,
          nodeWidth: width,
          nodeHeight: height,
          x: info.x,
          y: info.y,
          port: {process:processKey, port:info.label, type:info.type},
          highlightPort: highlightPort,
          route: info.route,
          showContext: showContext,
          allowEdgeStart: this.props.allowEdgeStart,
        };
        return TheGraph.factories.node.createNodePort(props);
      }.bind(this));

      // Node Icon
      var icon = TheGraph.FONT_AWESOME[ this.props.icon ];
      if (!icon) {
        icon = TheGraph.FONT_AWESOME.cog;
      }

      var iconContent;
      if (this.props.iconsvg && this.props.iconsvg !== "") {
          var iconSVGOptions = TheGraph.merge(TheGraph.config.node.iconsvg, {
              src: this.props.iconsvg,
              x: TheGraph.config.nodeRadius - 4,
              y: TheGraph.config.nodeRadius - 4,
              width: this.props.width - 10,
              height: this.props.height - 10
          });
          iconContent = TheGraph.factories.node.createNodeIconSVG.call(this, iconSVGOptions);
      } else {
          var iconOptions = TheGraph.merge(TheGraph.config.node.icon, {
              x: this.props.width / 2,
              y: this.props.height / 2,
              children: icon });
          iconContent = TheGraph.factories.node.createNodeIconText.call(this, iconOptions);
      }

      var backgroundRectOptions = TheGraph.merge(TheGraph.config.node.background, { width: this.props.width, height: this.props.height + 25 });
      var backgroundRect = TheGraph.factories.node.createNodeBackgroundRect.call(this, backgroundRectOptions);

      var borderRectOptions = TheGraph.merge(TheGraph.config.node.border, { width: this.props.width, height: this.props.height });
      var borderRect = TheGraph.factories.node.createNodeBorderRect.call(this, borderRectOptions);
      
      var innerRectOptions = TheGraph.merge(TheGraph.config.node.innerRect, { width: this.props.width - 6, height: this.props.height - 6 });
      var innerRect = TheGraph.factories.node.createNodeInnerRect.call(this, innerRectOptions);

      var inportsOptions = TheGraph.merge(TheGraph.config.node.inports, { children: inportViews });
      var inportsGroup = TheGraph.factories.node.createNodeInportsGroup.call(this, inportsOptions);

      var outportsOptions = TheGraph.merge(TheGraph.config.node.outports, { children: outportViews });
      var outportsGroup = TheGraph.factories.node.createNodeOutportsGroup.call(this, outportsOptions);

      var labelTextOptions = TheGraph.merge(TheGraph.config.node.labelText, { x: this.props.width / 2, y: this.props.height + 15, children: label });
      var labelText = TheGraph.factories.node.createNodeLabelText.call(this, labelTextOptions);

      var labelRectX = this.props.width / 2;
      var labelRectY = this.props.height + 15;
      var labelRectOptions = buildLabelRectOptions(14, labelRectX, labelRectY, label.length, TheGraph.config.node.labelRect.className);
      labelRectOptions = TheGraph.merge(TheGraph.config.node.labelRect, labelRectOptions);
      var labelRect = TheGraph.factories.node.createNodeLabelRect.call(this, labelRectOptions);
      var labelGroup = TheGraph.factories.node.createNodeLabelGroup.call(this, TheGraph.config.node.labelBackground, [labelRect, labelText]);

      var sublabelTextOptions = TheGraph.merge(TheGraph.config.node.sublabelText, { x: this.props.width / 2, y: this.props.height + 30, children: sublabel });
      var sublabelText = TheGraph.factories.node.createNodeSublabelText.call(this, sublabelTextOptions);

      var sublabelRectX = this.props.width / 2;
      var sublabelRectY = this.props.height + 30;
      var sublabelRectOptions = buildLabelRectOptions(9, sublabelRectX, sublabelRectY, sublabel.length, TheGraph.config.node.sublabelRect.className);
      sublabelRectOptions = TheGraph.merge(TheGraph.config.node.sublabelRect, sublabelRectOptions);
      var sublabelRect = TheGraph.factories.node.createNodeSublabelRect.call(this, sublabelRectOptions);
      var sublabelGroup = TheGraph.factories.node.createNodeSublabelGroup.call(this, TheGraph.config.node.sublabelBackground, [sublabelRect, sublabelText]);

      // When moving, expand bounding box of element
      // to catch events when pointer moves faster than we can move the element
      var scale = this.props.app.state.scale;
      var eventSize = this.props.width * 12 / scale;
      var eventOptions = {
        r: eventSize,
        className: 'eventcatcher',
      };
      var eventRect = TheGraph.factories.createCircle(eventOptions);

      var nodeContents = [
        backgroundRect,
        borderRect,
        innerRect,
        iconContent,
        inportsGroup,
        outportsGroup,
        labelGroup,
        sublabelGroup
      ];
      if (this.state.moving) {
        nodeContents.push(eventRect);
      }

      var nodeOptions = {
        className: "node drag"+
          (this.props.selected ? " selected" : "")+
          (this.props.error ? " error" : ""),
        name: this.props.nodeID,
        key: this.props.nodeID,
        title: label,
        transform: "translate("+x+","+y+")"
      };
      nodeOptions = TheGraph.merge(TheGraph.config.node.container, nodeOptions);

      return TheGraph.factories.node.createNodeGroup.call(this, nodeOptions, nodeContents);
    }
  }));

  function buildLabelRectOptions(height, x, y, len, className) {

    var width = len * height * 2/3;
    var radius = height / 2;
    x -= width / 2;
    y -= height / 2;

    var result = {
      className: className,
      height: height * 1.1,
      width: width,
      rx: radius,
      ry: radius,
      x: x,
      y: y
    };

    return result;
  }

};

},{"./mixins":30,"create-react-class":"create-react-class","react":"react","react-dom":"react-dom"}],44:[function(require,module,exports){
var React = require('react');
var ReactDOM = require('react-dom');
var createReactClass = require('create-react-class');
var TooltipMixin = require('./mixins').Tooltip;
var arcs = require('./arcs.js');

module.exports.register = function (context) {

  var TheGraph = context.TheGraph;

  // Initialize configuration for the Port view.
  TheGraph.config.port = {
    container: {
      className: "port arrow"
    },
    backgroundCircle: {
      className: "port-circle-bg"
    },
    arc: {
      className: "port-arc"
    },
    innerCircle: {
      ref: "circleSmall"
    },
    text: {
      ref: "label",
      className: "port-label drag"
    }
  };

  TheGraph.factories.port = {
    createPortGroup: TheGraph.factories.createGroup,
    createPortBackgroundCircle: TheGraph.factories.createCircle,
    createPortArc: TheGraph.factories.createPath,
    createPortInnerCircle: TheGraph.factories.createCircle,
    createPortLabelText: TheGraph.factories.createText
  };

  // Port view

  TheGraph.Port = React.createFactory( createReactClass({
    displayName: "TheGraphPort",
    mixins: [
      TooltipMixin
    ],
    defaultProps: {
      allowEdgeStart: true,
    },
    componentDidMount: function () {
      var domNode = ReactDOM.findDOMNode(this);

      // Preview edge start
      domNode.addEventListener("tap", this.edgeStart);
      domNode.addEventListener("panstart", this.edgeStart);
      // Make edge
      domNode.addEventListener("panend", this.triggerDropOnTarget);
      domNode.addEventListener("the-graph-edge-drop", this.edgeStart);

      // Show context menu
      if (this.props.showContext) {
        domNode.addEventListener("contextmenu", this.showContext);
        domNode.addEventListener("press", this.showContext);
      }
    },
    getTooltipTrigger: function () {
      return ReactDOM.findDOMNode(this);
    },
    shouldShowTooltip: function () {
      return (
        this.props.app.state.scale < TheGraph.zbpBig ||
        this.props.label.length > 8
      );
    },
    showContext: function (event) {
      // Don't show port menu on export node port
      if (this.props.isExport) {
        return;
      }
      // Click on label, pass context menu to node
      if (event && (event.target === ReactDOM.findDOMNode(this.refs.label))) {
        return;
      }
      // Don't show native context menu
      event.preventDefault();

      // Don't tap graph on hold event
      if (event.stopPropagation) { event.stopPropagation(); }
      if (event.preventTap) { event.preventTap(); }

      // Get mouse position
      if (event.gesture) {
        event = event.gesture.srcEvent; // unpack hammer.js gesture event 
      }
      var x = event.x || event.clientX || 0;
      var y = event.y || event.clientY || 0;
      if (event.touches && event.touches.length) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
      }

      // App.showContext
      this.props.showContext({
        element: this,
        type: (this.props.isIn ? "nodeInport" : "nodeOutport"),
        x: x,
        y: y,
        graph: this.props.graph,
        itemKey: this.props.label,
        item: this.props.port
      });
    },
    getContext: function (menu, options, hide) {
      return TheGraph.Menu({
        menu: menu,
        options: options,
        label: this.props.label,
        triggerHideContext: hide
      });
    },
    edgeStart: function (event) {
      // Don't start edge on export node port
      if (this.props.isExport) {
        return;
      }
      if (!this.props.allowEdgeStart) {
        return;
      }

      // Click on label, allow node context menu
      if (event && (event.target === ReactDOM.findDOMNode(this.refs.label))) {
        return;
      }
      // Don't tap graph
      if (event.stopPropagation) { event.stopPropagation(); }

      var edgeStartEvent = new CustomEvent('the-graph-edge-start', {
        detail: {
          isIn: this.props.isIn,
          port: this.props.port,
          // process: this.props.processKey,
          route: this.props.route
        },
        bubbles: true
      });
      ReactDOM.findDOMNode(this).dispatchEvent(edgeStartEvent);
    },
    triggerDropOnTarget: function (event) {
      // If dropped on a child element will bubble up to port
      // FIXME: broken, is never set, neither on event.srcEvent
      if (!event.relatedTarget) { return; }
      var dropEvent = new CustomEvent('the-graph-edge-drop', {
        detail: null,
        bubbles: true
      });
      event.relatedTarget.dispatchEvent(dropEvent);
    },
    render: function() {
      var style;
      if (this.props.label.length > 7) {
        var fontSize = 6 * (30 / (4 * this.props.label.length));
        style = { 'fontSize': fontSize+'px' };
      }
      var r = 4;
      // Highlight matching ports
      var highlightPort = this.props.highlightPort;
      var inArc = arcs.inport;
      var outArc = arcs.outport;
      if (highlightPort && highlightPort.isIn === this.props.isIn && (highlightPort.type === this.props.port.type || this.props.port.type === 'any')) {
        r = 6;
        inArc = arcs.inportBig;
        outArc = arcs.outportBig;
      }

      var backgroundCircleOptions = TheGraph.merge(TheGraph.config.port.backgroundCircle, { r: r + 1 });
      var backgroundCircle = TheGraph.factories.port.createPortBackgroundCircle.call(this, backgroundCircleOptions);

      var arcOptions = TheGraph.merge(TheGraph.config.port.arc, { d: (this.props.isIn ? inArc : outArc) });
      var arc = TheGraph.factories.port.createPortArc.call(this, arcOptions);

      var innerCircleOptions = {
        className: "port-circle-small fill route"+this.props.route,
        r: r - 1.5
      };

      innerCircleOptions = TheGraph.merge(TheGraph.config.port.innerCircle, innerCircleOptions);
      var innerCircle = TheGraph.factories.port.createPortInnerCircle.call(this, innerCircleOptions);

      var labelTextOptions = {
        x: (this.props.isIn ? 5 : -5),
        style: style,
        children: this.props.label
      };
      labelTextOptions = TheGraph.merge(TheGraph.config.port.text, labelTextOptions);
      var labelText = TheGraph.factories.port.createPortLabelText.call(this, labelTextOptions);

      var portContents = [
        backgroundCircle,
        arc,
        innerCircle,
        labelText
      ];

      var containerOptions = TheGraph.merge(TheGraph.config.port.container, { title: this.props.label, transform: "translate("+this.props.x+","+this.props.y+")" });
      return TheGraph.factories.port.createPortGroup.call(this, containerOptions, portContents);

    }
  }));


};

},{"./arcs.js":24,"./mixins":30,"create-react-class":"create-react-class","react":"react","react-dom":"react-dom"}],45:[function(require,module,exports){
var React = require('react');
var createReactClass = require('create-react-class');
var defaultFactories = require('./factories.js');
var merge = require('./merge.js');

var config = {
  container: {},
  rect: {
    className: "tooltip-bg",
    x: 0,
    y: -7,
    rx: 3,
    ry: 3,
    height: 16
  },
  text: {
    className: "tooltip-label",
    ref: "label"
  }
};


var factories = {
  createTooltipGroup: defaultFactories.createGroup,
  createTooltipRect: defaultFactories.createRect,
  createTooltipText: defaultFactories.createText
};

// Port view
var Tooltip = React.createFactory( createReactClass({
  displayName: "TheGraphTooltip",
  render: function() {

    var rectOptions = merge(config.rect, {width: this.props.label.length * 6});
    var rect = factories.createTooltipRect.call(this, rectOptions);

    var textOptions = merge(config.text, { children: this.props.label });
    var text = factories.createTooltipText.call(this, textOptions);

    var containerContents = [rect, text];

    var containerOptions = {
      className: "tooltip" + (this.props.visible ? "" : " hidden"),
      transform: "translate("+this.props.x+","+this.props.y+")",
    };
    containerOptions = merge(config.container, containerOptions);
    return factories.createTooltipGroup.call(this, containerOptions, containerContents);

  }
}));

module.exports = {
  config: config,
  factories: factories,
  Tooltip: Tooltip,
};

},{"./factories.js":25,"./merge.js":29,"create-react-class":"create-react-class","react":"react"}]},{},[1])(1)
});