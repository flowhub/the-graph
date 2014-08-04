(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Build required libs
noflo = require('noflo');
},{"noflo":35}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":5}],4:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],5:[function(require,module,exports){
(function (process,global){
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

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("JkpR2F"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":4,"JkpR2F":13,"inherits":11}],6:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
var TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str.toString()
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.compare = function (a, b) {
  assert(Buffer.isBuffer(a) && Buffer.isBuffer(b), 'Arguments must be Buffers')
  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) {
    return -1
  }
  if (y < x) {
    return 1
  }
  return 0
}

// BUFFER INSTANCE METHODS
// =======================

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
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end === undefined) ? self.length : Number(end)

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = asciiSlice(self, start, end)
      break
    case 'binary':
      ret = binarySlice(self, start, end)
      break
    case 'base64':
      ret = base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

Buffer.prototype.equals = function (b) {
  assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.compare = function (b) {
  assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
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
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
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

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return readUInt16(this, offset, false, noAssert)
}

function readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return readInt16(this, offset, false, noAssert)
}

function readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return readInt32(this, offset, false, noAssert)
}

function readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return readFloat(this, offset, false, noAssert)
}

function readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
  return offset + 1
}

function writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
  return offset + 2
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  return writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  return writeUInt16(this, value, offset, false, noAssert)
}

function writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
  return offset + 4
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  return writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  return writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
  return offset + 1
}

function writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
  return offset + 2
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  return writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  return writeInt16(this, value, offset, false, noAssert)
}

function writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
  return offset + 4
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  return writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  return writeInt32(this, value, offset, false, noAssert)
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
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

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":7,"ieee754":8}],7:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],8:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],9:[function(require,module,exports){
module.exports={
  "O_RDONLY": 0,
  "O_WRONLY": 1,
  "O_RDWR": 2,
  "S_IFMT": 61440,
  "S_IFREG": 32768,
  "S_IFDIR": 16384,
  "S_IFCHR": 8192,
  "S_IFBLK": 24576,
  "S_IFIFO": 4096,
  "S_IFLNK": 40960,
  "S_IFSOCK": 49152,
  "O_CREAT": 512,
  "O_EXCL": 2048,
  "O_NOCTTY": 131072,
  "O_TRUNC": 1024,
  "O_APPEND": 8,
  "O_DIRECTORY": 1048576,
  "O_NOFOLLOW": 256,
  "O_SYNC": 128,
  "O_SYMLINK": 2097152,
  "S_IRWXU": 448,
  "S_IRUSR": 256,
  "S_IWUSR": 128,
  "S_IXUSR": 64,
  "S_IRWXG": 56,
  "S_IRGRP": 32,
  "S_IWGRP": 16,
  "S_IXGRP": 8,
  "S_IRWXO": 7,
  "S_IROTH": 4,
  "S_IWOTH": 2,
  "S_IXOTH": 1,
  "E2BIG": 7,
  "EACCES": 13,
  "EADDRINUSE": 48,
  "EADDRNOTAVAIL": 49,
  "EAFNOSUPPORT": 47,
  "EAGAIN": 35,
  "EALREADY": 37,
  "EBADF": 9,
  "EBADMSG": 94,
  "EBUSY": 16,
  "ECANCELED": 89,
  "ECHILD": 10,
  "ECONNABORTED": 53,
  "ECONNREFUSED": 61,
  "ECONNRESET": 54,
  "EDEADLK": 11,
  "EDESTADDRREQ": 39,
  "EDOM": 33,
  "EDQUOT": 69,
  "EEXIST": 17,
  "EFAULT": 14,
  "EFBIG": 27,
  "EHOSTUNREACH": 65,
  "EIDRM": 90,
  "EILSEQ": 92,
  "EINPROGRESS": 36,
  "EINTR": 4,
  "EINVAL": 22,
  "EIO": 5,
  "EISCONN": 56,
  "EISDIR": 21,
  "ELOOP": 62,
  "EMFILE": 24,
  "EMLINK": 31,
  "EMSGSIZE": 40,
  "EMULTIHOP": 95,
  "ENAMETOOLONG": 63,
  "ENETDOWN": 50,
  "ENETRESET": 52,
  "ENETUNREACH": 51,
  "ENFILE": 23,
  "ENOBUFS": 55,
  "ENODATA": 96,
  "ENODEV": 19,
  "ENOENT": 2,
  "ENOEXEC": 8,
  "ENOLCK": 77,
  "ENOLINK": 97,
  "ENOMEM": 12,
  "ENOMSG": 91,
  "ENOPROTOOPT": 42,
  "ENOSPC": 28,
  "ENOSR": 98,
  "ENOSTR": 99,
  "ENOSYS": 78,
  "ENOTCONN": 57,
  "ENOTDIR": 20,
  "ENOTEMPTY": 66,
  "ENOTSOCK": 38,
  "ENOTSUP": 45,
  "ENOTTY": 25,
  "ENXIO": 6,
  "EOPNOTSUPP": 102,
  "EOVERFLOW": 84,
  "EPERM": 1,
  "EPIPE": 32,
  "EPROTO": 100,
  "EPROTONOSUPPORT": 43,
  "EPROTOTYPE": 41,
  "ERANGE": 34,
  "EROFS": 30,
  "ESPIPE": 29,
  "ESRCH": 3,
  "ESTALE": 70,
  "ETIME": 101,
  "ETIMEDOUT": 60,
  "ETXTBSY": 26,
  "EWOULDBLOCK": 35,
  "EXDEV": 18,
  "SIGHUP": 1,
  "SIGINT": 2,
  "SIGQUIT": 3,
  "SIGILL": 4,
  "SIGTRAP": 5,
  "SIGABRT": 6,
  "SIGIOT": 6,
  "SIGBUS": 10,
  "SIGFPE": 8,
  "SIGKILL": 9,
  "SIGUSR1": 30,
  "SIGSEGV": 11,
  "SIGUSR2": 31,
  "SIGPIPE": 13,
  "SIGALRM": 14,
  "SIGTERM": 15,
  "SIGCHLD": 20,
  "SIGCONT": 19,
  "SIGSTOP": 17,
  "SIGTSTP": 18,
  "SIGTTIN": 21,
  "SIGTTOU": 22,
  "SIGURG": 16,
  "SIGXCPU": 24,
  "SIGXFSZ": 25,
  "SIGVTALRM": 26,
  "SIGPROF": 27,
  "SIGWINCH": 28,
  "SIGIO": 23,
  "SIGSYS": 12,
  "SSL_OP_ALL": 2147486719,
  "SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION": 262144,
  "SSL_OP_CIPHER_SERVER_PREFERENCE": 4194304,
  "SSL_OP_CISCO_ANYCONNECT": 32768,
  "SSL_OP_COOKIE_EXCHANGE": 8192,
  "SSL_OP_CRYPTOPRO_TLSEXT_BUG": 2147483648,
  "SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS": 2048,
  "SSL_OP_EPHEMERAL_RSA": 2097152,
  "SSL_OP_LEGACY_SERVER_CONNECT": 4,
  "SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER": 32,
  "SSL_OP_MICROSOFT_SESS_ID_BUG": 1,
  "SSL_OP_MSIE_SSLV2_RSA_PADDING": 64,
  "SSL_OP_NETSCAPE_CA_DN_BUG": 536870912,
  "SSL_OP_NETSCAPE_CHALLENGE_BUG": 2,
  "SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG": 1073741824,
  "SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG": 8,
  "SSL_OP_NO_COMPRESSION": 131072,
  "SSL_OP_NO_QUERY_MTU": 4096,
  "SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION": 65536,
  "SSL_OP_NO_SSLv2": 16777216,
  "SSL_OP_NO_SSLv3": 33554432,
  "SSL_OP_NO_TICKET": 16384,
  "SSL_OP_NO_TLSv1": 67108864,
  "SSL_OP_NO_TLSv1_1": 268435456,
  "SSL_OP_NO_TLSv1_2": 134217728,
  "SSL_OP_PKCS1_CHECK_1": 0,
  "SSL_OP_PKCS1_CHECK_2": 0,
  "SSL_OP_SINGLE_DH_USE": 1048576,
  "SSL_OP_SINGLE_ECDH_USE": 524288,
  "SSL_OP_SSLEAY_080_CLIENT_DH_BUG": 128,
  "SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG": 16,
  "SSL_OP_TLS_BLOCK_PADDING_BUG": 512,
  "SSL_OP_TLS_D5_BUG": 256,
  "SSL_OP_TLS_ROLLBACK_BUG": 8388608,
  "NPN_ENABLED": 1
}

},{}],10:[function(require,module,exports){
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
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
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
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

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
    var m;
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
  } else {
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

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
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

},{}],11:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],12:[function(require,module,exports){
(function (process){
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

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("JkpR2F"))
},{"JkpR2F":13}],13:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],14:[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.4 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.4',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],15:[function(require,module,exports){
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

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],16:[function(require,module,exports){
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

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],17:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":15,"./encode":16}],18:[function(require,module,exports){
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

var punycode = require('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  Object.keys(this).forEach(function(k) {
    result[k] = this[k];
  }, this);

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    Object.keys(relative).forEach(function(k) {
      if (k !== 'protocol')
        result[k] = relative[k];
    });

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(function(k) {
        result[k] = relative[k];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

function isString(arg) {
  return typeof arg === "string";
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return  arg == null;
}

},{"punycode":14,"querystring":17}],19:[function(require,module,exports){
module.exports=require(4)
},{}],20:[function(require,module,exports){
module.exports=require(5)
},{"./support/isBuffer":19,"JkpR2F":13,"inherits":11}],21:[function(require,module,exports){
var indexOf = require('indexof');

var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var defineProp = (function() {
    try {
        Object.defineProperty({}, '_', {});
        return function(obj, name, value) {
            Object.defineProperty(obj, name, {
                writable: true,
                enumerable: false,
                configurable: true,
                value: value
            })
        };
    } catch(e) {
        return function(obj, name, value) {
            obj[name] = value;
        };
    }
}());

var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

function Context() {}
Context.prototype = {};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInContext = function (context) {
    if (!(context instanceof Context)) {
        throw new TypeError("needs a 'context' argument.");
    }
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    var wEval = win.eval, wExecScript = win.execScript;

    if (!wEval && wExecScript) {
        // win.eval() magically appears when this is called in IE:
        wExecScript.call(win, 'null');
        wEval = win.eval;
    }
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
    forEach(globals, function (key) {
        if (context[key]) {
            win[key] = context[key];
        }
    });
    
    var winKeys = Object_keys(win);

    var res = wEval.call(win, this.code);
    
    forEach(Object_keys(win), function (key) {
        // Avoid copying circular objects like `top` and `window` by only
        // updating existing context properties or new properties in the `win`
        // that was only introduced after the eval.
        if (key in context || indexOf(winKeys, key) === -1) {
            context[key] = win[key];
        }
    });

    forEach(globals, function (key) {
        if (!(key in context)) {
            defineProp(context, key, win[key]);
        }
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInNewContext = function (context) {
    var ctx = Script.createContext(context);
    var res = this.runInContext(ctx);

    forEach(Object_keys(ctx), function (key) {
        context[key] = ctx[key];
    });

    return res;
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    var copy = new Context();
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};

},{"indexof":22}],22:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],23:[function(require,module,exports){
(function() {
  var ArrayPort, port,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  port = require("./Port");

  ArrayPort = (function(_super) {
    __extends(ArrayPort, _super);

    function ArrayPort(type) {
      this.type = type;
      ArrayPort.__super__.constructor.call(this, this.type);
    }

    ArrayPort.prototype.attach = function(socket, socketId) {
      if (socketId == null) {
        socketId = null;
      }
      if (socketId === null) {
        socketId = this.sockets.length;
      }
      this.sockets[socketId] = socket;
      return this.attachSocket(socket, socketId);
    };

    ArrayPort.prototype.connect = function(socketId) {
      if (socketId == null) {
        socketId = null;
      }
      if (socketId === null) {
        if (!this.sockets.length) {
          throw new Error("" + (this.getId()) + ": No connections available");
        }
        this.sockets.forEach(function(socket) {
          if (!socket) {
            return;
          }
          return socket.connect();
        });
        return;
      }
      if (!this.sockets[socketId]) {
        throw new Error("" + (this.getId()) + ": No connection '" + socketId + "' available");
      }
      return this.sockets[socketId].connect();
    };

    ArrayPort.prototype.beginGroup = function(group, socketId) {
      if (socketId == null) {
        socketId = null;
      }
      if (socketId === null) {
        if (!this.sockets.length) {
          throw new Error("" + (this.getId()) + ": No connections available");
        }
        this.sockets.forEach((function(_this) {
          return function(socket, index) {
            if (!socket) {
              return;
            }
            return _this.beginGroup(group, index);
          };
        })(this));
        return;
      }
      if (!this.sockets[socketId]) {
        throw new Error("" + (this.getId()) + ": No connection '" + socketId + "' available");
      }
      if (this.isConnected(socketId)) {
        return this.sockets[socketId].beginGroup(group);
      }
      this.sockets[socketId].once("connect", (function(_this) {
        return function() {
          return _this.sockets[socketId].beginGroup(group);
        };
      })(this));
      return this.sockets[socketId].connect();
    };

    ArrayPort.prototype.send = function(data, socketId) {
      if (socketId == null) {
        socketId = null;
      }
      if (socketId === null) {
        if (!this.sockets.length) {
          throw new Error("" + (this.getId()) + ": No connections available");
        }
        this.sockets.forEach((function(_this) {
          return function(socket, index) {
            if (!socket) {
              return;
            }
            return _this.send(data, index);
          };
        })(this));
        return;
      }
      if (!this.sockets[socketId]) {
        throw new Error("" + (this.getId()) + ": No connection '" + socketId + "' available");
      }
      if (this.isConnected(socketId)) {
        return this.sockets[socketId].send(data);
      }
      this.sockets[socketId].once("connect", (function(_this) {
        return function() {
          return _this.sockets[socketId].send(data);
        };
      })(this));
      return this.sockets[socketId].connect();
    };

    ArrayPort.prototype.endGroup = function(socketId) {
      if (socketId == null) {
        socketId = null;
      }
      if (socketId === null) {
        if (!this.sockets.length) {
          throw new Error("" + (this.getId()) + ": No connections available");
        }
        this.sockets.forEach((function(_this) {
          return function(socket, index) {
            if (!socket) {
              return;
            }
            return _this.endGroup(index);
          };
        })(this));
        return;
      }
      if (!this.sockets[socketId]) {
        throw new Error("" + (this.getId()) + ": No connection '" + socketId + "' available");
      }
      return this.sockets[socketId].endGroup();
    };

    ArrayPort.prototype.disconnect = function(socketId) {
      var socket, _i, _len, _ref;
      if (socketId == null) {
        socketId = null;
      }
      if (socketId === null) {
        if (!this.sockets.length) {
          throw new Error("" + (this.getId()) + ": No connections available");
        }
        _ref = this.sockets;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          socket = _ref[_i];
          if (!socket) {
            return;
          }
          socket.disconnect();
        }
        return;
      }
      if (!this.sockets[socketId]) {
        return;
      }
      return this.sockets[socketId].disconnect();
    };

    ArrayPort.prototype.isConnected = function(socketId) {
      var connected;
      if (socketId == null) {
        socketId = null;
      }
      if (socketId === null) {
        connected = false;
        this.sockets.forEach((function(_this) {
          return function(socket) {
            if (!socket) {
              return;
            }
            if (socket.isConnected()) {
              return connected = true;
            }
          };
        })(this));
        return connected;
      }
      if (!this.sockets[socketId]) {
        return false;
      }
      return this.sockets[socketId].isConnected();
    };

    ArrayPort.prototype.isAddressable = function() {
      return true;
    };

    ArrayPort.prototype.isAttached = function(socketId) {
      var socket, _i, _len, _ref;
      if (socketId === void 0) {
        _ref = this.sockets;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          socket = _ref[_i];
          if (socket) {
            return true;
          }
        }
        return false;
      }
      if (this.sockets[socketId]) {
        return true;
      }
      return false;
    };

    return ArrayPort;

  })(port.Port);

  exports.ArrayPort = ArrayPort;

}).call(this);

},{"./Port":38}],24:[function(require,module,exports){
(function (process){
(function() {
  var AsyncComponent, component, port,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  port = require("./Port");

  component = require("./Component");

  AsyncComponent = (function(_super) {
    __extends(AsyncComponent, _super);

    function AsyncComponent(inPortName, outPortName, errPortName) {
      this.inPortName = inPortName != null ? inPortName : "in";
      this.outPortName = outPortName != null ? outPortName : "out";
      this.errPortName = errPortName != null ? errPortName : "error";
      if (!this.inPorts[this.inPortName]) {
        throw new Error("no inPort named '" + this.inPortName + "'");
      }
      if (!this.outPorts[this.outPortName]) {
        throw new Error("no outPort named '" + this.outPortName + "'");
      }
      this.load = 0;
      this.q = [];
      this.errorGroups = [];
      this.outPorts.load = new port.Port();
      this.inPorts[this.inPortName].on("begingroup", (function(_this) {
        return function(group) {
          if (_this.load > 0) {
            return _this.q.push({
              name: "begingroup",
              data: group
            });
          }
          _this.errorGroups.push(group);
          return _this.outPorts[_this.outPortName].beginGroup(group);
        };
      })(this));
      this.inPorts[this.inPortName].on("endgroup", (function(_this) {
        return function() {
          if (_this.load > 0) {
            return _this.q.push({
              name: "endgroup"
            });
          }
          _this.errorGroups.pop();
          return _this.outPorts[_this.outPortName].endGroup();
        };
      })(this));
      this.inPorts[this.inPortName].on("disconnect", (function(_this) {
        return function() {
          if (_this.load > 0) {
            return _this.q.push({
              name: "disconnect"
            });
          }
          _this.outPorts[_this.outPortName].disconnect();
          _this.errorGroups = [];
          if (_this.outPorts.load.isAttached()) {
            return _this.outPorts.load.disconnect();
          }
        };
      })(this));
      this.inPorts[this.inPortName].on("data", (function(_this) {
        return function(data) {
          if (_this.q.length > 0) {
            return _this.q.push({
              name: "data",
              data: data
            });
          }
          return _this.processData(data);
        };
      })(this));
    }

    AsyncComponent.prototype.processData = function(data) {
      this.incrementLoad();
      return this.doAsync(data, (function(_this) {
        return function(err) {
          if (err) {
            _this.error(err, _this.errorGroups, _this.errPortName);
          }
          return _this.decrementLoad();
        };
      })(this));
    };

    AsyncComponent.prototype.incrementLoad = function() {
      this.load++;
      if (this.outPorts.load.isAttached()) {
        this.outPorts.load.send(this.load);
      }
      if (this.outPorts.load.isAttached()) {
        return this.outPorts.load.disconnect();
      }
    };

    AsyncComponent.prototype.doAsync = function(data, callback) {
      return callback(new Error("AsyncComponents must implement doAsync"));
    };

    AsyncComponent.prototype.decrementLoad = function() {
      if (this.load === 0) {
        throw new Error("load cannot be negative");
      }
      this.load--;
      if (this.outPorts.load.isAttached()) {
        this.outPorts.load.send(this.load);
      }
      if (this.outPorts.load.isAttached()) {
        this.outPorts.load.disconnect();
      }
      if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
        return process.nextTick((function(_this) {
          return function() {
            return _this.processQueue();
          };
        })(this));
      } else {
        return setTimeout((function(_this) {
          return function() {
            return _this.processQueue();
          };
        })(this), 0);
      }
    };

    AsyncComponent.prototype.processQueue = function() {
      var event, processedData;
      if (this.load > 0) {
        return;
      }
      processedData = false;
      while (this.q.length > 0) {
        event = this.q[0];
        switch (event.name) {
          case "begingroup":
            if (processedData) {
              return;
            }
            this.outPorts[this.outPortName].beginGroup(event.data);
            this.errorGroups.push(event.data);
            this.q.shift();
            break;
          case "endgroup":
            if (processedData) {
              return;
            }
            this.outPorts[this.outPortName].endGroup();
            this.errorGroups.pop();
            this.q.shift();
            break;
          case "disconnect":
            if (processedData) {
              return;
            }
            this.outPorts[this.outPortName].disconnect();
            if (this.outPorts.load.isAttached()) {
              this.outPorts.load.disconnect();
            }
            this.errorGroups = [];
            this.q.shift();
            break;
          case "data":
            this.processData(event.data);
            this.q.shift();
            processedData = true;
        }
      }
    };

    AsyncComponent.prototype.shutdown = function() {
      this.q = [];
      return this.errorGroups = [];
    };

    return AsyncComponent;

  })(component.Component);

  exports.AsyncComponent = AsyncComponent;

}).call(this);

}).call(this,require("JkpR2F"))
},{"./Component":26,"./Port":38,"JkpR2F":13}],25:[function(require,module,exports){
(function() {
  var BasePort, EventEmitter, validTypes,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  validTypes = ['all', 'string', 'number', 'int', 'object', 'array', 'boolean', 'color', 'date', 'bang', 'function', 'buffer'];

  BasePort = (function(_super) {
    __extends(BasePort, _super);

    function BasePort(options) {
      this.handleOptions(options);
      this.sockets = [];
      this.node = null;
      this.name = null;
    }

    BasePort.prototype.handleOptions = function(options) {
      if (!options) {
        options = {};
      }
      if (!options.datatype) {
        options.datatype = 'all';
      }
      if (options.required === void 0) {
        options.required = false;
      }
      if (options.datatype === 'integer') {
        options.datatype = 'int';
      }
      if (validTypes.indexOf(options.datatype) === -1) {
        throw new Error("Invalid port datatype '" + options.datatype + "' specified, valid are " + (validTypes.join(', ')));
      }
      if (options.type && options.type.indexOf('/') === -1) {
        throw new Error("Invalid port type '" + options.type + "' specified. Should be URL or MIME type");
      }
      return this.options = options;
    };

    BasePort.prototype.getId = function() {
      if (!(this.node && this.name)) {
        return 'Port';
      }
      return "" + this.node + " " + (this.name.toUpperCase());
    };

    BasePort.prototype.getDataType = function() {
      return this.options.datatype;
    };

    BasePort.prototype.getDescription = function() {
      return this.options.description;
    };

    BasePort.prototype.attach = function(socket, index) {
      if (index == null) {
        index = null;
      }
      if (!this.isAddressable() || index === null) {
        index = this.sockets.length;
      }
      this.sockets[index] = socket;
      this.attachSocket(socket, index);
      if (this.isAddressable()) {
        this.emit('attach', socket, index);
        return;
      }
      return this.emit('attach', socket);
    };

    BasePort.prototype.attachSocket = function() {};

    BasePort.prototype.detach = function(socket) {
      var index;
      index = this.sockets.indexOf(socket);
      if (index === -1) {
        return;
      }
      this.sockets[index] = void 0;
      if (this.isAddressable()) {
        this.emit('detach', socket, index);
        return;
      }
      return this.emit('detach', socket);
    };

    BasePort.prototype.isAddressable = function() {
      if (this.options.addressable) {
        return true;
      }
      return false;
    };

    BasePort.prototype.isBuffered = function() {
      if (this.options.buffered) {
        return true;
      }
      return false;
    };

    BasePort.prototype.isRequired = function() {
      if (this.options.required) {
        return true;
      }
      return false;
    };

    BasePort.prototype.isAttached = function(socketId) {
      if (socketId == null) {
        socketId = null;
      }
      if (this.isAddressable() && socketId !== null) {
        if (this.sockets[socketId]) {
          return true;
        }
        return false;
      }
      if (this.sockets.length) {
        return true;
      }
      return false;
    };

    BasePort.prototype.listAttached = function() {
      var attached, idx, socket, _i, _len, _ref;
      attached = [];
      _ref = this.sockets;
      for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
        socket = _ref[idx];
        if (!socket) {
          continue;
        }
        attached.push(idx);
      }
      return attached;
    };

    BasePort.prototype.isConnected = function(socketId) {
      var connected;
      if (socketId == null) {
        socketId = null;
      }
      if (this.isAddressable()) {
        if (socketId === null) {
          throw new Error("" + (this.getId()) + ": Socket ID required");
        }
        if (!this.sockets[socketId]) {
          throw new Error("" + (this.getId()) + ": Socket " + socketId + " not available");
        }
        return this.sockets[socketId].isConnected();
      }
      connected = false;
      this.sockets.forEach((function(_this) {
        return function(socket) {
          if (socket.isConnected()) {
            return connected = true;
          }
        };
      })(this));
      return connected;
    };

    BasePort.prototype.canAttach = function() {
      return true;
    };

    return BasePort;

  })(EventEmitter);

  module.exports = BasePort;

}).call(this);

},{"events":10}],26:[function(require,module,exports){
(function() {
  var Component, EventEmitter, ports,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  ports = require('./Ports');

  Component = (function(_super) {
    __extends(Component, _super);

    Component.prototype.description = '';

    Component.prototype.icon = null;

    Component.prototype.started = false;

    function Component(options) {
      this.error = __bind(this.error, this);
      if (!options) {
        options = {};
      }
      if (!options.inPorts) {
        options.inPorts = {};
      }
      if (options.inPorts instanceof ports.InPorts) {
        this.inPorts = options.inPorts;
      } else {
        this.inPorts = new ports.InPorts(options.inPorts);
      }
      if (!options.outPorts) {
        options.outPorts = {};
      }
      if (options.outPorts instanceof ports.OutPorts) {
        this.outPorts = options.outPorts;
      } else {
        this.outPorts = new ports.OutPorts(options.outPorts);
      }
    }

    Component.prototype.getDescription = function() {
      return this.description;
    };

    Component.prototype.isReady = function() {
      return true;
    };

    Component.prototype.isSubgraph = function() {
      return false;
    };

    Component.prototype.setIcon = function(icon) {
      this.icon = icon;
      return this.emit('icon', this.icon);
    };

    Component.prototype.getIcon = function() {
      return this.icon;
    };

    Component.prototype.error = function(e, groups, errorPort) {
      var group, _i, _j, _len, _len1;
      if (groups == null) {
        groups = [];
      }
      if (errorPort == null) {
        errorPort = 'error';
      }
      if (this.outPorts[errorPort] && (this.outPorts[errorPort].isAttached() || !this.outPorts[errorPort].isRequired())) {
        for (_i = 0, _len = groups.length; _i < _len; _i++) {
          group = groups[_i];
          this.outPorts[errorPort].beginGroup(group);
        }
        this.outPorts[errorPort].send(e);
        for (_j = 0, _len1 = groups.length; _j < _len1; _j++) {
          group = groups[_j];
          this.outPorts[errorPort].endGroup();
        }
        this.outPorts[errorPort].disconnect();
        return;
      }
      throw e;
    };

    Component.prototype.shutdown = function() {
      return this.started = false;
    };

    Component.prototype.start = function() {
      this.started = true;
      return this.started;
    };

    Component.prototype.isStarted = function() {
      return this.started;
    };

    return Component;

  })(EventEmitter);

  exports.Component = Component;

}).call(this);

},{"./Ports":39,"events":10}],27:[function(require,module,exports){
(function (process){
(function() {
  var ComponentLoader, EventEmitter, internalSocket, nofloGraph, utils,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  internalSocket = require('./InternalSocket');

  nofloGraph = require('./Graph');

  utils = require('./Utils');

  EventEmitter = require('events').EventEmitter;

  ComponentLoader = (function(_super) {
    __extends(ComponentLoader, _super);

    function ComponentLoader(baseDir) {
      this.baseDir = baseDir;
      this.components = null;
      this.checked = [];
      this.revalidate = false;
      this.libraryIcons = {};
      this.processing = false;
      this.ready = false;
    }

    ComponentLoader.prototype.getModulePrefix = function(name) {
      if (!name) {
        return '';
      }
      if (name === 'noflo') {
        return '';
      }
      return name.replace('noflo-', '');
    };

    ComponentLoader.prototype.getModuleComponents = function(moduleName) {
      var cPath, definition, dependency, e, loader, name, prefix, _ref, _ref1, _results;
      if (this.checked.indexOf(moduleName) !== -1) {
        return;
      }
      this.checked.push(moduleName);
      try {
        definition = require("/" + moduleName + "/component.json");
      } catch (_error) {
        e = _error;
        if (moduleName.substr(0, 1) === '/') {
          return this.getModuleComponents("noflo-" + (moduleName.substr(1)));
        }
        return;
      }
      for (dependency in definition.dependencies) {
        this.getModuleComponents(dependency.replace('/', '-'));
      }
      if (!definition.noflo) {
        return;
      }
      prefix = this.getModulePrefix(definition.name);
      if (definition.noflo.icon) {
        this.libraryIcons[prefix] = definition.noflo.icon;
      }
      if (moduleName[0] === '/') {
        moduleName = moduleName.substr(1);
      }
      if (definition.noflo.loader) {
        loader = require("/" + moduleName + "/" + definition.noflo.loader);
        this.registerLoader(loader, function() {});
      }
      if (definition.noflo.components) {
        _ref = definition.noflo.components;
        for (name in _ref) {
          cPath = _ref[name];
          if (cPath.indexOf('.coffee') !== -1) {
            cPath = cPath.replace('.coffee', '.js');
          }
          if (cPath.substr(0, 2) === './') {
            cPath = cPath.substr(2);
          }
          this.registerComponent(prefix, name, "/" + moduleName + "/" + cPath);
        }
      }
      if (definition.noflo.graphs) {
        _ref1 = definition.noflo.graphs;
        _results = [];
        for (name in _ref1) {
          cPath = _ref1[name];
          _results.push(this.registerGraph(prefix, name, "/" + moduleName + "/" + cPath));
        }
        return _results;
      }
    };

    ComponentLoader.prototype.listComponents = function(callback) {
      if (this.processing) {
        this.once('ready', (function(_this) {
          return function() {
            return callback(_this.components);
          };
        })(this));
        return;
      }
      if (this.components) {
        return callback(this.components);
      }
      this.ready = false;
      this.processing = true;
      return setTimeout((function(_this) {
        return function() {
          _this.components = {};
          _this.getModuleComponents(_this.baseDir);
          _this.processing = false;
          _this.ready = true;
          _this.emit('ready', true);
          if (callback) {
            return callback(_this.components);
          }
        };
      })(this), 1);
    };

    ComponentLoader.prototype.load = function(name, callback, delayed, metadata) {
      var component, componentName, instance;
      if (!this.ready) {
        this.listComponents((function(_this) {
          return function() {
            return _this.load(name, callback, delayed, metadata);
          };
        })(this));
        return;
      }
      component = this.components[name];
      if (!component) {
        for (componentName in this.components) {
          if (componentName.split('/')[1] === name) {
            component = this.components[componentName];
            break;
          }
        }
        if (!component) {
          throw new Error("Component " + name + " not available with base " + this.baseDir);
          return;
        }
      }
      if (this.isGraph(component)) {
        if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
          process.nextTick((function(_this) {
            return function() {
              return _this.loadGraph(name, component, callback, delayed, metadata);
            };
          })(this));
        } else {
          setTimeout((function(_this) {
            return function() {
              return _this.loadGraph(name, component, callback, delayed, metadata);
            };
          })(this), 0);
        }
        return;
      }
      instance = this.createComponent(name, component, metadata);
      if (!instance) {
        throw new Error("Component " + name + " could not be loaded.");
      }
      if (name === 'Graph') {
        instance.baseDir = this.baseDir;
      }
      this.setIcon(name, instance);
      return callback(instance);
    };

    ComponentLoader.prototype.createComponent = function(name, component, metadata) {
      var implementation, instance;
      implementation = component;
      if (typeof implementation === 'string') {
        implementation = require(implementation);
      }
      if (typeof implementation.getComponent === 'function') {
        instance = implementation.getComponent(metadata);
      } else if (typeof implementation === 'function') {
        instance = implementation(metadata);
      } else {
        throw new Error("Invalid type " + (typeof implementation) + " for component " + name + ".");
      }
      return instance;
    };

    ComponentLoader.prototype.isGraph = function(cPath) {
      if (typeof cPath === 'object' && cPath instanceof nofloGraph.Graph) {
        return true;
      }
      if (typeof cPath !== 'string') {
        return false;
      }
      return cPath.indexOf('.fbp') !== -1 || cPath.indexOf('.json') !== -1;
    };

    ComponentLoader.prototype.loadGraph = function(name, component, callback, delayed, metadata) {
      var delaySocket, graph, graphImplementation, graphSocket;
      graphImplementation = require(this.components['Graph']);
      graphSocket = internalSocket.createSocket();
      graph = graphImplementation.getComponent(metadata);
      graph.loader = this;
      graph.baseDir = this.baseDir;
      if (delayed) {
        delaySocket = internalSocket.createSocket();
        graph.inPorts.start.attach(delaySocket);
      }
      graph.inPorts.graph.attach(graphSocket);
      graphSocket.send(component);
      graphSocket.disconnect();
      graph.inPorts.remove('graph');
      graph.inPorts.remove('start');
      this.setIcon(name, graph);
      return callback(graph);
    };

    ComponentLoader.prototype.setIcon = function(name, instance) {
      var componentName, library, _ref;
      if (!instance.getIcon || instance.getIcon()) {
        return;
      }
      _ref = name.split('/'), library = _ref[0], componentName = _ref[1];
      if (componentName && this.getLibraryIcon(library)) {
        instance.setIcon(this.getLibraryIcon(library));
        return;
      }
      if (instance.isSubgraph()) {
        instance.setIcon('sitemap');
        return;
      }
      instance.setIcon('square');
    };

    ComponentLoader.prototype.getLibraryIcon = function(prefix) {
      if (this.libraryIcons[prefix]) {
        return this.libraryIcons[prefix];
      }
      return null;
    };

    ComponentLoader.prototype.normalizeName = function(packageId, name) {
      var fullName, prefix;
      prefix = this.getModulePrefix(packageId);
      fullName = "" + prefix + "/" + name;
      if (!packageId) {
        fullName = name;
      }
      return fullName;
    };

    ComponentLoader.prototype.registerComponent = function(packageId, name, cPath, callback) {
      var fullName;
      fullName = this.normalizeName(packageId, name);
      this.components[fullName] = cPath;
      if (callback) {
        return callback();
      }
    };

    ComponentLoader.prototype.registerGraph = function(packageId, name, gPath, callback) {
      return this.registerComponent(packageId, name, gPath, callback);
    };

    ComponentLoader.prototype.registerLoader = function(loader, callback) {
      return loader(this, callback);
    };

    ComponentLoader.prototype.setSource = function(packageId, name, source, language, callback) {
      var e, implementation;
      if (!this.ready) {
        this.listComponents((function(_this) {
          return function() {
            return _this.setSource(packageId, name, source, language, callback);
          };
        })(this));
        return;
      }
      if (language === 'coffeescript') {
        if (!window.CoffeeScript) {
          return callback(new Error('CoffeeScript compiler not available'));
        }
        try {
          source = CoffeeScript.compile(source, {
            bare: true
          });
        } catch (_error) {
          e = _error;
          return callback(e);
        }
      }
      try {
        source = source.replace("require('noflo')", "require('./NoFlo')");
        source = source.replace('require("noflo")', 'require("./NoFlo")');
        implementation = eval("(function () { var exports = {}; " + source + "; return exports; })()");
      } catch (_error) {
        e = _error;
        return callback(e);
      }
      if (!(implementation || implementation.getComponent)) {
        return callback(new Error('Provided source failed to create a runnable component'));
      }
      return this.registerComponent(packageId, name, implementation, function() {
        return callback(null);
      });
    };

    ComponentLoader.prototype.getSource = function(name, callback) {
      var component, componentName, nameParts, path;
      if (!this.ready) {
        this.listComponents((function(_this) {
          return function() {
            return _this.getSource(name, callback);
          };
        })(this));
        return;
      }
      component = this.components[name];
      if (!component) {
        for (componentName in this.components) {
          if (componentName.split('/')[1] === name) {
            component = this.components[componentName];
            name = componentName;
            break;
          }
        }
        if (!component) {
          return callback(new Error("Component " + name + " not installed"));
        }
      }
      if (typeof component !== 'string') {
        return callback(new Error("Can't provide source for " + name + ". Not a file"));
      }
      path = window.require.resolve(component);
      if (!path) {
        return callback(new Error("Component " + name + " is not resolvable to a path"));
      }
      nameParts = name.split('/');
      if (nameParts.length === 1) {
        nameParts[1] = nameParts[0];
        nameParts[0] = '';
      }
      return callback(null, {
        name: nameParts[1],
        library: nameParts[0],
        code: window.require.modules[path].toString(),
        language: utils.guessLanguageFromFilename(component)
      });
    };

    ComponentLoader.prototype.clear = function() {
      this.components = null;
      this.checked = [];
      this.revalidate = true;
      this.ready = false;
      return this.processing = false;
    };

    return ComponentLoader;

  })(EventEmitter);

  exports.ComponentLoader = ComponentLoader;

}).call(this);

}).call(this,require("JkpR2F"))
},{"./Graph":28,"./InternalSocket":31,"./Utils":41,"JkpR2F":13,"events":10}],28:[function(require,module,exports){
(function() {
  var EventEmitter, Graph, clone, platform,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  clone = require('./Utils').clone;

  platform = require('./Platform');

  Graph = (function(_super) {
    __extends(Graph, _super);

    Graph.prototype.name = '';

    Graph.prototype.properties = {};

    Graph.prototype.nodes = [];

    Graph.prototype.edges = [];

    Graph.prototype.initializers = [];

    Graph.prototype.exports = [];

    Graph.prototype.inports = {};

    Graph.prototype.outports = {};

    Graph.prototype.groups = [];

    function Graph(name) {
      this.name = name != null ? name : '';
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
    }

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
      if (!this.getNode(nodeKey)) {
        return;
      }
      this.checkTransactionStart();
      exported = {
        "public": publicPort,
        process: nodeKey,
        port: portKey,
        metadata: metadata
      };
      this.exports.push(exported);
      this.emit('addExport', exported);
      return this.checkTransactionEnd();
    };

    Graph.prototype.removeExport = function(publicPort) {
      var exported, found, idx, _i, _len, _ref;
      publicPort = publicPort.toLowerCase();
      found = null;
      _ref = this.exports;
      for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
        exported = _ref[idx];
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
      this.checkTransactionStart();
      this.inports[publicPort] = {
        process: nodeKey,
        port: portKey,
        metadata: metadata
      };
      this.emit('addInport', publicPort, this.inports[publicPort]);
      return this.checkTransactionEnd();
    };

    Graph.prototype.removeInport = function(publicPort) {
      var port;
      publicPort = publicPort.toLowerCase();
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
      this.checkTransactionStart();
      this.outports[publicPort] = {
        process: nodeKey,
        port: portKey,
        metadata: metadata
      };
      this.emit('addOutport', publicPort, this.outports[publicPort]);
      return this.checkTransactionEnd();
    };

    Graph.prototype.removeOutport = function(publicPort) {
      var port;
      publicPort = publicPort.toLowerCase();
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
      var group, _i, _len, _ref;
      this.checkTransactionStart();
      _ref = this.groups;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
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
      var group, _i, _len, _ref;
      this.checkTransactionStart();
      _ref = this.groups;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
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
      var before, group, item, val, _i, _len, _ref;
      this.checkTransactionStart();
      _ref = this.groups;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
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
      var edge, exported, group, index, initializer, node, priv, pub, toRemove, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _m, _n, _o, _p, _q, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      node = this.getNode(id);
      if (!node) {
        return;
      }
      this.checkTransactionStart();
      toRemove = [];
      _ref = this.edges;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        edge = _ref[_i];
        if ((edge.from.node === node.id) || (edge.to.node === node.id)) {
          toRemove.push(edge);
        }
      }
      for (_j = 0, _len1 = toRemove.length; _j < _len1; _j++) {
        edge = toRemove[_j];
        this.removeEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port);
      }
      toRemove = [];
      _ref1 = this.initializers;
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        initializer = _ref1[_k];
        if (initializer.to.node === node.id) {
          toRemove.push(initializer);
        }
      }
      for (_l = 0, _len3 = toRemove.length; _l < _len3; _l++) {
        initializer = toRemove[_l];
        this.removeInitial(initializer.to.node, initializer.to.port);
      }
      toRemove = [];
      _ref2 = this.exports;
      for (_m = 0, _len4 = _ref2.length; _m < _len4; _m++) {
        exported = _ref2[_m];
        if (id.toLowerCase() === exported.process) {
          toRemove.push(exported);
        }
      }
      for (_n = 0, _len5 = toRemove.length; _n < _len5; _n++) {
        exported = toRemove[_n];
        this.removeExports(exported["public"]);
      }
      toRemove = [];
      _ref3 = this.inports;
      for (pub in _ref3) {
        priv = _ref3[pub];
        if (priv.process === id) {
          toRemove.push(pub);
        }
      }
      for (_o = 0, _len6 = toRemove.length; _o < _len6; _o++) {
        pub = toRemove[_o];
        this.removeInport(pub);
      }
      toRemove = [];
      _ref4 = this.outports;
      for (pub in _ref4) {
        priv = _ref4[pub];
        if (priv.process === id) {
          toRemove.push(pub);
        }
      }
      for (_p = 0, _len7 = toRemove.length; _p < _len7; _p++) {
        pub = toRemove[_p];
        this.removeOutport(pub);
      }
      _ref5 = this.groups;
      for (_q = 0, _len8 = _ref5.length; _q < _len8; _q++) {
        group = _ref5[_q];
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
      var node, _i, _len, _ref;
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
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
      var edge, exported, group, iip, index, node, priv, pub, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      this.checkTransactionStart();
      node = this.getNode(oldId);
      if (!node) {
        return;
      }
      node.id = newId;
      _ref = this.edges;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        edge = _ref[_i];
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
      _ref1 = this.initializers;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        iip = _ref1[_j];
        if (!iip) {
          continue;
        }
        if (iip.to.node === oldId) {
          iip.to.node = newId;
        }
      }
      _ref2 = this.inports;
      for (pub in _ref2) {
        priv = _ref2[pub];
        if (priv.process === oldId) {
          priv.process = newId;
        }
      }
      _ref3 = this.outports;
      for (pub in _ref3) {
        priv = _ref3[pub];
        if (priv.process === oldId) {
          priv.process = newId;
        }
      }
      _ref4 = this.exports;
      for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
        exported = _ref4[_k];
        if (exported.process === oldId) {
          exported.process = newId;
        }
      }
      _ref5 = this.groups;
      for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
        group = _ref5[_l];
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
      var edge, _i, _len, _ref;
      if (metadata == null) {
        metadata = {};
      }
      _ref = this.edges;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        edge = _ref[_i];
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
      var edge, index, toKeep, toRemove, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      this.checkTransactionStart();
      toRemove = [];
      toKeep = [];
      if (node2 && port2) {
        _ref = this.edges;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          edge = _ref[index];
          if (edge.from.node === node && edge.from.port === port && edge.to.node === node2 && edge.to.port === port2) {
            this.setEdgeMetadata(edge.from.node, edge.from.port, edge.to.node, edge.to.port, {});
            toRemove.push(edge);
          } else {
            toKeep.push(edge);
          }
        }
      } else {
        _ref1 = this.edges;
        for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
          edge = _ref1[index];
          if ((edge.from.node === node && edge.from.port === port) || (edge.to.node === node && edge.to.port === port)) {
            this.setEdgeMetadata(edge.from.node, edge.from.port, edge.to.node, edge.to.port, {});
            toRemove.push(edge);
          } else {
            toKeep.push(edge);
          }
        }
      }
      this.edges = toKeep;
      for (_k = 0, _len2 = toRemove.length; _k < _len2; _k++) {
        edge = toRemove[_k];
        this.emit('removeEdge', edge);
      }
      return this.checkTransactionEnd();
    };

    Graph.prototype.getEdge = function(node, port, node2, port2) {
      var edge, index, _i, _len, _ref;
      _ref = this.edges;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        edge = _ref[index];
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

    Graph.prototype.removeInitial = function(node, port) {
      var edge, index, toKeep, toRemove, _i, _j, _len, _len1, _ref;
      this.checkTransactionStart();
      toRemove = [];
      toKeep = [];
      _ref = this.initializers;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        edge = _ref[index];
        if (edge.to.node === node && edge.to.port === port) {
          toRemove.push(edge);
        } else {
          toKeep.push(edge);
        }
      }
      this.initializers = toKeep;
      for (_j = 0, _len1 = toRemove.length; _j < _len1; _j++) {
        edge = toRemove[_j];
        this.emit('removeInitial', edge);
      }
      return this.checkTransactionEnd();
    };

    Graph.prototype.toDOT = function() {
      var cleanID, cleanPort, data, dot, edge, id, initializer, node, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      cleanID = function(id) {
        return id.replace(/\s*/g, "");
      };
      cleanPort = function(port) {
        return port.replace(/\./g, "");
      };
      dot = "digraph {\n";
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        dot += "    " + (cleanID(node.id)) + " [label=" + node.id + " shape=box]\n";
      }
      _ref1 = this.initializers;
      for (id = _j = 0, _len1 = _ref1.length; _j < _len1; id = ++_j) {
        initializer = _ref1[id];
        if (typeof initializer.from.data === 'function') {
          data = 'Function';
        } else {
          data = initializer.from.data;
        }
        dot += "    data" + id + " [label=\"'" + data + "'\" shape=plaintext]\n";
        dot += "    data" + id + " -> " + (cleanID(initializer.to.node)) + "[headlabel=" + (cleanPort(initializer.to.port)) + " labelfontcolor=blue labelfontsize=8.0]\n";
      }
      _ref2 = this.edges;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        edge = _ref2[_k];
        dot += "    " + (cleanID(edge.from.node)) + " -> " + (cleanID(edge.to.node)) + "[taillabel=" + (cleanPort(edge.from.port)) + " headlabel=" + (cleanPort(edge.to.port)) + " labelfontcolor=blue labelfontsize=8.0]\n";
      }
      dot += "}";
      return dot;
    };

    Graph.prototype.toYUML = function() {
      var edge, initializer, yuml, _i, _j, _len, _len1, _ref, _ref1;
      yuml = [];
      _ref = this.initializers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        initializer = _ref[_i];
        yuml.push("(start)[" + initializer.to.port + "]->(" + initializer.to.node + ")");
      }
      _ref1 = this.edges;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        edge = _ref1[_j];
        yuml.push("(" + edge.from.node + ")[" + edge.from.port + "]->(" + edge.to.node + ")");
      }
      return yuml.join(",");
    };

    Graph.prototype.toJSON = function() {
      var connection, edge, exported, group, groupData, initializer, json, node, priv, property, pub, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      json = {
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
      _ref = this.properties;
      for (property in _ref) {
        value = _ref[property];
        json.properties[property] = value;
      }
      _ref1 = this.inports;
      for (pub in _ref1) {
        priv = _ref1[pub];
        json.inports[pub] = priv;
      }
      _ref2 = this.outports;
      for (pub in _ref2) {
        priv = _ref2[pub];
        json.outports[pub] = priv;
      }
      _ref3 = this.exports;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        exported = _ref3[_i];
        if (!json.exports) {
          json.exports = [];
        }
        json.exports.push(exported);
      }
      _ref4 = this.groups;
      for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
        group = _ref4[_j];
        groupData = {
          name: group.name,
          nodes: group.nodes
        };
        if (Object.keys(group.metadata).length) {
          groupData.metadata = group.metadata;
        }
        json.groups.push(groupData);
      }
      _ref5 = this.nodes;
      for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
        node = _ref5[_k];
        json.processes[node.id] = {
          component: node.component
        };
        if (node.metadata) {
          json.processes[node.id].metadata = node.metadata;
        }
      }
      _ref6 = this.edges;
      for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
        edge = _ref6[_l];
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
      _ref7 = this.initializers;
      for (_m = 0, _len4 = _ref7.length; _m < _len4; _m++) {
        initializer = _ref7[_m];
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

    Graph.prototype.save = function(file, success) {
      var json;
      json = JSON.stringify(this.toJSON(), null, 4);
      return require('fs').writeFile("" + file + ".json", json, "utf-8", function(err, data) {
        if (err) {
          throw err;
        }
        return success(file);
      });
    };

    return Graph;

  })(EventEmitter);

  exports.Graph = Graph;

  exports.createGraph = function(name) {
    return new Graph(name);
  };

  exports.loadJSON = function(definition, success, metadata) {
    var conn, def, exported, graph, group, id, portId, priv, processId, properties, property, pub, split, value, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
    if (metadata == null) {
      metadata = {};
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
    graph = new Graph(definition.properties.name);
    graph.startTransaction('loadJSON', metadata);
    properties = {};
    _ref = definition.properties;
    for (property in _ref) {
      value = _ref[property];
      if (property === 'name') {
        continue;
      }
      properties[property] = value;
    }
    graph.setProperties(properties);
    _ref1 = definition.processes;
    for (id in _ref1) {
      def = _ref1[id];
      if (!def.metadata) {
        def.metadata = {};
      }
      graph.addNode(id, def.component, def.metadata);
    }
    _ref2 = definition.connections;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      conn = _ref2[_i];
      metadata = conn.metadata ? conn.metadata : {};
      if (conn.data !== void 0) {
        if (typeof conn.tgt.index === 'number') {
          graph.addInitialIndex(conn.data, conn.tgt.process, conn.tgt.port.toLowerCase(), conn.tgt.index, metadata);
        }
        graph.addInitial(conn.data, conn.tgt.process, conn.tgt.port.toLowerCase(), metadata);
        continue;
      }
      if (typeof conn.src.index === 'number' || typeof conn.tgt.index === 'number') {
        graph.addEdgeIndex(conn.src.process, conn.src.port.toLowerCase(), conn.src.index, conn.tgt.process, conn.tgt.port.toLowerCase(), conn.tgt.index, metadata);
        continue;
      }
      graph.addEdge(conn.src.process, conn.src.port.toLowerCase(), conn.tgt.process, conn.tgt.port.toLowerCase(), metadata);
    }
    if (definition.exports && definition.exports.length) {
      _ref3 = definition.exports;
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        exported = _ref3[_j];
        if (exported["private"]) {
          split = exported["private"].split('.');
          if (split.length !== 2) {
            continue;
          }
          processId = split[0];
          portId = split[1];
          for (id in definition.processes) {
            if (id.toLowerCase() === processId.toLowerCase()) {
              processId = id;
            }
          }
        } else {
          processId = exported.process;
          portId = exported.port;
        }
        graph.addExport(exported["public"], processId, portId, exported.metadata);
      }
    }
    if (definition.inports) {
      _ref4 = definition.inports;
      for (pub in _ref4) {
        priv = _ref4[pub];
        graph.addInport(pub, priv.process, priv.port, priv.metadata);
      }
    }
    if (definition.outports) {
      _ref5 = definition.outports;
      for (pub in _ref5) {
        priv = _ref5[pub];
        graph.addOutport(pub, priv.process, priv.port, priv.metadata);
      }
    }
    if (definition.groups) {
      _ref6 = definition.groups;
      for (_k = 0, _len2 = _ref6.length; _k < _len2; _k++) {
        group = _ref6[_k];
        graph.addGroup(group.name, group.nodes, group.metadata || {});
      }
    }
    graph.endTransaction('loadJSON');
    return success(graph);
  };

  exports.loadFBP = function(fbpData, success) {
    var definition;
    definition = require('fbp').parse(fbpData);
    return exports.loadJSON(definition, success);
  };

  exports.loadHTTP = function(url, success) {
    var req;
    req = new XMLHttpRequest;
    req.onreadystatechange = function() {
      if (req.readyState !== 4) {
        return;
      }
      if (req.status !== 200) {
        return success();
      }
      return success(req.responseText);
    };
    req.open('GET', url, true);
    return req.send();
  };

  exports.loadFile = function(file, success, metadata) {
    var definition, e;
    if (metadata == null) {
      metadata = {};
    }
    if (platform.isBrowser()) {
      try {
        definition = require(file);
      } catch (_error) {
        e = _error;
        exports.loadHTTP(file, function(data) {
          if (!data) {
            throw new Error("Failed to load graph " + file);
            return;
          }
          if (file.split('.').pop() === 'fbp') {
            return exports.loadFBP(data, success, metadata);
          }
          definition = JSON.parse(data);
          return exports.loadJSON(definition, success, metadata);
        });
        return;
      }
      exports.loadJSON(definition, success, metadata);
      return;
    }
    return require('fs').readFile(file, "utf-8", function(err, data) {
      if (err) {
        throw err;
      }
      if (file.split('.').pop() === 'fbp') {
        return exports.loadFBP(data, success);
      }
      definition = JSON.parse(data);
      return exports.loadJSON(definition, success);
    });
  };

}).call(this);

},{"./Platform":37,"./Utils":41,"events":10,"fbp":54,"fs":2}],29:[function(require,module,exports){
(function() {
  var InternalSocket, StreamReceiver, StreamSender,
    __hasProp = {}.hasOwnProperty;

  StreamSender = require('./Streams').StreamSender;

  StreamReceiver = require('./Streams').StreamReceiver;

  InternalSocket = require('./InternalSocket');

  exports.MapComponent = function(component, func, config) {
    var groups, inPort, outPort;
    if (!config) {
      config = {};
    }
    if (!config.inPort) {
      config.inPort = 'in';
    }
    if (!config.outPort) {
      config.outPort = 'out';
    }
    inPort = component.inPorts[config.inPort];
    outPort = component.outPorts[config.outPort];
    groups = [];
    return inPort.process = function(event, payload) {
      switch (event) {
        case 'connect':
          return outPort.connect();
        case 'begingroup':
          groups.push(payload);
          return outPort.beginGroup(payload);
        case 'data':
          return func(payload, groups, outPort);
        case 'endgroup':
          groups.pop();
          return outPort.endGroup();
        case 'disconnect':
          groups = [];
          return outPort.disconnect();
      }
    };
  };

  exports.WirePattern = function(component, config, proc) {
    var baseShutdown, closeGroupOnOuts, collectGroups, disconnectOuts, inPorts, name, outPorts, port, processQueue, resumeTaskQ, sendGroupToOuts, _fn, _fn1, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1;
    inPorts = 'in' in config ? config["in"] : 'in';
    if (!(inPorts instanceof Array)) {
      inPorts = [inPorts];
    }
    outPorts = 'out' in config ? config.out : 'out';
    if (!(outPorts instanceof Array)) {
      outPorts = [outPorts];
    }
    if (!('error' in config)) {
      config.error = 'error';
    }
    if (!('async' in config)) {
      config.async = false;
    }
    if (!('ordered' in config)) {
      config.ordered = true;
    }
    if (!('group' in config)) {
      config.group = false;
    }
    if (!('field' in config)) {
      config.field = null;
    }
    if (!('forwardGroups' in config)) {
      config.forwardGroups = false;
    }
    if (!('receiveStreams' in config)) {
      config.receiveStreams = false;
    }
    if (typeof config.receiveStreams === 'string') {
      config.receiveStreams = [config.receiveStreams];
    }
    if (!('sendStreams' in config)) {
      config.sendStreams = false;
    }
    if (typeof config.sendStreams === 'string') {
      config.sendStreams = [config.sendStreams];
    }
    if (config.async) {
      config.sendStreams = outPorts;
    }
    if (!('params' in config)) {
      config.params = [];
    }
    if (typeof config.params === 'string') {
      config.params = [config.params];
    }
    if (!('name' in config)) {
      config.name = '';
    }
    collectGroups = config.forwardGroups;
    if (typeof collectGroups === 'boolean' && !config.group) {
      collectGroups = inPorts;
    }
    if (typeof collectGroups === 'string' && !config.group) {
      collectGroups = [collectGroups];
    }
    if (collectGroups !== false && config.group) {
      collectGroups = true;
    }
    for (_i = 0, _len = inPorts.length; _i < _len; _i++) {
      name = inPorts[_i];
      if (!component.inPorts[name]) {
        throw new Error("no inPort named '" + name + "'");
      }
      component.inPorts[name].options.required = true;
    }
    for (_j = 0, _len1 = outPorts.length; _j < _len1; _j++) {
      name = outPorts[_j];
      if (!component.outPorts[name]) {
        throw new Error("no outPort named '" + name + "'");
      }
    }
    component.groupedData = {};
    component.groupedGroups = {};
    component.groupedDisconnects = {};
    disconnectOuts = function() {
      var p, _k, _len2, _results;
      _results = [];
      for (_k = 0, _len2 = outPorts.length; _k < _len2; _k++) {
        p = outPorts[_k];
        if (component.outPorts[p].isConnected()) {
          _results.push(component.outPorts[p].disconnect());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    sendGroupToOuts = function(grp) {
      var p, _k, _len2, _results;
      _results = [];
      for (_k = 0, _len2 = outPorts.length; _k < _len2; _k++) {
        p = outPorts[_k];
        _results.push(component.outPorts[p].beginGroup(grp));
      }
      return _results;
    };
    closeGroupOnOuts = function(grp) {
      var p, _k, _len2, _results;
      _results = [];
      for (_k = 0, _len2 = outPorts.length; _k < _len2; _k++) {
        p = outPorts[_k];
        _results.push(component.outPorts[p].endGroup(grp));
      }
      return _results;
    };
    component.outputQ = [];
    processQueue = function() {
      var flushed, key, stream, streams, tmp;
      while (component.outputQ.length > 0) {
        streams = component.outputQ[0];
        flushed = false;
        if (streams === null) {
          disconnectOuts();
          flushed = true;
        } else {
          if (outPorts.length === 1) {
            tmp = {};
            tmp[outPorts[0]] = streams;
            streams = tmp;
          }
          for (key in streams) {
            stream = streams[key];
            if (stream.resolved) {
              flushed = flushed || stream.flush();
            }
          }
        }
        if (flushed) {
          component.outputQ.shift();
        }
        if (!flushed) {
          return;
        }
      }
    };
    if (config.async) {
      if ('load' in component.outPorts) {
        component.load = 0;
      }
      component.beforeProcess = function(outs) {
        if (config.ordered) {
          component.outputQ.push(outs);
        }
        component.load++;
        if ('load' in component.outPorts && component.outPorts.load.isAttached()) {
          component.outPorts.load.send(component.load);
          return component.outPorts.load.disconnect();
        }
      };
      component.afterProcess = function(err, outs) {
        processQueue();
        component.load--;
        if ('load' in component.outPorts && component.outPorts.load.isAttached()) {
          component.outPorts.load.send(component.load);
          return component.outPorts.load.disconnect();
        }
      };
    }
    component.taskQ = [];
    component.params = {};
    component.requiredParams = [];
    component.completeParams = [];
    component.receivedParams = [];
    component.defaultedParams = [];
    component.defaultsSent = false;
    component.sendDefaults = function() {
      var param, tempSocket, _k, _len2, _ref;
      if (component.defaultedParams.length > 0) {
        _ref = component.defaultedParams;
        for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
          param = _ref[_k];
          if (component.receivedParams.indexOf(param) === -1) {
            tempSocket = InternalSocket.createSocket();
            component.inPorts[param].attach(tempSocket);
            tempSocket.send();
            tempSocket.disconnect();
            component.inPorts[param].detach(tempSocket);
          }
        }
      }
      return component.defaultsSent = true;
    };
    resumeTaskQ = function() {
      var task, temp, _results;
      if (component.completeParams.length === component.requiredParams.length && component.taskQ.length > 0) {
        temp = component.taskQ.slice(0);
        component.taskQ = [];
        _results = [];
        while (temp.length > 0) {
          task = temp.shift();
          _results.push(task());
        }
        return _results;
      }
    };
    _ref = config.params;
    for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
      port = _ref[_k];
      if (!component.inPorts[port]) {
        throw new Error("no inPort named '" + port + "'");
      }
      if (component.inPorts[port].isRequired()) {
        component.requiredParams.push(port);
      }
      if (component.inPorts[port].hasDefault()) {
        component.defaultedParams.push(port);
      }
    }
    _ref1 = config.params;
    _fn = function(port) {
      var inPort;
      inPort = component.inPorts[port];
      return inPort.process = function(event, payload) {
        if (event !== 'data') {
          return;
        }
        component.params[port] = payload;
        if (component.completeParams.indexOf(port) === -1 && component.requiredParams.indexOf(port) > -1) {
          component.completeParams.push(port);
        }
        component.receivedParams.push(port);
        return resumeTaskQ();
      };
    };
    for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
      port = _ref1[_l];
      _fn(port);
    }
    component.disconnectData = [];
    component.disconnectQ = [];
    component.groupBuffers = {};
    _fn1 = function(port) {
      var inPort, needPortGroups;
      component.groupBuffers[port] = [];
      if (config.receiveStreams && config.receiveStreams.indexOf(port) !== -1) {
        inPort = new StreamReceiver(component.inPorts[port]);
      } else {
        inPort = component.inPorts[port];
      }
      needPortGroups = collectGroups instanceof Array && collectGroups.indexOf(port) !== -1;
      return inPort.process = function(event, payload) {
        var data, foundGroup, g, groupLength, groups, grp, i, key, obj, out, outs, postpone, postponedToQ, requiredLength, resume, task, whenDone, whenDoneGroups, _len5, _len6, _len7, _len8, _n, _o, _p, _q, _r, _ref2, _ref3, _ref4, _s;
        switch (event) {
          case 'begingroup':
            component.groupBuffers[port].push(payload);
            if (config.forwardGroups && (collectGroups === true || needPortGroups) && !config.async) {
              return sendGroupToOuts(payload);
            }
            break;
          case 'endgroup':
            component.groupBuffers[port] = component.groupBuffers[port].slice(0, component.groupBuffers[port].length - 1);
            if (config.forwardGroups && (collectGroups === true || needPortGroups) && !config.async) {
              return closeGroupOnOuts(payload);
            }
            break;
          case 'disconnect':
            if (inPorts.length === 1) {
              if (config.async || config.StreamSender) {
                if (config.ordered) {
                  component.outputQ.push(null);
                  return processQueue();
                } else {
                  return component.disconnectQ.push(true);
                }
              } else {
                return disconnectOuts();
              }
            } else {
              foundGroup = false;
              for (i = _n = 0, _ref2 = component.disconnectData.length; 0 <= _ref2 ? _n < _ref2 : _n > _ref2; i = 0 <= _ref2 ? ++_n : --_n) {
                if (!(port in component.disconnectData[i])) {
                  foundGroup = true;
                  component.disconnectData[i][port] = true;
                  if (Object.keys(component.disconnectData[i]).length === inPorts.length) {
                    component.disconnectData.shift();
                    if (config.async || config.StreamSender) {
                      if (config.ordered) {
                        component.outputQ.push(null);
                        processQueue();
                      } else {
                        component.disconnectQ.push(true);
                      }
                    } else {
                      disconnectOuts();
                    }
                  }
                  break;
                }
              }
              if (!foundGroup) {
                obj = {};
                obj[port] = true;
                return component.disconnectData.push(obj);
              }
            }
            break;
          case 'data':
            if (inPorts.length === 1) {
              data = payload;
              groups = component.groupBuffers[port];
            } else {
              key = '';
              if (config.group && component.groupBuffers[port].length > 0) {
                key = component.groupBuffers[port].toString();
                if (config.group instanceof RegExp) {
                  if (!config.group.test(key)) {
                    key = '';
                  }
                }
              } else if (config.field && typeof payload === 'object' && config.field in payload) {
                key = payload[config.field];
              }
              if (!(key in component.groupedData)) {
                component.groupedData[key] = [];
              }
              if (!(key in component.groupedGroups)) {
                component.groupedGroups[key] = [];
              }
              foundGroup = false;
              requiredLength = inPorts.length;
              if (config.field) {
                ++requiredLength;
              }
              for (i = _o = 0, _ref3 = component.groupedData[key].length; 0 <= _ref3 ? _o < _ref3 : _o > _ref3; i = 0 <= _ref3 ? ++_o : --_o) {
                if (!(port in component.groupedData[key][i])) {
                  foundGroup = true;
                  component.groupedData[key][i][port] = payload;
                  if (needPortGroups) {
                    _ref4 = component.groupBuffers[port];
                    for (_p = 0, _len5 = _ref4.length; _p < _len5; _p++) {
                      grp = _ref4[_p];
                      if (component.groupedGroups[key][i].indexOf(grp) === -1) {
                        component.groupedGroups[key][i].push(grp);
                      }
                    }
                  }
                  groupLength = Object.keys(component.groupedData[key][i]).length;
                  if (groupLength === requiredLength) {
                    data = (component.groupedData[key].splice(i, 1))[0];
                    groups = (component.groupedGroups[key].splice(i, 1))[0];
                    break;
                  } else {
                    return;
                  }
                }
              }
              if (!foundGroup) {
                obj = {};
                if (config.field) {
                  obj[config.field] = key;
                }
                obj[port] = payload;
                component.groupedData[key].push(obj);
                if (needPortGroups) {
                  component.groupedGroups[key].push(component.groupBuffers[port]);
                } else {
                  component.groupedGroups[key].push([]);
                }
                return;
              }
            }
            if (collectGroups === true) {
              groups = component.groupBuffers[port];
            }
            outs = {};
            for (_q = 0, _len6 = outPorts.length; _q < _len6; _q++) {
              name = outPorts[_q];
              if (config.async || config.sendStreams && config.sendStreams.indexOf(name) !== -1) {
                outs[name] = new StreamSender(component.outPorts[name], config.ordered);
              } else {
                outs[name] = component.outPorts[name];
              }
            }
            if (outPorts.length === 1) {
              outs = outs[outPorts[0]];
            }
            whenDoneGroups = groups.slice(0);
            whenDone = function(err) {
              var disconnect, out, outputs, _len7, _r;
              if (err) {
                component.error(err, whenDoneGroups);
              }
              if (typeof component.fail === 'function' && component.hasErrors) {
                component.fail();
              }
              outputs = outPorts.length === 1 ? {
                port: outs
              } : outs;
              disconnect = false;
              if (component.disconnectQ.length > 0) {
                component.disconnectQ.shift();
                disconnect = true;
              }
              for (name in outputs) {
                out = outputs[name];
                if (config.forwardGroups && config.async) {
                  for (_r = 0, _len7 = whenDoneGroups.length; _r < _len7; _r++) {
                    i = whenDoneGroups[_r];
                    out.endGroup();
                  }
                }
                if (disconnect) {
                  out.disconnect();
                }
                if (config.async || config.StreamSender) {
                  out.done();
                }
              }
              if (typeof component.afterProcess === 'function') {
                return component.afterProcess(err || component.hasErrors, outs);
              }
            };
            if (typeof component.beforeProcess === 'function') {
              component.beforeProcess(outs);
            }
            if (config.forwardGroups && config.async) {
              if (outPorts.length === 1) {
                for (_r = 0, _len7 = groups.length; _r < _len7; _r++) {
                  g = groups[_r];
                  outs.beginGroup(g);
                }
              } else {
                for (name in outs) {
                  out = outs[name];
                  for (_s = 0, _len8 = groups.length; _s < _len8; _s++) {
                    g = groups[_s];
                    out.beginGroup(g);
                  }
                }
              }
            }
            exports.MultiError(component, config.name, config.error, groups);
            if (config.async) {
              postpone = function() {};
              resume = function() {};
              postponedToQ = false;
              task = function() {
                return proc.call(component, data, groups, outs, whenDone, postpone, resume);
              };
              postpone = function(backToQueue) {
                if (backToQueue == null) {
                  backToQueue = true;
                }
                postponedToQ = backToQueue;
                if (backToQueue) {
                  return component.taskQ.push(task);
                }
              };
              resume = function() {
                if (postponedToQ) {
                  return resumeTaskQ();
                } else {
                  return task();
                }
              };
            } else {
              task = function() {
                proc.call(component, data, groups, outs);
                return whenDone();
              };
            }
            component.taskQ.push(task);
            return resumeTaskQ();
        }
      };
    };
    for (_m = 0, _len4 = inPorts.length; _m < _len4; _m++) {
      port = inPorts[_m];
      _fn1(port);
    }
    baseShutdown = component.shutdown;
    component.shutdown = function() {
      baseShutdown.call(component);
      component.groupedData = {};
      component.groupedGroups = {};
      component.outputQ = [];
      component.disconnectData = [];
      component.disconnectQ = [];
      component.taskQ = [];
      component.params = {};
      component.completeParams = [];
      component.receivedParams = [];
      component.defaultsSent = false;
      return component.groupBuffers = {};
    };
    return component;
  };

  exports.GroupedInput = exports.WirePattern;

  exports.CustomError = function(message, options) {
    var err;
    err = new Error(message);
    return exports.CustomizeError(err, options);
  };

  exports.CustomizeError = function(err, options) {
    var key, val;
    for (key in options) {
      if (!__hasProp.call(options, key)) continue;
      val = options[key];
      err[key] = val;
    }
    return err;
  };

  exports.MultiError = function(component, group, errorPort, forwardedGroups) {
    var baseShutdown;
    if (group == null) {
      group = '';
    }
    if (errorPort == null) {
      errorPort = 'error';
    }
    if (forwardedGroups == null) {
      forwardedGroups = [];
    }
    component.hasErrors = false;
    component.errors = [];
    component.error = function(e, groups) {
      if (groups == null) {
        groups = [];
      }
      component.errors.push({
        err: e,
        groups: forwardedGroups.concat(groups)
      });
      return component.hasErrors = true;
    };
    component.fail = function(e, groups) {
      var error, grp, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      if (e == null) {
        e = null;
      }
      if (groups == null) {
        groups = [];
      }
      if (e) {
        component.error(e, groups);
      }
      if (!component.hasErrors) {
        return;
      }
      if (!(errorPort in component.outPorts)) {
        return;
      }
      if (!component.outPorts[errorPort].isAttached()) {
        return;
      }
      if (group) {
        component.outPorts[errorPort].beginGroup(group);
      }
      _ref = component.errors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        error = _ref[_i];
        _ref1 = error.groups;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          grp = _ref1[_j];
          component.outPorts[errorPort].beginGroup(grp);
        }
        component.outPorts[errorPort].send(error.err);
        _ref2 = error.groups;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          grp = _ref2[_k];
          component.outPorts[errorPort].endGroup();
        }
      }
      if (group) {
        component.outPorts[errorPort].endGroup();
      }
      component.outPorts[errorPort].disconnect();
      component.hasErrors = false;
      return component.errors = [];
    };
    baseShutdown = component.shutdown;
    component.shutdown = function() {
      baseShutdown.call(component);
      component.hasErrors = false;
      return component.errors = [];
    };
    return component;
  };

}).call(this);

},{"./InternalSocket":31,"./Streams":40}],30:[function(require,module,exports){
(function() {
  var BasePort, InPort,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BasePort = require('./BasePort');

  InPort = (function(_super) {
    __extends(InPort, _super);

    function InPort(options, process) {
      this.process = null;
      if (!process && typeof options === 'function') {
        process = options;
        options = {};
      }
      if (options && options.buffered === void 0) {
        options.buffered = false;
      }
      if (!process && options && options.process) {
        process = options.process;
        delete options.process;
      }
      if (process) {
        if (typeof process !== 'function') {
          throw new Error('process must be a function');
        }
        this.process = process;
      }
      InPort.__super__.constructor.call(this, options);
      this.prepareBuffer();
    }

    InPort.prototype.attachSocket = function(socket, localId) {
      if (localId == null) {
        localId = null;
      }
      if (this.hasDefault()) {
        socket.setDataDelegate((function(_this) {
          return function() {
            return _this.options["default"];
          };
        })(this));
      }
      socket.on('connect', (function(_this) {
        return function() {
          return _this.handleSocketEvent('connect', socket, localId);
        };
      })(this));
      socket.on('begingroup', (function(_this) {
        return function(group) {
          return _this.handleSocketEvent('begingroup', group, localId);
        };
      })(this));
      socket.on('data', (function(_this) {
        return function(data) {
          _this.validateData(data);
          return _this.handleSocketEvent('data', data, localId);
        };
      })(this));
      socket.on('endgroup', (function(_this) {
        return function(group) {
          return _this.handleSocketEvent('endgroup', group, localId);
        };
      })(this));
      return socket.on('disconnect', (function(_this) {
        return function() {
          return _this.handleSocketEvent('disconnect', socket, localId);
        };
      })(this));
    };

    InPort.prototype.handleSocketEvent = function(event, payload, id) {
      if (this.isBuffered()) {
        this.buffer.push({
          event: event,
          payload: payload,
          id: id
        });
        if (this.isAddressable()) {
          if (this.process) {
            this.process(event, id, this.nodeInstance);
          }
          this.emit(event, id);
        } else {
          if (this.process) {
            this.process(event, this.nodeInstance);
          }
          this.emit(event);
        }
        return;
      }
      if (this.process) {
        if (this.isAddressable()) {
          this.process(event, payload, id, this.nodeInstance);
        } else {
          this.process(event, payload, this.nodeInstance);
        }
      }
      if (this.isAddressable()) {
        return this.emit(event, payload, id);
      }
      return this.emit(event, payload);
    };

    InPort.prototype.hasDefault = function() {
      return this.options["default"] !== void 0;
    };

    InPort.prototype.prepareBuffer = function() {
      if (!this.isBuffered()) {
        return;
      }
      return this.buffer = [];
    };

    InPort.prototype.validateData = function(data) {
      if (!this.options.values) {
        return;
      }
      if (this.options.values.indexOf(data) === -1) {
        throw new Error('Invalid data received');
      }
    };

    InPort.prototype.receive = function() {
      if (!this.isBuffered()) {
        throw new Error('Receive is only possible on buffered ports');
      }
      return this.buffer.shift();
    };

    InPort.prototype.contains = function() {
      if (!this.isBuffered()) {
        throw new Error('Contains query is only possible on buffered ports');
      }
      return this.buffer.filter(function(packet) {
        if (packet.event === 'data') {
          return true;
        }
      }).length;
    };

    return InPort;

  })(BasePort);

  module.exports = InPort;

}).call(this);

},{"./BasePort":25}],31:[function(require,module,exports){
(function() {
  var EventEmitter, InternalSocket,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  InternalSocket = (function(_super) {
    __extends(InternalSocket, _super);

    function InternalSocket() {
      this.connected = false;
      this.groups = [];
      this.dataDelegate = null;
    }

    InternalSocket.prototype.connect = function() {
      if (this.connected) {
        return;
      }
      this.connected = true;
      return this.emit('connect', this);
    };

    InternalSocket.prototype.disconnect = function() {
      if (!this.connected) {
        return;
      }
      this.connected = false;
      return this.emit('disconnect', this);
    };

    InternalSocket.prototype.isConnected = function() {
      return this.connected;
    };

    InternalSocket.prototype.send = function(data) {
      if (!this.connected) {
        this.connect();
      }
      if (data === void 0 && typeof this.dataDelegate === 'function') {
        data = this.dataDelegate();
      }
      return this.emit('data', data);
    };

    InternalSocket.prototype.beginGroup = function(group) {
      this.groups.push(group);
      return this.emit('begingroup', group);
    };

    InternalSocket.prototype.endGroup = function() {
      if (!this.groups.length) {
        return;
      }
      return this.emit('endgroup', this.groups.pop());
    };

    InternalSocket.prototype.setDataDelegate = function(delegate) {
      if (typeof delegate !== 'function') {
        throw Error('A data delegate must be a function.');
      }
      return this.dataDelegate = delegate;
    };

    InternalSocket.prototype.getId = function() {
      var fromStr, toStr;
      fromStr = function(from) {
        return "" + from.process.id + "() " + (from.port.toUpperCase());
      };
      toStr = function(to) {
        return "" + (to.port.toUpperCase()) + " " + to.process.id + "()";
      };
      if (!(this.from || this.to)) {
        return "UNDEFINED";
      }
      if (this.from && !this.to) {
        return "" + (fromStr(this.from)) + " -> ANON";
      }
      if (!this.from) {
        return "DATA -> " + (toStr(this.to));
      }
      return "" + (fromStr(this.from)) + " -> " + (toStr(this.to));
    };

    return InternalSocket;

  })(EventEmitter);

  exports.InternalSocket = InternalSocket;

  exports.createSocket = function() {
    return new InternalSocket;
  };

}).call(this);

},{"events":10}],32:[function(require,module,exports){
(function() {
  var EventEmitter, Journal, JournalStore, MemoryJournalStore, calculateMeta, clone, entryToPrettyString,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  EventEmitter = require('events').EventEmitter;

  clone = require('./Utils').clone;

  entryToPrettyString = function(entry) {
    var a;
    a = entry.args;
    switch (entry.cmd) {
      case 'addNode':
        return "" + a.id + "(" + a.component + ")";
      case 'removeNode':
        return "DEL " + a.id + "(" + a.component + ")";
      case 'renameNode':
        return "RENAME " + a.oldId + " " + a.newId;
      case 'changeNode':
        return "META " + a.id;
      case 'addEdge':
        return "" + a.from.node + " " + a.from.port + " -> " + a.to.port + " " + a.to.node;
      case 'removeEdge':
        return "" + a.from.node + " " + a.from.port + " -X> " + a.to.port + " " + a.to.node;
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

  JournalStore = (function(_super) {
    __extends(JournalStore, _super);

    JournalStore.prototype.lastRevision = 0;

    function JournalStore(graph) {
      this.graph = graph;
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

  MemoryJournalStore = (function(_super) {
    __extends(MemoryJournalStore, _super);

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

  Journal = (function(_super) {
    __extends(Journal, _super);

    Journal.prototype.graph = null;

    Journal.prototype.entries = [];

    Journal.prototype.subscribed = true;

    function Journal(graph, metadata, store) {
      this.endTransaction = __bind(this.endTransaction, this);
      this.startTransaction = __bind(this.startTransaction, this);
      var edge, group, iip, k, node, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      this.graph = graph;
      this.entries = [];
      this.subscribed = true;
      this.store = store || new MemoryJournalStore(this.graph);
      if (this.store.transactions.length === 0) {
        this.currentRevision = -1;
        this.startTransaction('initial', metadata);
        _ref = this.graph.nodes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          node = _ref[_i];
          this.appendCommand('addNode', node);
        }
        _ref1 = this.graph.edges;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          edge = _ref1[_j];
          this.appendCommand('addEdge', edge);
        }
        _ref2 = this.graph.initializers;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          iip = _ref2[_k];
          this.appendCommand('addInitial', iip);
        }
        if (Object.keys(this.graph.properties).length > 0) {
          this.appendCommand('changeProperties', this.graph.properties, {});
        }
        _ref3 = this.graph.inports;
        for (k in _ref3) {
          v = _ref3[k];
          this.appendCommand('addInport', {
            name: k,
            port: v
          });
        }
        _ref4 = this.graph.outports;
        for (k in _ref4) {
          v = _ref4[k];
          this.appendCommand('addOutport', {
            name: k,
            port: v
          });
        }
        _ref5 = this.graph.groups;
        for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
          group = _ref5[_l];
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
          return this.graph.setInportMetadata(a.port, calculateMeta(a.old, a["new"]));
        case 'addOutport':
          return this.graph.addOutport(a.name, a.port.process, a.port.port, a.port.metadata(a.name));
        case 'removeOutport':
          return this.graph.removeOutport;
        case 'renameOutport':
          return this.graph.renameOutport(a.oldId, a.newId);
        case 'changeOutport':
          return this.graph.setOutportMetadata(a.port, calculateMeta(a.old, a["new"]));
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
          return this.graph.setInportMetadata(a.port, calculateMeta(a["new"], a.old));
        case 'addOutport':
          return this.graph.removeOutport(a.name);
        case 'removeOutport':
          return this.graph.addOutport(a.name, a.port.process, a.port.port, a.port.metadata);
        case 'renameOutport':
          return this.graph.renameOutport(a.newId, a.oldId);
        case 'changeOutport':
          return this.graph.setOutportMetadata(a.port, calculateMeta(a["new"], a.old));
        default:
          throw new Error("Unknown journal entry: " + entry.cmd);
      }
    };

    Journal.prototype.moveToRevision = function(revId) {
      var entries, entry, i, r, _i, _j, _k, _l, _len, _ref, _ref1, _ref2, _ref3, _ref4;
      if (revId === this.currentRevision) {
        return;
      }
      this.subscribed = false;
      if (revId > this.currentRevision) {
        for (r = _i = _ref = this.currentRevision + 1; _ref <= revId ? _i <= revId : _i >= revId; r = _ref <= revId ? ++_i : --_i) {
          _ref1 = this.store.fetchTransaction(r);
          for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
            entry = _ref1[_j];
            this.executeEntry(entry);
          }
        }
      } else {
        for (r = _k = _ref2 = this.currentRevision, _ref3 = revId + 1; _k >= _ref3; r = _k += -1) {
          entries = this.store.fetchTransaction(r);
          for (i = _l = _ref4 = entries.length - 1; _l >= 0; i = _l += -1) {
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
      var e, entry, lines, r, _i, _j, _len;
      startRev |= 0;
      endRev |= this.store.lastRevision;
      lines = [];
      for (r = _i = startRev; startRev <= endRev ? _i < endRev : _i > endRev; r = startRev <= endRev ? ++_i : --_i) {
        e = this.store.fetchTransaction(r);
        for (_j = 0, _len = e.length; _j < _len; _j++) {
          entry = e[_j];
          lines.push(entryToPrettyString(entry));
        }
      }
      return lines.join('\n');
    };

    Journal.prototype.toJSON = function(startRev, endRev) {
      var entries, entry, r, _i, _j, _len, _ref;
      startRev |= 0;
      endRev |= this.store.lastRevision;
      entries = [];
      for (r = _i = startRev; _i < endRev; r = _i += 1) {
        _ref = this.store.fetchTransaction(r);
        for (_j = 0, _len = _ref.length; _j < _len; _j++) {
          entry = _ref[_j];
          entries.push(entryToPrettyString(entry));
        }
      }
      return entries;
    };

    Journal.prototype.save = function(file, success) {
      var json;
      json = JSON.stringify(this.toJSON(), null, 4);
      return require('fs').writeFile("" + file + ".json", json, "utf-8", function(err, data) {
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

},{"./Utils":41,"events":10,"fs":2}],33:[function(require,module,exports){
(function() {
  var Component, Port, util,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Component = require("./Component").Component;

  Port = require("./Port").Port;

  if (!require('./Platform').isBrowser()) {
    util = require("util");
  } else {
    util = {
      inspect: function(data) {
        return data;
      }
    };
  }

  exports.LoggingComponent = (function(_super) {
    __extends(LoggingComponent, _super);

    function LoggingComponent() {
      this.sendLog = __bind(this.sendLog, this);
      this.outPorts = {
        log: new Port()
      };
    }

    LoggingComponent.prototype.sendLog = function(message) {
      if (typeof message === "object") {
        message.when = new Date;
        message.source = this.constructor.name;
        if (this.nodeId != null) {
          message.nodeID = this.nodeId;
        }
      }
      if ((this.outPorts.log != null) && this.outPorts.log.isAttached()) {
        return this.outPorts.log.send(message);
      } else {
        return console.log(util.inspect(message, 4, true, true));
      }
    };

    return LoggingComponent;

  })(Component);

}).call(this);

},{"./Component":26,"./Platform":37,"./Port":38,"util":20}],34:[function(require,module,exports){
(function (process){
(function() {
  var EventEmitter, Network, componentLoader, graph, internalSocket, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require("underscore");

  internalSocket = require("./InternalSocket");

  graph = require("./Graph");

  EventEmitter = require('events').EventEmitter;

  if (!require('./Platform').isBrowser()) {
    componentLoader = require("./nodejs/ComponentLoader");
  } else {
    componentLoader = require('./ComponentLoader');
  }

  Network = (function(_super) {
    __extends(Network, _super);

    Network.prototype.processes = {};

    Network.prototype.connections = [];

    Network.prototype.initials = [];

    Network.prototype.defaults = [];

    Network.prototype.graph = null;

    Network.prototype.startupDate = null;

    Network.prototype.portBuffer = {};

    function Network(graph) {
      this.processes = {};
      this.connections = [];
      this.initials = [];
      this.defaults = [];
      this.graph = graph;
      this.started = false;
      if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
        this.baseDir = graph.baseDir || process.cwd();
      } else {
        this.baseDir = graph.baseDir || '/';
      }
      this.startupDate = new Date();
      if (graph.componentLoader) {
        this.loader = graph.componentLoader;
      } else {
        this.loader = new componentLoader.ComponentLoader(this.baseDir);
      }
    }

    Network.prototype.uptime = function() {
      return new Date() - this.startupDate;
    };

    Network.prototype.connectionCount = 0;

    Network.prototype.increaseConnections = function() {
      if (this.connectionCount === 0) {
        this.emit('start', {
          start: this.startupDate
        });
      }
      return this.connectionCount++;
    };

    Network.prototype.decreaseConnections = function() {
      var ender;
      this.connectionCount--;
      if (this.connectionCount === 0) {
        ender = _.debounce((function(_this) {
          return function() {
            if (_this.connectionCount) {
              return;
            }
            return _this.emit('end', {
              start: _this.startupDate,
              end: new Date,
              uptime: _this.uptime()
            });
          };
        })(this), 10);
        return ender();
      }
    };

    Network.prototype.load = function(component, metadata, callback) {
      return this.loader.load(component, callback, false, metadata);
    };

    Network.prototype.addNode = function(node, callback) {
      var process;
      if (this.processes[node.id]) {
        if (callback) {
          callback(this.processes[node.id]);
        }
        return;
      }
      process = {
        id: node.id
      };
      if (!node.component) {
        this.processes[process.id] = process;
        if (callback) {
          callback(process);
        }
        return;
      }
      return this.load(node.component, node.metadata, (function(_this) {
        return function(instance) {
          var name, port, _ref, _ref1;
          instance.nodeId = node.id;
          process.component = instance;
          _ref = process.component.inPorts;
          for (name in _ref) {
            port = _ref[name];
            if (!port || typeof port === 'function' || !port.canAttach) {
              continue;
            }
            port.node = node.id;
            port.nodeInstance = instance;
            port.name = name;
          }
          _ref1 = process.component.outPorts;
          for (name in _ref1) {
            port = _ref1[name];
            if (!port || typeof port === 'function' || !port.canAttach) {
              continue;
            }
            port.node = node.id;
            port.nodeInstance = instance;
            port.name = name;
          }
          if (instance.isSubgraph()) {
            _this.subscribeSubgraph(process);
          }
          _this.subscribeNode(process);
          _this.processes[process.id] = process;
          if (callback) {
            return callback(process);
          }
        };
      })(this));
    };

    Network.prototype.removeNode = function(node, callback) {
      if (!this.processes[node.id]) {
        return;
      }
      this.processes[node.id].component.shutdown();
      delete this.processes[node.id];
      if (callback) {
        return callback();
      }
    };

    Network.prototype.renameNode = function(oldId, newId, callback) {
      var name, port, process, _ref, _ref1;
      process = this.getNode(oldId);
      if (!process) {
        return;
      }
      process.id = newId;
      _ref = process.component.inPorts;
      for (name in _ref) {
        port = _ref[name];
        port.node = newId;
      }
      _ref1 = process.component.outPorts;
      for (name in _ref1) {
        port = _ref1[name];
        port.node = newId;
      }
      this.processes[newId] = process;
      delete this.processes[oldId];
      if (callback) {
        return callback();
      }
    };

    Network.prototype.getNode = function(id) {
      return this.processes[id];
    };

    Network.prototype.connect = function(done) {
      var callStack, edges, initializers, nodes, serialize, setDefaults, subscribeGraph;
      if (done == null) {
        done = function() {};
      }
      callStack = 0;
      serialize = (function(_this) {
        return function(next, add) {
          return function(type) {
            return _this["add" + type](add, function() {
              callStack++;
              if (callStack % 100 === 0) {
                setTimeout(function() {
                  return next(type);
                }, 0);
                return;
              }
              return next(type);
            });
          };
        };
      })(this);
      subscribeGraph = (function(_this) {
        return function() {
          _this.subscribeGraph();
          return done();
        };
      })(this);
      setDefaults = _.reduceRight(this.graph.nodes, serialize, subscribeGraph);
      initializers = _.reduceRight(this.graph.initializers, serialize, function() {
        return setDefaults("Defaults");
      });
      edges = _.reduceRight(this.graph.edges, serialize, function() {
        return initializers("Initial");
      });
      nodes = _.reduceRight(this.graph.nodes, serialize, function() {
        return edges("Edge");
      });
      return nodes("Node");
    };

    Network.prototype.connectPort = function(socket, process, port, index, inbound) {
      if (inbound) {
        socket.to = {
          process: process,
          port: port,
          index: index
        };
        if (!(process.component.inPorts && process.component.inPorts[port])) {
          throw new Error("No inport '" + port + "' defined in process " + process.id + " (" + (socket.getId()) + ")");
          return;
        }
        if (process.component.inPorts[port].isAddressable()) {
          return process.component.inPorts[port].attach(socket, index);
        }
        return process.component.inPorts[port].attach(socket);
      }
      socket.from = {
        process: process,
        port: port,
        index: index
      };
      if (!(process.component.outPorts && process.component.outPorts[port])) {
        throw new Error("No outport '" + port + "' defined in process " + process.id + " (" + (socket.getId()) + ")");
        return;
      }
      if (process.component.outPorts[port].isAddressable()) {
        return process.component.outPorts[port].attach(socket, index);
      }
      return process.component.outPorts[port].attach(socket);
    };

    Network.prototype.subscribeGraph = function() {
      var graphOps, processOps, processing, registerOp;
      graphOps = [];
      processing = false;
      registerOp = function(op, details) {
        return graphOps.push({
          op: op,
          details: details
        });
      };
      processOps = (function(_this) {
        return function() {
          var cb, op;
          if (!graphOps.length) {
            processing = false;
            return;
          }
          processing = true;
          op = graphOps.shift();
          cb = processOps;
          switch (op.op) {
            case 'renameNode':
              return _this.renameNode(op.details.from, op.details.to, cb);
            default:
              return _this[op.op](op.details, cb);
          }
        };
      })(this);
      this.graph.on('addNode', (function(_this) {
        return function(node) {
          registerOp('addNode', node);
          if (!processing) {
            return processOps();
          }
        };
      })(this));
      this.graph.on('removeNode', (function(_this) {
        return function(node) {
          registerOp('removeNode', node);
          if (!processing) {
            return processOps();
          }
        };
      })(this));
      this.graph.on('renameNode', (function(_this) {
        return function(oldId, newId) {
          registerOp('renameNode', {
            from: oldId,
            to: newId
          });
          if (!processing) {
            return processOps();
          }
        };
      })(this));
      this.graph.on('addEdge', (function(_this) {
        return function(edge) {
          registerOp('addEdge', edge);
          if (!processing) {
            return processOps();
          }
        };
      })(this));
      this.graph.on('removeEdge', (function(_this) {
        return function(edge) {
          registerOp('removeEdge', edge);
          if (!processing) {
            return processOps();
          }
        };
      })(this));
      this.graph.on('addInitial', (function(_this) {
        return function(iip) {
          registerOp('addInitial', iip);
          if (!processing) {
            return processOps();
          }
        };
      })(this));
      return this.graph.on('removeInitial', (function(_this) {
        return function(iip) {
          registerOp('removeInitial', iip);
          if (!processing) {
            return processOps();
          }
        };
      })(this));
    };

    Network.prototype.subscribeSubgraph = function(node) {
      var emitSub;
      if (!node.component.isReady()) {
        node.component.once('ready', (function(_this) {
          return function() {
            return _this.subscribeSubgraph(node);
          };
        })(this));
        return;
      }
      if (!node.component.network) {
        return;
      }
      emitSub = (function(_this) {
        return function(type, data) {
          if (type === 'connect') {
            _this.increaseConnections();
          }
          if (type === 'disconnect') {
            _this.decreaseConnections();
          }
          if (!data) {
            data = {};
          }
          if (data.subgraph) {
            if (!data.subgraph.unshift) {
              data.subgraph = [data.subgraph];
            }
            data.subgraph = data.subgraph.unshift(node.id);
          } else {
            data.subgraph = [node.id];
          }
          return _this.emit(type, data);
        };
      })(this);
      node.component.network.on('connect', function(data) {
        return emitSub('connect', data);
      });
      node.component.network.on('begingroup', function(data) {
        return emitSub('begingroup', data);
      });
      node.component.network.on('data', function(data) {
        return emitSub('data', data);
      });
      node.component.network.on('endgroup', function(data) {
        return emitSub('endgroup', data);
      });
      return node.component.network.on('disconnect', function(data) {
        return emitSub('disconnect', data);
      });
    };

    Network.prototype.subscribeSocket = function(socket) {
      socket.on('connect', (function(_this) {
        return function() {
          _this.increaseConnections();
          return _this.emit('connect', {
            id: socket.getId(),
            socket: socket
          });
        };
      })(this));
      socket.on('begingroup', (function(_this) {
        return function(group) {
          return _this.emit('begingroup', {
            id: socket.getId(),
            socket: socket,
            group: group
          });
        };
      })(this));
      socket.on('data', (function(_this) {
        return function(data) {
          return _this.emit('data', {
            id: socket.getId(),
            socket: socket,
            data: data
          });
        };
      })(this));
      socket.on('endgroup', (function(_this) {
        return function(group) {
          return _this.emit('endgroup', {
            id: socket.getId(),
            socket: socket,
            group: group
          });
        };
      })(this));
      return socket.on('disconnect', (function(_this) {
        return function() {
          _this.decreaseConnections();
          return _this.emit('disconnect', {
            id: socket.getId(),
            socket: socket
          });
        };
      })(this));
    };

    Network.prototype.subscribeNode = function(node) {
      if (!node.component.getIcon) {
        return;
      }
      return node.component.on('icon', (function(_this) {
        return function() {
          return _this.emit('icon', {
            id: node.id,
            icon: node.component.getIcon()
          });
        };
      })(this));
    };

    Network.prototype.addEdge = function(edge, callback) {
      var from, socket, to;
      socket = internalSocket.createSocket();
      from = this.getNode(edge.from.node);
      if (!from) {
        throw new Error("No process defined for outbound node " + edge.from.node);
      }
      if (!from.component) {
        throw new Error("No component defined for outbound node " + edge.from.node);
      }
      if (!from.component.isReady()) {
        from.component.once("ready", (function(_this) {
          return function() {
            return _this.addEdge(edge, callback);
          };
        })(this));
        return;
      }
      to = this.getNode(edge.to.node);
      if (!to) {
        throw new Error("No process defined for inbound node " + edge.to.node);
      }
      if (!to.component) {
        throw new Error("No component defined for inbound node " + edge.to.node);
      }
      if (!to.component.isReady()) {
        to.component.once("ready", (function(_this) {
          return function() {
            return _this.addEdge(edge, callback);
          };
        })(this));
        return;
      }
      this.connectPort(socket, to, edge.to.port, edge.to.index, true);
      this.connectPort(socket, from, edge.from.port, edge.from.index, false);
      this.subscribeSocket(socket);
      this.connections.push(socket);
      if (callback) {
        return callback();
      }
    };

    Network.prototype.removeEdge = function(edge, callback) {
      var connection, _i, _len, _ref, _results;
      _ref = this.connections;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        connection = _ref[_i];
        if (!connection) {
          continue;
        }
        if (!(edge.to.node === connection.to.process.id && edge.to.port === connection.to.port)) {
          continue;
        }
        connection.to.process.component.inPorts[connection.to.port].detach(connection);
        if (edge.from.node) {
          if (connection.from && edge.from.node === connection.from.process.id && edge.from.port === connection.from.port) {
            connection.from.process.component.outPorts[connection.from.port].detach(connection);
          }
        }
        this.connections.splice(this.connections.indexOf(connection), 1);
        if (callback) {
          _results.push(callback());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Network.prototype.addDefaults = function(node, callback) {
      var key, port, process, socket, _ref;
      process = this.processes[node.id];
      if (!process.component.isReady()) {
        process.component.setMaxListeners(0);
        process.component.once("ready", (function(_this) {
          return function() {
            return _this.addDefaults(process, callback);
          };
        })(this));
        return;
      }
      _ref = process.component.inPorts.ports;
      for (key in _ref) {
        port = _ref[key];
        if (typeof port.hasDefault === 'function' && port.hasDefault() && !port.isAttached()) {
          socket = internalSocket.createSocket();
          this.subscribeSocket(socket);
          this.connectPort(socket, process, key, void 0, true);
          this.connections.push(socket);
          this.defaults.push(socket);
        }
      }
      if (callback) {
        return callback();
      }
    };

    Network.prototype.addInitial = function(initializer, callback) {
      var socket, to;
      socket = internalSocket.createSocket();
      this.subscribeSocket(socket);
      to = this.getNode(initializer.to.node);
      if (!to) {
        throw new Error("No process defined for inbound node " + initializer.to.node);
      }
      if (!(to.component.isReady() || to.component.inPorts[initializer.to.port])) {
        to.component.setMaxListeners(0);
        to.component.once("ready", (function(_this) {
          return function() {
            return _this.addInitial(initializer, callback);
          };
        })(this));
        return;
      }
      this.connectPort(socket, to, initializer.to.port, initializer.to.index, true);
      this.connections.push(socket);
      this.initials.push({
        socket: socket,
        data: initializer.from.data
      });
      if (callback) {
        return callback();
      }
    };

    Network.prototype.removeInitial = function(initializer, callback) {
      var connection, _i, _len, _ref;
      _ref = this.connections;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        connection = _ref[_i];
        if (!connection) {
          continue;
        }
        if (!(initializer.to.node === connection.to.process.id && initializer.to.port === connection.to.port)) {
          continue;
        }
        connection.to.process.component.inPorts[connection.to.port].detach(connection);
        this.connections.splice(this.connections.indexOf(connection), 1);
      }
      if (callback) {
        return callback();
      }
    };

    Network.prototype.sendInitial = function(initial) {
      initial.socket.connect();
      initial.socket.send(initial.data);
      return initial.socket.disconnect();
    };

    Network.prototype.sendInitials = function() {
      var send;
      send = (function(_this) {
        return function() {
          var initial, _i, _len, _ref;
          _ref = _this.initials;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            initial = _ref[_i];
            _this.sendInitial(initial);
          }
          return _this.initials = [];
        };
      })(this);
      if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
        return process.nextTick(send);
      } else {
        return setTimeout(send, 0);
      }
    };

    Network.prototype.isStarted = function() {
      return this.started;
    };

    Network.prototype.startComponents = function() {
      var id, process, _ref, _results;
      _ref = this.processes;
      _results = [];
      for (id in _ref) {
        process = _ref[id];
        _results.push(process.component.start());
      }
      return _results;
    };

    Network.prototype.sendDefaults = function() {
      var socket, _i, _len, _ref, _results;
      _ref = this.defaults;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        socket = _ref[_i];
        socket.connect();
        socket.send();
        _results.push(socket.disconnect());
      }
      return _results;
    };

    Network.prototype.start = function() {
      this.started = true;
      this.startComponents();
      this.sendInitials();
      return this.sendDefaults();
    };

    Network.prototype.stop = function() {
      var connection, id, process, _i, _len, _ref, _ref1;
      _ref = this.connections;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        connection = _ref[_i];
        if (!connection.isConnected()) {
          continue;
        }
        connection.disconnect();
      }
      _ref1 = this.processes;
      for (id in _ref1) {
        process = _ref1[id];
        process.component.shutdown();
      }
      return this.started = false;
    };

    return Network;

  })(EventEmitter);

  exports.Network = Network;

}).call(this);

}).call(this,require("JkpR2F"))
},{"./ComponentLoader":27,"./Graph":28,"./InternalSocket":31,"./Platform":37,"./nodejs/ComponentLoader":42,"JkpR2F":13,"events":10,"underscore":78}],35:[function(require,module,exports){
(function() {
  var ports;

  exports.graph = require('./Graph');

  exports.Graph = exports.graph.Graph;

  exports.journal = require('./Journal');

  exports.Journal = exports.journal.Journal;

  exports.Network = require('./Network').Network;

  exports.isBrowser = require('./Platform').isBrowser;

  if (!exports.isBrowser()) {
    exports.ComponentLoader = require('./nodejs/ComponentLoader').ComponentLoader;
  } else {
    exports.ComponentLoader = require('./ComponentLoader').ComponentLoader;
  }

  exports.Component = require('./Component').Component;

  exports.AsyncComponent = require('./AsyncComponent').AsyncComponent;

  exports.LoggingComponent = require('./LoggingComponent').LoggingComponent;

  exports.helpers = require('./Helpers');

  ports = require('./Ports');

  exports.InPorts = ports.InPorts;

  exports.OutPorts = ports.OutPorts;

  exports.InPort = require('./InPort');

  exports.OutPort = require('./OutPort');

  exports.Port = require('./Port').Port;

  exports.ArrayPort = require('./ArrayPort').ArrayPort;

  exports.internalSocket = require('./InternalSocket');

  exports.createNetwork = function(graph, callback, delay) {
    var network, networkReady;
    network = new exports.Network(graph);
    networkReady = function(network) {
      if (callback != null) {
        callback(network);
      }
      return network.start();
    };
    network.loader.listComponents(function() {
      if (graph.nodes.length === 0) {
        return networkReady(network);
      }
      if (delay) {
        if (callback != null) {
          callback(network);
        }
        return;
      }
      return network.connect(function() {
        return networkReady(network);
      });
    });
    return network;
  };

  exports.loadFile = function(file, baseDir, callback) {
    if (!callback) {
      callback = baseDir;
      baseDir = null;
    }
    return exports.graph.loadFile(file, function(net) {
      if (baseDir) {
        net.baseDir = baseDir;
      }
      return exports.createNetwork(net, callback);
    });
  };

  exports.saveFile = function(graph, file, callback) {
    return exports.graph.save(file, function() {
      return callback(file);
    });
  };

}).call(this);

},{"./ArrayPort":23,"./AsyncComponent":24,"./Component":26,"./ComponentLoader":27,"./Graph":28,"./Helpers":29,"./InPort":30,"./InternalSocket":31,"./Journal":32,"./LoggingComponent":33,"./Network":34,"./OutPort":36,"./Platform":37,"./Port":38,"./Ports":39,"./nodejs/ComponentLoader":42}],36:[function(require,module,exports){
(function() {
  var BasePort, OutPort,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BasePort = require('./BasePort');

  OutPort = (function(_super) {
    __extends(OutPort, _super);

    function OutPort(options) {
      this.cache = {};
      OutPort.__super__.constructor.call(this, options);
    }

    OutPort.prototype.attach = function(socket, index) {
      if (index == null) {
        index = null;
      }
      OutPort.__super__.attach.call(this, socket, index);
      if (this.isCaching() && (this.cache[index] != null)) {
        return this.send(this.cache[index], index);
      }
    };

    OutPort.prototype.connect = function(socketId) {
      var socket, sockets, _i, _len, _results;
      if (socketId == null) {
        socketId = null;
      }
      sockets = this.getSockets(socketId);
      this.checkRequired(sockets);
      _results = [];
      for (_i = 0, _len = sockets.length; _i < _len; _i++) {
        socket = sockets[_i];
        if (!socket) {
          continue;
        }
        _results.push(socket.connect());
      }
      return _results;
    };

    OutPort.prototype.beginGroup = function(group, socketId) {
      var sockets;
      if (socketId == null) {
        socketId = null;
      }
      sockets = this.getSockets(socketId);
      this.checkRequired(sockets);
      return sockets.forEach(function(socket) {
        if (!socket) {
          return;
        }
        if (socket.isConnected()) {
          return socket.beginGroup(group);
        }
        socket.once('connect', function() {
          return socket.beginGroup(group);
        });
        return socket.connect();
      });
    };

    OutPort.prototype.send = function(data, socketId) {
      var sockets;
      if (socketId == null) {
        socketId = null;
      }
      sockets = this.getSockets(socketId);
      this.checkRequired(sockets);
      if (this.isCaching() && data !== this.cache[socketId]) {
        this.cache[socketId] = data;
      }
      return sockets.forEach(function(socket) {
        if (!socket) {
          return;
        }
        if (socket.isConnected()) {
          return socket.send(data);
        }
        socket.once('connect', function() {
          return socket.send(data);
        });
        return socket.connect();
      });
    };

    OutPort.prototype.endGroup = function(socketId) {
      var socket, sockets, _i, _len, _results;
      if (socketId == null) {
        socketId = null;
      }
      sockets = this.getSockets(socketId);
      this.checkRequired(sockets);
      _results = [];
      for (_i = 0, _len = sockets.length; _i < _len; _i++) {
        socket = sockets[_i];
        if (!socket) {
          continue;
        }
        _results.push(socket.endGroup());
      }
      return _results;
    };

    OutPort.prototype.disconnect = function(socketId) {
      var socket, sockets, _i, _len, _results;
      if (socketId == null) {
        socketId = null;
      }
      sockets = this.getSockets(socketId);
      this.checkRequired(sockets);
      _results = [];
      for (_i = 0, _len = sockets.length; _i < _len; _i++) {
        socket = sockets[_i];
        if (!socket) {
          continue;
        }
        _results.push(socket.disconnect());
      }
      return _results;
    };

    OutPort.prototype.checkRequired = function(sockets) {
      if (sockets.length === 0 && this.isRequired()) {
        throw new Error("" + (this.getId()) + ": No connections available");
      }
    };

    OutPort.prototype.getSockets = function(socketId) {
      if (this.isAddressable()) {
        if (socketId === null) {
          throw new Error("" + (this.getId()) + " Socket ID required");
        }
        if (!this.sockets[socketId]) {
          return [];
        }
        return [this.sockets[socketId]];
      }
      return this.sockets;
    };

    OutPort.prototype.isCaching = function() {
      if (this.options.caching) {
        return true;
      }
      return false;
    };

    return OutPort;

  })(BasePort);

  module.exports = OutPort;

}).call(this);

},{"./BasePort":25}],37:[function(require,module,exports){
(function (process){
(function() {
  exports.isBrowser = function() {
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
      return false;
    }
    return true;
  };

}).call(this);

}).call(this,require("JkpR2F"))
},{"JkpR2F":13}],38:[function(require,module,exports){
(function() {
  var EventEmitter, Port,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  Port = (function(_super) {
    __extends(Port, _super);

    Port.prototype.description = '';

    Port.prototype.required = true;

    function Port(type) {
      this.type = type;
      if (!this.type) {
        this.type = 'all';
      }
      if (this.type === 'integer') {
        this.type = 'int';
      }
      this.sockets = [];
      this.from = null;
      this.node = null;
      this.name = null;
    }

    Port.prototype.getId = function() {
      if (!(this.node && this.name)) {
        return 'Port';
      }
      return "" + this.node + " " + (this.name.toUpperCase());
    };

    Port.prototype.getDataType = function() {
      return this.type;
    };

    Port.prototype.getDescription = function() {
      return this.description;
    };

    Port.prototype.attach = function(socket) {
      this.sockets.push(socket);
      return this.attachSocket(socket);
    };

    Port.prototype.attachSocket = function(socket, localId) {
      if (localId == null) {
        localId = null;
      }
      this.emit("attach", socket, localId);
      this.from = socket.from;
      if (socket.setMaxListeners) {
        socket.setMaxListeners(0);
      }
      socket.on("connect", (function(_this) {
        return function() {
          return _this.emit("connect", socket, localId);
        };
      })(this));
      socket.on("begingroup", (function(_this) {
        return function(group) {
          return _this.emit("begingroup", group, localId);
        };
      })(this));
      socket.on("data", (function(_this) {
        return function(data) {
          return _this.emit("data", data, localId);
        };
      })(this));
      socket.on("endgroup", (function(_this) {
        return function(group) {
          return _this.emit("endgroup", group, localId);
        };
      })(this));
      return socket.on("disconnect", (function(_this) {
        return function() {
          return _this.emit("disconnect", socket, localId);
        };
      })(this));
    };

    Port.prototype.connect = function() {
      var socket, _i, _len, _ref, _results;
      if (this.sockets.length === 0) {
        throw new Error("" + (this.getId()) + ": No connections available");
      }
      _ref = this.sockets;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        socket = _ref[_i];
        _results.push(socket.connect());
      }
      return _results;
    };

    Port.prototype.beginGroup = function(group) {
      if (this.sockets.length === 0) {
        throw new Error("" + (this.getId()) + ": No connections available");
      }
      return this.sockets.forEach(function(socket) {
        if (socket.isConnected()) {
          return socket.beginGroup(group);
        }
        socket.once('connect', function() {
          return socket.beginGroup(group);
        });
        return socket.connect();
      });
    };

    Port.prototype.send = function(data) {
      if (this.sockets.length === 0) {
        throw new Error("" + (this.getId()) + ": No connections available");
      }
      return this.sockets.forEach(function(socket) {
        if (socket.isConnected()) {
          return socket.send(data);
        }
        socket.once('connect', function() {
          return socket.send(data);
        });
        return socket.connect();
      });
    };

    Port.prototype.endGroup = function() {
      var socket, _i, _len, _ref, _results;
      if (this.sockets.length === 0) {
        throw new Error("" + (this.getId()) + ": No connections available");
      }
      _ref = this.sockets;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        socket = _ref[_i];
        _results.push(socket.endGroup());
      }
      return _results;
    };

    Port.prototype.disconnect = function() {
      var socket, _i, _len, _ref, _results;
      if (this.sockets.length === 0) {
        throw new Error("" + (this.getId()) + ": No connections available");
      }
      _ref = this.sockets;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        socket = _ref[_i];
        _results.push(socket.disconnect());
      }
      return _results;
    };

    Port.prototype.detach = function(socket) {
      var index;
      if (this.sockets.length === 0) {
        return;
      }
      if (!socket) {
        socket = this.sockets[0];
      }
      index = this.sockets.indexOf(socket);
      if (index === -1) {
        return;
      }
      if (this.isAddressable()) {
        this.sockets[index] = void 0;
        this.emit('detach', socket, index);
        return;
      }
      this.sockets.splice(index, 1);
      return this.emit("detach", socket);
    };

    Port.prototype.isConnected = function() {
      var connected;
      connected = false;
      this.sockets.forEach((function(_this) {
        return function(socket) {
          if (socket.isConnected()) {
            return connected = true;
          }
        };
      })(this));
      return connected;
    };

    Port.prototype.isAddressable = function() {
      return false;
    };

    Port.prototype.isRequired = function() {
      return this.required;
    };

    Port.prototype.isAttached = function() {
      if (this.sockets.length > 0) {
        return true;
      }
      return false;
    };

    Port.prototype.listAttached = function() {
      var attached, idx, socket, _i, _len, _ref;
      attached = [];
      _ref = this.sockets;
      for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
        socket = _ref[idx];
        if (!socket) {
          continue;
        }
        attached.push(idx);
      }
      return attached;
    };

    Port.prototype.canAttach = function() {
      return true;
    };

    return Port;

  })(EventEmitter);

  exports.Port = Port;

}).call(this);

},{"events":10}],39:[function(require,module,exports){
(function() {
  var EventEmitter, InPort, InPorts, OutPort, OutPorts, Ports,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  InPort = require('./InPort');

  OutPort = require('./OutPort');

  Ports = (function(_super) {
    __extends(Ports, _super);

    Ports.prototype.model = InPort;

    function Ports(ports) {
      var name, options;
      this.ports = {};
      if (!ports) {
        return;
      }
      for (name in ports) {
        options = ports[name];
        this.add(name, options);
      }
    }

    Ports.prototype.add = function(name, options, process) {
      if (name === 'add' || name === 'remove') {
        throw new Error('Add and remove are restricted port names');
      }
      if (this.ports[name]) {
        this.remove(name);
      }
      if (typeof options === 'object' && options.canAttach) {
        this.ports[name] = options;
      } else {
        this.ports[name] = new this.model(options, process);
      }
      this[name] = this.ports[name];
      return this.emit('add', name);
    };

    Ports.prototype.remove = function(name) {
      if (!this.ports[name]) {
        throw new Error("Port " + name + " not defined");
      }
      delete this.ports[name];
      delete this[name];
      return this.emit('remove', name);
    };

    return Ports;

  })(EventEmitter);

  exports.InPorts = InPorts = (function(_super) {
    __extends(InPorts, _super);

    function InPorts() {
      return InPorts.__super__.constructor.apply(this, arguments);
    }

    InPorts.prototype.on = function(name, event, callback) {
      if (!this.ports[name]) {
        throw new Error("Port " + name + " not available");
      }
      return this.ports[name].on(event, callback);
    };

    InPorts.prototype.once = function(name, event, callback) {
      if (!this.ports[name]) {
        throw new Error("Port " + name + " not available");
      }
      return this.ports[name].once(event, callback);
    };

    return InPorts;

  })(Ports);

  exports.OutPorts = OutPorts = (function(_super) {
    __extends(OutPorts, _super);

    function OutPorts() {
      return OutPorts.__super__.constructor.apply(this, arguments);
    }

    OutPorts.prototype.model = OutPort;

    OutPorts.prototype.connect = function(name, socketId) {
      if (!this.ports[name]) {
        throw new Error("Port " + name + " not available");
      }
      return this.ports[name].connect(socketId);
    };

    OutPorts.prototype.beginGroup = function(name, group, socketId) {
      if (!this.ports[name]) {
        throw new Error("Port " + name + " not available");
      }
      return this.ports[name].beginGroup(group, socketId);
    };

    OutPorts.prototype.send = function(name, data, socketId) {
      if (!this.ports[name]) {
        throw new Error("Port " + name + " not available");
      }
      return this.ports[name].send(data, socketId);
    };

    OutPorts.prototype.endGroup = function(name, socketId) {
      if (!this.ports[name]) {
        throw new Error("Port " + name + " not available");
      }
      return this.ports[name].endGroup(socketId);
    };

    OutPorts.prototype.disconnect = function(name, socketId) {
      if (!this.ports[name]) {
        throw new Error("Port " + name + " not available");
      }
      return this.ports[name].disconnect(socketId);
    };

    return OutPorts;

  })(Ports);

}).call(this);

},{"./InPort":30,"./OutPort":36,"events":10}],40:[function(require,module,exports){
(function() {
  var IP, StreamReceiver, StreamSender, Substream;

  IP = (function() {
    function IP(data) {
      this.data = data;
    }

    IP.prototype.sendTo = function(port) {
      return port.send(this.data);
    };

    IP.prototype.getValue = function() {
      return this.data;
    };

    IP.prototype.toObject = function() {
      return this.data;
    };

    return IP;

  })();

  exports.IP = IP;

  Substream = (function() {
    function Substream(key) {
      this.key = key;
      this.value = [];
    }

    Substream.prototype.push = function(value) {
      return this.value.push(value);
    };

    Substream.prototype.sendTo = function(port) {
      var ip, _i, _len, _ref;
      port.beginGroup(this.key);
      _ref = this.value;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ip = _ref[_i];
        if (ip instanceof Substream || ip instanceof IP) {
          ip.sendTo(port);
        } else {
          port.send(ip);
        }
      }
      return port.endGroup();
    };

    Substream.prototype.getKey = function() {
      return this.key;
    };

    Substream.prototype.getValue = function() {
      var hasKeys, ip, obj, res, val, _i, _len, _ref;
      switch (this.value.length) {
        case 0:
          return null;
        case 1:
          if (typeof this.value[0].getValue === 'function') {
            if (this.value[0] instanceof Substream) {
              obj = {};
              obj[this.value[0].key] = this.value[0].getValue();
              return obj;
            } else {
              return this.value[0].getValue();
            }
          } else {
            return this.value[0];
          }
          break;
        default:
          res = [];
          hasKeys = false;
          _ref = this.value;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            ip = _ref[_i];
            val = typeof ip.getValue === 'function' ? ip.getValue() : ip;
            if (ip instanceof Substream) {
              obj = {};
              obj[ip.key] = ip.getValue();
              res.push(obj);
            } else {
              res.push(val);
            }
          }
          return res;
      }
    };

    Substream.prototype.toObject = function() {
      var obj;
      obj = {};
      obj[this.key] = this.getValue();
      return obj;
    };

    return Substream;

  })();

  exports.Substream = Substream;

  StreamSender = (function() {
    function StreamSender(port, ordered) {
      this.port = port;
      this.ordered = ordered != null ? ordered : false;
      this.q = [];
      this.resetCurrent();
      this.resolved = false;
    }

    StreamSender.prototype.resetCurrent = function() {
      this.level = 0;
      this.current = null;
      return this.stack = [];
    };

    StreamSender.prototype.beginGroup = function(group) {
      var stream;
      this.level++;
      stream = new Substream(group);
      this.stack.push(stream);
      this.current = stream;
      return this;
    };

    StreamSender.prototype.endGroup = function() {
      var parent, value;
      if (this.level > 0) {
        this.level--;
      }
      value = this.stack.pop();
      if (this.level === 0) {
        this.q.push(value);
        this.resetCurrent();
      } else {
        parent = this.stack[this.stack.length - 1];
        parent.push(value);
        this.current = parent;
      }
      return this;
    };

    StreamSender.prototype.send = function(data) {
      if (this.level === 0) {
        this.q.push(new IP(data));
      } else {
        this.current.push(new IP(data));
      }
      return this;
    };

    StreamSender.prototype.done = function() {
      if (this.ordered) {
        this.resolved = true;
      } else {
        this.flush();
      }
      return this;
    };

    StreamSender.prototype.disconnect = function() {
      this.q.push(null);
      return this;
    };

    StreamSender.prototype.flush = function() {
      var ip, res, _i, _len, _ref;
      res = false;
      if (this.q.length > 0) {
        _ref = this.q;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ip = _ref[_i];
          if (ip === null) {
            if (this.port.isConnected()) {
              this.port.disconnect();
            }
          } else {
            ip.sendTo(this.port);
          }
        }
        res = true;
      }
      this.q = [];
      return res;
    };

    StreamSender.prototype.isAttached = function() {
      return this.port.isAttached();
    };

    return StreamSender;

  })();

  exports.StreamSender = StreamSender;

  StreamReceiver = (function() {
    function StreamReceiver(port, buffered, process) {
      this.port = port;
      this.buffered = buffered != null ? buffered : false;
      this.process = process != null ? process : null;
      this.q = [];
      this.resetCurrent();
      this.port.process = (function(_this) {
        return function(event, payload, index) {
          var stream;
          switch (event) {
            case 'connect':
              if (typeof _this.process === 'function') {
                return _this.process('connect', index);
              }
              break;
            case 'begingroup':
              _this.level++;
              stream = new Substream(payload);
              if (_this.level === 1) {
                _this.root = stream;
                _this.parent = null;
              } else {
                _this.parent = _this.current;
              }
              return _this.current = stream;
            case 'endgroup':
              if (_this.level > 0) {
                _this.level--;
              }
              if (_this.level === 0) {
                if (_this.buffered) {
                  _this.q.push(_this.root);
                  _this.process('readable', index);
                } else {
                  if (typeof _this.process === 'function') {
                    _this.process('data', _this.root, index);
                  }
                }
                return _this.resetCurrent();
              } else {
                _this.parent.push(_this.current);
                return _this.current = _this.parent;
              }
              break;
            case 'data':
              if (_this.level === 0) {
                return _this.q.push(new IP(payload));
              } else {
                return _this.current.push(new IP(payload));
              }
              break;
            case 'disconnect':
              if (typeof _this.process === 'function') {
                return _this.process('disconnect', index);
              }
          }
        };
      })(this);
    }

    StreamReceiver.prototype.resetCurrent = function() {
      this.level = 0;
      this.root = null;
      this.current = null;
      return this.parent = null;
    };

    StreamReceiver.prototype.read = function() {
      if (this.q.length === 0) {
        return void 0;
      }
      return this.q.shift();
    };

    return StreamReceiver;

  })();

  exports.StreamReceiver = StreamReceiver;

}).call(this);

},{}],41:[function(require,module,exports){
(function() {
  var clone, guessLanguageFromFilename;

  clone = function(obj) {
    var flags, key, newInstance;
    if ((obj == null) || typeof obj !== 'object') {
      return obj;
    }
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    if (obj instanceof RegExp) {
      flags = '';
      if (obj.global != null) {
        flags += 'g';
      }
      if (obj.ignoreCase != null) {
        flags += 'i';
      }
      if (obj.multiline != null) {
        flags += 'm';
      }
      if (obj.sticky != null) {
        flags += 'y';
      }
      return new RegExp(obj.source, flags);
    }
    newInstance = new obj.constructor();
    for (key in obj) {
      newInstance[key] = clone(obj[key]);
    }
    return newInstance;
  };

  guessLanguageFromFilename = function(filename) {
    if (/.*\.coffee$/.test(filename)) {
      return 'coffeescript';
    }
    return 'javascript';
  };

  exports.clone = clone;

  exports.guessLanguageFromFilename = guessLanguageFromFilename;

}).call(this);

},{}],42:[function(require,module,exports){
(function (__filename,__dirname){
(function() {
  var CoffeeScript, ComponentLoader, fs, internalSocket, loader, log, path, reader, utils, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  reader = require('read-installed');

  _ = require('underscore')._;

  path = require('path');

  fs = require('fs');

  loader = require('../ComponentLoader');

  internalSocket = require('../InternalSocket');

  utils = require('../Utils');

  CoffeeScript = require('coffee-script');

  if (typeof CoffeeScript.register !== 'undefined') {
    CoffeeScript.register();
  }

  log = require('npmlog');

  log.pause();

  ComponentLoader = (function(_super) {
    __extends(ComponentLoader, _super);

    function ComponentLoader() {
      return ComponentLoader.__super__.constructor.apply(this, arguments);
    }

    ComponentLoader.prototype.getModuleComponents = function(moduleDef, callback) {
      var checkOwn, components, depCount, done;
      components = {};
      this.checked.push(moduleDef.name);
      depCount = _.keys(moduleDef.dependencies).length;
      done = _.after(depCount + 1, (function(_this) {
        return function() {
          return callback(components);
        };
      })(this));
      _.each(moduleDef.dependencies, (function(_this) {
        return function(def) {
          if (def.name == null) {
            return done();
          }
          if (_this.checked.indexOf(def.name) !== -1) {
            return done();
          }
          return _this.getModuleComponents(def, function(depComponents) {
            var cPath, name;
            if (_.isEmpty(depComponents)) {
              return done();
            }
            for (name in depComponents) {
              cPath = depComponents[name];
              components[name] = cPath;
            }
            return done();
          });
        };
      })(this));
      if (!moduleDef.noflo) {
        return done();
      }
      checkOwn = (function(_this) {
        return function(def) {
          var cPath, gPath, name, prefix, _ref, _ref1;
          prefix = _this.getModulePrefix(def.name);
          if (def.noflo.icon) {
            _this.libraryIcons[prefix] = def.noflo.icon;
          }
          if (def.noflo.components) {
            _ref = def.noflo.components;
            for (name in _ref) {
              cPath = _ref[name];
              _this.registerComponent(prefix, name, path.resolve(def.realPath, cPath));
            }
          }
          if (moduleDef.noflo.graphs) {
            _ref1 = def.noflo.graphs;
            for (name in _ref1) {
              gPath = _ref1[name];
              _this.registerGraph(prefix, name, path.resolve(def.realPath, gPath));
            }
          }
          if (def.noflo.loader) {
            loader = require(path.resolve(def.realPath, def.noflo.loader));
            return _this.registerLoader(loader, done);
          } else {
            return done();
          }
        };
      })(this);
      if (!this.revalidate) {
        return checkOwn(moduleDef);
      }
      return this.readPackageFile("" + moduleDef.realPath + "/package.json", function(err, data) {
        if (err) {
          return done();
        }
        return checkOwn(data);
      });
    };

    ComponentLoader.prototype.getCoreComponents = function(callback) {
      var corePath;
      corePath = path.resolve(__dirname, '../../src/components');
      if (path.extname(__filename) === '.coffee') {
        corePath = path.resolve(__dirname, '../../components');
      }
      return fs.readdir(corePath, (function(_this) {
        return function(err, components) {
          var component, componentExtension, componentName, coreComponents, _i, _len, _ref;
          coreComponents = {};
          if (err) {
            return callback(coreComponents);
          }
          for (_i = 0, _len = components.length; _i < _len; _i++) {
            component = components[_i];
            if (component.substr(0, 1) === '.') {
              continue;
            }
            _ref = component.split('.'), componentName = _ref[0], componentExtension = _ref[1];
            if (componentExtension !== 'coffee') {
              continue;
            }
            coreComponents[componentName] = "" + corePath + "/" + component;
          }
          return callback(coreComponents);
        };
      })(this));
    };

    ComponentLoader.prototype.listComponents = function(callback) {
      var done;
      if (this.processing) {
        this.once('ready', (function(_this) {
          return function() {
            return callback(_this.components);
          };
        })(this));
        return;
      }
      if (this.components) {
        return callback(this.components);
      }
      this.ready = false;
      this.processing = true;
      this.components = {};
      done = _.after(2, (function(_this) {
        return function() {
          _this.ready = true;
          _this.processing = false;
          _this.emit('ready', true);
          if (callback) {
            return callback(_this.components);
          }
        };
      })(this));
      this.getCoreComponents((function(_this) {
        return function(coreComponents) {
          var cPath, name;
          for (name in coreComponents) {
            cPath = coreComponents[name];
            _this.components[name] = cPath;
          }
          return done();
        };
      })(this));
      return reader(this.baseDir, (function(_this) {
        return function(err, data) {
          if (err) {
            return done();
          }
          return _this.getModuleComponents(data, function(components) {
            var cPath, name;
            for (name in components) {
              cPath = components[name];
              _this.components[name] = cPath;
            }
            return done();
          });
        };
      })(this));
    };

    ComponentLoader.prototype.getPackagePath = function(packageId, callback) {
      var find, found, seen;
      found = null;
      seen = [];
      find = function(packageData) {
        if (seen.indexOf(packageData.name) !== -1) {
          return;
        }
        seen.push(packageData.name);
        if (packageData.name === packageId) {
          found = path.resolve(packageData.realPath, './package.json');
          return;
        }
        return _.each(packageData.dependencies, find);
      };
      return reader(this.baseDir, function(err, data) {
        if (err) {
          return callback(err);
        }
        find(data);
        return callback(null, found);
      });
    };

    ComponentLoader.prototype.setSource = function(packageId, name, source, language, callback) {
      var e, implementation, _eval;
      _eval = require('eval');
      if (language === 'coffeescript') {
        try {
          source = CoffeeScript.compile(source, {
            bare: true
          });
        } catch (_error) {
          e = _error;
          return callback(e);
        }
      }
      try {
        implementation = _eval(source, path.resolve(this.baseDir, "" + name + ".js"), {}, true);
      } catch (_error) {
        e = _error;
        return callback(e);
      }
      if (!(implementation || implementation.getComponent)) {
        return callback(new Error('Provided source failed to create a runnable component'));
      }
      return this.registerComponent(packageId, name, implementation, function() {
        return callback(null);
      });
    };

    ComponentLoader.prototype.getSource = function(name, callback) {
      var component, componentName;
      if (!this.ready) {
        this.listComponents((function(_this) {
          return function() {
            return _this.getSource(name, callback);
          };
        })(this));
        return;
      }
      component = this.components[name];
      if (!component) {
        for (componentName in this.components) {
          if (componentName.split('/')[1] === name) {
            component = this.components[componentName];
            name = componentName;
            break;
          }
        }
        if (!component) {
          return callback(new Error("Component " + name + " not installed"));
        }
      }
      if (typeof component !== 'string') {
        return callback(new Error("Can't provide source for " + name + ". Not a file"));
      }
      return fs.readFile(component, 'utf-8', function(err, code) {
        var nameParts;
        if (err) {
          return callback(err);
        }
        nameParts = name.split('/');
        if (nameParts.length === 1) {
          nameParts[1] = nameParts[0];
          nameParts[0] = '';
        }
        return callback(null, {
          name: nameParts[1],
          library: nameParts[0],
          language: utils.guessLanguageFromFilename(component),
          code: code
        });
      });
    };

    ComponentLoader.prototype.readPackage = function(packageId, callback) {
      return this.getPackagePath(packageId, (function(_this) {
        return function(err, packageFile) {
          if (err) {
            return callback(err);
          }
          if (!packageFile) {
            return callback(new Error('no package found'));
          }
          return _this.readPackageFile(packageFile, callback);
        };
      })(this));
    };

    ComponentLoader.prototype.readPackageFile = function(packageFile, callback) {
      return fs.readFile(packageFile, 'utf-8', function(err, packageData) {
        var data;
        if (err) {
          return callback(err);
        }
        data = JSON.parse(packageData);
        data.realPath = path.dirname(packageFile);
        return callback(null, data);
      });
    };

    ComponentLoader.prototype.writePackage = function(packageId, data, callback) {
      return this.getPackagePath(packageId, function(err, packageFile) {
        var packageData;
        if (err) {
          return callback(err);
        }
        if (!packageFile) {
          return callback(new Error('no package found'));
        }
        if (data.realPath) {
          delete data.realPath;
        }
        packageData = JSON.stringify(data, null, 2);
        return fs.writeFile(packageFile, packageData, callback);
      });
    };

    ComponentLoader.prototype.registerComponentToDisk = function(packageId, name, cPath, callback) {
      if (callback == null) {
        callback = function() {};
      }
      return this.readPackage(packageId, (function(_this) {
        return function(err, packageData) {
          if (err) {
            return callback(err);
          }
          if (!packageData.noflo) {
            packageData.noflo = {};
          }
          if (!packageData.noflo.components) {
            packageData.noflo.components = {};
          }
          packageData.noflo.components[name] = cPath;
          _this.clear();
          return _this.writePackage(packageId, packageData, callback);
        };
      })(this));
    };

    ComponentLoader.prototype.registerGraphToDisk = function(packageId, name, cPath, callback) {
      if (callback == null) {
        callback = function() {};
      }
      return this.readPackage(packageId, (function(_this) {
        return function(err, packageData) {
          if (err) {
            return callback(err);
          }
          if (!packageData.noflo) {
            packageData.noflo = {};
          }
          if (!packageData.noflo.graphs) {
            packageData.noflo.graphs = {};
          }
          packageData.noflo.graphs[name] = cPath;
          _this.clear();
          return _this.writePackage(packageId, packageData, callback);
        };
      })(this));
    };

    return ComponentLoader;

  })(loader.ComponentLoader);

  exports.ComponentLoader = ComponentLoader;

}).call(this);

}).call(this,"/node_modules/noflo/lib/nodejs/ComponentLoader.js","/node_modules/noflo/lib/nodejs")
},{"../ComponentLoader":27,"../InternalSocket":31,"../Utils":41,"coffee-script":43,"eval":52,"fs":2,"npmlog":55,"path":12,"read-installed":77,"underscore":78}],43:[function(require,module,exports){
(function (process,global){
// Generated by CoffeeScript 1.7.1
(function() {
  var Lexer, SourceMap, compile, formatSourcePosition, fs, getSourceMap, helpers, lexer, parser, path, sourceMaps, vm, withPrettyErrors,
    __hasProp = {}.hasOwnProperty,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  vm = require('vm');

  path = require('path');

  Lexer = require('./lexer').Lexer;

  parser = require('./parser').parser;

  helpers = require('./helpers');

  SourceMap = require('./sourcemap');

  exports.VERSION = '1.7.1';

  exports.FILE_EXTENSIONS = ['.coffee', '.litcoffee', '.coffee.md'];

  exports.helpers = helpers;

  withPrettyErrors = function(fn) {
    return function(code, options) {
      var err;
      if (options == null) {
        options = {};
      }
      try {
        return fn.call(this, code, options);
      } catch (_error) {
        err = _error;
        throw helpers.updateSyntaxError(err, code, options.filename);
      }
    };
  };

  exports.compile = compile = withPrettyErrors(function(code, options) {
    var answer, currentColumn, currentLine, extend, fragment, fragments, header, js, map, merge, newLines, _i, _len;
    merge = helpers.merge, extend = helpers.extend;
    options = extend({}, options);
    if (options.sourceMap) {
      map = new SourceMap;
    }
    fragments = parser.parse(lexer.tokenize(code, options)).compileToFragments(options);
    currentLine = 0;
    if (options.header) {
      currentLine += 1;
    }
    if (options.shiftLine) {
      currentLine += 1;
    }
    currentColumn = 0;
    js = "";
    for (_i = 0, _len = fragments.length; _i < _len; _i++) {
      fragment = fragments[_i];
      if (options.sourceMap) {
        if (fragment.locationData) {
          map.add([fragment.locationData.first_line, fragment.locationData.first_column], [currentLine, currentColumn], {
            noReplace: true
          });
        }
        newLines = helpers.count(fragment.code, "\n");
        currentLine += newLines;
        if (newLines) {
          currentColumn = fragment.code.length - (fragment.code.lastIndexOf("\n") + 1);
        } else {
          currentColumn += fragment.code.length;
        }
      }
      js += fragment.code;
    }
    if (options.header) {
      header = "Generated by CoffeeScript " + this.VERSION;
      js = "// " + header + "\n" + js;
    }
    if (options.sourceMap) {
      answer = {
        js: js
      };
      answer.sourceMap = map;
      answer.v3SourceMap = map.generate(options, code);
      return answer;
    } else {
      return js;
    }
  });

  exports.tokens = withPrettyErrors(function(code, options) {
    return lexer.tokenize(code, options);
  });

  exports.nodes = withPrettyErrors(function(source, options) {
    if (typeof source === 'string') {
      return parser.parse(lexer.tokenize(source, options));
    } else {
      return parser.parse(source);
    }
  });

  exports.run = function(code, options) {
    var answer, dir, mainModule, _ref;
    if (options == null) {
      options = {};
    }
    mainModule = require.main;
    mainModule.filename = process.argv[1] = options.filename ? fs.realpathSync(options.filename) : '.';
    mainModule.moduleCache && (mainModule.moduleCache = {});
    dir = options.filename ? path.dirname(fs.realpathSync(options.filename)) : fs.realpathSync('.');
    mainModule.paths = require('module')._nodeModulePaths(dir);
    if (!helpers.isCoffee(mainModule.filename) || require.extensions) {
      answer = compile(code, options);
      code = (_ref = answer.js) != null ? _ref : answer;
    }
    return mainModule._compile(code, mainModule.filename);
  };

  exports["eval"] = function(code, options) {
    var Module, Script, js, k, o, r, sandbox, v, _i, _len, _module, _ref, _ref1, _require;
    if (options == null) {
      options = {};
    }
    if (!(code = code.trim())) {
      return;
    }
    Script = vm.Script;
    if (Script) {
      if (options.sandbox != null) {
        if (options.sandbox instanceof Script.createContext().constructor) {
          sandbox = options.sandbox;
        } else {
          sandbox = Script.createContext();
          _ref = options.sandbox;
          for (k in _ref) {
            if (!__hasProp.call(_ref, k)) continue;
            v = _ref[k];
            sandbox[k] = v;
          }
        }
        sandbox.global = sandbox.root = sandbox.GLOBAL = sandbox;
      } else {
        sandbox = global;
      }
      sandbox.__filename = options.filename || 'eval';
      sandbox.__dirname = path.dirname(sandbox.__filename);
      if (!(sandbox !== global || sandbox.module || sandbox.require)) {
        Module = require('module');
        sandbox.module = _module = new Module(options.modulename || 'eval');
        sandbox.require = _require = function(path) {
          return Module._load(path, _module, true);
        };
        _module.filename = sandbox.__filename;
        _ref1 = Object.getOwnPropertyNames(require);
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          r = _ref1[_i];
          if (r !== 'paths') {
            _require[r] = require[r];
          }
        }
        _require.paths = _module.paths = Module._nodeModulePaths(process.cwd());
        _require.resolve = function(request) {
          return Module._resolveFilename(request, _module);
        };
      }
    }
    o = {};
    for (k in options) {
      if (!__hasProp.call(options, k)) continue;
      v = options[k];
      o[k] = v;
    }
    o.bare = true;
    js = compile(code, o);
    if (sandbox === global) {
      return vm.runInThisContext(js);
    } else {
      return vm.runInContext(js, sandbox);
    }
  };

  exports.register = function() {
    return require('./register');
  };

  exports._compileFile = function(filename, sourceMap) {
    var answer, err, raw, stripped;
    if (sourceMap == null) {
      sourceMap = false;
    }
    raw = fs.readFileSync(filename, 'utf8');
    stripped = raw.charCodeAt(0) === 0xFEFF ? raw.substring(1) : raw;
    try {
      answer = compile(stripped, {
        filename: filename,
        sourceMap: sourceMap,
        literate: helpers.isLiterate(filename)
      });
    } catch (_error) {
      err = _error;
      throw helpers.updateSyntaxError(err, stripped, filename);
    }
    return answer;
  };

  lexer = new Lexer;

  parser.lexer = {
    lex: function() {
      var tag, token;
      token = this.tokens[this.pos++];
      if (token) {
        tag = token[0], this.yytext = token[1], this.yylloc = token[2];
        this.errorToken = token.origin || token;
        this.yylineno = this.yylloc.first_line;
      } else {
        tag = '';
      }
      return tag;
    },
    setInput: function(tokens) {
      this.tokens = tokens;
      return this.pos = 0;
    },
    upcomingInput: function() {
      return "";
    }
  };

  parser.yy = require('./nodes');

  parser.yy.parseError = function(message, _arg) {
    var errorLoc, errorTag, errorText, errorToken, token, tokens, _ref;
    token = _arg.token;
    _ref = parser.lexer, errorToken = _ref.errorToken, tokens = _ref.tokens;
    errorTag = errorToken[0], errorText = errorToken[1], errorLoc = errorToken[2];
    errorText = errorToken === tokens[tokens.length - 1] ? 'end of input' : errorTag === 'INDENT' || errorTag === 'OUTDENT' ? 'indentation' : helpers.nameWhitespaceCharacter(errorText);
    return helpers.throwSyntaxError("unexpected " + errorText, errorLoc);
  };

  formatSourcePosition = function(frame, getSourceMapping) {
    var as, column, fileLocation, fileName, functionName, isConstructor, isMethodCall, line, methodName, source, tp, typeName;
    fileName = void 0;
    fileLocation = '';
    if (frame.isNative()) {
      fileLocation = "native";
    } else {
      if (frame.isEval()) {
        fileName = frame.getScriptNameOrSourceURL();
        if (!fileName) {
          fileLocation = "" + (frame.getEvalOrigin()) + ", ";
        }
      } else {
        fileName = frame.getFileName();
      }
      fileName || (fileName = "<anonymous>");
      line = frame.getLineNumber();
      column = frame.getColumnNumber();
      source = getSourceMapping(fileName, line, column);
      fileLocation = source ? "" + fileName + ":" + source[0] + ":" + source[1] : "" + fileName + ":" + line + ":" + column;
    }
    functionName = frame.getFunctionName();
    isConstructor = frame.isConstructor();
    isMethodCall = !(frame.isToplevel() || isConstructor);
    if (isMethodCall) {
      methodName = frame.getMethodName();
      typeName = frame.getTypeName();
      if (functionName) {
        tp = as = '';
        if (typeName && functionName.indexOf(typeName)) {
          tp = "" + typeName + ".";
        }
        if (methodName && functionName.indexOf("." + methodName) !== functionName.length - methodName.length - 1) {
          as = " [as " + methodName + "]";
        }
        return "" + tp + functionName + as + " (" + fileLocation + ")";
      } else {
        return "" + typeName + "." + (methodName || '<anonymous>') + " (" + fileLocation + ")";
      }
    } else if (isConstructor) {
      return "new " + (functionName || '<anonymous>') + " (" + fileLocation + ")";
    } else if (functionName) {
      return "" + functionName + " (" + fileLocation + ")";
    } else {
      return fileLocation;
    }
  };

  sourceMaps = {};

  getSourceMap = function(filename) {
    var answer, _ref;
    if (sourceMaps[filename]) {
      return sourceMaps[filename];
    }
    if (_ref = path != null ? path.extname(filename) : void 0, __indexOf.call(exports.FILE_EXTENSIONS, _ref) < 0) {
      return;
    }
    answer = exports._compileFile(filename, true);
    return sourceMaps[filename] = answer.sourceMap;
  };

  Error.prepareStackTrace = function(err, stack) {
    var frame, frames, getSourceMapping, _ref;
    getSourceMapping = function(filename, line, column) {
      var answer, sourceMap;
      sourceMap = getSourceMap(filename);
      if (sourceMap) {
        answer = sourceMap.sourceLocation([line - 1, column - 1]);
      }
      if (answer) {
        return [answer[0] + 1, answer[1] + 1];
      } else {
        return null;
      }
    };
    frames = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = stack.length; _i < _len; _i++) {
        frame = stack[_i];
        if (frame.getFunction() === exports.run) {
          break;
        }
        _results.push("  at " + (formatSourcePosition(frame, getSourceMapping)));
      }
      return _results;
    })();
    return "" + err.name + ": " + ((_ref = err.message) != null ? _ref : '') + "\n" + (frames.join('\n')) + "\n";
  };

}).call(this);

}).call(this,require("JkpR2F"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./helpers":44,"./lexer":45,"./nodes":46,"./parser":47,"./register":48,"./sourcemap":51,"JkpR2F":13,"fs":2,"module":2,"path":12,"vm":21}],44:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.7.1
(function() {
  var buildLocationData, extend, flatten, last, repeat, syntaxErrorToString, _ref;

  exports.starts = function(string, literal, start) {
    return literal === string.substr(start, literal.length);
  };

  exports.ends = function(string, literal, back) {
    var len;
    len = literal.length;
    return literal === string.substr(string.length - len - (back || 0), len);
  };

  exports.repeat = repeat = function(str, n) {
    var res;
    res = '';
    while (n > 0) {
      if (n & 1) {
        res += str;
      }
      n >>>= 1;
      str += str;
    }
    return res;
  };

  exports.compact = function(array) {
    var item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      item = array[_i];
      if (item) {
        _results.push(item);
      }
    }
    return _results;
  };

  exports.count = function(string, substr) {
    var num, pos;
    num = pos = 0;
    if (!substr.length) {
      return 1 / 0;
    }
    while (pos = 1 + string.indexOf(substr, pos)) {
      num++;
    }
    return num;
  };

  exports.merge = function(options, overrides) {
    return extend(extend({}, options), overrides);
  };

  extend = exports.extend = function(object, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      object[key] = val;
    }
    return object;
  };

  exports.flatten = flatten = function(array) {
    var element, flattened, _i, _len;
    flattened = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      element = array[_i];
      if (element instanceof Array) {
        flattened = flattened.concat(flatten(element));
      } else {
        flattened.push(element);
      }
    }
    return flattened;
  };

  exports.del = function(obj, key) {
    var val;
    val = obj[key];
    delete obj[key];
    return val;
  };

  exports.last = last = function(array, back) {
    return array[array.length - (back || 0) - 1];
  };

  exports.some = (_ref = Array.prototype.some) != null ? _ref : function(fn) {
    var e, _i, _len;
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      e = this[_i];
      if (fn(e)) {
        return true;
      }
    }
    return false;
  };

  exports.invertLiterate = function(code) {
    var line, lines, maybe_code;
    maybe_code = true;
    lines = (function() {
      var _i, _len, _ref1, _results;
      _ref1 = code.split('\n');
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        line = _ref1[_i];
        if (maybe_code && /^([ ]{4}|[ ]{0,3}\t)/.test(line)) {
          _results.push(line);
        } else if (maybe_code = /^\s*$/.test(line)) {
          _results.push(line);
        } else {
          _results.push('# ' + line);
        }
      }
      return _results;
    })();
    return lines.join('\n');
  };

  buildLocationData = function(first, last) {
    if (!last) {
      return first;
    } else {
      return {
        first_line: first.first_line,
        first_column: first.first_column,
        last_line: last.last_line,
        last_column: last.last_column
      };
    }
  };

  exports.addLocationDataFn = function(first, last) {
    return function(obj) {
      if (((typeof obj) === 'object') && (!!obj['updateLocationDataIfMissing'])) {
        obj.updateLocationDataIfMissing(buildLocationData(first, last));
      }
      return obj;
    };
  };

  exports.locationDataToString = function(obj) {
    var locationData;
    if (("2" in obj) && ("first_line" in obj[2])) {
      locationData = obj[2];
    } else if ("first_line" in obj) {
      locationData = obj;
    }
    if (locationData) {
      return ("" + (locationData.first_line + 1) + ":" + (locationData.first_column + 1) + "-") + ("" + (locationData.last_line + 1) + ":" + (locationData.last_column + 1));
    } else {
      return "No location data";
    }
  };

  exports.baseFileName = function(file, stripExt, useWinPathSep) {
    var parts, pathSep;
    if (stripExt == null) {
      stripExt = false;
    }
    if (useWinPathSep == null) {
      useWinPathSep = false;
    }
    pathSep = useWinPathSep ? /\\|\// : /\//;
    parts = file.split(pathSep);
    file = parts[parts.length - 1];
    if (!(stripExt && file.indexOf('.') >= 0)) {
      return file;
    }
    parts = file.split('.');
    parts.pop();
    if (parts[parts.length - 1] === 'coffee' && parts.length > 1) {
      parts.pop();
    }
    return parts.join('.');
  };

  exports.isCoffee = function(file) {
    return /\.((lit)?coffee|coffee\.md)$/.test(file);
  };

  exports.isLiterate = function(file) {
    return /\.(litcoffee|coffee\.md)$/.test(file);
  };

  exports.throwSyntaxError = function(message, location) {
    var error;
    error = new SyntaxError(message);
    error.location = location;
    error.toString = syntaxErrorToString;
    error.stack = error.toString();
    throw error;
  };

  exports.updateSyntaxError = function(error, code, filename) {
    if (error.toString === syntaxErrorToString) {
      error.code || (error.code = code);
      error.filename || (error.filename = filename);
      error.stack = error.toString();
    }
    return error;
  };

  syntaxErrorToString = function() {
    var codeLine, colorize, colorsEnabled, end, filename, first_column, first_line, last_column, last_line, marker, start, _ref1, _ref2;
    if (!(this.code && this.location)) {
      return Error.prototype.toString.call(this);
    }
    _ref1 = this.location, first_line = _ref1.first_line, first_column = _ref1.first_column, last_line = _ref1.last_line, last_column = _ref1.last_column;
    if (last_line == null) {
      last_line = first_line;
    }
    if (last_column == null) {
      last_column = first_column;
    }
    filename = this.filename || '[stdin]';
    codeLine = this.code.split('\n')[first_line];
    start = first_column;
    end = first_line === last_line ? last_column + 1 : codeLine.length;
    marker = repeat(' ', start) + repeat('^', end - start);
    if (typeof process !== "undefined" && process !== null) {
      colorsEnabled = process.stdout.isTTY && !process.env.NODE_DISABLE_COLORS;
    }
    if ((_ref2 = this.colorful) != null ? _ref2 : colorsEnabled) {
      colorize = function(str) {
        return "\x1B[1;31m" + str + "\x1B[0m";
      };
      codeLine = codeLine.slice(0, start) + colorize(codeLine.slice(start, end)) + codeLine.slice(end);
      marker = colorize(marker);
    }
    return "" + filename + ":" + (first_line + 1) + ":" + (first_column + 1) + ": error: " + this.message + "\n" + codeLine + "\n" + marker;
  };

  exports.nameWhitespaceCharacter = function(string) {
    switch (string) {
      case ' ':
        return 'space';
      case '\n':
        return 'newline';
      case '\r':
        return 'carriage return';
      case '\t':
        return 'tab';
      default:
        return string;
    }
  };

}).call(this);

}).call(this,require("JkpR2F"))
},{"JkpR2F":13}],45:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var BOM, BOOL, CALLABLE, CODE, COFFEE_ALIASES, COFFEE_ALIAS_MAP, COFFEE_KEYWORDS, COMMENT, COMPARE, COMPOUND_ASSIGN, HEREDOC, HEREDOC_ILLEGAL, HEREDOC_INDENT, HEREGEX, HEREGEX_OMIT, IDENTIFIER, INDENTABLE_CLOSERS, INDEXABLE, INVERSES, JSTOKEN, JS_FORBIDDEN, JS_KEYWORDS, LINE_BREAK, LINE_CONTINUER, LOGIC, Lexer, MATH, MULTILINER, MULTI_DENT, NOT_REGEX, NOT_SPACED_REGEX, NUMBER, OPERATOR, REGEX, RELATION, RESERVED, Rewriter, SHIFT, SIMPLESTR, STRICT_PROSCRIBED, TRAILING_SPACES, UNARY, UNARY_MATH, WHITESPACE, compact, count, invertLiterate, key, last, locationDataToString, repeat, starts, throwSyntaxError, _ref, _ref1,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('./rewriter'), Rewriter = _ref.Rewriter, INVERSES = _ref.INVERSES;

  _ref1 = require('./helpers'), count = _ref1.count, starts = _ref1.starts, compact = _ref1.compact, last = _ref1.last, repeat = _ref1.repeat, invertLiterate = _ref1.invertLiterate, locationDataToString = _ref1.locationDataToString, throwSyntaxError = _ref1.throwSyntaxError;

  exports.Lexer = Lexer = (function() {
    function Lexer() {}

    Lexer.prototype.tokenize = function(code, opts) {
      var consumed, i, tag, _ref2;
      if (opts == null) {
        opts = {};
      }
      this.literate = opts.literate;
      this.indent = 0;
      this.baseIndent = 0;
      this.indebt = 0;
      this.outdebt = 0;
      this.indents = [];
      this.ends = [];
      this.tokens = [];
      this.chunkLine = opts.line || 0;
      this.chunkColumn = opts.column || 0;
      code = this.clean(code);
      i = 0;
      while (this.chunk = code.slice(i)) {
        consumed = this.identifierToken() || this.commentToken() || this.whitespaceToken() || this.lineToken() || this.heredocToken() || this.stringToken() || this.numberToken() || this.regexToken() || this.jsToken() || this.literalToken();
        _ref2 = this.getLineAndColumnFromChunk(consumed), this.chunkLine = _ref2[0], this.chunkColumn = _ref2[1];
        i += consumed;
      }
      this.closeIndentation();
      if (tag = this.ends.pop()) {
        this.error("missing " + tag);
      }
      if (opts.rewrite === false) {
        return this.tokens;
      }
      return (new Rewriter).rewrite(this.tokens);
    };

    Lexer.prototype.clean = function(code) {
      if (code.charCodeAt(0) === BOM) {
        code = code.slice(1);
      }
      code = code.replace(/\r/g, '').replace(TRAILING_SPACES, '');
      if (WHITESPACE.test(code)) {
        code = "\n" + code;
        this.chunkLine--;
      }
      if (this.literate) {
        code = invertLiterate(code);
      }
      return code;
    };

    Lexer.prototype.identifierToken = function() {
      var colon, colonOffset, forcedIdentifier, id, idLength, input, match, poppedToken, prev, tag, tagToken, _ref2, _ref3, _ref4;
      if (!(match = IDENTIFIER.exec(this.chunk))) {
        return 0;
      }
      input = match[0], id = match[1], colon = match[2];
      idLength = id.length;
      poppedToken = void 0;
      if (id === 'own' && this.tag() === 'FOR') {
        this.token('OWN', id);
        return id.length;
      }
      forcedIdentifier = colon || (prev = last(this.tokens)) && (((_ref2 = prev[0]) === '.' || _ref2 === '?.' || _ref2 === '::' || _ref2 === '?::') || !prev.spaced && prev[0] === '@');
      tag = 'IDENTIFIER';
      if (!forcedIdentifier && (__indexOf.call(JS_KEYWORDS, id) >= 0 || __indexOf.call(COFFEE_KEYWORDS, id) >= 0)) {
        tag = id.toUpperCase();
        if (tag === 'WHEN' && (_ref3 = this.tag(), __indexOf.call(LINE_BREAK, _ref3) >= 0)) {
          tag = 'LEADING_WHEN';
        } else if (tag === 'FOR') {
          this.seenFor = true;
        } else if (tag === 'UNLESS') {
          tag = 'IF';
        } else if (__indexOf.call(UNARY, tag) >= 0) {
          tag = 'UNARY';
        } else if (__indexOf.call(RELATION, tag) >= 0) {
          if (tag !== 'INSTANCEOF' && this.seenFor) {
            tag = 'FOR' + tag;
            this.seenFor = false;
          } else {
            tag = 'RELATION';
            if (this.value() === '!') {
              poppedToken = this.tokens.pop();
              id = '!' + id;
            }
          }
        }
      }
      if (__indexOf.call(JS_FORBIDDEN, id) >= 0) {
        if (forcedIdentifier) {
          tag = 'IDENTIFIER';
          id = new String(id);
          id.reserved = true;
        } else if (__indexOf.call(RESERVED, id) >= 0) {
          this.error("reserved word \"" + id + "\"");
        }
      }
      if (!forcedIdentifier) {
        if (__indexOf.call(COFFEE_ALIASES, id) >= 0) {
          id = COFFEE_ALIAS_MAP[id];
        }
        tag = (function() {
          switch (id) {
            case '!':
              return 'UNARY';
            case '==':
            case '!=':
              return 'COMPARE';
            case '&&':
            case '||':
              return 'LOGIC';
            case 'true':
            case 'false':
              return 'BOOL';
            case 'break':
            case 'continue':
              return 'STATEMENT';
            default:
              return tag;
          }
        })();
      }
      tagToken = this.token(tag, id, 0, idLength);
      if (poppedToken) {
        _ref4 = [poppedToken[2].first_line, poppedToken[2].first_column], tagToken[2].first_line = _ref4[0], tagToken[2].first_column = _ref4[1];
      }
      if (colon) {
        colonOffset = input.lastIndexOf(':');
        this.token(':', ':', colonOffset, colon.length);
      }
      return input.length;
    };

    Lexer.prototype.numberToken = function() {
      var binaryLiteral, lexedLength, match, number, octalLiteral;
      if (!(match = NUMBER.exec(this.chunk))) {
        return 0;
      }
      number = match[0];
      if (/^0[BOX]/.test(number)) {
        this.error("radix prefix '" + number + "' must be lowercase");
      } else if (/E/.test(number) && !/^0x/.test(number)) {
        this.error("exponential notation '" + number + "' must be indicated with a lowercase 'e'");
      } else if (/^0\d*[89]/.test(number)) {
        this.error("decimal literal '" + number + "' must not be prefixed with '0'");
      } else if (/^0\d+/.test(number)) {
        this.error("octal literal '" + number + "' must be prefixed with '0o'");
      }
      lexedLength = number.length;
      if (octalLiteral = /^0o([0-7]+)/.exec(number)) {
        number = '0x' + parseInt(octalLiteral[1], 8).toString(16);
      }
      if (binaryLiteral = /^0b([01]+)/.exec(number)) {
        number = '0x' + parseInt(binaryLiteral[1], 2).toString(16);
      }
      this.token('NUMBER', number, 0, lexedLength);
      return lexedLength;
    };

    Lexer.prototype.stringToken = function() {
      var octalEsc, quote, string, trimmed;
      switch (quote = this.chunk.charAt(0)) {
        case "'":
          string = SIMPLESTR.exec(this.chunk)[0];
          break;
        case '"':
          string = this.balancedString(this.chunk, '"');
      }
      if (!string) {
        return 0;
      }
      trimmed = this.removeNewlines(string.slice(1, -1));
      if (quote === '"' && 0 < string.indexOf('#{', 1)) {
        this.interpolateString(trimmed, {
          strOffset: 1,
          lexedLength: string.length
        });
      } else {
        this.token('STRING', quote + this.escapeLines(trimmed) + quote, 0, string.length);
      }
      if (octalEsc = /^(?:\\.|[^\\])*\\(?:0[0-7]|[1-7])/.test(string)) {
        this.error("octal escape sequences " + string + " are not allowed");
      }
      return string.length;
    };

    Lexer.prototype.heredocToken = function() {
      var doc, heredoc, match, quote;
      if (!(match = HEREDOC.exec(this.chunk))) {
        return 0;
      }
      heredoc = match[0];
      quote = heredoc.charAt(0);
      doc = this.sanitizeHeredoc(match[2], {
        quote: quote,
        indent: null
      });
      if (quote === '"' && 0 <= doc.indexOf('#{')) {
        this.interpolateString(doc, {
          heredoc: true,
          strOffset: 3,
          lexedLength: heredoc.length
        });
      } else {
        this.token('STRING', this.makeString(doc, quote, true), 0, heredoc.length);
      }
      return heredoc.length;
    };

    Lexer.prototype.commentToken = function() {
      var comment, here, match;
      if (!(match = this.chunk.match(COMMENT))) {
        return 0;
      }
      comment = match[0], here = match[1];
      if (here) {
        this.token('HERECOMMENT', this.sanitizeHeredoc(here, {
          herecomment: true,
          indent: repeat(' ', this.indent)
        }), 0, comment.length);
      }
      return comment.length;
    };

    Lexer.prototype.jsToken = function() {
      var match, script;
      if (!(this.chunk.charAt(0) === '`' && (match = JSTOKEN.exec(this.chunk)))) {
        return 0;
      }
      this.token('JS', (script = match[0]).slice(1, -1), 0, script.length);
      return script.length;
    };

    Lexer.prototype.regexToken = function() {
      var flags, length, match, prev, regex, _ref2, _ref3;
      if (this.chunk.charAt(0) !== '/') {
        return 0;
      }
      if (length = this.heregexToken()) {
        return length;
      }
      prev = last(this.tokens);
      if (prev && (_ref2 = prev[0], __indexOf.call((prev.spaced ? NOT_REGEX : NOT_SPACED_REGEX), _ref2) >= 0)) {
        return 0;
      }
      if (!(match = REGEX.exec(this.chunk))) {
        return 0;
      }
      _ref3 = match, match = _ref3[0], regex = _ref3[1], flags = _ref3[2];
      if (regex === '//') {
        return 0;
      }
      if (regex.slice(0, 2) === '/*') {
        this.error('regular expressions cannot begin with `*`');
      }
      this.token('REGEX', "" + regex + flags, 0, match.length);
      return match.length;
    };

    Lexer.prototype.heregexToken = function() {
      var body, flags, flagsOffset, heregex, match, plusToken, prev, re, tag, token, tokens, value, _i, _len, _ref2, _ref3, _ref4;
      if (!(match = HEREGEX.exec(this.chunk))) {
        return 0;
      }
      heregex = match[0], body = match[1], flags = match[2];
      if (0 > body.indexOf('#{')) {
        re = this.escapeLines(body.replace(HEREGEX_OMIT, '$1$2').replace(/\//g, '\\/'), true);
        if (re.match(/^\*/)) {
          this.error('regular expressions cannot begin with `*`');
        }
        this.token('REGEX', "/" + (re || '(?:)') + "/" + flags, 0, heregex.length);
        return heregex.length;
      }
      this.token('IDENTIFIER', 'RegExp', 0, 0);
      this.token('CALL_START', '(', 0, 0);
      tokens = [];
      _ref2 = this.interpolateString(body, {
        regex: true
      });
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        token = _ref2[_i];
        tag = token[0], value = token[1];
        if (tag === 'TOKENS') {
          tokens.push.apply(tokens, value);
        } else if (tag === 'NEOSTRING') {
          if (!(value = value.replace(HEREGEX_OMIT, '$1$2'))) {
            continue;
          }
          value = value.replace(/\\/g, '\\\\');
          token[0] = 'STRING';
          token[1] = this.makeString(value, '"', true);
          tokens.push(token);
        } else {
          this.error("Unexpected " + tag);
        }
        prev = last(this.tokens);
        plusToken = ['+', '+'];
        plusToken[2] = prev[2];
        tokens.push(plusToken);
      }
      tokens.pop();
      if (((_ref3 = tokens[0]) != null ? _ref3[0] : void 0) !== 'STRING') {
        this.token('STRING', '""', 0, 0);
        this.token('+', '+', 0, 0);
      }
      (_ref4 = this.tokens).push.apply(_ref4, tokens);
      if (flags) {
        flagsOffset = heregex.lastIndexOf(flags);
        this.token(',', ',', flagsOffset, 0);
        this.token('STRING', '"' + flags + '"', flagsOffset, flags.length);
      }
      this.token(')', ')', heregex.length - 1, 0);
      return heregex.length;
    };

    Lexer.prototype.lineToken = function() {
      var diff, indent, match, noNewlines, size;
      if (!(match = MULTI_DENT.exec(this.chunk))) {
        return 0;
      }
      indent = match[0];
      this.seenFor = false;
      size = indent.length - 1 - indent.lastIndexOf('\n');
      noNewlines = this.unfinished();
      if (size - this.indebt === this.indent) {
        if (noNewlines) {
          this.suppressNewlines();
        } else {
          this.newlineToken(0);
        }
        return indent.length;
      }
      if (size > this.indent) {
        if (noNewlines) {
          this.indebt = size - this.indent;
          this.suppressNewlines();
          return indent.length;
        }
        if (!this.tokens.length) {
          this.baseIndent = this.indent = size;
          return indent.length;
        }
        diff = size - this.indent + this.outdebt;
        this.token('INDENT', diff, indent.length - size, size);
        this.indents.push(diff);
        this.ends.push('OUTDENT');
        this.outdebt = this.indebt = 0;
        this.indent = size;
      } else if (size < this.baseIndent) {
        this.error('missing indentation', indent.length);
      } else {
        this.indebt = 0;
        this.outdentToken(this.indent - size, noNewlines, indent.length);
      }
      return indent.length;
    };

    Lexer.prototype.outdentToken = function(moveOut, noNewlines, outdentLength) {
      var decreasedIndent, dent, lastIndent, _ref2;
      decreasedIndent = this.indent - moveOut;
      while (moveOut > 0) {
        lastIndent = this.indents[this.indents.length - 1];
        if (!lastIndent) {
          moveOut = 0;
        } else if (lastIndent === this.outdebt) {
          moveOut -= this.outdebt;
          this.outdebt = 0;
        } else if (lastIndent < this.outdebt) {
          this.outdebt -= lastIndent;
          moveOut -= lastIndent;
        } else {
          dent = this.indents.pop() + this.outdebt;
          if (outdentLength && (_ref2 = this.chunk[outdentLength], __indexOf.call(INDENTABLE_CLOSERS, _ref2) >= 0)) {
            decreasedIndent -= dent - moveOut;
            moveOut = dent;
          }
          this.outdebt = 0;
          this.pair('OUTDENT');
          this.token('OUTDENT', moveOut, 0, outdentLength);
          moveOut -= dent;
        }
      }
      if (dent) {
        this.outdebt -= moveOut;
      }
      while (this.value() === ';') {
        this.tokens.pop();
      }
      if (!(this.tag() === 'TERMINATOR' || noNewlines)) {
        this.token('TERMINATOR', '\n', outdentLength, 0);
      }
      this.indent = decreasedIndent;
      return this;
    };

    Lexer.prototype.whitespaceToken = function() {
      var match, nline, prev;
      if (!((match = WHITESPACE.exec(this.chunk)) || (nline = this.chunk.charAt(0) === '\n'))) {
        return 0;
      }
      prev = last(this.tokens);
      if (prev) {
        prev[match ? 'spaced' : 'newLine'] = true;
      }
      if (match) {
        return match[0].length;
      } else {
        return 0;
      }
    };

    Lexer.prototype.newlineToken = function(offset) {
      while (this.value() === ';') {
        this.tokens.pop();
      }
      if (this.tag() !== 'TERMINATOR') {
        this.token('TERMINATOR', '\n', offset, 0);
      }
      return this;
    };

    Lexer.prototype.suppressNewlines = function() {
      if (this.value() === '\\') {
        this.tokens.pop();
      }
      return this;
    };

    Lexer.prototype.literalToken = function() {
      var match, prev, tag, value, _ref2, _ref3, _ref4, _ref5;
      if (match = OPERATOR.exec(this.chunk)) {
        value = match[0];
        if (CODE.test(value)) {
          this.tagParameters();
        }
      } else {
        value = this.chunk.charAt(0);
      }
      tag = value;
      prev = last(this.tokens);
      if (value === '=' && prev) {
        if (!prev[1].reserved && (_ref2 = prev[1], __indexOf.call(JS_FORBIDDEN, _ref2) >= 0)) {
          this.error("reserved word \"" + (this.value()) + "\" can't be assigned");
        }
        if ((_ref3 = prev[1]) === '||' || _ref3 === '&&') {
          prev[0] = 'COMPOUND_ASSIGN';
          prev[1] += '=';
          return value.length;
        }
      }
      if (value === ';') {
        this.seenFor = false;
        tag = 'TERMINATOR';
      } else if (__indexOf.call(MATH, value) >= 0) {
        tag = 'MATH';
      } else if (__indexOf.call(COMPARE, value) >= 0) {
        tag = 'COMPARE';
      } else if (__indexOf.call(COMPOUND_ASSIGN, value) >= 0) {
        tag = 'COMPOUND_ASSIGN';
      } else if (__indexOf.call(UNARY, value) >= 0) {
        tag = 'UNARY';
      } else if (__indexOf.call(UNARY_MATH, value) >= 0) {
        tag = 'UNARY_MATH';
      } else if (__indexOf.call(SHIFT, value) >= 0) {
        tag = 'SHIFT';
      } else if (__indexOf.call(LOGIC, value) >= 0 || value === '?' && (prev != null ? prev.spaced : void 0)) {
        tag = 'LOGIC';
      } else if (prev && !prev.spaced) {
        if (value === '(' && (_ref4 = prev[0], __indexOf.call(CALLABLE, _ref4) >= 0)) {
          if (prev[0] === '?') {
            prev[0] = 'FUNC_EXIST';
          }
          tag = 'CALL_START';
        } else if (value === '[' && (_ref5 = prev[0], __indexOf.call(INDEXABLE, _ref5) >= 0)) {
          tag = 'INDEX_START';
          switch (prev[0]) {
            case '?':
              prev[0] = 'INDEX_SOAK';
          }
        }
      }
      switch (value) {
        case '(':
        case '{':
        case '[':
          this.ends.push(INVERSES[value]);
          break;
        case ')':
        case '}':
        case ']':
          this.pair(value);
      }
      this.token(tag, value);
      return value.length;
    };

    Lexer.prototype.sanitizeHeredoc = function(doc, options) {
      var attempt, herecomment, indent, match, _ref2;
      indent = options.indent, herecomment = options.herecomment;
      if (herecomment) {
        if (HEREDOC_ILLEGAL.test(doc)) {
          this.error("block comment cannot contain \"*/\", starting");
        }
        if (doc.indexOf('\n') < 0) {
          return doc;
        }
      } else {
        while (match = HEREDOC_INDENT.exec(doc)) {
          attempt = match[1];
          if (indent === null || (0 < (_ref2 = attempt.length) && _ref2 < indent.length)) {
            indent = attempt;
          }
        }
      }
      if (indent) {
        doc = doc.replace(RegExp("\\n" + indent, "g"), '\n');
      }
      if (!herecomment) {
        doc = doc.replace(/^\n/, '');
      }
      return doc;
    };

    Lexer.prototype.tagParameters = function() {
      var i, stack, tok, tokens;
      if (this.tag() !== ')') {
        return this;
      }
      stack = [];
      tokens = this.tokens;
      i = tokens.length;
      tokens[--i][0] = 'PARAM_END';
      while (tok = tokens[--i]) {
        switch (tok[0]) {
          case ')':
            stack.push(tok);
            break;
          case '(':
          case 'CALL_START':
            if (stack.length) {
              stack.pop();
            } else if (tok[0] === '(') {
              tok[0] = 'PARAM_START';
              return this;
            } else {
              return this;
            }
        }
      }
      return this;
    };

    Lexer.prototype.closeIndentation = function() {
      return this.outdentToken(this.indent);
    };

    Lexer.prototype.balancedString = function(str, end) {
      var continueCount, i, letter, match, prev, stack, _i, _ref2;
      continueCount = 0;
      stack = [end];
      for (i = _i = 1, _ref2 = str.length; 1 <= _ref2 ? _i < _ref2 : _i > _ref2; i = 1 <= _ref2 ? ++_i : --_i) {
        if (continueCount) {
          --continueCount;
          continue;
        }
        switch (letter = str.charAt(i)) {
          case '\\':
            ++continueCount;
            continue;
          case end:
            stack.pop();
            if (!stack.length) {
              return str.slice(0, +i + 1 || 9e9);
            }
            end = stack[stack.length - 1];
            continue;
        }
        if (end === '}' && (letter === '"' || letter === "'")) {
          stack.push(end = letter);
        } else if (end === '}' && letter === '/' && (match = HEREGEX.exec(str.slice(i)) || REGEX.exec(str.slice(i)))) {
          continueCount += match[0].length - 1;
        } else if (end === '}' && letter === '{') {
          stack.push(end = '}');
        } else if (end === '"' && prev === '#' && letter === '{') {
          stack.push(end = '}');
        }
        prev = letter;
      }
      return this.error("missing " + (stack.pop()) + ", starting");
    };

    Lexer.prototype.interpolateString = function(str, options) {
      var column, errorToken, expr, heredoc, i, inner, interpolated, len, letter, lexedLength, line, locationToken, nested, offsetInChunk, pi, plusToken, popped, regex, rparen, strOffset, tag, token, tokens, value, _i, _len, _ref2, _ref3, _ref4;
      if (options == null) {
        options = {};
      }
      heredoc = options.heredoc, regex = options.regex, offsetInChunk = options.offsetInChunk, strOffset = options.strOffset, lexedLength = options.lexedLength;
      offsetInChunk || (offsetInChunk = 0);
      strOffset || (strOffset = 0);
      lexedLength || (lexedLength = str.length);
      tokens = [];
      pi = 0;
      i = -1;
      while (letter = str.charAt(i += 1)) {
        if (letter === '\\') {
          i += 1;
          continue;
        }
        if (!(letter === '#' && str.charAt(i + 1) === '{' && (expr = this.balancedString(str.slice(i + 1), '}')))) {
          continue;
        }
        if (pi < i) {
          tokens.push(this.makeToken('NEOSTRING', str.slice(pi, i), strOffset + pi));
        }
        if (!errorToken) {
          errorToken = this.makeToken('', 'string interpolation', offsetInChunk + i + 1, 2);
        }
        inner = expr.slice(1, -1);
        if (inner.length) {
          _ref2 = this.getLineAndColumnFromChunk(strOffset + i + 1), line = _ref2[0], column = _ref2[1];
          nested = new Lexer().tokenize(inner, {
            line: line,
            column: column,
            rewrite: false
          });
          popped = nested.pop();
          if (((_ref3 = nested[0]) != null ? _ref3[0] : void 0) === 'TERMINATOR') {
            popped = nested.shift();
          }
          if (len = nested.length) {
            if (len > 1) {
              nested.unshift(this.makeToken('(', '(', strOffset + i + 1, 0));
              nested.push(this.makeToken(')', ')', strOffset + i + 1 + inner.length, 0));
            }
            tokens.push(['TOKENS', nested]);
          }
        }
        i += expr.length;
        pi = i + 1;
      }
      if ((i > pi && pi < str.length)) {
        tokens.push(this.makeToken('NEOSTRING', str.slice(pi), strOffset + pi));
      }
      if (regex) {
        return tokens;
      }
      if (!tokens.length) {
        return this.token('STRING', '""', offsetInChunk, lexedLength);
      }
      if (tokens[0][0] !== 'NEOSTRING') {
        tokens.unshift(this.makeToken('NEOSTRING', '', offsetInChunk));
      }
      if (interpolated = tokens.length > 1) {
        this.token('(', '(', offsetInChunk, 0, errorToken);
      }
      for (i = _i = 0, _len = tokens.length; _i < _len; i = ++_i) {
        token = tokens[i];
        tag = token[0], value = token[1];
        if (i) {
          if (i) {
            plusToken = this.token('+', '+');
          }
          locationToken = tag === 'TOKENS' ? value[0] : token;
          plusToken[2] = {
            first_line: locationToken[2].first_line,
            first_column: locationToken[2].first_column,
            last_line: locationToken[2].first_line,
            last_column: locationToken[2].first_column
          };
        }
        if (tag === 'TOKENS') {
          (_ref4 = this.tokens).push.apply(_ref4, value);
        } else if (tag === 'NEOSTRING') {
          token[0] = 'STRING';
          token[1] = this.makeString(value, '"', heredoc);
          this.tokens.push(token);
        } else {
          this.error("Unexpected " + tag);
        }
      }
      if (interpolated) {
        rparen = this.makeToken(')', ')', offsetInChunk + lexedLength, 0);
        rparen.stringEnd = true;
        this.tokens.push(rparen);
      }
      return tokens;
    };

    Lexer.prototype.pair = function(tag) {
      var wanted;
      if (tag !== (wanted = last(this.ends))) {
        if ('OUTDENT' !== wanted) {
          this.error("unmatched " + tag);
        }
        this.outdentToken(last(this.indents), true);
        return this.pair(tag);
      }
      return this.ends.pop();
    };

    Lexer.prototype.getLineAndColumnFromChunk = function(offset) {
      var column, lineCount, lines, string;
      if (offset === 0) {
        return [this.chunkLine, this.chunkColumn];
      }
      if (offset >= this.chunk.length) {
        string = this.chunk;
      } else {
        string = this.chunk.slice(0, +(offset - 1) + 1 || 9e9);
      }
      lineCount = count(string, '\n');
      column = this.chunkColumn;
      if (lineCount > 0) {
        lines = string.split('\n');
        column = last(lines).length;
      } else {
        column += string.length;
      }
      return [this.chunkLine + lineCount, column];
    };

    Lexer.prototype.makeToken = function(tag, value, offsetInChunk, length) {
      var lastCharacter, locationData, token, _ref2, _ref3;
      if (offsetInChunk == null) {
        offsetInChunk = 0;
      }
      if (length == null) {
        length = value.length;
      }
      locationData = {};
      _ref2 = this.getLineAndColumnFromChunk(offsetInChunk), locationData.first_line = _ref2[0], locationData.first_column = _ref2[1];
      lastCharacter = Math.max(0, length - 1);
      _ref3 = this.getLineAndColumnFromChunk(offsetInChunk + lastCharacter), locationData.last_line = _ref3[0], locationData.last_column = _ref3[1];
      token = [tag, value, locationData];
      return token;
    };

    Lexer.prototype.token = function(tag, value, offsetInChunk, length, origin) {
      var token;
      token = this.makeToken(tag, value, offsetInChunk, length);
      if (origin) {
        token.origin = origin;
      }
      this.tokens.push(token);
      return token;
    };

    Lexer.prototype.tag = function(index, tag) {
      var tok;
      return (tok = last(this.tokens, index)) && (tag ? tok[0] = tag : tok[0]);
    };

    Lexer.prototype.value = function(index, val) {
      var tok;
      return (tok = last(this.tokens, index)) && (val ? tok[1] = val : tok[1]);
    };

    Lexer.prototype.unfinished = function() {
      var _ref2;
      return LINE_CONTINUER.test(this.chunk) || ((_ref2 = this.tag()) === '\\' || _ref2 === '.' || _ref2 === '?.' || _ref2 === '?::' || _ref2 === 'UNARY' || _ref2 === 'MATH' || _ref2 === 'UNARY_MATH' || _ref2 === '+' || _ref2 === '-' || _ref2 === '**' || _ref2 === 'SHIFT' || _ref2 === 'RELATION' || _ref2 === 'COMPARE' || _ref2 === 'LOGIC' || _ref2 === 'THROW' || _ref2 === 'EXTENDS');
    };

    Lexer.prototype.removeNewlines = function(str) {
      return str.replace(/^\s*\n\s*/, '').replace(/([^\\]|\\\\)\s*\n\s*$/, '$1');
    };

    Lexer.prototype.escapeLines = function(str, heredoc) {
      str = str.replace(/\\[^\S\n]*(\n|\\)\s*/g, function(escaped, character) {
        if (character === '\n') {
          return '';
        } else {
          return escaped;
        }
      });
      if (heredoc) {
        return str.replace(MULTILINER, '\\n');
      } else {
        return str.replace(/\s*\n\s*/g, ' ');
      }
    };

    Lexer.prototype.makeString = function(body, quote, heredoc) {
      if (!body) {
        return quote + quote;
      }
      body = body.replace(RegExp("\\\\(" + quote + "|\\\\)", "g"), function(match, contents) {
        if (contents === quote) {
          return contents;
        } else {
          return match;
        }
      });
      body = body.replace(RegExp("" + quote, "g"), '\\$&');
      return quote + this.escapeLines(body, heredoc) + quote;
    };

    Lexer.prototype.error = function(message, offset) {
      var first_column, first_line, _ref2;
      if (offset == null) {
        offset = 0;
      }
      _ref2 = this.getLineAndColumnFromChunk(offset), first_line = _ref2[0], first_column = _ref2[1];
      return throwSyntaxError(message, {
        first_line: first_line,
        first_column: first_column
      });
    };

    return Lexer;

  })();

  JS_KEYWORDS = ['true', 'false', 'null', 'this', 'new', 'delete', 'typeof', 'in', 'instanceof', 'return', 'throw', 'break', 'continue', 'debugger', 'if', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally', 'class', 'extends', 'super'];

  COFFEE_KEYWORDS = ['undefined', 'then', 'unless', 'until', 'loop', 'of', 'by', 'when'];

  COFFEE_ALIAS_MAP = {
    and: '&&',
    or: '||',
    is: '==',
    isnt: '!=',
    not: '!',
    yes: 'true',
    no: 'false',
    on: 'true',
    off: 'false'
  };

  COFFEE_ALIASES = (function() {
    var _results;
    _results = [];
    for (key in COFFEE_ALIAS_MAP) {
      _results.push(key);
    }
    return _results;
  })();

  COFFEE_KEYWORDS = COFFEE_KEYWORDS.concat(COFFEE_ALIASES);

  RESERVED = ['case', 'default', 'function', 'var', 'void', 'with', 'const', 'let', 'enum', 'export', 'import', 'native', '__hasProp', '__extends', '__slice', '__bind', '__indexOf', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'static', 'yield'];

  STRICT_PROSCRIBED = ['arguments', 'eval'];

  JS_FORBIDDEN = JS_KEYWORDS.concat(RESERVED).concat(STRICT_PROSCRIBED);

  exports.RESERVED = RESERVED.concat(JS_KEYWORDS).concat(COFFEE_KEYWORDS).concat(STRICT_PROSCRIBED);

  exports.STRICT_PROSCRIBED = STRICT_PROSCRIBED;

  BOM = 65279;

  IDENTIFIER = /^([$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)([^\n\S]*:(?!:))?/;

  NUMBER = /^0b[01]+|^0o[0-7]+|^0x[\da-f]+|^\d*\.?\d+(?:e[+-]?\d+)?/i;

  HEREDOC = /^("""|''')((?:\\[\s\S]|[^\\])*?)(?:\n[^\n\S]*)?\1/;

  OPERATOR = /^(?:[-=]>|[-+*\/%<>&|^!?=]=|>>>=?|([-+:])\1|([&|<>*\/%])\2=?|\?(\.|::)|\.{2,3})/;

  WHITESPACE = /^[^\n\S]+/;

  COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|###$)|^(?:\s*#(?!##[^#]).*)+/;

  CODE = /^[-=]>/;

  MULTI_DENT = /^(?:\n[^\n\S]*)+/;

  SIMPLESTR = /^'[^\\']*(?:\\[\s\S][^\\']*)*'/;

  JSTOKEN = /^`[^\\`]*(?:\\.[^\\`]*)*`/;

  REGEX = /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/;

  HEREGEX = /^\/{3}((?:\\?[\s\S])+?)\/{3}([imgy]{0,4})(?!\w)/;

  HEREGEX_OMIT = /((?:\\\\)+)|\\(\s|\/)|\s+(?:#.*)?/g;

  MULTILINER = /\n/g;

  HEREDOC_INDENT = /\n+([^\n\S]*)/g;

  HEREDOC_ILLEGAL = /\*\//;

  LINE_CONTINUER = /^\s*(?:,|\??\.(?![.\d])|::)/;

  TRAILING_SPACES = /\s+$/;

  COMPOUND_ASSIGN = ['-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|=', '**=', '//=', '%%='];

  UNARY = ['NEW', 'TYPEOF', 'DELETE', 'DO'];

  UNARY_MATH = ['!', '~'];

  LOGIC = ['&&', '||', '&', '|', '^'];

  SHIFT = ['<<', '>>', '>>>'];

  COMPARE = ['==', '!=', '<', '>', '<=', '>='];

  MATH = ['*', '/', '%', '//', '%%'];

  RELATION = ['IN', 'OF', 'INSTANCEOF'];

  BOOL = ['TRUE', 'FALSE'];

  NOT_REGEX = ['NUMBER', 'REGEX', 'BOOL', 'NULL', 'UNDEFINED', '++', '--'];

  NOT_SPACED_REGEX = NOT_REGEX.concat(')', '}', 'THIS', 'IDENTIFIER', 'STRING', ']');

  CALLABLE = ['IDENTIFIER', 'STRING', 'REGEX', ')', ']', '}', '?', '::', '@', 'THIS', 'SUPER'];

  INDEXABLE = CALLABLE.concat('NUMBER', 'BOOL', 'NULL', 'UNDEFINED');

  LINE_BREAK = ['INDENT', 'OUTDENT', 'TERMINATOR'];

  INDENTABLE_CLOSERS = [')', '}', ']'];

}).call(this);

},{"./helpers":44,"./rewriter":49}],46:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var Access, Arr, Assign, Base, Block, Call, Class, Code, CodeFragment, Comment, Existence, Expansion, Extends, For, HEXNUM, IDENTIFIER, IDENTIFIER_STR, IS_REGEX, IS_STRING, If, In, Index, LEVEL_ACCESS, LEVEL_COND, LEVEL_LIST, LEVEL_OP, LEVEL_PAREN, LEVEL_TOP, Literal, METHOD_DEF, NEGATE, NO, NUMBER, Obj, Op, Param, Parens, RESERVED, Range, Return, SIMPLENUM, STRICT_PROSCRIBED, Scope, Slice, Splat, Switch, TAB, THIS, Throw, Try, UTILITIES, Value, While, YES, addLocationDataFn, compact, del, ends, extend, flatten, fragmentsToText, isLiteralArguments, isLiteralThis, last, locationDataToString, merge, multident, parseNum, some, starts, throwSyntaxError, unfoldSoak, utility, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  Error.stackTraceLimit = Infinity;

  Scope = require('./scope').Scope;

  _ref = require('./lexer'), RESERVED = _ref.RESERVED, STRICT_PROSCRIBED = _ref.STRICT_PROSCRIBED;

  _ref1 = require('./helpers'), compact = _ref1.compact, flatten = _ref1.flatten, extend = _ref1.extend, merge = _ref1.merge, del = _ref1.del, starts = _ref1.starts, ends = _ref1.ends, last = _ref1.last, some = _ref1.some, addLocationDataFn = _ref1.addLocationDataFn, locationDataToString = _ref1.locationDataToString, throwSyntaxError = _ref1.throwSyntaxError;

  exports.extend = extend;

  exports.addLocationDataFn = addLocationDataFn;

  YES = function() {
    return true;
  };

  NO = function() {
    return false;
  };

  THIS = function() {
    return this;
  };

  NEGATE = function() {
    this.negated = !this.negated;
    return this;
  };

  exports.CodeFragment = CodeFragment = (function() {
    function CodeFragment(parent, code) {
      var _ref2;
      this.code = "" + code;
      this.locationData = parent != null ? parent.locationData : void 0;
      this.type = (parent != null ? (_ref2 = parent.constructor) != null ? _ref2.name : void 0 : void 0) || 'unknown';
    }

    CodeFragment.prototype.toString = function() {
      return "" + this.code + (this.locationData ? ": " + locationDataToString(this.locationData) : '');
    };

    return CodeFragment;

  })();

  fragmentsToText = function(fragments) {
    var fragment;
    return ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = fragments.length; _i < _len; _i++) {
        fragment = fragments[_i];
        _results.push(fragment.code);
      }
      return _results;
    })()).join('');
  };

  exports.Base = Base = (function() {
    function Base() {}

    Base.prototype.compile = function(o, lvl) {
      return fragmentsToText(this.compileToFragments(o, lvl));
    };

    Base.prototype.compileToFragments = function(o, lvl) {
      var node;
      o = extend({}, o);
      if (lvl) {
        o.level = lvl;
      }
      node = this.unfoldSoak(o) || this;
      node.tab = o.indent;
      if (o.level === LEVEL_TOP || !node.isStatement(o)) {
        return node.compileNode(o);
      } else {
        return node.compileClosure(o);
      }
    };

    Base.prototype.compileClosure = function(o) {
      var args, argumentsNode, func, jumpNode, meth;
      if (jumpNode = this.jumps()) {
        jumpNode.error('cannot use a pure statement in an expression');
      }
      o.sharedScope = true;
      func = new Code([], Block.wrap([this]));
      args = [];
      if ((argumentsNode = this.contains(isLiteralArguments)) || this.contains(isLiteralThis)) {
        args = [new Literal('this')];
        if (argumentsNode) {
          meth = 'apply';
          args.push(new Literal('arguments'));
        } else {
          meth = 'call';
        }
        func = new Value(func, [new Access(new Literal(meth))]);
      }
      return (new Call(func, args)).compileNode(o);
    };

    Base.prototype.cache = function(o, level, reused) {
      var ref, sub;
      if (!this.isComplex()) {
        ref = level ? this.compileToFragments(o, level) : this;
        return [ref, ref];
      } else {
        ref = new Literal(reused || o.scope.freeVariable('ref'));
        sub = new Assign(ref, this);
        if (level) {
          return [sub.compileToFragments(o, level), [this.makeCode(ref.value)]];
        } else {
          return [sub, ref];
        }
      }
    };

    Base.prototype.cacheToCodeFragments = function(cacheValues) {
      return [fragmentsToText(cacheValues[0]), fragmentsToText(cacheValues[1])];
    };

    Base.prototype.makeReturn = function(res) {
      var me;
      me = this.unwrapAll();
      if (res) {
        return new Call(new Literal("" + res + ".push"), [me]);
      } else {
        return new Return(me);
      }
    };

    Base.prototype.contains = function(pred) {
      var node;
      node = void 0;
      this.traverseChildren(false, function(n) {
        if (pred(n)) {
          node = n;
          return false;
        }
      });
      return node;
    };

    Base.prototype.lastNonComment = function(list) {
      var i;
      i = list.length;
      while (i--) {
        if (!(list[i] instanceof Comment)) {
          return list[i];
        }
      }
      return null;
    };

    Base.prototype.toString = function(idt, name) {
      var tree;
      if (idt == null) {
        idt = '';
      }
      if (name == null) {
        name = this.constructor.name;
      }
      tree = '\n' + idt + name;
      if (this.soak) {
        tree += '?';
      }
      this.eachChild(function(node) {
        return tree += node.toString(idt + TAB);
      });
      return tree;
    };

    Base.prototype.eachChild = function(func) {
      var attr, child, _i, _j, _len, _len1, _ref2, _ref3;
      if (!this.children) {
        return this;
      }
      _ref2 = this.children;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        attr = _ref2[_i];
        if (this[attr]) {
          _ref3 = flatten([this[attr]]);
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            child = _ref3[_j];
            if (func(child) === false) {
              return this;
            }
          }
        }
      }
      return this;
    };

    Base.prototype.traverseChildren = function(crossScope, func) {
      return this.eachChild(function(child) {
        var recur;
        recur = func(child);
        if (recur !== false) {
          return child.traverseChildren(crossScope, func);
        }
      });
    };

    Base.prototype.invert = function() {
      return new Op('!', this);
    };

    Base.prototype.unwrapAll = function() {
      var node;
      node = this;
      while (node !== (node = node.unwrap())) {
        continue;
      }
      return node;
    };

    Base.prototype.children = [];

    Base.prototype.isStatement = NO;

    Base.prototype.jumps = NO;

    Base.prototype.isComplex = YES;

    Base.prototype.isChainable = NO;

    Base.prototype.isAssignable = NO;

    Base.prototype.unwrap = THIS;

    Base.prototype.unfoldSoak = NO;

    Base.prototype.assigns = NO;

    Base.prototype.updateLocationDataIfMissing = function(locationData) {
      if (this.locationData) {
        return this;
      }
      this.locationData = locationData;
      return this.eachChild(function(child) {
        return child.updateLocationDataIfMissing(locationData);
      });
    };

    Base.prototype.error = function(message) {
      return throwSyntaxError(message, this.locationData);
    };

    Base.prototype.makeCode = function(code) {
      return new CodeFragment(this, code);
    };

    Base.prototype.wrapInBraces = function(fragments) {
      return [].concat(this.makeCode('('), fragments, this.makeCode(')'));
    };

    Base.prototype.joinFragmentArrays = function(fragmentsList, joinStr) {
      var answer, fragments, i, _i, _len;
      answer = [];
      for (i = _i = 0, _len = fragmentsList.length; _i < _len; i = ++_i) {
        fragments = fragmentsList[i];
        if (i) {
          answer.push(this.makeCode(joinStr));
        }
        answer = answer.concat(fragments);
      }
      return answer;
    };

    return Base;

  })();

  exports.Block = Block = (function(_super) {
    __extends(Block, _super);

    function Block(nodes) {
      this.expressions = compact(flatten(nodes || []));
    }

    Block.prototype.children = ['expressions'];

    Block.prototype.push = function(node) {
      this.expressions.push(node);
      return this;
    };

    Block.prototype.pop = function() {
      return this.expressions.pop();
    };

    Block.prototype.unshift = function(node) {
      this.expressions.unshift(node);
      return this;
    };

    Block.prototype.unwrap = function() {
      if (this.expressions.length === 1) {
        return this.expressions[0];
      } else {
        return this;
      }
    };

    Block.prototype.isEmpty = function() {
      return !this.expressions.length;
    };

    Block.prototype.isStatement = function(o) {
      var exp, _i, _len, _ref2;
      _ref2 = this.expressions;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        exp = _ref2[_i];
        if (exp.isStatement(o)) {
          return true;
        }
      }
      return false;
    };

    Block.prototype.jumps = function(o) {
      var exp, jumpNode, _i, _len, _ref2;
      _ref2 = this.expressions;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        exp = _ref2[_i];
        if (jumpNode = exp.jumps(o)) {
          return jumpNode;
        }
      }
    };

    Block.prototype.makeReturn = function(res) {
      var expr, len;
      len = this.expressions.length;
      while (len--) {
        expr = this.expressions[len];
        if (!(expr instanceof Comment)) {
          this.expressions[len] = expr.makeReturn(res);
          if (expr instanceof Return && !expr.expression) {
            this.expressions.splice(len, 1);
          }
          break;
        }
      }
      return this;
    };

    Block.prototype.compileToFragments = function(o, level) {
      if (o == null) {
        o = {};
      }
      if (o.scope) {
        return Block.__super__.compileToFragments.call(this, o, level);
      } else {
        return this.compileRoot(o);
      }
    };

    Block.prototype.compileNode = function(o) {
      var answer, compiledNodes, fragments, index, node, top, _i, _len, _ref2;
      this.tab = o.indent;
      top = o.level === LEVEL_TOP;
      compiledNodes = [];
      _ref2 = this.expressions;
      for (index = _i = 0, _len = _ref2.length; _i < _len; index = ++_i) {
        node = _ref2[index];
        node = node.unwrapAll();
        node = node.unfoldSoak(o) || node;
        if (node instanceof Block) {
          compiledNodes.push(node.compileNode(o));
        } else if (top) {
          node.front = true;
          fragments = node.compileToFragments(o);
          if (!node.isStatement(o)) {
            fragments.unshift(this.makeCode("" + this.tab));
            fragments.push(this.makeCode(";"));
          }
          compiledNodes.push(fragments);
        } else {
          compiledNodes.push(node.compileToFragments(o, LEVEL_LIST));
        }
      }
      if (top) {
        if (this.spaced) {
          return [].concat(this.joinFragmentArrays(compiledNodes, '\n\n'), this.makeCode("\n"));
        } else {
          return this.joinFragmentArrays(compiledNodes, '\n');
        }
      }
      if (compiledNodes.length) {
        answer = this.joinFragmentArrays(compiledNodes, ', ');
      } else {
        answer = [this.makeCode("void 0")];
      }
      if (compiledNodes.length > 1 && o.level >= LEVEL_LIST) {
        return this.wrapInBraces(answer);
      } else {
        return answer;
      }
    };

    Block.prototype.compileRoot = function(o) {
      var exp, fragments, i, name, prelude, preludeExps, rest, _i, _len, _ref2;
      o.indent = o.bare ? '' : TAB;
      o.level = LEVEL_TOP;
      this.spaced = true;
      o.scope = new Scope(null, this, null);
      _ref2 = o.locals || [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        name = _ref2[_i];
        o.scope.parameter(name);
      }
      prelude = [];
      if (!o.bare) {
        preludeExps = (function() {
          var _j, _len1, _ref3, _results;
          _ref3 = this.expressions;
          _results = [];
          for (i = _j = 0, _len1 = _ref3.length; _j < _len1; i = ++_j) {
            exp = _ref3[i];
            if (!(exp.unwrap() instanceof Comment)) {
              break;
            }
            _results.push(exp);
          }
          return _results;
        }).call(this);
        rest = this.expressions.slice(preludeExps.length);
        this.expressions = preludeExps;
        if (preludeExps.length) {
          prelude = this.compileNode(merge(o, {
            indent: ''
          }));
          prelude.push(this.makeCode("\n"));
        }
        this.expressions = rest;
      }
      fragments = this.compileWithDeclarations(o);
      if (o.bare) {
        return fragments;
      }
      return [].concat(prelude, this.makeCode("(function() {\n"), fragments, this.makeCode("\n}).call(this);\n"));
    };

    Block.prototype.compileWithDeclarations = function(o) {
      var assigns, declars, exp, fragments, i, post, rest, scope, spaced, _i, _len, _ref2, _ref3, _ref4;
      fragments = [];
      post = [];
      _ref2 = this.expressions;
      for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
        exp = _ref2[i];
        exp = exp.unwrap();
        if (!(exp instanceof Comment || exp instanceof Literal)) {
          break;
        }
      }
      o = merge(o, {
        level: LEVEL_TOP
      });
      if (i) {
        rest = this.expressions.splice(i, 9e9);
        _ref3 = [this.spaced, false], spaced = _ref3[0], this.spaced = _ref3[1];
        _ref4 = [this.compileNode(o), spaced], fragments = _ref4[0], this.spaced = _ref4[1];
        this.expressions = rest;
      }
      post = this.compileNode(o);
      scope = o.scope;
      if (scope.expressions === this) {
        declars = o.scope.hasDeclarations();
        assigns = scope.hasAssignments;
        if (declars || assigns) {
          if (i) {
            fragments.push(this.makeCode('\n'));
          }
          fragments.push(this.makeCode("" + this.tab + "var "));
          if (declars) {
            fragments.push(this.makeCode(scope.declaredVariables().join(', ')));
          }
          if (assigns) {
            if (declars) {
              fragments.push(this.makeCode(",\n" + (this.tab + TAB)));
            }
            fragments.push(this.makeCode(scope.assignedVariables().join(",\n" + (this.tab + TAB))));
          }
          fragments.push(this.makeCode(";\n" + (this.spaced ? '\n' : '')));
        } else if (fragments.length && post.length) {
          fragments.push(this.makeCode("\n"));
        }
      }
      return fragments.concat(post);
    };

    Block.wrap = function(nodes) {
      if (nodes.length === 1 && nodes[0] instanceof Block) {
        return nodes[0];
      }
      return new Block(nodes);
    };

    return Block;

  })(Base);

  exports.Literal = Literal = (function(_super) {
    __extends(Literal, _super);

    function Literal(value) {
      this.value = value;
    }

    Literal.prototype.makeReturn = function() {
      if (this.isStatement()) {
        return this;
      } else {
        return Literal.__super__.makeReturn.apply(this, arguments);
      }
    };

    Literal.prototype.isAssignable = function() {
      return IDENTIFIER.test(this.value);
    };

    Literal.prototype.isStatement = function() {
      var _ref2;
      return (_ref2 = this.value) === 'break' || _ref2 === 'continue' || _ref2 === 'debugger';
    };

    Literal.prototype.isComplex = NO;

    Literal.prototype.assigns = function(name) {
      return name === this.value;
    };

    Literal.prototype.jumps = function(o) {
      if (this.value === 'break' && !((o != null ? o.loop : void 0) || (o != null ? o.block : void 0))) {
        return this;
      }
      if (this.value === 'continue' && !(o != null ? o.loop : void 0)) {
        return this;
      }
    };

    Literal.prototype.compileNode = function(o) {
      var answer, code, _ref2;
      code = this.value === 'this' ? ((_ref2 = o.scope.method) != null ? _ref2.bound : void 0) ? o.scope.method.context : this.value : this.value.reserved ? "\"" + this.value + "\"" : this.value;
      answer = this.isStatement() ? "" + this.tab + code + ";" : code;
      return [this.makeCode(answer)];
    };

    Literal.prototype.toString = function() {
      return ' "' + this.value + '"';
    };

    return Literal;

  })(Base);

  exports.Undefined = (function(_super) {
    __extends(Undefined, _super);

    function Undefined() {
      return Undefined.__super__.constructor.apply(this, arguments);
    }

    Undefined.prototype.isAssignable = NO;

    Undefined.prototype.isComplex = NO;

    Undefined.prototype.compileNode = function(o) {
      return [this.makeCode(o.level >= LEVEL_ACCESS ? '(void 0)' : 'void 0')];
    };

    return Undefined;

  })(Base);

  exports.Null = (function(_super) {
    __extends(Null, _super);

    function Null() {
      return Null.__super__.constructor.apply(this, arguments);
    }

    Null.prototype.isAssignable = NO;

    Null.prototype.isComplex = NO;

    Null.prototype.compileNode = function() {
      return [this.makeCode("null")];
    };

    return Null;

  })(Base);

  exports.Bool = (function(_super) {
    __extends(Bool, _super);

    Bool.prototype.isAssignable = NO;

    Bool.prototype.isComplex = NO;

    Bool.prototype.compileNode = function() {
      return [this.makeCode(this.val)];
    };

    function Bool(val) {
      this.val = val;
    }

    return Bool;

  })(Base);

  exports.Return = Return = (function(_super) {
    __extends(Return, _super);

    function Return(expr) {
      if (expr && !expr.unwrap().isUndefined) {
        this.expression = expr;
      }
    }

    Return.prototype.children = ['expression'];

    Return.prototype.isStatement = YES;

    Return.prototype.makeReturn = THIS;

    Return.prototype.jumps = THIS;

    Return.prototype.compileToFragments = function(o, level) {
      var expr, _ref2;
      expr = (_ref2 = this.expression) != null ? _ref2.makeReturn() : void 0;
      if (expr && !(expr instanceof Return)) {
        return expr.compileToFragments(o, level);
      } else {
        return Return.__super__.compileToFragments.call(this, o, level);
      }
    };

    Return.prototype.compileNode = function(o) {
      var answer;
      answer = [];
      answer.push(this.makeCode(this.tab + ("return" + (this.expression ? " " : ""))));
      if (this.expression) {
        answer = answer.concat(this.expression.compileToFragments(o, LEVEL_PAREN));
      }
      answer.push(this.makeCode(";"));
      return answer;
    };

    return Return;

  })(Base);

  exports.Value = Value = (function(_super) {
    __extends(Value, _super);

    function Value(base, props, tag) {
      if (!props && base instanceof Value) {
        return base;
      }
      this.base = base;
      this.properties = props || [];
      if (tag) {
        this[tag] = true;
      }
      return this;
    }

    Value.prototype.children = ['base', 'properties'];

    Value.prototype.add = function(props) {
      this.properties = this.properties.concat(props);
      return this;
    };

    Value.prototype.hasProperties = function() {
      return !!this.properties.length;
    };

    Value.prototype.bareLiteral = function(type) {
      return !this.properties.length && this.base instanceof type;
    };

    Value.prototype.isArray = function() {
      return this.bareLiteral(Arr);
    };

    Value.prototype.isRange = function() {
      return this.bareLiteral(Range);
    };

    Value.prototype.isComplex = function() {
      return this.hasProperties() || this.base.isComplex();
    };

    Value.prototype.isAssignable = function() {
      return this.hasProperties() || this.base.isAssignable();
    };

    Value.prototype.isSimpleNumber = function() {
      return this.bareLiteral(Literal) && SIMPLENUM.test(this.base.value);
    };

    Value.prototype.isString = function() {
      return this.bareLiteral(Literal) && IS_STRING.test(this.base.value);
    };

    Value.prototype.isRegex = function() {
      return this.bareLiteral(Literal) && IS_REGEX.test(this.base.value);
    };

    Value.prototype.isAtomic = function() {
      var node, _i, _len, _ref2;
      _ref2 = this.properties.concat(this.base);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        node = _ref2[_i];
        if (node.soak || node instanceof Call) {
          return false;
        }
      }
      return true;
    };

    Value.prototype.isNotCallable = function() {
      return this.isSimpleNumber() || this.isString() || this.isRegex() || this.isArray() || this.isRange() || this.isSplice() || this.isObject();
    };

    Value.prototype.isStatement = function(o) {
      return !this.properties.length && this.base.isStatement(o);
    };

    Value.prototype.assigns = function(name) {
      return !this.properties.length && this.base.assigns(name);
    };

    Value.prototype.jumps = function(o) {
      return !this.properties.length && this.base.jumps(o);
    };

    Value.prototype.isObject = function(onlyGenerated) {
      if (this.properties.length) {
        return false;
      }
      return (this.base instanceof Obj) && (!onlyGenerated || this.base.generated);
    };

    Value.prototype.isSplice = function() {
      return last(this.properties) instanceof Slice;
    };

    Value.prototype.looksStatic = function(className) {
      var _ref2;
      return this.base.value === className && this.properties.length && ((_ref2 = this.properties[0].name) != null ? _ref2.value : void 0) !== 'prototype';
    };

    Value.prototype.unwrap = function() {
      if (this.properties.length) {
        return this;
      } else {
        return this.base;
      }
    };

    Value.prototype.cacheReference = function(o) {
      var base, bref, name, nref;
      name = last(this.properties);
      if (this.properties.length < 2 && !this.base.isComplex() && !(name != null ? name.isComplex() : void 0)) {
        return [this, this];
      }
      base = new Value(this.base, this.properties.slice(0, -1));
      if (base.isComplex()) {
        bref = new Literal(o.scope.freeVariable('base'));
        base = new Value(new Parens(new Assign(bref, base)));
      }
      if (!name) {
        return [base, bref];
      }
      if (name.isComplex()) {
        nref = new Literal(o.scope.freeVariable('name'));
        name = new Index(new Assign(nref, name.index));
        nref = new Index(nref);
      }
      return [base.add(name), new Value(bref || base.base, [nref || name])];
    };

    Value.prototype.compileNode = function(o) {
      var fragments, prop, props, _i, _len;
      this.base.front = this.front;
      props = this.properties;
      fragments = this.base.compileToFragments(o, (props.length ? LEVEL_ACCESS : null));
      if ((this.base instanceof Parens || props.length) && SIMPLENUM.test(fragmentsToText(fragments))) {
        fragments.push(this.makeCode('.'));
      }
      for (_i = 0, _len = props.length; _i < _len; _i++) {
        prop = props[_i];
        fragments.push.apply(fragments, prop.compileToFragments(o));
      }
      return fragments;
    };

    Value.prototype.unfoldSoak = function(o) {
      return this.unfoldedSoak != null ? this.unfoldedSoak : this.unfoldedSoak = (function(_this) {
        return function() {
          var fst, i, ifn, prop, ref, snd, _i, _len, _ref2, _ref3;
          if (ifn = _this.base.unfoldSoak(o)) {
            (_ref2 = ifn.body.properties).push.apply(_ref2, _this.properties);
            return ifn;
          }
          _ref3 = _this.properties;
          for (i = _i = 0, _len = _ref3.length; _i < _len; i = ++_i) {
            prop = _ref3[i];
            if (!prop.soak) {
              continue;
            }
            prop.soak = false;
            fst = new Value(_this.base, _this.properties.slice(0, i));
            snd = new Value(_this.base, _this.properties.slice(i));
            if (fst.isComplex()) {
              ref = new Literal(o.scope.freeVariable('ref'));
              fst = new Parens(new Assign(ref, fst));
              snd.base = ref;
            }
            return new If(new Existence(fst), snd, {
              soak: true
            });
          }
          return false;
        };
      })(this)();
    };

    return Value;

  })(Base);

  exports.Comment = Comment = (function(_super) {
    __extends(Comment, _super);

    function Comment(comment) {
      this.comment = comment;
    }

    Comment.prototype.isStatement = YES;

    Comment.prototype.makeReturn = THIS;

    Comment.prototype.compileNode = function(o, level) {
      var code, comment;
      comment = this.comment.replace(/^(\s*)#/gm, "$1 *");
      code = "/*" + (multident(comment, this.tab)) + (__indexOf.call(comment, '\n') >= 0 ? "\n" + this.tab : '') + " */";
      if ((level || o.level) === LEVEL_TOP) {
        code = o.indent + code;
      }
      return [this.makeCode("\n"), this.makeCode(code)];
    };

    return Comment;

  })(Base);

  exports.Call = Call = (function(_super) {
    __extends(Call, _super);

    function Call(variable, args, soak) {
      this.args = args != null ? args : [];
      this.soak = soak;
      this.isNew = false;
      this.isSuper = variable === 'super';
      this.variable = this.isSuper ? null : variable;
      if (variable instanceof Value && variable.isNotCallable()) {
        variable.error("literal is not a function");
      }
    }

    Call.prototype.children = ['variable', 'args'];

    Call.prototype.newInstance = function() {
      var base, _ref2;
      base = ((_ref2 = this.variable) != null ? _ref2.base : void 0) || this.variable;
      if (base instanceof Call && !base.isNew) {
        base.newInstance();
      } else {
        this.isNew = true;
      }
      return this;
    };

    Call.prototype.superReference = function(o) {
      var accesses, method;
      method = o.scope.namedMethod();
      if (method != null ? method.klass : void 0) {
        accesses = [new Access(new Literal('__super__'))];
        if (method["static"]) {
          accesses.push(new Access(new Literal('constructor')));
        }
        accesses.push(new Access(new Literal(method.name)));
        return (new Value(new Literal(method.klass), accesses)).compile(o);
      } else if (method != null ? method.ctor : void 0) {
        return "" + method.name + ".__super__.constructor";
      } else {
        return this.error('cannot call super outside of an instance method.');
      }
    };

    Call.prototype.superThis = function(o) {
      var method;
      method = o.scope.method;
      return (method && !method.klass && method.context) || "this";
    };

    Call.prototype.unfoldSoak = function(o) {
      var call, ifn, left, list, rite, _i, _len, _ref2, _ref3;
      if (this.soak) {
        if (this.variable) {
          if (ifn = unfoldSoak(o, this, 'variable')) {
            return ifn;
          }
          _ref2 = new Value(this.variable).cacheReference(o), left = _ref2[0], rite = _ref2[1];
        } else {
          left = new Literal(this.superReference(o));
          rite = new Value(left);
        }
        rite = new Call(rite, this.args);
        rite.isNew = this.isNew;
        left = new Literal("typeof " + (left.compile(o)) + " === \"function\"");
        return new If(left, new Value(rite), {
          soak: true
        });
      }
      call = this;
      list = [];
      while (true) {
        if (call.variable instanceof Call) {
          list.push(call);
          call = call.variable;
          continue;
        }
        if (!(call.variable instanceof Value)) {
          break;
        }
        list.push(call);
        if (!((call = call.variable.base) instanceof Call)) {
          break;
        }
      }
      _ref3 = list.reverse();
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        call = _ref3[_i];
        if (ifn) {
          if (call.variable instanceof Call) {
            call.variable = ifn;
          } else {
            call.variable.base = ifn;
          }
        }
        ifn = unfoldSoak(o, call, 'variable');
      }
      return ifn;
    };

    Call.prototype.compileNode = function(o) {
      var arg, argIndex, compiledArgs, compiledArray, fragments, preface, _i, _len, _ref2, _ref3;
      if ((_ref2 = this.variable) != null) {
        _ref2.front = this.front;
      }
      compiledArray = Splat.compileSplattedArray(o, this.args, true);
      if (compiledArray.length) {
        return this.compileSplat(o, compiledArray);
      }
      compiledArgs = [];
      _ref3 = this.args;
      for (argIndex = _i = 0, _len = _ref3.length; _i < _len; argIndex = ++_i) {
        arg = _ref3[argIndex];
        if (argIndex) {
          compiledArgs.push(this.makeCode(", "));
        }
        compiledArgs.push.apply(compiledArgs, arg.compileToFragments(o, LEVEL_LIST));
      }
      fragments = [];
      if (this.isSuper) {
        preface = this.superReference(o) + (".call(" + (this.superThis(o)));
        if (compiledArgs.length) {
          preface += ", ";
        }
        fragments.push(this.makeCode(preface));
      } else {
        if (this.isNew) {
          fragments.push(this.makeCode('new '));
        }
        fragments.push.apply(fragments, this.variable.compileToFragments(o, LEVEL_ACCESS));
        fragments.push(this.makeCode("("));
      }
      fragments.push.apply(fragments, compiledArgs);
      fragments.push(this.makeCode(")"));
      return fragments;
    };

    Call.prototype.compileSplat = function(o, splatArgs) {
      var answer, base, fun, idt, name, ref;
      if (this.isSuper) {
        return [].concat(this.makeCode("" + (this.superReference(o)) + ".apply(" + (this.superThis(o)) + ", "), splatArgs, this.makeCode(")"));
      }
      if (this.isNew) {
        idt = this.tab + TAB;
        return [].concat(this.makeCode("(function(func, args, ctor) {\n" + idt + "ctor.prototype = func.prototype;\n" + idt + "var child = new ctor, result = func.apply(child, args);\n" + idt + "return Object(result) === result ? result : child;\n" + this.tab + "})("), this.variable.compileToFragments(o, LEVEL_LIST), this.makeCode(", "), splatArgs, this.makeCode(", function(){})"));
      }
      answer = [];
      base = new Value(this.variable);
      if ((name = base.properties.pop()) && base.isComplex()) {
        ref = o.scope.freeVariable('ref');
        answer = answer.concat(this.makeCode("(" + ref + " = "), base.compileToFragments(o, LEVEL_LIST), this.makeCode(")"), name.compileToFragments(o));
      } else {
        fun = base.compileToFragments(o, LEVEL_ACCESS);
        if (SIMPLENUM.test(fragmentsToText(fun))) {
          fun = this.wrapInBraces(fun);
        }
        if (name) {
          ref = fragmentsToText(fun);
          fun.push.apply(fun, name.compileToFragments(o));
        } else {
          ref = 'null';
        }
        answer = answer.concat(fun);
      }
      return answer = answer.concat(this.makeCode(".apply(" + ref + ", "), splatArgs, this.makeCode(")"));
    };

    return Call;

  })(Base);

  exports.Extends = Extends = (function(_super) {
    __extends(Extends, _super);

    function Extends(child, parent) {
      this.child = child;
      this.parent = parent;
    }

    Extends.prototype.children = ['child', 'parent'];

    Extends.prototype.compileToFragments = function(o) {
      return new Call(new Value(new Literal(utility('extends'))), [this.child, this.parent]).compileToFragments(o);
    };

    return Extends;

  })(Base);

  exports.Access = Access = (function(_super) {
    __extends(Access, _super);

    function Access(name, tag) {
      this.name = name;
      this.name.asKey = true;
      this.soak = tag === 'soak';
    }

    Access.prototype.children = ['name'];

    Access.prototype.compileToFragments = function(o) {
      var name;
      name = this.name.compileToFragments(o);
      if (IDENTIFIER.test(fragmentsToText(name))) {
        name.unshift(this.makeCode("."));
      } else {
        name.unshift(this.makeCode("["));
        name.push(this.makeCode("]"));
      }
      return name;
    };

    Access.prototype.isComplex = NO;

    return Access;

  })(Base);

  exports.Index = Index = (function(_super) {
    __extends(Index, _super);

    function Index(index) {
      this.index = index;
    }

    Index.prototype.children = ['index'];

    Index.prototype.compileToFragments = function(o) {
      return [].concat(this.makeCode("["), this.index.compileToFragments(o, LEVEL_PAREN), this.makeCode("]"));
    };

    Index.prototype.isComplex = function() {
      return this.index.isComplex();
    };

    return Index;

  })(Base);

  exports.Range = Range = (function(_super) {
    __extends(Range, _super);

    Range.prototype.children = ['from', 'to'];

    function Range(from, to, tag) {
      this.from = from;
      this.to = to;
      this.exclusive = tag === 'exclusive';
      this.equals = this.exclusive ? '' : '=';
    }

    Range.prototype.compileVariables = function(o) {
      var step, _ref2, _ref3, _ref4, _ref5;
      o = merge(o, {
        top: true
      });
      _ref2 = this.cacheToCodeFragments(this.from.cache(o, LEVEL_LIST)), this.fromC = _ref2[0], this.fromVar = _ref2[1];
      _ref3 = this.cacheToCodeFragments(this.to.cache(o, LEVEL_LIST)), this.toC = _ref3[0], this.toVar = _ref3[1];
      if (step = del(o, 'step')) {
        _ref4 = this.cacheToCodeFragments(step.cache(o, LEVEL_LIST)), this.step = _ref4[0], this.stepVar = _ref4[1];
      }
      _ref5 = [this.fromVar.match(NUMBER), this.toVar.match(NUMBER)], this.fromNum = _ref5[0], this.toNum = _ref5[1];
      if (this.stepVar) {
        return this.stepNum = this.stepVar.match(NUMBER);
      }
    };

    Range.prototype.compileNode = function(o) {
      var cond, condPart, from, gt, idx, idxName, known, lt, namedIndex, stepPart, to, varPart, _ref2, _ref3;
      if (!this.fromVar) {
        this.compileVariables(o);
      }
      if (!o.index) {
        return this.compileArray(o);
      }
      known = this.fromNum && this.toNum;
      idx = del(o, 'index');
      idxName = del(o, 'name');
      namedIndex = idxName && idxName !== idx;
      varPart = "" + idx + " = " + this.fromC;
      if (this.toC !== this.toVar) {
        varPart += ", " + this.toC;
      }
      if (this.step !== this.stepVar) {
        varPart += ", " + this.step;
      }
      _ref2 = ["" + idx + " <" + this.equals, "" + idx + " >" + this.equals], lt = _ref2[0], gt = _ref2[1];
      condPart = this.stepNum ? parseNum(this.stepNum[0]) > 0 ? "" + lt + " " + this.toVar : "" + gt + " " + this.toVar : known ? ((_ref3 = [parseNum(this.fromNum[0]), parseNum(this.toNum[0])], from = _ref3[0], to = _ref3[1], _ref3), from <= to ? "" + lt + " " + to : "" + gt + " " + to) : (cond = this.stepVar ? "" + this.stepVar + " > 0" : "" + this.fromVar + " <= " + this.toVar, "" + cond + " ? " + lt + " " + this.toVar + " : " + gt + " " + this.toVar);
      stepPart = this.stepVar ? "" + idx + " += " + this.stepVar : known ? namedIndex ? from <= to ? "++" + idx : "--" + idx : from <= to ? "" + idx + "++" : "" + idx + "--" : namedIndex ? "" + cond + " ? ++" + idx + " : --" + idx : "" + cond + " ? " + idx + "++ : " + idx + "--";
      if (namedIndex) {
        varPart = "" + idxName + " = " + varPart;
      }
      if (namedIndex) {
        stepPart = "" + idxName + " = " + stepPart;
      }
      return [this.makeCode("" + varPart + "; " + condPart + "; " + stepPart)];
    };

    Range.prototype.compileArray = function(o) {
      var args, body, cond, hasArgs, i, idt, post, pre, range, result, vars, _i, _ref2, _ref3, _results;
      if (this.fromNum && this.toNum && Math.abs(this.fromNum - this.toNum) <= 20) {
        range = (function() {
          _results = [];
          for (var _i = _ref2 = +this.fromNum, _ref3 = +this.toNum; _ref2 <= _ref3 ? _i <= _ref3 : _i >= _ref3; _ref2 <= _ref3 ? _i++ : _i--){ _results.push(_i); }
          return _results;
        }).apply(this);
        if (this.exclusive) {
          range.pop();
        }
        return [this.makeCode("[" + (range.join(', ')) + "]")];
      }
      idt = this.tab + TAB;
      i = o.scope.freeVariable('i');
      result = o.scope.freeVariable('results');
      pre = "\n" + idt + result + " = [];";
      if (this.fromNum && this.toNum) {
        o.index = i;
        body = fragmentsToText(this.compileNode(o));
      } else {
        vars = ("" + i + " = " + this.fromC) + (this.toC !== this.toVar ? ", " + this.toC : '');
        cond = "" + this.fromVar + " <= " + this.toVar;
        body = "var " + vars + "; " + cond + " ? " + i + " <" + this.equals + " " + this.toVar + " : " + i + " >" + this.equals + " " + this.toVar + "; " + cond + " ? " + i + "++ : " + i + "--";
      }
      post = "{ " + result + ".push(" + i + "); }\n" + idt + "return " + result + ";\n" + o.indent;
      hasArgs = function(node) {
        return node != null ? node.contains(isLiteralArguments) : void 0;
      };
      if (hasArgs(this.from) || hasArgs(this.to)) {
        args = ', arguments';
      }
      return [this.makeCode("(function() {" + pre + "\n" + idt + "for (" + body + ")" + post + "}).apply(this" + (args != null ? args : '') + ")")];
    };

    return Range;

  })(Base);

  exports.Slice = Slice = (function(_super) {
    __extends(Slice, _super);

    Slice.prototype.children = ['range'];

    function Slice(range) {
      this.range = range;
      Slice.__super__.constructor.call(this);
    }

    Slice.prototype.compileNode = function(o) {
      var compiled, compiledText, from, fromCompiled, to, toStr, _ref2;
      _ref2 = this.range, to = _ref2.to, from = _ref2.from;
      fromCompiled = from && from.compileToFragments(o, LEVEL_PAREN) || [this.makeCode('0')];
      if (to) {
        compiled = to.compileToFragments(o, LEVEL_PAREN);
        compiledText = fragmentsToText(compiled);
        if (!(!this.range.exclusive && +compiledText === -1)) {
          toStr = ', ' + (this.range.exclusive ? compiledText : SIMPLENUM.test(compiledText) ? "" + (+compiledText + 1) : (compiled = to.compileToFragments(o, LEVEL_ACCESS), "+" + (fragmentsToText(compiled)) + " + 1 || 9e9"));
        }
      }
      return [this.makeCode(".slice(" + (fragmentsToText(fromCompiled)) + (toStr || '') + ")")];
    };

    return Slice;

  })(Base);

  exports.Obj = Obj = (function(_super) {
    __extends(Obj, _super);

    function Obj(props, generated) {
      this.generated = generated != null ? generated : false;
      this.objects = this.properties = props || [];
    }

    Obj.prototype.children = ['properties'];

    Obj.prototype.compileNode = function(o) {
      var answer, i, idt, indent, join, lastNoncom, node, prop, props, _i, _j, _len, _len1;
      props = this.properties;
      if (!props.length) {
        return [this.makeCode(this.front ? '({})' : '{}')];
      }
      if (this.generated) {
        for (_i = 0, _len = props.length; _i < _len; _i++) {
          node = props[_i];
          if (node instanceof Value) {
            node.error('cannot have an implicit value in an implicit object');
          }
        }
      }
      idt = o.indent += TAB;
      lastNoncom = this.lastNonComment(this.properties);
      answer = [];
      for (i = _j = 0, _len1 = props.length; _j < _len1; i = ++_j) {
        prop = props[i];
        join = i === props.length - 1 ? '' : prop === lastNoncom || prop instanceof Comment ? '\n' : ',\n';
        indent = prop instanceof Comment ? '' : idt;
        if (prop instanceof Assign && prop.variable instanceof Value && prop.variable.hasProperties()) {
          prop.variable.error('Invalid object key');
        }
        if (prop instanceof Value && prop["this"]) {
          prop = new Assign(prop.properties[0].name, prop, 'object');
        }
        if (!(prop instanceof Comment)) {
          if (!(prop instanceof Assign)) {
            prop = new Assign(prop, prop, 'object');
          }
          (prop.variable.base || prop.variable).asKey = true;
        }
        if (indent) {
          answer.push(this.makeCode(indent));
        }
        answer.push.apply(answer, prop.compileToFragments(o, LEVEL_TOP));
        if (join) {
          answer.push(this.makeCode(join));
        }
      }
      answer.unshift(this.makeCode("{" + (props.length && '\n')));
      answer.push(this.makeCode("" + (props.length && '\n' + this.tab) + "}"));
      if (this.front) {
        return this.wrapInBraces(answer);
      } else {
        return answer;
      }
    };

    Obj.prototype.assigns = function(name) {
      var prop, _i, _len, _ref2;
      _ref2 = this.properties;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        prop = _ref2[_i];
        if (prop.assigns(name)) {
          return true;
        }
      }
      return false;
    };

    return Obj;

  })(Base);

  exports.Arr = Arr = (function(_super) {
    __extends(Arr, _super);

    function Arr(objs) {
      this.objects = objs || [];
    }

    Arr.prototype.children = ['objects'];

    Arr.prototype.compileNode = function(o) {
      var answer, compiledObjs, fragments, index, obj, _i, _len;
      if (!this.objects.length) {
        return [this.makeCode('[]')];
      }
      o.indent += TAB;
      answer = Splat.compileSplattedArray(o, this.objects);
      if (answer.length) {
        return answer;
      }
      answer = [];
      compiledObjs = (function() {
        var _i, _len, _ref2, _results;
        _ref2 = this.objects;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          obj = _ref2[_i];
          _results.push(obj.compileToFragments(o, LEVEL_LIST));
        }
        return _results;
      }).call(this);
      for (index = _i = 0, _len = compiledObjs.length; _i < _len; index = ++_i) {
        fragments = compiledObjs[index];
        if (index) {
          answer.push(this.makeCode(", "));
        }
        answer.push.apply(answer, fragments);
      }
      if (fragmentsToText(answer).indexOf('\n') >= 0) {
        answer.unshift(this.makeCode("[\n" + o.indent));
        answer.push(this.makeCode("\n" + this.tab + "]"));
      } else {
        answer.unshift(this.makeCode("["));
        answer.push(this.makeCode("]"));
      }
      return answer;
    };

    Arr.prototype.assigns = function(name) {
      var obj, _i, _len, _ref2;
      _ref2 = this.objects;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        obj = _ref2[_i];
        if (obj.assigns(name)) {
          return true;
        }
      }
      return false;
    };

    return Arr;

  })(Base);

  exports.Class = Class = (function(_super) {
    __extends(Class, _super);

    function Class(variable, parent, body) {
      this.variable = variable;
      this.parent = parent;
      this.body = body != null ? body : new Block;
      this.boundFuncs = [];
      this.body.classBody = true;
    }

    Class.prototype.children = ['variable', 'parent', 'body'];

    Class.prototype.determineName = function() {
      var decl, tail;
      if (!this.variable) {
        return null;
      }
      decl = (tail = last(this.variable.properties)) ? tail instanceof Access && tail.name.value : this.variable.base.value;
      if (__indexOf.call(STRICT_PROSCRIBED, decl) >= 0) {
        this.variable.error("class variable name may not be " + decl);
      }
      return decl && (decl = IDENTIFIER.test(decl) && decl);
    };

    Class.prototype.setContext = function(name) {
      return this.body.traverseChildren(false, function(node) {
        if (node.classBody) {
          return false;
        }
        if (node instanceof Literal && node.value === 'this') {
          return node.value = name;
        } else if (node instanceof Code) {
          node.klass = name;
          if (node.bound) {
            return node.context = name;
          }
        }
      });
    };

    Class.prototype.addBoundFunctions = function(o) {
      var bvar, lhs, _i, _len, _ref2;
      _ref2 = this.boundFuncs;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        bvar = _ref2[_i];
        lhs = (new Value(new Literal("this"), [new Access(bvar)])).compile(o);
        this.ctor.body.unshift(new Literal("" + lhs + " = " + (utility('bind')) + "(" + lhs + ", this)"));
      }
    };

    Class.prototype.addProperties = function(node, name, o) {
      var assign, base, exprs, func, props;
      props = node.base.properties.slice(0);
      exprs = (function() {
        var _results;
        _results = [];
        while (assign = props.shift()) {
          if (assign instanceof Assign) {
            base = assign.variable.base;
            delete assign.context;
            func = assign.value;
            if (base.value === 'constructor') {
              if (this.ctor) {
                assign.error('cannot define more than one constructor in a class');
              }
              if (func.bound) {
                assign.error('cannot define a constructor as a bound function');
              }
              if (func instanceof Code) {
                assign = this.ctor = func;
              } else {
                this.externalCtor = o.classScope.freeVariable('class');
                assign = new Assign(new Literal(this.externalCtor), func);
              }
            } else {
              if (assign.variable["this"]) {
                func["static"] = true;
              } else {
                assign.variable = new Value(new Literal(name), [new Access(new Literal('prototype')), new Access(base)]);
                if (func instanceof Code && func.bound) {
                  this.boundFuncs.push(base);
                  func.bound = false;
                }
              }
            }
          }
          _results.push(assign);
        }
        return _results;
      }).call(this);
      return compact(exprs);
    };

    Class.prototype.walkBody = function(name, o) {
      return this.traverseChildren(false, (function(_this) {
        return function(child) {
          var cont, exps, i, node, _i, _len, _ref2;
          cont = true;
          if (child instanceof Class) {
            return false;
          }
          if (child instanceof Block) {
            _ref2 = exps = child.expressions;
            for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
              node = _ref2[i];
              if (node instanceof Assign && node.variable.looksStatic(name)) {
                node.value["static"] = true;
              } else if (node instanceof Value && node.isObject(true)) {
                cont = false;
                exps[i] = _this.addProperties(node, name, o);
              }
            }
            child.expressions = exps = flatten(exps);
          }
          return cont && !(child instanceof Class);
        };
      })(this));
    };

    Class.prototype.hoistDirectivePrologue = function() {
      var expressions, index, node;
      index = 0;
      expressions = this.body.expressions;
      while ((node = expressions[index]) && node instanceof Comment || node instanceof Value && node.isString()) {
        ++index;
      }
      return this.directives = expressions.splice(0, index);
    };

    Class.prototype.ensureConstructor = function(name) {
      if (!this.ctor) {
        this.ctor = new Code;
        if (this.externalCtor) {
          this.ctor.body.push(new Literal("" + this.externalCtor + ".apply(this, arguments)"));
        } else if (this.parent) {
          this.ctor.body.push(new Literal("" + name + ".__super__.constructor.apply(this, arguments)"));
        }
        this.ctor.body.makeReturn();
        this.body.expressions.unshift(this.ctor);
      }
      this.ctor.ctor = this.ctor.name = name;
      this.ctor.klass = null;
      return this.ctor.noReturn = true;
    };

    Class.prototype.compileNode = function(o) {
      var args, argumentsNode, func, jumpNode, klass, lname, name, superClass, _ref2;
      if (jumpNode = this.body.jumps()) {
        jumpNode.error('Class bodies cannot contain pure statements');
      }
      if (argumentsNode = this.body.contains(isLiteralArguments)) {
        argumentsNode.error("Class bodies shouldn't reference arguments");
      }
      name = this.determineName() || '_Class';
      if (name.reserved) {
        name = "_" + name;
      }
      lname = new Literal(name);
      func = new Code([], Block.wrap([this.body]));
      args = [];
      o.classScope = func.makeScope(o.scope);
      this.hoistDirectivePrologue();
      this.setContext(name);
      this.walkBody(name, o);
      this.ensureConstructor(name);
      this.addBoundFunctions(o);
      this.body.spaced = true;
      this.body.expressions.push(lname);
      if (this.parent) {
        superClass = new Literal(o.classScope.freeVariable('super', false));
        this.body.expressions.unshift(new Extends(lname, superClass));
        func.params.push(new Param(superClass));
        args.push(this.parent);
      }
      (_ref2 = this.body.expressions).unshift.apply(_ref2, this.directives);
      klass = new Parens(new Call(func, args));
      if (this.variable) {
        klass = new Assign(this.variable, klass);
      }
      return klass.compileToFragments(o);
    };

    return Class;

  })(Base);

  exports.Assign = Assign = (function(_super) {
    __extends(Assign, _super);

    function Assign(variable, value, context, options) {
      var forbidden, name, _ref2;
      this.variable = variable;
      this.value = value;
      this.context = context;
      this.param = options && options.param;
      this.subpattern = options && options.subpattern;
      forbidden = (_ref2 = (name = this.variable.unwrapAll().value), __indexOf.call(STRICT_PROSCRIBED, _ref2) >= 0);
      if (forbidden && this.context !== 'object') {
        this.variable.error("variable name may not be \"" + name + "\"");
      }
    }

    Assign.prototype.children = ['variable', 'value'];

    Assign.prototype.isStatement = function(o) {
      return (o != null ? o.level : void 0) === LEVEL_TOP && (this.context != null) && __indexOf.call(this.context, "?") >= 0;
    };

    Assign.prototype.assigns = function(name) {
      return this[this.context === 'object' ? 'value' : 'variable'].assigns(name);
    };

    Assign.prototype.unfoldSoak = function(o) {
      return unfoldSoak(o, this, 'variable');
    };

    Assign.prototype.compileNode = function(o) {
      var answer, compiledName, isValue, match, name, val, varBase, _ref2, _ref3, _ref4, _ref5;
      if (isValue = this.variable instanceof Value) {
        if (this.variable.isArray() || this.variable.isObject()) {
          return this.compilePatternMatch(o);
        }
        if (this.variable.isSplice()) {
          return this.compileSplice(o);
        }
        if ((_ref2 = this.context) === '||=' || _ref2 === '&&=' || _ref2 === '?=') {
          return this.compileConditional(o);
        }
        if ((_ref3 = this.context) === '**=' || _ref3 === '//=' || _ref3 === '%%=') {
          return this.compileSpecialMath(o);
        }
      }
      compiledName = this.variable.compileToFragments(o, LEVEL_LIST);
      name = fragmentsToText(compiledName);
      if (!this.context) {
        varBase = this.variable.unwrapAll();
        if (!varBase.isAssignable()) {
          this.variable.error("\"" + (this.variable.compile(o)) + "\" cannot be assigned");
        }
        if (!(typeof varBase.hasProperties === "function" ? varBase.hasProperties() : void 0)) {
          if (this.param) {
            o.scope.add(name, 'var');
          } else {
            o.scope.find(name);
          }
        }
      }
      if (this.value instanceof Code && (match = METHOD_DEF.exec(name))) {
        if (match[2]) {
          this.value.klass = match[1];
        }
        this.value.name = (_ref4 = (_ref5 = match[3]) != null ? _ref5 : match[4]) != null ? _ref4 : match[5];
      }
      val = this.value.compileToFragments(o, LEVEL_LIST);
      if (this.context === 'object') {
        return compiledName.concat(this.makeCode(": "), val);
      }
      answer = compiledName.concat(this.makeCode(" " + (this.context || '=') + " "), val);
      if (o.level <= LEVEL_LIST) {
        return answer;
      } else {
        return this.wrapInBraces(answer);
      }
    };

    Assign.prototype.compilePatternMatch = function(o) {
      var acc, assigns, code, expandedIdx, fragments, i, idx, isObject, ivar, name, obj, objects, olen, ref, rest, top, val, value, vvar, vvarText, _i, _len, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      top = o.level === LEVEL_TOP;
      value = this.value;
      objects = this.variable.base.objects;
      if (!(olen = objects.length)) {
        code = value.compileToFragments(o);
        if (o.level >= LEVEL_OP) {
          return this.wrapInBraces(code);
        } else {
          return code;
        }
      }
      isObject = this.variable.isObject();
      if (top && olen === 1 && !((obj = objects[0]) instanceof Splat)) {
        if (obj instanceof Assign) {
          _ref2 = obj, (_ref3 = _ref2.variable, idx = _ref3.base), obj = _ref2.value;
        } else {
          idx = isObject ? obj["this"] ? obj.properties[0].name : obj : new Literal(0);
        }
        acc = IDENTIFIER.test(idx.unwrap().value || 0);
        value = new Value(value);
        value.properties.push(new (acc ? Access : Index)(idx));
        if (_ref4 = obj.unwrap().value, __indexOf.call(RESERVED, _ref4) >= 0) {
          obj.error("assignment to a reserved word: " + (obj.compile(o)));
        }
        return new Assign(obj, value, null, {
          param: this.param
        }).compileToFragments(o, LEVEL_TOP);
      }
      vvar = value.compileToFragments(o, LEVEL_LIST);
      vvarText = fragmentsToText(vvar);
      assigns = [];
      expandedIdx = false;
      if (!IDENTIFIER.test(vvarText) || this.variable.assigns(vvarText)) {
        assigns.push([this.makeCode("" + (ref = o.scope.freeVariable('ref')) + " = ")].concat(__slice.call(vvar)));
        vvar = [this.makeCode(ref)];
        vvarText = ref;
      }
      for (i = _i = 0, _len = objects.length; _i < _len; i = ++_i) {
        obj = objects[i];
        idx = i;
        if (isObject) {
          if (obj instanceof Assign) {
            _ref5 = obj, (_ref6 = _ref5.variable, idx = _ref6.base), obj = _ref5.value;
          } else {
            if (obj.base instanceof Parens) {
              _ref7 = new Value(obj.unwrapAll()).cacheReference(o), obj = _ref7[0], idx = _ref7[1];
            } else {
              idx = obj["this"] ? obj.properties[0].name : obj;
            }
          }
        }
        if (!expandedIdx && obj instanceof Splat) {
          name = obj.name.unwrap().value;
          obj = obj.unwrap();
          val = "" + olen + " <= " + vvarText + ".length ? " + (utility('slice')) + ".call(" + vvarText + ", " + i;
          if (rest = olen - i - 1) {
            ivar = o.scope.freeVariable('i');
            val += ", " + ivar + " = " + vvarText + ".length - " + rest + ") : (" + ivar + " = " + i + ", [])";
          } else {
            val += ") : []";
          }
          val = new Literal(val);
          expandedIdx = "" + ivar + "++";
        } else if (!expandedIdx && obj instanceof Expansion) {
          if (rest = olen - i - 1) {
            if (rest === 1) {
              expandedIdx = "" + vvarText + ".length - 1";
            } else {
              ivar = o.scope.freeVariable('i');
              val = new Literal("" + ivar + " = " + vvarText + ".length - " + rest);
              expandedIdx = "" + ivar + "++";
              assigns.push(val.compileToFragments(o, LEVEL_LIST));
            }
          }
          continue;
        } else {
          name = obj.unwrap().value;
          if (obj instanceof Splat || obj instanceof Expansion) {
            obj.error("multiple splats/expansions are disallowed in an assignment");
          }
          if (typeof idx === 'number') {
            idx = new Literal(expandedIdx || idx);
            acc = false;
          } else {
            acc = isObject && IDENTIFIER.test(idx.unwrap().value || 0);
          }
          val = new Value(new Literal(vvarText), [new (acc ? Access : Index)(idx)]);
        }
        if ((name != null) && __indexOf.call(RESERVED, name) >= 0) {
          obj.error("assignment to a reserved word: " + (obj.compile(o)));
        }
        assigns.push(new Assign(obj, val, null, {
          param: this.param,
          subpattern: true
        }).compileToFragments(o, LEVEL_LIST));
      }
      if (!(top || this.subpattern)) {
        assigns.push(vvar);
      }
      fragments = this.joinFragmentArrays(assigns, ', ');
      if (o.level < LEVEL_LIST) {
        return fragments;
      } else {
        return this.wrapInBraces(fragments);
      }
    };

    Assign.prototype.compileConditional = function(o) {
      var fragments, left, right, _ref2;
      _ref2 = this.variable.cacheReference(o), left = _ref2[0], right = _ref2[1];
      if (!left.properties.length && left.base instanceof Literal && left.base.value !== "this" && !o.scope.check(left.base.value)) {
        this.variable.error("the variable \"" + left.base.value + "\" can't be assigned with " + this.context + " because it has not been declared before");
      }
      if (__indexOf.call(this.context, "?") >= 0) {
        o.isExistentialEquals = true;
        return new If(new Existence(left), right, {
          type: 'if'
        }).addElse(new Assign(right, this.value, '=')).compileToFragments(o);
      } else {
        fragments = new Op(this.context.slice(0, -1), left, new Assign(right, this.value, '=')).compileToFragments(o);
        if (o.level <= LEVEL_LIST) {
          return fragments;
        } else {
          return this.wrapInBraces(fragments);
        }
      }
    };

    Assign.prototype.compileSpecialMath = function(o) {
      var left, right, _ref2;
      _ref2 = this.variable.cacheReference(o), left = _ref2[0], right = _ref2[1];
      return new Assign(left, new Op(this.context.slice(0, -1), right, this.value)).compileToFragments(o);
    };

    Assign.prototype.compileSplice = function(o) {
      var answer, exclusive, from, fromDecl, fromRef, name, to, valDef, valRef, _ref2, _ref3, _ref4;
      _ref2 = this.variable.properties.pop().range, from = _ref2.from, to = _ref2.to, exclusive = _ref2.exclusive;
      name = this.variable.compile(o);
      if (from) {
        _ref3 = this.cacheToCodeFragments(from.cache(o, LEVEL_OP)), fromDecl = _ref3[0], fromRef = _ref3[1];
      } else {
        fromDecl = fromRef = '0';
      }
      if (to) {
        if (from instanceof Value && from.isSimpleNumber() && to instanceof Value && to.isSimpleNumber()) {
          to = to.compile(o) - fromRef;
          if (!exclusive) {
            to += 1;
          }
        } else {
          to = to.compile(o, LEVEL_ACCESS) + ' - ' + fromRef;
          if (!exclusive) {
            to += ' + 1';
          }
        }
      } else {
        to = "9e9";
      }
      _ref4 = this.value.cache(o, LEVEL_LIST), valDef = _ref4[0], valRef = _ref4[1];
      answer = [].concat(this.makeCode("[].splice.apply(" + name + ", [" + fromDecl + ", " + to + "].concat("), valDef, this.makeCode(")), "), valRef);
      if (o.level > LEVEL_TOP) {
        return this.wrapInBraces(answer);
      } else {
        return answer;
      }
    };

    return Assign;

  })(Base);

  exports.Code = Code = (function(_super) {
    __extends(Code, _super);

    function Code(params, body, tag) {
      this.params = params || [];
      this.body = body || new Block;
      this.bound = tag === 'boundfunc';
    }

    Code.prototype.children = ['params', 'body'];

    Code.prototype.isStatement = function() {
      return !!this.ctor;
    };

    Code.prototype.jumps = NO;

    Code.prototype.makeScope = function(parentScope) {
      return new Scope(parentScope, this.body, this);
    };

    Code.prototype.compileNode = function(o) {
      var answer, boundfunc, code, exprs, i, lit, p, param, params, ref, splats, uniqs, val, wasEmpty, wrapper, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      if (this.bound && ((_ref2 = o.scope.method) != null ? _ref2.bound : void 0)) {
        this.context = o.scope.method.context;
      }
      if (this.bound && !this.context) {
        this.context = '_this';
        wrapper = new Code([new Param(new Literal(this.context))], new Block([this]));
        boundfunc = new Call(wrapper, [new Literal('this')]);
        boundfunc.updateLocationDataIfMissing(this.locationData);
        return boundfunc.compileNode(o);
      }
      o.scope = del(o, 'classScope') || this.makeScope(o.scope);
      o.scope.shared = del(o, 'sharedScope');
      o.indent += TAB;
      delete o.bare;
      delete o.isExistentialEquals;
      params = [];
      exprs = [];
      _ref3 = this.params;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        param = _ref3[_i];
        if (!(param instanceof Expansion)) {
          o.scope.parameter(param.asReference(o));
        }
      }
      _ref4 = this.params;
      for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
        param = _ref4[_j];
        if (!(param.splat || param instanceof Expansion)) {
          continue;
        }
        _ref5 = this.params;
        for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
          p = _ref5[_k].name;
          if (!(!(param instanceof Expansion))) {
            continue;
          }
          if (p["this"]) {
            p = p.properties[0].name;
          }
          if (p.value) {
            o.scope.add(p.value, 'var', true);
          }
        }
        splats = new Assign(new Value(new Arr((function() {
          var _l, _len3, _ref6, _results;
          _ref6 = this.params;
          _results = [];
          for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
            p = _ref6[_l];
            _results.push(p.asReference(o));
          }
          return _results;
        }).call(this))), new Value(new Literal('arguments')));
        break;
      }
      _ref6 = this.params;
      for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
        param = _ref6[_l];
        if (param.isComplex()) {
          val = ref = param.asReference(o);
          if (param.value) {
            val = new Op('?', ref, param.value);
          }
          exprs.push(new Assign(new Value(param.name), val, '=', {
            param: true
          }));
        } else {
          ref = param;
          if (param.value) {
            lit = new Literal(ref.name.value + ' == null');
            val = new Assign(new Value(param.name), param.value, '=');
            exprs.push(new If(lit, val));
          }
        }
        if (!splats) {
          params.push(ref);
        }
      }
      wasEmpty = this.body.isEmpty();
      if (splats) {
        exprs.unshift(splats);
      }
      if (exprs.length) {
        (_ref7 = this.body.expressions).unshift.apply(_ref7, exprs);
      }
      for (i = _m = 0, _len4 = params.length; _m < _len4; i = ++_m) {
        p = params[i];
        params[i] = p.compileToFragments(o);
        o.scope.parameter(fragmentsToText(params[i]));
      }
      uniqs = [];
      this.eachParamName(function(name, node) {
        if (__indexOf.call(uniqs, name) >= 0) {
          node.error("multiple parameters named '" + name + "'");
        }
        return uniqs.push(name);
      });
      if (!(wasEmpty || this.noReturn)) {
        this.body.makeReturn();
      }
      code = 'function';
      if (this.ctor) {
        code += ' ' + this.name;
      }
      code += '(';
      answer = [this.makeCode(code)];
      for (i = _n = 0, _len5 = params.length; _n < _len5; i = ++_n) {
        p = params[i];
        if (i) {
          answer.push(this.makeCode(", "));
        }
        answer.push.apply(answer, p);
      }
      answer.push(this.makeCode(') {'));
      if (!this.body.isEmpty()) {
        answer = answer.concat(this.makeCode("\n"), this.body.compileWithDeclarations(o), this.makeCode("\n" + this.tab));
      }
      answer.push(this.makeCode('}'));
      if (this.ctor) {
        return [this.makeCode(this.tab)].concat(__slice.call(answer));
      }
      if (this.front || (o.level >= LEVEL_ACCESS)) {
        return this.wrapInBraces(answer);
      } else {
        return answer;
      }
    };

    Code.prototype.eachParamName = function(iterator) {
      var param, _i, _len, _ref2, _results;
      _ref2 = this.params;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        param = _ref2[_i];
        _results.push(param.eachName(iterator));
      }
      return _results;
    };

    Code.prototype.traverseChildren = function(crossScope, func) {
      if (crossScope) {
        return Code.__super__.traverseChildren.call(this, crossScope, func);
      }
    };

    return Code;

  })(Base);

  exports.Param = Param = (function(_super) {
    __extends(Param, _super);

    function Param(name, value, splat) {
      var _ref2;
      this.name = name;
      this.value = value;
      this.splat = splat;
      if (_ref2 = (name = this.name.unwrapAll().value), __indexOf.call(STRICT_PROSCRIBED, _ref2) >= 0) {
        this.name.error("parameter name \"" + name + "\" is not allowed");
      }
    }

    Param.prototype.children = ['name', 'value'];

    Param.prototype.compileToFragments = function(o) {
      return this.name.compileToFragments(o, LEVEL_LIST);
    };

    Param.prototype.asReference = function(o) {
      var node;
      if (this.reference) {
        return this.reference;
      }
      node = this.name;
      if (node["this"]) {
        node = node.properties[0].name;
        if (node.value.reserved) {
          node = new Literal(o.scope.freeVariable(node.value));
        }
      } else if (node.isComplex()) {
        node = new Literal(o.scope.freeVariable('arg'));
      }
      node = new Value(node);
      if (this.splat) {
        node = new Splat(node);
      }
      node.updateLocationDataIfMissing(this.locationData);
      return this.reference = node;
    };

    Param.prototype.isComplex = function() {
      return this.name.isComplex();
    };

    Param.prototype.eachName = function(iterator, name) {
      var atParam, node, obj, _i, _len, _ref2;
      if (name == null) {
        name = this.name;
      }
      atParam = function(obj) {
        var node;
        node = obj.properties[0].name;
        if (!node.value.reserved) {
          return iterator(node.value, node);
        }
      };
      if (name instanceof Literal) {
        return iterator(name.value, name);
      }
      if (name instanceof Value) {
        return atParam(name);
      }
      _ref2 = name.objects;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        obj = _ref2[_i];
        if (obj instanceof Assign) {
          this.eachName(iterator, obj.value.unwrap());
        } else if (obj instanceof Splat) {
          node = obj.name.unwrap();
          iterator(node.value, node);
        } else if (obj instanceof Value) {
          if (obj.isArray() || obj.isObject()) {
            this.eachName(iterator, obj.base);
          } else if (obj["this"]) {
            atParam(obj);
          } else {
            iterator(obj.base.value, obj.base);
          }
        } else if (!(obj instanceof Expansion)) {
          obj.error("illegal parameter " + (obj.compile()));
        }
      }
    };

    return Param;

  })(Base);

  exports.Splat = Splat = (function(_super) {
    __extends(Splat, _super);

    Splat.prototype.children = ['name'];

    Splat.prototype.isAssignable = YES;

    function Splat(name) {
      this.name = name.compile ? name : new Literal(name);
    }

    Splat.prototype.assigns = function(name) {
      return this.name.assigns(name);
    };

    Splat.prototype.compileToFragments = function(o) {
      return this.name.compileToFragments(o);
    };

    Splat.prototype.unwrap = function() {
      return this.name;
    };

    Splat.compileSplattedArray = function(o, list, apply) {
      var args, base, compiledNode, concatPart, fragments, i, index, node, _i, _len;
      index = -1;
      while ((node = list[++index]) && !(node instanceof Splat)) {
        continue;
      }
      if (index >= list.length) {
        return [];
      }
      if (list.length === 1) {
        node = list[0];
        fragments = node.compileToFragments(o, LEVEL_LIST);
        if (apply) {
          return fragments;
        }
        return [].concat(node.makeCode("" + (utility('slice')) + ".call("), fragments, node.makeCode(")"));
      }
      args = list.slice(index);
      for (i = _i = 0, _len = args.length; _i < _len; i = ++_i) {
        node = args[i];
        compiledNode = node.compileToFragments(o, LEVEL_LIST);
        args[i] = node instanceof Splat ? [].concat(node.makeCode("" + (utility('slice')) + ".call("), compiledNode, node.makeCode(")")) : [].concat(node.makeCode("["), compiledNode, node.makeCode("]"));
      }
      if (index === 0) {
        node = list[0];
        concatPart = node.joinFragmentArrays(args.slice(1), ', ');
        return args[0].concat(node.makeCode(".concat("), concatPart, node.makeCode(")"));
      }
      base = (function() {
        var _j, _len1, _ref2, _results;
        _ref2 = list.slice(0, index);
        _results = [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          node = _ref2[_j];
          _results.push(node.compileToFragments(o, LEVEL_LIST));
        }
        return _results;
      })();
      base = list[0].joinFragmentArrays(base, ', ');
      concatPart = list[index].joinFragmentArrays(args, ', ');
      return [].concat(list[0].makeCode("["), base, list[index].makeCode("].concat("), concatPart, (last(list)).makeCode(")"));
    };

    return Splat;

  })(Base);

  exports.Expansion = Expansion = (function(_super) {
    __extends(Expansion, _super);

    function Expansion() {
      return Expansion.__super__.constructor.apply(this, arguments);
    }

    Expansion.prototype.isComplex = NO;

    Expansion.prototype.compileNode = function(o) {
      return this.error('Expansion must be used inside a destructuring assignment or parameter list');
    };

    Expansion.prototype.asReference = function(o) {
      return this;
    };

    Expansion.prototype.eachName = function(iterator) {};

    return Expansion;

  })(Base);

  exports.While = While = (function(_super) {
    __extends(While, _super);

    function While(condition, options) {
      this.condition = (options != null ? options.invert : void 0) ? condition.invert() : condition;
      this.guard = options != null ? options.guard : void 0;
    }

    While.prototype.children = ['condition', 'guard', 'body'];

    While.prototype.isStatement = YES;

    While.prototype.makeReturn = function(res) {
      if (res) {
        return While.__super__.makeReturn.apply(this, arguments);
      } else {
        this.returns = !this.jumps({
          loop: true
        });
        return this;
      }
    };

    While.prototype.addBody = function(body) {
      this.body = body;
      return this;
    };

    While.prototype.jumps = function() {
      var expressions, jumpNode, node, _i, _len;
      expressions = this.body.expressions;
      if (!expressions.length) {
        return false;
      }
      for (_i = 0, _len = expressions.length; _i < _len; _i++) {
        node = expressions[_i];
        if (jumpNode = node.jumps({
          loop: true
        })) {
          return jumpNode;
        }
      }
      return false;
    };

    While.prototype.compileNode = function(o) {
      var answer, body, rvar, set;
      o.indent += TAB;
      set = '';
      body = this.body;
      if (body.isEmpty()) {
        body = this.makeCode('');
      } else {
        if (this.returns) {
          body.makeReturn(rvar = o.scope.freeVariable('results'));
          set = "" + this.tab + rvar + " = [];\n";
        }
        if (this.guard) {
          if (body.expressions.length > 1) {
            body.expressions.unshift(new If((new Parens(this.guard)).invert(), new Literal("continue")));
          } else {
            if (this.guard) {
              body = Block.wrap([new If(this.guard, body)]);
            }
          }
        }
        body = [].concat(this.makeCode("\n"), body.compileToFragments(o, LEVEL_TOP), this.makeCode("\n" + this.tab));
      }
      answer = [].concat(this.makeCode(set + this.tab + "while ("), this.condition.compileToFragments(o, LEVEL_PAREN), this.makeCode(") {"), body, this.makeCode("}"));
      if (this.returns) {
        answer.push(this.makeCode("\n" + this.tab + "return " + rvar + ";"));
      }
      return answer;
    };

    return While;

  })(Base);

  exports.Op = Op = (function(_super) {
    var CONVERSIONS, INVERSIONS;

    __extends(Op, _super);

    function Op(op, first, second, flip) {
      if (op === 'in') {
        return new In(first, second);
      }
      if (op === 'do') {
        return this.generateDo(first);
      }
      if (op === 'new') {
        if (first instanceof Call && !first["do"] && !first.isNew) {
          return first.newInstance();
        }
        if (first instanceof Code && first.bound || first["do"]) {
          first = new Parens(first);
        }
      }
      this.operator = CONVERSIONS[op] || op;
      this.first = first;
      this.second = second;
      this.flip = !!flip;
      return this;
    }

    CONVERSIONS = {
      '==': '===',
      '!=': '!==',
      'of': 'in'
    };

    INVERSIONS = {
      '!==': '===',
      '===': '!=='
    };

    Op.prototype.children = ['first', 'second'];

    Op.prototype.isSimpleNumber = NO;

    Op.prototype.isUnary = function() {
      return !this.second;
    };

    Op.prototype.isComplex = function() {
      var _ref2;
      return !(this.isUnary() && ((_ref2 = this.operator) === '+' || _ref2 === '-')) || this.first.isComplex();
    };

    Op.prototype.isChainable = function() {
      var _ref2;
      return (_ref2 = this.operator) === '<' || _ref2 === '>' || _ref2 === '>=' || _ref2 === '<=' || _ref2 === '===' || _ref2 === '!==';
    };

    Op.prototype.invert = function() {
      var allInvertable, curr, fst, op, _ref2;
      if (this.isChainable() && this.first.isChainable()) {
        allInvertable = true;
        curr = this;
        while (curr && curr.operator) {
          allInvertable && (allInvertable = curr.operator in INVERSIONS);
          curr = curr.first;
        }
        if (!allInvertable) {
          return new Parens(this).invert();
        }
        curr = this;
        while (curr && curr.operator) {
          curr.invert = !curr.invert;
          curr.operator = INVERSIONS[curr.operator];
          curr = curr.first;
        }
        return this;
      } else if (op = INVERSIONS[this.operator]) {
        this.operator = op;
        if (this.first.unwrap() instanceof Op) {
          this.first.invert();
        }
        return this;
      } else if (this.second) {
        return new Parens(this).invert();
      } else if (this.operator === '!' && (fst = this.first.unwrap()) instanceof Op && ((_ref2 = fst.operator) === '!' || _ref2 === 'in' || _ref2 === 'instanceof')) {
        return fst;
      } else {
        return new Op('!', this);
      }
    };

    Op.prototype.unfoldSoak = function(o) {
      var _ref2;
      return ((_ref2 = this.operator) === '++' || _ref2 === '--' || _ref2 === 'delete') && unfoldSoak(o, this, 'first');
    };

    Op.prototype.generateDo = function(exp) {
      var call, func, param, passedParams, ref, _i, _len, _ref2;
      passedParams = [];
      func = exp instanceof Assign && (ref = exp.value.unwrap()) instanceof Code ? ref : exp;
      _ref2 = func.params || [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        param = _ref2[_i];
        if (param.value) {
          passedParams.push(param.value);
          delete param.value;
        } else {
          passedParams.push(param);
        }
      }
      call = new Call(exp, passedParams);
      call["do"] = true;
      return call;
    };

    Op.prototype.compileNode = function(o) {
      var answer, isChain, lhs, rhs, _ref2, _ref3;
      isChain = this.isChainable() && this.first.isChainable();
      if (!isChain) {
        this.first.front = this.front;
      }
      if (this.operator === 'delete' && o.scope.check(this.first.unwrapAll().value)) {
        this.error('delete operand may not be argument or var');
      }
      if (((_ref2 = this.operator) === '--' || _ref2 === '++') && (_ref3 = this.first.unwrapAll().value, __indexOf.call(STRICT_PROSCRIBED, _ref3) >= 0)) {
        this.error("cannot increment/decrement \"" + (this.first.unwrapAll().value) + "\"");
      }
      if (this.isUnary()) {
        return this.compileUnary(o);
      }
      if (isChain) {
        return this.compileChain(o);
      }
      switch (this.operator) {
        case '?':
          return this.compileExistence(o);
        case '**':
          return this.compilePower(o);
        case '//':
          return this.compileFloorDivision(o);
        case '%%':
          return this.compileModulo(o);
        default:
          lhs = this.first.compileToFragments(o, LEVEL_OP);
          rhs = this.second.compileToFragments(o, LEVEL_OP);
          answer = [].concat(lhs, this.makeCode(" " + this.operator + " "), rhs);
          if (o.level <= LEVEL_OP) {
            return answer;
          } else {
            return this.wrapInBraces(answer);
          }
      }
    };

    Op.prototype.compileChain = function(o) {
      var fragments, fst, shared, _ref2;
      _ref2 = this.first.second.cache(o), this.first.second = _ref2[0], shared = _ref2[1];
      fst = this.first.compileToFragments(o, LEVEL_OP);
      fragments = fst.concat(this.makeCode(" " + (this.invert ? '&&' : '||') + " "), shared.compileToFragments(o), this.makeCode(" " + this.operator + " "), this.second.compileToFragments(o, LEVEL_OP));
      return this.wrapInBraces(fragments);
    };

    Op.prototype.compileExistence = function(o) {
      var fst, ref;
      if (this.first.isComplex()) {
        ref = new Literal(o.scope.freeVariable('ref'));
        fst = new Parens(new Assign(ref, this.first));
      } else {
        fst = this.first;
        ref = fst;
      }
      return new If(new Existence(fst), ref, {
        type: 'if'
      }).addElse(this.second).compileToFragments(o);
    };

    Op.prototype.compileUnary = function(o) {
      var op, parts, plusMinus;
      parts = [];
      op = this.operator;
      parts.push([this.makeCode(op)]);
      if (op === '!' && this.first instanceof Existence) {
        this.first.negated = !this.first.negated;
        return this.first.compileToFragments(o);
      }
      if (o.level >= LEVEL_ACCESS) {
        return (new Parens(this)).compileToFragments(o);
      }
      plusMinus = op === '+' || op === '-';
      if ((op === 'new' || op === 'typeof' || op === 'delete') || plusMinus && this.first instanceof Op && this.first.operator === op) {
        parts.push([this.makeCode(' ')]);
      }
      if ((plusMinus && this.first instanceof Op) || (op === 'new' && this.first.isStatement(o))) {
        this.first = new Parens(this.first);
      }
      parts.push(this.first.compileToFragments(o, LEVEL_OP));
      if (this.flip) {
        parts.reverse();
      }
      return this.joinFragmentArrays(parts, '');
    };

    Op.prototype.compilePower = function(o) {
      var pow;
      pow = new Value(new Literal('Math'), [new Access(new Literal('pow'))]);
      return new Call(pow, [this.first, this.second]).compileToFragments(o);
    };

    Op.prototype.compileFloorDivision = function(o) {
      var div, floor;
      floor = new Value(new Literal('Math'), [new Access(new Literal('floor'))]);
      div = new Op('/', this.first, this.second);
      return new Call(floor, [div]).compileToFragments(o);
    };

    Op.prototype.compileModulo = function(o) {
      var mod;
      mod = new Value(new Literal(utility('modulo')));
      return new Call(mod, [this.first, this.second]).compileToFragments(o);
    };

    Op.prototype.toString = function(idt) {
      return Op.__super__.toString.call(this, idt, this.constructor.name + ' ' + this.operator);
    };

    return Op;

  })(Base);

  exports.In = In = (function(_super) {
    __extends(In, _super);

    function In(object, array) {
      this.object = object;
      this.array = array;
    }

    In.prototype.children = ['object', 'array'];

    In.prototype.invert = NEGATE;

    In.prototype.compileNode = function(o) {
      var hasSplat, obj, _i, _len, _ref2;
      if (this.array instanceof Value && this.array.isArray() && this.array.base.objects.length) {
        _ref2 = this.array.base.objects;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          obj = _ref2[_i];
          if (!(obj instanceof Splat)) {
            continue;
          }
          hasSplat = true;
          break;
        }
        if (!hasSplat) {
          return this.compileOrTest(o);
        }
      }
      return this.compileLoopTest(o);
    };

    In.prototype.compileOrTest = function(o) {
      var cmp, cnj, i, item, ref, sub, tests, _i, _len, _ref2, _ref3, _ref4;
      _ref2 = this.object.cache(o, LEVEL_OP), sub = _ref2[0], ref = _ref2[1];
      _ref3 = this.negated ? [' !== ', ' && '] : [' === ', ' || '], cmp = _ref3[0], cnj = _ref3[1];
      tests = [];
      _ref4 = this.array.base.objects;
      for (i = _i = 0, _len = _ref4.length; _i < _len; i = ++_i) {
        item = _ref4[i];
        if (i) {
          tests.push(this.makeCode(cnj));
        }
        tests = tests.concat((i ? ref : sub), this.makeCode(cmp), item.compileToFragments(o, LEVEL_ACCESS));
      }
      if (o.level < LEVEL_OP) {
        return tests;
      } else {
        return this.wrapInBraces(tests);
      }
    };

    In.prototype.compileLoopTest = function(o) {
      var fragments, ref, sub, _ref2;
      _ref2 = this.object.cache(o, LEVEL_LIST), sub = _ref2[0], ref = _ref2[1];
      fragments = [].concat(this.makeCode(utility('indexOf') + ".call("), this.array.compileToFragments(o, LEVEL_LIST), this.makeCode(", "), ref, this.makeCode(") " + (this.negated ? '< 0' : '>= 0')));
      if (fragmentsToText(sub) === fragmentsToText(ref)) {
        return fragments;
      }
      fragments = sub.concat(this.makeCode(', '), fragments);
      if (o.level < LEVEL_LIST) {
        return fragments;
      } else {
        return this.wrapInBraces(fragments);
      }
    };

    In.prototype.toString = function(idt) {
      return In.__super__.toString.call(this, idt, this.constructor.name + (this.negated ? '!' : ''));
    };

    return In;

  })(Base);

  exports.Try = Try = (function(_super) {
    __extends(Try, _super);

    function Try(attempt, errorVariable, recovery, ensure) {
      this.attempt = attempt;
      this.errorVariable = errorVariable;
      this.recovery = recovery;
      this.ensure = ensure;
    }

    Try.prototype.children = ['attempt', 'recovery', 'ensure'];

    Try.prototype.isStatement = YES;

    Try.prototype.jumps = function(o) {
      var _ref2;
      return this.attempt.jumps(o) || ((_ref2 = this.recovery) != null ? _ref2.jumps(o) : void 0);
    };

    Try.prototype.makeReturn = function(res) {
      if (this.attempt) {
        this.attempt = this.attempt.makeReturn(res);
      }
      if (this.recovery) {
        this.recovery = this.recovery.makeReturn(res);
      }
      return this;
    };

    Try.prototype.compileNode = function(o) {
      var catchPart, ensurePart, placeholder, tryPart;
      o.indent += TAB;
      tryPart = this.attempt.compileToFragments(o, LEVEL_TOP);
      catchPart = this.recovery ? (placeholder = new Literal('_error'), this.errorVariable ? this.recovery.unshift(new Assign(this.errorVariable, placeholder)) : void 0, [].concat(this.makeCode(" catch ("), placeholder.compileToFragments(o), this.makeCode(") {\n"), this.recovery.compileToFragments(o, LEVEL_TOP), this.makeCode("\n" + this.tab + "}"))) : !(this.ensure || this.recovery) ? [this.makeCode(' catch (_error) {}')] : [];
      ensurePart = this.ensure ? [].concat(this.makeCode(" finally {\n"), this.ensure.compileToFragments(o, LEVEL_TOP), this.makeCode("\n" + this.tab + "}")) : [];
      return [].concat(this.makeCode("" + this.tab + "try {\n"), tryPart, this.makeCode("\n" + this.tab + "}"), catchPart, ensurePart);
    };

    return Try;

  })(Base);

  exports.Throw = Throw = (function(_super) {
    __extends(Throw, _super);

    function Throw(expression) {
      this.expression = expression;
    }

    Throw.prototype.children = ['expression'];

    Throw.prototype.isStatement = YES;

    Throw.prototype.jumps = NO;

    Throw.prototype.makeReturn = THIS;

    Throw.prototype.compileNode = function(o) {
      return [].concat(this.makeCode(this.tab + "throw "), this.expression.compileToFragments(o), this.makeCode(";"));
    };

    return Throw;

  })(Base);

  exports.Existence = Existence = (function(_super) {
    __extends(Existence, _super);

    function Existence(expression) {
      this.expression = expression;
    }

    Existence.prototype.children = ['expression'];

    Existence.prototype.invert = NEGATE;

    Existence.prototype.compileNode = function(o) {
      var cmp, cnj, code, _ref2;
      this.expression.front = this.front;
      code = this.expression.compile(o, LEVEL_OP);
      if (IDENTIFIER.test(code) && !o.scope.check(code)) {
        _ref2 = this.negated ? ['===', '||'] : ['!==', '&&'], cmp = _ref2[0], cnj = _ref2[1];
        code = "typeof " + code + " " + cmp + " \"undefined\" " + cnj + " " + code + " " + cmp + " null";
      } else {
        code = "" + code + " " + (this.negated ? '==' : '!=') + " null";
      }
      return [this.makeCode(o.level <= LEVEL_COND ? code : "(" + code + ")")];
    };

    return Existence;

  })(Base);

  exports.Parens = Parens = (function(_super) {
    __extends(Parens, _super);

    function Parens(body) {
      this.body = body;
    }

    Parens.prototype.children = ['body'];

    Parens.prototype.unwrap = function() {
      return this.body;
    };

    Parens.prototype.isComplex = function() {
      return this.body.isComplex();
    };

    Parens.prototype.compileNode = function(o) {
      var bare, expr, fragments;
      expr = this.body.unwrap();
      if (expr instanceof Value && expr.isAtomic()) {
        expr.front = this.front;
        return expr.compileToFragments(o);
      }
      fragments = expr.compileToFragments(o, LEVEL_PAREN);
      bare = o.level < LEVEL_OP && (expr instanceof Op || expr instanceof Call || (expr instanceof For && expr.returns));
      if (bare) {
        return fragments;
      } else {
        return this.wrapInBraces(fragments);
      }
    };

    return Parens;

  })(Base);

  exports.For = For = (function(_super) {
    __extends(For, _super);

    function For(body, source) {
      var _ref2;
      this.source = source.source, this.guard = source.guard, this.step = source.step, this.name = source.name, this.index = source.index;
      this.body = Block.wrap([body]);
      this.own = !!source.own;
      this.object = !!source.object;
      if (this.object) {
        _ref2 = [this.index, this.name], this.name = _ref2[0], this.index = _ref2[1];
      }
      if (this.index instanceof Value) {
        this.index.error('index cannot be a pattern matching expression');
      }
      this.range = this.source instanceof Value && this.source.base instanceof Range && !this.source.properties.length;
      this.pattern = this.name instanceof Value;
      if (this.range && this.index) {
        this.index.error('indexes do not apply to range loops');
      }
      if (this.range && this.pattern) {
        this.name.error('cannot pattern match over range loops');
      }
      if (this.own && !this.object) {
        this.name.error('cannot use own with for-in');
      }
      this.returns = false;
    }

    For.prototype.children = ['body', 'source', 'guard', 'step'];

    For.prototype.compileNode = function(o) {
      var body, bodyFragments, compare, compareDown, declare, declareDown, defPart, defPartFragments, down, forPartFragments, guardPart, idt1, increment, index, ivar, kvar, kvarAssign, lastJumps, lvar, name, namePart, ref, resultPart, returnResult, rvar, scope, source, step, stepNum, stepVar, svar, varPart, _ref2, _ref3;
      body = Block.wrap([this.body]);
      lastJumps = (_ref2 = last(body.expressions)) != null ? _ref2.jumps() : void 0;
      if (lastJumps && lastJumps instanceof Return) {
        this.returns = false;
      }
      source = this.range ? this.source.base : this.source;
      scope = o.scope;
      if (!this.pattern) {
        name = this.name && (this.name.compile(o, LEVEL_LIST));
      }
      index = this.index && (this.index.compile(o, LEVEL_LIST));
      if (name && !this.pattern) {
        scope.find(name);
      }
      if (index) {
        scope.find(index);
      }
      if (this.returns) {
        rvar = scope.freeVariable('results');
      }
      ivar = (this.object && index) || scope.freeVariable('i');
      kvar = (this.range && name) || index || ivar;
      kvarAssign = kvar !== ivar ? "" + kvar + " = " : "";
      if (this.step && !this.range) {
        _ref3 = this.cacheToCodeFragments(this.step.cache(o, LEVEL_LIST)), step = _ref3[0], stepVar = _ref3[1];
        stepNum = stepVar.match(NUMBER);
      }
      if (this.pattern) {
        name = ivar;
      }
      varPart = '';
      guardPart = '';
      defPart = '';
      idt1 = this.tab + TAB;
      if (this.range) {
        forPartFragments = source.compileToFragments(merge(o, {
          index: ivar,
          name: name,
          step: this.step
        }));
      } else {
        svar = this.source.compile(o, LEVEL_LIST);
        if ((name || this.own) && !IDENTIFIER.test(svar)) {
          defPart += "" + this.tab + (ref = scope.freeVariable('ref')) + " = " + svar + ";\n";
          svar = ref;
        }
        if (name && !this.pattern) {
          namePart = "" + name + " = " + svar + "[" + kvar + "]";
        }
        if (!this.object) {
          if (step !== stepVar) {
            defPart += "" + this.tab + step + ";\n";
          }
          if (!(this.step && stepNum && (down = parseNum(stepNum[0]) < 0))) {
            lvar = scope.freeVariable('len');
          }
          declare = "" + kvarAssign + ivar + " = 0, " + lvar + " = " + svar + ".length";
          declareDown = "" + kvarAssign + ivar + " = " + svar + ".length - 1";
          compare = "" + ivar + " < " + lvar;
          compareDown = "" + ivar + " >= 0";
          if (this.step) {
            if (stepNum) {
              if (down) {
                compare = compareDown;
                declare = declareDown;
              }
            } else {
              compare = "" + stepVar + " > 0 ? " + compare + " : " + compareDown;
              declare = "(" + stepVar + " > 0 ? (" + declare + ") : " + declareDown + ")";
            }
            increment = "" + ivar + " += " + stepVar;
          } else {
            increment = "" + (kvar !== ivar ? "++" + ivar : "" + ivar + "++");
          }
          forPartFragments = [this.makeCode("" + declare + "; " + compare + "; " + kvarAssign + increment)];
        }
      }
      if (this.returns) {
        resultPart = "" + this.tab + rvar + " = [];\n";
        returnResult = "\n" + this.tab + "return " + rvar + ";";
        body.makeReturn(rvar);
      }
      if (this.guard) {
        if (body.expressions.length > 1) {
          body.expressions.unshift(new If((new Parens(this.guard)).invert(), new Literal("continue")));
        } else {
          if (this.guard) {
            body = Block.wrap([new If(this.guard, body)]);
          }
        }
      }
      if (this.pattern) {
        body.expressions.unshift(new Assign(this.name, new Literal("" + svar + "[" + kvar + "]")));
      }
      defPartFragments = [].concat(this.makeCode(defPart), this.pluckDirectCall(o, body));
      if (namePart) {
        varPart = "\n" + idt1 + namePart + ";";
      }
      if (this.object) {
        forPartFragments = [this.makeCode("" + kvar + " in " + svar)];
        if (this.own) {
          guardPart = "\n" + idt1 + "if (!" + (utility('hasProp')) + ".call(" + svar + ", " + kvar + ")) continue;";
        }
      }
      bodyFragments = body.compileToFragments(merge(o, {
        indent: idt1
      }), LEVEL_TOP);
      if (bodyFragments && (bodyFragments.length > 0)) {
        bodyFragments = [].concat(this.makeCode("\n"), bodyFragments, this.makeCode("\n"));
      }
      return [].concat(defPartFragments, this.makeCode("" + (resultPart || '') + this.tab + "for ("), forPartFragments, this.makeCode(") {" + guardPart + varPart), bodyFragments, this.makeCode("" + this.tab + "}" + (returnResult || '')));
    };

    For.prototype.pluckDirectCall = function(o, body) {
      var base, defs, expr, fn, idx, ref, val, _i, _len, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
      defs = [];
      _ref2 = body.expressions;
      for (idx = _i = 0, _len = _ref2.length; _i < _len; idx = ++_i) {
        expr = _ref2[idx];
        expr = expr.unwrapAll();
        if (!(expr instanceof Call)) {
          continue;
        }
        val = (_ref3 = expr.variable) != null ? _ref3.unwrapAll() : void 0;
        if (!((val instanceof Code) || (val instanceof Value && ((_ref4 = val.base) != null ? _ref4.unwrapAll() : void 0) instanceof Code && val.properties.length === 1 && ((_ref5 = (_ref6 = val.properties[0].name) != null ? _ref6.value : void 0) === 'call' || _ref5 === 'apply')))) {
          continue;
        }
        fn = ((_ref7 = val.base) != null ? _ref7.unwrapAll() : void 0) || val;
        ref = new Literal(o.scope.freeVariable('fn'));
        base = new Value(ref);
        if (val.base) {
          _ref8 = [base, val], val.base = _ref8[0], base = _ref8[1];
        }
        body.expressions[idx] = new Call(base, expr.args);
        defs = defs.concat(this.makeCode(this.tab), new Assign(ref, fn).compileToFragments(o, LEVEL_TOP), this.makeCode(';\n'));
      }
      return defs;
    };

    return For;

  })(While);

  exports.Switch = Switch = (function(_super) {
    __extends(Switch, _super);

    function Switch(subject, cases, otherwise) {
      this.subject = subject;
      this.cases = cases;
      this.otherwise = otherwise;
    }

    Switch.prototype.children = ['subject', 'cases', 'otherwise'];

    Switch.prototype.isStatement = YES;

    Switch.prototype.jumps = function(o) {
      var block, conds, jumpNode, _i, _len, _ref2, _ref3, _ref4;
      if (o == null) {
        o = {
          block: true
        };
      }
      _ref2 = this.cases;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        _ref3 = _ref2[_i], conds = _ref3[0], block = _ref3[1];
        if (jumpNode = block.jumps(o)) {
          return jumpNode;
        }
      }
      return (_ref4 = this.otherwise) != null ? _ref4.jumps(o) : void 0;
    };

    Switch.prototype.makeReturn = function(res) {
      var pair, _i, _len, _ref2, _ref3;
      _ref2 = this.cases;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        pair = _ref2[_i];
        pair[1].makeReturn(res);
      }
      if (res) {
        this.otherwise || (this.otherwise = new Block([new Literal('void 0')]));
      }
      if ((_ref3 = this.otherwise) != null) {
        _ref3.makeReturn(res);
      }
      return this;
    };

    Switch.prototype.compileNode = function(o) {
      var block, body, cond, conditions, expr, fragments, i, idt1, idt2, _i, _j, _len, _len1, _ref2, _ref3, _ref4;
      idt1 = o.indent + TAB;
      idt2 = o.indent = idt1 + TAB;
      fragments = [].concat(this.makeCode(this.tab + "switch ("), (this.subject ? this.subject.compileToFragments(o, LEVEL_PAREN) : this.makeCode("false")), this.makeCode(") {\n"));
      _ref2 = this.cases;
      for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
        _ref3 = _ref2[i], conditions = _ref3[0], block = _ref3[1];
        _ref4 = flatten([conditions]);
        for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
          cond = _ref4[_j];
          if (!this.subject) {
            cond = cond.invert();
          }
          fragments = fragments.concat(this.makeCode(idt1 + "case "), cond.compileToFragments(o, LEVEL_PAREN), this.makeCode(":\n"));
        }
        if ((body = block.compileToFragments(o, LEVEL_TOP)).length > 0) {
          fragments = fragments.concat(body, this.makeCode('\n'));
        }
        if (i === this.cases.length - 1 && !this.otherwise) {
          break;
        }
        expr = this.lastNonComment(block.expressions);
        if (expr instanceof Return || (expr instanceof Literal && expr.jumps() && expr.value !== 'debugger')) {
          continue;
        }
        fragments.push(cond.makeCode(idt2 + 'break;\n'));
      }
      if (this.otherwise && this.otherwise.expressions.length) {
        fragments.push.apply(fragments, [this.makeCode(idt1 + "default:\n")].concat(__slice.call(this.otherwise.compileToFragments(o, LEVEL_TOP)), [this.makeCode("\n")]));
      }
      fragments.push(this.makeCode(this.tab + '}'));
      return fragments;
    };

    return Switch;

  })(Base);

  exports.If = If = (function(_super) {
    __extends(If, _super);

    function If(condition, body, options) {
      this.body = body;
      if (options == null) {
        options = {};
      }
      this.condition = options.type === 'unless' ? condition.invert() : condition;
      this.elseBody = null;
      this.isChain = false;
      this.soak = options.soak;
    }

    If.prototype.children = ['condition', 'body', 'elseBody'];

    If.prototype.bodyNode = function() {
      var _ref2;
      return (_ref2 = this.body) != null ? _ref2.unwrap() : void 0;
    };

    If.prototype.elseBodyNode = function() {
      var _ref2;
      return (_ref2 = this.elseBody) != null ? _ref2.unwrap() : void 0;
    };

    If.prototype.addElse = function(elseBody) {
      if (this.isChain) {
        this.elseBodyNode().addElse(elseBody);
      } else {
        this.isChain = elseBody instanceof If;
        this.elseBody = this.ensureBlock(elseBody);
        this.elseBody.updateLocationDataIfMissing(elseBody.locationData);
      }
      return this;
    };

    If.prototype.isStatement = function(o) {
      var _ref2;
      return (o != null ? o.level : void 0) === LEVEL_TOP || this.bodyNode().isStatement(o) || ((_ref2 = this.elseBodyNode()) != null ? _ref2.isStatement(o) : void 0);
    };

    If.prototype.jumps = function(o) {
      var _ref2;
      return this.body.jumps(o) || ((_ref2 = this.elseBody) != null ? _ref2.jumps(o) : void 0);
    };

    If.prototype.compileNode = function(o) {
      if (this.isStatement(o)) {
        return this.compileStatement(o);
      } else {
        return this.compileExpression(o);
      }
    };

    If.prototype.makeReturn = function(res) {
      if (res) {
        this.elseBody || (this.elseBody = new Block([new Literal('void 0')]));
      }
      this.body && (this.body = new Block([this.body.makeReturn(res)]));
      this.elseBody && (this.elseBody = new Block([this.elseBody.makeReturn(res)]));
      return this;
    };

    If.prototype.ensureBlock = function(node) {
      if (node instanceof Block) {
        return node;
      } else {
        return new Block([node]);
      }
    };

    If.prototype.compileStatement = function(o) {
      var answer, body, child, cond, exeq, ifPart, indent;
      child = del(o, 'chainChild');
      exeq = del(o, 'isExistentialEquals');
      if (exeq) {
        return new If(this.condition.invert(), this.elseBodyNode(), {
          type: 'if'
        }).compileToFragments(o);
      }
      indent = o.indent + TAB;
      cond = this.condition.compileToFragments(o, LEVEL_PAREN);
      body = this.ensureBlock(this.body).compileToFragments(merge(o, {
        indent: indent
      }));
      ifPart = [].concat(this.makeCode("if ("), cond, this.makeCode(") {\n"), body, this.makeCode("\n" + this.tab + "}"));
      if (!child) {
        ifPart.unshift(this.makeCode(this.tab));
      }
      if (!this.elseBody) {
        return ifPart;
      }
      answer = ifPart.concat(this.makeCode(' else '));
      if (this.isChain) {
        o.chainChild = true;
        answer = answer.concat(this.elseBody.unwrap().compileToFragments(o, LEVEL_TOP));
      } else {
        answer = answer.concat(this.makeCode("{\n"), this.elseBody.compileToFragments(merge(o, {
          indent: indent
        }), LEVEL_TOP), this.makeCode("\n" + this.tab + "}"));
      }
      return answer;
    };

    If.prototype.compileExpression = function(o) {
      var alt, body, cond, fragments;
      cond = this.condition.compileToFragments(o, LEVEL_COND);
      body = this.bodyNode().compileToFragments(o, LEVEL_LIST);
      alt = this.elseBodyNode() ? this.elseBodyNode().compileToFragments(o, LEVEL_LIST) : [this.makeCode('void 0')];
      fragments = cond.concat(this.makeCode(" ? "), body, this.makeCode(" : "), alt);
      if (o.level >= LEVEL_COND) {
        return this.wrapInBraces(fragments);
      } else {
        return fragments;
      }
    };

    If.prototype.unfoldSoak = function() {
      return this.soak && this;
    };

    return If;

  })(Base);

  UTILITIES = {
    "extends": function() {
      return "function(child, parent) { for (var key in parent) { if (" + (utility('hasProp')) + ".call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }";
    },
    bind: function() {
      return 'function(fn, me){ return function(){ return fn.apply(me, arguments); }; }';
    },
    indexOf: function() {
      return "[].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; }";
    },
    modulo: function() {
      return "function(a, b) { return (a % b + +b) % b; }";
    },
    hasProp: function() {
      return '{}.hasOwnProperty';
    },
    slice: function() {
      return '[].slice';
    }
  };

  LEVEL_TOP = 1;

  LEVEL_PAREN = 2;

  LEVEL_LIST = 3;

  LEVEL_COND = 4;

  LEVEL_OP = 5;

  LEVEL_ACCESS = 6;

  TAB = '  ';

  IDENTIFIER_STR = "[$A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff]*";

  IDENTIFIER = RegExp("^" + IDENTIFIER_STR + "$");

  SIMPLENUM = /^[+-]?\d+$/;

  HEXNUM = /^[+-]?0x[\da-f]+/i;

  NUMBER = /^[+-]?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)$/i;

  METHOD_DEF = RegExp("^(" + IDENTIFIER_STR + ")(\\.prototype)?(?:\\.(" + IDENTIFIER_STR + ")|\\[(\"(?:[^\\\\\"\\r\\n]|\\\\.)*\"|'(?:[^\\\\'\\r\\n]|\\\\.)*')\\]|\\[(0x[\\da-fA-F]+|\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\])$");

  IS_STRING = /^['"]/;

  IS_REGEX = /^\//;

  utility = function(name) {
    var ref;
    ref = "__" + name;
    Scope.root.assign(ref, UTILITIES[name]());
    return ref;
  };

  multident = function(code, tab) {
    code = code.replace(/\n/g, '$&' + tab);
    return code.replace(/\s+$/, '');
  };

  parseNum = function(x) {
    if (x == null) {
      return 0;
    } else if (x.match(HEXNUM)) {
      return parseInt(x, 16);
    } else {
      return parseFloat(x);
    }
  };

  isLiteralArguments = function(node) {
    return node instanceof Literal && node.value === 'arguments' && !node.asKey;
  };

  isLiteralThis = function(node) {
    return (node instanceof Literal && node.value === 'this' && !node.asKey) || (node instanceof Code && node.bound) || (node instanceof Call && node.isSuper);
  };

  unfoldSoak = function(o, parent, name) {
    var ifn;
    if (!(ifn = parent[name].unfoldSoak(o))) {
      return;
    }
    parent[name] = ifn.body;
    ifn.body = new Value(parent);
    return ifn;
  };

}).call(this);

},{"./helpers":44,"./lexer":45,"./scope":50}],47:[function(require,module,exports){
(function (process){
/* parser generated by jison 0.4.13 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"Root":3,"Body":4,"Line":5,"TERMINATOR":6,"Expression":7,"Statement":8,"Return":9,"Comment":10,"STATEMENT":11,"Value":12,"Invocation":13,"Code":14,"Operation":15,"Assign":16,"If":17,"Try":18,"While":19,"For":20,"Switch":21,"Class":22,"Throw":23,"Block":24,"INDENT":25,"OUTDENT":26,"Identifier":27,"IDENTIFIER":28,"AlphaNumeric":29,"NUMBER":30,"STRING":31,"Literal":32,"JS":33,"REGEX":34,"DEBUGGER":35,"UNDEFINED":36,"NULL":37,"BOOL":38,"Assignable":39,"=":40,"AssignObj":41,"ObjAssignable":42,":":43,"ThisProperty":44,"RETURN":45,"HERECOMMENT":46,"PARAM_START":47,"ParamList":48,"PARAM_END":49,"FuncGlyph":50,"->":51,"=>":52,"OptComma":53,",":54,"Param":55,"ParamVar":56,"...":57,"Array":58,"Object":59,"Splat":60,"SimpleAssignable":61,"Accessor":62,"Parenthetical":63,"Range":64,"This":65,".":66,"?.":67,"::":68,"?::":69,"Index":70,"INDEX_START":71,"IndexValue":72,"INDEX_END":73,"INDEX_SOAK":74,"Slice":75,"{":76,"AssignList":77,"}":78,"CLASS":79,"EXTENDS":80,"OptFuncExist":81,"Arguments":82,"SUPER":83,"FUNC_EXIST":84,"CALL_START":85,"CALL_END":86,"ArgList":87,"THIS":88,"@":89,"[":90,"]":91,"RangeDots":92,"..":93,"Arg":94,"SimpleArgs":95,"TRY":96,"Catch":97,"FINALLY":98,"CATCH":99,"THROW":100,"(":101,")":102,"WhileSource":103,"WHILE":104,"WHEN":105,"UNTIL":106,"Loop":107,"LOOP":108,"ForBody":109,"FOR":110,"ForStart":111,"ForSource":112,"ForVariables":113,"OWN":114,"ForValue":115,"FORIN":116,"FOROF":117,"BY":118,"SWITCH":119,"Whens":120,"ELSE":121,"When":122,"LEADING_WHEN":123,"IfBlock":124,"IF":125,"POST_IF":126,"UNARY":127,"UNARY_MATH":128,"-":129,"+":130,"--":131,"++":132,"?":133,"MATH":134,"**":135,"SHIFT":136,"COMPARE":137,"LOGIC":138,"RELATION":139,"COMPOUND_ASSIGN":140,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",11:"STATEMENT",25:"INDENT",26:"OUTDENT",28:"IDENTIFIER",30:"NUMBER",31:"STRING",33:"JS",34:"REGEX",35:"DEBUGGER",36:"UNDEFINED",37:"NULL",38:"BOOL",40:"=",43:":",45:"RETURN",46:"HERECOMMENT",47:"PARAM_START",49:"PARAM_END",51:"->",52:"=>",54:",",57:"...",66:".",67:"?.",68:"::",69:"?::",71:"INDEX_START",73:"INDEX_END",74:"INDEX_SOAK",76:"{",78:"}",79:"CLASS",80:"EXTENDS",83:"SUPER",84:"FUNC_EXIST",85:"CALL_START",86:"CALL_END",88:"THIS",89:"@",90:"[",91:"]",93:"..",96:"TRY",98:"FINALLY",99:"CATCH",100:"THROW",101:"(",102:")",104:"WHILE",105:"WHEN",106:"UNTIL",108:"LOOP",110:"FOR",114:"OWN",116:"FORIN",117:"FOROF",118:"BY",119:"SWITCH",121:"ELSE",123:"LEADING_WHEN",125:"IF",126:"POST_IF",127:"UNARY",128:"UNARY_MATH",129:"-",130:"+",131:"--",132:"++",133:"?",134:"MATH",135:"**",136:"SHIFT",137:"COMPARE",138:"LOGIC",139:"RELATION",140:"COMPOUND_ASSIGN"},
productions_: [0,[3,0],[3,1],[4,1],[4,3],[4,2],[5,1],[5,1],[8,1],[8,1],[8,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[24,2],[24,3],[27,1],[29,1],[29,1],[32,1],[32,1],[32,1],[32,1],[32,1],[32,1],[32,1],[16,3],[16,4],[16,5],[41,1],[41,3],[41,5],[41,1],[42,1],[42,1],[42,1],[9,2],[9,1],[10,1],[14,5],[14,2],[50,1],[50,1],[53,0],[53,1],[48,0],[48,1],[48,3],[48,4],[48,6],[55,1],[55,2],[55,3],[55,1],[56,1],[56,1],[56,1],[56,1],[60,2],[61,1],[61,2],[61,2],[61,1],[39,1],[39,1],[39,1],[12,1],[12,1],[12,1],[12,1],[12,1],[62,2],[62,2],[62,2],[62,2],[62,1],[62,1],[70,3],[70,2],[72,1],[72,1],[59,4],[77,0],[77,1],[77,3],[77,4],[77,6],[22,1],[22,2],[22,3],[22,4],[22,2],[22,3],[22,4],[22,5],[13,3],[13,3],[13,1],[13,2],[81,0],[81,1],[82,2],[82,4],[65,1],[65,1],[44,2],[58,2],[58,4],[92,1],[92,1],[64,5],[75,3],[75,2],[75,2],[75,1],[87,1],[87,3],[87,4],[87,4],[87,6],[94,1],[94,1],[94,1],[95,1],[95,3],[18,2],[18,3],[18,4],[18,5],[97,3],[97,3],[97,2],[23,2],[63,3],[63,5],[103,2],[103,4],[103,2],[103,4],[19,2],[19,2],[19,2],[19,1],[107,2],[107,2],[20,2],[20,2],[20,2],[109,2],[109,2],[111,2],[111,3],[115,1],[115,1],[115,1],[115,1],[113,1],[113,3],[112,2],[112,2],[112,4],[112,4],[112,4],[112,6],[112,6],[21,5],[21,7],[21,4],[21,6],[120,1],[120,2],[122,3],[122,4],[124,3],[124,5],[17,1],[17,3],[17,3],[17,3],[15,2],[15,2],[15,2],[15,2],[15,2],[15,2],[15,2],[15,2],[15,2],[15,3],[15,3],[15,3],[15,3],[15,3],[15,3],[15,3],[15,3],[15,3],[15,5],[15,4],[15,3]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:return this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Block);
break;
case 2:return this.$ = $$[$0];
break;
case 3:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(yy.Block.wrap([$$[$0]]));
break;
case 4:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-2].push($$[$0]));
break;
case 5:this.$ = $$[$0-1];
break;
case 6:this.$ = $$[$0];
break;
case 7:this.$ = $$[$0];
break;
case 8:this.$ = $$[$0];
break;
case 9:this.$ = $$[$0];
break;
case 10:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Literal($$[$0]));
break;
case 11:this.$ = $$[$0];
break;
case 12:this.$ = $$[$0];
break;
case 13:this.$ = $$[$0];
break;
case 14:this.$ = $$[$0];
break;
case 15:this.$ = $$[$0];
break;
case 16:this.$ = $$[$0];
break;
case 17:this.$ = $$[$0];
break;
case 18:this.$ = $$[$0];
break;
case 19:this.$ = $$[$0];
break;
case 20:this.$ = $$[$0];
break;
case 21:this.$ = $$[$0];
break;
case 22:this.$ = $$[$0];
break;
case 23:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Block);
break;
case 24:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-1]);
break;
case 25:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Literal($$[$0]));
break;
case 26:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Literal($$[$0]));
break;
case 27:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Literal($$[$0]));
break;
case 28:this.$ = $$[$0];
break;
case 29:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Literal($$[$0]));
break;
case 30:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Literal($$[$0]));
break;
case 31:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Literal($$[$0]));
break;
case 32:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Undefined);
break;
case 33:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Null);
break;
case 34:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Bool($$[$0]));
break;
case 35:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Assign($$[$0-2], $$[$0]));
break;
case 36:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Assign($$[$0-3], $$[$0]));
break;
case 37:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Assign($$[$0-4], $$[$0-1]));
break;
case 38:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
break;
case 39:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Assign(yy.addLocationDataFn(_$[$0-2])(new yy.Value($$[$0-2])), $$[$0], 'object'));
break;
case 40:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Assign(yy.addLocationDataFn(_$[$0-4])(new yy.Value($$[$0-4])), $$[$0-1], 'object'));
break;
case 41:this.$ = $$[$0];
break;
case 42:this.$ = $$[$0];
break;
case 43:this.$ = $$[$0];
break;
case 44:this.$ = $$[$0];
break;
case 45:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Return($$[$0]));
break;
case 46:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Return);
break;
case 47:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Comment($$[$0]));
break;
case 48:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Code($$[$0-3], $$[$0], $$[$0-1]));
break;
case 49:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Code([], $$[$0], $$[$0-1]));
break;
case 50:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])('func');
break;
case 51:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])('boundfunc');
break;
case 52:this.$ = $$[$0];
break;
case 53:this.$ = $$[$0];
break;
case 54:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])([]);
break;
case 55:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])([$$[$0]]);
break;
case 56:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-2].concat($$[$0]));
break;
case 57:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])($$[$0-3].concat($$[$0]));
break;
case 58:this.$ = yy.addLocationDataFn(_$[$0-5], _$[$0])($$[$0-5].concat($$[$0-2]));
break;
case 59:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Param($$[$0]));
break;
case 60:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Param($$[$0-1], null, true));
break;
case 61:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Param($$[$0-2], $$[$0]));
break;
case 62:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Expansion);
break;
case 63:this.$ = $$[$0];
break;
case 64:this.$ = $$[$0];
break;
case 65:this.$ = $$[$0];
break;
case 66:this.$ = $$[$0];
break;
case 67:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Splat($$[$0-1]));
break;
case 68:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
break;
case 69:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])($$[$0-1].add($$[$0]));
break;
case 70:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Value($$[$0-1], [].concat($$[$0])));
break;
case 71:this.$ = $$[$0];
break;
case 72:this.$ = $$[$0];
break;
case 73:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
break;
case 74:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
break;
case 75:this.$ = $$[$0];
break;
case 76:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
break;
case 77:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
break;
case 78:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
break;
case 79:this.$ = $$[$0];
break;
case 80:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Access($$[$0]));
break;
case 81:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Access($$[$0], 'soak'));
break;
case 82:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])([yy.addLocationDataFn(_$[$0-1])(new yy.Access(new yy.Literal('prototype'))), yy.addLocationDataFn(_$[$0])(new yy.Access($$[$0]))]);
break;
case 83:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])([yy.addLocationDataFn(_$[$0-1])(new yy.Access(new yy.Literal('prototype'), 'soak')), yy.addLocationDataFn(_$[$0])(new yy.Access($$[$0]))]);
break;
case 84:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Access(new yy.Literal('prototype')));
break;
case 85:this.$ = $$[$0];
break;
case 86:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-1]);
break;
case 87:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(yy.extend($$[$0], {
          soak: true
        }));
break;
case 88:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Index($$[$0]));
break;
case 89:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Slice($$[$0]));
break;
case 90:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Obj($$[$0-2], $$[$0-3].generated));
break;
case 91:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])([]);
break;
case 92:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])([$$[$0]]);
break;
case 93:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-2].concat($$[$0]));
break;
case 94:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])($$[$0-3].concat($$[$0]));
break;
case 95:this.$ = yy.addLocationDataFn(_$[$0-5], _$[$0])($$[$0-5].concat($$[$0-2]));
break;
case 96:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Class);
break;
case 97:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Class(null, null, $$[$0]));
break;
case 98:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Class(null, $$[$0]));
break;
case 99:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Class(null, $$[$0-1], $$[$0]));
break;
case 100:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Class($$[$0]));
break;
case 101:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Class($$[$0-1], null, $$[$0]));
break;
case 102:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Class($$[$0-2], $$[$0]));
break;
case 103:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Class($$[$0-3], $$[$0-1], $$[$0]));
break;
case 104:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Call($$[$0-2], $$[$0], $$[$0-1]));
break;
case 105:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Call($$[$0-2], $$[$0], $$[$0-1]));
break;
case 106:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Call('super', [new yy.Splat(new yy.Literal('arguments'))]));
break;
case 107:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Call('super', $$[$0]));
break;
case 108:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(false);
break;
case 109:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(true);
break;
case 110:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])([]);
break;
case 111:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])($$[$0-2]);
break;
case 112:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value(new yy.Literal('this')));
break;
case 113:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value(new yy.Literal('this')));
break;
case 114:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Value(yy.addLocationDataFn(_$[$0-1])(new yy.Literal('this')), [yy.addLocationDataFn(_$[$0])(new yy.Access($$[$0]))], 'this'));
break;
case 115:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Arr([]));
break;
case 116:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Arr($$[$0-2]));
break;
case 117:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])('inclusive');
break;
case 118:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])('exclusive');
break;
case 119:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Range($$[$0-3], $$[$0-1], $$[$0-2]));
break;
case 120:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Range($$[$0-2], $$[$0], $$[$0-1]));
break;
case 121:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Range($$[$0-1], null, $$[$0]));
break;
case 122:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Range(null, $$[$0], $$[$0-1]));
break;
case 123:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Range(null, null, $$[$0]));
break;
case 124:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])([$$[$0]]);
break;
case 125:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-2].concat($$[$0]));
break;
case 126:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])($$[$0-3].concat($$[$0]));
break;
case 127:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])($$[$0-2]);
break;
case 128:this.$ = yy.addLocationDataFn(_$[$0-5], _$[$0])($$[$0-5].concat($$[$0-2]));
break;
case 129:this.$ = $$[$0];
break;
case 130:this.$ = $$[$0];
break;
case 131:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Expansion);
break;
case 132:this.$ = $$[$0];
break;
case 133:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])([].concat($$[$0-2], $$[$0]));
break;
case 134:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Try($$[$0]));
break;
case 135:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Try($$[$0-1], $$[$0][0], $$[$0][1]));
break;
case 136:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Try($$[$0-2], null, null, $$[$0]));
break;
case 137:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Try($$[$0-3], $$[$0-2][0], $$[$0-2][1], $$[$0]));
break;
case 138:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])([$$[$0-1], $$[$0]]);
break;
case 139:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])([yy.addLocationDataFn(_$[$0-1])(new yy.Value($$[$0-1])), $$[$0]]);
break;
case 140:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])([null, $$[$0]]);
break;
case 141:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Throw($$[$0]));
break;
case 142:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Parens($$[$0-1]));
break;
case 143:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Parens($$[$0-2]));
break;
case 144:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.While($$[$0]));
break;
case 145:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.While($$[$0-2], {
          guard: $$[$0]
        }));
break;
case 146:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.While($$[$0], {
          invert: true
        }));
break;
case 147:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.While($$[$0-2], {
          invert: true,
          guard: $$[$0]
        }));
break;
case 148:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])($$[$0-1].addBody($$[$0]));
break;
case 149:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])($$[$0].addBody(yy.addLocationDataFn(_$[$0-1])(yy.Block.wrap([$$[$0-1]]))));
break;
case 150:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])($$[$0].addBody(yy.addLocationDataFn(_$[$0-1])(yy.Block.wrap([$$[$0-1]]))));
break;
case 151:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])($$[$0]);
break;
case 152:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.While(yy.addLocationDataFn(_$[$0-1])(new yy.Literal('true'))).addBody($$[$0]));
break;
case 153:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.While(yy.addLocationDataFn(_$[$0-1])(new yy.Literal('true'))).addBody(yy.addLocationDataFn(_$[$0])(yy.Block.wrap([$$[$0]]))));
break;
case 154:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.For($$[$0-1], $$[$0]));
break;
case 155:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.For($$[$0-1], $$[$0]));
break;
case 156:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.For($$[$0], $$[$0-1]));
break;
case 157:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])({
          source: yy.addLocationDataFn(_$[$0])(new yy.Value($$[$0]))
        });
break;
case 158:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])((function () {
        $$[$0].own = $$[$0-1].own;
        $$[$0].name = $$[$0-1][0];
        $$[$0].index = $$[$0-1][1];
        return $$[$0];
      }()));
break;
case 159:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])($$[$0]);
break;
case 160:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])((function () {
        $$[$0].own = true;
        return $$[$0];
      }()));
break;
case 161:this.$ = $$[$0];
break;
case 162:this.$ = $$[$0];
break;
case 163:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
break;
case 164:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
break;
case 165:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])([$$[$0]]);
break;
case 166:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])([$$[$0-2], $$[$0]]);
break;
case 167:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])({
          source: $$[$0]
        });
break;
case 168:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])({
          source: $$[$0],
          object: true
        });
break;
case 169:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])({
          source: $$[$0-2],
          guard: $$[$0]
        });
break;
case 170:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])({
          source: $$[$0-2],
          guard: $$[$0],
          object: true
        });
break;
case 171:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])({
          source: $$[$0-2],
          step: $$[$0]
        });
break;
case 172:this.$ = yy.addLocationDataFn(_$[$0-5], _$[$0])({
          source: $$[$0-4],
          guard: $$[$0-2],
          step: $$[$0]
        });
break;
case 173:this.$ = yy.addLocationDataFn(_$[$0-5], _$[$0])({
          source: $$[$0-4],
          step: $$[$0-2],
          guard: $$[$0]
        });
break;
case 174:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Switch($$[$0-3], $$[$0-1]));
break;
case 175:this.$ = yy.addLocationDataFn(_$[$0-6], _$[$0])(new yy.Switch($$[$0-5], $$[$0-3], $$[$0-1]));
break;
case 176:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Switch(null, $$[$0-1]));
break;
case 177:this.$ = yy.addLocationDataFn(_$[$0-5], _$[$0])(new yy.Switch(null, $$[$0-3], $$[$0-1]));
break;
case 178:this.$ = $$[$0];
break;
case 179:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])($$[$0-1].concat($$[$0]));
break;
case 180:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])([[$$[$0-1], $$[$0]]]);
break;
case 181:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])([[$$[$0-2], $$[$0-1]]]);
break;
case 182:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        }));
break;
case 183:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])($$[$0-4].addElse(yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        }))));
break;
case 184:this.$ = $$[$0];
break;
case 185:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-2].addElse($$[$0]));
break;
case 186:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.If($$[$0], yy.addLocationDataFn(_$[$0-2])(yy.Block.wrap([$$[$0-2]])), {
          type: $$[$0-1],
          statement: true
        }));
break;
case 187:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.If($$[$0], yy.addLocationDataFn(_$[$0-2])(yy.Block.wrap([$$[$0-2]])), {
          type: $$[$0-1],
          statement: true
        }));
break;
case 188:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op($$[$0-1], $$[$0]));
break;
case 189:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op($$[$0-1], $$[$0]));
break;
case 190:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('-', $$[$0]));
break;
case 191:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('+', $$[$0]));
break;
case 192:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('--', $$[$0]));
break;
case 193:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('++', $$[$0]));
break;
case 194:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('--', $$[$0-1], null, true));
break;
case 195:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('++', $$[$0-1], null, true));
break;
case 196:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Existence($$[$0-1]));
break;
case 197:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op('+', $$[$0-2], $$[$0]));
break;
case 198:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op('-', $$[$0-2], $$[$0]));
break;
case 199:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op($$[$0-1], $$[$0-2], $$[$0]));
break;
case 200:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op($$[$0-1], $$[$0-2], $$[$0]));
break;
case 201:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op($$[$0-1], $$[$0-2], $$[$0]));
break;
case 202:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op($$[$0-1], $$[$0-2], $$[$0]));
break;
case 203:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op($$[$0-1], $$[$0-2], $$[$0]));
break;
case 204:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])((function () {
        if ($$[$0-1].charAt(0) === '!') {
          return new yy.Op($$[$0-1].slice(1), $$[$0-2], $$[$0]).invert();
        } else {
          return new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
        }
      }()));
break;
case 205:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Assign($$[$0-2], $$[$0], $$[$0-1]));
break;
case 206:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Assign($$[$0-4], $$[$0-1], $$[$0-3]));
break;
case 207:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Assign($$[$0-3], $$[$0], $$[$0-2]));
break;
case 208:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Extends($$[$0-2], $$[$0]));
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,7:4,8:5,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[3]},{1:[2,2],6:[1,73]},{1:[2,3],6:[2,3],26:[2,3],102:[2,3]},{1:[2,6],6:[2,6],26:[2,6],102:[2,6],103:84,104:[1,64],106:[1,65],109:85,110:[1,67],111:68,126:[1,83],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,7],6:[2,7],26:[2,7],102:[2,7],103:87,104:[1,64],106:[1,65],109:88,110:[1,67],111:68,126:[1,86]},{1:[2,11],6:[2,11],25:[2,11],26:[2,11],49:[2,11],54:[2,11],57:[2,11],62:90,66:[1,92],67:[1,93],68:[1,94],69:[1,95],70:96,71:[1,97],73:[2,11],74:[1,98],78:[2,11],81:89,84:[1,91],85:[2,108],86:[2,11],91:[2,11],93:[2,11],102:[2,11],104:[2,11],105:[2,11],106:[2,11],110:[2,11],118:[2,11],126:[2,11],129:[2,11],130:[2,11],133:[2,11],134:[2,11],135:[2,11],136:[2,11],137:[2,11],138:[2,11],139:[2,11]},{1:[2,12],6:[2,12],25:[2,12],26:[2,12],49:[2,12],54:[2,12],57:[2,12],62:100,66:[1,92],67:[1,93],68:[1,94],69:[1,95],70:96,71:[1,97],73:[2,12],74:[1,98],78:[2,12],81:99,84:[1,91],85:[2,108],86:[2,12],91:[2,12],93:[2,12],102:[2,12],104:[2,12],105:[2,12],106:[2,12],110:[2,12],118:[2,12],126:[2,12],129:[2,12],130:[2,12],133:[2,12],134:[2,12],135:[2,12],136:[2,12],137:[2,12],138:[2,12],139:[2,12]},{1:[2,13],6:[2,13],25:[2,13],26:[2,13],49:[2,13],54:[2,13],57:[2,13],73:[2,13],78:[2,13],86:[2,13],91:[2,13],93:[2,13],102:[2,13],104:[2,13],105:[2,13],106:[2,13],110:[2,13],118:[2,13],126:[2,13],129:[2,13],130:[2,13],133:[2,13],134:[2,13],135:[2,13],136:[2,13],137:[2,13],138:[2,13],139:[2,13]},{1:[2,14],6:[2,14],25:[2,14],26:[2,14],49:[2,14],54:[2,14],57:[2,14],73:[2,14],78:[2,14],86:[2,14],91:[2,14],93:[2,14],102:[2,14],104:[2,14],105:[2,14],106:[2,14],110:[2,14],118:[2,14],126:[2,14],129:[2,14],130:[2,14],133:[2,14],134:[2,14],135:[2,14],136:[2,14],137:[2,14],138:[2,14],139:[2,14]},{1:[2,15],6:[2,15],25:[2,15],26:[2,15],49:[2,15],54:[2,15],57:[2,15],73:[2,15],78:[2,15],86:[2,15],91:[2,15],93:[2,15],102:[2,15],104:[2,15],105:[2,15],106:[2,15],110:[2,15],118:[2,15],126:[2,15],129:[2,15],130:[2,15],133:[2,15],134:[2,15],135:[2,15],136:[2,15],137:[2,15],138:[2,15],139:[2,15]},{1:[2,16],6:[2,16],25:[2,16],26:[2,16],49:[2,16],54:[2,16],57:[2,16],73:[2,16],78:[2,16],86:[2,16],91:[2,16],93:[2,16],102:[2,16],104:[2,16],105:[2,16],106:[2,16],110:[2,16],118:[2,16],126:[2,16],129:[2,16],130:[2,16],133:[2,16],134:[2,16],135:[2,16],136:[2,16],137:[2,16],138:[2,16],139:[2,16]},{1:[2,17],6:[2,17],25:[2,17],26:[2,17],49:[2,17],54:[2,17],57:[2,17],73:[2,17],78:[2,17],86:[2,17],91:[2,17],93:[2,17],102:[2,17],104:[2,17],105:[2,17],106:[2,17],110:[2,17],118:[2,17],126:[2,17],129:[2,17],130:[2,17],133:[2,17],134:[2,17],135:[2,17],136:[2,17],137:[2,17],138:[2,17],139:[2,17]},{1:[2,18],6:[2,18],25:[2,18],26:[2,18],49:[2,18],54:[2,18],57:[2,18],73:[2,18],78:[2,18],86:[2,18],91:[2,18],93:[2,18],102:[2,18],104:[2,18],105:[2,18],106:[2,18],110:[2,18],118:[2,18],126:[2,18],129:[2,18],130:[2,18],133:[2,18],134:[2,18],135:[2,18],136:[2,18],137:[2,18],138:[2,18],139:[2,18]},{1:[2,19],6:[2,19],25:[2,19],26:[2,19],49:[2,19],54:[2,19],57:[2,19],73:[2,19],78:[2,19],86:[2,19],91:[2,19],93:[2,19],102:[2,19],104:[2,19],105:[2,19],106:[2,19],110:[2,19],118:[2,19],126:[2,19],129:[2,19],130:[2,19],133:[2,19],134:[2,19],135:[2,19],136:[2,19],137:[2,19],138:[2,19],139:[2,19]},{1:[2,20],6:[2,20],25:[2,20],26:[2,20],49:[2,20],54:[2,20],57:[2,20],73:[2,20],78:[2,20],86:[2,20],91:[2,20],93:[2,20],102:[2,20],104:[2,20],105:[2,20],106:[2,20],110:[2,20],118:[2,20],126:[2,20],129:[2,20],130:[2,20],133:[2,20],134:[2,20],135:[2,20],136:[2,20],137:[2,20],138:[2,20],139:[2,20]},{1:[2,21],6:[2,21],25:[2,21],26:[2,21],49:[2,21],54:[2,21],57:[2,21],73:[2,21],78:[2,21],86:[2,21],91:[2,21],93:[2,21],102:[2,21],104:[2,21],105:[2,21],106:[2,21],110:[2,21],118:[2,21],126:[2,21],129:[2,21],130:[2,21],133:[2,21],134:[2,21],135:[2,21],136:[2,21],137:[2,21],138:[2,21],139:[2,21]},{1:[2,22],6:[2,22],25:[2,22],26:[2,22],49:[2,22],54:[2,22],57:[2,22],73:[2,22],78:[2,22],86:[2,22],91:[2,22],93:[2,22],102:[2,22],104:[2,22],105:[2,22],106:[2,22],110:[2,22],118:[2,22],126:[2,22],129:[2,22],130:[2,22],133:[2,22],134:[2,22],135:[2,22],136:[2,22],137:[2,22],138:[2,22],139:[2,22]},{1:[2,8],6:[2,8],26:[2,8],102:[2,8],104:[2,8],106:[2,8],110:[2,8],126:[2,8]},{1:[2,9],6:[2,9],26:[2,9],102:[2,9],104:[2,9],106:[2,9],110:[2,9],126:[2,9]},{1:[2,10],6:[2,10],26:[2,10],102:[2,10],104:[2,10],106:[2,10],110:[2,10],126:[2,10]},{1:[2,75],6:[2,75],25:[2,75],26:[2,75],40:[1,101],49:[2,75],54:[2,75],57:[2,75],66:[2,75],67:[2,75],68:[2,75],69:[2,75],71:[2,75],73:[2,75],74:[2,75],78:[2,75],84:[2,75],85:[2,75],86:[2,75],91:[2,75],93:[2,75],102:[2,75],104:[2,75],105:[2,75],106:[2,75],110:[2,75],118:[2,75],126:[2,75],129:[2,75],130:[2,75],133:[2,75],134:[2,75],135:[2,75],136:[2,75],137:[2,75],138:[2,75],139:[2,75]},{1:[2,76],6:[2,76],25:[2,76],26:[2,76],49:[2,76],54:[2,76],57:[2,76],66:[2,76],67:[2,76],68:[2,76],69:[2,76],71:[2,76],73:[2,76],74:[2,76],78:[2,76],84:[2,76],85:[2,76],86:[2,76],91:[2,76],93:[2,76],102:[2,76],104:[2,76],105:[2,76],106:[2,76],110:[2,76],118:[2,76],126:[2,76],129:[2,76],130:[2,76],133:[2,76],134:[2,76],135:[2,76],136:[2,76],137:[2,76],138:[2,76],139:[2,76]},{1:[2,77],6:[2,77],25:[2,77],26:[2,77],49:[2,77],54:[2,77],57:[2,77],66:[2,77],67:[2,77],68:[2,77],69:[2,77],71:[2,77],73:[2,77],74:[2,77],78:[2,77],84:[2,77],85:[2,77],86:[2,77],91:[2,77],93:[2,77],102:[2,77],104:[2,77],105:[2,77],106:[2,77],110:[2,77],118:[2,77],126:[2,77],129:[2,77],130:[2,77],133:[2,77],134:[2,77],135:[2,77],136:[2,77],137:[2,77],138:[2,77],139:[2,77]},{1:[2,78],6:[2,78],25:[2,78],26:[2,78],49:[2,78],54:[2,78],57:[2,78],66:[2,78],67:[2,78],68:[2,78],69:[2,78],71:[2,78],73:[2,78],74:[2,78],78:[2,78],84:[2,78],85:[2,78],86:[2,78],91:[2,78],93:[2,78],102:[2,78],104:[2,78],105:[2,78],106:[2,78],110:[2,78],118:[2,78],126:[2,78],129:[2,78],130:[2,78],133:[2,78],134:[2,78],135:[2,78],136:[2,78],137:[2,78],138:[2,78],139:[2,78]},{1:[2,79],6:[2,79],25:[2,79],26:[2,79],49:[2,79],54:[2,79],57:[2,79],66:[2,79],67:[2,79],68:[2,79],69:[2,79],71:[2,79],73:[2,79],74:[2,79],78:[2,79],84:[2,79],85:[2,79],86:[2,79],91:[2,79],93:[2,79],102:[2,79],104:[2,79],105:[2,79],106:[2,79],110:[2,79],118:[2,79],126:[2,79],129:[2,79],130:[2,79],133:[2,79],134:[2,79],135:[2,79],136:[2,79],137:[2,79],138:[2,79],139:[2,79]},{1:[2,106],6:[2,106],25:[2,106],26:[2,106],49:[2,106],54:[2,106],57:[2,106],66:[2,106],67:[2,106],68:[2,106],69:[2,106],71:[2,106],73:[2,106],74:[2,106],78:[2,106],82:102,84:[2,106],85:[1,103],86:[2,106],91:[2,106],93:[2,106],102:[2,106],104:[2,106],105:[2,106],106:[2,106],110:[2,106],118:[2,106],126:[2,106],129:[2,106],130:[2,106],133:[2,106],134:[2,106],135:[2,106],136:[2,106],137:[2,106],138:[2,106],139:[2,106]},{6:[2,54],25:[2,54],27:108,28:[1,72],44:109,48:104,49:[2,54],54:[2,54],55:105,56:106,57:[1,107],58:110,59:111,76:[1,69],89:[1,112],90:[1,113]},{24:114,25:[1,115]},{7:116,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:118,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:119,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:120,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{12:122,13:123,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:124,44:62,58:46,59:47,61:121,63:23,64:24,65:25,76:[1,69],83:[1,26],88:[1,57],89:[1,58],90:[1,56],101:[1,55]},{12:122,13:123,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:124,44:62,58:46,59:47,61:125,63:23,64:24,65:25,76:[1,69],83:[1,26],88:[1,57],89:[1,58],90:[1,56],101:[1,55]},{1:[2,72],6:[2,72],25:[2,72],26:[2,72],40:[2,72],49:[2,72],54:[2,72],57:[2,72],66:[2,72],67:[2,72],68:[2,72],69:[2,72],71:[2,72],73:[2,72],74:[2,72],78:[2,72],80:[1,129],84:[2,72],85:[2,72],86:[2,72],91:[2,72],93:[2,72],102:[2,72],104:[2,72],105:[2,72],106:[2,72],110:[2,72],118:[2,72],126:[2,72],129:[2,72],130:[2,72],131:[1,126],132:[1,127],133:[2,72],134:[2,72],135:[2,72],136:[2,72],137:[2,72],138:[2,72],139:[2,72],140:[1,128]},{1:[2,184],6:[2,184],25:[2,184],26:[2,184],49:[2,184],54:[2,184],57:[2,184],73:[2,184],78:[2,184],86:[2,184],91:[2,184],93:[2,184],102:[2,184],104:[2,184],105:[2,184],106:[2,184],110:[2,184],118:[2,184],121:[1,130],126:[2,184],129:[2,184],130:[2,184],133:[2,184],134:[2,184],135:[2,184],136:[2,184],137:[2,184],138:[2,184],139:[2,184]},{24:131,25:[1,115]},{24:132,25:[1,115]},{1:[2,151],6:[2,151],25:[2,151],26:[2,151],49:[2,151],54:[2,151],57:[2,151],73:[2,151],78:[2,151],86:[2,151],91:[2,151],93:[2,151],102:[2,151],104:[2,151],105:[2,151],106:[2,151],110:[2,151],118:[2,151],126:[2,151],129:[2,151],130:[2,151],133:[2,151],134:[2,151],135:[2,151],136:[2,151],137:[2,151],138:[2,151],139:[2,151]},{24:133,25:[1,115]},{7:134,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,135],27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,96],6:[2,96],12:122,13:123,24:136,25:[1,115],26:[2,96],27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:124,44:62,49:[2,96],54:[2,96],57:[2,96],58:46,59:47,61:138,63:23,64:24,65:25,73:[2,96],76:[1,69],78:[2,96],80:[1,137],83:[1,26],86:[2,96],88:[1,57],89:[1,58],90:[1,56],91:[2,96],93:[2,96],101:[1,55],102:[2,96],104:[2,96],105:[2,96],106:[2,96],110:[2,96],118:[2,96],126:[2,96],129:[2,96],130:[2,96],133:[2,96],134:[2,96],135:[2,96],136:[2,96],137:[2,96],138:[2,96],139:[2,96]},{7:139,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,46],6:[2,46],7:140,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,26:[2,46],27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],102:[2,46],103:38,104:[2,46],106:[2,46],107:39,108:[1,66],109:40,110:[2,46],111:68,119:[1,41],124:36,125:[1,63],126:[2,46],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,47],6:[2,47],25:[2,47],26:[2,47],54:[2,47],78:[2,47],102:[2,47],104:[2,47],106:[2,47],110:[2,47],126:[2,47]},{1:[2,73],6:[2,73],25:[2,73],26:[2,73],40:[2,73],49:[2,73],54:[2,73],57:[2,73],66:[2,73],67:[2,73],68:[2,73],69:[2,73],71:[2,73],73:[2,73],74:[2,73],78:[2,73],84:[2,73],85:[2,73],86:[2,73],91:[2,73],93:[2,73],102:[2,73],104:[2,73],105:[2,73],106:[2,73],110:[2,73],118:[2,73],126:[2,73],129:[2,73],130:[2,73],133:[2,73],134:[2,73],135:[2,73],136:[2,73],137:[2,73],138:[2,73],139:[2,73]},{1:[2,74],6:[2,74],25:[2,74],26:[2,74],40:[2,74],49:[2,74],54:[2,74],57:[2,74],66:[2,74],67:[2,74],68:[2,74],69:[2,74],71:[2,74],73:[2,74],74:[2,74],78:[2,74],84:[2,74],85:[2,74],86:[2,74],91:[2,74],93:[2,74],102:[2,74],104:[2,74],105:[2,74],106:[2,74],110:[2,74],118:[2,74],126:[2,74],129:[2,74],130:[2,74],133:[2,74],134:[2,74],135:[2,74],136:[2,74],137:[2,74],138:[2,74],139:[2,74]},{1:[2,28],6:[2,28],25:[2,28],26:[2,28],49:[2,28],54:[2,28],57:[2,28],66:[2,28],67:[2,28],68:[2,28],69:[2,28],71:[2,28],73:[2,28],74:[2,28],78:[2,28],84:[2,28],85:[2,28],86:[2,28],91:[2,28],93:[2,28],102:[2,28],104:[2,28],105:[2,28],106:[2,28],110:[2,28],118:[2,28],126:[2,28],129:[2,28],130:[2,28],133:[2,28],134:[2,28],135:[2,28],136:[2,28],137:[2,28],138:[2,28],139:[2,28]},{1:[2,29],6:[2,29],25:[2,29],26:[2,29],49:[2,29],54:[2,29],57:[2,29],66:[2,29],67:[2,29],68:[2,29],69:[2,29],71:[2,29],73:[2,29],74:[2,29],78:[2,29],84:[2,29],85:[2,29],86:[2,29],91:[2,29],93:[2,29],102:[2,29],104:[2,29],105:[2,29],106:[2,29],110:[2,29],118:[2,29],126:[2,29],129:[2,29],130:[2,29],133:[2,29],134:[2,29],135:[2,29],136:[2,29],137:[2,29],138:[2,29],139:[2,29]},{1:[2,30],6:[2,30],25:[2,30],26:[2,30],49:[2,30],54:[2,30],57:[2,30],66:[2,30],67:[2,30],68:[2,30],69:[2,30],71:[2,30],73:[2,30],74:[2,30],78:[2,30],84:[2,30],85:[2,30],86:[2,30],91:[2,30],93:[2,30],102:[2,30],104:[2,30],105:[2,30],106:[2,30],110:[2,30],118:[2,30],126:[2,30],129:[2,30],130:[2,30],133:[2,30],134:[2,30],135:[2,30],136:[2,30],137:[2,30],138:[2,30],139:[2,30]},{1:[2,31],6:[2,31],25:[2,31],26:[2,31],49:[2,31],54:[2,31],57:[2,31],66:[2,31],67:[2,31],68:[2,31],69:[2,31],71:[2,31],73:[2,31],74:[2,31],78:[2,31],84:[2,31],85:[2,31],86:[2,31],91:[2,31],93:[2,31],102:[2,31],104:[2,31],105:[2,31],106:[2,31],110:[2,31],118:[2,31],126:[2,31],129:[2,31],130:[2,31],133:[2,31],134:[2,31],135:[2,31],136:[2,31],137:[2,31],138:[2,31],139:[2,31]},{1:[2,32],6:[2,32],25:[2,32],26:[2,32],49:[2,32],54:[2,32],57:[2,32],66:[2,32],67:[2,32],68:[2,32],69:[2,32],71:[2,32],73:[2,32],74:[2,32],78:[2,32],84:[2,32],85:[2,32],86:[2,32],91:[2,32],93:[2,32],102:[2,32],104:[2,32],105:[2,32],106:[2,32],110:[2,32],118:[2,32],126:[2,32],129:[2,32],130:[2,32],133:[2,32],134:[2,32],135:[2,32],136:[2,32],137:[2,32],138:[2,32],139:[2,32]},{1:[2,33],6:[2,33],25:[2,33],26:[2,33],49:[2,33],54:[2,33],57:[2,33],66:[2,33],67:[2,33],68:[2,33],69:[2,33],71:[2,33],73:[2,33],74:[2,33],78:[2,33],84:[2,33],85:[2,33],86:[2,33],91:[2,33],93:[2,33],102:[2,33],104:[2,33],105:[2,33],106:[2,33],110:[2,33],118:[2,33],126:[2,33],129:[2,33],130:[2,33],133:[2,33],134:[2,33],135:[2,33],136:[2,33],137:[2,33],138:[2,33],139:[2,33]},{1:[2,34],6:[2,34],25:[2,34],26:[2,34],49:[2,34],54:[2,34],57:[2,34],66:[2,34],67:[2,34],68:[2,34],69:[2,34],71:[2,34],73:[2,34],74:[2,34],78:[2,34],84:[2,34],85:[2,34],86:[2,34],91:[2,34],93:[2,34],102:[2,34],104:[2,34],105:[2,34],106:[2,34],110:[2,34],118:[2,34],126:[2,34],129:[2,34],130:[2,34],133:[2,34],134:[2,34],135:[2,34],136:[2,34],137:[2,34],138:[2,34],139:[2,34]},{4:141,5:3,7:4,8:5,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,142],27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:143,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,147],27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],57:[1,149],58:46,59:47,60:148,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],87:145,88:[1,57],89:[1,58],90:[1,56],91:[1,144],94:146,96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,112],6:[2,112],25:[2,112],26:[2,112],49:[2,112],54:[2,112],57:[2,112],66:[2,112],67:[2,112],68:[2,112],69:[2,112],71:[2,112],73:[2,112],74:[2,112],78:[2,112],84:[2,112],85:[2,112],86:[2,112],91:[2,112],93:[2,112],102:[2,112],104:[2,112],105:[2,112],106:[2,112],110:[2,112],118:[2,112],126:[2,112],129:[2,112],130:[2,112],133:[2,112],134:[2,112],135:[2,112],136:[2,112],137:[2,112],138:[2,112],139:[2,112]},{1:[2,113],6:[2,113],25:[2,113],26:[2,113],27:150,28:[1,72],49:[2,113],54:[2,113],57:[2,113],66:[2,113],67:[2,113],68:[2,113],69:[2,113],71:[2,113],73:[2,113],74:[2,113],78:[2,113],84:[2,113],85:[2,113],86:[2,113],91:[2,113],93:[2,113],102:[2,113],104:[2,113],105:[2,113],106:[2,113],110:[2,113],118:[2,113],126:[2,113],129:[2,113],130:[2,113],133:[2,113],134:[2,113],135:[2,113],136:[2,113],137:[2,113],138:[2,113],139:[2,113]},{25:[2,50]},{25:[2,51]},{1:[2,68],6:[2,68],25:[2,68],26:[2,68],40:[2,68],49:[2,68],54:[2,68],57:[2,68],66:[2,68],67:[2,68],68:[2,68],69:[2,68],71:[2,68],73:[2,68],74:[2,68],78:[2,68],80:[2,68],84:[2,68],85:[2,68],86:[2,68],91:[2,68],93:[2,68],102:[2,68],104:[2,68],105:[2,68],106:[2,68],110:[2,68],118:[2,68],126:[2,68],129:[2,68],130:[2,68],131:[2,68],132:[2,68],133:[2,68],134:[2,68],135:[2,68],136:[2,68],137:[2,68],138:[2,68],139:[2,68],140:[2,68]},{1:[2,71],6:[2,71],25:[2,71],26:[2,71],40:[2,71],49:[2,71],54:[2,71],57:[2,71],66:[2,71],67:[2,71],68:[2,71],69:[2,71],71:[2,71],73:[2,71],74:[2,71],78:[2,71],80:[2,71],84:[2,71],85:[2,71],86:[2,71],91:[2,71],93:[2,71],102:[2,71],104:[2,71],105:[2,71],106:[2,71],110:[2,71],118:[2,71],126:[2,71],129:[2,71],130:[2,71],131:[2,71],132:[2,71],133:[2,71],134:[2,71],135:[2,71],136:[2,71],137:[2,71],138:[2,71],139:[2,71],140:[2,71]},{7:151,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:152,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:153,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:155,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,24:154,25:[1,115],27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{27:160,28:[1,72],44:161,58:162,59:163,64:156,76:[1,69],89:[1,112],90:[1,56],113:157,114:[1,158],115:159},{112:164,116:[1,165],117:[1,166]},{6:[2,91],10:170,25:[2,91],27:171,28:[1,72],29:172,30:[1,70],31:[1,71],41:168,42:169,44:173,46:[1,45],54:[2,91],77:167,78:[2,91],89:[1,112]},{1:[2,26],6:[2,26],25:[2,26],26:[2,26],43:[2,26],49:[2,26],54:[2,26],57:[2,26],66:[2,26],67:[2,26],68:[2,26],69:[2,26],71:[2,26],73:[2,26],74:[2,26],78:[2,26],84:[2,26],85:[2,26],86:[2,26],91:[2,26],93:[2,26],102:[2,26],104:[2,26],105:[2,26],106:[2,26],110:[2,26],118:[2,26],126:[2,26],129:[2,26],130:[2,26],133:[2,26],134:[2,26],135:[2,26],136:[2,26],137:[2,26],138:[2,26],139:[2,26]},{1:[2,27],6:[2,27],25:[2,27],26:[2,27],43:[2,27],49:[2,27],54:[2,27],57:[2,27],66:[2,27],67:[2,27],68:[2,27],69:[2,27],71:[2,27],73:[2,27],74:[2,27],78:[2,27],84:[2,27],85:[2,27],86:[2,27],91:[2,27],93:[2,27],102:[2,27],104:[2,27],105:[2,27],106:[2,27],110:[2,27],118:[2,27],126:[2,27],129:[2,27],130:[2,27],133:[2,27],134:[2,27],135:[2,27],136:[2,27],137:[2,27],138:[2,27],139:[2,27]},{1:[2,25],6:[2,25],25:[2,25],26:[2,25],40:[2,25],43:[2,25],49:[2,25],54:[2,25],57:[2,25],66:[2,25],67:[2,25],68:[2,25],69:[2,25],71:[2,25],73:[2,25],74:[2,25],78:[2,25],80:[2,25],84:[2,25],85:[2,25],86:[2,25],91:[2,25],93:[2,25],102:[2,25],104:[2,25],105:[2,25],106:[2,25],110:[2,25],116:[2,25],117:[2,25],118:[2,25],126:[2,25],129:[2,25],130:[2,25],131:[2,25],132:[2,25],133:[2,25],134:[2,25],135:[2,25],136:[2,25],137:[2,25],138:[2,25],139:[2,25],140:[2,25]},{1:[2,5],5:174,6:[2,5],7:4,8:5,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,26:[2,5],27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],102:[2,5],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,196],6:[2,196],25:[2,196],26:[2,196],49:[2,196],54:[2,196],57:[2,196],73:[2,196],78:[2,196],86:[2,196],91:[2,196],93:[2,196],102:[2,196],104:[2,196],105:[2,196],106:[2,196],110:[2,196],118:[2,196],126:[2,196],129:[2,196],130:[2,196],133:[2,196],134:[2,196],135:[2,196],136:[2,196],137:[2,196],138:[2,196],139:[2,196]},{7:175,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:176,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:177,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:178,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:179,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:180,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:181,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:182,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:183,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,150],6:[2,150],25:[2,150],26:[2,150],49:[2,150],54:[2,150],57:[2,150],73:[2,150],78:[2,150],86:[2,150],91:[2,150],93:[2,150],102:[2,150],104:[2,150],105:[2,150],106:[2,150],110:[2,150],118:[2,150],126:[2,150],129:[2,150],130:[2,150],133:[2,150],134:[2,150],135:[2,150],136:[2,150],137:[2,150],138:[2,150],139:[2,150]},{1:[2,155],6:[2,155],25:[2,155],26:[2,155],49:[2,155],54:[2,155],57:[2,155],73:[2,155],78:[2,155],86:[2,155],91:[2,155],93:[2,155],102:[2,155],104:[2,155],105:[2,155],106:[2,155],110:[2,155],118:[2,155],126:[2,155],129:[2,155],130:[2,155],133:[2,155],134:[2,155],135:[2,155],136:[2,155],137:[2,155],138:[2,155],139:[2,155]},{7:184,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,149],6:[2,149],25:[2,149],26:[2,149],49:[2,149],54:[2,149],57:[2,149],73:[2,149],78:[2,149],86:[2,149],91:[2,149],93:[2,149],102:[2,149],104:[2,149],105:[2,149],106:[2,149],110:[2,149],118:[2,149],126:[2,149],129:[2,149],130:[2,149],133:[2,149],134:[2,149],135:[2,149],136:[2,149],137:[2,149],138:[2,149],139:[2,149]},{1:[2,154],6:[2,154],25:[2,154],26:[2,154],49:[2,154],54:[2,154],57:[2,154],73:[2,154],78:[2,154],86:[2,154],91:[2,154],93:[2,154],102:[2,154],104:[2,154],105:[2,154],106:[2,154],110:[2,154],118:[2,154],126:[2,154],129:[2,154],130:[2,154],133:[2,154],134:[2,154],135:[2,154],136:[2,154],137:[2,154],138:[2,154],139:[2,154]},{82:185,85:[1,103]},{1:[2,69],6:[2,69],25:[2,69],26:[2,69],40:[2,69],49:[2,69],54:[2,69],57:[2,69],66:[2,69],67:[2,69],68:[2,69],69:[2,69],71:[2,69],73:[2,69],74:[2,69],78:[2,69],80:[2,69],84:[2,69],85:[2,69],86:[2,69],91:[2,69],93:[2,69],102:[2,69],104:[2,69],105:[2,69],106:[2,69],110:[2,69],118:[2,69],126:[2,69],129:[2,69],130:[2,69],131:[2,69],132:[2,69],133:[2,69],134:[2,69],135:[2,69],136:[2,69],137:[2,69],138:[2,69],139:[2,69],140:[2,69]},{85:[2,109]},{27:186,28:[1,72]},{27:187,28:[1,72]},{1:[2,84],6:[2,84],25:[2,84],26:[2,84],27:188,28:[1,72],40:[2,84],49:[2,84],54:[2,84],57:[2,84],66:[2,84],67:[2,84],68:[2,84],69:[2,84],71:[2,84],73:[2,84],74:[2,84],78:[2,84],80:[2,84],84:[2,84],85:[2,84],86:[2,84],91:[2,84],93:[2,84],102:[2,84],104:[2,84],105:[2,84],106:[2,84],110:[2,84],118:[2,84],126:[2,84],129:[2,84],130:[2,84],131:[2,84],132:[2,84],133:[2,84],134:[2,84],135:[2,84],136:[2,84],137:[2,84],138:[2,84],139:[2,84],140:[2,84]},{27:189,28:[1,72]},{1:[2,85],6:[2,85],25:[2,85],26:[2,85],40:[2,85],49:[2,85],54:[2,85],57:[2,85],66:[2,85],67:[2,85],68:[2,85],69:[2,85],71:[2,85],73:[2,85],74:[2,85],78:[2,85],80:[2,85],84:[2,85],85:[2,85],86:[2,85],91:[2,85],93:[2,85],102:[2,85],104:[2,85],105:[2,85],106:[2,85],110:[2,85],118:[2,85],126:[2,85],129:[2,85],130:[2,85],131:[2,85],132:[2,85],133:[2,85],134:[2,85],135:[2,85],136:[2,85],137:[2,85],138:[2,85],139:[2,85],140:[2,85]},{7:191,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],57:[1,195],58:46,59:47,61:35,63:23,64:24,65:25,72:190,75:192,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],92:193,93:[1,194],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{70:196,71:[1,97],74:[1,98]},{82:197,85:[1,103]},{1:[2,70],6:[2,70],25:[2,70],26:[2,70],40:[2,70],49:[2,70],54:[2,70],57:[2,70],66:[2,70],67:[2,70],68:[2,70],69:[2,70],71:[2,70],73:[2,70],74:[2,70],78:[2,70],80:[2,70],84:[2,70],85:[2,70],86:[2,70],91:[2,70],93:[2,70],102:[2,70],104:[2,70],105:[2,70],106:[2,70],110:[2,70],118:[2,70],126:[2,70],129:[2,70],130:[2,70],131:[2,70],132:[2,70],133:[2,70],134:[2,70],135:[2,70],136:[2,70],137:[2,70],138:[2,70],139:[2,70],140:[2,70]},{6:[1,199],7:198,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,200],27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,107],6:[2,107],25:[2,107],26:[2,107],49:[2,107],54:[2,107],57:[2,107],66:[2,107],67:[2,107],68:[2,107],69:[2,107],71:[2,107],73:[2,107],74:[2,107],78:[2,107],84:[2,107],85:[2,107],86:[2,107],91:[2,107],93:[2,107],102:[2,107],104:[2,107],105:[2,107],106:[2,107],110:[2,107],118:[2,107],126:[2,107],129:[2,107],130:[2,107],133:[2,107],134:[2,107],135:[2,107],136:[2,107],137:[2,107],138:[2,107],139:[2,107]},{7:203,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,147],27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],57:[1,149],58:46,59:47,60:148,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],86:[1,201],87:202,88:[1,57],89:[1,58],90:[1,56],94:146,96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{6:[2,52],25:[2,52],49:[1,204],53:206,54:[1,205]},{6:[2,55],25:[2,55],26:[2,55],49:[2,55],54:[2,55]},{6:[2,59],25:[2,59],26:[2,59],40:[1,208],49:[2,59],54:[2,59],57:[1,207]},{6:[2,62],25:[2,62],26:[2,62],49:[2,62],54:[2,62]},{6:[2,63],25:[2,63],26:[2,63],40:[2,63],49:[2,63],54:[2,63],57:[2,63]},{6:[2,64],25:[2,64],26:[2,64],40:[2,64],49:[2,64],54:[2,64],57:[2,64]},{6:[2,65],25:[2,65],26:[2,65],40:[2,65],49:[2,65],54:[2,65],57:[2,65]},{6:[2,66],25:[2,66],26:[2,66],40:[2,66],49:[2,66],54:[2,66],57:[2,66]},{27:150,28:[1,72]},{7:203,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,147],27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],57:[1,149],58:46,59:47,60:148,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],87:145,88:[1,57],89:[1,58],90:[1,56],91:[1,144],94:146,96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,49],6:[2,49],25:[2,49],26:[2,49],49:[2,49],54:[2,49],57:[2,49],73:[2,49],78:[2,49],86:[2,49],91:[2,49],93:[2,49],102:[2,49],104:[2,49],105:[2,49],106:[2,49],110:[2,49],118:[2,49],126:[2,49],129:[2,49],130:[2,49],133:[2,49],134:[2,49],135:[2,49],136:[2,49],137:[2,49],138:[2,49],139:[2,49]},{4:210,5:3,7:4,8:5,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,26:[1,209],27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,188],6:[2,188],25:[2,188],26:[2,188],49:[2,188],54:[2,188],57:[2,188],73:[2,188],78:[2,188],86:[2,188],91:[2,188],93:[2,188],102:[2,188],103:84,104:[2,188],105:[2,188],106:[2,188],109:85,110:[2,188],111:68,118:[2,188],126:[2,188],129:[2,188],130:[2,188],133:[1,74],134:[2,188],135:[2,188],136:[2,188],137:[2,188],138:[2,188],139:[2,188]},{103:87,104:[1,64],106:[1,65],109:88,110:[1,67],111:68,126:[1,86]},{1:[2,189],6:[2,189],25:[2,189],26:[2,189],49:[2,189],54:[2,189],57:[2,189],73:[2,189],78:[2,189],86:[2,189],91:[2,189],93:[2,189],102:[2,189],103:84,104:[2,189],105:[2,189],106:[2,189],109:85,110:[2,189],111:68,118:[2,189],126:[2,189],129:[2,189],130:[2,189],133:[1,74],134:[2,189],135:[1,78],136:[2,189],137:[2,189],138:[2,189],139:[2,189]},{1:[2,190],6:[2,190],25:[2,190],26:[2,190],49:[2,190],54:[2,190],57:[2,190],73:[2,190],78:[2,190],86:[2,190],91:[2,190],93:[2,190],102:[2,190],103:84,104:[2,190],105:[2,190],106:[2,190],109:85,110:[2,190],111:68,118:[2,190],126:[2,190],129:[2,190],130:[2,190],133:[1,74],134:[2,190],135:[1,78],136:[2,190],137:[2,190],138:[2,190],139:[2,190]},{1:[2,191],6:[2,191],25:[2,191],26:[2,191],49:[2,191],54:[2,191],57:[2,191],73:[2,191],78:[2,191],86:[2,191],91:[2,191],93:[2,191],102:[2,191],103:84,104:[2,191],105:[2,191],106:[2,191],109:85,110:[2,191],111:68,118:[2,191],126:[2,191],129:[2,191],130:[2,191],133:[1,74],134:[2,191],135:[1,78],136:[2,191],137:[2,191],138:[2,191],139:[2,191]},{1:[2,192],6:[2,192],25:[2,192],26:[2,192],49:[2,192],54:[2,192],57:[2,192],66:[2,72],67:[2,72],68:[2,72],69:[2,72],71:[2,72],73:[2,192],74:[2,72],78:[2,192],84:[2,72],85:[2,72],86:[2,192],91:[2,192],93:[2,192],102:[2,192],104:[2,192],105:[2,192],106:[2,192],110:[2,192],118:[2,192],126:[2,192],129:[2,192],130:[2,192],133:[2,192],134:[2,192],135:[2,192],136:[2,192],137:[2,192],138:[2,192],139:[2,192]},{62:90,66:[1,92],67:[1,93],68:[1,94],69:[1,95],70:96,71:[1,97],74:[1,98],81:89,84:[1,91],85:[2,108]},{62:100,66:[1,92],67:[1,93],68:[1,94],69:[1,95],70:96,71:[1,97],74:[1,98],81:99,84:[1,91],85:[2,108]},{66:[2,75],67:[2,75],68:[2,75],69:[2,75],71:[2,75],74:[2,75],84:[2,75],85:[2,75]},{1:[2,193],6:[2,193],25:[2,193],26:[2,193],49:[2,193],54:[2,193],57:[2,193],66:[2,72],67:[2,72],68:[2,72],69:[2,72],71:[2,72],73:[2,193],74:[2,72],78:[2,193],84:[2,72],85:[2,72],86:[2,193],91:[2,193],93:[2,193],102:[2,193],104:[2,193],105:[2,193],106:[2,193],110:[2,193],118:[2,193],126:[2,193],129:[2,193],130:[2,193],133:[2,193],134:[2,193],135:[2,193],136:[2,193],137:[2,193],138:[2,193],139:[2,193]},{1:[2,194],6:[2,194],25:[2,194],26:[2,194],49:[2,194],54:[2,194],57:[2,194],73:[2,194],78:[2,194],86:[2,194],91:[2,194],93:[2,194],102:[2,194],104:[2,194],105:[2,194],106:[2,194],110:[2,194],118:[2,194],126:[2,194],129:[2,194],130:[2,194],133:[2,194],134:[2,194],135:[2,194],136:[2,194],137:[2,194],138:[2,194],139:[2,194]},{1:[2,195],6:[2,195],25:[2,195],26:[2,195],49:[2,195],54:[2,195],57:[2,195],73:[2,195],78:[2,195],86:[2,195],91:[2,195],93:[2,195],102:[2,195],104:[2,195],105:[2,195],106:[2,195],110:[2,195],118:[2,195],126:[2,195],129:[2,195],130:[2,195],133:[2,195],134:[2,195],135:[2,195],136:[2,195],137:[2,195],138:[2,195],139:[2,195]},{6:[1,213],7:211,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,212],27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:214,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{24:215,25:[1,115],125:[1,216]},{1:[2,134],6:[2,134],25:[2,134],26:[2,134],49:[2,134],54:[2,134],57:[2,134],73:[2,134],78:[2,134],86:[2,134],91:[2,134],93:[2,134],97:217,98:[1,218],99:[1,219],102:[2,134],104:[2,134],105:[2,134],106:[2,134],110:[2,134],118:[2,134],126:[2,134],129:[2,134],130:[2,134],133:[2,134],134:[2,134],135:[2,134],136:[2,134],137:[2,134],138:[2,134],139:[2,134]},{1:[2,148],6:[2,148],25:[2,148],26:[2,148],49:[2,148],54:[2,148],57:[2,148],73:[2,148],78:[2,148],86:[2,148],91:[2,148],93:[2,148],102:[2,148],104:[2,148],105:[2,148],106:[2,148],110:[2,148],118:[2,148],126:[2,148],129:[2,148],130:[2,148],133:[2,148],134:[2,148],135:[2,148],136:[2,148],137:[2,148],138:[2,148],139:[2,148]},{1:[2,156],6:[2,156],25:[2,156],26:[2,156],49:[2,156],54:[2,156],57:[2,156],73:[2,156],78:[2,156],86:[2,156],91:[2,156],93:[2,156],102:[2,156],104:[2,156],105:[2,156],106:[2,156],110:[2,156],118:[2,156],126:[2,156],129:[2,156],130:[2,156],133:[2,156],134:[2,156],135:[2,156],136:[2,156],137:[2,156],138:[2,156],139:[2,156]},{25:[1,220],103:84,104:[1,64],106:[1,65],109:85,110:[1,67],111:68,126:[1,83],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{120:221,122:222,123:[1,223]},{1:[2,97],6:[2,97],25:[2,97],26:[2,97],49:[2,97],54:[2,97],57:[2,97],73:[2,97],78:[2,97],86:[2,97],91:[2,97],93:[2,97],102:[2,97],104:[2,97],105:[2,97],106:[2,97],110:[2,97],118:[2,97],126:[2,97],129:[2,97],130:[2,97],133:[2,97],134:[2,97],135:[2,97],136:[2,97],137:[2,97],138:[2,97],139:[2,97]},{7:224,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,100],6:[2,100],24:225,25:[1,115],26:[2,100],49:[2,100],54:[2,100],57:[2,100],66:[2,72],67:[2,72],68:[2,72],69:[2,72],71:[2,72],73:[2,100],74:[2,72],78:[2,100],80:[1,226],84:[2,72],85:[2,72],86:[2,100],91:[2,100],93:[2,100],102:[2,100],104:[2,100],105:[2,100],106:[2,100],110:[2,100],118:[2,100],126:[2,100],129:[2,100],130:[2,100],133:[2,100],134:[2,100],135:[2,100],136:[2,100],137:[2,100],138:[2,100],139:[2,100]},{1:[2,141],6:[2,141],25:[2,141],26:[2,141],49:[2,141],54:[2,141],57:[2,141],73:[2,141],78:[2,141],86:[2,141],91:[2,141],93:[2,141],102:[2,141],103:84,104:[2,141],105:[2,141],106:[2,141],109:85,110:[2,141],111:68,118:[2,141],126:[2,141],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,45],6:[2,45],26:[2,45],102:[2,45],103:84,104:[2,45],106:[2,45],109:85,110:[2,45],111:68,126:[2,45],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{6:[1,73],102:[1,227]},{4:228,5:3,7:4,8:5,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{6:[2,129],25:[2,129],54:[2,129],57:[1,230],91:[2,129],92:229,93:[1,194],103:84,104:[1,64],106:[1,65],109:85,110:[1,67],111:68,126:[1,83],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,115],6:[2,115],25:[2,115],26:[2,115],40:[2,115],49:[2,115],54:[2,115],57:[2,115],66:[2,115],67:[2,115],68:[2,115],69:[2,115],71:[2,115],73:[2,115],74:[2,115],78:[2,115],84:[2,115],85:[2,115],86:[2,115],91:[2,115],93:[2,115],102:[2,115],104:[2,115],105:[2,115],106:[2,115],110:[2,115],116:[2,115],117:[2,115],118:[2,115],126:[2,115],129:[2,115],130:[2,115],133:[2,115],134:[2,115],135:[2,115],136:[2,115],137:[2,115],138:[2,115],139:[2,115]},{6:[2,52],25:[2,52],53:231,54:[1,232],91:[2,52]},{6:[2,124],25:[2,124],26:[2,124],54:[2,124],86:[2,124],91:[2,124]},{7:203,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,147],27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],57:[1,149],58:46,59:47,60:148,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],87:233,88:[1,57],89:[1,58],90:[1,56],94:146,96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{6:[2,130],25:[2,130],26:[2,130],54:[2,130],86:[2,130],91:[2,130]},{6:[2,131],25:[2,131],26:[2,131],54:[2,131],86:[2,131],91:[2,131]},{1:[2,114],6:[2,114],25:[2,114],26:[2,114],40:[2,114],43:[2,114],49:[2,114],54:[2,114],57:[2,114],66:[2,114],67:[2,114],68:[2,114],69:[2,114],71:[2,114],73:[2,114],74:[2,114],78:[2,114],80:[2,114],84:[2,114],85:[2,114],86:[2,114],91:[2,114],93:[2,114],102:[2,114],104:[2,114],105:[2,114],106:[2,114],110:[2,114],116:[2,114],117:[2,114],118:[2,114],126:[2,114],129:[2,114],130:[2,114],131:[2,114],132:[2,114],133:[2,114],134:[2,114],135:[2,114],136:[2,114],137:[2,114],138:[2,114],139:[2,114],140:[2,114]},{24:234,25:[1,115],103:84,104:[1,64],106:[1,65],109:85,110:[1,67],111:68,126:[1,83],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,144],6:[2,144],25:[2,144],26:[2,144],49:[2,144],54:[2,144],57:[2,144],73:[2,144],78:[2,144],86:[2,144],91:[2,144],93:[2,144],102:[2,144],103:84,104:[1,64],105:[1,235],106:[1,65],109:85,110:[1,67],111:68,118:[2,144],126:[2,144],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,146],6:[2,146],25:[2,146],26:[2,146],49:[2,146],54:[2,146],57:[2,146],73:[2,146],78:[2,146],86:[2,146],91:[2,146],93:[2,146],102:[2,146],103:84,104:[1,64],105:[1,236],106:[1,65],109:85,110:[1,67],111:68,118:[2,146],126:[2,146],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,152],6:[2,152],25:[2,152],26:[2,152],49:[2,152],54:[2,152],57:[2,152],73:[2,152],78:[2,152],86:[2,152],91:[2,152],93:[2,152],102:[2,152],104:[2,152],105:[2,152],106:[2,152],110:[2,152],118:[2,152],126:[2,152],129:[2,152],130:[2,152],133:[2,152],134:[2,152],135:[2,152],136:[2,152],137:[2,152],138:[2,152],139:[2,152]},{1:[2,153],6:[2,153],25:[2,153],26:[2,153],49:[2,153],54:[2,153],57:[2,153],73:[2,153],78:[2,153],86:[2,153],91:[2,153],93:[2,153],102:[2,153],103:84,104:[1,64],105:[2,153],106:[1,65],109:85,110:[1,67],111:68,118:[2,153],126:[2,153],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,157],6:[2,157],25:[2,157],26:[2,157],49:[2,157],54:[2,157],57:[2,157],73:[2,157],78:[2,157],86:[2,157],91:[2,157],93:[2,157],102:[2,157],104:[2,157],105:[2,157],106:[2,157],110:[2,157],118:[2,157],126:[2,157],129:[2,157],130:[2,157],133:[2,157],134:[2,157],135:[2,157],136:[2,157],137:[2,157],138:[2,157],139:[2,157]},{116:[2,159],117:[2,159]},{27:160,28:[1,72],44:161,58:162,59:163,76:[1,69],89:[1,112],90:[1,113],113:237,115:159},{54:[1,238],116:[2,165],117:[2,165]},{54:[2,161],116:[2,161],117:[2,161]},{54:[2,162],116:[2,162],117:[2,162]},{54:[2,163],116:[2,163],117:[2,163]},{54:[2,164],116:[2,164],117:[2,164]},{1:[2,158],6:[2,158],25:[2,158],26:[2,158],49:[2,158],54:[2,158],57:[2,158],73:[2,158],78:[2,158],86:[2,158],91:[2,158],93:[2,158],102:[2,158],104:[2,158],105:[2,158],106:[2,158],110:[2,158],118:[2,158],126:[2,158],129:[2,158],130:[2,158],133:[2,158],134:[2,158],135:[2,158],136:[2,158],137:[2,158],138:[2,158],139:[2,158]},{7:239,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:240,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{6:[2,52],25:[2,52],53:241,54:[1,242],78:[2,52]},{6:[2,92],25:[2,92],26:[2,92],54:[2,92],78:[2,92]},{6:[2,38],25:[2,38],26:[2,38],43:[1,243],54:[2,38],78:[2,38]},{6:[2,41],25:[2,41],26:[2,41],54:[2,41],78:[2,41]},{6:[2,42],25:[2,42],26:[2,42],43:[2,42],54:[2,42],78:[2,42]},{6:[2,43],25:[2,43],26:[2,43],43:[2,43],54:[2,43],78:[2,43]},{6:[2,44],25:[2,44],26:[2,44],43:[2,44],54:[2,44],78:[2,44]},{1:[2,4],6:[2,4],26:[2,4],102:[2,4]},{1:[2,197],6:[2,197],25:[2,197],26:[2,197],49:[2,197],54:[2,197],57:[2,197],73:[2,197],78:[2,197],86:[2,197],91:[2,197],93:[2,197],102:[2,197],103:84,104:[2,197],105:[2,197],106:[2,197],109:85,110:[2,197],111:68,118:[2,197],126:[2,197],129:[2,197],130:[2,197],133:[1,74],134:[1,77],135:[1,78],136:[2,197],137:[2,197],138:[2,197],139:[2,197]},{1:[2,198],6:[2,198],25:[2,198],26:[2,198],49:[2,198],54:[2,198],57:[2,198],73:[2,198],78:[2,198],86:[2,198],91:[2,198],93:[2,198],102:[2,198],103:84,104:[2,198],105:[2,198],106:[2,198],109:85,110:[2,198],111:68,118:[2,198],126:[2,198],129:[2,198],130:[2,198],133:[1,74],134:[1,77],135:[1,78],136:[2,198],137:[2,198],138:[2,198],139:[2,198]},{1:[2,199],6:[2,199],25:[2,199],26:[2,199],49:[2,199],54:[2,199],57:[2,199],73:[2,199],78:[2,199],86:[2,199],91:[2,199],93:[2,199],102:[2,199],103:84,104:[2,199],105:[2,199],106:[2,199],109:85,110:[2,199],111:68,118:[2,199],126:[2,199],129:[2,199],130:[2,199],133:[1,74],134:[2,199],135:[1,78],136:[2,199],137:[2,199],138:[2,199],139:[2,199]},{1:[2,200],6:[2,200],25:[2,200],26:[2,200],49:[2,200],54:[2,200],57:[2,200],73:[2,200],78:[2,200],86:[2,200],91:[2,200],93:[2,200],102:[2,200],103:84,104:[2,200],105:[2,200],106:[2,200],109:85,110:[2,200],111:68,118:[2,200],126:[2,200],129:[2,200],130:[2,200],133:[1,74],134:[2,200],135:[1,78],136:[2,200],137:[2,200],138:[2,200],139:[2,200]},{1:[2,201],6:[2,201],25:[2,201],26:[2,201],49:[2,201],54:[2,201],57:[2,201],73:[2,201],78:[2,201],86:[2,201],91:[2,201],93:[2,201],102:[2,201],103:84,104:[2,201],105:[2,201],106:[2,201],109:85,110:[2,201],111:68,118:[2,201],126:[2,201],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[2,201],137:[2,201],138:[2,201],139:[2,201]},{1:[2,202],6:[2,202],25:[2,202],26:[2,202],49:[2,202],54:[2,202],57:[2,202],73:[2,202],78:[2,202],86:[2,202],91:[2,202],93:[2,202],102:[2,202],103:84,104:[2,202],105:[2,202],106:[2,202],109:85,110:[2,202],111:68,118:[2,202],126:[2,202],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[2,202],138:[2,202],139:[1,82]},{1:[2,203],6:[2,203],25:[2,203],26:[2,203],49:[2,203],54:[2,203],57:[2,203],73:[2,203],78:[2,203],86:[2,203],91:[2,203],93:[2,203],102:[2,203],103:84,104:[2,203],105:[2,203],106:[2,203],109:85,110:[2,203],111:68,118:[2,203],126:[2,203],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[2,203],139:[1,82]},{1:[2,204],6:[2,204],25:[2,204],26:[2,204],49:[2,204],54:[2,204],57:[2,204],73:[2,204],78:[2,204],86:[2,204],91:[2,204],93:[2,204],102:[2,204],103:84,104:[2,204],105:[2,204],106:[2,204],109:85,110:[2,204],111:68,118:[2,204],126:[2,204],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[2,204],138:[2,204],139:[2,204]},{1:[2,187],6:[2,187],25:[2,187],26:[2,187],49:[2,187],54:[2,187],57:[2,187],73:[2,187],78:[2,187],86:[2,187],91:[2,187],93:[2,187],102:[2,187],103:84,104:[1,64],105:[2,187],106:[1,65],109:85,110:[1,67],111:68,118:[2,187],126:[2,187],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,186],6:[2,186],25:[2,186],26:[2,186],49:[2,186],54:[2,186],57:[2,186],73:[2,186],78:[2,186],86:[2,186],91:[2,186],93:[2,186],102:[2,186],103:84,104:[1,64],105:[2,186],106:[1,65],109:85,110:[1,67],111:68,118:[2,186],126:[2,186],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,104],6:[2,104],25:[2,104],26:[2,104],49:[2,104],54:[2,104],57:[2,104],66:[2,104],67:[2,104],68:[2,104],69:[2,104],71:[2,104],73:[2,104],74:[2,104],78:[2,104],84:[2,104],85:[2,104],86:[2,104],91:[2,104],93:[2,104],102:[2,104],104:[2,104],105:[2,104],106:[2,104],110:[2,104],118:[2,104],126:[2,104],129:[2,104],130:[2,104],133:[2,104],134:[2,104],135:[2,104],136:[2,104],137:[2,104],138:[2,104],139:[2,104]},{1:[2,80],6:[2,80],25:[2,80],26:[2,80],40:[2,80],49:[2,80],54:[2,80],57:[2,80],66:[2,80],67:[2,80],68:[2,80],69:[2,80],71:[2,80],73:[2,80],74:[2,80],78:[2,80],80:[2,80],84:[2,80],85:[2,80],86:[2,80],91:[2,80],93:[2,80],102:[2,80],104:[2,80],105:[2,80],106:[2,80],110:[2,80],118:[2,80],126:[2,80],129:[2,80],130:[2,80],131:[2,80],132:[2,80],133:[2,80],134:[2,80],135:[2,80],136:[2,80],137:[2,80],138:[2,80],139:[2,80],140:[2,80]},{1:[2,81],6:[2,81],25:[2,81],26:[2,81],40:[2,81],49:[2,81],54:[2,81],57:[2,81],66:[2,81],67:[2,81],68:[2,81],69:[2,81],71:[2,81],73:[2,81],74:[2,81],78:[2,81],80:[2,81],84:[2,81],85:[2,81],86:[2,81],91:[2,81],93:[2,81],102:[2,81],104:[2,81],105:[2,81],106:[2,81],110:[2,81],118:[2,81],126:[2,81],129:[2,81],130:[2,81],131:[2,81],132:[2,81],133:[2,81],134:[2,81],135:[2,81],136:[2,81],137:[2,81],138:[2,81],139:[2,81],140:[2,81]},{1:[2,82],6:[2,82],25:[2,82],26:[2,82],40:[2,82],49:[2,82],54:[2,82],57:[2,82],66:[2,82],67:[2,82],68:[2,82],69:[2,82],71:[2,82],73:[2,82],74:[2,82],78:[2,82],80:[2,82],84:[2,82],85:[2,82],86:[2,82],91:[2,82],93:[2,82],102:[2,82],104:[2,82],105:[2,82],106:[2,82],110:[2,82],118:[2,82],126:[2,82],129:[2,82],130:[2,82],131:[2,82],132:[2,82],133:[2,82],134:[2,82],135:[2,82],136:[2,82],137:[2,82],138:[2,82],139:[2,82],140:[2,82]},{1:[2,83],6:[2,83],25:[2,83],26:[2,83],40:[2,83],49:[2,83],54:[2,83],57:[2,83],66:[2,83],67:[2,83],68:[2,83],69:[2,83],71:[2,83],73:[2,83],74:[2,83],78:[2,83],80:[2,83],84:[2,83],85:[2,83],86:[2,83],91:[2,83],93:[2,83],102:[2,83],104:[2,83],105:[2,83],106:[2,83],110:[2,83],118:[2,83],126:[2,83],129:[2,83],130:[2,83],131:[2,83],132:[2,83],133:[2,83],134:[2,83],135:[2,83],136:[2,83],137:[2,83],138:[2,83],139:[2,83],140:[2,83]},{73:[1,244]},{57:[1,195],73:[2,88],92:245,93:[1,194],103:84,104:[1,64],106:[1,65],109:85,110:[1,67],111:68,126:[1,83],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{73:[2,89]},{7:246,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,73:[2,123],76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{11:[2,117],28:[2,117],30:[2,117],31:[2,117],33:[2,117],34:[2,117],35:[2,117],36:[2,117],37:[2,117],38:[2,117],45:[2,117],46:[2,117],47:[2,117],51:[2,117],52:[2,117],73:[2,117],76:[2,117],79:[2,117],83:[2,117],88:[2,117],89:[2,117],90:[2,117],96:[2,117],100:[2,117],101:[2,117],104:[2,117],106:[2,117],108:[2,117],110:[2,117],119:[2,117],125:[2,117],127:[2,117],128:[2,117],129:[2,117],130:[2,117],131:[2,117],132:[2,117]},{11:[2,118],28:[2,118],30:[2,118],31:[2,118],33:[2,118],34:[2,118],35:[2,118],36:[2,118],37:[2,118],38:[2,118],45:[2,118],46:[2,118],47:[2,118],51:[2,118],52:[2,118],73:[2,118],76:[2,118],79:[2,118],83:[2,118],88:[2,118],89:[2,118],90:[2,118],96:[2,118],100:[2,118],101:[2,118],104:[2,118],106:[2,118],108:[2,118],110:[2,118],119:[2,118],125:[2,118],127:[2,118],128:[2,118],129:[2,118],130:[2,118],131:[2,118],132:[2,118]},{1:[2,87],6:[2,87],25:[2,87],26:[2,87],40:[2,87],49:[2,87],54:[2,87],57:[2,87],66:[2,87],67:[2,87],68:[2,87],69:[2,87],71:[2,87],73:[2,87],74:[2,87],78:[2,87],80:[2,87],84:[2,87],85:[2,87],86:[2,87],91:[2,87],93:[2,87],102:[2,87],104:[2,87],105:[2,87],106:[2,87],110:[2,87],118:[2,87],126:[2,87],129:[2,87],130:[2,87],131:[2,87],132:[2,87],133:[2,87],134:[2,87],135:[2,87],136:[2,87],137:[2,87],138:[2,87],139:[2,87],140:[2,87]},{1:[2,105],6:[2,105],25:[2,105],26:[2,105],49:[2,105],54:[2,105],57:[2,105],66:[2,105],67:[2,105],68:[2,105],69:[2,105],71:[2,105],73:[2,105],74:[2,105],78:[2,105],84:[2,105],85:[2,105],86:[2,105],91:[2,105],93:[2,105],102:[2,105],104:[2,105],105:[2,105],106:[2,105],110:[2,105],118:[2,105],126:[2,105],129:[2,105],130:[2,105],133:[2,105],134:[2,105],135:[2,105],136:[2,105],137:[2,105],138:[2,105],139:[2,105]},{1:[2,35],6:[2,35],25:[2,35],26:[2,35],49:[2,35],54:[2,35],57:[2,35],73:[2,35],78:[2,35],86:[2,35],91:[2,35],93:[2,35],102:[2,35],103:84,104:[2,35],105:[2,35],106:[2,35],109:85,110:[2,35],111:68,118:[2,35],126:[2,35],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{7:247,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:248,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,110],6:[2,110],25:[2,110],26:[2,110],49:[2,110],54:[2,110],57:[2,110],66:[2,110],67:[2,110],68:[2,110],69:[2,110],71:[2,110],73:[2,110],74:[2,110],78:[2,110],84:[2,110],85:[2,110],86:[2,110],91:[2,110],93:[2,110],102:[2,110],104:[2,110],105:[2,110],106:[2,110],110:[2,110],118:[2,110],126:[2,110],129:[2,110],130:[2,110],133:[2,110],134:[2,110],135:[2,110],136:[2,110],137:[2,110],138:[2,110],139:[2,110]},{6:[2,52],25:[2,52],53:249,54:[1,232],86:[2,52]},{6:[2,129],25:[2,129],26:[2,129],54:[2,129],57:[1,250],86:[2,129],91:[2,129],103:84,104:[1,64],106:[1,65],109:85,110:[1,67],111:68,126:[1,83],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{50:251,51:[1,59],52:[1,60]},{6:[2,53],25:[2,53],26:[2,53],27:108,28:[1,72],44:109,55:252,56:106,57:[1,107],58:110,59:111,76:[1,69],89:[1,112],90:[1,113]},{6:[1,253],25:[1,254]},{6:[2,60],25:[2,60],26:[2,60],49:[2,60],54:[2,60]},{7:255,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,23],6:[2,23],25:[2,23],26:[2,23],49:[2,23],54:[2,23],57:[2,23],73:[2,23],78:[2,23],86:[2,23],91:[2,23],93:[2,23],98:[2,23],99:[2,23],102:[2,23],104:[2,23],105:[2,23],106:[2,23],110:[2,23],118:[2,23],121:[2,23],123:[2,23],126:[2,23],129:[2,23],130:[2,23],133:[2,23],134:[2,23],135:[2,23],136:[2,23],137:[2,23],138:[2,23],139:[2,23]},{6:[1,73],26:[1,256]},{1:[2,205],6:[2,205],25:[2,205],26:[2,205],49:[2,205],54:[2,205],57:[2,205],73:[2,205],78:[2,205],86:[2,205],91:[2,205],93:[2,205],102:[2,205],103:84,104:[2,205],105:[2,205],106:[2,205],109:85,110:[2,205],111:68,118:[2,205],126:[2,205],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{7:257,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:258,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,208],6:[2,208],25:[2,208],26:[2,208],49:[2,208],54:[2,208],57:[2,208],73:[2,208],78:[2,208],86:[2,208],91:[2,208],93:[2,208],102:[2,208],103:84,104:[2,208],105:[2,208],106:[2,208],109:85,110:[2,208],111:68,118:[2,208],126:[2,208],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,185],6:[2,185],25:[2,185],26:[2,185],49:[2,185],54:[2,185],57:[2,185],73:[2,185],78:[2,185],86:[2,185],91:[2,185],93:[2,185],102:[2,185],104:[2,185],105:[2,185],106:[2,185],110:[2,185],118:[2,185],126:[2,185],129:[2,185],130:[2,185],133:[2,185],134:[2,185],135:[2,185],136:[2,185],137:[2,185],138:[2,185],139:[2,185]},{7:259,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,135],6:[2,135],25:[2,135],26:[2,135],49:[2,135],54:[2,135],57:[2,135],73:[2,135],78:[2,135],86:[2,135],91:[2,135],93:[2,135],98:[1,260],102:[2,135],104:[2,135],105:[2,135],106:[2,135],110:[2,135],118:[2,135],126:[2,135],129:[2,135],130:[2,135],133:[2,135],134:[2,135],135:[2,135],136:[2,135],137:[2,135],138:[2,135],139:[2,135]},{24:261,25:[1,115]},{24:264,25:[1,115],27:262,28:[1,72],59:263,76:[1,69]},{120:265,122:222,123:[1,223]},{26:[1,266],121:[1,267],122:268,123:[1,223]},{26:[2,178],121:[2,178],123:[2,178]},{7:270,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],95:269,96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,98],6:[2,98],24:271,25:[1,115],26:[2,98],49:[2,98],54:[2,98],57:[2,98],73:[2,98],78:[2,98],86:[2,98],91:[2,98],93:[2,98],102:[2,98],103:84,104:[1,64],105:[2,98],106:[1,65],109:85,110:[1,67],111:68,118:[2,98],126:[2,98],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,101],6:[2,101],25:[2,101],26:[2,101],49:[2,101],54:[2,101],57:[2,101],73:[2,101],78:[2,101],86:[2,101],91:[2,101],93:[2,101],102:[2,101],104:[2,101],105:[2,101],106:[2,101],110:[2,101],118:[2,101],126:[2,101],129:[2,101],130:[2,101],133:[2,101],134:[2,101],135:[2,101],136:[2,101],137:[2,101],138:[2,101],139:[2,101]},{7:272,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,142],6:[2,142],25:[2,142],26:[2,142],49:[2,142],54:[2,142],57:[2,142],66:[2,142],67:[2,142],68:[2,142],69:[2,142],71:[2,142],73:[2,142],74:[2,142],78:[2,142],84:[2,142],85:[2,142],86:[2,142],91:[2,142],93:[2,142],102:[2,142],104:[2,142],105:[2,142],106:[2,142],110:[2,142],118:[2,142],126:[2,142],129:[2,142],130:[2,142],133:[2,142],134:[2,142],135:[2,142],136:[2,142],137:[2,142],138:[2,142],139:[2,142]},{6:[1,73],26:[1,273]},{7:274,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{6:[2,67],11:[2,118],25:[2,67],28:[2,118],30:[2,118],31:[2,118],33:[2,118],34:[2,118],35:[2,118],36:[2,118],37:[2,118],38:[2,118],45:[2,118],46:[2,118],47:[2,118],51:[2,118],52:[2,118],54:[2,67],76:[2,118],79:[2,118],83:[2,118],88:[2,118],89:[2,118],90:[2,118],91:[2,67],96:[2,118],100:[2,118],101:[2,118],104:[2,118],106:[2,118],108:[2,118],110:[2,118],119:[2,118],125:[2,118],127:[2,118],128:[2,118],129:[2,118],130:[2,118],131:[2,118],132:[2,118]},{6:[1,276],25:[1,277],91:[1,275]},{6:[2,53],7:203,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[2,53],26:[2,53],27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],57:[1,149],58:46,59:47,60:148,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],86:[2,53],88:[1,57],89:[1,58],90:[1,56],91:[2,53],94:278,96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{6:[2,52],25:[2,52],26:[2,52],53:279,54:[1,232]},{1:[2,182],6:[2,182],25:[2,182],26:[2,182],49:[2,182],54:[2,182],57:[2,182],73:[2,182],78:[2,182],86:[2,182],91:[2,182],93:[2,182],102:[2,182],104:[2,182],105:[2,182],106:[2,182],110:[2,182],118:[2,182],121:[2,182],126:[2,182],129:[2,182],130:[2,182],133:[2,182],134:[2,182],135:[2,182],136:[2,182],137:[2,182],138:[2,182],139:[2,182]},{7:280,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:281,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{116:[2,160],117:[2,160]},{27:160,28:[1,72],44:161,58:162,59:163,76:[1,69],89:[1,112],90:[1,113],115:282},{1:[2,167],6:[2,167],25:[2,167],26:[2,167],49:[2,167],54:[2,167],57:[2,167],73:[2,167],78:[2,167],86:[2,167],91:[2,167],93:[2,167],102:[2,167],103:84,104:[2,167],105:[1,283],106:[2,167],109:85,110:[2,167],111:68,118:[1,284],126:[2,167],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,168],6:[2,168],25:[2,168],26:[2,168],49:[2,168],54:[2,168],57:[2,168],73:[2,168],78:[2,168],86:[2,168],91:[2,168],93:[2,168],102:[2,168],103:84,104:[2,168],105:[1,285],106:[2,168],109:85,110:[2,168],111:68,118:[2,168],126:[2,168],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{6:[1,287],25:[1,288],78:[1,286]},{6:[2,53],10:170,25:[2,53],26:[2,53],27:171,28:[1,72],29:172,30:[1,70],31:[1,71],41:289,42:169,44:173,46:[1,45],78:[2,53],89:[1,112]},{7:290,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,291],27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,86],6:[2,86],25:[2,86],26:[2,86],40:[2,86],49:[2,86],54:[2,86],57:[2,86],66:[2,86],67:[2,86],68:[2,86],69:[2,86],71:[2,86],73:[2,86],74:[2,86],78:[2,86],80:[2,86],84:[2,86],85:[2,86],86:[2,86],91:[2,86],93:[2,86],102:[2,86],104:[2,86],105:[2,86],106:[2,86],110:[2,86],118:[2,86],126:[2,86],129:[2,86],130:[2,86],131:[2,86],132:[2,86],133:[2,86],134:[2,86],135:[2,86],136:[2,86],137:[2,86],138:[2,86],139:[2,86],140:[2,86]},{7:292,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,73:[2,121],76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{73:[2,122],103:84,104:[1,64],106:[1,65],109:85,110:[1,67],111:68,126:[1,83],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,36],6:[2,36],25:[2,36],26:[2,36],49:[2,36],54:[2,36],57:[2,36],73:[2,36],78:[2,36],86:[2,36],91:[2,36],93:[2,36],102:[2,36],103:84,104:[2,36],105:[2,36],106:[2,36],109:85,110:[2,36],111:68,118:[2,36],126:[2,36],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{26:[1,293],103:84,104:[1,64],106:[1,65],109:85,110:[1,67],111:68,126:[1,83],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{6:[1,276],25:[1,277],86:[1,294]},{6:[2,67],25:[2,67],26:[2,67],54:[2,67],86:[2,67],91:[2,67]},{24:295,25:[1,115]},{6:[2,56],25:[2,56],26:[2,56],49:[2,56],54:[2,56]},{27:108,28:[1,72],44:109,55:296,56:106,57:[1,107],58:110,59:111,76:[1,69],89:[1,112],90:[1,113]},{6:[2,54],25:[2,54],26:[2,54],27:108,28:[1,72],44:109,48:297,54:[2,54],55:105,56:106,57:[1,107],58:110,59:111,76:[1,69],89:[1,112],90:[1,113]},{6:[2,61],25:[2,61],26:[2,61],49:[2,61],54:[2,61],103:84,104:[1,64],106:[1,65],109:85,110:[1,67],111:68,126:[1,83],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,24],6:[2,24],25:[2,24],26:[2,24],49:[2,24],54:[2,24],57:[2,24],73:[2,24],78:[2,24],86:[2,24],91:[2,24],93:[2,24],98:[2,24],99:[2,24],102:[2,24],104:[2,24],105:[2,24],106:[2,24],110:[2,24],118:[2,24],121:[2,24],123:[2,24],126:[2,24],129:[2,24],130:[2,24],133:[2,24],134:[2,24],135:[2,24],136:[2,24],137:[2,24],138:[2,24],139:[2,24]},{26:[1,298],103:84,104:[1,64],106:[1,65],109:85,110:[1,67],111:68,126:[1,83],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,207],6:[2,207],25:[2,207],26:[2,207],49:[2,207],54:[2,207],57:[2,207],73:[2,207],78:[2,207],86:[2,207],91:[2,207],93:[2,207],102:[2,207],103:84,104:[2,207],105:[2,207],106:[2,207],109:85,110:[2,207],111:68,118:[2,207],126:[2,207],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{24:299,25:[1,115],103:84,104:[1,64],106:[1,65],109:85,110:[1,67],111:68,126:[1,83],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{24:300,25:[1,115]},{1:[2,136],6:[2,136],25:[2,136],26:[2,136],49:[2,136],54:[2,136],57:[2,136],73:[2,136],78:[2,136],86:[2,136],91:[2,136],93:[2,136],102:[2,136],104:[2,136],105:[2,136],106:[2,136],110:[2,136],118:[2,136],126:[2,136],129:[2,136],130:[2,136],133:[2,136],134:[2,136],135:[2,136],136:[2,136],137:[2,136],138:[2,136],139:[2,136]},{24:301,25:[1,115]},{24:302,25:[1,115]},{1:[2,140],6:[2,140],25:[2,140],26:[2,140],49:[2,140],54:[2,140],57:[2,140],73:[2,140],78:[2,140],86:[2,140],91:[2,140],93:[2,140],98:[2,140],102:[2,140],104:[2,140],105:[2,140],106:[2,140],110:[2,140],118:[2,140],126:[2,140],129:[2,140],130:[2,140],133:[2,140],134:[2,140],135:[2,140],136:[2,140],137:[2,140],138:[2,140],139:[2,140]},{26:[1,303],121:[1,304],122:268,123:[1,223]},{1:[2,176],6:[2,176],25:[2,176],26:[2,176],49:[2,176],54:[2,176],57:[2,176],73:[2,176],78:[2,176],86:[2,176],91:[2,176],93:[2,176],102:[2,176],104:[2,176],105:[2,176],106:[2,176],110:[2,176],118:[2,176],126:[2,176],129:[2,176],130:[2,176],133:[2,176],134:[2,176],135:[2,176],136:[2,176],137:[2,176],138:[2,176],139:[2,176]},{24:305,25:[1,115]},{26:[2,179],121:[2,179],123:[2,179]},{24:306,25:[1,115],54:[1,307]},{25:[2,132],54:[2,132],103:84,104:[1,64],106:[1,65],109:85,110:[1,67],111:68,126:[1,83],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,99],6:[2,99],25:[2,99],26:[2,99],49:[2,99],54:[2,99],57:[2,99],73:[2,99],78:[2,99],86:[2,99],91:[2,99],93:[2,99],102:[2,99],104:[2,99],105:[2,99],106:[2,99],110:[2,99],118:[2,99],126:[2,99],129:[2,99],130:[2,99],133:[2,99],134:[2,99],135:[2,99],136:[2,99],137:[2,99],138:[2,99],139:[2,99]},{1:[2,102],6:[2,102],24:308,25:[1,115],26:[2,102],49:[2,102],54:[2,102],57:[2,102],73:[2,102],78:[2,102],86:[2,102],91:[2,102],93:[2,102],102:[2,102],103:84,104:[1,64],105:[2,102],106:[1,65],109:85,110:[1,67],111:68,118:[2,102],126:[2,102],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{102:[1,309]},{91:[1,310],103:84,104:[1,64],106:[1,65],109:85,110:[1,67],111:68,126:[1,83],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,116],6:[2,116],25:[2,116],26:[2,116],40:[2,116],49:[2,116],54:[2,116],57:[2,116],66:[2,116],67:[2,116],68:[2,116],69:[2,116],71:[2,116],73:[2,116],74:[2,116],78:[2,116],84:[2,116],85:[2,116],86:[2,116],91:[2,116],93:[2,116],102:[2,116],104:[2,116],105:[2,116],106:[2,116],110:[2,116],116:[2,116],117:[2,116],118:[2,116],126:[2,116],129:[2,116],130:[2,116],133:[2,116],134:[2,116],135:[2,116],136:[2,116],137:[2,116],138:[2,116],139:[2,116]},{7:203,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],57:[1,149],58:46,59:47,60:148,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],94:311,96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:203,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,147],27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],57:[1,149],58:46,59:47,60:148,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],87:312,88:[1,57],89:[1,58],90:[1,56],94:146,96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{6:[2,125],25:[2,125],26:[2,125],54:[2,125],86:[2,125],91:[2,125]},{6:[1,276],25:[1,277],26:[1,313]},{1:[2,145],6:[2,145],25:[2,145],26:[2,145],49:[2,145],54:[2,145],57:[2,145],73:[2,145],78:[2,145],86:[2,145],91:[2,145],93:[2,145],102:[2,145],103:84,104:[1,64],105:[2,145],106:[1,65],109:85,110:[1,67],111:68,118:[2,145],126:[2,145],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,147],6:[2,147],25:[2,147],26:[2,147],49:[2,147],54:[2,147],57:[2,147],73:[2,147],78:[2,147],86:[2,147],91:[2,147],93:[2,147],102:[2,147],103:84,104:[1,64],105:[2,147],106:[1,65],109:85,110:[1,67],111:68,118:[2,147],126:[2,147],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{116:[2,166],117:[2,166]},{7:314,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:315,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:316,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,90],6:[2,90],25:[2,90],26:[2,90],40:[2,90],49:[2,90],54:[2,90],57:[2,90],66:[2,90],67:[2,90],68:[2,90],69:[2,90],71:[2,90],73:[2,90],74:[2,90],78:[2,90],84:[2,90],85:[2,90],86:[2,90],91:[2,90],93:[2,90],102:[2,90],104:[2,90],105:[2,90],106:[2,90],110:[2,90],116:[2,90],117:[2,90],118:[2,90],126:[2,90],129:[2,90],130:[2,90],133:[2,90],134:[2,90],135:[2,90],136:[2,90],137:[2,90],138:[2,90],139:[2,90]},{10:170,27:171,28:[1,72],29:172,30:[1,70],31:[1,71],41:317,42:169,44:173,46:[1,45],89:[1,112]},{6:[2,91],10:170,25:[2,91],26:[2,91],27:171,28:[1,72],29:172,30:[1,70],31:[1,71],41:168,42:169,44:173,46:[1,45],54:[2,91],77:318,89:[1,112]},{6:[2,93],25:[2,93],26:[2,93],54:[2,93],78:[2,93]},{6:[2,39],25:[2,39],26:[2,39],54:[2,39],78:[2,39],103:84,104:[1,64],106:[1,65],109:85,110:[1,67],111:68,126:[1,83],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{7:319,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{73:[2,120],103:84,104:[1,64],106:[1,65],109:85,110:[1,67],111:68,126:[1,83],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,37],6:[2,37],25:[2,37],26:[2,37],49:[2,37],54:[2,37],57:[2,37],73:[2,37],78:[2,37],86:[2,37],91:[2,37],93:[2,37],102:[2,37],104:[2,37],105:[2,37],106:[2,37],110:[2,37],118:[2,37],126:[2,37],129:[2,37],130:[2,37],133:[2,37],134:[2,37],135:[2,37],136:[2,37],137:[2,37],138:[2,37],139:[2,37]},{1:[2,111],6:[2,111],25:[2,111],26:[2,111],49:[2,111],54:[2,111],57:[2,111],66:[2,111],67:[2,111],68:[2,111],69:[2,111],71:[2,111],73:[2,111],74:[2,111],78:[2,111],84:[2,111],85:[2,111],86:[2,111],91:[2,111],93:[2,111],102:[2,111],104:[2,111],105:[2,111],106:[2,111],110:[2,111],118:[2,111],126:[2,111],129:[2,111],130:[2,111],133:[2,111],134:[2,111],135:[2,111],136:[2,111],137:[2,111],138:[2,111],139:[2,111]},{1:[2,48],6:[2,48],25:[2,48],26:[2,48],49:[2,48],54:[2,48],57:[2,48],73:[2,48],78:[2,48],86:[2,48],91:[2,48],93:[2,48],102:[2,48],104:[2,48],105:[2,48],106:[2,48],110:[2,48],118:[2,48],126:[2,48],129:[2,48],130:[2,48],133:[2,48],134:[2,48],135:[2,48],136:[2,48],137:[2,48],138:[2,48],139:[2,48]},{6:[2,57],25:[2,57],26:[2,57],49:[2,57],54:[2,57]},{6:[2,52],25:[2,52],26:[2,52],53:320,54:[1,205]},{1:[2,206],6:[2,206],25:[2,206],26:[2,206],49:[2,206],54:[2,206],57:[2,206],73:[2,206],78:[2,206],86:[2,206],91:[2,206],93:[2,206],102:[2,206],104:[2,206],105:[2,206],106:[2,206],110:[2,206],118:[2,206],126:[2,206],129:[2,206],130:[2,206],133:[2,206],134:[2,206],135:[2,206],136:[2,206],137:[2,206],138:[2,206],139:[2,206]},{1:[2,183],6:[2,183],25:[2,183],26:[2,183],49:[2,183],54:[2,183],57:[2,183],73:[2,183],78:[2,183],86:[2,183],91:[2,183],93:[2,183],102:[2,183],104:[2,183],105:[2,183],106:[2,183],110:[2,183],118:[2,183],121:[2,183],126:[2,183],129:[2,183],130:[2,183],133:[2,183],134:[2,183],135:[2,183],136:[2,183],137:[2,183],138:[2,183],139:[2,183]},{1:[2,137],6:[2,137],25:[2,137],26:[2,137],49:[2,137],54:[2,137],57:[2,137],73:[2,137],78:[2,137],86:[2,137],91:[2,137],93:[2,137],102:[2,137],104:[2,137],105:[2,137],106:[2,137],110:[2,137],118:[2,137],126:[2,137],129:[2,137],130:[2,137],133:[2,137],134:[2,137],135:[2,137],136:[2,137],137:[2,137],138:[2,137],139:[2,137]},{1:[2,138],6:[2,138],25:[2,138],26:[2,138],49:[2,138],54:[2,138],57:[2,138],73:[2,138],78:[2,138],86:[2,138],91:[2,138],93:[2,138],98:[2,138],102:[2,138],104:[2,138],105:[2,138],106:[2,138],110:[2,138],118:[2,138],126:[2,138],129:[2,138],130:[2,138],133:[2,138],134:[2,138],135:[2,138],136:[2,138],137:[2,138],138:[2,138],139:[2,138]},{1:[2,139],6:[2,139],25:[2,139],26:[2,139],49:[2,139],54:[2,139],57:[2,139],73:[2,139],78:[2,139],86:[2,139],91:[2,139],93:[2,139],98:[2,139],102:[2,139],104:[2,139],105:[2,139],106:[2,139],110:[2,139],118:[2,139],126:[2,139],129:[2,139],130:[2,139],133:[2,139],134:[2,139],135:[2,139],136:[2,139],137:[2,139],138:[2,139],139:[2,139]},{1:[2,174],6:[2,174],25:[2,174],26:[2,174],49:[2,174],54:[2,174],57:[2,174],73:[2,174],78:[2,174],86:[2,174],91:[2,174],93:[2,174],102:[2,174],104:[2,174],105:[2,174],106:[2,174],110:[2,174],118:[2,174],126:[2,174],129:[2,174],130:[2,174],133:[2,174],134:[2,174],135:[2,174],136:[2,174],137:[2,174],138:[2,174],139:[2,174]},{24:321,25:[1,115]},{26:[1,322]},{6:[1,323],26:[2,180],121:[2,180],123:[2,180]},{7:324,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{1:[2,103],6:[2,103],25:[2,103],26:[2,103],49:[2,103],54:[2,103],57:[2,103],73:[2,103],78:[2,103],86:[2,103],91:[2,103],93:[2,103],102:[2,103],104:[2,103],105:[2,103],106:[2,103],110:[2,103],118:[2,103],126:[2,103],129:[2,103],130:[2,103],133:[2,103],134:[2,103],135:[2,103],136:[2,103],137:[2,103],138:[2,103],139:[2,103]},{1:[2,143],6:[2,143],25:[2,143],26:[2,143],49:[2,143],54:[2,143],57:[2,143],66:[2,143],67:[2,143],68:[2,143],69:[2,143],71:[2,143],73:[2,143],74:[2,143],78:[2,143],84:[2,143],85:[2,143],86:[2,143],91:[2,143],93:[2,143],102:[2,143],104:[2,143],105:[2,143],106:[2,143],110:[2,143],118:[2,143],126:[2,143],129:[2,143],130:[2,143],133:[2,143],134:[2,143],135:[2,143],136:[2,143],137:[2,143],138:[2,143],139:[2,143]},{1:[2,119],6:[2,119],25:[2,119],26:[2,119],49:[2,119],54:[2,119],57:[2,119],66:[2,119],67:[2,119],68:[2,119],69:[2,119],71:[2,119],73:[2,119],74:[2,119],78:[2,119],84:[2,119],85:[2,119],86:[2,119],91:[2,119],93:[2,119],102:[2,119],104:[2,119],105:[2,119],106:[2,119],110:[2,119],118:[2,119],126:[2,119],129:[2,119],130:[2,119],133:[2,119],134:[2,119],135:[2,119],136:[2,119],137:[2,119],138:[2,119],139:[2,119]},{6:[2,126],25:[2,126],26:[2,126],54:[2,126],86:[2,126],91:[2,126]},{6:[2,52],25:[2,52],26:[2,52],53:325,54:[1,232]},{6:[2,127],25:[2,127],26:[2,127],54:[2,127],86:[2,127],91:[2,127]},{1:[2,169],6:[2,169],25:[2,169],26:[2,169],49:[2,169],54:[2,169],57:[2,169],73:[2,169],78:[2,169],86:[2,169],91:[2,169],93:[2,169],102:[2,169],103:84,104:[2,169],105:[2,169],106:[2,169],109:85,110:[2,169],111:68,118:[1,326],126:[2,169],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,171],6:[2,171],25:[2,171],26:[2,171],49:[2,171],54:[2,171],57:[2,171],73:[2,171],78:[2,171],86:[2,171],91:[2,171],93:[2,171],102:[2,171],103:84,104:[2,171],105:[1,327],106:[2,171],109:85,110:[2,171],111:68,118:[2,171],126:[2,171],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,170],6:[2,170],25:[2,170],26:[2,170],49:[2,170],54:[2,170],57:[2,170],73:[2,170],78:[2,170],86:[2,170],91:[2,170],93:[2,170],102:[2,170],103:84,104:[2,170],105:[2,170],106:[2,170],109:85,110:[2,170],111:68,118:[2,170],126:[2,170],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{6:[2,94],25:[2,94],26:[2,94],54:[2,94],78:[2,94]},{6:[2,52],25:[2,52],26:[2,52],53:328,54:[1,242]},{26:[1,329],103:84,104:[1,64],106:[1,65],109:85,110:[1,67],111:68,126:[1,83],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{6:[1,253],25:[1,254],26:[1,330]},{26:[1,331]},{1:[2,177],6:[2,177],25:[2,177],26:[2,177],49:[2,177],54:[2,177],57:[2,177],73:[2,177],78:[2,177],86:[2,177],91:[2,177],93:[2,177],102:[2,177],104:[2,177],105:[2,177],106:[2,177],110:[2,177],118:[2,177],126:[2,177],129:[2,177],130:[2,177],133:[2,177],134:[2,177],135:[2,177],136:[2,177],137:[2,177],138:[2,177],139:[2,177]},{26:[2,181],121:[2,181],123:[2,181]},{25:[2,133],54:[2,133],103:84,104:[1,64],106:[1,65],109:85,110:[1,67],111:68,126:[1,83],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{6:[1,276],25:[1,277],26:[1,332]},{7:333,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{7:334,8:117,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:61,28:[1,72],29:48,30:[1,70],31:[1,71],32:22,33:[1,49],34:[1,50],35:[1,51],36:[1,52],37:[1,53],38:[1,54],39:21,44:62,45:[1,44],46:[1,45],47:[1,27],50:28,51:[1,59],52:[1,60],58:46,59:47,61:35,63:23,64:24,65:25,76:[1,69],79:[1,42],83:[1,26],88:[1,57],89:[1,58],90:[1,56],96:[1,37],100:[1,43],101:[1,55],103:38,104:[1,64],106:[1,65],107:39,108:[1,66],109:40,110:[1,67],111:68,119:[1,41],124:36,125:[1,63],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,34]},{6:[1,287],25:[1,288],26:[1,335]},{6:[2,40],25:[2,40],26:[2,40],54:[2,40],78:[2,40]},{6:[2,58],25:[2,58],26:[2,58],49:[2,58],54:[2,58]},{1:[2,175],6:[2,175],25:[2,175],26:[2,175],49:[2,175],54:[2,175],57:[2,175],73:[2,175],78:[2,175],86:[2,175],91:[2,175],93:[2,175],102:[2,175],104:[2,175],105:[2,175],106:[2,175],110:[2,175],118:[2,175],126:[2,175],129:[2,175],130:[2,175],133:[2,175],134:[2,175],135:[2,175],136:[2,175],137:[2,175],138:[2,175],139:[2,175]},{6:[2,128],25:[2,128],26:[2,128],54:[2,128],86:[2,128],91:[2,128]},{1:[2,172],6:[2,172],25:[2,172],26:[2,172],49:[2,172],54:[2,172],57:[2,172],73:[2,172],78:[2,172],86:[2,172],91:[2,172],93:[2,172],102:[2,172],103:84,104:[2,172],105:[2,172],106:[2,172],109:85,110:[2,172],111:68,118:[2,172],126:[2,172],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{1:[2,173],6:[2,173],25:[2,173],26:[2,173],49:[2,173],54:[2,173],57:[2,173],73:[2,173],78:[2,173],86:[2,173],91:[2,173],93:[2,173],102:[2,173],103:84,104:[2,173],105:[2,173],106:[2,173],109:85,110:[2,173],111:68,118:[2,173],126:[2,173],129:[1,76],130:[1,75],133:[1,74],134:[1,77],135:[1,78],136:[1,79],137:[1,80],138:[1,81],139:[1,82]},{6:[2,95],25:[2,95],26:[2,95],54:[2,95],78:[2,95]}],
defaultActions: {59:[2,50],60:[2,51],91:[2,109],192:[2,89]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                this.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this,require("JkpR2F"))
},{"JkpR2F":13,"fs":2,"path":12}],48:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var CoffeeScript, Module, binary, child_process, ext, findExtension, fork, helpers, loadFile, path, _i, _len, _ref;

  CoffeeScript = require('./coffee-script');

  child_process = require('child_process');

  helpers = require('./helpers');

  path = require('path');

  loadFile = function(module, filename) {
    var answer;
    answer = CoffeeScript._compileFile(filename, false);
    return module._compile(answer, filename);
  };

  if (require.extensions) {
    _ref = CoffeeScript.FILE_EXTENSIONS;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      ext = _ref[_i];
      require.extensions[ext] = loadFile;
    }
    Module = require('module');
    findExtension = function(filename) {
      var curExtension, extensions;
      extensions = path.basename(filename).split('.');
      if (extensions[0] === '') {
        extensions.shift();
      }
      while (extensions.shift()) {
        curExtension = '.' + extensions.join('.');
        if (Module._extensions[curExtension]) {
          return curExtension;
        }
      }
      return '.js';
    };
    Module.prototype.load = function(filename) {
      var extension;
      this.filename = filename;
      this.paths = Module._nodeModulePaths(path.dirname(filename));
      extension = findExtension(filename);
      Module._extensions[extension](this, filename);
      return this.loaded = true;
    };
  }

  if (child_process) {
    fork = child_process.fork;
    binary = require.resolve('../../bin/coffee');
    child_process.fork = function(path, args, options) {
      if (helpers.isCoffee(path)) {
        if (!Array.isArray(args)) {
          options = args || {};
          args = [];
        }
        args = [path].concat(args);
        path = binary;
      }
      return fork(path, args, options);
    };
  }

}).call(this);

},{"./coffee-script":43,"./helpers":44,"child_process":2,"module":2,"path":12}],49:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var BALANCED_PAIRS, CALL_CLOSERS, EXPRESSION_CLOSE, EXPRESSION_END, EXPRESSION_START, IMPLICIT_CALL, IMPLICIT_END, IMPLICIT_FUNC, IMPLICIT_UNSPACED_CALL, INVERSES, LINEBREAKS, SINGLE_CLOSERS, SINGLE_LINERS, generate, left, rite, _i, _len, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  generate = function(tag, value, origin) {
    var tok;
    tok = [tag, value];
    tok.generated = true;
    if (origin) {
      tok.origin = origin;
    }
    return tok;
  };

  exports.Rewriter = (function() {
    function Rewriter() {}

    Rewriter.prototype.rewrite = function(tokens) {
      this.tokens = tokens;
      this.removeLeadingNewlines();
      this.closeOpenCalls();
      this.closeOpenIndexes();
      this.normalizeLines();
      this.tagPostfixConditionals();
      this.addImplicitBracesAndParens();
      this.addLocationDataToGeneratedTokens();
      return this.tokens;
    };

    Rewriter.prototype.scanTokens = function(block) {
      var i, token, tokens;
      tokens = this.tokens;
      i = 0;
      while (token = tokens[i]) {
        i += block.call(this, token, i, tokens);
      }
      return true;
    };

    Rewriter.prototype.detectEnd = function(i, condition, action) {
      var levels, token, tokens, _ref, _ref1;
      tokens = this.tokens;
      levels = 0;
      while (token = tokens[i]) {
        if (levels === 0 && condition.call(this, token, i)) {
          return action.call(this, token, i);
        }
        if (!token || levels < 0) {
          return action.call(this, token, i - 1);
        }
        if (_ref = token[0], __indexOf.call(EXPRESSION_START, _ref) >= 0) {
          levels += 1;
        } else if (_ref1 = token[0], __indexOf.call(EXPRESSION_END, _ref1) >= 0) {
          levels -= 1;
        }
        i += 1;
      }
      return i - 1;
    };

    Rewriter.prototype.removeLeadingNewlines = function() {
      var i, tag, _i, _len, _ref;
      _ref = this.tokens;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        tag = _ref[i][0];
        if (tag !== 'TERMINATOR') {
          break;
        }
      }
      if (i) {
        return this.tokens.splice(0, i);
      }
    };

    Rewriter.prototype.closeOpenCalls = function() {
      var action, condition;
      condition = function(token, i) {
        var _ref;
        return ((_ref = token[0]) === ')' || _ref === 'CALL_END') || token[0] === 'OUTDENT' && this.tag(i - 1) === ')';
      };
      action = function(token, i) {
        return this.tokens[token[0] === 'OUTDENT' ? i - 1 : i][0] = 'CALL_END';
      };
      return this.scanTokens(function(token, i) {
        if (token[0] === 'CALL_START') {
          this.detectEnd(i + 1, condition, action);
        }
        return 1;
      });
    };

    Rewriter.prototype.closeOpenIndexes = function() {
      var action, condition;
      condition = function(token, i) {
        var _ref;
        return (_ref = token[0]) === ']' || _ref === 'INDEX_END';
      };
      action = function(token, i) {
        return token[0] = 'INDEX_END';
      };
      return this.scanTokens(function(token, i) {
        if (token[0] === 'INDEX_START') {
          this.detectEnd(i + 1, condition, action);
        }
        return 1;
      });
    };

    Rewriter.prototype.matchTags = function() {
      var fuzz, i, j, pattern, _i, _ref, _ref1;
      i = arguments[0], pattern = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      fuzz = 0;
      for (j = _i = 0, _ref = pattern.length; 0 <= _ref ? _i < _ref : _i > _ref; j = 0 <= _ref ? ++_i : --_i) {
        while (this.tag(i + j + fuzz) === 'HERECOMMENT') {
          fuzz += 2;
        }
        if (pattern[j] == null) {
          continue;
        }
        if (typeof pattern[j] === 'string') {
          pattern[j] = [pattern[j]];
        }
        if (_ref1 = this.tag(i + j + fuzz), __indexOf.call(pattern[j], _ref1) < 0) {
          return false;
        }
      }
      return true;
    };

    Rewriter.prototype.looksObjectish = function(j) {
      return this.matchTags(j, '@', null, ':') || this.matchTags(j, null, ':');
    };

    Rewriter.prototype.findTagsBackwards = function(i, tags) {
      var backStack, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      backStack = [];
      while (i >= 0 && (backStack.length || (_ref2 = this.tag(i), __indexOf.call(tags, _ref2) < 0) && ((_ref3 = this.tag(i), __indexOf.call(EXPRESSION_START, _ref3) < 0) || this.tokens[i].generated) && (_ref4 = this.tag(i), __indexOf.call(LINEBREAKS, _ref4) < 0))) {
        if (_ref = this.tag(i), __indexOf.call(EXPRESSION_END, _ref) >= 0) {
          backStack.push(this.tag(i));
        }
        if ((_ref1 = this.tag(i), __indexOf.call(EXPRESSION_START, _ref1) >= 0) && backStack.length) {
          backStack.pop();
        }
        i -= 1;
      }
      return _ref5 = this.tag(i), __indexOf.call(tags, _ref5) >= 0;
    };

    Rewriter.prototype.addImplicitBracesAndParens = function() {
      var stack;
      stack = [];
      return this.scanTokens(function(token, i, tokens) {
        var endImplicitCall, endImplicitObject, forward, inImplicit, inImplicitCall, inImplicitControl, inImplicitObject, newLine, nextTag, offset, prevTag, prevToken, s, sameLine, stackIdx, stackTag, stackTop, startIdx, startImplicitCall, startImplicitObject, startsLine, tag, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
        tag = token[0];
        prevTag = (prevToken = i > 0 ? tokens[i - 1] : [])[0];
        nextTag = (i < tokens.length - 1 ? tokens[i + 1] : [])[0];
        stackTop = function() {
          return stack[stack.length - 1];
        };
        startIdx = i;
        forward = function(n) {
          return i - startIdx + n;
        };
        inImplicit = function() {
          var _ref, _ref1;
          return (_ref = stackTop()) != null ? (_ref1 = _ref[2]) != null ? _ref1.ours : void 0 : void 0;
        };
        inImplicitCall = function() {
          var _ref;
          return inImplicit() && ((_ref = stackTop()) != null ? _ref[0] : void 0) === '(';
        };
        inImplicitObject = function() {
          var _ref;
          return inImplicit() && ((_ref = stackTop()) != null ? _ref[0] : void 0) === '{';
        };
        inImplicitControl = function() {
          var _ref;
          return inImplicit && ((_ref = stackTop()) != null ? _ref[0] : void 0) === 'CONTROL';
        };
        startImplicitCall = function(j) {
          var idx;
          idx = j != null ? j : i;
          stack.push([
            '(', idx, {
              ours: true
            }
          ]);
          tokens.splice(idx, 0, generate('CALL_START', '('));
          if (j == null) {
            return i += 1;
          }
        };
        endImplicitCall = function() {
          stack.pop();
          tokens.splice(i, 0, generate('CALL_END', ')'));
          return i += 1;
        };
        startImplicitObject = function(j, startsLine) {
          var idx;
          if (startsLine == null) {
            startsLine = true;
          }
          idx = j != null ? j : i;
          stack.push([
            '{', idx, {
              sameLine: true,
              startsLine: startsLine,
              ours: true
            }
          ]);
          tokens.splice(idx, 0, generate('{', generate(new String('{')), token));
          if (j == null) {
            return i += 1;
          }
        };
        endImplicitObject = function(j) {
          j = j != null ? j : i;
          stack.pop();
          tokens.splice(j, 0, generate('}', '}', token));
          return i += 1;
        };
        if (inImplicitCall() && (tag === 'IF' || tag === 'TRY' || tag === 'FINALLY' || tag === 'CATCH' || tag === 'CLASS' || tag === 'SWITCH')) {
          stack.push([
            'CONTROL', i, {
              ours: true
            }
          ]);
          return forward(1);
        }
        if (tag === 'INDENT' && inImplicit()) {
          if (prevTag !== '=>' && prevTag !== '->' && prevTag !== '[' && prevTag !== '(' && prevTag !== ',' && prevTag !== '{' && prevTag !== 'TRY' && prevTag !== 'ELSE' && prevTag !== '=') {
            while (inImplicitCall()) {
              endImplicitCall();
            }
          }
          if (inImplicitControl()) {
            stack.pop();
          }
          stack.push([tag, i]);
          return forward(1);
        }
        if (__indexOf.call(EXPRESSION_START, tag) >= 0) {
          stack.push([tag, i]);
          return forward(1);
        }
        if (__indexOf.call(EXPRESSION_END, tag) >= 0) {
          while (inImplicit()) {
            if (inImplicitCall()) {
              endImplicitCall();
            } else if (inImplicitObject()) {
              endImplicitObject();
            } else {
              stack.pop();
            }
          }
          stack.pop();
        }
        if ((__indexOf.call(IMPLICIT_FUNC, tag) >= 0 && token.spaced && !token.stringEnd || tag === '?' && i > 0 && !tokens[i - 1].spaced) && (__indexOf.call(IMPLICIT_CALL, nextTag) >= 0 || __indexOf.call(IMPLICIT_UNSPACED_CALL, nextTag) >= 0 && !((_ref = tokens[i + 1]) != null ? _ref.spaced : void 0) && !((_ref1 = tokens[i + 1]) != null ? _ref1.newLine : void 0))) {
          if (tag === '?') {
            tag = token[0] = 'FUNC_EXIST';
          }
          startImplicitCall(i + 1);
          return forward(2);
        }
        if (__indexOf.call(IMPLICIT_FUNC, tag) >= 0 && this.matchTags(i + 1, 'INDENT', null, ':') && !this.findTagsBackwards(i, ['CLASS', 'EXTENDS', 'IF', 'CATCH', 'SWITCH', 'LEADING_WHEN', 'FOR', 'WHILE', 'UNTIL'])) {
          startImplicitCall(i + 1);
          stack.push(['INDENT', i + 2]);
          return forward(3);
        }
        if (tag === ':') {
          if (this.tag(i - 2) === '@') {
            s = i - 2;
          } else {
            s = i - 1;
          }
          while (this.tag(s - 2) === 'HERECOMMENT') {
            s -= 2;
          }
          this.insideForDeclaration = nextTag === 'FOR';
          startsLine = s === 0 || (_ref2 = this.tag(s - 1), __indexOf.call(LINEBREAKS, _ref2) >= 0) || tokens[s - 1].newLine;
          if (stackTop()) {
            _ref3 = stackTop(), stackTag = _ref3[0], stackIdx = _ref3[1];
            if ((stackTag === '{' || stackTag === 'INDENT' && this.tag(stackIdx - 1) === '{') && (startsLine || this.tag(s - 1) === ',' || this.tag(s - 1) === '{')) {
              return forward(1);
            }
          }
          startImplicitObject(s, !!startsLine);
          return forward(2);
        }
        if (inImplicitObject() && __indexOf.call(LINEBREAKS, tag) >= 0) {
          stackTop()[2].sameLine = false;
        }
        newLine = prevTag === 'OUTDENT' || prevToken.newLine;
        if (__indexOf.call(IMPLICIT_END, tag) >= 0 || __indexOf.call(CALL_CLOSERS, tag) >= 0 && newLine) {
          while (inImplicit()) {
            _ref4 = stackTop(), stackTag = _ref4[0], stackIdx = _ref4[1], (_ref5 = _ref4[2], sameLine = _ref5.sameLine, startsLine = _ref5.startsLine);
            if (inImplicitCall() && prevTag !== ',') {
              endImplicitCall();
            } else if (inImplicitObject() && !this.insideForDeclaration && sameLine && tag !== 'TERMINATOR' && prevTag !== ':' && endImplicitObject()) {

            } else if (inImplicitObject() && tag === 'TERMINATOR' && prevTag !== ',' && !(startsLine && this.looksObjectish(i + 1))) {
              endImplicitObject();
            } else {
              break;
            }
          }
        }
        if (tag === ',' && !this.looksObjectish(i + 1) && inImplicitObject() && !this.insideForDeclaration && (nextTag !== 'TERMINATOR' || !this.looksObjectish(i + 2))) {
          offset = nextTag === 'OUTDENT' ? 1 : 0;
          while (inImplicitObject()) {
            endImplicitObject(i + offset);
          }
        }
        return forward(1);
      });
    };

    Rewriter.prototype.addLocationDataToGeneratedTokens = function() {
      return this.scanTokens(function(token, i, tokens) {
        var column, line, nextLocation, prevLocation, _ref, _ref1;
        if (token[2]) {
          return 1;
        }
        if (!(token.generated || token.explicit)) {
          return 1;
        }
        if (token[0] === '{' && (nextLocation = (_ref = tokens[i + 1]) != null ? _ref[2] : void 0)) {
          line = nextLocation.first_line, column = nextLocation.first_column;
        } else if (prevLocation = (_ref1 = tokens[i - 1]) != null ? _ref1[2] : void 0) {
          line = prevLocation.last_line, column = prevLocation.last_column;
        } else {
          line = column = 0;
        }
        token[2] = {
          first_line: line,
          first_column: column,
          last_line: line,
          last_column: column
        };
        return 1;
      });
    };

    Rewriter.prototype.normalizeLines = function() {
      var action, condition, indent, outdent, starter;
      starter = indent = outdent = null;
      condition = function(token, i) {
        var _ref, _ref1, _ref2, _ref3;
        return token[1] !== ';' && (_ref = token[0], __indexOf.call(SINGLE_CLOSERS, _ref) >= 0) && !(token[0] === 'TERMINATOR' && (_ref1 = this.tag(i + 1), __indexOf.call(EXPRESSION_CLOSE, _ref1) >= 0)) && !(token[0] === 'ELSE' && starter !== 'THEN') && !(((_ref2 = token[0]) === 'CATCH' || _ref2 === 'FINALLY') && (starter === '->' || starter === '=>')) || (_ref3 = token[0], __indexOf.call(CALL_CLOSERS, _ref3) >= 0) && this.tokens[i - 1].newLine;
      };
      action = function(token, i) {
        return this.tokens.splice((this.tag(i - 1) === ',' ? i - 1 : i), 0, outdent);
      };
      return this.scanTokens(function(token, i, tokens) {
        var j, tag, _i, _ref, _ref1, _ref2;
        tag = token[0];
        if (tag === 'TERMINATOR') {
          if (this.tag(i + 1) === 'ELSE' && this.tag(i - 1) !== 'OUTDENT') {
            tokens.splice.apply(tokens, [i, 1].concat(__slice.call(this.indentation())));
            return 1;
          }
          if (_ref = this.tag(i + 1), __indexOf.call(EXPRESSION_CLOSE, _ref) >= 0) {
            tokens.splice(i, 1);
            return 0;
          }
        }
        if (tag === 'CATCH') {
          for (j = _i = 1; _i <= 2; j = ++_i) {
            if (!((_ref1 = this.tag(i + j)) === 'OUTDENT' || _ref1 === 'TERMINATOR' || _ref1 === 'FINALLY')) {
              continue;
            }
            tokens.splice.apply(tokens, [i + j, 0].concat(__slice.call(this.indentation())));
            return 2 + j;
          }
        }
        if (__indexOf.call(SINGLE_LINERS, tag) >= 0 && this.tag(i + 1) !== 'INDENT' && !(tag === 'ELSE' && this.tag(i + 1) === 'IF')) {
          starter = tag;
          _ref2 = this.indentation(tokens[i]), indent = _ref2[0], outdent = _ref2[1];
          if (starter === 'THEN') {
            indent.fromThen = true;
          }
          tokens.splice(i + 1, 0, indent);
          this.detectEnd(i + 2, condition, action);
          if (tag === 'THEN') {
            tokens.splice(i, 1);
          }
          return 1;
        }
        return 1;
      });
    };

    Rewriter.prototype.tagPostfixConditionals = function() {
      var action, condition, original;
      original = null;
      condition = function(token, i) {
        var prevTag, tag;
        tag = token[0];
        prevTag = this.tokens[i - 1][0];
        return tag === 'TERMINATOR' || (tag === 'INDENT' && __indexOf.call(SINGLE_LINERS, prevTag) < 0);
      };
      action = function(token, i) {
        if (token[0] !== 'INDENT' || (token.generated && !token.fromThen)) {
          return original[0] = 'POST_' + original[0];
        }
      };
      return this.scanTokens(function(token, i) {
        if (token[0] !== 'IF') {
          return 1;
        }
        original = token;
        this.detectEnd(i + 1, condition, action);
        return 1;
      });
    };

    Rewriter.prototype.indentation = function(origin) {
      var indent, outdent;
      indent = ['INDENT', 2];
      outdent = ['OUTDENT', 2];
      if (origin) {
        indent.generated = outdent.generated = true;
        indent.origin = outdent.origin = origin;
      } else {
        indent.explicit = outdent.explicit = true;
      }
      return [indent, outdent];
    };

    Rewriter.prototype.generate = generate;

    Rewriter.prototype.tag = function(i) {
      var _ref;
      return (_ref = this.tokens[i]) != null ? _ref[0] : void 0;
    };

    return Rewriter;

  })();

  BALANCED_PAIRS = [['(', ')'], ['[', ']'], ['{', '}'], ['INDENT', 'OUTDENT'], ['CALL_START', 'CALL_END'], ['PARAM_START', 'PARAM_END'], ['INDEX_START', 'INDEX_END']];

  exports.INVERSES = INVERSES = {};

  EXPRESSION_START = [];

  EXPRESSION_END = [];

  for (_i = 0, _len = BALANCED_PAIRS.length; _i < _len; _i++) {
    _ref = BALANCED_PAIRS[_i], left = _ref[0], rite = _ref[1];
    EXPRESSION_START.push(INVERSES[rite] = left);
    EXPRESSION_END.push(INVERSES[left] = rite);
  }

  EXPRESSION_CLOSE = ['CATCH', 'THEN', 'ELSE', 'FINALLY'].concat(EXPRESSION_END);

  IMPLICIT_FUNC = ['IDENTIFIER', 'SUPER', ')', 'CALL_END', ']', 'INDEX_END', '@', 'THIS'];

  IMPLICIT_CALL = ['IDENTIFIER', 'NUMBER', 'STRING', 'JS', 'REGEX', 'NEW', 'PARAM_START', 'CLASS', 'IF', 'TRY', 'SWITCH', 'THIS', 'BOOL', 'NULL', 'UNDEFINED', 'UNARY', 'UNARY_MATH', 'SUPER', 'THROW', '@', '->', '=>', '[', '(', '{', '--', '++'];

  IMPLICIT_UNSPACED_CALL = ['+', '-'];

  IMPLICIT_END = ['POST_IF', 'FOR', 'WHILE', 'UNTIL', 'WHEN', 'BY', 'LOOP', 'TERMINATOR'];

  SINGLE_LINERS = ['ELSE', '->', '=>', 'TRY', 'FINALLY', 'THEN'];

  SINGLE_CLOSERS = ['TERMINATOR', 'CATCH', 'FINALLY', 'ELSE', 'OUTDENT', 'LEADING_WHEN'];

  LINEBREAKS = ['TERMINATOR', 'INDENT', 'OUTDENT'];

  CALL_CLOSERS = ['.', '?.', '::', '?::'];

}).call(this);

},{}],50:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var Scope, extend, last, _ref;

  _ref = require('./helpers'), extend = _ref.extend, last = _ref.last;

  exports.Scope = Scope = (function() {
    Scope.root = null;

    function Scope(parent, expressions, method) {
      this.parent = parent;
      this.expressions = expressions;
      this.method = method;
      this.variables = [
        {
          name: 'arguments',
          type: 'arguments'
        }
      ];
      this.positions = {};
      if (!this.parent) {
        Scope.root = this;
      }
    }

    Scope.prototype.add = function(name, type, immediate) {
      if (this.shared && !immediate) {
        return this.parent.add(name, type, immediate);
      }
      if (Object.prototype.hasOwnProperty.call(this.positions, name)) {
        return this.variables[this.positions[name]].type = type;
      } else {
        return this.positions[name] = this.variables.push({
          name: name,
          type: type
        }) - 1;
      }
    };

    Scope.prototype.namedMethod = function() {
      var _ref1;
      if (((_ref1 = this.method) != null ? _ref1.name : void 0) || !this.parent) {
        return this.method;
      }
      return this.parent.namedMethod();
    };

    Scope.prototype.find = function(name) {
      if (this.check(name)) {
        return true;
      }
      this.add(name, 'var');
      return false;
    };

    Scope.prototype.parameter = function(name) {
      if (this.shared && this.parent.check(name, true)) {
        return;
      }
      return this.add(name, 'param');
    };

    Scope.prototype.check = function(name) {
      var _ref1;
      return !!(this.type(name) || ((_ref1 = this.parent) != null ? _ref1.check(name) : void 0));
    };

    Scope.prototype.temporary = function(name, index) {
      if (name.length > 1) {
        return '_' + name + (index > 1 ? index - 1 : '');
      } else {
        return '_' + (index + parseInt(name, 36)).toString(36).replace(/\d/g, 'a');
      }
    };

    Scope.prototype.type = function(name) {
      var v, _i, _len, _ref1;
      _ref1 = this.variables;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        v = _ref1[_i];
        if (v.name === name) {
          return v.type;
        }
      }
      return null;
    };

    Scope.prototype.freeVariable = function(name, reserve) {
      var index, temp;
      if (reserve == null) {
        reserve = true;
      }
      index = 0;
      while (this.check((temp = this.temporary(name, index)))) {
        index++;
      }
      if (reserve) {
        this.add(temp, 'var', true);
      }
      return temp;
    };

    Scope.prototype.assign = function(name, value) {
      this.add(name, {
        value: value,
        assigned: true
      }, true);
      return this.hasAssignments = true;
    };

    Scope.prototype.hasDeclarations = function() {
      return !!this.declaredVariables().length;
    };

    Scope.prototype.declaredVariables = function() {
      var realVars, tempVars, v, _i, _len, _ref1;
      realVars = [];
      tempVars = [];
      _ref1 = this.variables;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        v = _ref1[_i];
        if (v.type === 'var') {
          (v.name.charAt(0) === '_' ? tempVars : realVars).push(v.name);
        }
      }
      return realVars.sort().concat(tempVars.sort());
    };

    Scope.prototype.assignedVariables = function() {
      var v, _i, _len, _ref1, _results;
      _ref1 = this.variables;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        v = _ref1[_i];
        if (v.type.assigned) {
          _results.push("" + v.name + " = " + v.type.value);
        }
      }
      return _results;
    };

    return Scope;

  })();

}).call(this);

},{"./helpers":44}],51:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var LineMap, SourceMap;

  LineMap = (function() {
    function LineMap(line) {
      this.line = line;
      this.columns = [];
    }

    LineMap.prototype.add = function(column, _arg, options) {
      var sourceColumn, sourceLine;
      sourceLine = _arg[0], sourceColumn = _arg[1];
      if (options == null) {
        options = {};
      }
      if (this.columns[column] && options.noReplace) {
        return;
      }
      return this.columns[column] = {
        line: this.line,
        column: column,
        sourceLine: sourceLine,
        sourceColumn: sourceColumn
      };
    };

    LineMap.prototype.sourceLocation = function(column) {
      var mapping;
      while (!((mapping = this.columns[column]) || (column <= 0))) {
        column--;
      }
      return mapping && [mapping.sourceLine, mapping.sourceColumn];
    };

    return LineMap;

  })();

  SourceMap = (function() {
    var BASE64_CHARS, VLQ_CONTINUATION_BIT, VLQ_SHIFT, VLQ_VALUE_MASK;

    function SourceMap() {
      this.lines = [];
    }

    SourceMap.prototype.add = function(sourceLocation, generatedLocation, options) {
      var column, line, lineMap, _base;
      if (options == null) {
        options = {};
      }
      line = generatedLocation[0], column = generatedLocation[1];
      lineMap = ((_base = this.lines)[line] || (_base[line] = new LineMap(line)));
      return lineMap.add(column, sourceLocation, options);
    };

    SourceMap.prototype.sourceLocation = function(_arg) {
      var column, line, lineMap;
      line = _arg[0], column = _arg[1];
      while (!((lineMap = this.lines[line]) || (line <= 0))) {
        line--;
      }
      return lineMap && lineMap.sourceLocation(column);
    };

    SourceMap.prototype.generate = function(options, code) {
      var buffer, lastColumn, lastSourceColumn, lastSourceLine, lineMap, lineNumber, mapping, needComma, v3, writingline, _i, _j, _len, _len1, _ref, _ref1;
      if (options == null) {
        options = {};
      }
      if (code == null) {
        code = null;
      }
      writingline = 0;
      lastColumn = 0;
      lastSourceLine = 0;
      lastSourceColumn = 0;
      needComma = false;
      buffer = "";
      _ref = this.lines;
      for (lineNumber = _i = 0, _len = _ref.length; _i < _len; lineNumber = ++_i) {
        lineMap = _ref[lineNumber];
        if (lineMap) {
          _ref1 = lineMap.columns;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            mapping = _ref1[_j];
            if (!(mapping)) {
              continue;
            }
            while (writingline < mapping.line) {
              lastColumn = 0;
              needComma = false;
              buffer += ";";
              writingline++;
            }
            if (needComma) {
              buffer += ",";
              needComma = false;
            }
            buffer += this.encodeVlq(mapping.column - lastColumn);
            lastColumn = mapping.column;
            buffer += this.encodeVlq(0);
            buffer += this.encodeVlq(mapping.sourceLine - lastSourceLine);
            lastSourceLine = mapping.sourceLine;
            buffer += this.encodeVlq(mapping.sourceColumn - lastSourceColumn);
            lastSourceColumn = mapping.sourceColumn;
            needComma = true;
          }
        }
      }
      v3 = {
        version: 3,
        file: options.generatedFile || '',
        sourceRoot: options.sourceRoot || '',
        sources: options.sourceFiles || [''],
        names: [],
        mappings: buffer
      };
      if (options.inline) {
        v3.sourcesContent = [code];
      }
      return JSON.stringify(v3, null, 2);
    };

    VLQ_SHIFT = 5;

    VLQ_CONTINUATION_BIT = 1 << VLQ_SHIFT;

    VLQ_VALUE_MASK = VLQ_CONTINUATION_BIT - 1;

    SourceMap.prototype.encodeVlq = function(value) {
      var answer, nextChunk, signBit, valueToEncode;
      answer = '';
      signBit = value < 0 ? 1 : 0;
      valueToEncode = (Math.abs(value) << 1) + signBit;
      while (valueToEncode || !answer) {
        nextChunk = valueToEncode & VLQ_VALUE_MASK;
        valueToEncode = valueToEncode >> VLQ_SHIFT;
        if (valueToEncode) {
          nextChunk |= VLQ_CONTINUATION_BIT;
        }
        answer += this.encodeBase64(nextChunk);
      }
      return answer;
    };

    BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    SourceMap.prototype.encodeBase64 = function(value) {
      return BASE64_CHARS[value] || (function() {
        throw new Error("Cannot Base64 encode value: " + value);
      })();
    };

    return SourceMap;

  })();

  module.exports = SourceMap;

}).call(this);

},{}],52:[function(require,module,exports){
(function (global,Buffer){
var vm = require('vm')
var isBuffer = Buffer.isBuffer

var requireLike = require('require-like')

function merge (a, b) {
	if (!a || !b) return a

	var keys = Object.keys(b)
  for (var k, i = 0, n = keys.length; i < n; i++) {
  	k = keys[i]
  	a[k] = b[k]
  }

  return a
}

// Return the exports/module.exports variable set in the content
// content (String|VmScript): required
module.exports = function (content, filename, scope, includeGlobals) {
	if (typeof filename !== 'string') {
        if (typeof filename === 'object') {
            includeGlobals = scope
            scope = filename
            filename = null
        }
        else if (typeof filename === 'boolean') {
            includeGlobals = filename
            scope = {}
            filename = null
        }
	}

	// Expose standard Node globals
  var sandbox = {}
  var exports = {}

  if (includeGlobals) {
    merge(sandbox, global)
    sandbox.require = requireLike(filename || module.parent.filename)
  }

  if (typeof scope === 'object')
  	merge(sandbox, scope)

  sandbox.exports = exports
  sandbox.module = { exports: exports }
  sandbox.global = sandbox

  if ( isBuffer(content) )
    content = content.toString()
  
  // Evalutate the content with the given scope
  if (typeof content === 'string')
    vm.createScript( content.replace(/^\#\!.*/, ''), filename)
      .runInNewContext(sandbox, filename)
  else
    content.runInNewContext(sandbox)

  return sandbox.module.exports
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"buffer":6,"require-like":53,"vm":21}],53:[function(require,module,exports){
(function (process){
var Module = require('module');
var dirname = require('path').dirname;

module.exports = function requireLike(path, uncached) {
  var parentModule = new Module(path);
  parentModule.filename = path;
  parentModule.paths = Module._nodeModulePaths(dirname(path));

  function requireLike(file) {
    var cache = Module._cache;
    if (uncached) {
      Module._cache = {};
    }

    var exports = Module._load(file, parentModule);
    Module._cache = cache;

    return exports;
  };


  requireLike.resolve = function(request) {
    var resolved = Module._resolveFilename(request, parentModule);
    // Module._resolveFilename returns a string since node v0.6.10,
    // it used to return an array prior to that
    return (resolved instanceof Array) ? resolved[1] : resolved;
  }

  try {
    requireLike.paths = require.paths;
  } catch (e) {
    //require.paths was deprecated in node v0.5.x
    //it now throws an exception when called
  }
  requireLike.main = process.mainModule;
  requireLike.extensions = require.extensions;
  requireLike.cache = require.cache;

  return requireLike;
};

}).call(this,require("JkpR2F"))
},{"JkpR2F":13,"module":2,"path":12}],54:[function(require,module,exports){
module.exports = (function(){
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */
  
  function quote(s) {
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
     * string literal except for the closing quote character, backslash,
     * carriage return, line separator, paragraph separator, and line feed.
     * Any character may appear in the form of an escape sequence.
     *
     * For portability, we also escape escape all control and non-ASCII
     * characters. Note that "\0" and "\v" escape sequences are not used
     * because JSHint does not like the first and IE the second.
     */
     return '"' + s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/"/g, '\\"')    // closing quote character
      .replace(/\x08/g, '\\b') // backspace
      .replace(/\t/g, '\\t')   // horizontal tab
      .replace(/\n/g, '\\n')   // line feed
      .replace(/\f/g, '\\f')   // form feed
      .replace(/\r/g, '\\r')   // carriage return
      .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
      + '"';
  }
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "start": parse_start,
        "line": parse_line,
        "LineTerminator": parse_LineTerminator,
        "comment": parse_comment,
        "connection": parse_connection,
        "bridge": parse_bridge,
        "leftlet": parse_leftlet,
        "iip": parse_iip,
        "rightlet": parse_rightlet,
        "node": parse_node,
        "component": parse_component,
        "compMeta": parse_compMeta,
        "port": parse_port,
        "portWithIndex": parse_portWithIndex,
        "anychar": parse_anychar,
        "iipchar": parse_iipchar,
        "_": parse__,
        "__": parse___
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "start";
      }
      
      var pos = 0;
      var reportFailures = 0;
      var rightmostFailuresPos = 0;
      var rightmostFailuresExpected = [];
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function matchFailed(failure) {
        if (pos < rightmostFailuresPos) {
          return;
        }
        
        if (pos > rightmostFailuresPos) {
          rightmostFailuresPos = pos;
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_start() {
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        result0 = [];
        result1 = parse_line();
        while (result1 !== null) {
          result0.push(result1);
          result1 = parse_line();
        }
        if (result0 !== null) {
          result0 = (function(offset) { return parser.getResult();  })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_line() {
        var result0, result1, result2, result3, result4, result5, result6, result7, result8;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse__();
        if (result0 !== null) {
          if (input.substr(pos, 7) === "EXPORT=") {
            result1 = "EXPORT=";
            pos += 7;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"EXPORT=\"");
            }
          }
          if (result1 !== null) {
            if (/^[A-Za-z.0-9_]/.test(input.charAt(pos))) {
              result3 = input.charAt(pos);
              pos++;
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("[A-Za-z.0-9_]");
              }
            }
            if (result3 !== null) {
              result2 = [];
              while (result3 !== null) {
                result2.push(result3);
                if (/^[A-Za-z.0-9_]/.test(input.charAt(pos))) {
                  result3 = input.charAt(pos);
                  pos++;
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("[A-Za-z.0-9_]");
                  }
                }
              }
            } else {
              result2 = null;
            }
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 58) {
                result3 = ":";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\":\"");
                }
              }
              if (result3 !== null) {
                if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                  result5 = input.charAt(pos);
                  pos++;
                } else {
                  result5 = null;
                  if (reportFailures === 0) {
                    matchFailed("[A-Z0-9_]");
                  }
                }
                if (result5 !== null) {
                  result4 = [];
                  while (result5 !== null) {
                    result4.push(result5);
                    if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                      result5 = input.charAt(pos);
                      pos++;
                    } else {
                      result5 = null;
                      if (reportFailures === 0) {
                        matchFailed("[A-Z0-9_]");
                      }
                    }
                  }
                } else {
                  result4 = null;
                }
                if (result4 !== null) {
                  result5 = parse__();
                  if (result5 !== null) {
                    result6 = parse_LineTerminator();
                    result6 = result6 !== null ? result6 : "";
                    if (result6 !== null) {
                      result0 = [result0, result1, result2, result3, result4, result5, result6];
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, priv, pub) {return parser.registerExports(priv.join(""),pub.join(""))})(pos0, result0[2], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          result0 = parse__();
          if (result0 !== null) {
            if (input.substr(pos, 7) === "INPORT=") {
              result1 = "INPORT=";
              pos += 7;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\"INPORT=\"");
              }
            }
            if (result1 !== null) {
              if (/^[A-Za-z0-9_]/.test(input.charAt(pos))) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("[A-Za-z0-9_]");
                }
              }
              if (result3 !== null) {
                result2 = [];
                while (result3 !== null) {
                  result2.push(result3);
                  if (/^[A-Za-z0-9_]/.test(input.charAt(pos))) {
                    result3 = input.charAt(pos);
                    pos++;
                  } else {
                    result3 = null;
                    if (reportFailures === 0) {
                      matchFailed("[A-Za-z0-9_]");
                    }
                  }
                }
              } else {
                result2 = null;
              }
              if (result2 !== null) {
                if (input.charCodeAt(pos) === 46) {
                  result3 = ".";
                  pos++;
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("\".\"");
                  }
                }
                if (result3 !== null) {
                  if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                    result5 = input.charAt(pos);
                    pos++;
                  } else {
                    result5 = null;
                    if (reportFailures === 0) {
                      matchFailed("[A-Z0-9_]");
                    }
                  }
                  if (result5 !== null) {
                    result4 = [];
                    while (result5 !== null) {
                      result4.push(result5);
                      if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                        result5 = input.charAt(pos);
                        pos++;
                      } else {
                        result5 = null;
                        if (reportFailures === 0) {
                          matchFailed("[A-Z0-9_]");
                        }
                      }
                    }
                  } else {
                    result4 = null;
                  }
                  if (result4 !== null) {
                    if (input.charCodeAt(pos) === 58) {
                      result5 = ":";
                      pos++;
                    } else {
                      result5 = null;
                      if (reportFailures === 0) {
                        matchFailed("\":\"");
                      }
                    }
                    if (result5 !== null) {
                      if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                        result7 = input.charAt(pos);
                        pos++;
                      } else {
                        result7 = null;
                        if (reportFailures === 0) {
                          matchFailed("[A-Z0-9_]");
                        }
                      }
                      if (result7 !== null) {
                        result6 = [];
                        while (result7 !== null) {
                          result6.push(result7);
                          if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                            result7 = input.charAt(pos);
                            pos++;
                          } else {
                            result7 = null;
                            if (reportFailures === 0) {
                              matchFailed("[A-Z0-9_]");
                            }
                          }
                        }
                      } else {
                        result6 = null;
                      }
                      if (result6 !== null) {
                        result7 = parse__();
                        if (result7 !== null) {
                          result8 = parse_LineTerminator();
                          result8 = result8 !== null ? result8 : "";
                          if (result8 !== null) {
                            result0 = [result0, result1, result2, result3, result4, result5, result6, result7, result8];
                          } else {
                            result0 = null;
                            pos = pos1;
                          }
                        } else {
                          result0 = null;
                          pos = pos1;
                        }
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, node, port, pub) {return parser.registerInports(node.join(""),port.join(""),pub.join(""))})(pos0, result0[2], result0[4], result0[6]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            result0 = parse__();
            if (result0 !== null) {
              if (input.substr(pos, 8) === "OUTPORT=") {
                result1 = "OUTPORT=";
                pos += 8;
              } else {
                result1 = null;
                if (reportFailures === 0) {
                  matchFailed("\"OUTPORT=\"");
                }
              }
              if (result1 !== null) {
                if (/^[A-Za-z0-9_]/.test(input.charAt(pos))) {
                  result3 = input.charAt(pos);
                  pos++;
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("[A-Za-z0-9_]");
                  }
                }
                if (result3 !== null) {
                  result2 = [];
                  while (result3 !== null) {
                    result2.push(result3);
                    if (/^[A-Za-z0-9_]/.test(input.charAt(pos))) {
                      result3 = input.charAt(pos);
                      pos++;
                    } else {
                      result3 = null;
                      if (reportFailures === 0) {
                        matchFailed("[A-Za-z0-9_]");
                      }
                    }
                  }
                } else {
                  result2 = null;
                }
                if (result2 !== null) {
                  if (input.charCodeAt(pos) === 46) {
                    result3 = ".";
                    pos++;
                  } else {
                    result3 = null;
                    if (reportFailures === 0) {
                      matchFailed("\".\"");
                    }
                  }
                  if (result3 !== null) {
                    if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                      result5 = input.charAt(pos);
                      pos++;
                    } else {
                      result5 = null;
                      if (reportFailures === 0) {
                        matchFailed("[A-Z0-9_]");
                      }
                    }
                    if (result5 !== null) {
                      result4 = [];
                      while (result5 !== null) {
                        result4.push(result5);
                        if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                          result5 = input.charAt(pos);
                          pos++;
                        } else {
                          result5 = null;
                          if (reportFailures === 0) {
                            matchFailed("[A-Z0-9_]");
                          }
                        }
                      }
                    } else {
                      result4 = null;
                    }
                    if (result4 !== null) {
                      if (input.charCodeAt(pos) === 58) {
                        result5 = ":";
                        pos++;
                      } else {
                        result5 = null;
                        if (reportFailures === 0) {
                          matchFailed("\":\"");
                        }
                      }
                      if (result5 !== null) {
                        if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                          result7 = input.charAt(pos);
                          pos++;
                        } else {
                          result7 = null;
                          if (reportFailures === 0) {
                            matchFailed("[A-Z0-9_]");
                          }
                        }
                        if (result7 !== null) {
                          result6 = [];
                          while (result7 !== null) {
                            result6.push(result7);
                            if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                              result7 = input.charAt(pos);
                              pos++;
                            } else {
                              result7 = null;
                              if (reportFailures === 0) {
                                matchFailed("[A-Z0-9_]");
                              }
                            }
                          }
                        } else {
                          result6 = null;
                        }
                        if (result6 !== null) {
                          result7 = parse__();
                          if (result7 !== null) {
                            result8 = parse_LineTerminator();
                            result8 = result8 !== null ? result8 : "";
                            if (result8 !== null) {
                              result0 = [result0, result1, result2, result3, result4, result5, result6, result7, result8];
                            } else {
                              result0 = null;
                              pos = pos1;
                            }
                          } else {
                            result0 = null;
                            pos = pos1;
                          }
                        } else {
                          result0 = null;
                          pos = pos1;
                        }
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = (function(offset, node, port, pub) {return parser.registerOutports(node.join(""),port.join(""),pub.join(""))})(pos0, result0[2], result0[4], result0[6]);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              pos0 = pos;
              result0 = parse_comment();
              if (result0 !== null) {
                if (/^[\n\r\u2028\u2029]/.test(input.charAt(pos))) {
                  result1 = input.charAt(pos);
                  pos++;
                } else {
                  result1 = null;
                  if (reportFailures === 0) {
                    matchFailed("[\\n\\r\\u2028\\u2029]");
                  }
                }
                result1 = result1 !== null ? result1 : "";
                if (result1 !== null) {
                  result0 = [result0, result1];
                } else {
                  result0 = null;
                  pos = pos0;
                }
              } else {
                result0 = null;
                pos = pos0;
              }
              if (result0 === null) {
                pos0 = pos;
                result0 = parse__();
                if (result0 !== null) {
                  if (/^[\n\r\u2028\u2029]/.test(input.charAt(pos))) {
                    result1 = input.charAt(pos);
                    pos++;
                  } else {
                    result1 = null;
                    if (reportFailures === 0) {
                      matchFailed("[\\n\\r\\u2028\\u2029]");
                    }
                  }
                  if (result1 !== null) {
                    result0 = [result0, result1];
                  } else {
                    result0 = null;
                    pos = pos0;
                  }
                } else {
                  result0 = null;
                  pos = pos0;
                }
                if (result0 === null) {
                  pos0 = pos;
                  pos1 = pos;
                  result0 = parse__();
                  if (result0 !== null) {
                    result1 = parse_connection();
                    if (result1 !== null) {
                      result2 = parse__();
                      if (result2 !== null) {
                        result3 = parse_LineTerminator();
                        result3 = result3 !== null ? result3 : "";
                        if (result3 !== null) {
                          result0 = [result0, result1, result2, result3];
                        } else {
                          result0 = null;
                          pos = pos1;
                        }
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                  if (result0 !== null) {
                    result0 = (function(offset, edges) {return parser.registerEdges(edges);})(pos0, result0[1]);
                  }
                  if (result0 === null) {
                    pos = pos0;
                  }
                }
              }
            }
          }
        }
        return result0;
      }
      
      function parse_LineTerminator() {
        var result0, result1, result2, result3;
        var pos0;
        
        pos0 = pos;
        result0 = parse__();
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 44) {
            result1 = ",";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\",\"");
            }
          }
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse_comment();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              if (/^[\n\r\u2028\u2029]/.test(input.charAt(pos))) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("[\\n\\r\\u2028\\u2029]");
                }
              }
              result3 = result3 !== null ? result3 : "";
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos0;
              }
            } else {
              result0 = null;
              pos = pos0;
            }
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        return result0;
      }
      
      function parse_comment() {
        var result0, result1, result2, result3;
        var pos0;
        
        pos0 = pos;
        result0 = parse__();
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 35) {
            result1 = "#";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"#\"");
            }
          }
          if (result1 !== null) {
            result2 = [];
            result3 = parse_anychar();
            while (result3 !== null) {
              result2.push(result3);
              result3 = parse_anychar();
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos0;
            }
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        return result0;
      }
      
      function parse_connection() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_bridge();
        if (result0 !== null) {
          result1 = parse__();
          if (result1 !== null) {
            if (input.substr(pos, 2) === "->") {
              result2 = "->";
              pos += 2;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"->\"");
              }
            }
            if (result2 !== null) {
              result3 = parse__();
              if (result3 !== null) {
                result4 = parse_connection();
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, x, y) { return [x,y]; })(pos0, result0[0], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          result0 = parse_bridge();
        }
        return result0;
      }
      
      function parse_bridge() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_port();
        if (result0 !== null) {
          result1 = parse__();
          if (result1 !== null) {
            result2 = parse_node();
            if (result2 !== null) {
              result3 = parse__();
              if (result3 !== null) {
                result4 = parse_port();
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, x, proc, y) { return [{"tgt":{process:proc, port:x}},{"src":{process:proc, port:y}}]; })(pos0, result0[0], result0[2], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          result0 = parse_iip();
          if (result0 === null) {
            result0 = parse_rightlet();
            if (result0 === null) {
              result0 = parse_leftlet();
            }
          }
        }
        return result0;
      }
      
      function parse_leftlet() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_node();
        if (result0 !== null) {
          result1 = parse__();
          if (result1 !== null) {
            result2 = parse_port();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, proc, port) { return {"src":{process:proc, port:port}} })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          result0 = parse_node();
          if (result0 !== null) {
            result1 = parse__();
            if (result1 !== null) {
              result2 = parse_portWithIndex();
              if (result2 !== null) {
                result0 = [result0, result1, result2];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, proc, port) { return {"src":{process:proc, port:port.port, index: port.index}} })(pos0, result0[0], result0[2]);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        return result0;
      }
      
      function parse_iip() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 39) {
          result0 = "'";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"'\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_iipchar();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_iipchar();
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 39) {
              result2 = "'";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"'\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, iip) { return {"data":iip.join("")} })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_rightlet() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_port();
        if (result0 !== null) {
          result1 = parse__();
          if (result1 !== null) {
            result2 = parse_node();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, port, proc) { return {"tgt":{process:proc, port:port}} })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          result0 = parse_portWithIndex();
          if (result0 !== null) {
            result1 = parse__();
            if (result1 !== null) {
              result2 = parse_node();
              if (result2 !== null) {
                result0 = [result0, result1, result2];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, port, proc) { return {"tgt":{process:proc, port:port.port, index: port.index}} })(pos0, result0[0], result0[2]);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        return result0;
      }
      
      function parse_node() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (/^[a-zA-Z0-9_]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[a-zA-Z0-9_]");
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (/^[a-zA-Z0-9_]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[a-zA-Z0-9_]");
              }
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result1 = parse_component();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, node, comp) { if(comp){parser.addNode(node.join(""),comp);}; return node.join("")})(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_component() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 40) {
          result0 = "(";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"(\"");
          }
        }
        if (result0 !== null) {
          if (/^[a-zA-Z\/\-0-9_]/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[a-zA-Z\\/\\-0-9_]");
            }
          }
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              if (/^[a-zA-Z\/\-0-9_]/.test(input.charAt(pos))) {
                result2 = input.charAt(pos);
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("[a-zA-Z\\/\\-0-9_]");
                }
              }
            }
          } else {
            result1 = null;
          }
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse_compMeta();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 41) {
                result3 = ")";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\")\"");
                }
              }
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, comp, meta) { var o = {}; comp ? o.comp = comp.join("") : o.comp = ''; meta ? o.meta = meta.join("").split(',') : null; return o; })(pos0, result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_compMeta() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 58) {
          result0 = ":";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\":\"");
          }
        }
        if (result0 !== null) {
          if (/^[a-zA-Z\/=_,0-9]/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[a-zA-Z\\/=_,0-9]");
            }
          }
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              if (/^[a-zA-Z\/=_,0-9]/.test(input.charAt(pos))) {
                result2 = input.charAt(pos);
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("[a-zA-Z\\/=_,0-9]");
                }
              }
            }
          } else {
            result1 = null;
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, meta) {return meta})(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_port() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (/^[A-Z.0-9_]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[A-Z.0-9_]");
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (/^[A-Z.0-9_]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[A-Z.0-9_]");
              }
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, portname) {return portname.join("").toLowerCase()})(pos0, result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_portWithIndex() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (/^[A-Z.0-9_]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[A-Z.0-9_]");
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (/^[A-Z.0-9_]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[A-Z.0-9_]");
              }
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 91) {
            result1 = "[";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"[\"");
            }
          }
          if (result1 !== null) {
            if (/^[0-9]/.test(input.charAt(pos))) {
              result3 = input.charAt(pos);
              pos++;
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("[0-9]");
              }
            }
            if (result3 !== null) {
              result2 = [];
              while (result3 !== null) {
                result2.push(result3);
                if (/^[0-9]/.test(input.charAt(pos))) {
                  result3 = input.charAt(pos);
                  pos++;
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("[0-9]");
                  }
                }
              }
            } else {
              result2 = null;
            }
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 93) {
                result3 = "]";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\"]\"");
                }
              }
              if (result3 !== null) {
                result4 = parse___();
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, portname, portindex) {return { port: portname.join("").toLowerCase(), index: parseInt(portindex.join('')) }})(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_anychar() {
        var result0;
        
        if (/^[^\n\r\u2028\u2029]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[^\\n\\r\\u2028\\u2029]");
          }
        }
        return result0;
      }
      
      function parse_iipchar() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (/^[\\]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[\\\\]");
          }
        }
        if (result0 !== null) {
          if (/^[']/.test(input.charAt(pos))) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[']");
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return "'"; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          if (/^[^']/.test(input.charAt(pos))) {
            result0 = input.charAt(pos);
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("[^']");
            }
          }
        }
        return result0;
      }
      
      function parse__() {
        var result0, result1;
        
        result0 = [];
        if (input.charCodeAt(pos) === 32) {
          result1 = " ";
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("\" \"");
          }
        }
        while (result1 !== null) {
          result0.push(result1);
          if (input.charCodeAt(pos) === 32) {
            result1 = " ";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\" \"");
            }
          }
        }
        result0 = result0 !== null ? result0 : "";
        return result0;
      }
      
      function parse___() {
        var result0, result1;
        
        if (input.charCodeAt(pos) === 32) {
          result1 = " ";
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("\" \"");
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (input.charCodeAt(pos) === 32) {
              result1 = " ";
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\" \"");
              }
            }
          }
        } else {
          result0 = null;
        }
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {
          var ch = input.charAt(i);
          if (ch === "\n") {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
        var parser, edges, nodes; 
      
        parser = this;
        delete parser.exports;
        delete parser.inports;
        delete parser.outports;
      
        edges = parser.edges = [];
      
        nodes = {};
      
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
              metadata[item[0]] = item[1];
            }
            nodes[nodeName].metadata=metadata;
          }
         
        }
      
        parser.getResult = function () {
          return {processes:nodes, connections:parser.processEdges(), exports:parser.exports, inports: parser.inports, outports: parser.outports};
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
        
        parser.registerExports = function (priv, pub) {
          if (!parser.exports) {
            parser.exports = [];
          }
          parser.exports.push({private:priv.toLowerCase(), public:pub.toLowerCase()})
        }
        parser.registerInports = function (node, port, pub) {
          if (!parser.inports) {
            parser.inports = {};
          }
          parser.inports[pub.toLowerCase()] = {process:node, port:port.toLowerCase()}
        }
        parser.registerOutports = function (node, port, pub) {
          if (!parser.outports) {
            parser.outports = {};
          }
          parser.outports[pub.toLowerCase()] = {process:node, port:port.toLowerCase()}
        }
      
        parser.registerEdges = function (edges) {
      
          edges.forEach(function (o, i) {
            parser.edges.push(o);
          });
        }  
      
        parser.processEdges = function () {   
          var flats, grouped;
          flats = flatten(parser.edges);
          grouped = [];
          var current = {};
          flats.forEach(function (o, i) {
            if (i % 2 !== 0) { 
              var pair = grouped[grouped.length - 1];
              pair.tgt = o.tgt;
              return;
            }
            grouped.push(o);
          });
          return grouped;
        }
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var offset = Math.max(pos, rightmostFailuresPos);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = computeErrorPosition();
        
        throw new this.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      var expectedHumanized, foundHumanized;
      
      switch (expected.length) {
        case 0:
          expectedHumanized = "end of input";
          break;
        case 1:
          expectedHumanized = expected[0];
          break;
        default:
          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }
      
      foundHumanized = found ? quote(found) : "end of input";
      
      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
    }
    
    this.name = "SyntaxError";
    this.expected = expected;
    this.found = found;
    this.message = buildMessage(expected, found);
    this.offset = offset;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();
},{}],55:[function(require,module,exports){
(function (process){
var EE = require('events').EventEmitter
var log = exports = module.exports = new EE
var util = require('util')

var ansi = require('ansi')
log.cursor = ansi(process.stderr)
log.stream = process.stderr

// by default, let ansi decide based on tty-ness.
var colorEnabled = undefined
log.enableColor = function () {
  colorEnabled = true
  this.cursor.enabled = true
}
log.disableColor = function () {
  colorEnabled = false
  this.cursor.enabled = false
}

// default level
log.level = 'info'

// temporarily stop emitting, but don't drop
log.pause = function () {
  this._paused = true
}

log.resume = function () {
  if (!this._paused) return
  this._paused = false

  var b = this._buffer
  this._buffer = []
  b.forEach(function (m) {
    this.emitLog(m)
  }, this)
}

log._buffer = []

var id = 0
log.record = []
log.maxRecordSize = 10000
log.log = function (lvl, prefix, message) {
  var l = this.levels[lvl]
  if (l === undefined) {
    return this.emit('error', new Error(util.format(
      'Undefined log level: %j', lvl)))
  }

  var a = new Array(arguments.length - 2)
  var stack = null
  for (var i = 2; i < arguments.length; i ++) {
    var arg = a[i-2] = arguments[i]

    // resolve stack traces to a plain string.
    if (typeof arg === 'object' && arg &&
        (arg instanceof Error) && arg.stack) {
      arg.stack = stack = arg.stack + ''
    }
  }
  if (stack) a.unshift(stack + '\n')
  message = util.format.apply(util, a)

  var m = { id: id++,
            level: lvl,
            prefix: String(prefix || ''),
            message: message,
            messageRaw: a }

  this.emit('log', m)
  this.emit('log.' + lvl, m)
  if (m.prefix) this.emit(m.prefix, m)

  this.record.push(m)
  var mrs = this.maxRecordSize
  var n = this.record.length - mrs
  if (n > mrs / 10) {
    var newSize = Math.floor(mrs * 0.9)
    this.record = this.record.slice(-1 * newSize)
  }

  this.emitLog(m)
}.bind(log)

log.emitLog = function (m) {
  if (this._paused) {
    this._buffer.push(m)
    return
  }
  var l = this.levels[m.level]
  if (l === undefined) return
  if (l < this.levels[this.level]) return
  if (l > 0 && !isFinite(l)) return

  var style = log.style[m.level]
  var disp = log.disp[m.level] || m.level
  m.message.split(/\r?\n/).forEach(function (line) {
    if (this.heading) {
      this.write(this.heading, this.headingStyle)
      this.write(' ')
    }
    this.write(disp, log.style[m.level])
    var p = m.prefix || ''
    if (p) this.write(' ')
    this.write(p, this.prefixStyle)
    this.write(' ' + line + '\n')
  }, this)
}

log.write = function (msg, style) {
  if (!this.cursor) return
  if (this.stream !== this.cursor.stream) {
    this.cursor = ansi(this.stream, { enabled: colorEnabled })
  }

  style = style || {}
  if (style.fg) this.cursor.fg[style.fg]()
  if (style.bg) this.cursor.bg[style.bg]()
  if (style.bold) this.cursor.bold()
  if (style.underline) this.cursor.underline()
  if (style.inverse) this.cursor.inverse()
  if (style.beep) this.cursor.beep()
  this.cursor.write(msg).reset()
}

log.addLevel = function (lvl, n, style, disp) {
  if (!disp) disp = lvl
  this.levels[lvl] = n
  this.style[lvl] = style
  if (!this[lvl]) this[lvl] = function () {
    var a = new Array(arguments.length + 1)
    a[0] = lvl
    for (var i = 0; i < arguments.length; i ++) {
      a[i + 1] = arguments[i]
    }
    return this.log.apply(this, a)
  }.bind(this)
  this.disp[lvl] = disp
}

log.prefixStyle = { fg: 'magenta' }
log.headingStyle = { fg: 'white', bg: 'black' }

log.style = {}
log.levels = {}
log.disp = {}
log.addLevel('silly', -Infinity, { inverse: true }, 'sill')
log.addLevel('verbose', 1000, { fg: 'blue', bg: 'black' }, 'verb')
log.addLevel('info', 2000, { fg: 'green' })
log.addLevel('http', 3000, { fg: 'green', bg: 'black' })
log.addLevel('warn', 4000, { fg: 'black', bg: 'yellow' }, 'WARN')
log.addLevel('error', 5000, { fg: 'red', bg: 'black' }, 'ERR!')
log.addLevel('silent', Infinity)

}).call(this,require("JkpR2F"))
},{"JkpR2F":13,"ansi":56,"events":10,"util":20}],56:[function(require,module,exports){

/**
 * References:
 *
 *   - http://en.wikipedia.org/wiki/ANSI_escape_code
 *   - http://www.termsys.demon.co.uk/vtansi.htm
 *
 */

/**
 * Module dependencies.
 */

var emitNewlineEvents = require('./newlines')
  , prefix = '\x1b[' // For all escape codes
  , suffix = 'm'     // Only for color codes

/**
 * The ANSI escape sequences.
 */

var codes = {
    up: 'A'
  , down: 'B'
  , forward: 'C'
  , back: 'D'
  , nextLine: 'E'
  , previousLine: 'F'
  , horizontalAbsolute: 'G'
  , eraseData: 'J'
  , eraseLine: 'K'
  , scrollUp: 'S'
  , scrollDown: 'T'
  , savePosition: 's'
  , restorePosition: 'u'
  , queryPosition: '6n'
  , hide: '?25l'
  , show: '?25h'
}

/**
 * Rendering ANSI codes.
 */

var styles = {
    bold: 1
  , italic: 3
  , underline: 4
  , inverse: 7
}

/**
 * The negating ANSI code for the rendering modes.
 */

var reset = {
    bold: 22
  , italic: 23
  , underline: 24
  , inverse: 27
}

/**
 * The standard, styleable ANSI colors.
 */

var colors = {
    white: 37
  , black: 30
  , blue: 34
  , cyan: 36
  , green: 32
  , magenta: 35
  , red: 31
  , yellow: 33
  , grey: 90
  , brightBlack: 90
  , brightRed: 91
  , brightGreen: 92
  , brightYellow: 93
  , brightBlue: 94
  , brightMagenta: 95
  , brightCyan: 96
  , brightWhite: 97
}


/**
 * Creates a Cursor instance based off the given `writable stream` instance.
 */

function ansi (stream, options) {
  if (stream._ansicursor) {
    return stream._ansicursor
  } else {
    return stream._ansicursor = new Cursor(stream, options)
  }
}
module.exports = exports = ansi

/**
 * The `Cursor` class.
 */

function Cursor (stream, options) {
  if (!(this instanceof Cursor)) {
    return new Cursor(stream, options)
  }
  if (typeof stream != 'object' || typeof stream.write != 'function') {
    throw new Error('a valid Stream instance must be passed in')
  }

  // the stream to use
  this.stream = stream

  // when 'enabled' is false then all the functions are no-ops except for write()
  this.enabled = options && options.enabled
  if (typeof this.enabled === 'undefined') {
    this.enabled = stream.isTTY
  }
  this.enabled = !!this.enabled

  // then `buffering` is true, then `write()` calls are buffered in
  // memory until `flush()` is invoked
  this.buffering = !!(options && options.buffering)
  this._buffer = []

  // controls the foreground and background colors
  this.fg = this.foreground = new Colorer(this, 0)
  this.bg = this.background = new Colorer(this, 10)

  // defaults
  this.Bold = false
  this.Italic = false
  this.Underline = false
  this.Inverse = false

  // keep track of the number of "newlines" that get encountered
  this.newlines = 0
  emitNewlineEvents(stream)
  stream.on('newline', function () {
    this.newlines++
  }.bind(this))
}
exports.Cursor = Cursor

/**
 * Helper function that calls `write()` on the underlying Stream.
 * Returns `this` instead of the write() return value to keep
 * the chaining going.
 */

Cursor.prototype.write = function (data) {
  if (this.buffering) {
    this._buffer.push(arguments)
  } else {
    this.stream.write.apply(this.stream, arguments)
  }
  return this
}

/**
 * Buffer `write()` calls into memory.
 *
 * @api public
 */

Cursor.prototype.buffer = function () {
  this.buffering = true
  return this
}

/**
 * Write out the in-memory buffer.
 *
 * @api public
 */

Cursor.prototype.flush = function () {
  this.buffering = false
  var str = this._buffer.map(function (args) {
    if (args.length != 1) throw new Error('unexpected args length! ' + args.length);
    return args[0];
  }).join('');
  this._buffer.splice(0); // empty
  this.write(str);
  return this
}


/**
 * The `Colorer` class manages both the background and foreground colors.
 */

function Colorer (cursor, base) {
  this.current = null
  this.cursor = cursor
  this.base = base
}
exports.Colorer = Colorer

/**
 * Write an ANSI color code, ensuring that the same code doesn't get rewritten.
 */

Colorer.prototype._setColorCode = function setColorCode (code) {
  var c = String(code)
  if (this.current === c) return
  this.cursor.enabled && this.cursor.write(prefix + c + suffix)
  this.current = c
  return this
}


/**
 * Set up the positional ANSI codes.
 */

Object.keys(codes).forEach(function (name) {
  var code = String(codes[name])
  Cursor.prototype[name] = function () {
    var c = code
    if (arguments.length > 0) {
      c = toArray(arguments).map(Math.round).join(';') + code
    }
    this.enabled && this.write(prefix + c)
    return this
  }
})

/**
 * Set up the functions for the rendering ANSI codes.
 */

Object.keys(styles).forEach(function (style) {
  var name = style[0].toUpperCase() + style.substring(1)
    , c = styles[style]
    , r = reset[style]

  Cursor.prototype[style] = function () {
    if (this[name]) return
    this.enabled && this.write(prefix + c + suffix)
    this[name] = true
    return this
  }

  Cursor.prototype['reset' + name] = function () {
    if (!this[name]) return
    this.enabled && this.write(prefix + r + suffix)
    this[name] = false
    return this
  }
})

/**
 * Setup the functions for the standard colors.
 */

Object.keys(colors).forEach(function (color) {
  var code = colors[color]

  Colorer.prototype[color] = function () {
    this._setColorCode(this.base + code)
    return this.cursor
  }

  Cursor.prototype[color] = function () {
    return this.foreground[color]()
  }
})

/**
 * Makes a beep sound!
 */

Cursor.prototype.beep = function () {
  this.enabled && this.write('\x07')
  return this
}

/**
 * Moves cursor to specific position
 */

Cursor.prototype.goto = function (x, y) {
  x = x | 0
  y = y | 0
  this.enabled && this.write(prefix + y + ';' + x + 'H')
  return this
}

/**
 * Resets the color.
 */

Colorer.prototype.reset = function () {
  this._setColorCode(this.base + 39)
  return this.cursor
}

/**
 * Resets all ANSI formatting on the stream.
 */

Cursor.prototype.reset = function () {
  this.enabled && this.write(prefix + '0' + suffix)
  this.Bold = false
  this.Italic = false
  this.Underline = false
  this.Inverse = false
  this.foreground.current = null
  this.background.current = null
  return this
}

/**
 * Sets the foreground color with the given RGB values.
 * The closest match out of the 216 colors is picked.
 */

Colorer.prototype.rgb = function (r, g, b) {
  var base = this.base + 38
    , code = rgb(r, g, b)
  this._setColorCode(base + ';5;' + code)
  return this.cursor
}

/**
 * Same as `cursor.fg.rgb(r, g, b)`.
 */

Cursor.prototype.rgb = function (r, g, b) {
  return this.foreground.rgb(r, g, b)
}

/**
 * Accepts CSS color codes for use with ANSI escape codes.
 * For example: `#FF000` would be bright red.
 */

Colorer.prototype.hex = function (color) {
  return this.rgb.apply(this, hex(color))
}

/**
 * Same as `cursor.fg.hex(color)`.
 */

Cursor.prototype.hex = function (color) {
  return this.foreground.hex(color)
}


// UTIL FUNCTIONS //

/**
 * Translates a 255 RGB value to a 0-5 ANSI RGV value,
 * then returns the single ANSI color code to use.
 */

function rgb (r, g, b) {
  var red = r / 255 * 5
    , green = g / 255 * 5
    , blue = b / 255 * 5
  return rgb5(red, green, blue)
}

/**
 * Turns rgb 0-5 values into a single ANSI color code to use.
 */

function rgb5 (r, g, b) {
  var red = Math.round(r)
    , green = Math.round(g)
    , blue = Math.round(b)
  return 16 + (red*36) + (green*6) + blue
}

/**
 * Accepts a hex CSS color code string (# is optional) and
 * translates it into an Array of 3 RGB 0-255 values, which
 * can then be used with rgb().
 */

function hex (color) {
  var c = color[0] === '#' ? color.substring(1) : color
    , r = c.substring(0, 2)
    , g = c.substring(2, 4)
    , b = c.substring(4, 6)
  return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)]
}

/**
 * Turns an array-like object into a real array.
 */

function toArray (a) {
  var i = 0
    , l = a.length
    , rtn = []
  for (; i<l; i++) {
    rtn.push(a[i])
  }
  return rtn
}

},{"./newlines":57}],57:[function(require,module,exports){

/**
 * Accepts any node Stream instance and hijacks its "write()" function,
 * so that it can count any newlines that get written to the output.
 *
 * When a '\n' byte is encountered, then a "newline" event will be emitted
 * on the stream, with no arguments. It is up to the listeners to determine
 * any necessary deltas required for their use-case.
 *
 * Ex:
 *
 *   var cursor = ansi(process.stdout)
 *     , ln = 0
 *   process.stdout.on('newline', function () {
 *    ln++
 *   })
 */

/**
 * Module dependencies.
 */

var assert = require('assert')
var NEWLINE = '\n'.charCodeAt(0)

function emitNewlineEvents (stream) {
  if (stream._emittingNewlines) {
    // already emitting newline events
    return
  }

  var write = stream.write

  stream.write = function (data) {
    // first write the data
    var rtn = write.apply(stream, arguments)

    if (stream.listeners('newline').length > 0) {
      var len = data.length
        , i = 0
      // now try to calculate any deltas
      if (typeof data == 'string') {
        for (; i<len; i++) {
          processByte(stream, data.charCodeAt(i))
        }
      } else {
        // buffer
        for (; i<len; i++) {
          processByte(stream, data[i])
        }
      }
    }

    return rtn
  }

  stream._emittingNewlines = true
}
module.exports = emitNewlineEvents


/**
 * Processes an individual byte being written to a stream
 */

function processByte (stream, b) {
  assert.equal(typeof b, 'number')
  if (b === NEWLINE) {
    stream.emit('newline')
  }
}

},{"assert":3}],58:[function(require,module,exports){
(function (process){
// this keeps a queue of opened file descriptors, and will make
// fs operations wait until some have closed before trying to open more.

var fs = require("fs")

// there is such a thing as TOO graceful.
if (fs.open === gracefulOpen) return

var queue = []
  , constants = require("constants")

exports = module.exports = fs
fs._curOpen = 0

fs.MIN_MAX_OPEN = 64
fs.MAX_OPEN = 1024

var originalOpen = fs.open
  , originalOpenSync = fs.openSync
  , originalClose = fs.close
  , originalCloseSync = fs.closeSync


// prevent EMFILE errors
function OpenReq (path, flags, mode, cb) {
  this.path = path
  this.flags = flags
  this.mode = mode
  this.cb = cb
}

function noop () {}

fs.open = gracefulOpen

function gracefulOpen (path, flags, mode, cb) {
  if (typeof mode === "function") cb = mode, mode = null
  if (typeof cb !== "function") cb = noop

  if (fs._curOpen >= fs.MAX_OPEN) {
    queue.push(new OpenReq(path, flags, mode, cb))
    setTimeout(flush)
    return
  }
  open(path, flags, mode, function (er, fd) {
    if (er && er.code === "EMFILE" && fs._curOpen > fs.MIN_MAX_OPEN) {
      // that was too many.  reduce max, get back in queue.
      // this should only happen once in a great while, and only
      // if the ulimit -n is set lower than 1024.
      fs.MAX_OPEN = fs._curOpen - 1
      return fs.open(path, flags, mode, cb)
    }
    cb(er, fd)
  })
}

function open (path, flags, mode, cb) {
  cb = cb || noop
  fs._curOpen ++
  originalOpen.call(fs, path, flags, mode, function (er, fd) {
    if (er) onclose()
    cb(er, fd)
  })
}

fs.openSync = function (path, flags, mode) {
  var ret
  ret = originalOpenSync.call(fs, path, flags, mode)
  fs._curOpen ++
  return ret
}

function onclose () {
  fs._curOpen --
  flush()
}

function flush () {
  while (fs._curOpen < fs.MAX_OPEN) {
    var req = queue.shift()
    if (!req) return
    open(req.path, req.flags || "r", req.mode || 0777, req.cb)
  }
}

fs.close = function (fd, cb) {
  cb = cb || noop
  originalClose.call(fs, fd, function (er) {
    onclose()
    cb(er)
  })
}

fs.closeSync = function (fd) {
  onclose()
  return originalCloseSync.call(fs, fd)
}


// (re-)implement some things that are known busted or missing.

var constants = require("constants")

// lchmod, broken prior to 0.6.2
// back-port the fix here.
if (constants.hasOwnProperty('O_SYMLINK') &&
    process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
  fs.lchmod = function (path, mode, callback) {
    callback = callback || noop
    fs.open( path
           , constants.O_WRONLY | constants.O_SYMLINK
           , mode
           , function (err, fd) {
      if (err) {
        callback(err)
        return
      }
      // prefer to return the chmod error, if one occurs,
      // but still try to close, and report closing errors if they occur.
      fs.fchmod(fd, mode, function (err) {
        fs.close(fd, function(err2) {
          callback(err || err2)
        })
      })
    })
  }

  fs.lchmodSync = function (path, mode) {
    var fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode)

    // prefer to return the chmod error, if one occurs,
    // but still try to close, and report closing errors if they occur.
    var err, err2
    try {
      var ret = fs.fchmodSync(fd, mode)
    } catch (er) {
      err = er
    }
    try {
      fs.closeSync(fd)
    } catch (er) {
      err2 = er
    }
    if (err || err2) throw (err || err2)
    return ret
  }
}


// lutimes implementation, or no-op
if (!fs.lutimes) {
  if (constants.hasOwnProperty("O_SYMLINK")) {
    fs.lutimes = function (path, at, mt, cb) {
      fs.open(path, constants.O_SYMLINK, function (er, fd) {
        cb = cb || noop
        if (er) return cb(er)
        fs.futimes(fd, at, mt, function (er) {
          fs.close(fd, function (er2) {
            return cb(er || er2)
          })
        })
      })
    }

    fs.lutimesSync = function (path, at, mt) {
      var fd = fs.openSync(path, constants.O_SYMLINK)
        , err
        , err2
        , ret

      try {
        var ret = fs.futimesSync(fd, at, mt)
      } catch (er) {
        err = er
      }
      try {
        fs.closeSync(fd)
      } catch (er) {
        err2 = er
      }
      if (err || err2) throw (err || err2)
      return ret
    }

  } else if (fs.utimensat && constants.hasOwnProperty("AT_SYMLINK_NOFOLLOW")) {
    // maybe utimensat will be bound soonish?
    fs.lutimes = function (path, at, mt, cb) {
      fs.utimensat(path, at, mt, constants.AT_SYMLINK_NOFOLLOW, cb)
    }

    fs.lutimesSync = function (path, at, mt) {
      return fs.utimensatSync(path, at, mt, constants.AT_SYMLINK_NOFOLLOW)
    }

  } else {
    fs.lutimes = function (_a, _b, _c, cb) { process.nextTick(cb) }
    fs.lutimesSync = function () {}
  }
}


// https://github.com/isaacs/node-graceful-fs/issues/4
// Chown should not fail on einval or eperm if non-root.

fs.chown = chownFix(fs.chown)
fs.fchown = chownFix(fs.fchown)
fs.lchown = chownFix(fs.lchown)

fs.chownSync = chownFixSync(fs.chownSync)
fs.fchownSync = chownFixSync(fs.fchownSync)
fs.lchownSync = chownFixSync(fs.lchownSync)

function chownFix (orig) {
  if (!orig) return orig
  return function (target, uid, gid, cb) {
    return orig.call(fs, target, uid, gid, function (er, res) {
      if (chownErOk(er)) er = null
      cb(er, res)
    })
  }
}

function chownFixSync (orig) {
  if (!orig) return orig
  return function (target, uid, gid) {
    try {
      return orig.call(fs, target, uid, gid)
    } catch (er) {
      if (!chownErOk(er)) throw er
    }
  }
}

function chownErOk (er) {
  // if there's no getuid, or if getuid() is something other than 0,
  // and the error is EINVAL or EPERM, then just ignore it.
  // This specific case is a silent failure in cp, install, tar,
  // and most other unix tools that manage permissions.
  // When running as root, or if other types of errors are encountered,
  // then it's strict.
  if (!er || (!process.getuid || process.getuid() !== 0)
      && (er.code === "EINVAL" || er.code === "EPERM")) return true
}


// if lchmod/lchown do not exist, then make them no-ops
if (!fs.lchmod) {
  fs.lchmod = function (path, mode, cb) {
    process.nextTick(cb)
  }
  fs.lchmodSync = function () {}
}
if (!fs.lchown) {
  fs.lchown = function (path, uid, gid, cb) {
    process.nextTick(cb)
  }
  fs.lchownSync = function () {}
}



// on Windows, A/V software can lock the directory, causing this
// to fail with an EACCES or EPERM if the directory contains newly
// created files.  Try again on failure, for up to 1 second.
if (process.platform === "win32") {
  var rename_ = fs.rename
  fs.rename = function rename (from, to, cb) {
    var start = Date.now()
    rename_(from, to, function CB (er) {
      if (er
          && (er.code === "EACCES" || er.code === "EPERM")
          && Date.now() - start < 1000) {
        return rename_(from, to, CB)
      }
      cb(er)
    })
  }
}


// if read() returns EAGAIN, then just try it again.
var read = fs.read
fs.read = function (fd, buffer, offset, length, position, callback_) {
  var callback
  if (callback_ && typeof callback_ === 'function') {
    var eagCounter = 0
    callback = function (er, _, __) {
      if (er && er.code === 'EAGAIN' && eagCounter < 10) {
        eagCounter ++
        return read.call(fs, fd, buffer, offset, length, position, callback)
      }
      callback_.apply(this, arguments)
    }
  }
  return read.call(fs, fd, buffer, offset, length, position, callback)
}

var readSync = fs.readSync
fs.readSync = function (fd, buffer, offset, length, position) {
  var eagCounter = 0
  while (true) {
    try {
      return readSync.call(fs, fd, buffer, offset, length, position)
    } catch (er) {
      if (er.code === 'EAGAIN' && eagCounter < 10) {
        eagCounter ++
        continue
      }
      throw er
    }
  }
}

}).call(this,require("JkpR2F"))
},{"JkpR2F":13,"constants":9,"fs":2}],59:[function(require,module,exports){
(function (process){
// Approach:
//
// 1. Get the minimatch set
// 2. For each pattern in the set, PROCESS(pattern)
// 3. Store matches per-set, then uniq them
//
// PROCESS(pattern)
// Get the first [n] items from pattern that are all strings
// Join these together.  This is PREFIX.
//   If there is no more remaining, then stat(PREFIX) and
//   add to matches if it succeeds.  END.
// readdir(PREFIX) as ENTRIES
//   If fails, END
//   If pattern[n] is GLOBSTAR
//     // handle the case where the globstar match is empty
//     // by pruning it out, and testing the resulting pattern
//     PROCESS(pattern[0..n] + pattern[n+1 .. $])
//     // handle other cases.
//     for ENTRY in ENTRIES (not dotfiles)
//       // attach globstar + tail onto the entry
//       PROCESS(pattern[0..n] + ENTRY + pattern[n .. $])
//
//   else // not globstar
//     for ENTRY in ENTRIES (not dotfiles, unless pattern[n] is dot)
//       Test ENTRY against pattern[n]
//       If fails, continue
//       If passes, PROCESS(pattern[0..n] + item + pattern[n+1 .. $])
//
// Caveat:
//   Cache all stats and readdirs results to minimize syscall.  Since all
//   we ever care about is existence and directory-ness, we can just keep
//   `true` for files, and [children,...] for directories, or `false` for
//   things that don't exist.



module.exports = glob

var fs = require("fs")
, minimatch = require("minimatch")
, Minimatch = minimatch.Minimatch
, inherits = require("inherits")
, EE = require("events").EventEmitter
, path = require("path")
, isDir = {}
, assert = require("assert").ok

function glob (pattern, options, cb) {
  if (typeof options === "function") cb = options, options = {}
  if (!options) options = {}

  if (typeof options === "number") {
    deprecated()
    return
  }

  var g = new Glob(pattern, options, cb)
  return g.sync ? g.found : g
}

glob.fnmatch = deprecated

function deprecated () {
  throw new Error("glob's interface has changed. Please see the docs.")
}

glob.sync = globSync
function globSync (pattern, options) {
  if (typeof options === "number") {
    deprecated()
    return
  }

  options = options || {}
  options.sync = true
  return glob(pattern, options)
}

this._processingEmitQueue = false

glob.Glob = Glob
inherits(Glob, EE)
function Glob (pattern, options, cb) {
  if (!(this instanceof Glob)) {
    return new Glob(pattern, options, cb)
  }

  if (typeof options === "function") {
    cb = options
    options = null
  }

  if (typeof cb === "function") {
    this.on("error", cb)
    this.on("end", function (matches) {
      cb(null, matches)
    })
  }

  options = options || {}

  this._endEmitted = false
  this.EOF = {}
  this._emitQueue = []

  this.paused = false
  this._processingEmitQueue = false

  this.maxDepth = options.maxDepth || 1000
  this.maxLength = options.maxLength || Infinity
  this.cache = options.cache || {}
  this.statCache = options.statCache || {}

  this.changedCwd = false
  var cwd = process.cwd()
  if (!options.hasOwnProperty("cwd")) this.cwd = cwd
  else {
    this.cwd = options.cwd
    this.changedCwd = path.resolve(options.cwd) !== cwd
  }

  this.root = options.root || path.resolve(this.cwd, "/")
  this.root = path.resolve(this.root)
  if (process.platform === "win32")
    this.root = this.root.replace(/\\/g, "/")

  this.nomount = !!options.nomount

  if (!pattern) {
    throw new Error("must provide pattern")
  }

  // base-matching: just use globstar for that.
  if (options.matchBase && -1 === pattern.indexOf("/")) {
    if (options.noglobstar) {
      throw new Error("base matching requires globstar")
    }
    pattern = "**/" + pattern
  }

  this.strict = options.strict !== false
  this.dot = !!options.dot
  this.mark = !!options.mark
  this.sync = !!options.sync
  this.nounique = !!options.nounique
  this.nonull = !!options.nonull
  this.nosort = !!options.nosort
  this.nocase = !!options.nocase
  this.stat = !!options.stat

  this.debug = !!options.debug || !!options.globDebug
  if (this.debug)
    this.log = console.error

  this.silent = !!options.silent

  var mm = this.minimatch = new Minimatch(pattern, options)
  this.options = mm.options
  pattern = this.pattern = mm.pattern

  this.error = null
  this.aborted = false

  // list of all the patterns that ** has resolved do, so
  // we can avoid visiting multiple times.
  this._globstars = {}

  EE.call(this)

  // process each pattern in the minimatch set
  var n = this.minimatch.set.length

  // The matches are stored as {<filename>: true,...} so that
  // duplicates are automagically pruned.
  // Later, we do an Object.keys() on these.
  // Keep them as a list so we can fill in when nonull is set.
  this.matches = new Array(n)

  this.minimatch.set.forEach(iterator.bind(this))
  function iterator (pattern, i, set) {
    this._process(pattern, 0, i, function (er) {
      if (er) this.emit("error", er)
      if (-- n <= 0) this._finish()
    })
  }
}

Glob.prototype.log = function () {}

Glob.prototype._finish = function () {
  assert(this instanceof Glob)

  var nou = this.nounique
  , all = nou ? [] : {}

  for (var i = 0, l = this.matches.length; i < l; i ++) {
    var matches = this.matches[i]
    this.log("matches[%d] =", i, matches)
    // do like the shell, and spit out the literal glob
    if (!matches) {
      if (this.nonull) {
        var literal = this.minimatch.globSet[i]
        if (nou) all.push(literal)
        else all[literal] = true
      }
    } else {
      // had matches
      var m = Object.keys(matches)
      if (nou) all.push.apply(all, m)
      else m.forEach(function (m) {
        all[m] = true
      })
    }
  }

  if (!nou) all = Object.keys(all)

  if (!this.nosort) {
    all = all.sort(this.nocase ? alphasorti : alphasort)
  }

  if (this.mark) {
    // at *some* point we statted all of these
    all = all.map(this._mark, this)
  }

  this.log("emitting end", all)

  this.EOF = this.found = all
  this.emitMatch(this.EOF)
}

function alphasorti (a, b) {
  a = a.toLowerCase()
  b = b.toLowerCase()
  return alphasort(a, b)
}

function alphasort (a, b) {
  return a > b ? 1 : a < b ? -1 : 0
}

Glob.prototype._mark = function (p) {
  var c = this.cache[p]
  var m = p
  if (c) {
    var isDir = c === 2 || Array.isArray(c)
    var slash = p.slice(-1) === '/'

    if (isDir && !slash)
      m += '/'
    else if (!isDir && slash)
      m = m.slice(0, -1)

    if (m !== p) {
      this.statCache[m] = this.statCache[p]
      this.cache[m] = this.cache[p]
    }
  }

  return m
}

Glob.prototype.abort = function () {
  this.aborted = true
  this.emit("abort")
}

Glob.prototype.pause = function () {
  if (this.paused) return
  if (this.sync)
    this.emit("error", new Error("Can't pause/resume sync glob"))
  this.paused = true
  this.emit("pause")
}

Glob.prototype.resume = function () {
  if (!this.paused) return
  if (this.sync)
    this.emit("error", new Error("Can't pause/resume sync glob"))
  this.paused = false
  this.emit("resume")
  this._processEmitQueue()
  //process.nextTick(this.emit.bind(this, "resume"))
}

Glob.prototype.emitMatch = function (m) {
  this.log('emitMatch', m)
  this._emitQueue.push(m)
  this._processEmitQueue()
}

Glob.prototype._processEmitQueue = function (m) {
  this.log("pEQ paused=%j processing=%j m=%j", this.paused,
           this._processingEmitQueue, m)
  var done = false
  while (!this._processingEmitQueue &&
         !this.paused) {
    this._processingEmitQueue = true
    var m = this._emitQueue.shift()
    this.log(">processEmitQueue", m === this.EOF ? ":EOF:" : m)
    if (!m) {
      this.log(">processEmitQueue, falsey m")
      this._processingEmitQueue = false
      break
    }

    if (m === this.EOF || !(this.mark && !this.stat)) {
      this.log("peq: unmarked, or eof")
      next.call(this, 0, false)
    } else if (this.statCache[m]) {
      var sc = this.statCache[m]
      var exists
      if (sc)
        exists = sc.isDirectory() ? 2 : 1
      this.log("peq: stat cached")
      next.call(this, exists, exists === 2)
    } else {
      this.log("peq: _stat, then next")
      this._stat(m, next)
    }

    function next(exists, isDir) {
      this.log("next", m, exists, isDir)
      var ev = m === this.EOF ? "end" : "match"

      // "end" can only happen once.
      assert(!this._endEmitted)
      if (ev === "end")
        this._endEmitted = true

      if (exists) {
        // Doesn't mean it necessarily doesn't exist, it's possible
        // we just didn't check because we don't care that much, or
        // this is EOF anyway.
        if (isDir && !m.match(/\/$/)) {
          m = m + "/"
        } else if (!isDir && m.match(/\/$/)) {
          m = m.replace(/\/+$/, "")
        }
      }
      this.log("emit", ev, m)
      this.emit(ev, m)
      this._processingEmitQueue = false
      if (done && m !== this.EOF && !this.paused)
        this._processEmitQueue()
    }
  }
  done = true
}

Glob.prototype._process = function (pattern, depth, index, cb_) {
  assert(this instanceof Glob)

  var cb = function cb (er, res) {
    assert(this instanceof Glob)
    if (this.paused) {
      if (!this._processQueue) {
        this._processQueue = []
        this.once("resume", function () {
          var q = this._processQueue
          this._processQueue = null
          q.forEach(function (cb) { cb() })
        })
      }
      this._processQueue.push(cb_.bind(this, er, res))
    } else {
      cb_.call(this, er, res)
    }
  }.bind(this)

  if (this.aborted) return cb()

  if (depth > this.maxDepth) return cb()

  // Get the first [n] parts of pattern that are all strings.
  var n = 0
  while (typeof pattern[n] === "string") {
    n ++
  }
  // now n is the index of the first one that is *not* a string.

  // see if there's anything else
  var prefix
  switch (n) {
    // if not, then this is rather simple
    case pattern.length:
      prefix = pattern.join("/")
      this._stat(prefix, function (exists, isDir) {
        // either it's there, or it isn't.
        // nothing more to do, either way.
        if (exists) {
          if (prefix && isAbsolute(prefix) && !this.nomount) {
            if (prefix.charAt(0) === "/") {
              prefix = path.join(this.root, prefix)
            } else {
              prefix = path.resolve(this.root, prefix)
            }
          }

          if (process.platform === "win32")
            prefix = prefix.replace(/\\/g, "/")

          this.matches[index] = this.matches[index] || {}
          this.matches[index][prefix] = true
          this.emitMatch(prefix)
        }
        return cb()
      })
      return

    case 0:
      // pattern *starts* with some non-trivial item.
      // going to readdir(cwd), but not include the prefix in matches.
      prefix = null
      break

    default:
      // pattern has some string bits in the front.
      // whatever it starts with, whether that's "absolute" like /foo/bar,
      // or "relative" like "../baz"
      prefix = pattern.slice(0, n)
      prefix = prefix.join("/")
      break
  }

  // get the list of entries.
  var read
  if (prefix === null) read = "."
  else if (isAbsolute(prefix) || isAbsolute(pattern.join("/"))) {
    if (!prefix || !isAbsolute(prefix)) {
      prefix = path.join("/", prefix)
    }
    read = prefix = path.resolve(prefix)

    // if (process.platform === "win32")
    //   read = prefix = prefix.replace(/^[a-zA-Z]:|\\/g, "/")

    this.log('absolute: ', prefix, this.root, pattern, read)
  } else {
    read = prefix
  }

  this.log('readdir(%j)', read, this.cwd, this.root)

  return this._readdir(read, function (er, entries) {
    if (er) {
      // not a directory!
      // this means that, whatever else comes after this, it can never match
      return cb()
    }

    // globstar is special
    if (pattern[n] === minimatch.GLOBSTAR) {
      // test without the globstar, and with every child both below
      // and replacing the globstar.
      var s = [ pattern.slice(0, n).concat(pattern.slice(n + 1)) ]
      entries.forEach(function (e) {
        if (e.charAt(0) === "." && !this.dot) return
        // instead of the globstar
        s.push(pattern.slice(0, n).concat(e).concat(pattern.slice(n + 1)))
        // below the globstar
        s.push(pattern.slice(0, n).concat(e).concat(pattern.slice(n)))
      }, this)

      s = s.filter(function (pattern) {
        var key = gsKey(pattern)
        var seen = !this._globstars[key]
        this._globstars[key] = true
        return seen
      }, this)

      if (!s.length)
        return cb()

      // now asyncForEach over this
      var l = s.length
      , errState = null
      s.forEach(function (gsPattern) {
        this._process(gsPattern, depth + 1, index, function (er) {
          if (errState) return
          if (er) return cb(errState = er)
          if (--l <= 0) return cb()
        })
      }, this)

      return
    }

    // not a globstar
    // It will only match dot entries if it starts with a dot, or if
    // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
    var pn = pattern[n]
    var rawGlob = pattern[n]._glob
    , dotOk = this.dot || rawGlob.charAt(0) === "."

    entries = entries.filter(function (e) {
      return (e.charAt(0) !== "." || dotOk) &&
             e.match(pattern[n])
    })

    // If n === pattern.length - 1, then there's no need for the extra stat
    // *unless* the user has specified "mark" or "stat" explicitly.
    // We know that they exist, since the readdir returned them.
    if (n === pattern.length - 1 &&
        !this.mark &&
        !this.stat) {
      entries.forEach(function (e) {
        if (prefix) {
          if (prefix !== "/") e = prefix + "/" + e
          else e = prefix + e
        }
        if (e.charAt(0) === "/" && !this.nomount) {
          e = path.join(this.root, e)
        }

        if (process.platform === "win32")
          e = e.replace(/\\/g, "/")

        this.matches[index] = this.matches[index] || {}
        this.matches[index][e] = true
        this.emitMatch(e)
      }, this)
      return cb.call(this)
    }


    // now test all the remaining entries as stand-ins for that part
    // of the pattern.
    var l = entries.length
    , errState = null
    if (l === 0) return cb() // no matches possible
    entries.forEach(function (e) {
      var p = pattern.slice(0, n).concat(e).concat(pattern.slice(n + 1))
      this._process(p, depth + 1, index, function (er) {
        if (errState) return
        if (er) return cb(errState = er)
        if (--l === 0) return cb.call(this)
      })
    }, this)
  })

}

function gsKey (pattern) {
  return '**' + pattern.map(function (p) {
    return (p === minimatch.GLOBSTAR) ? '**' : (''+p)
  }).join('/')
}

Glob.prototype._stat = function (f, cb) {
  assert(this instanceof Glob)
  var abs = f
  if (f.charAt(0) === "/") {
    abs = path.join(this.root, f)
  } else if (this.changedCwd) {
    abs = path.resolve(this.cwd, f)
  }

  if (f.length > this.maxLength) {
    var er = new Error("Path name too long")
    er.code = "ENAMETOOLONG"
    er.path = f
    return this._afterStat(f, abs, cb, er)
  }

  this.log('stat', [this.cwd, f, '=', abs])

  if (!this.stat && this.cache.hasOwnProperty(f)) {
    var exists = this.cache[f]
    , isDir = exists && (Array.isArray(exists) || exists === 2)
    if (this.sync) return cb.call(this, !!exists, isDir)
    return process.nextTick(cb.bind(this, !!exists, isDir))
  }

  var stat = this.statCache[abs]
  if (this.sync || stat) {
    var er
    try {
      stat = fs.statSync(abs)
    } catch (e) {
      er = e
    }
    this._afterStat(f, abs, cb, er, stat)
  } else {
    fs.stat(abs, this._afterStat.bind(this, f, abs, cb))
  }
}

Glob.prototype._afterStat = function (f, abs, cb, er, stat) {
  var exists
  assert(this instanceof Glob)

  if (abs.slice(-1) === "/" && stat && !stat.isDirectory()) {
    this.log("should be ENOTDIR, fake it")

    er = new Error("ENOTDIR, not a directory '" + abs + "'")
    er.path = abs
    er.code = "ENOTDIR"
    stat = null
  }

  var emit = !this.statCache[abs]
  this.statCache[abs] = stat

  if (er || !stat) {
    exists = false
  } else {
    exists = stat.isDirectory() ? 2 : 1
    if (emit)
      this.emit('stat', f, stat)
  }
  this.cache[f] = this.cache[f] || exists
  cb.call(this, !!exists, exists === 2)
}

Glob.prototype._readdir = function (f, cb) {
  assert(this instanceof Glob)
  var abs = f
  if (f.charAt(0) === "/") {
    abs = path.join(this.root, f)
  } else if (isAbsolute(f)) {
    abs = f
  } else if (this.changedCwd) {
    abs = path.resolve(this.cwd, f)
  }

  if (f.length > this.maxLength) {
    var er = new Error("Path name too long")
    er.code = "ENAMETOOLONG"
    er.path = f
    return this._afterReaddir(f, abs, cb, er)
  }

  this.log('readdir', [this.cwd, f, abs])
  if (this.cache.hasOwnProperty(f)) {
    var c = this.cache[f]
    if (Array.isArray(c)) {
      if (this.sync) return cb.call(this, null, c)
      return process.nextTick(cb.bind(this, null, c))
    }

    if (!c || c === 1) {
      // either ENOENT or ENOTDIR
      var code = c ? "ENOTDIR" : "ENOENT"
      , er = new Error((c ? "Not a directory" : "Not found") + ": " + f)
      er.path = f
      er.code = code
      this.log(f, er)
      if (this.sync) return cb.call(this, er)
      return process.nextTick(cb.bind(this, er))
    }

    // at this point, c === 2, meaning it's a dir, but we haven't
    // had to read it yet, or c === true, meaning it's *something*
    // but we don't have any idea what.  Need to read it, either way.
  }

  if (this.sync) {
    var er, entries
    try {
      entries = fs.readdirSync(abs)
    } catch (e) {
      er = e
    }
    return this._afterReaddir(f, abs, cb, er, entries)
  }

  fs.readdir(abs, this._afterReaddir.bind(this, f, abs, cb))
}

Glob.prototype._afterReaddir = function (f, abs, cb, er, entries) {
  assert(this instanceof Glob)
  if (entries && !er) {
    this.cache[f] = entries
    // if we haven't asked to stat everything for suresies, then just
    // assume that everything in there exists, so we can avoid
    // having to stat it a second time.  This also gets us one step
    // further into ELOOP territory.
    if (!this.mark && !this.stat) {
      entries.forEach(function (e) {
        if (f === "/") e = f + e
        else e = f + "/" + e
        this.cache[e] = true
      }, this)
    }

    return cb.call(this, er, entries)
  }

  // now handle errors, and cache the information
  if (er) switch (er.code) {
    case "ENOTDIR": // totally normal. means it *does* exist.
      this.cache[f] = 1
      return cb.call(this, er)
    case "ENOENT": // not terribly unusual
    case "ELOOP":
    case "ENAMETOOLONG":
    case "UNKNOWN":
      this.cache[f] = false
      return cb.call(this, er)
    default: // some unusual error.  Treat as failure.
      this.cache[f] = false
      if (this.strict) this.emit("error", er)
      if (!this.silent) console.error("glob error", er)
      return cb.call(this, er)
  }
}

var isAbsolute = process.platform === "win32" ? absWin : absUnix

function absWin (p) {
  if (absUnix(p)) return true
  // pull off the device/UNC bit from a windows path.
  // from node's lib/path.js
  var splitDeviceRe =
      /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/
    , result = splitDeviceRe.exec(p)
    , device = result[1] || ''
    , isUnc = device && device.charAt(1) !== ':'
    , isAbsolute = !!result[2] || isUnc // UNC paths are always absolute

  return isAbsolute
}

function absUnix (p) {
  return p.charAt(0) === "/" || p === ""
}

}).call(this,require("JkpR2F"))
},{"JkpR2F":13,"assert":3,"events":10,"fs":2,"inherits":60,"minimatch":61,"path":12}],60:[function(require,module,exports){
module.exports=require(11)
},{}],61:[function(require,module,exports){
(function (process){
;(function (require, exports, module, platform) {

if (module) module.exports = minimatch
else exports.minimatch = minimatch

if (!require) {
  require = function (id) {
    switch (id) {
      case "sigmund": return function sigmund (obj) {
        return JSON.stringify(obj)
      }
      case "path": return { basename: function (f) {
        f = f.split(/[\/\\]/)
        var e = f.pop()
        if (!e) e = f.pop()
        return e
      }}
      case "lru-cache": return function LRUCache () {
        // not quite an LRU, but still space-limited.
        var cache = {}
        var cnt = 0
        this.set = function (k, v) {
          cnt ++
          if (cnt >= 100) cache = {}
          cache[k] = v
        }
        this.get = function (k) { return cache[k] }
      }
    }
  }
}

minimatch.Minimatch = Minimatch

var LRU = require("lru-cache")
  , cache = minimatch.cache = new LRU({max: 100})
  , GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {}
  , sigmund = require("sigmund")

var path = require("path")
  // any single thing other than /
  // don't need to escape / when using new RegExp()
  , qmark = "[^/]"

  // * => any number of characters
  , star = qmark + "*?"

  // ** when dots are allowed.  Anything goes, except .. and .
  // not (^ or / followed by one or two dots followed by $ or /),
  // followed by anything, any number of times.
  , twoStarDot = "(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?"

  // not a ^ or / followed by a dot,
  // followed by anything, any number of times.
  , twoStarNoDot = "(?:(?!(?:\\\/|^)\\.).)*?"

  // characters that need to be escaped in RegExp.
  , reSpecials = charSet("().*{}+?[]^$\\!")

// "abc" -> { a:true, b:true, c:true }
function charSet (s) {
  return s.split("").reduce(function (set, c) {
    set[c] = true
    return set
  }, {})
}

// normalizes slashes.
var slashSplit = /\/+/

minimatch.filter = filter
function filter (pattern, options) {
  options = options || {}
  return function (p, i, list) {
    return minimatch(p, pattern, options)
  }
}

function ext (a, b) {
  a = a || {}
  b = b || {}
  var t = {}
  Object.keys(b).forEach(function (k) {
    t[k] = b[k]
  })
  Object.keys(a).forEach(function (k) {
    t[k] = a[k]
  })
  return t
}

minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return minimatch

  var orig = minimatch

  var m = function minimatch (p, pattern, options) {
    return orig.minimatch(p, pattern, ext(def, options))
  }

  m.Minimatch = function Minimatch (pattern, options) {
    return new orig.Minimatch(pattern, ext(def, options))
  }

  return m
}

Minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return Minimatch
  return minimatch.defaults(def).Minimatch
}


function minimatch (p, pattern, options) {
  if (typeof pattern !== "string") {
    throw new TypeError("glob pattern string required")
  }

  if (!options) options = {}

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === "#") {
    return false
  }

  // "" only matches ""
  if (pattern.trim() === "") return p === ""

  return new Minimatch(pattern, options).match(p)
}

function Minimatch (pattern, options) {
  if (!(this instanceof Minimatch)) {
    return new Minimatch(pattern, options, cache)
  }

  if (typeof pattern !== "string") {
    throw new TypeError("glob pattern string required")
  }

  if (!options) options = {}
  pattern = pattern.trim()

  // windows: need to use /, not \
  // On other platforms, \ is a valid (albeit bad) filename char.
  if (platform === "win32") {
    pattern = pattern.split("\\").join("/")
  }

  // lru storage.
  // these things aren't particularly big, but walking down the string
  // and turning it into a regexp can get pretty costly.
  var cacheKey = pattern + "\n" + sigmund(options)
  var cached = minimatch.cache.get(cacheKey)
  if (cached) return cached
  minimatch.cache.set(cacheKey, this)

  this.options = options
  this.set = []
  this.pattern = pattern
  this.regexp = null
  this.negate = false
  this.comment = false
  this.empty = false

  // make the set of regexps etc.
  this.make()
}

Minimatch.prototype.debug = function() {}

Minimatch.prototype.make = make
function make () {
  // don't do it more than once.
  if (this._made) return

  var pattern = this.pattern
  var options = this.options

  // empty patterns and comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === "#") {
    this.comment = true
    return
  }
  if (!pattern) {
    this.empty = true
    return
  }

  // step 1: figure out negation, etc.
  this.parseNegate()

  // step 2: expand braces
  var set = this.globSet = this.braceExpand()

  if (options.debug) this.debug = console.error

  this.debug(this.pattern, set)

  // step 3: now we have a set, so turn each one into a series of path-portion
  // matching patterns.
  // These will be regexps, except in the case of "**", which is
  // set to the GLOBSTAR object for globstar behavior,
  // and will not contain any / characters
  set = this.globParts = set.map(function (s) {
    return s.split(slashSplit)
  })

  this.debug(this.pattern, set)

  // glob --> regexps
  set = set.map(function (s, si, set) {
    return s.map(this.parse, this)
  }, this)

  this.debug(this.pattern, set)

  // filter out everything that didn't compile properly.
  set = set.filter(function (s) {
    return -1 === s.indexOf(false)
  })

  this.debug(this.pattern, set)

  this.set = set
}

Minimatch.prototype.parseNegate = parseNegate
function parseNegate () {
  var pattern = this.pattern
    , negate = false
    , options = this.options
    , negateOffset = 0

  if (options.nonegate) return

  for ( var i = 0, l = pattern.length
      ; i < l && pattern.charAt(i) === "!"
      ; i ++) {
    negate = !negate
    negateOffset ++
  }

  if (negateOffset) this.pattern = pattern.substr(negateOffset)
  this.negate = negate
}

// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
minimatch.braceExpand = function (pattern, options) {
  return new Minimatch(pattern, options).braceExpand()
}

Minimatch.prototype.braceExpand = braceExpand
function braceExpand (pattern, options) {
  options = options || this.options
  pattern = typeof pattern === "undefined"
    ? this.pattern : pattern

  if (typeof pattern === "undefined") {
    throw new Error("undefined pattern")
  }

  if (options.nobrace ||
      !pattern.match(/\{.*\}/)) {
    // shortcut. no need to expand.
    return [pattern]
  }

  var escaping = false

  // examples and comments refer to this crazy pattern:
  // a{b,c{d,e},{f,g}h}x{y,z}
  // expected:
  // abxy
  // abxz
  // acdxy
  // acdxz
  // acexy
  // acexz
  // afhxy
  // afhxz
  // aghxy
  // aghxz

  // everything before the first \{ is just a prefix.
  // So, we pluck that off, and work with the rest,
  // and then prepend it to everything we find.
  if (pattern.charAt(0) !== "{") {
    this.debug(pattern)
    var prefix = null
    for (var i = 0, l = pattern.length; i < l; i ++) {
      var c = pattern.charAt(i)
      this.debug(i, c)
      if (c === "\\") {
        escaping = !escaping
      } else if (c === "{" && !escaping) {
        prefix = pattern.substr(0, i)
        break
      }
    }

    // actually no sets, all { were escaped.
    if (prefix === null) {
      this.debug("no sets")
      return [pattern]
    }

   var tail = braceExpand.call(this, pattern.substr(i), options)
    return tail.map(function (t) {
      return prefix + t
    })
  }

  // now we have something like:
  // {b,c{d,e},{f,g}h}x{y,z}
  // walk through the set, expanding each part, until
  // the set ends.  then, we'll expand the suffix.
  // If the set only has a single member, then'll put the {} back

  // first, handle numeric sets, since they're easier
  var numset = pattern.match(/^\{(-?[0-9]+)\.\.(-?[0-9]+)\}/)
  if (numset) {
    this.debug("numset", numset[1], numset[2])
    var suf = braceExpand.call(this, pattern.substr(numset[0].length), options)
      , start = +numset[1]
      , end = +numset[2]
      , inc = start > end ? -1 : 1
      , set = []
    for (var i = start; i != (end + inc); i += inc) {
      // append all the suffixes
      for (var ii = 0, ll = suf.length; ii < ll; ii ++) {
        set.push(i + suf[ii])
      }
    }
    return set
  }

  // ok, walk through the set
  // We hope, somewhat optimistically, that there
  // will be a } at the end.
  // If the closing brace isn't found, then the pattern is
  // interpreted as braceExpand("\\" + pattern) so that
  // the leading \{ will be interpreted literally.
  var i = 1 // skip the \{
    , depth = 1
    , set = []
    , member = ""
    , sawEnd = false
    , escaping = false

  function addMember () {
    set.push(member)
    member = ""
  }

  this.debug("Entering for")
  FOR: for (i = 1, l = pattern.length; i < l; i ++) {
    var c = pattern.charAt(i)
    this.debug("", i, c)

    if (escaping) {
      escaping = false
      member += "\\" + c
    } else {
      switch (c) {
        case "\\":
          escaping = true
          continue

        case "{":
          depth ++
          member += "{"
          continue

        case "}":
          depth --
          // if this closes the actual set, then we're done
          if (depth === 0) {
            addMember()
            // pluck off the close-brace
            i ++
            break FOR
          } else {
            member += c
            continue
          }

        case ",":
          if (depth === 1) {
            addMember()
          } else {
            member += c
          }
          continue

        default:
          member += c
          continue
      } // switch
    } // else
  } // for

  // now we've either finished the set, and the suffix is
  // pattern.substr(i), or we have *not* closed the set,
  // and need to escape the leading brace
  if (depth !== 0) {
    this.debug("didn't close", pattern)
    return braceExpand.call(this, "\\" + pattern, options)
  }

  // x{y,z} -> ["xy", "xz"]
  this.debug("set", set)
  this.debug("suffix", pattern.substr(i))
  var suf = braceExpand.call(this, pattern.substr(i), options)
  // ["b", "c{d,e}","{f,g}h"] ->
  //   [["b"], ["cd", "ce"], ["fh", "gh"]]
  var addBraces = set.length === 1
  this.debug("set pre-expanded", set)
  set = set.map(function (p) {
    return braceExpand.call(this, p, options)
  }, this)
  this.debug("set expanded", set)


  // [["b"], ["cd", "ce"], ["fh", "gh"]] ->
  //   ["b", "cd", "ce", "fh", "gh"]
  set = set.reduce(function (l, r) {
    return l.concat(r)
  })

  if (addBraces) {
    set = set.map(function (s) {
      return "{" + s + "}"
    })
  }

  // now attach the suffixes.
  var ret = []
  for (var i = 0, l = set.length; i < l; i ++) {
    for (var ii = 0, ll = suf.length; ii < ll; ii ++) {
      ret.push(set[i] + suf[ii])
    }
  }
  return ret
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
Minimatch.prototype.parse = parse
var SUBPARSE = {}
function parse (pattern, isSub) {
  var options = this.options

  // shortcuts
  if (!options.noglobstar && pattern === "**") return GLOBSTAR
  if (pattern === "") return ""

  var re = ""
    , hasMagic = !!options.nocase
    , escaping = false
    // ? => one single character
    , patternListStack = []
    , plType
    , stateChar
    , inClass = false
    , reClassStart = -1
    , classStart = -1
    // . and .. never match anything that doesn't start with .,
    // even when options.dot is set.
    , patternStart = pattern.charAt(0) === "." ? "" // anything
      // not (start or / followed by . or .. followed by / or end)
      : options.dot ? "(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))"
      : "(?!\\.)"
    , self = this

  function clearStateChar () {
    if (stateChar) {
      // we had some state-tracking character
      // that wasn't consumed by this pass.
      switch (stateChar) {
        case "*":
          re += star
          hasMagic = true
          break
        case "?":
          re += qmark
          hasMagic = true
          break
        default:
          re += "\\"+stateChar
          break
      }
      self.debug('clearStateChar %j %j', stateChar, re)
      stateChar = false
    }
  }

  for ( var i = 0, len = pattern.length, c
      ; (i < len) && (c = pattern.charAt(i))
      ; i ++ ) {

    this.debug("%s\t%s %s %j", pattern, i, re, c)

    // skip over any that are escaped.
    if (escaping && reSpecials[c]) {
      re += "\\" + c
      escaping = false
      continue
    }

    SWITCH: switch (c) {
      case "/":
        // completely not allowed, even escaped.
        // Should already be path-split by now.
        return false

      case "\\":
        clearStateChar()
        escaping = true
        continue

      // the various stateChar values
      // for the "extglob" stuff.
      case "?":
      case "*":
      case "+":
      case "@":
      case "!":
        this.debug("%s\t%s %s %j <-- stateChar", pattern, i, re, c)

        // all of those are literals inside a class, except that
        // the glob [!a] means [^a] in regexp
        if (inClass) {
          this.debug('  in class')
          if (c === "!" && i === classStart + 1) c = "^"
          re += c
          continue
        }

        // if we already have a stateChar, then it means
        // that there was something like ** or +? in there.
        // Handle the stateChar, then proceed with this one.
        self.debug('call clearStateChar %j', stateChar)
        clearStateChar()
        stateChar = c
        // if extglob is disabled, then +(asdf|foo) isn't a thing.
        // just clear the statechar *now*, rather than even diving into
        // the patternList stuff.
        if (options.noext) clearStateChar()
        continue

      case "(":
        if (inClass) {
          re += "("
          continue
        }

        if (!stateChar) {
          re += "\\("
          continue
        }

        plType = stateChar
        patternListStack.push({ type: plType
                              , start: i - 1
                              , reStart: re.length })
        // negation is (?:(?!js)[^/]*)
        re += stateChar === "!" ? "(?:(?!" : "(?:"
        this.debug('plType %j %j', stateChar, re)
        stateChar = false
        continue

      case ")":
        if (inClass || !patternListStack.length) {
          re += "\\)"
          continue
        }

        clearStateChar()
        hasMagic = true
        re += ")"
        plType = patternListStack.pop().type
        // negation is (?:(?!js)[^/]*)
        // The others are (?:<pattern>)<type>
        switch (plType) {
          case "!":
            re += "[^/]*?)"
            break
          case "?":
          case "+":
          case "*": re += plType
          case "@": break // the default anyway
        }
        continue

      case "|":
        if (inClass || !patternListStack.length || escaping) {
          re += "\\|"
          escaping = false
          continue
        }

        clearStateChar()
        re += "|"
        continue

      // these are mostly the same in regexp and glob
      case "[":
        // swallow any state-tracking char before the [
        clearStateChar()

        if (inClass) {
          re += "\\" + c
          continue
        }

        inClass = true
        classStart = i
        reClassStart = re.length
        re += c
        continue

      case "]":
        //  a right bracket shall lose its special
        //  meaning and represent itself in
        //  a bracket expression if it occurs
        //  first in the list.  -- POSIX.2 2.8.3.2
        if (i === classStart + 1 || !inClass) {
          re += "\\" + c
          escaping = false
          continue
        }

        // finish up the class.
        hasMagic = true
        inClass = false
        re += c
        continue

      default:
        // swallow any state char that wasn't consumed
        clearStateChar()

        if (escaping) {
          // no need
          escaping = false
        } else if (reSpecials[c]
                   && !(c === "^" && inClass)) {
          re += "\\"
        }

        re += c

    } // switch
  } // for


  // handle the case where we left a class open.
  // "[abc" is valid, equivalent to "\[abc"
  if (inClass) {
    // split where the last [ was, and escape it
    // this is a huge pita.  We now have to re-walk
    // the contents of the would-be class to re-translate
    // any characters that were passed through as-is
    var cs = pattern.substr(classStart + 1)
      , sp = this.parse(cs, SUBPARSE)
    re = re.substr(0, reClassStart) + "\\[" + sp[0]
    hasMagic = hasMagic || sp[1]
  }

  // handle the case where we had a +( thing at the *end*
  // of the pattern.
  // each pattern list stack adds 3 chars, and we need to go through
  // and escape any | chars that were passed through as-is for the regexp.
  // Go through and escape them, taking care not to double-escape any
  // | chars that were already escaped.
  var pl
  while (pl = patternListStack.pop()) {
    var tail = re.slice(pl.reStart + 3)
    // maybe some even number of \, then maybe 1 \, followed by a |
    tail = tail.replace(/((?:\\{2})*)(\\?)\|/g, function (_, $1, $2) {
      if (!$2) {
        // the | isn't already escaped, so escape it.
        $2 = "\\"
      }

      // need to escape all those slashes *again*, without escaping the
      // one that we need for escaping the | character.  As it works out,
      // escaping an even number of slashes can be done by simply repeating
      // it exactly after itself.  That's why this trick works.
      //
      // I am sorry that you have to see this.
      return $1 + $1 + $2 + "|"
    })

    this.debug("tail=%j\n   %s", tail, tail)
    var t = pl.type === "*" ? star
          : pl.type === "?" ? qmark
          : "\\" + pl.type

    hasMagic = true
    re = re.slice(0, pl.reStart)
       + t + "\\("
       + tail
  }

  // handle trailing things that only matter at the very end.
  clearStateChar()
  if (escaping) {
    // trailing \\
    re += "\\\\"
  }

  // only need to apply the nodot start if the re starts with
  // something that could conceivably capture a dot
  var addPatternStart = false
  switch (re.charAt(0)) {
    case ".":
    case "[":
    case "(": addPatternStart = true
  }

  // if the re is not "" at this point, then we need to make sure
  // it doesn't match against an empty path part.
  // Otherwise a/* will match a/, which it should not.
  if (re !== "" && hasMagic) re = "(?=.)" + re

  if (addPatternStart) re = patternStart + re

  // parsing just a piece of a larger pattern.
  if (isSub === SUBPARSE) {
    return [ re, hasMagic ]
  }

  // skip the regexp for non-magical patterns
  // unescape anything in it, though, so that it'll be
  // an exact match against a file etc.
  if (!hasMagic) {
    return globUnescape(pattern)
  }

  var flags = options.nocase ? "i" : ""
    , regExp = new RegExp("^" + re + "$", flags)

  regExp._glob = pattern
  regExp._src = re

  return regExp
}

minimatch.makeRe = function (pattern, options) {
  return new Minimatch(pattern, options || {}).makeRe()
}

Minimatch.prototype.makeRe = makeRe
function makeRe () {
  if (this.regexp || this.regexp === false) return this.regexp

  // at this point, this.set is a 2d array of partial
  // pattern strings, or "**".
  //
  // It's better to use .match().  This function shouldn't
  // be used, really, but it's pretty convenient sometimes,
  // when you just want to work with a regex.
  var set = this.set

  if (!set.length) return this.regexp = false
  var options = this.options

  var twoStar = options.noglobstar ? star
      : options.dot ? twoStarDot
      : twoStarNoDot
    , flags = options.nocase ? "i" : ""

  var re = set.map(function (pattern) {
    return pattern.map(function (p) {
      return (p === GLOBSTAR) ? twoStar
           : (typeof p === "string") ? regExpEscape(p)
           : p._src
    }).join("\\\/")
  }).join("|")

  // must match entire pattern
  // ending in a * or ** will make it less strict.
  re = "^(?:" + re + ")$"

  // can match anything, as long as it's not this.
  if (this.negate) re = "^(?!" + re + ").*$"

  try {
    return this.regexp = new RegExp(re, flags)
  } catch (ex) {
    return this.regexp = false
  }
}

minimatch.match = function (list, pattern, options) {
  options = options || {}
  var mm = new Minimatch(pattern, options)
  list = list.filter(function (f) {
    return mm.match(f)
  })
  if (mm.options.nonull && !list.length) {
    list.push(pattern)
  }
  return list
}

Minimatch.prototype.match = match
function match (f, partial) {
  this.debug("match", f, this.pattern)
  // short-circuit in the case of busted things.
  // comments, etc.
  if (this.comment) return false
  if (this.empty) return f === ""

  if (f === "/" && partial) return true

  var options = this.options

  // windows: need to use /, not \
  // On other platforms, \ is a valid (albeit bad) filename char.
  if (platform === "win32") {
    f = f.split("\\").join("/")
  }

  // treat the test path as a set of pathparts.
  f = f.split(slashSplit)
  this.debug(this.pattern, "split", f)

  // just ONE of the pattern sets in this.set needs to match
  // in order for it to be valid.  If negating, then just one
  // match means that we have failed.
  // Either way, return on the first hit.

  var set = this.set
  this.debug(this.pattern, "set", set)

  // Find the basename of the path by looking for the last non-empty segment
  var filename;
  for (var i = f.length - 1; i >= 0; i--) {
    filename = f[i]
    if (filename) break
  }

  for (var i = 0, l = set.length; i < l; i ++) {
    var pattern = set[i], file = f
    if (options.matchBase && pattern.length === 1) {
      file = [filename]
    }
    var hit = this.matchOne(file, pattern, partial)
    if (hit) {
      if (options.flipNegate) return true
      return !this.negate
    }
  }

  // didn't get any hits.  this is success if it's a negative
  // pattern, failure otherwise.
  if (options.flipNegate) return false
  return this.negate
}

// set partial to true to test if, for example,
// "/a/b" matches the start of "/*/b/*/d"
// Partial means, if you run out of file before you run
// out of pattern, then that's fine, as long as all
// the parts match.
Minimatch.prototype.matchOne = function (file, pattern, partial) {
  var options = this.options

  this.debug("matchOne",
              { "this": this
              , file: file
              , pattern: pattern })

  this.debug("matchOne", file.length, pattern.length)

  for ( var fi = 0
          , pi = 0
          , fl = file.length
          , pl = pattern.length
      ; (fi < fl) && (pi < pl)
      ; fi ++, pi ++ ) {

    this.debug("matchOne loop")
    var p = pattern[pi]
      , f = file[fi]

    this.debug(pattern, p, f)

    // should be impossible.
    // some invalid regexp stuff in the set.
    if (p === false) return false

    if (p === GLOBSTAR) {
      this.debug('GLOBSTAR', [pattern, p, f])

      // "**"
      // a/**/b/**/c would match the following:
      // a/b/x/y/z/c
      // a/x/y/z/b/c
      // a/b/x/b/x/c
      // a/b/c
      // To do this, take the rest of the pattern after
      // the **, and see if it would match the file remainder.
      // If so, return success.
      // If not, the ** "swallows" a segment, and try again.
      // This is recursively awful.
      //
      // a/**/b/**/c matching a/b/x/y/z/c
      // - a matches a
      // - doublestar
      //   - matchOne(b/x/y/z/c, b/**/c)
      //     - b matches b
      //     - doublestar
      //       - matchOne(x/y/z/c, c) -> no
      //       - matchOne(y/z/c, c) -> no
      //       - matchOne(z/c, c) -> no
      //       - matchOne(c, c) yes, hit
      var fr = fi
        , pr = pi + 1
      if (pr === pl) {
        this.debug('** at the end')
        // a ** at the end will just swallow the rest.
        // We have found a match.
        // however, it will not swallow /.x, unless
        // options.dot is set.
        // . and .. are *never* matched by **, for explosively
        // exponential reasons.
        for ( ; fi < fl; fi ++) {
          if (file[fi] === "." || file[fi] === ".." ||
              (!options.dot && file[fi].charAt(0) === ".")) return false
        }
        return true
      }

      // ok, let's see if we can swallow whatever we can.
      WHILE: while (fr < fl) {
        var swallowee = file[fr]

        this.debug('\nglobstar while',
                    file, fr, pattern, pr, swallowee)

        // XXX remove this slice.  Just pass the start index.
        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
          this.debug('globstar found match!', fr, fl, swallowee)
          // found a match.
          return true
        } else {
          // can't swallow "." or ".." ever.
          // can only swallow ".foo" when explicitly asked.
          if (swallowee === "." || swallowee === ".." ||
              (!options.dot && swallowee.charAt(0) === ".")) {
            this.debug("dot detected!", file, fr, pattern, pr)
            break WHILE
          }

          // ** swallows a segment, and continue.
          this.debug('globstar swallow a segment, and continue')
          fr ++
        }
      }
      // no match was found.
      // However, in partial mode, we can't say this is necessarily over.
      // If there's more *pattern* left, then
      if (partial) {
        // ran out of file
        this.debug("\n>>> no match, partial?", file, fr, pattern, pr)
        if (fr === fl) return true
      }
      return false
    }

    // something other than **
    // non-magic patterns just have to match exactly
    // patterns with magic have been turned into regexps.
    var hit
    if (typeof p === "string") {
      if (options.nocase) {
        hit = f.toLowerCase() === p.toLowerCase()
      } else {
        hit = f === p
      }
      this.debug("string match", p, f, hit)
    } else {
      hit = f.match(p)
      this.debug("pattern match", p, f, hit)
    }

    if (!hit) return false
  }

  // Note: ending in / means that we'll get a final ""
  // at the end of the pattern.  This can only match a
  // corresponding "" at the end of the file.
  // If the file ends in /, then it can only match a
  // a pattern that ends in /, unless the pattern just
  // doesn't have any more for it. But, a/b/ should *not*
  // match "a/b/*", even though "" matches against the
  // [^/]*? pattern, except in partial mode, where it might
  // simply not be reached yet.
  // However, a/b/ should still satisfy a/*

  // now either we fell off the end of the pattern, or we're done.
  if (fi === fl && pi === pl) {
    // ran out of pattern and filename at the same time.
    // an exact hit!
    return true
  } else if (fi === fl) {
    // ran out of file, but still had pattern left.
    // this is ok if we're doing the match as part of
    // a glob fs traversal.
    return partial
  } else if (pi === pl) {
    // ran out of pattern, still have file left.
    // this is only acceptable if we're on the very last
    // empty segment of a file with a trailing slash.
    // a/* should match a/b/
    var emptyFileEnd = (fi === fl - 1) && (file[fi] === "")
    return emptyFileEnd
  }

  // should be unreachable.
  throw new Error("wtf?")
}


// replace stuff like \* with *
function globUnescape (s) {
  return s.replace(/\\(.)/g, "$1")
}


function regExpEscape (s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}

})( typeof require === "function" ? require : null,
    this,
    typeof module === "object" ? module : null,
    typeof process === "object" ? process.platform : "win32"
  )

}).call(this,require("JkpR2F"))
},{"JkpR2F":13,"lru-cache":64,"path":12,"sigmund":62}],62:[function(require,module,exports){
module.exports = sigmund
function sigmund (subject, maxSessions) {
    maxSessions = maxSessions || 10;
    var notes = [];
    var analysis = '';
    var RE = RegExp;

    function psychoAnalyze (subject, session) {
        if (session > maxSessions) return;

        if (typeof subject === 'function' ||
            typeof subject === 'undefined') {
            return;
        }

        if (typeof subject !== 'object' || !subject ||
            (subject instanceof RE)) {
            analysis += subject;
            return;
        }

        if (notes.indexOf(subject) !== -1 || session === maxSessions) return;

        notes.push(subject);
        analysis += '{';
        Object.keys(subject).forEach(function (issue, _, __) {
            // pseudo-private values.  skip those.
            if (issue.charAt(0) === '_') return;
            var to = typeof subject[issue];
            if (to === 'function' || to === 'undefined') return;
            analysis += issue;
            psychoAnalyze(subject[issue], session + 1);
        });
    }
    psychoAnalyze(subject, 0);
    return analysis;
}

// vim: set softtabstop=4 shiftwidth=4:

},{}],63:[function(require,module,exports){
(function (process){
// this keeps a queue of opened file descriptors, and will make
// fs operations wait until some have closed before trying to open more.

var fs = exports = module.exports = {}
fs._originalFs = require("fs")

Object.getOwnPropertyNames(fs._originalFs).forEach(function(prop) {
  var desc = Object.getOwnPropertyDescriptor(fs._originalFs, prop)
  Object.defineProperty(fs, prop, desc)
})

var queue = []
  , constants = require("constants")

fs._curOpen = 0

fs.MIN_MAX_OPEN = 64
fs.MAX_OPEN = 1024

// prevent EMFILE errors
function OpenReq (path, flags, mode, cb) {
  this.path = path
  this.flags = flags
  this.mode = mode
  this.cb = cb
}

function noop () {}

fs.open = gracefulOpen

function gracefulOpen (path, flags, mode, cb) {
  if (typeof mode === "function") cb = mode, mode = null
  if (typeof cb !== "function") cb = noop

  if (fs._curOpen >= fs.MAX_OPEN) {
    queue.push(new OpenReq(path, flags, mode, cb))
    setTimeout(flush)
    return
  }
  open(path, flags, mode, function (er, fd) {
    if (er && er.code === "EMFILE" && fs._curOpen > fs.MIN_MAX_OPEN) {
      // that was too many.  reduce max, get back in queue.
      // this should only happen once in a great while, and only
      // if the ulimit -n is set lower than 1024.
      fs.MAX_OPEN = fs._curOpen - 1
      return fs.open(path, flags, mode, cb)
    }
    cb(er, fd)
  })
}

function open (path, flags, mode, cb) {
  cb = cb || noop
  fs._curOpen ++
  fs._originalFs.open.call(fs, path, flags, mode, function (er, fd) {
    if (er) onclose()
    cb(er, fd)
  })
}

fs.openSync = function (path, flags, mode) {
  var ret
  ret = fs._originalFs.openSync.call(fs, path, flags, mode)
  fs._curOpen ++
  return ret
}

function onclose () {
  fs._curOpen --
  flush()
}

function flush () {
  while (fs._curOpen < fs.MAX_OPEN) {
    var req = queue.shift()
    if (!req) return
    switch (req.constructor.name) {
      case 'OpenReq':
        open(req.path, req.flags || "r", req.mode || 0777, req.cb)
        break
      case 'ReaddirReq':
        readdir(req.path, req.cb)
        break
      case 'ReadFileReq':
        readFile(req.path, req.options, req.cb)
        break
      case 'WriteFileReq':
        writeFile(req.path, req.data, req.options, req.cb)
        break
      default:
        throw new Error('Unknown req type: ' + req.constructor.name)
    }
  }
}

fs.close = function (fd, cb) {
  cb = cb || noop
  fs._originalFs.close.call(fs, fd, function (er) {
    onclose()
    cb(er)
  })
}

fs.closeSync = function (fd) {
  try {
    return fs._originalFs.closeSync.call(fs, fd)
  } finally {
    onclose()
  }
}


// readdir takes a fd as well.
// however, the sync version closes it right away, so
// there's no need to wrap.
// It would be nice to catch when it throws an EMFILE,
// but that's relatively rare anyway.

fs.readdir = gracefulReaddir

function gracefulReaddir (path, cb) {
  if (fs._curOpen >= fs.MAX_OPEN) {
    queue.push(new ReaddirReq(path, cb))
    setTimeout(flush)
    return
  }

  readdir(path, function (er, files) {
    if (er && er.code === "EMFILE" && fs._curOpen > fs.MIN_MAX_OPEN) {
      fs.MAX_OPEN = fs._curOpen - 1
      return fs.readdir(path, cb)
    }
    cb(er, files)
  })
}

function readdir (path, cb) {
  cb = cb || noop
  fs._curOpen ++
  fs._originalFs.readdir.call(fs, path, function (er, files) {
    onclose()
    cb(er, files)
  })
}

function ReaddirReq (path, cb) {
  this.path = path
  this.cb = cb
}


fs.readFile = gracefulReadFile

function gracefulReadFile(path, options, cb) {
  if (typeof options === "function") cb = options, options = null
  if (typeof cb !== "function") cb = noop

  if (fs._curOpen >= fs.MAX_OPEN) {
    queue.push(new ReadFileReq(path, options, cb))
    setTimeout(flush)
    return
  }

  readFile(path, options, function (er, data) {
    if (er && er.code === "EMFILE" && fs._curOpen > fs.MIN_MAX_OPEN) {
      fs.MAX_OPEN = fs._curOpen - 1
      return fs.readFile(path, options, cb)
    }
    cb(er, data)
  })
}

function readFile (path, options, cb) {
  cb = cb || noop
  fs._curOpen ++
  fs._originalFs.readFile.call(fs, path, options, function (er, data) {
    onclose()
    cb(er, data)
  })
}

function ReadFileReq (path, options, cb) {
  this.path = path
  this.options = options
  this.cb = cb
}




fs.writeFile = gracefulWriteFile

function gracefulWriteFile(path, data, options, cb) {
  if (typeof options === "function") cb = options, options = null
  if (typeof cb !== "function") cb = noop

  if (fs._curOpen >= fs.MAX_OPEN) {
    queue.push(new WriteFileReq(path, data, options, cb))
    setTimeout(flush)
    return
  }

  writeFile(path, data, options, function (er) {
    if (er && er.code === "EMFILE" && fs._curOpen > fs.MIN_MAX_OPEN) {
      fs.MAX_OPEN = fs._curOpen - 1
      return fs.writeFile(path, data, options, cb)
    }
    cb(er)
  })
}

function writeFile (path, data, options, cb) {
  cb = cb || noop
  fs._curOpen ++
  fs._originalFs.writeFile.call(fs, path, data, options, function (er) {
    onclose()
    cb(er)
  })
}

function WriteFileReq (path, data, options, cb) {
  this.path = path
  this.data = data
  this.options = options
  this.cb = cb
}


// (re-)implement some things that are known busted or missing.

var constants = require("constants")

// lchmod, broken prior to 0.6.2
// back-port the fix here.
if (constants.hasOwnProperty('O_SYMLINK') &&
    process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
  fs.lchmod = function (path, mode, callback) {
    callback = callback || noop
    fs.open( path
           , constants.O_WRONLY | constants.O_SYMLINK
           , mode
           , function (err, fd) {
      if (err) {
        callback(err)
        return
      }
      // prefer to return the chmod error, if one occurs,
      // but still try to close, and report closing errors if they occur.
      fs.fchmod(fd, mode, function (err) {
        fs.close(fd, function(err2) {
          callback(err || err2)
        })
      })
    })
  }

  fs.lchmodSync = function (path, mode) {
    var fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode)

    // prefer to return the chmod error, if one occurs,
    // but still try to close, and report closing errors if they occur.
    var err, err2
    try {
      var ret = fs.fchmodSync(fd, mode)
    } catch (er) {
      err = er
    }
    try {
      fs.closeSync(fd)
    } catch (er) {
      err2 = er
    }
    if (err || err2) throw (err || err2)
    return ret
  }
}


// lutimes implementation, or no-op
if (!fs.lutimes) {
  if (constants.hasOwnProperty("O_SYMLINK")) {
    fs.lutimes = function (path, at, mt, cb) {
      fs.open(path, constants.O_SYMLINK, function (er, fd) {
        cb = cb || noop
        if (er) return cb(er)
        fs.futimes(fd, at, mt, function (er) {
          fs.close(fd, function (er2) {
            return cb(er || er2)
          })
        })
      })
    }

    fs.lutimesSync = function (path, at, mt) {
      var fd = fs.openSync(path, constants.O_SYMLINK)
        , err
        , err2
        , ret

      try {
        var ret = fs.futimesSync(fd, at, mt)
      } catch (er) {
        err = er
      }
      try {
        fs.closeSync(fd)
      } catch (er) {
        err2 = er
      }
      if (err || err2) throw (err || err2)
      return ret
    }

  } else if (fs.utimensat && constants.hasOwnProperty("AT_SYMLINK_NOFOLLOW")) {
    // maybe utimensat will be bound soonish?
    fs.lutimes = function (path, at, mt, cb) {
      fs.utimensat(path, at, mt, constants.AT_SYMLINK_NOFOLLOW, cb)
    }

    fs.lutimesSync = function (path, at, mt) {
      return fs.utimensatSync(path, at, mt, constants.AT_SYMLINK_NOFOLLOW)
    }

  } else {
    fs.lutimes = function (_a, _b, _c, cb) { process.nextTick(cb) }
    fs.lutimesSync = function () {}
  }
}


// https://github.com/isaacs/node-graceful-fs/issues/4
// Chown should not fail on einval or eperm if non-root.

fs.chown = chownFix(fs.chown)
fs.fchown = chownFix(fs.fchown)
fs.lchown = chownFix(fs.lchown)

fs.chownSync = chownFixSync(fs.chownSync)
fs.fchownSync = chownFixSync(fs.fchownSync)
fs.lchownSync = chownFixSync(fs.lchownSync)

function chownFix (orig) {
  if (!orig) return orig
  return function (target, uid, gid, cb) {
    return orig.call(fs, target, uid, gid, function (er, res) {
      if (chownErOk(er)) er = null
      cb(er, res)
    })
  }
}

function chownFixSync (orig) {
  if (!orig) return orig
  return function (target, uid, gid) {
    try {
      return orig.call(fs, target, uid, gid)
    } catch (er) {
      if (!chownErOk(er)) throw er
    }
  }
}

function chownErOk (er) {
  // if there's no getuid, or if getuid() is something other than 0,
  // and the error is EINVAL or EPERM, then just ignore it.
  // This specific case is a silent failure in cp, install, tar,
  // and most other unix tools that manage permissions.
  // When running as root, or if other types of errors are encountered,
  // then it's strict.
  if (!er || (!process.getuid || process.getuid() !== 0)
      && (er.code === "EINVAL" || er.code === "EPERM")) return true
}


// if lchmod/lchown do not exist, then make them no-ops
if (!fs.lchmod) {
  fs.lchmod = function (path, mode, cb) {
    process.nextTick(cb)
  }
  fs.lchmodSync = function () {}
}
if (!fs.lchown) {
  fs.lchown = function (path, uid, gid, cb) {
    process.nextTick(cb)
  }
  fs.lchownSync = function () {}
}



// on Windows, A/V software can lock the directory, causing this
// to fail with an EACCES or EPERM if the directory contains newly
// created files.  Try again on failure, for up to 1 second.
if (process.platform === "win32") {
  var rename_ = fs.rename
  fs.rename = function rename (from, to, cb) {
    var start = Date.now()
    rename_(from, to, function CB (er) {
      if (er
          && (er.code === "EACCES" || er.code === "EPERM")
          && Date.now() - start < 1000) {
        return rename_(from, to, CB)
      }
      cb(er)
    })
  }
}


// if read() returns EAGAIN, then just try it again.
var read = fs.read
fs.read = function (fd, buffer, offset, length, position, callback_) {
  var callback
  if (callback_ && typeof callback_ === 'function') {
    var eagCounter = 0
    callback = function (er, _, __) {
      if (er && er.code === 'EAGAIN' && eagCounter < 10) {
        eagCounter ++
        return read.call(fs, fd, buffer, offset, length, position, callback)
      }
      callback_.apply(this, arguments)
    }
  }
  return read.call(fs, fd, buffer, offset, length, position, callback)
}

var readSync = fs.readSync
fs.readSync = function (fd, buffer, offset, length, position) {
  var eagCounter = 0
  while (true) {
    try {
      return readSync.call(fs, fd, buffer, offset, length, position)
    } catch (er) {
      if (er.code === 'EAGAIN' && eagCounter < 10) {
        eagCounter ++
        continue
      }
      throw er
    }
  }
}

}).call(this,require("JkpR2F"))
},{"JkpR2F":13,"constants":9,"fs":2}],64:[function(require,module,exports){
;(function () { // closure for web browsers

if (typeof module === 'object' && module.exports) {
  module.exports = LRUCache
} else {
  // just set the global for non-node platforms.
  this.LRUCache = LRUCache
}

function hOP (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function naiveLength () { return 1 }

function LRUCache (options) {
  if (!(this instanceof LRUCache))
    return new LRUCache(options)

  if (typeof options === 'number')
    options = { max: options }

  if (!options)
    options = {}

  this._max = options.max
  // Kind of weird to have a default max of Infinity, but oh well.
  if (!this._max || !(typeof this._max === "number") || this._max <= 0 )
    this._max = Infinity

  this._lengthCalculator = options.length || naiveLength
  if (typeof this._lengthCalculator !== "function")
    this._lengthCalculator = naiveLength

  this._allowStale = options.stale || false
  this._maxAge = options.maxAge || null
  this._dispose = options.dispose
  this.reset()
}

// resize the cache when the max changes.
Object.defineProperty(LRUCache.prototype, "max",
  { set : function (mL) {
      if (!mL || !(typeof mL === "number") || mL <= 0 ) mL = Infinity
      this._max = mL
      if (this._length > this._max) trim(this)
    }
  , get : function () { return this._max }
  , enumerable : true
  })

// resize the cache when the lengthCalculator changes.
Object.defineProperty(LRUCache.prototype, "lengthCalculator",
  { set : function (lC) {
      if (typeof lC !== "function") {
        this._lengthCalculator = naiveLength
        this._length = this._itemCount
        for (var key in this._cache) {
          this._cache[key].length = 1
        }
      } else {
        this._lengthCalculator = lC
        this._length = 0
        for (var key in this._cache) {
          this._cache[key].length = this._lengthCalculator(this._cache[key].value)
          this._length += this._cache[key].length
        }
      }

      if (this._length > this._max) trim(this)
    }
  , get : function () { return this._lengthCalculator }
  , enumerable : true
  })

Object.defineProperty(LRUCache.prototype, "length",
  { get : function () { return this._length }
  , enumerable : true
  })


Object.defineProperty(LRUCache.prototype, "itemCount",
  { get : function () { return this._itemCount }
  , enumerable : true
  })

LRUCache.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this
  var i = 0;
  for (var k = this._mru - 1; k >= 0 && i < this._itemCount; k--) if (this._lruList[k]) {
    i++
    var hit = this._lruList[k]
    if (this._maxAge && (Date.now() - hit.now > this._maxAge)) {
      del(this, hit)
      if (!this._allowStale) hit = undefined
    }
    if (hit) {
      fn.call(thisp, hit.value, hit.key, this)
    }
  }
}

LRUCache.prototype.keys = function () {
  var keys = new Array(this._itemCount)
  var i = 0
  for (var k = this._mru - 1; k >= 0 && i < this._itemCount; k--) if (this._lruList[k]) {
    var hit = this._lruList[k]
    keys[i++] = hit.key
  }
  return keys
}

LRUCache.prototype.values = function () {
  var values = new Array(this._itemCount)
  var i = 0
  for (var k = this._mru - 1; k >= 0 && i < this._itemCount; k--) if (this._lruList[k]) {
    var hit = this._lruList[k]
    values[i++] = hit.value
  }
  return values
}

LRUCache.prototype.reset = function () {
  if (this._dispose && this._cache) {
    for (var k in this._cache) {
      this._dispose(k, this._cache[k].value)
    }
  }

  this._cache = Object.create(null) // hash of items by key
  this._lruList = Object.create(null) // list of items in order of use recency
  this._mru = 0 // most recently used
  this._lru = 0 // least recently used
  this._length = 0 // number of items in the list
  this._itemCount = 0
}

// Provided for debugging/dev purposes only. No promises whatsoever that
// this API stays stable.
LRUCache.prototype.dump = function () {
  return this._cache
}

LRUCache.prototype.dumpLru = function () {
  return this._lruList
}

LRUCache.prototype.set = function (key, value) {
  if (hOP(this._cache, key)) {
    // dispose of the old one before overwriting
    if (this._dispose) this._dispose(key, this._cache[key].value)
    if (this._maxAge) this._cache[key].now = Date.now()
    this._cache[key].value = value
    this.get(key)
    return true
  }

  var len = this._lengthCalculator(value)
  var age = this._maxAge ? Date.now() : 0
  var hit = new Entry(key, value, this._mru++, len, age)

  // oversized objects fall out of cache automatically.
  if (hit.length > this._max) {
    if (this._dispose) this._dispose(key, value)
    return false
  }

  this._length += hit.length
  this._lruList[hit.lu] = this._cache[key] = hit
  this._itemCount ++

  if (this._length > this._max) trim(this)
  return true
}

LRUCache.prototype.has = function (key) {
  if (!hOP(this._cache, key)) return false
  var hit = this._cache[key]
  if (this._maxAge && (Date.now() - hit.now > this._maxAge)) {
    return false
  }
  return true
}

LRUCache.prototype.get = function (key) {
  return get(this, key, true)
}

LRUCache.prototype.peek = function (key) {
  return get(this, key, false)
}

LRUCache.prototype.pop = function () {
  var hit = this._lruList[this._lru]
  del(this, hit)
  return hit || null
}

LRUCache.prototype.del = function (key) {
  del(this, this._cache[key])
}

function get (self, key, doUse) {
  var hit = self._cache[key]
  if (hit) {
    if (self._maxAge && (Date.now() - hit.now > self._maxAge)) {
      del(self, hit)
      if (!self._allowStale) hit = undefined
    } else {
      if (doUse) use(self, hit)
    }
    if (hit) hit = hit.value
  }
  return hit
}

function use (self, hit) {
  shiftLU(self, hit)
  hit.lu = self._mru ++
  self._lruList[hit.lu] = hit
}

function trim (self) {
  while (self._lru < self._mru && self._length > self._max)
    del(self, self._lruList[self._lru])
}

function shiftLU (self, hit) {
  delete self._lruList[ hit.lu ]
  while (self._lru < self._mru && !self._lruList[self._lru]) self._lru ++
}

function del (self, hit) {
  if (hit) {
    if (self._dispose) self._dispose(hit.key, hit.value)
    self._length -= hit.length
    self._itemCount --
    delete self._cache[ hit.key ]
    shiftLU(self, hit)
  }
}

// classy, since V8 prefers predictable objects.
function Entry (key, value, lu, length, now) {
  this.key = key
  this.value = value
  this.lu = lu
  this.length = length
  this.now = now
}

})()

},{}],65:[function(require,module,exports){
module.exports = extractDescription

// Extracts description from contents of a readme file in markdown format
function extractDescription (d) {
  if (!d) return;
  // the first block of text before the first heading
  // that isn't the first line heading
  d = d.trim().split('\n')
  for (var s = 0; d[s] && d[s].trim().match(/^(#|$)/); s ++);
  var l = d.length
  for (var e = s + 1; e < l && d[e].trim(); e ++);
  return d.slice(s, e).join(' ').trim()
}

},{}],66:[function(require,module,exports){
var semver = require("semver")
var parseGitHubURL = require("github-url-from-git")
var depTypes = ["dependencies","devDependencies","optionalDependencies"]
var extractDescription = require("./extract_description")
var url = require("url")

var fixer = module.exports = {
  fixRepositoryField: function(data) {
    if (data.repositories) {
      this.warn("'repositories' (plural) Not supported.\n" +
           "Please pick one as the 'repository' field");
      data.repository = data.repositories[0]
    }
    if (!data.repository) return;
    if (typeof data.repository === "string") {
      data.repository = {
        type: "git",
        url: data.repository
      }
    }
    var r = data.repository.url || ""
    if (r) {
      var ghurl = parseGitHubURL(r)
      if (ghurl) {
        r = ghurl.replace(/^https?:\/\//, 'git://')
      }
    }

    if (r.match(/github.com\/[^\/]+\/[^\/]+\.git\.git$/)) {
      this.warn("Probably broken git url: " + r)
    }
  }

, fixFilesField: function(data) {
    var files = data.files
    if (files && !Array.isArray(files)) {
      this.warn("Invalid 'files' member")
      delete data.files
    }
  }

, fixBinField: function(data) {
    if (!data.bin) return;
    if (typeof data.bin === "string") {
      var b = {}
      b[data.name] = data.bin
      data.bin = b
    }
  }

, fixManField: function(data) {
    if (!data.man) return;
    if (typeof data.man === "string") {
      data.man = [ data.man ]
    }
  }
, fixBundleDependenciesField: function(data) {
    var bdd = "bundledDependencies"
    var bd = "bundleDependencies"
    if (data[bdd] && !data[bd]) {
      data[bd] = data[bdd]
      delete data[bdd]
    }
  }

, fixDependencies: function(data) {
    objectifyDeps(data, this.warn)
    addOptionalDepsToDeps(data, this.warn)
    this.fixBundleDependenciesField(data)
  }

, fixKeywordsField: function (data, warn) {
    if (typeof data.keywords === "string") {
      data.keywords = data.keywords.split(/,\s+/)
    }
  }

, fixVersionField: function(data) {
    if (!data.version) {
      data.version = ""
      return true
    }
    if (!semver.valid(data.version)) {
      throw new Error("invalid version: "+ data.version)
    }
    data.version = semver.clean(data.version)
    return true
  }

, fixPeople: function(data) {
    modifyPeople(data, unParsePerson)
    modifyPeople(data, parsePerson)  
  }  

, fixNameField: function(data) {
    if (!data.name) {
      data.name = ""
      return true
    }
    if (typeof data.name !== "string") {
      throw new Error("name field must be a string.")
    }
    data.name = data.name.trim()
    ensureValidName(data.name)
  }
  

, fixDescriptionField: function (data) {
    if (data.description && typeof data.description !== 'string') {
      this.warn("'description' field should be a string")
      delete data.description
    }
    if (data.readme && !data.description)
      data.description = extractDescription(data.readme)
  }
  
, fixReadmeField: function (data) {
    if (!data.readme) data.readme = "ERROR: No README data found!"
  }
  
, fixBugsField: function(data) {
    if (!data.bugs && data.repository && data.repository.url) {
      var gh = parseGitHubURL(data.repository.url)
      if(gh) {
        if(gh.match(/^https:\/\/github.com\//))
          data.bugs = {url: gh + "/issues"}
        else // gist url
          data.bugs = {url: gh}
      }
    }
    else if(data.bugs) {
      var emailRe = /^.+@.*\..+$/
      if(typeof data.bugs == "string") {
        if(emailRe.test(data.bugs))
          data.bugs = {email:data.bugs}
        else if(url.parse(data.bugs).protocol)
          data.bugs = {url: data.bugs}
        else
          this.warn("Bug string field must be url, email, or {email,url}")
      }
      else {
        var oldBugs = data.bugs
        data.bugs = {}
        if(oldBugs.url) {
          if(typeof(oldBugs.url) == "string" && url.parse(oldBugs.url).protocol)
            data.bugs.url = oldBugs.url
          else
            this.warn("bugs.url field must be a string url. Deleted.")
        }
        if(oldBugs.email) {
          if(typeof(oldBugs.email) == "string" && emailRe.test(oldBugs.email))
            data.bugs.email = oldBugs.email
          else
            this.warn("bugs.email field must be a string email. Deleted.")
        }
      }
      if(!data.bugs.email && !data.bugs.url) {
        delete data.bugs
        this.warn("Normalized value of bugs field is an empty object. Deleted.")
      }
    }
  }

,  fixHomepageField: function(data) {
    if(!data.homepage) return true;
    if(typeof data.homepage !== "string") {
      this.warn("homepage field must be a string url. Deleted.")
      return delete data.homepage
    }
    if(!url.parse(data.homepage).protocol) {
      this.warn("homepage field must start with a protocol.")
      data.homepage = "http://" + data.homepage
    }
  }
}

function ensureValidName (name) {
  if (name.charAt(0) === "." ||
      name.match(/[\/@\s\+%:]/) ||
      name !== encodeURIComponent(name) ||
      name.toLowerCase() === "node_modules" ||
      name.toLowerCase() === "favicon.ico") {
        throw new Error("Invalid name: " + JSON.stringify(name))
  }
}

function modifyPeople (data, fn) {
  if (data.author) data.author = fn(data.author)
  ;["maintainers", "contributors"].forEach(function (set) {
    if (!Array.isArray(data[set])) return;
    data[set] = data[set].map(fn)
  })
  return data
}

function unParsePerson (person) {
  if (typeof person === "string") return person
  var name = person.name || ""
  var u = person.url || person.web
  var url = u ? (" ("+u+")") : ""
  var e = person.email || person.mail
  var email = e ? (" <"+e+">") : ""
  return name+email+url
}

function parsePerson (person) {
  if (typeof person !== "string") return person
  var name = person.match(/^([^\(<]+)/)
  var url = person.match(/\(([^\)]+)\)/)
  var email = person.match(/<([^>]+)>/)
  var obj = {}
  if (name && name[0].trim()) obj.name = name[0].trim()
  if (email) obj.email = email[1];
  if (url) obj.url = url[1];
  return obj
}

function addOptionalDepsToDeps (data, warn) {
  var o = data.optionalDependencies
  if (!o) return;
  var d = data.dependencies || {}
  Object.keys(o).forEach(function (k) {
    d[k] = o[k]
  })
  data.dependencies = d  
}

function depObjectify (deps) {
  if (!deps) return {}
  if (typeof deps === "string") {
    deps = deps.trim().split(/[\n\r\s\t ,]+/)
  }
  if (!Array.isArray(deps)) return deps
  var o = {}
  deps.filter(function (d) {
    return typeof d === "string"
  }).forEach(function(d) {    
    d = d.trim().split(/(:?[@\s><=])/)
    var dn = d.shift()
    var dv = d.join("")
    dv = dv.trim()
    dv = dv.replace(/^@/, "")
    o[dn] = dv
  })
  return o
}

function objectifyDeps (data, warn) {
  depTypes.forEach(function (type) {
    if (!data[type]) return;
    data[type] = depObjectify(data[type])
  })
}

},{"./extract_description":65,"github-url-from-git":70,"semver":72,"url":18}],67:[function(require,module,exports){
// a warning for deprecated or likely-incorrect fields

module.exports = isValid

var typos = require("./typos")

function isValid (data, warnFunc) {
  var hasWarned = false
  function warn(msg) {
    hasWarned = true
    if(warnFunc) warnFunc(msg)
  }
  if (data.modules) warn("'modules' is deprecated")
  Object.keys(typos.topLevel).forEach(function (d) {
    if (data.hasOwnProperty(d)) {
      warn(makeTypoWarning(d, typos.topLevel[d]))
    }
  })
  checkBugsField(data.bugs, warn)
  checkScriptsField(data.scripts, warn)
  if (!data.repository) warn("No repository field.")
  if (!data.readme) warn("No readme data.")
  if (data.description && typeof data.description !== 'string') {
    warn("'description' field should be a string")
  }
  if (data[data.bundledDependencies] && 
      !Array.isArray(data.bundleDependencies)) {
    warn("bundleDependencies must be an array")
  }
  return !hasWarned
}

function checkBugsField (bugs, warn) {
  if (!bugs || typeof bugs !== "object") return
  Object.keys(bugs).forEach(function (k) {
    if (typos.bugs[k]) {
      bugs[typos.bugs[k]] = bugs[k]
      delete bugs[k]
    }
  })
}

function checkScriptsField (scripts, warn) {
  if (!scripts || typeof scripts !== "object") return
  Object.keys(scripts).forEach(function (k) {
    if (typos.script[k]) {
      warn(makeTypoWarning(k, typos.script[k], "scripts"))
    }
  })
}

function makeTypoWarning (providedName, probableName, field) {
  if (field) {
    providedName = field + "['" + providedName + "']"
    probableName = field + "['" + probableName + "']"
  }
  return providedName + " should probably be " + probableName + "."
}

},{"./typos":69}],68:[function(require,module,exports){
module.exports = normalize

var isValid = require("./is_valid")
var fixer = require("./fixer")

var fieldsToFix = ['name','version','description','repository'
                  ,'files','bin','man','bugs','keywords','readme','homepage']
var otherThingsToFix = ['dependencies','people']

var thingsToFix = fieldsToFix.map(function(fieldName) { 
  return ucFirst(fieldName) + "Field"
})
// two ways to do this in CoffeeScript on only one line, sub-70 chars:
// thingsToFix = fieldsToFix.map (name) -> ucFirst(name) + "Field"
// thingsToFix = (ucFirst(name) + "Field" for name in fieldsToFix)
thingsToFix = thingsToFix.concat(otherThingsToFix)

function normalize (data, warn) {
  if(!warn) warn = function(msg) { /* noop */ }
  isValid(data, warn) // don't care if it's valid, we'll make it valid
  if (data.scripts && 
      data.scripts.install === "node-gyp rebuild" && 
      !data.scripts.preinstall) {
    data.gypfile = true
  }
  fixer.warn = warn
  thingsToFix.forEach(function(thingName) {
    fixer["fix" + ucFirst(thingName)](data)
  })
  data._id = data.name + "@" + data.version
  if (data.modules) delete data.modules // modules field is deprecated
}

function ucFirst (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

},{"./fixer":66,"./is_valid":67}],69:[function(require,module,exports){
module.exports={
  "topLevel": { 
    "dependancies": "dependencies"
   ,"dependecies": "dependencies"
   ,"depdenencies": "dependencies"
   ,"devEependencies": "devDependencies"
   ,"depends": "dependencies"
   ,"dev-dependencies": "devDependencies"
   ,"devDependences": "devDependencies"
   ,"devDepenencies": "devDependencies"
   ,"devdependencies": "devDependencies"
   ,"repostitory": "repository"
   ,"prefereGlobal": "preferGlobal"
   ,"hompage": "homepage"
   ,"hampage": "homepage"
   ,"autohr": "author"
   ,"autor": "author"
   ,"contributers": "contributors"
   ,"publicationConfig": "publishConfig"
  },
  "bugs": { "web": "url", "name": "url" },
  "script": { "server": "start", "tests": "test" }
}
},{}],70:[function(require,module,exports){
var re = /^(?:https?:\/\/|git:\/\/)?(?:[^@]+@)?(gist.github.com|github.com)[:\/]([^\/]+\/[^\/]+?|[0-9]+)$/

module.exports = function(url){
  try {
    var m = re.exec(url.replace(/\.git$/, ''));
    var host = m[1];
    var path = m[2];
    return 'https://' + host + '/' + path;
  } catch (err) {
    // ignore
  }
};

},{}],71:[function(require,module,exports){
(function (process){
// vim: set softtabstop=16 shiftwidth=16:

try {
                readJson.log = require("npmlog")
} catch (er) {
                readJson.log = {
                                info: function () {},
                                verbose: function () {},
                                warn: function () {}
                }
}


try {
                var fs = require("graceful-fs")
} catch (er) {
                var fs = require("fs")
}


module.exports = readJson

var LRU = require("lru-cache")
readJson.cache = new LRU({max: 1000})
var path = require("path")
var glob = require("glob")
var normalizeData = require("normalize-package-data")

// put more stuff on here to customize.
readJson.extraSet = [
                gypfile,
                serverjs,
                authors,
                readme,
                mans,
                bins,
                githead
]

var typoWarned = {}


function readJson (file, cb) {
                var c = readJson.cache.get(file)
                if (c) {
                                readJson.log.verbose("from cache", file)
                                cb = cb.bind(null, null, c)
                                return process.nextTick(cb);
                }
                readJson.log.verbose("read json", file)
                cb = (function (orig) { return function (er, data) {
                                if (data) readJson.cache.set(file, data);
                                return orig(er, data)
                } })(cb)
                readJson_(file, cb)
}


function readJson_ (file, cb) {
                fs.readFile(file, "utf8", function (er, d) {
                                parseJson(file, er, d, cb)
                })
}


function stripBOM(content) {
                // Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
                // because the buffer-to-string conversion in `fs.readFileSync()`
                // translates it to FEFF, the UTF-16 BOM.
                if (content.charCodeAt(0) === 0xFEFF) {
                                content = content.slice(1);
                }
                return content;
}


function parseJson (file, er, d, cb) {
                if (er && er.code === "ENOENT") {
                                indexjs(file, er, cb)
                                return
                }
                if (er) return cb(er);
                try {
                                d = JSON.parse(stripBOM(d))
                } catch (er) {
                                d = parseIndex(d)
                                if (!d) return cb(parseError(er, file));
                }
                extras(file, d, cb)
}


function indexjs (file, er, cb) {
                if (path.basename(file) === "index.js") {
                                return cb(er);
                }
                var index = path.resolve(path.dirname(file), "index.js")
                fs.readFile(index, "utf8", function (er2, d) {
                                if (er2) return cb(er);
                                d = parseIndex(d)
                                if (!d) return cb(er);
                                extras(file, d, cb)
                })
}


readJson.extras = extras
function extras (file, data, cb) {
                var set = readJson.extraSet
                var n = set.length
                var errState = null
                set.forEach(function (fn) {
                                fn(file, data, then)
                })
                function then(er) {
                                if (errState) return;
                                if (er) return cb(errState = er);
                                if (--n === 0) final(file, data, cb);
                }
}

function gypfile (file, data, cb) {
                var dir = path.dirname(file)
                var s = data.scripts || {}
                if (s.install || s.preinstall)
                                return cb(null, data);
                glob("*.gyp", { cwd: dir }, function (er, files) {
                                if (er) return cb(er);
                                gypfile_(file, data, files, cb)
                })
}

function gypfile_ (file, data, files, cb) {
                if (!files.length) return cb(null, data);
                var s = data.scripts || {}
                s.install = "node-gyp rebuild"
                data.scripts = s
                data.gypfile = true
                return cb(null, data);
}

function serverjs (file, data, cb) {
                var dir = path.dirname(file)
                var s = data.scripts || {}
                if (s.start) return cb(null, data)
                glob("server.js", { cwd: dir }, function (er, files) {
                                if (er) return cb(er);
                                serverjs_(file, data, files, cb)
                })
}
function serverjs_ (file, data, files, cb) {
                if (!files.length) return cb(null, data);
                var s = data.scripts || {}
                s.start = "node server.js"
                data.scripts = s
                return cb(null, data)
}

function authors (file, data, cb) {
                if (data.contributors) return cb(null, data);
                var af = path.resolve(path.dirname(file), "AUTHORS")
                fs.readFile(af, "utf8", function (er, ad) {
                                // ignore error.  just checking it.
                                if (er) return cb(null, data);
                                authors_(file, data, ad, cb)
                })
}
function authors_ (file, data, ad, cb) {
                ad = ad.split(/\r?\n/g).map(function (line) {
                                return line.replace(/^\s*#.*$/, '').trim()
                }).filter(function (line) {
                                return line
                })
                data.contributors = ad
                return cb(null, data)
}

var defDesc = "Unnamed repository; edit this file " +
              "'description' to name the repository."
function gitDescription (file, data, cb) {
                if (data.description) return cb(null, data);
                var dir = path.dirname(file)
                // just cuz it'd be nice if this file mattered...
                var gitDesc = path.resolve(dir, '.git/description')
                fs.readFile(gitDesc, 'utf8', function (er, desc) {
                                if (desc) desc = desc.trim()
                                if (!er && desc !== defDesc)
                                                data.description = desc
                                return cb(null, data)
                })
}

function readmeDescription (file, data) {
                if (data.description) return cb(null, data);
                var d = data.readme
                if (!d) return;
                // the first block of text before the first heading
                // that isn't the first line heading
                d = d.trim().split('\n')
                for (var s = 0; d[s] && d[s].trim().match(/^(#|$)/); s ++);
                var l = d.length
                for (var e = s + 1; e < l && d[e].trim(); e ++);
                data.description = d.slice(s, e).join(' ').trim()
}

function readme (file, data, cb) {
                if (data.readme) return cb(null, data);
                var dir = path.dirname(file)
                var globOpts = { cwd: dir, nocase: true, mark: true }
                glob("README?(.*)", globOpts, function (er, files) {
                                if (er) return cb(er);
                                // don't accept directories.
                                files = files.filter(function (file) {
                                                return !file.match(/\/$/)
                                })
                                if (!files.length) return cb();
                                var rm = path.resolve(dir, files[0])
                                readme_(file, data, rm, cb)
                })
}
function readme_(file, data, rm, cb) {
                var rmfn = path.basename(rm);
                fs.readFile(rm, "utf8", function (er, rm) {
                                // maybe not readable, or something.
                                if (er) return cb()
                                data.readme = rm
                                data.readmeFilename = rmfn
                                return cb(er, data)
                })
}

function mans (file, data, cb) {
                var m = data.directories && data.directories.man
                if (data.man || !m) return cb(null, data);
                m = path.resolve(path.dirname(file), m)
                glob("**/*.[0-9]", { cwd: m }, function (er, mans) {
                                if (er) return cb(er);
                                mans_(file, data, mans, cb)
                })
}
function mans_ (file, data, mans, cb) {
                var m = data.directories && data.directories.man
                data.man = mans.map(function (mf) {
                                return path.resolve(path.dirname(file), m, mf)
                })
                return cb(null, data)
}

function bins (file, data, cb) {
                if (Array.isArray(data.bin)) {
                                return bins_(file, data, data.bin, cb)
                }
                var m = data.directories && data.directories.bin
                if (data.bin || !m) return cb(null, data);
                m = path.resolve(path.dirname(file), m)
                glob("**", { cwd: m }, function (er, bins) {
                                if (er) return cb(er);
                                bins_(file, data, bins, cb)
                })
}
function bins_ (file, data, bins, cb) {
                var m = data.directories && data.directories.bin || '.'
                data.bin = bins.reduce(function (acc, mf) {
                                if (mf && mf.charAt(0) !== '.') {
                                                var f = path.basename(mf)
                                                acc[f] = path.join(m, mf)
                                }
                                return acc
                }, {})
                return cb(null, data)
}

function githead (file, data, cb) {
                if (data.gitHead) return cb(null, data);
                var dir = path.dirname(file)
                var head = path.resolve(dir, '.git/HEAD')
                fs.readFile(head, 'utf8', function (er, head) {
                                if (er) return cb(null, data);
                                githead_(file, data, dir, head, cb)
                })
}
function githead_ (file, data, dir, head, cb) {
                if (!head.match(/^ref: /)) {
                                data.gitHead = head.trim()
                                return cb(null, data)
                }
                var headFile = head.replace(/^ref: /, '').trim()
                headFile = path.resolve(dir, '.git', headFile)
                fs.readFile(headFile, 'utf8', function (er, head) {
                                if (er || !head) return cb(null, data)
                                head = head.replace(/^ref: /, '').trim()
                                data.gitHead = head
                                return cb(null, data)
                })
}

function final (file, data, cb) {
                var pId = makePackageId(data)
                function warn(msg) {
                                if (typoWarned[pId]) return;
                                readJson.log.warn("package.json", pId, msg)
                }
                try {
                                normalizeData(data, warn)
                }
                catch (error) {
                                return cb(error)
                }
                typoWarned[pId] = true
                readJson.cache.set(file, data)
                cb(null, data)
}

function makePackageId (data) {
                return cleanString(data.name) + "@" + cleanString(data.version)
}

function cleanString(str) {
                return (!str || typeof(str) !== "string") ? "" : str.trim()
}

// /**package { "name": "foo", "version": "1.2.3", ... } **/
function parseIndex (data) {
                data = data.split(/^\/\*\*package(?:\s|$)/m)
                if (data.length < 2) return null
                data = data[1]
                data = data.split(/\*\*\/$/m)
                if (data.length < 2) return null
                data = data[0]
                data = data.replace(/^\s*\*/mg, "")
                try {
                                return JSON.parse(data)
                } catch (er) {
                                return null
                }
}

function parseError (ex, file) {
                var e = new Error("Failed to parse json\n"+ex.message)
                e.code = "EJSONPARSE"
                e.file = file
                return e
}

}).call(this,require("JkpR2F"))
},{"JkpR2F":13,"fs":2,"glob":59,"graceful-fs":63,"lru-cache":64,"normalize-package-data":68,"npmlog":55,"path":12}],72:[function(require,module,exports){
;(function (exports) { // nothing in here is node-specific.

// See http://semver.org/
// This implementation is a *hair* less strict in that it allows
// v1.2.3 things, and also tags that don't begin with a char.

var semver = "\\s*[v=]*\\s*([0-9]+)"        // major
           + "\\.([0-9]+)"                  // minor
           + "\\.([0-9]+)"                  // patch
           + "(-[0-9]+-?)?"                 // build
           + "([a-zA-Z-+][a-zA-Z0-9-\.:]*)?" // tag
  , exprComparator = "^((<|>)?=?)\s*("+semver+")$|^$"
  , xRangePlain = "[v=]*([0-9]+|x|X|\\*)"
                + "(?:\\.([0-9]+|x|X|\\*)"
                + "(?:\\.([0-9]+|x|X|\\*)"
                + "([a-zA-Z-][a-zA-Z0-9-\.:]*)?)?)?"
  , xRange = "((?:<|>)=?)?\\s*" + xRangePlain
  , exprLoneSpermy = "(?:~>?)"
  , exprSpermy = exprLoneSpermy + xRange
  , expressions = exports.expressions =
    { parse : new RegExp("^\\s*"+semver+"\\s*$")
    , parsePackage : new RegExp("^\\s*([^\/]+)[-@](" +semver+")\\s*$")
    , parseRange : new RegExp(
        "^\\s*(" + semver + ")\\s+-\\s+(" + semver + ")\\s*$")
    , validComparator : new RegExp("^"+exprComparator+"$")
    , parseXRange : new RegExp("^"+xRange+"$")
    , parseSpermy : new RegExp("^"+exprSpermy+"$")
    }


Object.getOwnPropertyNames(expressions).forEach(function (i) {
  exports[i] = function (str) {
    return ("" + (str || "")).match(expressions[i])
  }
})

exports.rangeReplace = ">=$1 <=$7"
exports.clean = clean
exports.compare = compare
exports.rcompare = rcompare
exports.satisfies = satisfies
exports.gt = gt
exports.gte = gte
exports.lt = lt
exports.lte = lte
exports.eq = eq
exports.neq = neq
exports.cmp = cmp
exports.inc = inc

exports.valid = valid
exports.validPackage = validPackage
exports.validRange = validRange
exports.maxSatisfying = maxSatisfying

exports.replaceStars = replaceStars
exports.toComparators = toComparators

function stringify (version) {
  var v = version
  return [v[1]||'', v[2]||'', v[3]||''].join(".") + (v[4]||'') + (v[5]||'')
}

function clean (version) {
  version = exports.parse(version)
  if (!version) return version
  return stringify(version)
}

function valid (version) {
  if (typeof version !== "string") return null
  return exports.parse(version) && version.trim().replace(/^[v=]+/, '')
}

function validPackage (version) {
  if (typeof version !== "string") return null
  return version.match(expressions.parsePackage) && version.trim()
}

// range can be one of:
// "1.0.3 - 2.0.0" range, inclusive, like ">=1.0.3 <=2.0.0"
// ">1.0.2" like 1.0.3 - 9999.9999.9999
// ">=1.0.2" like 1.0.2 - 9999.9999.9999
// "<2.0.0" like 0.0.0 - 1.9999.9999
// ">1.0.2 <2.0.0" like 1.0.3 - 1.9999.9999
var starExpression = /(<|>)?=?\s*\*/g
  , starReplace = ""
  , compTrimExpression = new RegExp("((<|>)?=|<|>)\\s*("
                                    +semver+"|"+xRangePlain+")", "g")
  , compTrimReplace = "$1$3"

function toComparators (range) {
  var ret = (range || "").trim()
    .replace(expressions.parseRange, exports.rangeReplace)
    .replace(compTrimExpression, compTrimReplace)
    .split(/\s+/)
    .join(" ")
    .split("||")
    .map(function (orchunk) {
      return orchunk
        .replace(new RegExp("(" + exprLoneSpermy + ")\\s+"), "$1")
        .split(" ")
        .map(replaceXRanges)
        .map(replaceSpermies)
        .map(replaceStars)
        .join(" ").trim()
    })
    .map(function (orchunk) {
      return orchunk
        .trim()
        .split(/\s+/)
        .filter(function (c) { return c.match(expressions.validComparator) })
    })
    .filter(function (c) { return c.length })
  return ret
}

function replaceStars (stars) {
  return stars.trim().replace(starExpression, starReplace)
}

// "2.x","2.x.x" --> ">=2.0.0- <2.1.0-"
// "2.3.x" --> ">=2.3.0- <2.4.0-"
function replaceXRanges (ranges) {
  return ranges.split(/\s+/)
               .map(replaceXRange)
               .join(" ")
}

function replaceXRange (version) {
  return version.trim().replace(expressions.parseXRange,
                                function (v, gtlt, M, m, p, t) {
    var anyX = !M || M.toLowerCase() === "x" || M === "*"
               || !m || m.toLowerCase() === "x" || m === "*"
               || !p || p.toLowerCase() === "x" || p === "*"
      , ret = v

    if (gtlt && anyX) {
      // just replace x'es with zeroes
      ;(!M || M === "*" || M.toLowerCase() === "x") && (M = 0)
      ;(!m || m === "*" || m.toLowerCase() === "x") && (m = 0)
      ;(!p || p === "*" || p.toLowerCase() === "x") && (p = 0)
      ret = gtlt + M+"."+m+"."+p+"-"
    } else if (!M || M === "*" || M.toLowerCase() === "x") {
      ret = "*" // allow any
    } else if (!m || m === "*" || m.toLowerCase() === "x") {
      // append "-" onto the version, otherwise
      // "1.x.x" matches "2.0.0beta", since the tag
      // *lowers* the version value
      ret = ">="+M+".0.0- <"+(+M+1)+".0.0-"
    } else if (!p || p === "*" || p.toLowerCase() === "x") {
      ret = ">="+M+"."+m+".0- <"+M+"."+(+m+1)+".0-"
    }
    return ret
  })
}

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
function replaceSpermies (version) {
  return version.trim().replace(expressions.parseSpermy,
                                function (v, gtlt, M, m, p, t) {
    if (gtlt) throw new Error(
      "Using '"+gtlt+"' with ~ makes no sense. Don't do it.")

    if (!M || M.toLowerCase() === "x") {
      return ""
    }
    // ~1 == >=1.0.0- <2.0.0-
    if (!m || m.toLowerCase() === "x") {
      return ">="+M+".0.0- <"+(+M+1)+".0.0-"
    }
    // ~1.2 == >=1.2.0- <1.3.0-
    if (!p || p.toLowerCase() === "x") {
      return ">="+M+"."+m+".0- <"+M+"."+(+m+1)+".0-"
    }
    // ~1.2.3 == >=1.2.3- <1.3.0-
    t = t || "-"
    return ">="+M+"."+m+"."+p+t+" <"+M+"."+(+m+1)+".0-"
  })
}

function validRange (range) {
  range = replaceStars(range)
  var c = toComparators(range)
  return (c.length === 0)
       ? null
       : c.map(function (c) { return c.join(" ") }).join("||")
}

// returns the highest satisfying version in the list, or undefined
function maxSatisfying (versions, range) {
  return versions
    .filter(function (v) { return satisfies(v, range) })
    .sort(compare)
    .pop()
}
function satisfies (version, range) {
  version = valid(version)
  if (!version) return false
  range = toComparators(range)
  for (var i = 0, l = range.length ; i < l ; i ++) {
    var ok = false
    for (var j = 0, ll = range[i].length ; j < ll ; j ++) {
      var r = range[i][j]
        , gtlt = r.charAt(0) === ">" ? gt
               : r.charAt(0) === "<" ? lt
               : false
        , eq = r.charAt(!!gtlt) === "="
        , sub = (!!eq) + (!!gtlt)
      if (!gtlt) eq = true
      r = r.substr(sub)
      r = (r === "") ? r : valid(r)
      ok = (r === "") || (eq && r === version) || (gtlt && gtlt(version, r))
      if (!ok) break
    }
    if (ok) return true
  }
  return false
}

// return v1 > v2 ? 1 : -1
function compare (v1, v2) {
  var g = gt(v1, v2)
  return g === null ? 0 : g ? 1 : -1
}

function rcompare (v1, v2) {
  return compare(v2, v1)
}

function lt (v1, v2) { return gt(v2, v1) }
function gte (v1, v2) { return !lt(v1, v2) }
function lte (v1, v2) { return !gt(v1, v2) }
function eq (v1, v2) { return gt(v1, v2) === null }
function neq (v1, v2) { return gt(v1, v2) !== null }
function cmp (v1, c, v2) {
  switch (c) {
    case ">": return gt(v1, v2)
    case "<": return lt(v1, v2)
    case ">=": return gte(v1, v2)
    case "<=": return lte(v1, v2)
    case "==": return eq(v1, v2)
    case "!=": return neq(v1, v2)
    case "===": return v1 === v2
    case "!==": return v1 !== v2
    default: throw new Error("Y U NO USE VALID COMPARATOR!? "+c)
  }
}

// return v1 > v2
function num (v) {
  return v === undefined ? -1 : parseInt((v||"0").replace(/[^0-9]+/g, ''), 10)
}
function gt (v1, v2) {
  v1 = exports.parse(v1)
  v2 = exports.parse(v2)
  if (!v1 || !v2) return false

  for (var i = 1; i < 5; i ++) {
    v1[i] = num(v1[i])
    v2[i] = num(v2[i])
    if (v1[i] > v2[i]) return true
    else if (v1[i] !== v2[i]) return false
  }
  // no tag is > than any tag, or use lexicographical order.
  var tag1 = v1[5] || ""
    , tag2 = v2[5] || ""

  // kludge: null means they were equal.  falsey, and detectable.
  // embarrassingly overclever, though, I know.
  return tag1 === tag2 ? null
         : !tag1 ? true
         : !tag2 ? false
         : tag1 > tag2
}

function inc (version, release) {
  version = exports.parse(version)
  if (!version) return null

  var parsedIndexLookup =
    { 'major': 1
    , 'minor': 2
    , 'patch': 3
    , 'build': 4 }
  var incIndex = parsedIndexLookup[release]
  if (incIndex === undefined) return null

  var current = num(version[incIndex])
  version[incIndex] = current === -1 ? 1 : current + 1

  for (var i = incIndex + 1; i < 5; i ++) {
    if (num(version[i]) !== -1) version[i] = "0"
  }

  if (version[4]) version[4] = "-" + version[4]
  version[5] = ""

  return stringify(version)
}
})(typeof exports === "object" ? exports : semver = {})

},{}],73:[function(require,module,exports){
(function (process){

/*
usage:

// do something to a list of things
asyncMap(myListOfStuff, function (thing, cb) { doSomething(thing.foo, cb) }, cb)
// do more than one thing to each item
asyncMap(list, fooFn, barFn, cb)

*/

module.exports = asyncMap

function asyncMap () {
  var steps = Array.prototype.slice.call(arguments)
    , list = steps.shift() || []
    , cb_ = steps.pop()
  if (typeof cb_ !== "function") throw new Error(
    "No callback provided to asyncMap")
  if (!list) return cb_(null, [])
  if (!Array.isArray(list)) list = [list]
  var n = steps.length
    , data = [] // 2d array
    , errState = null
    , l = list.length
    , a = l * n
  if (!a) return cb_(null, [])
  function cb (er) {
    if (errState) return
    var argLen = arguments.length
    for (var i = 1; i < argLen; i ++) if (arguments[i] !== undefined) {
      data[i - 1] = (data[i - 1] || []).concat(arguments[i])
    }
    // see if any new things have been added.
    if (list.length > l) {
      var newList = list.slice(l)
      a += (list.length - l) * n
      l = list.length
      process.nextTick(function () {
        newList.forEach(function (ar) {
          steps.forEach(function (fn) { fn(ar, cb) })
        })
      })
    }

    if (er || --a === 0) {
      errState = er
      cb_.apply(null, [errState].concat(data))
    }
  }
  // expect the supplied cb function to be called
  // "n" times for each thing in the array.
  list.forEach(function (ar) {
    steps.forEach(function (fn) { fn(ar, cb) })
  })
}

}).call(this,require("JkpR2F"))
},{"JkpR2F":13}],74:[function(require,module,exports){
module.exports = bindActor
function bindActor () {
  var args = 
        Array.prototype.slice.call
        (arguments) // jswtf.
    , obj = null
    , fn
  if (typeof args[0] === "object") {
    obj = args.shift()
    fn = args.shift()
    if (typeof fn === "string")
      fn = obj[ fn ]
  } else fn = args.shift()
  return function (cb) {
    fn.apply(obj, args.concat(cb)) }
}

},{}],75:[function(require,module,exports){
module.exports = chain
var bindActor = require("./bind-actor.js")
chain.first = {} ; chain.last = {}
function chain (things, cb) {
  var res = []
  ;(function LOOP (i, len) {
    if (i >= len) return cb(null,res)
    if (Array.isArray(things[i]))
      things[i] = bindActor.apply(null,
        things[i].map(function(i){
          return (i===chain.first) ? res[0]
           : (i===chain.last)
             ? res[res.length - 1] : i }))
    if (!things[i]) return LOOP(i + 1, len)
    things[i](function (er, data) {
      if (er) return cb(er, res)
      if (data !== undefined) res = res.concat(data)
      LOOP(i + 1, len)
    })
  })(0, things.length) }

},{"./bind-actor.js":74}],76:[function(require,module,exports){
exports.asyncMap = require("./async-map")
exports.bindActor = require("./bind-actor")
exports.chain = require("./chain")

},{"./async-map":73,"./bind-actor":74,"./chain":75}],77:[function(require,module,exports){

// Walk through the file-system "database" of installed
// packages, and create a data object related to the
// installed versions of each package.

/*
This will traverse through all node_modules folders,
resolving the dependencies object to the object corresponding to
the package that meets that dep, or just the version/range if
unmet.

Assuming that you had this folder structure:

/path/to
+-- package.json { name = "root" }
`-- node_modules
    +-- foo {bar, baz, asdf}
    | +-- node_modules
    |   +-- bar { baz }
    |   `-- baz
    `-- asdf

where "foo" depends on bar, baz, and asdf, bar depends on baz,
and bar and baz are bundled with foo, whereas "asdf" is at
the higher level (sibling to foo), you'd get this object structure:

{ <package.json data>
, path: "/path/to"
, parent: null
, dependencies:
  { foo :
    { version: "1.2.3"
    , path: "/path/to/node_modules/foo"
    , parent: <Circular: root>
    , dependencies:
      { bar:
        { parent: <Circular: foo>
        , path: "/path/to/node_modules/foo/node_modules/bar"
        , version: "2.3.4"
        , dependencies: { baz: <Circular: foo.dependencies.baz> }
        }
      , baz: { ... }
      , asdf: <Circular: asdf>
      }
    }
  , asdf: { ... }
  }
}

Unmet deps are left as strings.
Extraneous deps are marked with extraneous:true
deps that don't meet a requirement are marked with invalid:true
deps that don't meet a peer requirement are marked with peerInvalid:true

to READ(packagefolder, parentobj, name, reqver)
obj = read package.json
installed = ./node_modules/*
if parentobj is null, and no package.json
  obj = {dependencies:{<installed>:"*"}}
deps = Object.keys(obj.dependencies)
obj.path = packagefolder
obj.parent = parentobj
if name, && obj.name !== name, obj.invalid = true
if reqver, && obj.version !satisfies reqver, obj.invalid = true
if !reqver && parentobj, obj.extraneous = true
for each folder in installed
  obj.dependencies[folder] = READ(packagefolder+node_modules+folder,
                                  obj, folder, obj.dependencies[folder])
# walk tree to find unmet deps
for each dep in obj.dependencies not in installed
  r = obj.parent
  while r
    if r.dependencies[dep]
      if r.dependencies[dep].verion !satisfies obj.dependencies[dep]
        WARN
        r.dependencies[dep].invalid = true
      obj.dependencies[dep] = r.dependencies[dep]
      r = null
    else r = r.parent
return obj


TODO:
1. Find unmet deps in parent directories, searching as node does up
as far as the left-most node_modules folder.
2. Ignore anything in node_modules that isn't a package folder.

*/

try {
  var fs = require("graceful-fs")
} catch (er) {
  var fs = require("fs")
}

try {
  var log = require("npmlog")
} catch (_) {
  var log = { verbose: noop, info: noop, warn: noop, error: noop }
  function noop () {}
}

var path = require("path")
var asyncMap = require("slide").asyncMap
var semver = require("semver")
var readJson = require("read-package-json")
var url = require("url")

module.exports = readInstalled

function readInstalled (folder, depth, cb) {
  if (typeof cb !== "function") cb = depth, depth = Infinity
  readInstalled_(folder, null, null, null, 0, depth, function (er, obj) {
    if (er) return cb(er)
    // now obj has all the installed things, where they're installed
    // figure out the inheritance links, now that the object is built.
    resolveInheritance(obj)
    cb(null, obj)
  })
}

var rpSeen = {}
function readInstalled_ (folder, parent, name, reqver, depth, maxDepth, cb) {
  //console.error(folder, name)

  var installed
    , obj
    , real
    , link

  fs.readdir(path.resolve(folder, "node_modules"), function (er, i) {
    // error indicates that nothing is installed here
    if (er) i = []
    installed = i.filter(function (f) { return f.charAt(0) !== "." })
    next()
  })

  readJson(path.resolve(folder, "package.json"), function (er, data) {
    obj = copy(data)

    if (!parent) {
      obj = obj || true
      er = null
    }
    return next(er)
  })

  fs.lstat(folder, function (er, st) {
    if (er) {
      if (!parent) real = true
      return next(er)
    }
    fs.realpath(folder, function (er, rp) {
      //console.error("realpath(%j) = %j", folder, rp)
      real = rp
      if (st.isSymbolicLink()) link = rp
      next(er)
    })
  })

  var errState = null
    , called = false
  function next (er) {
    if (errState) return
    if (er) {
      errState = er
      return cb(null, [])
    }
    //console.error('next', installed, obj && typeof obj, name, real)
    if (!installed || !obj || !real || called) return
    called = true
    if (rpSeen[real]) return cb(null, rpSeen[real])
    if (obj === true) {
      obj = {dependencies:{}, path:folder}
      installed.forEach(function (i) { obj.dependencies[i] = "*" })
    }
    if (name && obj.name !== name) obj.invalid = true
    obj.realName = name || obj.name
    obj.dependencies = obj.dependencies || {}

    // "foo":"http://blah" is always presumed valid
    if (reqver
        && semver.validRange(reqver)
        && !semver.satisfies(obj.version, reqver)) {
      obj.invalid = true
    }

    if (parent
        && !(name in parent.dependencies)
        && !(name in (parent.devDependencies || {}))) {
      obj.extraneous = true
    }
    obj.path = obj.path || folder
    obj.realPath = real
    obj.link = link
    if (parent && !obj.link) obj.parent = parent
    rpSeen[real] = obj
    obj.depth = depth
    //if (depth >= maxDepth) return cb(null, obj)
    asyncMap(installed, function (pkg, cb) {
      var rv = obj.dependencies[pkg]
      if (!rv && obj.devDependencies) rv = obj.devDependencies[pkg]
      if (depth >= maxDepth) {
        // just try to get the version number
        var pkgfolder = path.resolve(folder, "node_modules", pkg)
          , jsonFile = path.resolve(pkgfolder, "package.json")
        return readJson(jsonFile, function (er, depData) {
          // already out of our depth, ignore errors
          if (er || !depData || !depData.version) return cb(null, obj)
          obj.dependencies[pkg] = depData.version
          cb(null, obj)
        })
      }

      readInstalled_( path.resolve(folder, "node_modules/"+pkg)
                    , obj, pkg, obj.dependencies[pkg], depth + 1, maxDepth
                    , cb )

    }, function (er, installedData) {
      if (er) return cb(er)
      installedData.forEach(function (dep) {
        obj.dependencies[dep.realName] = dep
      })

      // any strings here are unmet things.  however, if it's
      // optional, then that's fine, so just delete it.
      if (obj.optionalDependencies) {
        Object.keys(obj.optionalDependencies).forEach(function (dep) {
          if (typeof obj.dependencies[dep] === "string") {
            delete obj.dependencies[dep]
          }
        })
      }
      return cb(null, obj)
    })
  }
}

// starting from a root object, call findUnmet on each layer of children
var riSeen = []
function resolveInheritance (obj) {
  if (typeof obj !== "object") return
  if (riSeen.indexOf(obj) !== -1) return
  riSeen.push(obj)
  if (typeof obj.dependencies !== "object") {
    obj.dependencies = {}
  }
  Object.keys(obj.dependencies).forEach(function (dep) {
    findUnmet(obj.dependencies[dep])
  })
  Object.keys(obj.dependencies).forEach(function (dep) {
    resolveInheritance(obj.dependencies[dep])
  })
}

// find unmet deps by walking up the tree object.
// No I/O
var fuSeen = []
function findUnmet (obj) {
  if (fuSeen.indexOf(obj) !== -1) return
  fuSeen.push(obj)
  //console.error("find unmet", obj.name, obj.parent && obj.parent.name)
  var deps = obj.dependencies = obj.dependencies || {}
  //console.error(deps)
  Object.keys(deps)
    .filter(function (d) { return typeof deps[d] === "string" })
    .forEach(function (d) {
      //console.error("find unmet", obj.name, d, deps[d])
      var r = obj.parent
        , found = null
      while (r && !found && typeof deps[d] === "string") {
        // if r is a valid choice, then use that.
        found = r.dependencies[d]
        if (!found && r.realName === d) found = r

        if (!found) {
          r = r.link ? null : r.parent
          continue
        }
        if ( typeof deps[d] === "string"
            // url deps presumed innocent.
            && !url.parse(deps[d]).protocol
            && !semver.satisfies(found.version, deps[d])) {
          // the bad thing will happen
          log.warn("unmet dependency", obj.path + " requires "+d+"@'"+deps[d]
                  +"' but will load\n"
                  +found.path+",\nwhich is version "+found.version
                  )
          found.invalid = true
        } else {
          found.extraneous = false
        }
        deps[d] = found
      }

    })

  var peerDeps = obj.peerDependencies = obj.peerDependencies || {}
  Object.keys(peerDeps).forEach(function (d) {
    var dependency = obj.parent && obj.parent.dependencies &&
      obj.parent.dependencies[d]
    dependency.extraneous = false

    if (!semver.satisfies(dependency.version, peerDeps[d])) {
      dependency.peerInvalid = true
    }
  })

  log.verbose("readInstalled", "returning", obj._id)
  return obj
}

function copy (obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(copy)

  var o = {}
  for (var i in obj) o[i] = copy(obj[i])
  return o
}

},{"fs":2,"graceful-fs":58,"npmlog":55,"path":12,"read-package-json":71,"semver":72,"slide":76,"url":18}],78:[function(require,module,exports){
//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.6.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    any(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
    each(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, function(value, index, list) {
      return !predicate.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
    each(obj, function(value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
    each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    var result = -Infinity, lastComputed = -Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed > lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    var result = Infinity, lastComputed = Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed < lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iterator, context) {
      var result = {};
      iterator = lookupIterator(iterator);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    _.has(result, key) ? result[key].push(value) : result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(array, predicate) {
    var pass = [], fail = [];
    each(array, function(elem) {
      (predicate(elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.contains(other, item);
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function () {
      return value;
    };
  };

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true; //avoid comparing an object to itself.
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    }
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() { return new Date().getTime(); };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}).call(this);

},{}]},{},[1]);