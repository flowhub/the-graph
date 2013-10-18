
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", function(exports, require, module){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-underscore/index.js", function(exports, require, module){
//     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
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
  var _ = function(obj) { return new wrapper(obj); };

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
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

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
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
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
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = Math.floor(Math.random() * ++index);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, val, context) {
    var iterator = lookupIterator(obj, val);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (a === void 0) return 1;
      if (b === void 0) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(obj, val) {
    return _.isFunction(val) ? val : function(obj) { return obj[val]; };
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, val, behavior) {
    var result = {};
    var iterator = lookupIterator(obj, val);
    each(obj, function(value, index) {
      var key = iterator(value, index);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    return group(obj, val, function(result, key, value) {
      (result[key] || (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, val) {
    return group(obj, val, function(result, key, value) {
      result[key] || (result[key] = 0);
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var value = iterator(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj)                                     return [];
    if (_.isArray(obj))                           return slice.call(obj);
    if (_.isArguments(obj))                       return slice.call(obj);
    if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.isArray(obj) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
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
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    _.reduce(initial, function(memo, value, index) {
      if (isSorted ? (_.last(memo) !== value || !memo.length) : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, []);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Zip together two arrays -- an array of keys and an array of values -- into
  // a single object.
  _.zipObject = function(keys, values) {
    var result = {};
    for (var i = 0, l = keys.length; i < l; i++) {
      result[keys[i]] = values[i];
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
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
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

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
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
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
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
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        throttling = true;
        result = func.apply(context, args);
      }
      whenDone();
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
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
    if (times <= 0) return func();
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
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
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
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var result = {};
    each(flatten(slice.call(arguments, 1), true, []), function(key) {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
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
  var eq = function(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
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
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
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
    stack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
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
    return !!(obj && obj.nodeType == 1);
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

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
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

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // List of HTML entities for escaping.
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  // Regex containing the keys listed immediately above.
  var htmlEscaper = /[&<>"'\/]/g;

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return ('' + string).replace(htmlEscaper, function(match) {
      return htmlEscapes[match];
    });
  };

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
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
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\':   '\\',
    "'":    "'",
    r:      '\r',
    n:      '\n',
    t:      '\t',
    u2028:  '\u2028',
    u2029:  '\u2029'
  };

  for (var key in escapes) escapes[escapes[key]] = key;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n((__t=(" + unescape(code) + "))==null?'':_.escape(__t))+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n((__t=(" + unescape(code) + "))==null?'':__t)+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n__p+='";
      }) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'')};\n" +
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
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

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result(obj, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);

});
require.register("noflo-fbp/lib/fbp.js", function(exports, require, module){
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
        var result0, result1, result2, result3, result4, result5, result6;
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
            if (/^[A-Z.0-9_]/.test(input.charAt(pos))) {
              result3 = input.charAt(pos);
              pos++;
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("[A-Z.0-9_]");
              }
            }
            if (result3 !== null) {
              result2 = [];
              while (result3 !== null) {
                result2.push(result3);
                if (/^[A-Z.0-9_]/.test(input.charAt(pos))) {
                  result3 = input.charAt(pos);
                  pos++;
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("[A-Z.0-9_]");
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
          if (/^[a-zA-Z\/]/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[a-zA-Z\\/]");
            }
          }
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              if (/^[a-zA-Z\/]/.test(input.charAt(pos))) {
                result2 = input.charAt(pos);
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("[a-zA-Z\\/]");
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
      
        edges = parser.edges = [];
        
        parser.exports = []
      
        nodes = {};
      
        parser.addNode = function (nodeName, comp) {
          if (!nodes[nodeName]) {
            nodes[nodeName] = {}
          }
          if (!!comp.comp) {
            nodes[nodeName].component = comp.comp;
          }
          if (!!comp.meta) {
            nodes[nodeName].metadata={routes:comp.meta};
          }
         
        }
      
        parser.getResult = function () {
          return {processes:nodes, connections:parser.processEdges(), exports:parser.exports};
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
          parser.exports.push({private:priv.toLowerCase(), public:pub.toLowerCase()})
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
});
require.register("noflo-noflo/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo","description":"Flow-Based Programming environment for JavaScript","keywords":["fbp","workflow","flow"],"repo":"noflo/noflo","version":"0.4.1","dependencies":{"component/emitter":"*","component/underscore":"*","noflo/fbp":"*"},"development":{},"license":"MIT","main":"src/lib/NoFlo.js","scripts":["src/lib/Graph.coffee","src/lib/InternalSocket.coffee","src/lib/Port.coffee","src/lib/ArrayPort.coffee","src/lib/Component.coffee","src/lib/AsyncComponent.coffee","src/lib/LoggingComponent.coffee","src/lib/ComponentLoader.coffee","src/lib/NoFlo.coffee","src/lib/Network.coffee","src/components/Graph.coffee"],"json":["component.json"],"noflo":{"components":{"Graph":"src/components/Graph.js"}}}');
});
require.register("noflo-noflo/src/lib/Graph.js", function(exports, require, module){
var EventEmitter, Graph,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
  EventEmitter = require('events').EventEmitter;
} else {
  EventEmitter = require('emitter');
}

Graph = (function(_super) {
  __extends(Graph, _super);

  Graph.prototype.name = '';

  Graph.prototype.properties = {};

  Graph.prototype.nodes = [];

  Graph.prototype.edges = [];

  Graph.prototype.initializers = [];

  Graph.prototype.exports = [];

  function Graph(name) {
    this.name = name != null ? name : '';
    this.properties = {};
    this.nodes = [];
    this.edges = [];
    this.initializers = [];
    this.exports = [];
  }

  Graph.prototype.addExport = function(privatePort, publicPort) {
    return this.exports.push({
      "private": privatePort.toLowerCase(),
      "public": publicPort.toLowerCase()
    });
  };

  Graph.prototype.addNode = function(id, component, metadata) {
    var node;
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
    return node;
  };

  Graph.prototype.removeNode = function(id) {
    var edge, initializer, node, _i, _j, _len, _len1, _ref, _ref1;
    node = this.getNode(id);
    _ref = this.edges;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      edge = _ref[_i];
      if (!edge) {
        continue;
      }
      if (edge.from.node === node.id) {
        this.removeEdge(edge.from.node, edge.from.port);
      }
      if (edge.to.node === node.id) {
        this.removeEdge(edge.to.node, edge.to.port);
      }
    }
    _ref1 = this.initializers;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      initializer = _ref1[_j];
      if (!initializer) {
        continue;
      }
      if (initializer.to.node === node.id) {
        this.removeInitial(initializer.to.node, initializer.to.port);
      }
    }
    if (-1 !== this.nodes.indexOf(node)) {
      this.nodes.splice(this.nodes.indexOf(node), 1);
    }
    return this.emit('removeNode', node);
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
    var edge, iip, node, _i, _j, _len, _len1, _ref, _ref1;
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
    return this.emit('renameNode', oldId, newId);
  };

  Graph.prototype.addEdge = function(outNode, outPort, inNode, inPort, metadata) {
    var edge;
    if (!this.getNode(outNode)) {
      return;
    }
    if (!this.getNode(inNode)) {
      return;
    }
    if (!metadata) {
      metadata = {};
    }
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
    return edge;
  };

  Graph.prototype.removeEdge = function(node, port, node2, port2) {
    var edge, index, _i, _len, _ref, _results;
    _ref = this.edges;
    _results = [];
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      edge = _ref[index];
      if (!edge) {
        continue;
      }
      if (edge.from.node === node && edge.from.port === port) {
        if (node2 && port2) {
          if (!(edge.to.node === node2 && edge.to.port === port2)) {
            continue;
          }
        }
        this.emit('removeEdge', edge);
        this.edges.splice(index, 1);
      }
      if (edge.to.node === node && edge.to.port === port) {
        if (node2 && port2) {
          if (!(edge.from.node === node2 && edge.from.port === port2)) {
            continue;
          }
        }
        this.emit('removeEdge', edge);
        _results.push(this.edges.splice(index, 1));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Graph.prototype.addInitial = function(data, node, port, metadata) {
    var initializer;
    if (!this.getNode(node)) {
      return;
    }
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
    return initializer;
  };

  Graph.prototype.removeInitial = function(node, port) {
    var edge, index, _i, _len, _ref, _results;
    _ref = this.initializers;
    _results = [];
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      edge = _ref[index];
      if (!edge) {
        continue;
      }
      if (edge.to.node === node && edge.to.port === port) {
        this.emit('removeInitial', edge);
        _results.push(this.initializers.splice(index, 1));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
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
    var connection, edge, exported, initializer, json, node, property, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4;
    json = {
      properties: {},
      exports: [],
      processes: {},
      connections: []
    };
    _ref = this.properties;
    for (property in _ref) {
      value = _ref[property];
      json.properties[property] = value;
    }
    if (this.name) {
      json.properties.name = this.name;
    }
    _ref1 = this.exports;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      exported = _ref1[_i];
      json.exports.push({
        "private": exported["private"],
        "public": exported["public"]
      });
    }
    _ref2 = this.nodes;
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      node = _ref2[_j];
      json.processes[node.id] = {
        component: node.component
      };
      if (node.metadata) {
        json.processes[node.id].metadata = node.metadata;
      }
    }
    _ref3 = this.edges;
    for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
      edge = _ref3[_k];
      connection = {
        src: {
          process: edge.from.node,
          port: edge.from.port
        },
        tgt: {
          process: edge.to.node,
          port: edge.to.port
        }
      };
      if (Object.keys(edge.metadata).length) {
        connection.metadata = edge.metadata;
      }
      json.connections.push(connection);
    }
    _ref4 = this.initializers;
    for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
      initializer = _ref4[_l];
      json.connections.push({
        data: initializer.from.data,
        tgt: {
          process: initializer.to.node,
          port: initializer.to.port
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

exports.loadJSON = function(definition, success) {
  var conn, def, exported, graph, id, metadata, property, value, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
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
  _ref = definition.properties;
  for (property in _ref) {
    value = _ref[property];
    if (property === 'name') {
      continue;
    }
    graph.properties[property] = value;
  }
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
    if (conn.data !== void 0) {
      graph.addInitial(conn.data, conn.tgt.process, conn.tgt.port.toLowerCase());
      continue;
    }
    metadata = conn.metadata ? conn.metadata : {};
    graph.addEdge(conn.src.process, conn.src.port.toLowerCase(), conn.tgt.process, conn.tgt.port.toLowerCase(), metadata);
  }
  if (definition.exports) {
    _ref3 = definition.exports;
    for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
      exported = _ref3[_j];
      graph.addExport(exported["private"], exported["public"]);
    }
  }
  return success(graph);
};

exports.loadFBP = function(fbpData, success) {
  var definition;
  definition = require('fbp').parse(fbpData);
  return exports.loadJSON(definition, success);
};

exports.loadFile = function(file, success) {
  var definition, e;
  if (!(typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1)) {
    try {
      definition = require(file);
      exports.loadJSON(definition, success);
    } catch (_error) {
      e = _error;
      throw new Error("Failed to load graph " + file + ": " + e.message);
    }
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

});
require.register("noflo-noflo/src/lib/InternalSocket.js", function(exports, require, module){
var EventEmitter, InternalSocket,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
  EventEmitter = require('events').EventEmitter;
} else {
  EventEmitter = require('emitter');
}

InternalSocket = (function(_super) {
  __extends(InternalSocket, _super);

  function InternalSocket() {
    this.connected = false;
    this.groups = [];
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
    return this.emit('data', data);
  };

  InternalSocket.prototype.beginGroup = function(group) {
    this.groups.push(group);
    return this.emit('begingroup', group);
  };

  InternalSocket.prototype.endGroup = function() {
    return this.emit('endgroup', this.groups.pop());
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

});
require.register("noflo-noflo/src/lib/Port.js", function(exports, require, module){
var EventEmitter, Port,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
  EventEmitter = require('events').EventEmitter;
} else {
  EventEmitter = require('emitter');
}

Port = (function(_super) {
  __extends(Port, _super);

  function Port(type) {
    this.type = type;
    if (!this.type) {
      this.type = 'all';
    }
    this.socket = null;
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

  Port.prototype.attach = function(socket) {
    if (this.isAttached()) {
      throw new Error("" + (this.getId()) + ": Socket already attached " + (this.socket.getId()) + " - " + (socket.getId()));
    }
    this.socket = socket;
    return this.attachSocket(socket);
  };

  Port.prototype.attachSocket = function(socket, localId) {
    var _this = this;
    if (localId == null) {
      localId = null;
    }
    this.emit("attach", socket);
    this.from = socket.from;
    if (socket.setMaxListeners) {
      socket.setMaxListeners(0);
    }
    socket.on("connect", function() {
      return _this.emit("connect", socket, localId);
    });
    socket.on("begingroup", function(group) {
      return _this.emit("begingroup", group, localId);
    });
    socket.on("data", function(data) {
      return _this.emit("data", data, localId);
    });
    socket.on("endgroup", function(group) {
      return _this.emit("endgroup", group, localId);
    });
    return socket.on("disconnect", function() {
      return _this.emit("disconnect", socket, localId);
    });
  };

  Port.prototype.connect = function() {
    if (!this.socket) {
      throw new Error("" + (this.getId()) + ": No connection available");
    }
    return this.socket.connect();
  };

  Port.prototype.beginGroup = function(group) {
    var _this = this;
    if (!this.socket) {
      throw new Error("" + (this.getId()) + ": No connection available");
    }
    if (this.isConnected()) {
      return this.socket.beginGroup(group);
    }
    this.socket.once("connect", function() {
      return _this.socket.beginGroup(group);
    });
    return this.socket.connect();
  };

  Port.prototype.send = function(data) {
    var _this = this;
    if (!this.socket) {
      throw new Error("" + (this.getId()) + ": No connection available");
    }
    if (this.isConnected()) {
      return this.socket.send(data);
    }
    this.socket.once("connect", function() {
      return _this.socket.send(data);
    });
    return this.socket.connect();
  };

  Port.prototype.endGroup = function() {
    if (!this.socket) {
      throw new Error("" + (this.getId()) + ": No connection available");
    }
    return this.socket.endGroup();
  };

  Port.prototype.disconnect = function() {
    if (!this.socket) {
      throw new Error("" + (this.getId()) + ": No connection available");
    }
    return this.socket.disconnect();
  };

  Port.prototype.detach = function(socket) {
    if (!this.isAttached(socket)) {
      return;
    }
    this.emit("detach", this.socket);
    this.from = null;
    return this.socket = null;
  };

  Port.prototype.isConnected = function() {
    if (!this.socket) {
      return false;
    }
    return this.socket.isConnected();
  };

  Port.prototype.isAttached = function() {
    return this.socket !== null;
  };

  Port.prototype.canAttach = function() {
    if (this.isAttached()) {
      return false;
    }
    return true;
  };

  return Port;

})(EventEmitter);

exports.Port = Port;

});
require.register("noflo-noflo/src/lib/ArrayPort.js", function(exports, require, module){
var ArrayPort, port,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

port = require("./Port");

ArrayPort = (function(_super) {
  __extends(ArrayPort, _super);

  function ArrayPort(type) {
    this.type = type;
    if (!this.type) {
      this.type = 'all';
    }
    this.sockets = [];
  }

  ArrayPort.prototype.attach = function(socket) {
    this.sockets.push(socket);
    return this.attachSocket(socket, this.sockets.length - 1);
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
    var _this = this;
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error("" + (this.getId()) + ": No connections available");
      }
      this.sockets.forEach(function(socket, index) {
        return _this.beginGroup(group, index);
      });
      return;
    }
    if (!this.sockets[socketId]) {
      throw new Error("" + (this.getId()) + ": No connection '" + socketId + "' available");
    }
    if (this.isConnected(socketId)) {
      return this.sockets[socketId].beginGroup(group);
    }
    this.sockets[socketId].once("connect", function() {
      return _this.sockets[socketId].beginGroup(group);
    });
    return this.sockets[socketId].connect();
  };

  ArrayPort.prototype.send = function(data, socketId) {
    var _this = this;
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error("" + (this.getId()) + ": No connections available");
      }
      this.sockets.forEach(function(socket, index) {
        return _this.send(data, index);
      });
      return;
    }
    if (!this.sockets[socketId]) {
      throw new Error("" + (this.getId()) + ": No connection '" + socketId + "' available");
    }
    if (this.isConnected(socketId)) {
      return this.sockets[socketId].send(data);
    }
    this.sockets[socketId].once("connect", function() {
      return _this.sockets[socketId].send(data);
    });
    return this.sockets[socketId].connect();
  };

  ArrayPort.prototype.endGroup = function(socketId) {
    var _this = this;
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error("" + (this.getId()) + ": No connections available");
      }
      this.sockets.forEach(function(socket, index) {
        return _this.endGroup(index);
      });
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
        socket.disconnect();
      }
      return;
    }
    if (!this.sockets[socketId]) {
      return;
    }
    return this.sockets[socketId].disconnect();
  };

  ArrayPort.prototype.detach = function(socket) {
    if (this.sockets.indexOf(socket) === -1) {
      return;
    }
    this.sockets.splice(this.sockets.indexOf(socket), 1);
    return this.emit("detach", socket);
  };

  ArrayPort.prototype.isConnected = function(socketId) {
    var connected,
      _this = this;
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      connected = false;
      this.sockets.forEach(function(socket) {
        if (socket.isConnected()) {
          return connected = true;
        }
      });
      return connected;
    }
    if (!this.sockets[socketId]) {
      return false;
    }
    return this.sockets[socketId].isConnected();
  };

  ArrayPort.prototype.isAttached = function(socketId) {
    if (socketId === void 0) {
      if (this.sockets.length > 0) {
        return true;
      }
      return false;
    }
    if (this.sockets[socketId]) {
      return true;
    }
    return false;
  };

  ArrayPort.prototype.canAttach = function() {
    return true;
  };

  return ArrayPort;

})(port.Port);

exports.ArrayPort = ArrayPort;

});
require.register("noflo-noflo/src/lib/Component.js", function(exports, require, module){
var Component, EventEmitter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
  EventEmitter = require('events').EventEmitter;
} else {
  EventEmitter = require('emitter');
}

Component = (function(_super) {
  __extends(Component, _super);

  function Component() {
    _ref = Component.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Component.prototype.description = '';

  Component.prototype.icon = null;

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

  Component.prototype.shutdown = function() {};

  return Component;

})(EventEmitter);

exports.Component = Component;

});
require.register("noflo-noflo/src/lib/AsyncComponent.js", function(exports, require, module){
var AsyncComponent, component, port,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

port = require("./Port");

component = require("./Component");

AsyncComponent = (function(_super) {
  __extends(AsyncComponent, _super);

  function AsyncComponent(inPortName, outPortName, errPortName) {
    var _this = this;
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
    this.outPorts.load = new port.Port();
    this.inPorts[this.inPortName].on("begingroup", function(group) {
      if (_this.load > 0) {
        return _this.q.push({
          name: "begingroup",
          data: group
        });
      }
      return _this.outPorts[_this.outPortName].beginGroup(group);
    });
    this.inPorts[this.inPortName].on("endgroup", function() {
      if (_this.load > 0) {
        return _this.q.push({
          name: "endgroup"
        });
      }
      return _this.outPorts[_this.outPortName].endGroup();
    });
    this.inPorts[this.inPortName].on("disconnect", function() {
      if (_this.load > 0) {
        return _this.q.push({
          name: "disconnect"
        });
      }
      _this.outPorts[_this.outPortName].disconnect();
      if (_this.outPorts.load.isAttached()) {
        return _this.outPorts.load.disconnect();
      }
    });
    this.inPorts[this.inPortName].on("data", function(data) {
      if (_this.q.length > 0) {
        return _this.q.push({
          name: "data",
          data: data
        });
      }
      return _this.processData(data);
    });
  }

  AsyncComponent.prototype.processData = function(data) {
    var _this = this;
    this.incrementLoad();
    return this.doAsync(data, function(err) {
      if (err) {
        if (_this.outPorts[_this.errPortName] && _this.outPorts[_this.errPortName].isAttached()) {
          _this.outPorts[_this.errPortName].send(err);
          _this.outPorts[_this.errPortName].disconnect();
        } else {
          throw err;
        }
      }
      return _this.decrementLoad();
    });
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
    var _this = this;
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
      return process.nextTick(function() {
        return _this.processQueue();
      });
    } else {
      return setTimeout(function() {
        return _this.processQueue();
      }, 0);
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
          this.q.shift();
          break;
        case "endgroup":
          if (processedData) {
            return;
          }
          this.outPorts[this.outPortName].endGroup();
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
          this.q.shift();
          break;
        case "data":
          this.processData(event.data);
          this.q.shift();
          processedData = true;
      }
    }
  };

  return AsyncComponent;

})(component.Component);

exports.AsyncComponent = AsyncComponent;

});
require.register("noflo-noflo/src/lib/LoggingComponent.js", function(exports, require, module){
var Component, Port, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Component = require("./Component").Component;

Port = require("./Port").Port;

if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
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

});
require.register("noflo-noflo/src/lib/ComponentLoader.js", function(exports, require, module){
var ComponentLoader, graph, internalSocket;

internalSocket = require('./InternalSocket');

graph = require('./Graph');

ComponentLoader = (function() {
  function ComponentLoader(baseDir) {
    this.baseDir = baseDir;
    this.components = null;
    this.checked = [];
    this.revalidate = false;
    this.libraryIcons = {};
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
    var cPath, definition, dependency, e, name, prefix, _ref, _ref1, _results;
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
    if (definition.noflo.components) {
      _ref = definition.noflo.components;
      for (name in _ref) {
        cPath = _ref[name];
        if (cPath.indexOf('.coffee') !== -1) {
          cPath = cPath.replace('.coffee', '.js');
        }
        this.registerComponent(prefix, name, "/" + moduleName + "/" + cPath);
      }
    }
    if (definition.noflo.graphs) {
      _ref1 = definition.noflo.graphs;
      _results = [];
      for (name in _ref1) {
        cPath = _ref1[name];
        _results.push(this.registerComponent(prefix, name, "/" + moduleName + "/" + cPath));
      }
      return _results;
    }
  };

  ComponentLoader.prototype.listComponents = function(callback) {
    if (this.components !== null) {
      return callback(this.components);
    }
    this.components = {};
    this.getModuleComponents(this.baseDir);
    return callback(this.components);
  };

  ComponentLoader.prototype.load = function(name, callback) {
    var component, componentName, implementation, instance,
      _this = this;
    if (!this.components) {
      this.listComponents(function(components) {
        return _this.load(name, callback);
      });
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
        process.nextTick(function() {
          return _this.loadGraph(name, component, callback);
        });
      } else {
        setTimeout(function() {
          return _this.loadGraph(name, component, callback);
        }, 0);
      }
      return;
    }
    if (typeof component === 'function') {
      implementation = component;
      instance = new component;
    } else {
      implementation = require(component);
      instance = implementation.getComponent();
    }
    if (name === 'Graph') {
      instance.baseDir = this.baseDir;
    }
    this.setIcon(name, instance);
    return callback(instance);
  };

  ComponentLoader.prototype.isGraph = function(cPath) {
    if (typeof cPath !== 'string') {
      return false;
    }
    return cPath.indexOf('.fbp') !== -1 || cPath.indexOf('.json') !== -1;
  };

  ComponentLoader.prototype.loadGraph = function(name, component, callback) {
    var graphImplementation, graphSocket;
    graphImplementation = require(this.components['Graph']);
    graphSocket = internalSocket.createSocket();
    graph = graphImplementation.getComponent();
    graph.baseDir = this.baseDir;
    graph.inPorts.graph.attach(graphSocket);
    graphSocket.send(component);
    graphSocket.disconnect();
    delete graph.inPorts.graph;
    delete graph.inPorts.start;
    this.setIcon(name, graph);
    return callback(graph);
  };

  ComponentLoader.prototype.setIcon = function(name, instance) {
    var componentName, library, _ref;
    if (instance.getIcon()) {
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
    instance.setIcon('blank');
  };

  ComponentLoader.prototype.getLibraryIcon = function(prefix) {
    if (this.libraryIcons[prefix]) {
      return this.libraryIcons[prefix];
    }
    return null;
  };

  ComponentLoader.prototype.registerComponent = function(packageId, name, cPath, callback) {
    var fullName, prefix;
    prefix = this.getModulePrefix(packageId);
    fullName = "" + prefix + "/" + name;
    if (!packageId) {
      fullName = name;
    }
    this.components[fullName] = cPath;
    if (callback) {
      return callback();
    }
  };

  ComponentLoader.prototype.registerGraph = function(packageId, name, gPath, callback) {
    return this.registerComponent(packageId, name, gPath, callback);
  };

  ComponentLoader.prototype.clear = function() {
    this.components = null;
    this.checked = [];
    return this.revalidate = true;
  };

  return ComponentLoader;

})();

exports.ComponentLoader = ComponentLoader;

});
require.register("noflo-noflo/src/lib/NoFlo.js", function(exports, require, module){
exports.graph = require('./Graph');

exports.Graph = exports.graph.Graph;

exports.Network = require('./Network').Network;

exports.isBrowser = function() {
  if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
    return false;
  }
  return true;
};

if (!exports.isBrowser()) {
  exports.ComponentLoader = require('./nodejs/ComponentLoader').ComponentLoader;
} else {
  exports.ComponentLoader = require('./ComponentLoader').ComponentLoader;
}

exports.Component = require('./Component').Component;

exports.AsyncComponent = require('./AsyncComponent').AsyncComponent;

exports.LoggingComponent = require('./LoggingComponent').LoggingComponent;

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
  if (graph.nodes.length === 0) {
    setTimeout(function() {
      return networkReady(network);
    }, 0);
    return network;
  }
  network.loader.listComponents(function() {
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

exports.loadFile = function(file, callback) {
  return exports.graph.loadFile(file, function(net) {
    return exports.createNetwork(net, callback);
  });
};

exports.saveFile = function(graph, file, callback) {
  return exports.graph.save(file, function() {
    return callback(file);
  });
};

});
require.register("noflo-noflo/src/lib/Network.js", function(exports, require, module){
var EventEmitter, Network, componentLoader, graph, internalSocket, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require("underscore");

internalSocket = require("./InternalSocket");

graph = require("./Graph");

if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
  componentLoader = require("./nodejs/ComponentLoader");
  EventEmitter = require('events').EventEmitter;
} else {
  componentLoader = require('./ComponentLoader');
  EventEmitter = require('emitter');
}

Network = (function(_super) {
  __extends(Network, _super);

  Network.prototype.processes = {};

  Network.prototype.connections = [];

  Network.prototype.initials = [];

  Network.prototype.graph = null;

  Network.prototype.startupDate = null;

  Network.prototype.portBuffer = {};

  function Network(graph) {
    var _this = this;
    this.processes = {};
    this.connections = [];
    this.initials = [];
    this.graph = graph;
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
      this.baseDir = graph.baseDir || process.cwd();
    } else {
      this.baseDir = graph.baseDir || '/';
    }
    this.startupDate = new Date();
    this.graph.on('addNode', function(node) {
      return _this.addNode(node);
    });
    this.graph.on('removeNode', function(node) {
      return _this.removeNode(node);
    });
    this.graph.on('renameNode', function(oldId, newId) {
      return _this.renameNode(oldId, newId);
    });
    this.graph.on('addEdge', function(edge) {
      return _this.addEdge(edge);
    });
    this.graph.on('removeEdge', function(edge) {
      return _this.removeEdge(edge);
    });
    this.graph.on('addInitial', function(iip) {
      return _this.addInitial(iip);
    });
    this.graph.on('removeInitial', function(iip) {
      return _this.removeInitial(iip);
    });
    this.loader = new componentLoader.ComponentLoader(this.baseDir);
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
    var ender,
      _this = this;
    this.connectionCount--;
    if (this.connectionCount === 0) {
      ender = _.debounce(function() {
        if (_this.connectionCount) {
          return;
        }
        return _this.emit('end', {
          start: _this.startupDate,
          end: new Date,
          uptime: _this.uptime()
        });
      }, 10);
      return ender();
    }
  };

  Network.prototype.load = function(component, callback) {
    if (typeof component === 'object') {
      return callback(component);
    }
    return this.loader.load(component, callback);
  };

  Network.prototype.addNode = function(node, callback) {
    var process,
      _this = this;
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
    return this.load(node.component, function(instance) {
      var name, port, _ref, _ref1;
      instance.nodeId = node.id;
      process.component = instance;
      _ref = process.component.inPorts;
      for (name in _ref) {
        port = _ref[name];
        port.node = node.id;
        port.name = name;
      }
      _ref1 = process.component.outPorts;
      for (name in _ref1) {
        port = _ref1[name];
        port.node = node.id;
        port.name = name;
      }
      if (instance.isSubgraph()) {
        _this.subscribeSubgraph(node.id, instance);
      }
      _this.processes[process.id] = process;
      if (callback) {
        return callback(process);
      }
    });
  };

  Network.prototype.removeNode = function(node) {
    if (!this.processes[node.id]) {
      return;
    }
    this.processes[node.id].component.shutdown();
    return delete this.processes[node.id];
  };

  Network.prototype.renameNode = function(oldId, newId) {
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
    return delete this.processes[oldId];
  };

  Network.prototype.getNode = function(id) {
    return this.processes[id];
  };

  Network.prototype.connect = function(done) {
    var edges, initializers, nodes, serialize,
      _this = this;
    if (done == null) {
      done = function() {};
    }
    serialize = function(next, add) {
      return function(type) {
        return _this["add" + type](add, function() {
          return next(type);
        });
      };
    };
    initializers = _.reduceRight(this.graph.initializers, serialize, done);
    edges = _.reduceRight(this.graph.edges, serialize, function() {
      return initializers("Initial");
    });
    nodes = _.reduceRight(this.graph.nodes, serialize, function() {
      return edges("Edge");
    });
    return nodes("Node");
  };

  Network.prototype.connectPort = function(socket, process, port, inbound) {
    if (inbound) {
      socket.to = {
        process: process,
        port: port
      };
      if (!(process.component.inPorts && process.component.inPorts[port])) {
        throw new Error("No inport '" + port + "' defined in process " + process.id + " (" + (socket.getId()) + ")");
        return;
      }
      return process.component.inPorts[port].attach(socket);
    }
    socket.from = {
      process: process,
      port: port
    };
    if (!(process.component.outPorts && process.component.outPorts[port])) {
      throw new Error("No outport '" + port + "' defined in process " + process.id + " (" + (socket.getId()) + ")");
      return;
    }
    return process.component.outPorts[port].attach(socket);
  };

  Network.prototype.subscribeSubgraph = function(nodeName, process) {
    var emitSub,
      _this = this;
    if (!process.isReady()) {
      process.once('ready', function() {
        _this.subscribeSubgraph(nodeName, process);
      });
    }
    if (!process.network) {
      return;
    }
    emitSub = function(type, data) {
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
        data.subgraph = "" + nodeName + ":" + data.subgraph;
      } else {
        data.subgraph = nodeName;
      }
      return _this.emit(type, data);
    };
    process.network.on('connect', function(data) {
      return emitSub('connect', data);
    });
    process.network.on('begingroup', function(data) {
      return emitSub('begingroup', data);
    });
    process.network.on('data', function(data) {
      return emitSub('data', data);
    });
    process.network.on('endgroup', function(data) {
      return emitSub('endgroup', data);
    });
    return process.network.on('disconnect', function(data) {
      return emitSub('disconnect', data);
    });
  };

  Network.prototype.subscribeSocket = function(socket) {
    var _this = this;
    socket.on('connect', function() {
      _this.increaseConnections();
      return _this.emit('connect', {
        id: socket.getId(),
        socket: socket
      });
    });
    socket.on('begingroup', function(group) {
      return _this.emit('begingroup', {
        id: socket.getId(),
        socket: socket,
        group: group
      });
    });
    socket.on('data', function(data) {
      return _this.emit('data', {
        id: socket.getId(),
        socket: socket,
        data: data
      });
    });
    socket.on('endgroup', function(group) {
      return _this.emit('endgroup', {
        id: socket.getId(),
        socket: socket,
        group: group
      });
    });
    return socket.on('disconnect', function() {
      _this.decreaseConnections();
      return _this.emit('disconnect', {
        id: socket.getId(),
        socket: socket
      });
    });
  };

  Network.prototype.addEdge = function(edge, callback) {
    var from, socket, to,
      _this = this;
    socket = internalSocket.createSocket();
    from = this.getNode(edge.from.node);
    if (!from) {
      throw new Error("No process defined for outbound node " + edge.from.node);
    }
    if (!from.component) {
      throw new Error("No component defined for outbound node " + edge.from.node);
    }
    if (!from.component.isReady()) {
      from.component.once("ready", function() {
        return _this.addEdge(edge, callback);
      });
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
      to.component.once("ready", function() {
        return _this.addEdge(edge, callback);
      });
      return;
    }
    this.connectPort(socket, to, edge.to.port, true);
    this.connectPort(socket, from, edge.from.port, false);
    this.subscribeSocket(socket);
    this.connections.push(socket);
    if (callback) {
      return callback();
    }
  };

  Network.prototype.removeEdge = function(edge) {
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
      _results.push(this.connections.splice(this.connections.indexOf(connection), 1));
    }
    return _results;
  };

  Network.prototype.addInitial = function(initializer, callback) {
    var socket, to,
      _this = this;
    socket = internalSocket.createSocket();
    this.subscribeSocket(socket);
    to = this.getNode(initializer.to.node);
    if (!to) {
      throw new Error("No process defined for inbound node " + initializer.to.node);
    }
    if (!(to.component.isReady() || to.component.inPorts[initializer.to.port])) {
      to.component.setMaxListeners(0);
      to.component.once("ready", function() {
        return _this.addInitial(initializer, callback);
      });
      return;
    }
    this.connectPort(socket, to, initializer.to.port, true);
    this.connections.push(socket);
    this.initials.push({
      socket: socket,
      data: initializer.from.data
    });
    if (callback) {
      return callback();
    }
  };

  Network.prototype.removeInitial = function(initializer) {
    var connection, _i, _len, _ref, _results;
    _ref = this.connections;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      connection = _ref[_i];
      if (!connection) {
        continue;
      }
      if (!(initializer.to.node === connection.to.process.id && initializer.to.port === connection.to.port)) {
        continue;
      }
      connection.to.process.component.inPorts[connection.to.port].detach(connection);
      _results.push(this.connections.splice(this.connections.indexOf(connection), 1));
    }
    return _results;
  };

  Network.prototype.sendInitial = function(initial) {
    initial.socket.connect();
    initial.socket.send(initial.data);
    return initial.socket.disconnect();
  };

  Network.prototype.sendInitials = function() {
    var send,
      _this = this;
    send = function() {
      var initial, _i, _len, _ref;
      _ref = _this.initials;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        initial = _ref[_i];
        _this.sendInitial(initial);
      }
      return _this.initials = [];
    };
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
      return process.nextTick(send);
    } else {
      return setTimeout(send, 0);
    }
  };

  Network.prototype.start = function() {
    return this.sendInitials();
  };

  Network.prototype.stop = function() {
    var connection, id, process, _i, _len, _ref, _ref1, _results;
    _ref = this.connections;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      connection = _ref[_i];
      if (!connection.isConnected()) {
        continue;
      }
      connection.disconnect();
    }
    _ref1 = this.processes;
    _results = [];
    for (id in _ref1) {
      process = _ref1[id];
      _results.push(process.component.shutdown());
    }
    return _results;
  };

  return Network;

})(EventEmitter);

exports.Network = Network;

});
require.register("noflo-noflo/src/components/Graph.js", function(exports, require, module){
var Graph, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
  noflo = require("../../lib/NoFlo");
} else {
  noflo = require('../lib/NoFlo');
}

Graph = (function(_super) {
  __extends(Graph, _super);

  function Graph() {
    var _this = this;
    this.network = null;
    this.ready = true;
    this.started = false;
    this.baseDir = null;
    this.inPorts = {
      graph: new noflo.Port('all'),
      start: new noflo.Port('bang')
    };
    this.outPorts = {};
    this.inPorts.graph.on("data", function(data) {
      return _this.setGraph(data);
    });
    this.inPorts.start.on("data", function() {
      _this.started = true;
      if (!_this.network) {
        return;
      }
      return _this.network.connect(function() {
        var name, notReady, process, _ref;
        _this.network.sendInitials();
        notReady = false;
        _ref = _this.network.processes;
        for (name in _ref) {
          process = _ref[name];
          if (!_this.checkComponent(name, process)) {
            notReady = true;
          }
        }
        if (!notReady) {
          return _this.setToReady();
        }
      });
    });
  }

  Graph.prototype.setGraph = function(graph) {
    var _this = this;
    this.ready = false;
    if (typeof graph === 'object') {
      if (typeof graph.addNode === 'function') {
        return this.createNetwork(graph);
      }
      noflo.graph.loadJSON(graph, function(instance) {
        instance.baseDir = _this.baseDir;
        return _this.createNetwork(instance);
      });
      return;
    }
    if (graph.substr(0, 1) !== "/") {
      graph = "" + (process.cwd()) + "/" + graph;
    }
    return graph = noflo.graph.loadFile(graph, function(instance) {
      instance.baseDir = _this.baseDir;
      return _this.createNetwork(instance);
    });
  };

  Graph.prototype.createNetwork = function(graph) {
    var _ref,
      _this = this;
    if (((_ref = this.inPorts.start) != null ? _ref.isAttached() : void 0) && !this.started) {
      noflo.createNetwork(graph, function(network) {
        _this.network = network;
        return _this.emit('network', _this.network);
      }, true);
      return;
    }
    return noflo.createNetwork(graph, function(network) {
      var name, notReady, process, _ref1;
      _this.network = network;
      _this.emit('network', _this.network);
      notReady = false;
      _ref1 = _this.network.processes;
      for (name in _ref1) {
        process = _ref1[name];
        if (!_this.checkComponent(name, process)) {
          notReady = true;
        }
      }
      if (!notReady) {
        return _this.setToReady();
      }
    });
  };

  Graph.prototype.checkComponent = function(name, process) {
    var _this = this;
    if (!process.component.isReady()) {
      process.component.once("ready", function() {
        _this.checkComponent(name, process);
        return _this.setToReady();
      });
      return false;
    }
    this.findEdgePorts(name, process);
    return true;
  };

  Graph.prototype.portName = function(nodeName, portName) {
    return "" + (nodeName.toLowerCase()) + "." + portName;
  };

  Graph.prototype.isExported = function(port, nodeName, portName) {
    var exported, newPort, _i, _len, _ref;
    newPort = this.portName(nodeName, portName);
    if (!port.canAttach()) {
      return false;
    }
    if (this.network.graph.exports.length === 0) {
      return newPort;
    }
    _ref = this.network.graph.exports;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      exported = _ref[_i];
      if (exported["private"] === newPort) {
        return exported["public"];
      }
    }
    return false;
  };

  Graph.prototype.setToReady = function() {
    var _this = this;
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
      return process.nextTick(function() {
        _this.ready = true;
        return _this.emit('ready');
      });
    } else {
      return setTimeout(function() {
        _this.ready = true;
        return _this.emit('ready');
      }, 0);
    }
  };

  Graph.prototype.findEdgePorts = function(name, process) {
    var port, portName, targetPortName, _ref, _ref1;
    _ref = process.component.inPorts;
    for (portName in _ref) {
      port = _ref[portName];
      targetPortName = this.isExported(port, name, portName);
      if (targetPortName === false) {
        continue;
      }
      this.inPorts[targetPortName] = port;
    }
    _ref1 = process.component.outPorts;
    for (portName in _ref1) {
      port = _ref1[portName];
      targetPortName = this.isExported(port, name, portName);
      if (targetPortName === false) {
        continue;
      }
      this.outPorts[targetPortName] = port;
    }
    return true;
  };

  Graph.prototype.isReady = function() {
    return this.ready;
  };

  Graph.prototype.isSubgraph = function() {
    return true;
  };

  Graph.prototype.shutdown = function() {
    if (!this.network) {
      return;
    }
    return this.network.stop();
  };

  return Graph;

})(noflo.Component);

exports.getComponent = function() {
  return new Graph;
};

});
require.register("noflo-noflo-interaction/index.js", function(exports, require, module){
/*
 * This file can be used for general library features that are exposed as CommonJS modules
 * that the components then utilize
 */

});
require.register("noflo-noflo-interaction/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-interaction","description":"User interaction components for NoFlo","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-interaction","version":"0.0.1","keywords":[],"dependencies":{"noflo/noflo":"*"},"scripts":["components/ListenDrag.coffee","components/ListenHash.coffee","components/ListenKeyboard.coffee","components/ListenMouse.coffee","components/ListenPointer.coffee","components/ListenScroll.coffee","components/ListenSpeech.coffee","components/ListenTouch.coffee","components/SetHash.coffee","components/ReadCoordinates.coffee","index.js"],"json":["component.json"],"noflo":{"icon":"user","components":{"ListenDrag":"components/ListenDrag.coffee","ListenHash":"components/ListenHash.coffee","ListenKeyboard":"components/ListenKeyboard.coffee","ListenMouse":"components/ListenMouse.coffee","ListenPointer":"components/ListenPointer.coffee","ListenScroll":"components/ListenScroll.coffee","ListenSpeech":"components/ListenSpeech.coffee","ListenTouch":"components/ListenTouch.coffee","ReadCoordinates":"components/ReadCoordinates.coffee","SetHash":"components/SetHash.coffee"}}}');
});
require.register("noflo-noflo-interaction/components/ListenDrag.js", function(exports, require, module){
var ListenDrag, noflo,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ListenDrag = (function(_super) {
  __extends(ListenDrag, _super);

  ListenDrag.prototype.description = 'Listen to drag events on a DOM element';

  function ListenDrag() {
    this.dragend = __bind(this.dragend, this);
    this.dragmove = __bind(this.dragmove, this);
    this.dragstart = __bind(this.dragstart, this);
    var _this = this;
    this.inPorts = {
      element: new noflo.Port('object')
    };
    this.outPorts = {
      start: new noflo.ArrayPort('object'),
      movex: new noflo.ArrayPort('number'),
      movey: new noflo.ArrayPort('number'),
      end: new noflo.ArrayPort('object')
    };
    this.inPorts.element.on('data', function(element) {
      return _this.subscribe(element);
    });
  }

  ListenDrag.prototype.subscribe = function(element) {
    element.addEventListener('dragstart', this.dragstart, false);
    element.addEventListener('drag', this.dragmove, false);
    return element.addEventListener('dragend', this.dragend, false);
  };

  ListenDrag.prototype.dragstart = function(event) {
    event.preventDefault();
    event.stopPropagation();
    this.outPorts.start.send(event);
    return this.outPorts.start.disconnect();
  };

  ListenDrag.prototype.dragmove = function(event) {
    event.preventDefault();
    event.stopPropagation();
    this.outPorts.movex.send(event.clientX);
    return this.outPorts.movey.send(event.clientY);
  };

  ListenDrag.prototype.dragend = function(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.outPorts.movex.isConnected()) {
      this.outPorts.movex.disconnect();
    }
    if (this.outPorts.movey.isConnected()) {
      this.outPorts.movey.disconnect();
    }
    this.outPorts.end.send(event);
    return this.outPorts.end.disconnect();
  };

  return ListenDrag;

})(noflo.Component);

exports.getComponent = function() {
  return new ListenDrag;
};

});
require.register("noflo-noflo-interaction/components/ListenHash.js", function(exports, require, module){
var ListenHash, noflo,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ListenHash = (function(_super) {
  __extends(ListenHash, _super);

  ListenHash.prototype.description = 'Listen for hash changes in browser\'s URL bar';

  function ListenHash() {
    this.hashChange = __bind(this.hashChange, this);
    var _this = this;
    this.inPorts = {
      start: new noflo.Port('bang'),
      stop: new noflo.Port('bang')
    };
    this.outPorts = {
      initial: new noflo.Port('string'),
      change: new noflo.Port('string')
    };
    this.inPorts.start.on('data', function() {
      return _this.subscribe();
    });
    this.inPorts.stop.on('data', function() {
      return _this.unsubscribe();
    });
  }

  ListenHash.prototype.subscribe = function() {
    var initialHash;
    window.addEventListener('hashchange', this.hashChange, false);
    if (this.outPorts.initial.isAttached()) {
      initialHash = window.location.hash.substr(1);
      this.outPorts.initial.send(initialHash);
      return this.outPorts.initial.disconnect();
    }
  };

  ListenHash.prototype.unsubscribe = function() {
    window.removeEventListener('hashchange', this.hashChange, false);
    return this.outPorts.change.disconnect();
  };

  ListenHash.prototype.hashChange = function(event) {
    var newHash, oldHash;
    oldHash = event.oldURL.split('#')[1];
    newHash = event.newURL.split('#')[1];
    if (!newHash) {
      newHash = '';
    }
    if (oldHash) {
      this.outPorts.change.beginGroup(oldHash);
    }
    this.outPorts.change.send(newHash);
    if (oldHash) {
      return this.outPorts.change.endGroup(oldHash);
    }
  };

  ListenHash.prototype.shutdown = function() {
    return this.unsubscribe();
  };

  return ListenHash;

})(noflo.Component);

exports.getComponent = function() {
  return new ListenHash;
};

});
require.register("noflo-noflo-interaction/components/ListenKeyboard.js", function(exports, require, module){
var ListenKeyboard, noflo,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ListenKeyboard = (function(_super) {
  __extends(ListenKeyboard, _super);

  ListenKeyboard.prototype.description = 'Listen for key presses on a given DOM element';

  ListenKeyboard.prototype.icon = 'keyboard';

  function ListenKeyboard() {
    this.keypress = __bind(this.keypress, this);
    var _this = this;
    this.elements = [];
    this.inPorts = {
      element: new noflo.Port('object'),
      stop: new noflo.Port('object')
    };
    this.outPorts = {
      keypress: new noflo.Port('integer')
    };
    this.inPorts.element.on('data', function(element) {
      return _this.subscribe(element);
    });
    this.inPorts.stop.on('data', function(element) {
      return _this.unsubscribe(element);
    });
  }

  ListenKeyboard.prototype.subscribe = function(element) {
    element.addEventListener('keypress', this.keypress, false);
    return this.elements.push(element);
  };

  ListenKeyboard.prototype.unsubscribe = function(element) {
    if (-1 === this.elements.indexOf(element)) {
      return;
    }
    element.removeEventListener('keypress', this.keypress, false);
    return this.elements.splice(this.elements.indexOf(element), 1);
  };

  ListenKeyboard.prototype.keypress = function(event) {
    if (!this.outPorts.keypress.isAttached()) {
      return;
    }
    this.outPorts.keypress.send(event.keyCode);
    return this.outPorts.keypress.disconnect();
  };

  ListenKeyboard.prototype.shutdown = function() {
    var element, _i, _len, _ref, _results;
    _ref = this.elements;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i];
      _results.push(this.unsubscribe(element));
    }
    return _results;
  };

  return ListenKeyboard;

})(noflo.Component);

exports.getComponent = function() {
  return new ListenKeyboard;
};

});
require.register("noflo-noflo-interaction/components/ListenMouse.js", function(exports, require, module){
var ListenMouse, noflo,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ListenMouse = (function(_super) {
  __extends(ListenMouse, _super);

  ListenMouse.prototype.description = 'Listen to mouse events on a DOM element';

  function ListenMouse() {
    this.dblclick = __bind(this.dblclick, this);
    this.click = __bind(this.click, this);
    var _this = this;
    this.inPorts = {
      element: new noflo.Port('object')
    };
    this.outPorts = {
      click: new noflo.ArrayPort('object'),
      dblclick: new noflo.ArrayPort('object')
    };
    this.inPorts.element.on('data', function(element) {
      return _this.subscribe(element);
    });
  }

  ListenMouse.prototype.subscribe = function(element) {
    element.addEventListener('click', this.click, false);
    return element.addEventListener('dblclick', this.dblclick, false);
  };

  ListenMouse.prototype.click = function(event) {
    if (!this.outPorts.click.sockets.length) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.outPorts.click.send(event);
    return this.outPorts.click.disconnect();
  };

  ListenMouse.prototype.dblclick = function(event) {
    if (!this.outPorts.dblclick.sockets.length) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.outPorts.dblclick.send(event);
    return this.outPorts.dblclick.disconnect();
  };

  return ListenMouse;

})(noflo.Component);

exports.getComponent = function() {
  return new ListenMouse;
};

});
require.register("noflo-noflo-interaction/components/ListenPointer.js", function(exports, require, module){
var ListenPointer, noflo,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ListenPointer = (function(_super) {
  __extends(ListenPointer, _super);

  ListenPointer.prototype.description = 'Listen to pointer events on a DOM element';

  function ListenPointer() {
    this.pointerLeave = __bind(this.pointerLeave, this);
    this.pointerEnter = __bind(this.pointerEnter, this);
    this.pointerOut = __bind(this.pointerOut, this);
    this.pointerOver = __bind(this.pointerOver, this);
    this.pointerMove = __bind(this.pointerMove, this);
    this.pointerCancel = __bind(this.pointerCancel, this);
    this.pointerUp = __bind(this.pointerUp, this);
    this.pointerDown = __bind(this.pointerDown, this);
    var _this = this;
    this.action = 'none';
    this.capture = false;
    this.propagate = false;
    this.elements = [];
    this.inPorts = {
      element: new noflo.Port('object'),
      action: new noflo.Port('string'),
      capture: new noflo.Port('boolean'),
      propagate: new noflo.Port('boolean')
    };
    this.outPorts = {
      down: new noflo.Port('object'),
      up: new noflo.Port('object'),
      cancel: new noflo.Port('object'),
      move: new noflo.Port('object'),
      over: new noflo.Port('object'),
      out: new noflo.Port('object'),
      enter: new noflo.Port('object'),
      leave: new noflo.Port('object')
    };
    this.inPorts.element.on('data', function(element) {
      return _this.subscribe(element);
    });
    this.inPorts.action.on('data', function(action) {
      _this.action = action;
    });
    this.inPorts.capture.on('data', function(capture) {
      _this.capture = capture;
    });
    this.inPorts.propagate.on('data', function(propagate) {
      _this.propagate = propagate;
    });
  }

  ListenPointer.prototype.subscribe = function(element) {
    if (element.setAttribute) {
      element.setAttribute('touch-action', this.action);
    }
    element.addEventListener('pointerdown', this.pointerDown, this.capture);
    element.addEventListener('pointerup', this.pointerUp, this.capture);
    element.addEventListener('pointercancel', this.pointerCancel, this.capture);
    element.addEventListener('pointermove', this.pointerMove, this.capture);
    element.addEventListener('pointerover', this.pointerOver, this.capture);
    element.addEventListener('pointerout', this.pointerOut, this.capture);
    element.addEventListener('pointerenter', this.pointerEnter, this.capture);
    element.addEventListener('pointerleave', this.pointerLeave, this.capture);
    return this.elements.push(element);
  };

  ListenPointer.prototype.unsubscribe = function(element) {
    var name, port, _ref, _results;
    if (element.removeAttribute) {
      element.removeAttribute('touch-action');
    }
    element.removeEventListener('pointerdown', this.pointerDown, this.capture);
    element.removeEventListener('pointerup', this.pointerUp, this.capture);
    element.removeEventListener('pointercancel', this.pointerCancel, this.capture);
    element.removeEventListener('pointermove', this.pointerMove, this.capture);
    element.removeEventListener('pointerover', this.pointerOver, this.capture);
    element.removeEventListener('pointerout', this.pointerOut, this.capture);
    element.removeEventListener('pointerenter', this.pointerEnter, this.capture);
    element.removeEventListener('pointerleave', this.pointerLeave, this.capture);
    _ref = this.outPorts;
    _results = [];
    for (name in _ref) {
      port = _ref[name];
      if (!port.isAttached()) {
        continue;
      }
      _results.push(port.disconnect());
    }
    return _results;
  };

  ListenPointer.prototype.shutdown = function() {
    var element, _i, _len, _ref;
    _ref = this.elements;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i];
      this.unsubscribe(element);
    }
    return this.elements = [];
  };

  ListenPointer.prototype.pointerDown = function(event) {
    return this.handle(event, 'down');
  };

  ListenPointer.prototype.pointerUp = function(event) {
    return this.handle(event, 'up');
  };

  ListenPointer.prototype.pointerCancel = function(event) {
    return this.handle(event, 'cancel');
  };

  ListenPointer.prototype.pointerMove = function(event) {
    return this.handle(event, 'move');
  };

  ListenPointer.prototype.pointerOver = function(event) {
    return this.handle(event, 'over');
  };

  ListenPointer.prototype.pointerOut = function(event) {
    return this.handle(event, 'out');
  };

  ListenPointer.prototype.pointerEnter = function(event) {
    return this.handle(event, 'enter');
  };

  ListenPointer.prototype.pointerLeave = function(event) {
    return this.handle(event, 'leave');
  };

  ListenPointer.prototype.handle = function(event, type) {
    var name, port, _ref, _results;
    event.preventDefault();
    if (!this.propagate) {
      event.stopPropagation();
    }
    if (!this.outPorts[type].isAttached()) {
      return;
    }
    this.outPorts[type].beginGroup(event.pointerId);
    this.outPorts[type].send(event);
    this.outPorts[type].endGroup();
    if (type === 'up' || type === 'cancel' || type === 'leave') {
      _ref = this.outPorts;
      _results = [];
      for (name in _ref) {
        port = _ref[name];
        if (!port.isAttached()) {
          continue;
        }
        _results.push(port.disconnect());
      }
      return _results;
    }
  };

  return ListenPointer;

})(noflo.Component);

exports.getComponent = function() {
  return new ListenPointer;
};

});
require.register("noflo-noflo-interaction/components/ListenScroll.js", function(exports, require, module){
var ListenScroll, noflo,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ListenScroll = (function(_super) {
  __extends(ListenScroll, _super);

  ListenScroll.prototype.description = 'Listen to scroll events on the browser window';

  function ListenScroll() {
    this.scroll = __bind(this.scroll, this);
    var _this = this;
    this.inPorts = {
      start: new noflo.Port('bang'),
      stop: new noflo.Port('bang')
    };
    this.outPorts = {
      top: new noflo.Port('number'),
      bottom: new noflo.Port('number'),
      left: new noflo.Port('number'),
      right: new noflo.Port('number')
    };
    this.inPorts.start.on('data', function() {
      return _this.subscribe();
    });
    this.inPorts.stop.on('data', function() {
      return _this.unsubscribe();
    });
  }

  ListenScroll.prototype.subscribe = function() {
    return window.addEventListener('scroll', this.scroll, false);
  };

  ListenScroll.prototype.unsubscribe = function() {
    return window.removeEventListenr('scroll', this.scroll, false);
  };

  ListenScroll.prototype.scroll = function(event) {
    var bottom, left, right, top;
    top = window.scrollY;
    left = window.scrollX;
    if (this.outPorts.top.isAttached()) {
      this.outPorts.top.send(top);
      this.outPorts.top.disconnect();
    }
    if (this.outPorts.bottom.isAttached()) {
      bottom = top + window.innerHeight;
      this.outPorts.bottom.send(bottom);
      this.outPorts.bottom.disconnect();
    }
    if (this.outPorts.left.isAttached()) {
      this.outPorts.left.send(left);
      this.outPorts.left.disconnect();
    }
    if (this.outPorts.right.isAttached()) {
      right = left + window.innerWidth;
      this.outPorts.right.send(right);
      return this.outPorts.right.disconnect();
    }
  };

  ListenScroll.prototype.shutdown = function() {
    return this.unsubscribe();
  };

  return ListenScroll;

})(noflo.Component);

exports.getComponent = function() {
  return new ListenScroll;
};

});
require.register("noflo-noflo-interaction/components/ListenSpeech.js", function(exports, require, module){
var ListenSpeech, noflo,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ListenSpeech = (function(_super) {
  __extends(ListenSpeech, _super);

  ListenSpeech.prototype.description = 'Listen for user\'s microphone and recognize phrases';

  function ListenSpeech() {
    this.handleError = __bind(this.handleError, this);
    this.handleResult = __bind(this.handleResult, this);
    var _this = this;
    this.recognition = false;
    this.sent = [];
    this.inPorts = {
      start: new noflo.Port('bang'),
      stop: new noflo.Port('bang')
    };
    this.outPorts = {
      result: new noflo.Port('string'),
      error: new noflo.Port('object')
    };
    this.inPorts.start.on('data', function() {
      return _this.startListening();
    });
    this.inPorts.stop.on('data', function() {
      return _this.stopListening();
    });
  }

  ListenSpeech.prototype.startListening = function() {
    if (!window.webkitSpeechRecognition) {
      this.handleError(new Error('Speech recognition support not available'));
    }
    this.recognition = new window.webkitSpeechRecognition;
    this.recognition.continuous = true;
    this.recognition.start();
    this.outPorts.result.connect();
    this.recognition.onresult = this.handleResult;
    return this.recognition.onerror = this.handleError;
  };

  ListenSpeech.prototype.handleResult = function(event) {
    var idx, result, _i, _len, _ref, _results;
    _ref = event.results;
    _results = [];
    for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
      result = _ref[idx];
      if (!result.isFinal) {
        continue;
      }
      if (this.sent.indexOf(idx) !== -1) {
        continue;
      }
      this.outPorts.result.send(result[0].transcript);
      _results.push(this.sent.push(idx));
    }
    return _results;
  };

  ListenSpeech.prototype.handleError = function(error) {
    if (this.outPorts.error.isAttached()) {
      this.outPorts.error.send(error);
      this.outPorts.error.disconnect();
      return;
    }
    throw error;
  };

  ListenSpeech.prototype.stopListening = function() {
    if (!this.recognition) {
      return;
    }
    this.outPorts.result.disconnect();
    this.recognition.stop();
    this.recognition = null;
    return this.sent = [];
  };

  ListenSpeech.prototype.shutdown = function() {
    return this.stopListening();
  };

  return ListenSpeech;

})(noflo.Component);

exports.getComponent = function() {
  return new ListenSpeech;
};

});
require.register("noflo-noflo-interaction/components/ListenTouch.js", function(exports, require, module){
var ListenTouch, noflo,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ListenTouch = (function(_super) {
  __extends(ListenTouch, _super);

  ListenTouch.prototype.description = 'Listen to touch events on a DOM element';

  function ListenTouch() {
    this.touchend = __bind(this.touchend, this);
    this.touchmove = __bind(this.touchmove, this);
    this.touchstart = __bind(this.touchstart, this);
    var _this = this;
    this.inPorts = {
      element: new noflo.Port('object')
    };
    this.outPorts = {
      start: new noflo.ArrayPort('object'),
      movex: new noflo.ArrayPort('number'),
      movey: new noflo.ArrayPort('number'),
      end: new noflo.ArrayPort('object')
    };
    this.inPorts.element.on('data', function(element) {
      return _this.subscribe(element);
    });
  }

  ListenTouch.prototype.subscribe = function(element) {
    element.addEventListener('touchstart', this.touchstart, false);
    element.addEventListener('touchmove', this.touchmove, false);
    return element.addEventListener('touchend', this.touchend, false);
  };

  ListenTouch.prototype.touchstart = function(event) {
    var idx, touch, _i, _len, _ref;
    event.preventDefault();
    event.stopPropagation();
    if (!event.changedTouches) {
      return;
    }
    if (!event.changedTouches.length) {
      return;
    }
    _ref = event.changedTouches;
    for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
      touch = _ref[idx];
      this.outPorts.start.beginGroup(idx);
      this.outPorts.start.send(event);
      this.outPorts.start.endGroup();
    }
    return this.outPorts.start.disconnect();
  };

  ListenTouch.prototype.touchmove = function(event) {
    var idx, touch, _i, _len, _ref, _results;
    event.preventDefault();
    event.stopPropagation();
    if (!event.changedTouches) {
      return;
    }
    if (!event.changedTouches.length) {
      return;
    }
    _ref = event.changedTouches;
    _results = [];
    for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
      touch = _ref[idx];
      this.outPorts.movex.beginGroup(idx);
      this.outPorts.movex.send(touch.pageX);
      this.outPorts.movex.endGroup();
      this.outPorts.movey.beginGroup(idx);
      this.outPorts.movey.send(touch.pageY);
      _results.push(this.outPorts.movey.endGroup());
    }
    return _results;
  };

  ListenTouch.prototype.touchend = function(event) {
    var idx, touch, _i, _len, _ref;
    event.preventDefault();
    event.stopPropagation();
    if (!event.changedTouches) {
      return;
    }
    if (!event.changedTouches.length) {
      return;
    }
    if (this.outPorts.movex.isConnected()) {
      this.outPorts.movex.disconnect();
    }
    if (this.outPorts.movey.isConnected()) {
      this.outPorts.movey.disconnect();
    }
    _ref = event.changedTouches;
    for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
      touch = _ref[idx];
      this.outPorts.end.beginGroup(idx);
      this.outPorts.end.send(event);
      this.outPorts.end.endGroup();
    }
    return this.outPorts.end.disconnect();
  };

  return ListenTouch;

})(noflo.Component);

exports.getComponent = function() {
  return new ListenTouch;
};

});
require.register("noflo-noflo-interaction/components/SetHash.js", function(exports, require, module){
var SetHash, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SetHash = (function(_super) {
  __extends(SetHash, _super);

  function SetHash() {
    var _this = this;
    this.inPorts = {
      hash: new noflo.ArrayPort('string')
    };
    this.outPorts = {
      out: new noflo.Port('string')
    };
    this.inPorts.hash.on('data', function(data) {
      window.location.hash = "#" + data;
      if (_this.outPorts.out.isAttached()) {
        return _this.outPorts.out.send(data);
      }
    });
    this.inPorts.hash.on('disconnect', function() {
      if (_this.outPorts.out.isAttached()) {
        return _this.outPorts.out.disconnect();
      }
    });
  }

  return SetHash;

})(noflo.Component);

exports.getComponent = function() {
  return new SetHash;
};

});
require.register("noflo-noflo-interaction/components/ReadCoordinates.js", function(exports, require, module){
var ReadCoordinates, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ReadCoordinates = (function(_super) {
  __extends(ReadCoordinates, _super);

  ReadCoordinates.prototype.description = 'Read the coordinates from a DOM event';

  function ReadCoordinates() {
    var _this = this;
    this.inPorts = {
      event: new noflo.Port('object')
    };
    this.outPorts = {
      screen: new noflo.Port('object'),
      client: new noflo.Port('object'),
      page: new noflo.Port('object')
    };
    this.inPorts.event.on('begingroup', function(group) {
      if (_this.outPorts.screen.isAttached()) {
        _this.outPorts.screen.beginGroup(group);
      }
      if (_this.outPorts.client.isAttached()) {
        _this.outPorts.client.beginGroup(group);
      }
      if (_this.outPorts.page.isAttached()) {
        return _this.outPorts.page.beginGroup(group);
      }
    });
    this.inPorts.event.on('data', function(data) {
      return _this.read(data);
    });
    this.inPorts.event.on('endgroup', function() {
      if (_this.outPorts.screen.isAttached()) {
        _this.outPorts.screen.endGroup();
      }
      if (_this.outPorts.client.isAttached()) {
        _this.outPorts.client.endGroup();
      }
      if (_this.outPorts.page.isAttached()) {
        return _this.outPorts.page.endGroup();
      }
    });
    this.inPorts.event.on('disconnect', function() {
      if (_this.outPorts.screen.isAttached()) {
        _this.outPorts.screen.disconnect();
      }
      if (_this.outPorts.client.isAttached()) {
        _this.outPorts.client.disconnect();
      }
      if (_this.outPorts.page.isAttached()) {
        return _this.outPorts.page.disconnect();
      }
    });
  }

  ReadCoordinates.prototype.read = function(event) {
    if (!event) {
      return;
    }
    if (this.outPorts.screen.isAttached() && event.screenX !== void 0) {
      this.outPorts.screen.send({
        x: event.screenX,
        y: event.screenY
      });
    }
    if (this.outPorts.client.isAttached() && event.clientX !== void 0) {
      this.outPorts.client.send({
        x: event.clientX,
        y: event.clientY
      });
    }
    if (this.outPorts.page.isAttached() && event.pageX !== void 0) {
      return this.outPorts.page.send({
        x: event.pageX,
        y: event.pageY
      });
    }
  };

  return ReadCoordinates;

})(noflo.Component);

exports.getComponent = function() {
  return new ReadCoordinates;
};

});
require.register("noflo-noflo-groups/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of groups.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-groups/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-groups","description":"Group Utilities for NoFlo","keywords":["noflo","groups","utilities"],"author":"Kenneth Kan <kenhkan@gmail.com>","version":"0.1.0","repo":"kenhkan/groups","dependencies":{"component/underscore":"*","noflo/noflo":"*"},"scripts":["components/ReadGroups.coffee","components/RemoveGroups.coffee","components/Regroup.coffee","components/Group.coffee","components/GroupZip.coffee","components/FilterByGroup.coffee","components/Objectify.coffee","components/ReadGroup.coffee","components/SendByGroup.coffee","components/CollectGroups.coffee","components/CollectObject.coffee","components/FirstGroup.coffee","components/MapGroup.coffee","components/MergeGroups.coffee","components/GroupByObjectKey.coffee","index.js"],"json":["component.json"],"noflo":{"icon":"tags","components":{"ReadGroups":"components/ReadGroups.coffee","RemoveGroups":"components/RemoveGroups.coffee","Regroup":"components/Regroup.coffee","Group":"components/Group.coffee","GroupZip":"components/GroupZip.coffee","FilterByGroup":"components/FilterByGroup.coffee","Objectify":"components/Objectify.coffee","ReadGroup":"components/ReadGroup.coffee","SendByGroup":"components/SendByGroup.coffee","CollectGroups":"components/CollectGroups.coffee","CollectObject":"components/CollectObject.coffee","FirstGroup":"components/FirstGroup.coffee","MapGroup":"components/MapGroup.coffee","MergeGroups":"components/MergeGroups.coffee","GroupByObjectKey":"components/GroupByObjectKey.coffee"}}}');
});
require.register("noflo-noflo-groups/components/ReadGroups.js", function(exports, require, module){
var ReadGroups, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore');

ReadGroups = (function(_super) {
  __extends(ReadGroups, _super);

  function ReadGroups() {
    var _this = this;
    this.strip = false;
    this.threshold = Infinity;
    this.inPorts = {
      "in": new noflo.ArrayPort,
      strip: new noflo.Port,
      threshold: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port,
      group: new noflo.Port
    };
    this.inPorts.threshold.on('data', function(threshold) {
      return _this.threshold = parseInt(threshold);
    });
    this.inPorts.strip.on('data', function(strip) {
      return _this.strip = strip === 'true';
    });
    this.inPorts["in"].on('connect', function() {
      _this.count = 0;
      return _this.groups = [];
    });
    this.inPorts["in"].on('begingroup', function(group) {
      var beginGroup;
      beginGroup = function() {
        _this.groups.push(group);
        if (_this.outPorts.out.isAttached()) {
          return _this.outPorts.out.beginGroup(group);
        }
      };
      if (_this.count >= _this.threshold) {
        return beginGroup(group);
      } else {
        _this.outPorts.group.send(group);
        if (!_this.strip) {
          beginGroup(group);
        }
        return _this.count++;
      }
    });
    this.inPorts["in"].on('endgroup', function(group) {
      if (group === _.last(_this.groups)) {
        _this.groups.pop();
        if (_this.outPorts.out.isAttached()) {
          return _this.outPorts.out.endGroup();
        }
      }
    });
    this.inPorts["in"].on('data', function(data) {
      if (_this.outPorts.out.isAttached()) {
        return _this.outPorts.out.send(data);
      }
    });
    this.inPorts["in"].on('disconnect', function() {
      if (_this.outPorts.out.isAttached()) {
        _this.outPorts.out.disconnect();
      }
      return _this.outPorts.group.disconnect();
    });
  }

  return ReadGroups;

})(noflo.Component);

exports.getComponent = function() {
  return new ReadGroups;
};

});
require.register("noflo-noflo-groups/components/RemoveGroups.js", function(exports, require, module){
var RemoveGroups, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

RemoveGroups = (function(_super) {
  __extends(RemoveGroups, _super);

  RemoveGroups.prototype.description = "Remove a group given a string or a regex string";

  function RemoveGroups() {
    var _this = this;
    this.regexp = null;
    this.inPorts = {
      "in": new noflo.Port,
      regexp: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.regexp.on("data", function(regexp) {
      return _this.regexp = new RegExp(regexp);
    });
    this.inPorts["in"].on("begingroup", function(group) {
      if ((_this.regexp != null) && (group.match(_this.regexp) == null)) {
        return _this.outPorts.out.beginGroup(group);
      }
    });
    this.inPorts["in"].on("data", function(data) {
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on("endgroup", function(group) {
      if ((_this.regexp != null) && (group.match(_this.regexp) == null)) {
        return _this.outPorts.out.endGroup();
      }
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return RemoveGroups;

})(noflo.Component);

exports.getComponent = function() {
  return new RemoveGroups;
};

});
require.register("noflo-noflo-groups/components/Regroup.js", function(exports, require, module){
var Regroup, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

Regroup = (function(_super) {
  __extends(Regroup, _super);

  Regroup.prototype.description = "Forward all the data IPs, strip all groups, and replace  them with groups from another connection";

  function Regroup() {
    var _this = this;
    this.groups = [];
    this.inPorts = {
      "in": new noflo.Port,
      group: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.group.on("connect", function() {
      return _this.groups = [];
    });
    this.inPorts.group.on("data", function(group) {
      return _this.groups.push(group);
    });
    this.inPorts["in"].on("connect", function() {
      var group, _i, _len, _ref, _results;
      _ref = _this.groups;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
        _results.push(_this.outPorts.out.beginGroup(group));
      }
      return _results;
    });
    this.inPorts["in"].on("data", function(data) {
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on("disconnect", function() {
      var group, _i, _len, _ref;
      _ref = _this.groups;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
        _this.outPorts.out.endGroup();
      }
      return _this.outPorts.out.disconnect();
    });
  }

  return Regroup;

})(noflo.Component);

exports.getComponent = function() {
  return new Regroup;
};

});
require.register("noflo-noflo-groups/components/Group.js", function(exports, require, module){
var Group, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

Group = (function(_super) {
  __extends(Group, _super);

  function Group() {
    var _this = this;
    this.newGroups = [];
    this.inPorts = {
      "in": new noflo.Port,
      group: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("connect", function() {
      var group, _i, _len, _ref, _results;
      _ref = _this.newGroups;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
        _results.push(_this.outPorts.out.beginGroup(group));
      }
      return _results;
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      var group, _i, _len, _ref;
      _ref = _this.newGroups;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
        _this.outPorts.out.endGroup();
      }
      return _this.outPorts.out.disconnect();
    });
    this.inPorts.group.on("connect", function() {
      return _this.newGroups = [];
    });
    this.inPorts.group.on("data", function(group) {
      return _this.newGroups.push(group);
    });
  }

  return Group;

})(noflo.Component);

exports.getComponent = function() {
  return new Group;
};

});
require.register("noflo-noflo-groups/components/GroupZip.js", function(exports, require, module){
var GroupZip, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

GroupZip = (function(_super) {
  __extends(GroupZip, _super);

  function GroupZip() {
    var _this = this;
    this.newGroups = [];
    this.inPorts = {
      "in": new noflo.Port,
      group: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("connect", function() {
      return _this.count = 0;
    });
    this.inPorts["in"].on("data", function(data) {
      _this.outPorts.out.beginGroup(_this.newGroups[_this.count++]);
      _this.outPorts.out.send(data);
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
    this.inPorts.group.on("connect", function() {
      return _this.newGroups = [];
    });
    this.inPorts.group.on("data", function(group) {
      return _this.newGroups.push(group);
    });
  }

  return GroupZip;

})(noflo.Component);

exports.getComponent = function() {
  return new GroupZip;
};

});
require.register("noflo-noflo-groups/components/FilterByGroup.js", function(exports, require, module){
var FilterByGroup, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

FilterByGroup = (function(_super) {
  __extends(FilterByGroup, _super);

  FilterByGroup.prototype.description = "Given a RegExp string, filter out groups that do not  match and their children data packets/groups. Forward only the content  of the matching group.";

  function FilterByGroup() {
    var _this = this;
    this.regexp = null;
    this.matchedLevel = null;
    this.inPorts = {
      "in": new noflo.Port,
      regexp: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port,
      group: new noflo.Port,
      empty: new noflo.Port
    };
    this.inPorts.regexp.on("data", function(regexp) {
      return _this.regexp = new RegExp(regexp);
    });
    this.inPorts["in"].on("connect", function() {
      _this.level = 0;
      return _this.hasContent = false;
    });
    this.inPorts["in"].on("begingroup", function(group) {
      if (_this.matchedLevel != null) {
        _this.outPorts.out.beginGroup(group);
      }
      _this.level++;
      if ((_this.matchedLevel == null) && (_this.regexp != null) && (group.match(_this.regexp) != null)) {
        _this.matchedLevel = _this.level;
        if (_this.outPorts.group.isAttached()) {
          return _this.outPorts.group.send(group);
        }
      }
    });
    this.inPorts["in"].on("data", function(data) {
      if (_this.matchedLevel != null) {
        _this.hasContent = true;
        return _this.outPorts.out.send(data);
      }
    });
    this.inPorts["in"].on("endgroup", function(group) {
      if (_this.matchedLevel === _this.level) {
        _this.matchedLevel = null;
      }
      if (_this.matchedLevel != null) {
        _this.outPorts.out.endGroup();
      }
      return _this.level--;
    });
    this.inPorts["in"].on("disconnect", function() {
      if (!_this.hasContent && _this.outPorts.empty.isAttached()) {
        _this.outPorts.empty.send(null);
        _this.outPorts.empty.disconnect();
      }
      if (_this.outPorts.group.isAttached()) {
        _this.outPorts.group.disconnect();
      }
      return _this.outPorts.out.disconnect();
    });
  }

  return FilterByGroup;

})(noflo.Component);

exports.getComponent = function() {
  return new FilterByGroup;
};

});
require.register("noflo-noflo-groups/components/Objectify.js", function(exports, require, module){
var Objectify, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Objectify = (function(_super) {
  __extends(Objectify, _super);

  Objectify.prototype.description = "specify a regexp string, use the first match as the key  of an object containing the data";

  function Objectify() {
    var _this = this;
    this.regexp = null;
    this.match = null;
    this.inPorts = {
      "in": new noflo.Port,
      regexp: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.regexp.on("data", function(regexp) {
      return _this.regexp = new RegExp(regexp);
    });
    this.inPorts["in"].on("begingroup", function(group) {
      if ((_this.regexp != null) && (group.match(_this.regexp) != null)) {
        _this.match = _.first(group.match(_this.regexp));
      }
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var d;
      if (_this.match != null) {
        d = data;
        data = {};
        data[_this.match] = d;
      }
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Objectify;

})(noflo.Component);

exports.getComponent = function() {
  return new Objectify;
};

});
require.register("noflo-noflo-groups/components/ReadGroup.js", function(exports, require, module){
var ReadGroup, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ReadGroup = (function(_super) {
  __extends(ReadGroup, _super);

  function ReadGroup() {
    var _this = this;
    this.groups = [];
    this.inPorts = {
      "in": new noflo.ArrayPort
    };
    this.outPorts = {
      out: new noflo.Port,
      group: new noflo.Port
    };
    this.inPorts["in"].on('begingroup', function(group) {
      _this.groups.push(group);
      _this.outPorts.group.beginGroup(group);
      if (_this.outPorts.out.isAttached()) {
        return _this.outPorts.out.beginGroup(group);
      }
    });
    this.inPorts["in"].on('data', function(data) {
      if (_this.outPorts.out.isAttached()) {
        _this.outPorts.out.send(data);
      }
      if (!_this.groups.length) {
        return;
      }
      return _this.outPorts.group.send(_this.groups.join(':'));
    });
    this.inPorts["in"].on('endgroup', function() {
      _this.groups.pop();
      _this.outPorts.group.endGroup();
      if (_this.outPorts.out.isAttached()) {
        return _this.outPorts.out.endGroup();
      }
    });
    this.inPorts["in"].on('disconnect', function() {
      _this.outPorts.out.disconnect();
      return _this.outPorts.group.disconnect();
    });
  }

  return ReadGroup;

})(noflo.Component);

exports.getComponent = function() {
  return new ReadGroup;
};

});
require.register("noflo-noflo-groups/components/SendByGroup.js", function(exports, require, module){
var SendByGroup, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SendByGroup = (function(_super) {
  __extends(SendByGroup, _super);

  SendByGroup.prototype.description = 'Send packet held in "data" when receiving\
  matching set of groups in "in"';

  SendByGroup.prototype.icon = 'share-sign';

  function SendByGroup() {
    var _this = this;
    this.data = {};
    this.ungrouped = null;
    this.dataGroups = [];
    this.inGroups = [];
    this.inPorts = {
      "in": new noflo.Port('bang'),
      data: new noflo.Port('all')
    };
    this.outPorts = {
      out: new noflo.ArrayPort('all')
    };
    this.inPorts.data.on('begingroup', function(group) {
      return _this.dataGroups.push(group);
    });
    this.inPorts.data.on('data', function(data) {
      if (!_this.dataGroups.length) {
        _this.ungrouped = data;
        return;
      }
      return _this.data[_this.groupId(_this.dataGroups)] = data;
    });
    this.inPorts.data.on('endgroup', function() {
      return _this.dataGroups.pop();
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.inGroups.push(group);
    });
    this.inPorts["in"].on('data', function(data) {
      var id;
      if (!_this.inGroups.length) {
        if (_this.ungrouped !== null) {
          _this.send(_this.ungrouped);
        }
        return;
      }
      id = _this.groupId(_this.inGroups);
      if (!_this.data[id]) {
        return;
      }
      return _this.send(_this.data[id]);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.inGroups.pop();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  SendByGroup.prototype.groupId = function(groups) {
    return groups.join(':');
  };

  SendByGroup.prototype.send = function(data) {
    var group, _i, _j, _len, _len1, _ref, _ref1, _results;
    _ref = this.inGroups;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      group = _ref[_i];
      this.outPorts.out.beginGroup(group);
    }
    this.outPorts.out.send(data);
    _ref1 = this.inGroups;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      group = _ref1[_j];
      _results.push(this.outPorts.out.endGroup());
    }
    return _results;
  };

  return SendByGroup;

})(noflo.Component);

exports.getComponent = function() {
  return new SendByGroup;
};

});
require.register("noflo-noflo-groups/components/CollectGroups.js", function(exports, require, module){
var CollectGroups, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CollectGroups = (function(_super) {
  __extends(CollectGroups, _super);

  CollectGroups.prototype.description = 'Collect packets into object keyed by its groups';

  function CollectGroups() {
    var _this = this;
    this.data = {};
    this.groups = [];
    this.parents = [];
    this.inPorts = {
      "in": new noflo.Port('all')
    };
    this.outPorts = {
      out: new noflo.Port('object'),
      error: new noflo.Port('object')
    };
    this.inPorts["in"].on('connect', function() {
      return _this.data = {};
    });
    this.inPorts["in"].on('begingroup', function(group) {
      if (group === '$data') {
        _this.error('groups cannot be named \'$data\'');
        return;
      }
      _this.parents.push(_this.data);
      _this.groups.push(group);
      return _this.data = {};
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.setData(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      var data;
      data = _this.data;
      _this.data = _this.parents.pop();
      return _this.addChild(_this.data, _this.groups.pop(), data);
    });
    this.inPorts["in"].on('disconnect', function() {
      _this.outPorts.out.send(_this.data);
      return _this.outPorts.out.disconnect();
    });
  }

  CollectGroups.prototype.addChild = function(parent, child, data) {
    if (!(child in parent)) {
      return parent[child] = data;
    }
    if (Array.isArray(parent[child])) {
      return parent[child].push(data);
    }
    return parent[child] = [parent[child], data];
  };

  CollectGroups.prototype.setData = function(data) {
    var _base;
    if ((_base = this.data).$data == null) {
      _base.$data = [];
    }
    return this.data.$data.push(data);
  };

  CollectGroups.prototype.error = function(msg) {
    if (this.outPorts.error.isAttached()) {
      this.outPorts.error.send(new Error(msg));
      this.outPorts.error.disconnect();
      return;
    }
    throw new Error(msg);
  };

  return CollectGroups;

})(noflo.Component);

exports.getComponent = function() {
  return new CollectGroups;
};

});
require.register("noflo-noflo-groups/components/CollectObject.js", function(exports, require, module){
var CollectObject, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CollectObject = (function(_super) {
  __extends(CollectObject, _super);

  CollectObject.prototype.description = 'Collect packets to an object identified by keys organized\
  by connection';

  function CollectObject() {
    var _this = this;
    this.keys = [];
    this.allpackets = [];
    this.data = {};
    this.groups = {};
    this.inPorts = {
      keys: new noflo.ArrayPort('string'),
      allpackets: new noflo.ArrayPort('string'),
      collect: new noflo.ArrayPort('all'),
      release: new noflo.Port('bang'),
      clear: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('object')
    };
    this.inPorts.keys.on('data', function(key) {
      var keys, _i, _len, _results;
      keys = key.split(',');
      if (keys.length > 1) {
        _this.keys = [];
      }
      _results = [];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        _results.push(_this.keys.push(key));
      }
      return _results;
    });
    this.inPorts.allpackets.on('data', function(key) {
      var allpackets, _i, _len, _results;
      allpackets = key.split(',');
      if (allpackets.length > 1) {
        _this.keys = [];
      }
      _results = [];
      for (_i = 0, _len = allpackets.length; _i < _len; _i++) {
        key = allpackets[_i];
        _results.push(_this.allpackets.push(key));
      }
      return _results;
    });
    this.inPorts.collect.once('connect', function() {
      return _this.subscribeSockets();
    });
    this.inPorts.release.on('data', function() {
      return _this.release();
    });
    this.inPorts.release.on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
    this.inPorts.clear.on('data', function() {
      return _this.clear();
    });
  }

  CollectObject.prototype.release = function() {
    this.outPorts.out.send(this.data);
    return this.data = this.clone(this.data);
  };

  CollectObject.prototype.subscribeSockets = function() {
    var _this = this;
    return this.inPorts.collect.sockets.forEach(function(socket, idx) {
      return _this.subscribeSocket(socket, idx);
    });
  };

  CollectObject.prototype.subscribeSocket = function(socket, id) {
    var _this = this;
    socket.on('begingroup', function(group) {
      if (!_this.groups[id]) {
        _this.groups[id] = [];
      }
      return _this.groups[id].push(group);
    });
    socket.on('data', function(data) {
      var groupId;
      if (!_this.keys[id]) {
        return;
      }
      groupId = _this.groupId(_this.groups[id]);
      if (!_this.data[groupId]) {
        _this.data[groupId] = {};
      }
      if (_this.allpackets.indexOf(_this.keys[id]) !== -1) {
        if (!_this.data[groupId][_this.keys[id]]) {
          _this.data[groupId][_this.keys[id]] = [];
        }
        _this.data[groupId][_this.keys[id]].push(data);
        return;
      }
      return _this.data[groupId][_this.keys[id]] = data;
    });
    return socket.on('endgroup', function() {
      if (!_this.groups[id]) {
        return;
      }
      return _this.groups[id].pop();
    });
  };

  CollectObject.prototype.groupId = function(groups) {
    if (!groups.length) {
      return 'ungrouped';
    }
    return groups[0];
  };

  CollectObject.prototype.clone = function(data) {
    var groupName, groupedData, name, newData, value;
    newData = {};
    for (groupName in data) {
      groupedData = data[groupName];
      newData[groupName] = {};
      for (name in groupedData) {
        value = groupedData[name];
        if (!groupedData.hasOwnProperty(name)) {
          continue;
        }
        newData[groupName][name] = value;
      }
    }
    return newData;
  };

  CollectObject.prototype.clear = function() {
    this.data = {};
    return this.groups = {};
  };

  return CollectObject;

})(noflo.Component);

exports.getComponent = function() {
  return new CollectObject;
};

});
require.register("noflo-noflo-groups/components/FirstGroup.js", function(exports, require, module){
var FirstGroup, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

FirstGroup = (function(_super) {
  __extends(FirstGroup, _super);

  function FirstGroup() {
    var _this = this;
    this.depth = 0;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on('begingroup', function(group) {
      if (_this.depth === 0) {
        _this.outPorts.out.beginGroup(group);
      }
      return _this.depth++;
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on('endgroup', function(group) {
      _this.depth--;
      if (_this.depth === 0) {
        return _this.outPorts.out.endGroup();
      }
    });
    this.inPorts["in"].on('disconnect', function() {
      _this.depth = 0;
      return _this.outPorts.out.disconnect();
    });
  }

  return FirstGroup;

})(noflo.Component);

exports.getComponent = function() {
  return new FirstGroup;
};

});
require.register("noflo-noflo-groups/components/MapGroup.js", function(exports, require, module){
var MapGroup, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

MapGroup = (function(_super) {
  __extends(MapGroup, _super);

  function MapGroup() {
    var _this = this;
    this.map = {};
    this.regexps = {};
    this.inPorts = {
      map: new noflo.ArrayPort(),
      regexp: new noflo.ArrayPort(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.map.on('data', function(data) {
      return _this.prepareMap(data);
    });
    this.inPorts.regexp.on('data', function(data) {
      return _this.prepareRegExp(data);
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.mapGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  MapGroup.prototype.prepareMap = function(map) {
    var mapParts;
    if (typeof map === 'object') {
      this.map = map;
      return;
    }
    mapParts = map.split('=');
    return this.map[mapParts[0]] = mapParts[1];
  };

  MapGroup.prototype.prepareRegExp = function(map) {
    var mapParts;
    mapParts = map.split('=');
    return this.regexps[mapParts[0]] = mapParts[1];
  };

  MapGroup.prototype.mapGroup = function(group) {
    var expression, matched, regexp, replacement, _ref;
    if (this.map[group]) {
      this.outPorts.out.beginGroup(this.map[group]);
      return;
    }
    _ref = this.regexps;
    for (expression in _ref) {
      replacement = _ref[expression];
      regexp = new RegExp(expression);
      matched = regexp.exec(group);
      if (!matched) {
        continue;
      }
      group = group.replace(regexp, replacement);
    }
    return this.outPorts.out.beginGroup(group);
  };

  return MapGroup;

})(noflo.Component);

exports.getComponent = function() {
  return new MapGroup;
};

});
require.register("noflo-noflo-groups/components/MergeGroups.js", function(exports, require, module){
var MergeGroups, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore')._;

MergeGroups = (function(_super) {
  __extends(MergeGroups, _super);

  function MergeGroups() {
    var _this = this;
    this.groups = {};
    this.data = {};
    this.inPorts = {
      "in": new noflo.ArrayPort
    };
    this.outPorts = {
      out: new noflo.ArrayPort
    };
    this.inPorts["in"].on('begingroup', function(group, socket) {
      return _this.addGroup(socket, group);
    });
    this.inPorts["in"].on('data', function(data, socket) {
      _this.registerData(socket, data);
      return _this.checkBuffer(socket);
    });
    this.inPorts["in"].on('endgroup', function(group, socket) {
      _this.checkBuffer(socket);
      return _this.removeGroup(socket);
    });
    this.inPorts["in"].on('disconnect', function(socket, socketId) {
      return _this.checkBuffer(socketId);
    });
  }

  MergeGroups.prototype.addGroup = function(socket, group) {
    if (!this.groups[socket]) {
      this.groups[socket] = [];
    }
    return this.groups[socket].push(group);
  };

  MergeGroups.prototype.removeGroup = function(socket) {
    return this.groups[socket].pop();
  };

  MergeGroups.prototype.groupId = function(socket) {
    if (!this.groups[socket]) {
      return null;
    }
    return this.groups[socket].join(':');
  };

  MergeGroups.prototype.registerData = function(socket, data) {
    var id;
    id = this.groupId(socket);
    if (!id) {
      return;
    }
    if (!this.data[id]) {
      this.data[id] = {};
    }
    return this.data[id][socket] = data;
  };

  MergeGroups.prototype.checkBuffer = function(socket) {
    var id, socketId, _i, _len, _ref;
    id = this.groupId(socket);
    if (!id) {
      return;
    }
    if (!this.data[id]) {
      return;
    }
    _ref = this.inPorts["in"].sockets;
    for (socketId = _i = 0, _len = _ref.length; _i < _len; socketId = ++_i) {
      socket = _ref[socketId];
      if (!this.data[id][socketId]) {
        return;
      }
    }
    this.outPorts.out.beginGroup(id);
    this.outPorts.out.send(this.data[id]);
    this.outPorts.out.endGroup();
    this.outPorts.out.disconnect();
    return delete this.data[id];
  };

  return MergeGroups;

})(noflo.Component);

exports.getComponent = function() {
  return new MergeGroups;
};

});
require.register("noflo-noflo-groups/components/GroupByObjectKey.js", function(exports, require, module){
var GroupByObjectKey, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

GroupByObjectKey = (function(_super) {
  __extends(GroupByObjectKey, _super);

  function GroupByObjectKey() {
    var _this = this;
    this.data = [];
    this.key = null;
    this.inPorts = {
      "in": new noflo.Port(),
      key: new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts["in"].on('connect', function() {
      return _this.data = [];
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      if (_this.key) {
        return _this.getKey(data);
      }
      return _this.data.push(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      var data, _i, _len, _ref;
      if (!_this.data.length) {
        _this.outPorts.out.disconnect();
        return;
      }
      if (!_this.key) {
        return;
      }
      _ref = _this.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data = _ref[_i];
        _this.getKey(data);
      }
      return _this.outPorts.out.disconnect();
    });
    this.inPorts.key.on('data', function(data) {
      return _this.key = data;
    });
    this.inPorts.key.on('disconnect', function() {
      var data, _i, _len, _ref;
      if (!_this.data.length) {
        return;
      }
      _ref = _this.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data = _ref[_i];
        _this.getKey(data);
      }
      return _this.outPorts.out.disconnect();
    });
  }

  GroupByObjectKey.prototype.getKey = function(data) {
    var group;
    if (!this.key) {
      throw new Error('Key not defined');
    }
    if (typeof data !== 'object') {
      throw new Error('Data is not an object');
    }
    group = data[this.key];
    if (typeof data[this.key] !== 'string') {
      group = 'undefined';
    }
    if (typeof data[this.key] === 'boolean') {
      if (data[this.key]) {
        group = this.key;
      }
    }
    this.outPorts.out.beginGroup(group);
    this.outPorts.out.send(data);
    return this.outPorts.out.endGroup();
  };

  return GroupByObjectKey;

})(noflo.Component);

exports.getComponent = function() {
  return new GroupByObjectKey;
};

});
require.register("noflo-noflo-packets/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of packets.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-packets/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-packets","description":"The best project ever.","version":"0.0.8","author":"Kenneth Kan <kenhkan@gmail.com>","repo":"kenhkan/packets","keywords":[],"dependencies":{"noflo/noflo":"*","component/underscore":"*"},"scripts":["components/CountPackets.coffee","components/Unzip.coffee","components/Defaults.coffee","components/DoNotDisconnect.coffee","components/OnlyDisconnect.coffee","components/SplitPacket.coffee","components/Range.coffee","components/Flatten.coffee","components/Compact.coffee","components/Zip.coffee","components/SendWith.coffee","components/FilterPackets.coffee","components/FilterByValue.coffee","components/FilterByPosition.coffee","components/FilterPacket.coffee","components/UniquePacket.coffee","components/GroupByPacket.coffee","components/LastPacket.coffee","components/Counter.coffee","index.js"],"json":["component.json"],"noflo":{"components":{"CountPackets":"components/CountPackets.coffee","Unzip":"components/Unzip.coffee","Defaults":"components/Defaults.coffee","DoNotDisconnect":"components/DoNotDisconnect.coffee","OnlyDisconnect":"components/OnlyDisconnect.coffee","SplitPacket":"components/SplitPacket.coffee","Range":"components/Range.coffee","Flatten":"components/Flatten.coffee","Compact":"components/Compact.coffee","Zip":"components/Zip.coffee","SendWith":"components/SendWith.coffee","FilterPackets":"components/FilterPackets.coffee","FilterByValue":"components/FilterByValue.coffee","FilterByPosition":"components/FilterByPosition.coffee","FilterPacket":"components/FilterPacket.coffee","UniquePacket":"components/UniquePacket.coffee","GroupByPacket":"components/GroupByPacket.coffee","LastPacket":"components/LastPacket.coffee","Counter":"components/Counter.coffee"}}}');
});
require.register("noflo-noflo-packets/components/CountPackets.js", function(exports, require, module){
var CountPackets, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

CountPackets = (function(_super) {
  __extends(CountPackets, _super);

  CountPackets.prototype.description = "count number of data IPs";

  function CountPackets() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port,
      count: new noflo.Port
    };
    this.inPorts["in"].on("connect", function() {
      var count;
      _this.counts = [0];
      return count = _.last(_this.counts);
    });
    this.inPorts["in"].on("begingroup", function(group) {
      _this.counts.push(0);
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var count;
      _this.counts[_this.counts.length - 1]++;
      count = _.last(_this.counts);
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on("endgroup", function(group) {
      var count;
      count = _.last(_this.counts);
      _this.outPorts.count.send(count);
      _this.counts.pop();
      return _this.outPorts.out.endGroup(group);
    });
    this.inPorts["in"].on("disconnect", function() {
      var count;
      count = _.last(_this.counts);
      _this.outPorts.count.send(count);
      _this.outPorts.count.disconnect();
      return _this.outPorts.out.disconnect();
    });
  }

  return CountPackets;

})(noflo.Component);

exports.getComponent = function() {
  return new CountPackets;
};

});
require.register("noflo-noflo-packets/components/Unzip.js", function(exports, require, module){
var Unzip, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require("underscore");

noflo = require("noflo");

Unzip = (function(_super) {
  __extends(Unzip, _super);

  Unzip.prototype.description = "Send packets whose position upon receipt is even to the  EVEN port, otherwise the ODD port.";

  function Unzip() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      odd: new noflo.Port,
      even: new noflo.Port
    };
    this.inPorts["in"].on("connect", function(group) {
      return _this.count = 0;
    });
    this.inPorts["in"].on("data", function(data) {
      var port;
      _this.count++;
      port = _this.count % 2 === 0 ? "even" : "odd";
      return _this.outPorts[port].send(data);
    });
    this.inPorts["in"].on("disconnect", function() {
      _this.outPorts.odd.disconnect();
      return _this.outPorts.even.disconnect();
    });
  }

  return Unzip;

})(noflo.Component);

exports.getComponent = function() {
  return new Unzip;
};

});
require.register("noflo-noflo-packets/components/Defaults.js", function(exports, require, module){
var Defaults, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Defaults = (function(_super) {
  __extends(Defaults, _super);

  Defaults.prototype.description = "if incoming is short of the length of the default  packets, send the default packets.";

  function Defaults() {
    var _this = this;
    this.defaults = [];
    this.inPorts = {
      "in": new noflo.Port,
      "default": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["default"].on("connect", function() {
      return _this.defaults = [];
    });
    this.inPorts["default"].on("data", function(data) {
      return _this.defaults.push(data);
    });
    this.inPorts["in"].on("connect", function() {
      return _this.counts = [0];
    });
    this.inPorts["in"].on("begingroup", function(group) {
      _this.counts.push(0);
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var count;
      count = _.last(_this.counts);
      if (data == null) {
        data = _this.defaults[count];
      }
      _this.outPorts.out.send(data);
      return _this.counts[_this.counts.length - 1]++;
    });
    this.inPorts["in"].on("endgroup", function(group) {
      _this.padPackets(_.last(_this.counts));
      _this.counts.pop();
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      _this.padPackets(_this.counts[0]);
      return _this.outPorts.out.disconnect();
    });
  }

  Defaults.prototype.padPackets = function(count) {
    var _results;
    _results = [];
    while (count < this.defaults.length) {
      this.outPorts.out.send(this.defaults[count]);
      _results.push(count++);
    }
    return _results;
  };

  return Defaults;

})(noflo.Component);

exports.getComponent = function() {
  return new Defaults;
};

});
require.register("noflo-noflo-packets/components/DoNotDisconnect.js", function(exports, require, module){
var DoNotDisconnect, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

DoNotDisconnect = (function(_super) {
  __extends(DoNotDisconnect, _super);

  DoNotDisconnect.prototype.description = "forwards everything but never disconnect";

  function DoNotDisconnect() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
  }

  return DoNotDisconnect;

})(noflo.Component);

exports.getComponent = function() {
  return new DoNotDisconnect;
};

});
require.register("noflo-noflo-packets/components/OnlyDisconnect.js", function(exports, require, module){
var OnlyDisconnect, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

OnlyDisconnect = (function(_super) {
  __extends(OnlyDisconnect, _super);

  OnlyDisconnect.prototype.description = "the inverse of DoNotDisconnect";

  function OnlyDisconnect() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("disconnect", function() {
      _this.outPorts.out.connect();
      return _this.outPorts.out.disconnect();
    });
  }

  return OnlyDisconnect;

})(noflo.Component);

exports.getComponent = function() {
  return new OnlyDisconnect;
};

});
require.register("noflo-noflo-packets/components/SplitPacket.js", function(exports, require, module){
var SplitPacket, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

SplitPacket = (function(_super) {
  __extends(SplitPacket, _super);

  SplitPacket.prototype.description = "splits each incoming packet into its own connection";

  function SplitPacket() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("connect", function() {
      return _this.groups = [];
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.groups.push(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var group, _i, _j, _len, _len1, _ref, _ref1;
      _this.outPorts.out.connect();
      _ref = _this.groups;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
        _this.outPorts.out.beginGroup(group);
      }
      _this.outPorts.out.send(data);
      _ref1 = _this.groups;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        group = _ref1[_j];
        _this.outPorts.out.endGroup();
      }
      return _this.outPorts.out.disconnect();
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.groups.pop();
    });
  }

  return SplitPacket;

})(noflo.Component);

exports.getComponent = function() {
  return new SplitPacket;
};

});
require.register("noflo-noflo-packets/components/Range.js", function(exports, require, module){
var Range, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Range = (function(_super) {
  __extends(Range, _super);

  Range.prototype.description = "only forward a specified number of packets in a  connection";

  function Range() {
    var _this = this;
    this.start = -Infinity;
    this.end = +Infinity;
    this.length = +Infinity;
    this.inPorts = {
      "in": new noflo.Port,
      start: new noflo.Port,
      end: new noflo.Port,
      length: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.start.on("data", function(start) {
      return _this.start = parseInt(start);
    });
    this.inPorts.end.on("data", function(end) {
      return _this.end = parseInt(end);
    });
    this.inPorts.length.on("data", function(length) {
      return _this.length = parseInt(length);
    });
    this.inPorts["in"].on("connect", function() {
      _this.totalCount = 0;
      return _this.sentCount = 0;
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      _this.totalCount++;
      if (_this.totalCount > _this.start && _this.totalCount < _this.end && _this.sentCount < _this.length) {
        _this.sentCount++;
        return _this.outPorts.out.send(data);
      }
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Range;

})(noflo.Component);

exports.getComponent = function() {
  return new Range;
};

});
require.register("noflo-noflo-packets/components/Flatten.js", function(exports, require, module){
var Flatten, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Flatten = (function(_super) {
  __extends(Flatten, _super);

  Flatten.prototype.description = "Flatten the IP structure but preserve all groups (i.e.    all groups are at the top level)";

  function Flatten() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("connect", function() {
      _this.groups = [];
      return _this.cache = [];
    });
    this.inPorts["in"].on("begingroup", function(group) {
      var loc;
      loc = _this.locate();
      loc[group] = [];
      return _this.groups.push(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var loc;
      loc = _this.locate();
      return loc.push(data);
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.groups.pop();
    });
    this.inPorts["in"].on("disconnect", function() {
      var nodes, packets, _ref;
      _ref = _this.flatten(_this.cache), packets = _ref.packets, nodes = _ref.nodes;
      _this.flush(_.extend(packets, nodes));
      return _this.outPorts.out.disconnect();
    });
  }

  Flatten.prototype.locate = function() {
    return _.reduce(this.groups, (function(loc, group) {
      return loc[group];
    }), this.cache);
  };

  Flatten.prototype.flatten = function(node) {
    var group, groups, nodes, packets, subnodes, _i, _len, _ref;
    groups = this.getNonArrayKeys(node);
    if (groups.length === 0) {
      return {
        packets: node,
        nodes: {}
      };
    } else {
      subnodes = {};
      for (_i = 0, _len = groups.length; _i < _len; _i++) {
        group = groups[_i];
        _ref = this.flatten(node[group]), packets = _ref.packets, nodes = _ref.nodes;
        delete node[group];
        subnodes[group] = packets;
        _.extend(subnodes, nodes);
      }
      return {
        packets: node,
        nodes: subnodes
      };
    }
  };

  Flatten.prototype.getNonArrayKeys = function(node) {
    return _.compact(_.filter(_.keys(node), function(key) {
      return isNaN(parseInt(key));
    }));
  };

  Flatten.prototype.flush = function(node) {
    var group, packet, _i, _j, _len, _len1, _ref, _results;
    for (_i = 0, _len = node.length; _i < _len; _i++) {
      packet = node[_i];
      this.outPorts.out.send(packet);
    }
    _ref = this.getNonArrayKeys(node);
    _results = [];
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      group = _ref[_j];
      this.outPorts.out.beginGroup(group);
      this.flush(node[group]);
      _results.push(this.outPorts.out.endGroup());
    }
    return _results;
  };

  return Flatten;

})(noflo.Component);

exports.getComponent = function() {
  return new Flatten;
};

});
require.register("noflo-noflo-packets/components/Compact.js", function(exports, require, module){
var Compact, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Compact = (function(_super) {
  __extends(Compact, _super);

  Compact.prototype.description = "Remove null";

  function Compact() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      if (data == null) {
        return;
      }
      if (data.length === 0) {
        return;
      }
      if (_.isObject(data) && _.isEmpty(data)) {
        return;
      }
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Compact;

})(noflo.Component);

exports.getComponent = function() {
  return new Compact;
};

});
require.register("noflo-noflo-packets/components/Zip.js", function(exports, require, module){
var Zip, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Zip = (function(_super) {
  __extends(Zip, _super);

  Zip.prototype.description = "zip through multiple IPs and output a series of zipped  IPs just like how _.zip() works in Underscore.js";

  function Zip() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("connect", function(group) {
      return _this.packets = [];
    });
    this.inPorts["in"].on("data", function(data) {
      if (_.isArray(data)) {
        return _this.packets.push(data);
      }
    });
    this.inPorts["in"].on("disconnect", function() {
      if (_.isEmpty(_this.packets)) {
        _this.outPorts.out.send([]);
      } else {
        _this.outPorts.out.send(_.zip.apply(_, _this.packets));
      }
      return _this.outPorts.out.disconnect();
    });
  }

  return Zip;

})(noflo.Component);

exports.getComponent = function() {
  return new Zip;
};

});
require.register("noflo-noflo-packets/components/SendWith.js", function(exports, require, module){
var SendWith, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

SendWith = (function(_super) {
  __extends(SendWith, _super);

  SendWith.prototype.description = "Always send the specified packets with incoming packets.";

  function SendWith() {
    var _this = this;
    this["with"] = [];
    this.inPorts = {
      "in": new noflo.Port,
      "with": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["with"].on("connect", function() {
      return _this["with"] = [];
    });
    this.inPorts["with"].on("data", function(data) {
      return _this["with"].push(data);
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      var packet, _i, _len, _ref;
      _ref = _this["with"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        packet = _ref[_i];
        _this.outPorts.out.send(packet);
      }
      return _this.outPorts.out.disconnect();
    });
  }

  return SendWith;

})(noflo.Component);

exports.getComponent = function() {
  return new SendWith;
};

});
require.register("noflo-noflo-packets/components/FilterPackets.js", function(exports, require, module){
var FilterPackets, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

FilterPackets = (function(_super) {
  __extends(FilterPackets, _super);

  FilterPackets.prototype.description = "Filter packets matching some RegExp strings";

  function FilterPackets() {
    var _this = this;
    this.regexps = [];
    this.inPorts = {
      "in": new noflo.Port,
      regexp: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port,
      missed: new noflo.Port,
      passthru: new noflo.Port
    };
    this.inPorts.regexp.on("connect", function() {
      return _this.regexps = [];
    });
    this.inPorts.regexp.on("data", function(regexp) {
      return _this.regexps.push(new RegExp(regexp));
    });
    this.inPorts["in"].on("data", function(data) {
      if (_.any(_this.regexps, (function(regexp) {
        return data.match(regexp);
      }))) {
        _this.outPorts.out.send(data);
      } else {
        _this.outPorts.missed.send(data);
      }
      if (_this.outPorts.passthru.isAttached()) {
        return _this.outPorts.passthru.send(data);
      }
    });
    this.inPorts["in"].on("disconnect", function() {
      _this.outPorts.out.disconnect();
      _this.outPorts.missed.disconnect();
      if (_this.outPorts.passthru.isAttached()) {
        return _this.outPorts.passthru.disconnect();
      }
    });
  }

  return FilterPackets;

})(noflo.Component);

exports.getComponent = function() {
  return new FilterPackets;
};

});
require.register("noflo-noflo-packets/components/FilterByValue.js", function(exports, require, module){
var FilterByValue, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

FilterByValue = (function(_super) {
  __extends(FilterByValue, _super);

  FilterByValue.prototype.description = "Filter packets based on their value";

  function FilterByValue() {
    var _this = this;
    this.filterValue = null;
    this.inPorts = {
      "in": new noflo.Port,
      filtervalue: new noflo.Port
    };
    this.outPorts = {
      lower: new noflo.Port,
      higher: new noflo.Port,
      equal: new noflo.Port
    };
    this.inPorts.filtervalue.on('data', function(data) {
      return _this.filterValue = data;
    });
    this.inPorts["in"].on('data', function(data) {
      if (data < _this.filterValue) {
        return _this.outPorts.lower.send(data);
      } else if (data > _this.filterValue) {
        return _this.outPorts.higher.send(data);
      } else if (data === _this.filterValue) {
        return _this.outPorts.equal.send(data);
      }
    });
    this.inPorts["in"].on('disconnect', function() {
      if (_this.outPorts.lower.isConnected()) {
        _this.outPorts.lower.disconnect();
      }
      if (_this.outPorts.higher.isConnected()) {
        _this.outPorts.higher.disconnect();
      }
      if (_this.outPorts.equal.isConnected()) {
        return _this.outPorts.equal.disconnect();
      }
    });
  }

  return FilterByValue;

})(noflo.Component);

exports.getComponent = function() {
  return new FilterByValue;
};

});
require.register("noflo-noflo-packets/components/FilterByPosition.js", function(exports, require, module){
var FilterByPosition, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

FilterByPosition = (function(_super) {
  __extends(FilterByPosition, _super);

  FilterByPosition.prototype.description = "Filter packets based on their positions";

  function FilterByPosition() {
    var _this = this;
    this.filters = [];
    this.inPorts = {
      "in": new noflo.Port,
      filter: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.filter.on("connect", function() {
      return _this.filters = [];
    });
    this.inPorts.filter.on("data", function(filter) {
      return _this.filters.push(filter);
    });
    this.inPorts["in"].on("connect", function() {
      return _this.count = 0;
    });
    this.inPorts["in"].on("data", function(data) {
      if (_this.filters[_this.count]) {
        _this.outPorts.out.send(data);
      }
      return _this.count++;
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return FilterByPosition;

})(noflo.Component);

exports.getComponent = function() {
  return new FilterByPosition;
};

});
require.register("noflo-noflo-packets/components/FilterPacket.js", function(exports, require, module){
var FilterPacket, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

FilterPacket = (function(_super) {
  __extends(FilterPacket, _super);

  function FilterPacket() {
    var _this = this;
    this.regexps = [];
    this.inPorts = {
      regexp: new noflo.ArrayPort(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port(),
      missed: new noflo.Port()
    };
    this.inPorts.regexp.on('data', function(data) {
      return _this.regexps.push(data);
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      if (_this.regexps.length) {
        return _this.filterData(data);
      }
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      _this.outPorts.out.disconnect();
      return _this.outPorts.missed.disconnect();
    });
  }

  FilterPacket.prototype.filterData = function(data) {
    var expression, match, regexp, _i, _len, _ref;
    match = false;
    _ref = this.regexps;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      expression = _ref[_i];
      regexp = new RegExp(expression);
      if (!regexp.exec(data)) {
        continue;
      }
      match = true;
    }
    if (!match) {
      if (this.outPorts.missed.isAttached()) {
        this.outPorts.missed.send(data);
      }
      return;
    }
    return this.outPorts.out.send(data);
  };

  return FilterPacket;

})(noflo.Component);

exports.getComponent = function() {
  return new FilterPacket;
};

});
require.register("noflo-noflo-packets/components/UniquePacket.js", function(exports, require, module){
var UniquePacket, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

UniquePacket = (function(_super) {
  __extends(UniquePacket, _super);

  function UniquePacket() {
    var _this = this;
    this.seen = [];
    this.groups = [];
    this.inPorts = {
      "in": new noflo.Port('all'),
      clear: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('all'),
      duplicate: new noflo.Port('all')
    };
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.groups.push(group);
    });
    this.inPorts["in"].on('data', function(data) {
      var group, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (!_this.unique(data)) {
        if (!_this.outPorts.duplicate.isAttached()) {
          return;
        }
        _this.outPorts.duplicate.send(data);
        return;
      }
      _ref = _this.groups;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
        _this.outPorts.out.beginGroup(group);
      }
      _this.outPorts.out.send(data);
      _ref1 = _this.groups;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        group = _ref1[_j];
        _results.push(_this.outPorts.out.endGroup());
      }
      return _results;
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.groups.pop();
    });
    this.inPorts["in"].on('disconnect', function() {
      _this.outPorts.out.disconnect();
      if (!_this.outPorts.duplicate.isAttached()) {
        return;
      }
      return _this.outPorts.duplicate.disconnect();
    });
    this.inPorts.clear.on('data', function() {
      _this.seen = [];
      return _this.groups = [];
    });
  }

  UniquePacket.prototype.unique = function(packet) {
    if (this.seen.indexOf(packet) !== -1) {
      return false;
    }
    this.seen.push(packet);
    return true;
  };

  return UniquePacket;

})(noflo.Component);

exports.getComponent = function() {
  return new UniquePacket;
};

});
require.register("noflo-noflo-packets/components/GroupByPacket.js", function(exports, require, module){
var GroupByPacket, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

GroupByPacket = (function(_super) {
  __extends(GroupByPacket, _super);

  function GroupByPacket() {
    var _this = this;
    this.packets = 0;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on('begingroup', function(group) {
      _this.outPorts.out.beginGroup(group);
      return _this.packets = 0;
    });
    this.inPorts["in"].on('data', function(data) {
      _this.outPorts.out.beginGroup(_this.packets);
      _this.outPorts.out.send(data);
      _this.outPorts.out.endGroup();
      return _this.packets++;
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      _this.packets = 0;
      return _this.outPorts.out.disconnect();
    });
  }

  return GroupByPacket;

})(noflo.Component);

exports.getComponent = function() {
  return new GroupByPacket;
};

});
require.register("noflo-noflo-packets/components/LastPacket.js", function(exports, require, module){
var LastPacket, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

LastPacket = (function(_super) {
  __extends(LastPacket, _super);

  function LastPacket() {
    var _this = this;
    this.packets = null;
    this.inPorts = {
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts["in"].on('connect', function() {
      return _this.packets = [];
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.packets.push(data);
    });
    this.inPorts["in"].on('disconnect', function() {
      if (_this.packets.length === 0) {
        return;
      }
      _this.outPorts.out.send(_this.packets.pop());
      _this.outPorts.out.disconnect();
      return _this.packets = null;
    });
  }

  return LastPacket;

})(noflo.Component);

exports.getComponent = function() {
  return new LastPacket;
};

});
require.register("noflo-noflo-packets/components/Counter.js", function(exports, require, module){
var Counter, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Counter = (function(_super) {
  __extends(Counter, _super);

  Counter.prototype.description = 'The count component receives input on a single input port,\
    and sends the number of data packets received to the output port when\
    the input disconnects';

  function Counter() {
    var _this = this;
    this.count = null;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      count: new noflo.Port,
      out: new noflo.Port
    };
    this.inPorts["in"].on('data', function(data) {
      if (_this.count === null) {
        _this.count = 0;
      }
      _this.count++;
      if (_this.outPorts.out.isAttached()) {
        return _this.outPorts.out.send(data);
      }
    });
    this.inPorts["in"].on('disconnect', function() {
      _this.outPorts.count.send(_this.count);
      _this.outPorts.count.disconnect();
      _this.outPorts.out.disconnect();
      return _this.count = null;
    });
  }

  return Counter;

})(noflo.Component);

exports.getComponent = function() {
  return new Counter;
};

});
require.register("noflo-noflo-strings/index.js", function(exports, require, module){
/*
 * This file can be used for general library features that are exposed as CommonJS modules
 * that the components then utilize
 */

});
require.register("noflo-noflo-strings/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-strings","description":"String Utilities for NoFlo","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-strings","version":"0.0.1","keywords":[],"dependencies":{"noflo/noflo":"*","component/underscore":"*"},"scripts":["components/CompileString.coffee","components/Filter.coffee","components/SendString.coffee","components/SplitStr.coffee","components/StringTemplate.coffee","components/Replace.coffee","components/Jsonify.coffee","components/ParseJson.coffee","index.js"],"json":["component.json"],"noflo":{"icon":"font","components":{"CompileString":"components/CompileString.coffee","Filter":"components/Filter.coffee","SendString":"components/SendString.coffee","SplitStr":"components/SplitStr.coffee","StringTemplate":"components/StringTemplate.coffee","Replace":"components/Replace.coffee","Jsonify":"components/Jsonify.coffee","ParseJson":"components/ParseJson.coffee"}}}');
});
require.register("noflo-noflo-strings/components/CompileString.js", function(exports, require, module){
var CompileString, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CompileString = (function(_super) {
  __extends(CompileString, _super);

  function CompileString() {
    var _this = this;
    this.delimiter = "\n";
    this.data = [];
    this.onGroupEnd = true;
    this.inPorts = {
      delimiter: new noflo.Port,
      "in": new noflo.ArrayPort,
      ongroup: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.delimiter.on('data', function(data) {
      return _this.delimiter = data;
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.data.push(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      if (_this.data.length && _this.onGroupEnd) {
        _this.outPorts.out.send(_this.data.join(_this.delimiter));
      }
      _this.outPorts.out.endGroup();
      return _this.data = [];
    });
    this.inPorts["in"].on('disconnect', function() {
      if (_this.data.length) {
        _this.outPorts.out.send(_this.data.join(_this.delimiter));
      }
      _this.data = [];
      return _this.outPorts.out.disconnect();
    });
    this.inPorts.ongroup.on("data", function(data) {
      if (typeof data === 'string') {
        if (data.toLowerCase() === 'false') {
          _this.onGroupEnd = false;
          return;
        }
        _this.onGroupEnd = true;
        return;
      }
      return _this.onGroupEnd = data;
    });
  }

  return CompileString;

})(noflo.Component);

exports.getComponent = function() {
  return new CompileString;
};

});
require.register("noflo-noflo-strings/components/Filter.js", function(exports, require, module){
var Filter, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

Filter = (function(_super) {
  __extends(Filter, _super);

  Filter.prototype.description = "filters an IP which is a string using a regex";

  function Filter() {
    var _this = this;
    this.regex = null;
    this.inPorts = {
      "in": new noflo.Port('string'),
      pattern: new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('string'),
      missed: new noflo.Port('string')
    };
    this.inPorts.pattern.on("data", function(data) {
      return _this.regex = new RegExp(data);
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      if (typeof data !== 'string') {
        data = data.toString();
      }
      if ((_this.regex != null) && ((data != null ? typeof data.match === "function" ? data.match(_this.regex) : void 0 : void 0) != null)) {
        _this.outPorts.out.send(data);
        return;
      }
      if (_this.outPorts.missed.isAttached()) {
        return _this.outPorts.missed.send(data);
      }
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      _this.outPorts.out.disconnect();
      if (_this.outPorts.missed.isAttached()) {
        return _this.outPorts.missed.disconnect();
      }
    });
  }

  return Filter;

})(noflo.Component);

exports.getComponent = function() {
  return new Filter;
};

});
require.register("noflo-noflo-strings/components/SendString.js", function(exports, require, module){
var SendString, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SendString = (function(_super) {
  __extends(SendString, _super);

  function SendString() {
    var _this = this;
    this.data = {
      string: null,
      group: []
    };
    this.groups = [];
    this.inPorts = {
      string: new noflo.Port('string'),
      "in": new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('string')
    };
    this.inPorts.string.on('data', function(data) {
      return _this.data.string = data;
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.groups.push(group);
    });
    this.inPorts["in"].on('data', function(data) {
      _this.data.group = _this.groups.slice(0);
      return _this.sendString(_this.data);
    });
    this.inPorts["in"].on('endgroup', function(group) {
      return _this.groups.pop();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  SendString.prototype.sendString = function(data) {
    var group, _i, _j, _len, _len1, _ref, _ref1, _results;
    _ref = data.group;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      group = _ref[_i];
      this.outPorts.out.beginGroup(group);
    }
    this.outPorts.out.send(data.string);
    _ref1 = data.group;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      group = _ref1[_j];
      _results.push(this.outPorts.out.endGroup());
    }
    return _results;
  };

  return SendString;

})(noflo.Component);

exports.getComponent = function() {
  return new SendString;
};

});
require.register("noflo-noflo-strings/components/SplitStr.js", function(exports, require, module){
var SplitStr, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SplitStr = (function(_super) {
  __extends(SplitStr, _super);

  SplitStr.prototype.description = ' The SplitStr component receives a string in the in port,\
    splits it by string specified in the delimiter port, and send each part as\
    a separate packet to the out port';

  function SplitStr() {
    var _this = this;
    this.delimiterString = "\n";
    this.strings = [];
    this.groups = [];
    this.inPorts = {
      "in": new noflo.Port(),
      delimiter: new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.delimiter.on('data', function(data) {
      var first, last;
      first = data.substr(0, 1);
      last = data.substr(data.length - 1, 1);
      if (first === '/' && last === '/' && data.length > 1) {
        data = new RegExp(data.substr(1, data.length - 2));
      }
      return _this.delimiterString = data;
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.groups.push(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.strings.push(data);
    });
    this.inPorts["in"].on('disconnect', function(data) {
      var group, _i, _j, _len, _len1, _ref, _ref1;
      if (_this.strings.length === 0) {
        return _this.outPorts.out.disconnect();
      }
      _ref = _this.groups;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
        _this.outPorts.out.beginGroup(group);
      }
      _this.strings.join(_this.delimiterString).split(_this.delimiterString).forEach(function(line) {
        return _this.outPorts.out.send(line);
      });
      _ref1 = _this.groups;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        group = _ref1[_j];
        _this.outPorts.out.endGroup();
      }
      _this.outPorts.out.disconnect();
      _this.strings = [];
      return _this.groups = [];
    });
  }

  return SplitStr;

})(noflo.Component);

exports.getComponent = function() {
  return new SplitStr();
};

});
require.register("noflo-noflo-strings/components/StringTemplate.js", function(exports, require, module){
var StringTemplate, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore');

StringTemplate = (function(_super) {
  __extends(StringTemplate, _super);

  function StringTemplate() {
    var _this = this;
    this.template = null;
    this.inPorts = {
      template: new noflo.Port('string'),
      "in": new noflo.Port('object')
    };
    this.outPorts = {
      out: new noflo.Port('string')
    };
    this.inPorts.template.on('data', function(data) {
      return _this.template = _.template(data);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(_this.template(data));
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return StringTemplate;

})(noflo.Component);

exports.getComponent = function() {
  return new StringTemplate;
};

});
require.register("noflo-noflo-strings/components/Replace.js", function(exports, require, module){
var Replace, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Replace = (function(_super) {
  __extends(Replace, _super);

  Replace.prototype.description = 'Given a fixed pattern and its replacement, replace all\
  occurrences in the incoming template.';

  function Replace() {
    var _this = this;
    this.pattern = null;
    this.replacement = '';
    this.inPorts = {
      "in": new noflo.Port('string'),
      pattern: new noflo.Port('string'),
      replacement: new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('string')
    };
    this.inPorts.pattern.on('data', function(data) {
      return _this.pattern = new RegExp(data, 'g');
    });
    this.inPorts.replacement.on('data', function(data) {
      return _this.replacement = data.replace('\\\\n', "\n");
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      var string;
      string = data;
      if (_this.pattern != null) {
        string = ("" + data).replace(_this.pattern, _this.replacement);
      }
      return _this.outPorts.out.send(string);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Replace;

})(noflo.Component);

exports.getComponent = function() {
  return new Replace;
};

});
require.register("noflo-noflo-strings/components/Jsonify.js", function(exports, require, module){
var Jsonify, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore');

Jsonify = (function(_super) {
  __extends(Jsonify, _super);

  Jsonify.prototype.description = "JSONify all incoming, unless a raw flag is set to  exclude data packets that are pure strings";

  function Jsonify() {
    var _this = this;
    this.raw = false;
    this.inPorts = {
      "in": new noflo.Port(),
      raw: new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.raw.on('data', function(raw) {
      return _this.raw = raw === 'true';
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      if (_this.raw && _.isString(data)) {
        _this.outPorts.out.send(data);
        return;
      }
      return _this.outPorts.out.send(JSON.stringify(data));
    });
    this.inPorts["in"].on('endgroup', function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Jsonify;

})(noflo.Component);

exports.getComponent = function() {
  return new Jsonify;
};

});
require.register("noflo-noflo-strings/components/ParseJson.js", function(exports, require, module){
var ParseJson, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

ParseJson = (function(_super) {
  __extends(ParseJson, _super);

  function ParseJson() {
    var _this = this;
    this["try"] = false;
    this.inPorts = {
      "in": new noflo.Port(),
      "try": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts["try"].on("data", function(data) {
      if (data === "true") {
        return _this["try"] = true;
      }
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var e;
      try {
        data = JSON.parse(data);
      } catch (_error) {
        e = _error;
        if (!_this["try"]) {
          data = JSON.parse(data);
        }
      }
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on("endgroup", function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return ParseJson;

})(noflo.Component);

exports.getComponent = function() {
  return new ParseJson;
};

});
require.register("noflo-noflo-gestures/graphs/DetectDrag.json", function(exports, require, module){
module.exports = JSON.parse('{"properties":{"environment":{"runtime":"html","src":"./preview/iframe.html","width":"300","height":"300","content":""},"name":"DetectDrag"},"exports":[{"private":"receivegesture_3bwyo.in","public":"in"},{"private":"checkmindistance_zsyhq.comparison","public":"distance"},{"private":"sendpass_lskxq.out","public":"pass"},{"private":"sendfail_64mm2.out","public":"fail"},{"private":"checkmaxspeed_sojti.comparison","public":"maxspeed"}],"processes":{"ReceiveGesture_3bwyo":{"component":"core/Repeat","metadata":{"x":-605,"y":82,"label":"ReceiveGesture"}},"core/Split_qfhom":{"component":"core/Split","metadata":{"x":-605,"y":159,"label":"core/Split"}},"SendPass_lskxq":{"component":"strings/SendString","metadata":{"x":1143,"y":28,"label":"SendPass"}},"SendFail_64mm2":{"component":"strings/SendString","metadata":{"x":1145,"y":305,"label":"SendFail"}},"Failures_13q8s":{"component":"core/Merge","metadata":{"x":941,"y":311,"label":"Failures"}},"GetDistance_bjx0s":{"component":"objects/GetObjectKey","metadata":{"x":526,"y":161,"label":"GetDistance"}},"CheckMinDistance_zsyhq":{"component":"math/Compare","metadata":{"x":900,"y":160,"label":"CheckMinDistance"}},"GetIndividualPointer_hv93t":{"component":"objects/SplitObject","metadata":{"x":-410,"y":159,"label":"GetIndividualPointer"}},"SplitDistance_vreyf":{"component":"core/Split","metadata":{"x":711.9999999999998,"y":160,"label":"SplitDistance"}},"SplitPointer_8rn9q":{"component":"core/Split","metadata":{"x":-223.5000000000008,"y":159.16666666666666,"label":"SplitPointer"}},"SendPointer_b4unv":{"component":"strings/SendString","metadata":{"x":340.3333333333328,"y":160.16666666666669,"label":"SendPointer"}},"GetSpeed_o56fp":{"component":"objects/GetObjectKey","metadata":{"x":-40.49999999999977,"y":159,"label":"GetSpeed"}},"CheckMaxSpeed_sojti":{"component":"math/Compare","metadata":{"x":150.50000000000023,"y":161,"label":"CheckMaxSpeed"}}},"connections":[{"src":{"process":"ReceiveGesture_3bwyo","port":"out"},"tgt":{"process":"core/Split_qfhom","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_qfhom","port":"out"},"tgt":{"process":"SendFail_64mm2","port":"string"},"metadata":{"route":9}},{"src":{"process":"core/Split_qfhom","port":"out"},"tgt":{"process":"SendPass_lskxq","port":"string"},"metadata":{"route":9}},{"src":{"process":"Failures_13q8s","port":"out"},"tgt":{"process":"SendFail_64mm2","port":"in"},"metadata":{"route":1}},{"src":{"process":"GetDistance_bjx0s","port":"missed"},"tgt":{"process":"Failures_13q8s","port":"in"},"metadata":{"route":1}},{"src":{"process":"CheckMinDistance_zsyhq","port":"fail"},"tgt":{"process":"Failures_13q8s","port":"in"},"metadata":{"route":1}},{"src":{"process":"core/Split_qfhom","port":"out"},"tgt":{"process":"GetIndividualPointer_hv93t","port":"in"},"metadata":{"route":9}},{"src":{"process":"GetDistance_bjx0s","port":"out"},"tgt":{"process":"SplitDistance_vreyf","port":"in"},"metadata":{"route":9}},{"src":{"process":"SplitDistance_vreyf","port":"out"},"tgt":{"process":"CheckMinDistance_zsyhq","port":"value"},"metadata":{"route":9}},{"src":{"process":"GetIndividualPointer_hv93t","port":"out"},"tgt":{"process":"SplitPointer_8rn9q","port":"in"},"metadata":{"route":8}},{"src":{"process":"CheckMinDistance_zsyhq","port":"pass"},"tgt":{"process":"SendPass_lskxq","port":"in"},"metadata":{"route":5}},{"src":{"process":"SendPointer_b4unv","port":"out"},"tgt":{"process":"GetDistance_bjx0s","port":"in"},"metadata":{"route":9}},{"src":{"process":"SplitPointer_8rn9q","port":"out"},"tgt":{"process":"SendPointer_b4unv","port":"string"},"metadata":{"route":9}},{"src":{"process":"CheckMaxSpeed_sojti","port":"pass"},"tgt":{"process":"SendPointer_b4unv","port":"in"},"metadata":{"route":5}},{"src":{"process":"GetSpeed_o56fp","port":"out"},"tgt":{"process":"CheckMaxSpeed_sojti","port":"value"},"metadata":{"route":9}},{"src":{"process":"SplitPointer_8rn9q","port":"out"},"tgt":{"process":"GetSpeed_o56fp","port":"in"},"metadata":{"route":8}},{"src":{"process":"GetSpeed_o56fp","port":"missed"},"tgt":{"process":"Failures_13q8s","port":"in"},"metadata":{"route":1}},{"src":{"process":"CheckMaxSpeed_sojti","port":"fail"},"tgt":{"process":"Failures_13q8s","port":"in"},"metadata":{"route":1}},{"data":"distance","tgt":{"process":"GetDistance_bjx0s","port":"key"}},{"data":">=","tgt":{"process":"CheckMinDistance_zsyhq","port":"operator"}},{"data":"<=","tgt":{"process":"CheckMaxSpeed_sojti","port":"operator"}},{"data":"speed","tgt":{"process":"GetSpeed_o56fp","port":"key"}}]}');
});
require.register("noflo-noflo-gestures/graphs/DetectSwipe.json", function(exports, require, module){
module.exports = JSON.parse('{"properties":{"environment":{"runtime":"html","src":"./preview/iframe.html","width":"300","height":"300","content":""},"name":"DetectSwipe"},"exports":[{"private":"receivegesture_7fxc3.in","public":"in"},{"private":"sendpass_iuc21.out","public":"pass"},{"private":"sendfail_n9iay.out","public":"fail"},{"private":"checkspeed_cru21.comparison","public":"speed"},{"private":"checkdistance_786cc.comparison","public":"distance"}],"processes":{"ReceiveGesture_7fxc3":{"component":"core/Repeat","metadata":{"x":277,"y":124,"label":"ReceiveGesture"}},"GetIndividualPointer_9o878":{"component":"objects/SplitObject","metadata":{"x":473,"y":217,"label":"GetIndividualPointer"}},"SendPass_iuc21":{"component":"strings/SendString","metadata":{"x":2060,"y":113,"label":"SendPass"}},"GetSpeed_26n6h":{"component":"objects/GetObjectKey","metadata":{"x":863,"y":216,"label":"GetSpeed"}},"DetectionFailed_uj7oh":{"component":"core/Merge","metadata":{"x":1850,"y":337,"label":"DetectionFailed"}},"core/Split_cbjyy":{"component":"core/Split","metadata":{"x":273,"y":216,"label":"core/Split"}},"SendFail_n9iay":{"component":"strings/SendString","metadata":{"x":2062,"y":337.16666666666663,"label":"SendFail"}},"CheckSpeed_cru21":{"component":"math/Compare","metadata":{"x":1055.6666666666665,"y":215.66666666666666,"label":"CheckSpeed"}},"strings/SendString_75se6":{"component":"strings/SendString","metadata":{"x":1250.6666666666665,"y":216.66666666666666,"label":"strings/SendString"}},"GetDistance_zdjyf":{"component":"objects/GetObjectKey","metadata":{"x":1445.6666666666665,"y":215.66666666666666,"label":"GetDistance"}},"CheckDistance_786cc":{"component":"math/Compare","metadata":{"x":1648,"y":216,"label":"CheckDistance"}},"core/Split_x6p93":{"component":"core/Split","metadata":{"x":667.9999999999986,"y":215.66666666666663,"label":"core/Split"}}},"connections":[{"src":{"process":"GetSpeed_26n6h","port":"missed"},"tgt":{"process":"DetectionFailed_uj7oh","port":"in"},"metadata":{"route":1}},{"src":{"process":"CheckSpeed_cru21","port":"pass"},"tgt":{"process":"strings/SendString_75se6","port":"in"},"metadata":{"route":5}},{"src":{"process":"GetSpeed_26n6h","port":"out"},"tgt":{"process":"CheckSpeed_cru21","port":"value"},"metadata":{"route":1}},{"src":{"process":"CheckSpeed_cru21","port":"fail"},"tgt":{"process":"DetectionFailed_uj7oh","port":"in"},"metadata":{"route":1}},{"src":{"process":"strings/SendString_75se6","port":"out"},"tgt":{"process":"GetDistance_zdjyf","port":"in"},"metadata":{"route":5}},{"src":{"process":"GetDistance_zdjyf","port":"missed"},"tgt":{"process":"DetectionFailed_uj7oh","port":"in"},"metadata":{"route":1}},{"src":{"process":"CheckDistance_786cc","port":"fail"},"tgt":{"process":"DetectionFailed_uj7oh","port":"in"},"metadata":{"route":1}},{"src":{"process":"GetDistance_zdjyf","port":"out"},"tgt":{"process":"CheckDistance_786cc","port":"value"},"metadata":{"route":5}},{"src":{"process":"CheckDistance_786cc","port":"pass"},"tgt":{"process":"SendPass_iuc21","port":"in"},"metadata":{"route":5}},{"src":{"process":"DetectionFailed_uj7oh","port":"out"},"tgt":{"process":"SendFail_n9iay","port":"in"},"metadata":{"route":1}},{"src":{"process":"ReceiveGesture_7fxc3","port":"out"},"tgt":{"process":"core/Split_cbjyy","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_cbjyy","port":"out"},"tgt":{"process":"SendPass_iuc21","port":"string"},"metadata":{"route":9}},{"src":{"process":"core/Split_cbjyy","port":"out"},"tgt":{"process":"SendFail_n9iay","port":"string"},"metadata":{"route":9}},{"src":{"process":"core/Split_cbjyy","port":"out"},"tgt":{"process":"GetIndividualPointer_9o878","port":"in"},"metadata":{"route":9}},{"src":{"process":"GetIndividualPointer_9o878","port":"out"},"tgt":{"process":"core/Split_x6p93","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_x6p93","port":"out"},"tgt":{"process":"strings/SendString_75se6","port":"string"},"metadata":{"route":9}},{"src":{"process":"core/Split_x6p93","port":"out"},"tgt":{"process":"GetSpeed_26n6h","port":"in"},"metadata":{"route":9}},{"data":"speed","tgt":{"process":"GetSpeed_26n6h","port":"key"}},{"data":"distance","tgt":{"process":"GetDistance_zdjyf","port":"key"}},{"data":">=","tgt":{"process":"CheckSpeed_cru21","port":"operator"}},{"data":">=","tgt":{"process":"CheckDistance_786cc","port":"operator"}}]}');
});
require.register("noflo-noflo-gestures/graphs/DetectPinch.json", function(exports, require, module){
module.exports = JSON.parse('{"properties":{"environment":{"runtime":"html","src":"./preview/iframe.html","width":"300","height":"300","content":""},"name":"DetectPinch"},"exports":[{"private":"core/split_ewbre.in","public":"in"},{"private":"sendpass_cf0pu.out","public":"pass"},{"private":"sendfail_vmi5n.out","public":"fail"}],"processes":{"core/Split_ewbre":{"component":"core/Split","metadata":{"x":740,"y":151,"label":"core/Split"}},"SendFail_vmi5n":{"component":"strings/SendString","metadata":{"x":1423,"y":259,"label":"SendFail"}},"SendPass_cf0pu":{"component":"strings/SendString","metadata":{"x":1421,"y":65,"label":"SendPass"}},"objects/Size_jjmmg":{"component":"objects/Size","metadata":{"x":939,"y":150,"label":"objects/Size"}},"math/Compare_hk3su":{"component":"math/Compare","metadata":{"x":1146,"y":147,"label":"math/Compare"}}},"connections":[{"src":{"process":"objects/Size_jjmmg","port":"out"},"tgt":{"process":"math/Compare_hk3su","port":"value"},"metadata":{"route":9}},{"src":{"process":"math/Compare_hk3su","port":"pass"},"tgt":{"process":"SendPass_cf0pu","port":"in"},"metadata":{"route":5}},{"src":{"process":"math/Compare_hk3su","port":"fail"},"tgt":{"process":"SendFail_vmi5n","port":"in"},"metadata":{"route":1}},{"src":{"process":"core/Split_ewbre","port":"out"},"tgt":{"process":"SendFail_vmi5n","port":"string"},"metadata":{"route":9}},{"src":{"process":"core/Split_ewbre","port":"out"},"tgt":{"process":"SendPass_cf0pu","port":"string"},"metadata":{"route":9}},{"src":{"process":"core/Split_ewbre","port":"out"},"tgt":{"process":"objects/Size_jjmmg","port":"in"},"metadata":{"route":9}},{"data":1,"tgt":{"process":"math/Compare_hk3su","port":"comparison"}},{"data":">","tgt":{"process":"math/Compare_hk3su","port":"operator"}}]}');
});
require.register("noflo-noflo-gestures/graphs/FilterByTarget.json", function(exports, require, module){
module.exports = JSON.parse('{"properties":{"name":"FilterByTarget"},"exports":[{"private":"StartEvent_rjg24.in","public":"started"},{"private":"GetTarget_7cfim.object","public":"startevent"},{"private":"MoveEvent_reuhl.in","public":"move"},{"private":"VerifyTarget_ty3p5.accept","public":"accept"},{"private":"TargetElement_9tv87.out","public":"target"},{"private":"OnTarget_l85x9.out","public":"ontarget"},{"private":"AllowedMoves_y6ulv.out","public":"move"}],"processes":{"GetTarget_7cfim":{"component":"objects/GetObjectKey","metadata":{"x":634,"y":210,"label":"GetTarget"}},"MoveEvent_reuhl":{"component":"core/Repeat","metadata":{"x":425,"y":362,"label":"MoveEvent"}},"SplitTarget_sqlg0":{"component":"core/Split","metadata":{"x":836,"y":212,"label":"SplitTarget"}},"StartEvent_rjg24":{"component":"core/Repeat","metadata":{"x":426.00000000000006,"y":213,"label":"StartEvent"}},"VerifyTarget_ty3p5":{"component":"objects/FilterPropertyValue","metadata":{"x":1051.3333333333335,"y":211.33333333333331,"label":"VerifyTarget"}},"AllowedMoves_y6ulv":{"component":"flow/Gate","metadata":{"x":1508.6666666666665,"y":212.5,"label":"AllowedMoves"}},"SplitOnTarget_xmi67":{"component":"core/Split","metadata":{"x":1275.833333333334,"y":209.66666666666669,"label":"SplitOnTarget"}},"OnTarget_l85x9":{"component":"core/Repeat","metadata":{"x":1509.833333333334,"y":118.66666666666669,"label":"OnTarget"}},"TargetElement_9tv87":{"component":"core/Repeat","metadata":{"x":1507.833333333334,"y":26.666666666666686,"label":"TargetElement"}}},"connections":[{"src":{"process":"GetTarget_7cfim","port":"out"},"tgt":{"process":"SplitTarget_sqlg0","port":"in"},"metadata":{"route":5}},{"src":{"process":"StartEvent_rjg24","port":"out"},"tgt":{"process":"GetTarget_7cfim","port":"in"},"metadata":{"route":5}},{"src":{"process":"SplitTarget_sqlg0","port":"out"},"tgt":{"process":"VerifyTarget_ty3p5","port":"in"},"metadata":{"route":5}},{"src":{"process":"MoveEvent_reuhl","port":"out"},"tgt":{"process":"AllowedMoves_y6ulv","port":"in"},"metadata":{"route":2}},{"src":{"process":"VerifyTarget_ty3p5","port":"missed"},"tgt":{"process":"AllowedMoves_y6ulv","port":"close"},"metadata":{"route":1}},{"src":{"process":"VerifyTarget_ty3p5","port":"out"},"tgt":{"process":"SplitOnTarget_xmi67","port":"in"},"metadata":{"route":5}},{"src":{"process":"SplitOnTarget_xmi67","port":"out"},"tgt":{"process":"AllowedMoves_y6ulv","port":"open"},"metadata":{"route":5}},{"src":{"process":"SplitOnTarget_xmi67","port":"out"},"tgt":{"process":"OnTarget_l85x9","port":"in"},"metadata":{"route":5}},{"src":{"process":"SplitTarget_sqlg0","port":"out"},"tgt":{"process":"TargetElement_9tv87","port":"in"},"metadata":{"route":5}},{"data":"target","tgt":{"process":"GetTarget_7cfim","port":"key"}}]}');
});
require.register("noflo-noflo-gestures/graphs/GestureToObject.json", function(exports, require, module){
module.exports = JSON.parse('{"properties":{"environment":{"runtime":"html","src":"./preview/iframe.html","width":"300","height":"300","content":""},"name":"Behavior"},"exports":[{"private":"listengestures_ns8li.element","public":"element"},{"private":"gesturedatatoobject_yh3yq.out","public":"out"}],"processes":{"ListenGestures_ns8li":{"component":"gestures/ListenGestures","metadata":{"x":609,"y":139,"label":"ListenGestures"}},"GestureDataToObject_yh3yq":{"component":"groups/CollectObject","metadata":{"x":1252,"y":159,"label":"GestureDataToObject"}},"SplitEnd_akdq1":{"component":"core/Split","metadata":{"x":847.1666666666667,"y":85.66666666666666,"label":"SplitEnd"}},"ClearOnEnd_9w9o":{"component":"core/RepeatAsync","metadata":{"x":1051.1666666666667,"y":88.66666666666666,"label":"ClearOnEnd"}},"SplitSpeed_2jnkm":{"component":"core/Split","metadata":{"x":849.5,"y":147.5,"label":"SplitSpeed"}},"SplitStart_hr2rx":{"component":"core/Split","metadata":{"x":845.833333333333,"y":23.50000000000003,"label":"SplitStart"}},"ReleaseMoveOrEnd_ahcs5":{"component":"core/Merge","metadata":{"x":1050.3333333333326,"y":157.83333333333331,"label":"ReleaseMoveOrEnd"}}},"connections":[{"src":{"process":"SplitEnd_akdq1","port":"out"},"tgt":{"process":"ClearOnEnd_9w9o","port":"in"},"metadata":{"route":1}},{"src":{"process":"ClearOnEnd_9w9o","port":"out"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"clear"},"metadata":{"route":1}},{"src":{"process":"ListenGestures_ns8li","port":"end"},"tgt":{"process":"SplitEnd_akdq1","port":"in"},"metadata":{"route":1}},{"src":{"process":"ListenGestures_ns8li","port":"start"},"tgt":{"process":"SplitStart_hr2rx","port":"in"},"metadata":{"route":5}},{"src":{"process":"SplitStart_hr2rx","port":"out"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":5}},{"src":{"process":"ListenGestures_ns8li","port":"startpoint"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":5}},{"src":{"process":"ListenGestures_ns8li","port":"elements"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":7}},{"src":{"process":"ListenGestures_ns8li","port":"angle"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":9}},{"src":{"process":"ListenGestures_ns8li","port":"distance"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":9}},{"src":{"process":"SplitSpeed_2jnkm","port":"out"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":9}},{"src":{"process":"ListenGestures_ns8li","port":"movepoint"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":3}},{"src":{"process":"ListenGestures_ns8li","port":"current"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":3}},{"src":{"process":"ListenGestures_ns8li","port":"duration"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":9}},{"src":{"process":"SplitEnd_akdq1","port":"out"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":1}},{"src":{"process":"ListenGestures_ns8li","port":"endpoint"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":1}},{"src":{"process":"ListenGestures_ns8li","port":"speed"},"tgt":{"process":"SplitSpeed_2jnkm","port":"in"},"metadata":{"route":8}},{"src":{"process":"SplitSpeed_2jnkm","port":"out"},"tgt":{"process":"ReleaseMoveOrEnd_ahcs5","port":"in"},"metadata":{"route":8}},{"src":{"process":"SplitEnd_akdq1","port":"out"},"tgt":{"process":"ReleaseMoveOrEnd_ahcs5","port":"in"},"metadata":{"route":1}},{"src":{"process":"ReleaseMoveOrEnd_ahcs5","port":"out"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"release"},"metadata":{"route":8}},{"data":"elements","tgt":{"process":"GestureDataToObject_yh3yq","port":"allpackets"}},{"data":"startelement,startpoint,elements,angle,distance,speed,movepoint,current,duration,endelement,endpoint","tgt":{"process":"GestureDataToObject_yh3yq","port":"keys"}}]}');
});
require.register("noflo-noflo-gestures/graphs/ListenGestures.json", function(exports, require, module){
module.exports = JSON.parse('{"properties":{"environment":{"runtime":"html","src":"./preview/iframe.html","width":"300","height":"300","content":""},"name":"ListenGestures"},"exports":[{"private":"gestures/listenpointer_8ftd1.element","public":"element"},{"private":"movepoint_fjlur.out","public":"movepoint"},{"private":"distance_kwk39.out","public":"distance"},{"private":"gestureelements_yvm9m.out","public":"elements"},{"private":"angle_43qpo.out","public":"angle"},{"private":"speed_e99jq.out","public":"speed"},{"private":"getstartelement_w7m64.out","public":"start"},{"private":"startpoint_u8int.out","public":"startpoint"},{"private":"getendelement_slbp9.out","public":"end"},{"private":"getendingpoint_dettb.client","public":"endpoint"},{"private":"currentelement_cu0q5.out","public":"current"},{"private":"duration_qyevv.out","public":"duration"}],"processes":{"GestureStart_r8vr5":{"component":"core/Split","metadata":{"x":466,"y":-31,"label":"GestureStart"}},"GetStartingPoint_pidfs":{"component":"interaction/ReadCoordinates","metadata":{"x":765,"y":-191,"label":"GetStartingPoint"}},"GetMovePoint_9dia9":{"component":"interaction/ReadCoordinates","metadata":{"x":1368,"y":136,"label":"GetMovePoint"}},"core/Split_baeeb":{"component":"core/Split","metadata":{"x":1563,"y":137,"label":"core/Split"}},"core/Split_4ds1h":{"component":"core/Split","metadata":{"x":973,"y":-191,"label":"core/Split"}},"GestureAngle_dwjj":{"component":"math/CalculateAngle","metadata":{"x":1939,"y":-127,"label":"GestureAngle"}},"GestureDistance_esqkc":{"component":"math/CalculateDistance","metadata":{"x":1934,"y":20,"label":"GestureDistance"}},"LastMove_p5yj7":{"component":"core/Kick","metadata":{"x":1062,"y":176,"label":"LastMove"}},"GestureEnd_qqx8o":{"component":"core/Split","metadata":{"x":460,"y":162,"label":"GestureEnd"}},"GestureMove_hy46s":{"component":"core/Split","metadata":{"x":463,"y":65,"label":"GestureMove"}},"AllTouchedElements_i3x74":{"component":"packets/UniquePacket","metadata":{"x":1445,"y":6,"label":"AllTouchedElements"}},"GetMoveElement_iaexm":{"component":"objects/GetObjectKey","metadata":{"x":1059,"y":6,"label":"GetMoveElement"}},"GetStartElement_w7m64":{"component":"objects/GetObjectKey","metadata":{"x":968,"y":-404.66666666666663,"label":"GetStartElement"}},"MoveDate_6bjnl":{"component":"objects/CreateDate","metadata":{"x":2145,"y":164,"label":"MoveDate"}},"StartDate_swbwu":{"component":"objects/CreateDate","metadata":{"x":968,"y":-281,"label":"StartDate"}},"math/Subtract_j5v20":{"component":"math/Subtract","metadata":{"x":2516,"y":-193,"label":"math/Subtract"}},"SetStart_ql51c":{"component":"strings/SendString","metadata":{"x":765,"y":-284,"label":"SetStart"}},"math/Divide_x4gc8":{"component":"math/Divide","metadata":{"x":2939,"y":-199,"label":"math/Divide"}},"core/Split_x0a12":{"component":"core/Split","metadata":{"x":2151,"y":23,"label":"core/Split"}},"objects/CallMethod_iu7k2":{"component":"objects/CallMethod","metadata":{"x":2348,"y":167,"label":"objects/CallMethod"}},"objects/CallMethod_rtfd2":{"component":"objects/CallMethod","metadata":{"x":2139,"y":-274,"label":"objects/CallMethod"}},"Distance_kwk39":{"component":"core/Repeat","metadata":{"x":2580,"y":20,"label":"Distance"}},"GestureElements_yvm9m":{"component":"core/Repeat","metadata":{"x":1639,"y":4,"label":"GestureElements"}},"Angle_43qpo":{"component":"core/Repeat","metadata":{"x":2312,"y":-121,"label":"Angle"}},"Speed_e99jq":{"component":"core/Repeat","metadata":{"x":3362,"y":-171,"label":"Speed"}},"MovePoint_fjlur":{"component":"core/Repeat","metadata":{"x":1939,"y":262,"label":"MovePoint"}},"StartPoint_u8int":{"component":"core/Repeat","metadata":{"x":1382,"y":-189,"label":"StartPoint"}},"gestures/ListenPointer_8ftd1":{"component":"gestures/ListenPointer","metadata":{"x":213,"y":-1,"label":"gestures/ListenPointer"}},"GetEndElement_slbp9":{"component":"objects/GetObjectKey","metadata":{"x":1367.3333333333335,"y":283.3333333333335,"label":"GetEndElement"}},"core/RepeatAsync_c56tj":{"component":"core/RepeatAsync","metadata":{"x":1058.666666666667,"y":312.33333333333326,"label":"core/RepeatAsync"}},"strings/SendString_t6gby":{"component":"strings/SendString","metadata":{"x":1935,"y":166.33333333333337,"label":"strings/SendString"}},"groups/SendByGroup_z06kk":{"component":"groups/SendByGroup","metadata":{"x":556,"y":-151.66666666666669,"label":"groups/SendByGroup"}},"core/Split_ekxij":{"component":"core/Split","metadata":{"x":3158.5,"y":-166.33333333333343,"label":"core/Split"}},"core/Split_eph3d":{"component":"core/Split","metadata":{"x":2123.333333333334,"y":-122.66666666666669,"label":"core/Split"}},"core/Split_3elep":{"component":"core/Split","metadata":{"x":2731.1666666666697,"y":-171.83333333333258,"label":"core/Split"}},"core/Split_8l3yu":{"component":"core/Split","metadata":{"x":1251.3333333333333,"y":7.166666666666629,"label":"core/Split"}},"CurrentElement_cu0q5":{"component":"core/Repeat","metadata":{"x":1599.833333333333,"y":-192.00000000000006,"label":"CurrentElement"}},"Duration_qyevv":{"component":"core/Repeat","metadata":{"x":2937.833333333333,"y":-295.83333333333326,"label":"Duration"}},"GetEndingPoint_dettb":{"component":"interaction/ReadCoordinates","metadata":{"x":727.8333333333331,"y":335.3333333333333,"label":"GetEndingPoint"}},"core/Merge_6so":{"component":"core/Merge","metadata":{"x":1196.666666666667,"y":-188.99999999999983,"label":"core/Merge"}},"interaction/ReadCoordinates_82cb1":{"component":"interaction/ReadCoordinates","metadata":{"x":767.3333333333339,"y":-85.83333333333314,"label":"interaction/ReadCoordinates"}},"core/Drop_sa8z5":{"component":"core/Drop","metadata":{"x":1596.833333333333,"y":326.0000000000001,"label":"core/Drop"}},"core/Merge_lqxll":{"component":"core/Merge","metadata":{"x":768.9999999999995,"y":-403.66666666666663,"label":"core/Merge"}},"groups/SendByGroup_8yaj":{"component":"groups/SendByGroup","metadata":{"x":1166.999999999999,"y":-286.83333333333326,"label":"groups/SendByGroup"}}},"connections":[{"src":{"process":"core/Split_4ds1h","port":"out"},"tgt":{"process":"GestureAngle_dwjj","port":"origin"},"metadata":{"route":5}},{"src":{"process":"core/Split_baeeb","port":"out"},"tgt":{"process":"GestureAngle_dwjj","port":"destination"},"metadata":{"route":3}},{"src":{"process":"core/Split_4ds1h","port":"out"},"tgt":{"process":"GestureDistance_esqkc","port":"origin"},"metadata":{"route":5}},{"src":{"process":"core/Split_baeeb","port":"out"},"tgt":{"process":"GestureDistance_esqkc","port":"destination"},"metadata":{"route":3}},{"src":{"process":"GetMovePoint_9dia9","port":"client"},"tgt":{"process":"core/Split_baeeb","port":"in"},"metadata":{"route":3}},{"src":{"process":"GetStartingPoint_pidfs","port":"client"},"tgt":{"process":"core/Split_4ds1h","port":"in"},"metadata":{"route":5}},{"src":{"process":"SetStart_ql51c","port":"out"},"tgt":{"process":"StartDate_swbwu","port":"in"},"metadata":{"route":5}},{"src":{"process":"GestureDistance_esqkc","port":"distance"},"tgt":{"process":"core/Split_x0a12","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_x0a12","port":"out"},"tgt":{"process":"math/Divide_x4gc8","port":"dividend"},"metadata":{"route":9}},{"src":{"process":"objects/CallMethod_iu7k2","port":"out"},"tgt":{"process":"math/Subtract_j5v20","port":"minuend"},"metadata":{"route":3}},{"src":{"process":"MoveDate_6bjnl","port":"out"},"tgt":{"process":"objects/CallMethod_iu7k2","port":"in"},"metadata":{"route":3}},{"src":{"process":"core/Split_x0a12","port":"out"},"tgt":{"process":"Distance_kwk39","port":"in"},"metadata":{"route":9}},{"src":{"process":"AllTouchedElements_i3x74","port":"out"},"tgt":{"process":"GestureElements_yvm9m","port":"in"},"metadata":{"route":3}},{"src":{"process":"core/Split_baeeb","port":"out"},"tgt":{"process":"MovePoint_fjlur","port":"in"},"metadata":{"route":3}},{"src":{"process":"gestures/ListenPointer_8ftd1","port":"end"},"tgt":{"process":"GestureEnd_qqx8o","port":"in"},"metadata":{"route":1}},{"src":{"process":"gestures/ListenPointer_8ftd1","port":"move"},"tgt":{"process":"GestureMove_hy46s","port":"in"},"metadata":{"route":3}},{"src":{"process":"gestures/ListenPointer_8ftd1","port":"start"},"tgt":{"process":"GestureStart_r8vr5","port":"in"},"metadata":{"route":5}},{"src":{"process":"LastMove_p5yj7","port":"out"},"tgt":{"process":"GetEndElement_slbp9","port":"in"},"metadata":{"route":1}},{"src":{"process":"GestureEnd_qqx8o","port":"out"},"tgt":{"process":"LastMove_p5yj7","port":"in"},"metadata":{"route":1}},{"src":{"process":"GestureEnd_qqx8o","port":"out"},"tgt":{"process":"core/RepeatAsync_c56tj","port":"in"},"metadata":{"route":1}},{"src":{"process":"core/Split_baeeb","port":"out"},"tgt":{"process":"strings/SendString_t6gby","port":"in"},"metadata":{"route":3}},{"src":{"process":"strings/SendString_t6gby","port":"out"},"tgt":{"process":"MoveDate_6bjnl","port":"in"},"metadata":{"route":4}},{"src":{"process":"groups/SendByGroup_z06kk","port":"out"},"tgt":{"process":"GetStartingPoint_pidfs","port":"event"},"metadata":{"route":5}},{"src":{"process":"GestureStart_r8vr5","port":"out"},"tgt":{"process":"groups/SendByGroup_z06kk","port":"data"},"metadata":{"route":5}},{"src":{"process":"GestureMove_hy46s","port":"out"},"tgt":{"process":"groups/SendByGroup_z06kk","port":"in"},"metadata":{"route":3}},{"src":{"process":"GestureMove_hy46s","port":"out"},"tgt":{"process":"LastMove_p5yj7","port":"data"},"metadata":{"route":3}},{"src":{"process":"GestureMove_hy46s","port":"out"},"tgt":{"process":"GetMoveElement_iaexm","port":"in"},"metadata":{"route":3}},{"src":{"process":"GestureMove_hy46s","port":"out"},"tgt":{"process":"GetMovePoint_9dia9","port":"event"},"metadata":{"route":3}},{"src":{"process":"core/Split_x0a12","port":"out"},"tgt":{"process":"GestureDistance_esqkc","port":"clear"},"metadata":{"route":0}},{"src":{"process":"core/Split_ekxij","port":"out"},"tgt":{"process":"Speed_e99jq","port":"in"},"metadata":{"route":8}},{"src":{"process":"math/Divide_x4gc8","port":"quotient"},"tgt":{"process":"core/Split_ekxij","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_ekxij","port":"out"},"tgt":{"process":"math/Divide_x4gc8","port":"clear"},"metadata":{"route":0}},{"src":{"process":"core/RepeatAsync_c56tj","port":"out"},"tgt":{"process":"AllTouchedElements_i3x74","port":"clear"},"metadata":{"route":1}},{"src":{"process":"GestureAngle_dwjj","port":"angle"},"tgt":{"process":"core/Split_eph3d","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_eph3d","port":"out"},"tgt":{"process":"Angle_43qpo","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_eph3d","port":"out"},"tgt":{"process":"GestureAngle_dwjj","port":"clear"},"metadata":{"route":0}},{"src":{"process":"math/Subtract_j5v20","port":"difference"},"tgt":{"process":"core/Split_3elep","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_3elep","port":"out"},"tgt":{"process":"math/Divide_x4gc8","port":"divisor"},"metadata":{"route":9}},{"src":{"process":"GetMoveElement_iaexm","port":"out"},"tgt":{"process":"core/Split_8l3yu","port":"in"},"metadata":{"route":3}},{"src":{"process":"core/Split_8l3yu","port":"out"},"tgt":{"process":"AllTouchedElements_i3x74","port":"in"},"metadata":{"route":3}},{"src":{"process":"core/Split_8l3yu","port":"out"},"tgt":{"process":"CurrentElement_cu0q5","port":"in"},"metadata":{"route":3}},{"src":{"process":"core/Split_3elep","port":"out"},"tgt":{"process":"Duration_qyevv","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_3elep","port":"out"},"tgt":{"process":"math/Subtract_j5v20","port":"clear"},"metadata":{"route":0}},{"src":{"process":"GestureEnd_qqx8o","port":"out"},"tgt":{"process":"GetEndingPoint_dettb","port":"event"},"metadata":{"route":1}},{"src":{"process":"objects/CallMethod_rtfd2","port":"out"},"tgt":{"process":"math/Subtract_j5v20","port":"subtrahend"},"metadata":{"route":5}},{"src":{"process":"core/Split_4ds1h","port":"out"},"tgt":{"process":"core/Merge_6so","port":"in"},"metadata":{"route":5}},{"src":{"process":"core/Merge_6so","port":"out"},"tgt":{"process":"StartPoint_u8int","port":"in"},"metadata":{"route":5}},{"src":{"process":"interaction/ReadCoordinates_82cb1","port":"client"},"tgt":{"process":"core/Merge_6so","port":"in"},"metadata":{"route":5}},{"src":{"process":"GestureStart_r8vr5","port":"out"},"tgt":{"process":"interaction/ReadCoordinates_82cb1","port":"event"},"metadata":{"route":5}},{"src":{"process":"GetEndElement_slbp9","port":"missed"},"tgt":{"process":"core/Drop_sa8z5","port":"in"},"metadata":{"route":1}},{"src":{"process":"GestureStart_r8vr5","port":"out"},"tgt":{"process":"core/Merge_lqxll","port":"in"},"metadata":{"route":5}},{"src":{"process":"core/Merge_lqxll","port":"out"},"tgt":{"process":"GetStartElement_w7m64","port":"in"},"metadata":{"route":5}},{"src":{"process":"groups/SendByGroup_z06kk","port":"out"},"tgt":{"process":"core/Merge_lqxll","port":"in"},"metadata":{"route":5}},{"src":{"process":"groups/SendByGroup_8yaj","port":"out"},"tgt":{"process":"objects/CallMethod_rtfd2","port":"in"},"metadata":{"route":5}},{"src":{"process":"StartDate_swbwu","port":"out"},"tgt":{"process":"groups/SendByGroup_8yaj","port":"data"},"metadata":{"route":5}},{"src":{"process":"GestureStart_r8vr5","port":"out"},"tgt":{"process":"SetStart_ql51c","port":"in"},"metadata":{"route":5}},{"src":{"process":"GestureMove_hy46s","port":"out"},"tgt":{"process":"groups/SendByGroup_8yaj","port":"in"},"metadata":{"route":3}},{"data":"target","tgt":{"process":"GetMoveElement_iaexm","port":"key"}},{"data":"target","tgt":{"process":"GetStartElement_w7m64","port":"key"}},{"data":"now","tgt":{"process":"SetStart_ql51c","port":"string"}},{"data":"getTime","tgt":{"process":"objects/CallMethod_iu7k2","port":"method"}},{"data":"getTime","tgt":{"process":"objects/CallMethod_rtfd2","port":"method"}},{"data":"target","tgt":{"process":"GetEndElement_slbp9","port":"key"}},{"data":"now","tgt":{"process":"strings/SendString_t6gby","port":"string"}}]}');
});
require.register("noflo-noflo-gestures/graphs/ListenPointer.json", function(exports, require, module){
module.exports = JSON.parse('{"properties":{"name":"ListenPointer"},"exports":[{"private":"Listen_1025g.element","public":"element"},{"private":"Listen_1025g.capture","public":"capture"},{"private":"StartEvent_x8itv.out","public":"start"},{"private":"MoveEvent_qa3pp.out","public":"move"},{"private":"EndEvent_hmwp9.out","public":"end"}],"processes":{"Listen_1025g":{"component":"interaction/ListenPointer","metadata":{"x":500,"y":-65,"label":"Listen"}},"End_vom22":{"component":"core/Merge","metadata":{"x":843,"y":96,"label":"End"}},"Start_86u3g":{"component":"core/Split","metadata":{"x":848,"y":-157,"label":"Start"}},"MoveOnlyDuringGesture_986zt":{"component":"flow/Gate","metadata":{"x":1106,"y":-40,"label":"MoveOnlyDuringGesture"}},"EndOnlyOnce_vexfn":{"component":"flow/Gate","metadata":{"x":1107,"y":75,"label":"EndOnlyOnce"}},"SplitEnd_cnfy6":{"component":"core/Split","metadata":{"x":1407,"y":79,"label":"SplitEnd"}},"Asynchronize_x0hqm":{"component":"core/RepeatAsync","metadata":{"x":1404,"y":171.33333333333331,"label":"Asynchronize"}},"StartEvent_x8itv":{"component":"core/Repeat","metadata":{"x":1662,"y":-162,"label":"StartEvent"}},"MoveEvent_qa3pp":{"component":"core/Repeat","metadata":{"x":1662,"y":-35,"label":"MoveEvent"}},"EndEvent_hmwp9":{"component":"core/Repeat","metadata":{"x":1659,"y":75,"label":"EndEvent"}}},"connections":[{"src":{"process":"Listen_1025g","port":"leave"},"tgt":{"process":"End_vom22","port":"in"},"metadata":{"route":1}},{"src":{"process":"Listen_1025g","port":"cancel"},"tgt":{"process":"End_vom22","port":"in"},"metadata":{"route":1}},{"src":{"process":"Listen_1025g","port":"up"},"tgt":{"process":"End_vom22","port":"in"},"metadata":{"route":1}},{"src":{"process":"Listen_1025g","port":"down"},"tgt":{"process":"Start_86u3g","port":"in"},"metadata":{"route":5}},{"src":{"process":"Listen_1025g","port":"move"},"tgt":{"process":"MoveOnlyDuringGesture_986zt","port":"in"},"metadata":{"route":3}},{"src":{"process":"End_vom22","port":"out"},"tgt":{"process":"EndOnlyOnce_vexfn","port":"in"},"metadata":{"route":1}},{"src":{"process":"EndOnlyOnce_vexfn","port":"out"},"tgt":{"process":"SplitEnd_cnfy6","port":"in"},"metadata":{"route":1}},{"src":{"process":"Start_86u3g","port":"out"},"tgt":{"process":"EndOnlyOnce_vexfn","port":"open"},"metadata":{"route":5}},{"src":{"process":"SplitEnd_cnfy6","port":"out"},"tgt":{"process":"Asynchronize_x0hqm","port":"in"},"metadata":{"route":1}},{"src":{"process":"Asynchronize_x0hqm","port":"out"},"tgt":{"process":"EndOnlyOnce_vexfn","port":"close"},"metadata":{"route":1}},{"src":{"process":"Start_86u3g","port":"out"},"tgt":{"process":"MoveOnlyDuringGesture_986zt","port":"open"},"metadata":{"route":5}},{"src":{"process":"SplitEnd_cnfy6","port":"out"},"tgt":{"process":"MoveOnlyDuringGesture_986zt","port":"close"},"metadata":{"route":1}},{"src":{"process":"Start_86u3g","port":"out"},"tgt":{"process":"StartEvent_x8itv","port":"in"},"metadata":{"route":5}},{"src":{"process":"MoveOnlyDuringGesture_986zt","port":"out"},"tgt":{"process":"MoveEvent_qa3pp","port":"in"},"metadata":{"route":3}},{"src":{"process":"SplitEnd_cnfy6","port":"out"},"tgt":{"process":"EndEvent_hmwp9","port":"in"},"metadata":{"route":1}}]}');
});
require.register("noflo-noflo-gestures/graphs/DetectCardinalDirection.json", function(exports, require, module){
module.exports = JSON.parse('{"properties":{"environment":{"runtime":"html","src":"./preview/iframe.html","width":"300","height":"300","content":""},"name":"DetectCardinalDirection"},"exports":[{"private":"receivegesture_thbmw.in","public":"in"},{"private":"sendeast_218qx.out","public":"east"},{"private":"sendsouth_wx2b5.out","public":"south"},{"private":"sendwest_rkdz9.out","public":"west"},{"private":"sendnorth_c562k.out","public":"north"},{"private":"fail_5b0qo.out","public":"fail"},{"private":"checkmaxdistance_cebq5.comparison","public":"maxdistance"}],"processes":{"ReceiveGesture_thbmw":{"component":"core/Repeat","metadata":{"x":-294,"y":134,"label":"ReceiveGesture"}},"SplitGesture_dkk87":{"component":"core/Split","metadata":{"x":-296,"y":214,"label":"SplitGesture"}},"SendNorth_c562k":{"component":"strings/SendString","metadata":{"x":1733,"y":447,"label":"SendNorth"}},"SendEast_218qx":{"component":"strings/SendString","metadata":{"x":1721,"y":-5,"label":"SendEast"}},"RouteDirection_apgsp":{"component":"gestures/CardinalRouter","metadata":{"x":1469,"y":195,"label":"RouteDirection"}},"GetIndividualPointer_ozjfa":{"component":"objects/SplitObject","metadata":{"x":-86,"y":214,"label":"GetIndividualPointer"}},"GetStartPoint_bhrl2":{"component":"objects/GetObjectKey","metadata":{"x":879,"y":157,"label":"GetStartPoint"}},"GetCurrentPoint_rwwt0":{"component":"objects/GetObjectKey","metadata":{"x":877,"y":259,"label":"GetCurrentPoint"}},"GetGestureAngle_djpr6":{"component":"math/CalculateAngle","metadata":{"x":1083,"y":193,"label":"GetGestureAngle"}},"SendWest_rkdz9":{"component":"strings/SendString","metadata":{"x":1730.8333333333333,"y":348.33333333333337,"label":"SendWest"}},"SendSouth_wx2b5":{"component":"strings/SendString","metadata":{"x":1721.8333333333333,"y":107.33333333333337,"label":"SendSouth"}},"Fail_5b0qo":{"component":"core/Merge","metadata":{"x":1738.1666666666665,"y":564,"label":"Fail"}},"core/Split_n3qif":{"component":"core/Split","metadata":{"x":1276.999999999999,"y":193.66666666666669,"label":"core/Split"}},"GetDistance_owyyb":{"component":"objects/GetObjectKey","metadata":{"x":304,"y":216,"label":"GetDistance"}},"CheckMaxDistance_cebq5":{"component":"math/Compare","metadata":{"x":499,"y":214,"label":"CheckMaxDistance"}},"SendPointer_v0eqv":{"component":"strings/SendString","metadata":{"x":688,"y":214,"label":"SendPointer"}},"SplitPointer_v0u8k":{"component":"core/Split","metadata":{"x":109.00000000000006,"y":215.33333333333331,"label":"SplitPointer"}}},"connections":[{"src":{"process":"GetStartPoint_bhrl2","port":"object"},"tgt":{"process":"GetCurrentPoint_rwwt0","port":"in"},"metadata":{"route":9}},{"src":{"process":"GetStartPoint_bhrl2","port":"out"},"tgt":{"process":"GetGestureAngle_djpr6","port":"origin"},"metadata":{"route":9}},{"src":{"process":"GetCurrentPoint_rwwt0","port":"out"},"tgt":{"process":"GetGestureAngle_djpr6","port":"destination"},"metadata":{"route":9}},{"src":{"process":"SplitGesture_dkk87","port":"out"},"tgt":{"process":"SendEast_218qx","port":"string"},"metadata":{"route":9}},{"src":{"process":"SplitGesture_dkk87","port":"out"},"tgt":{"process":"SendWest_rkdz9","port":"string"},"metadata":{"route":9}},{"src":{"process":"SplitGesture_dkk87","port":"out"},"tgt":{"process":"SendNorth_c562k","port":"string"},"metadata":{"route":9}},{"src":{"process":"SplitGesture_dkk87","port":"out"},"tgt":{"process":"SendSouth_wx2b5","port":"string"},"metadata":{"route":9}},{"src":{"process":"RouteDirection_apgsp","port":"n"},"tgt":{"process":"SendNorth_c562k","port":"in"},"metadata":{"route":4}},{"src":{"process":"RouteDirection_apgsp","port":"w"},"tgt":{"process":"SendWest_rkdz9","port":"in"},"metadata":{"route":5}},{"src":{"process":"RouteDirection_apgsp","port":"s"},"tgt":{"process":"SendSouth_wx2b5","port":"in"},"metadata":{"route":6}},{"src":{"process":"RouteDirection_apgsp","port":"e"},"tgt":{"process":"SendEast_218qx","port":"in"},"metadata":{"route":7}},{"src":{"process":"ReceiveGesture_thbmw","port":"out"},"tgt":{"process":"SplitGesture_dkk87","port":"in"},"metadata":{"route":9}},{"src":{"process":"SplitGesture_dkk87","port":"out"},"tgt":{"process":"GetIndividualPointer_ozjfa","port":"in"},"metadata":{"route":9}},{"src":{"process":"GetCurrentPoint_rwwt0","port":"missed"},"tgt":{"process":"Fail_5b0qo","port":"in"},"metadata":{"route":1}},{"src":{"process":"GetStartPoint_bhrl2","port":"missed"},"tgt":{"process":"Fail_5b0qo","port":"in"},"metadata":{"route":1}},{"src":{"process":"GetGestureAngle_djpr6","port":"angle"},"tgt":{"process":"core/Split_n3qif","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_n3qif","port":"out"},"tgt":{"process":"RouteDirection_apgsp","port":"degrees"},"metadata":{"route":9}},{"src":{"process":"core/Split_n3qif","port":"out"},"tgt":{"process":"GetGestureAngle_djpr6","port":"clear"},"metadata":{"route":0}},{"src":{"process":"GetIndividualPointer_ozjfa","port":"out"},"tgt":{"process":"SplitPointer_v0u8k","port":"in"},"metadata":{"route":9}},{"src":{"process":"SplitPointer_v0u8k","port":"out"},"tgt":{"process":"SendPointer_v0eqv","port":"string"},"metadata":{"route":9}},{"src":{"process":"SendPointer_v0eqv","port":"out"},"tgt":{"process":"GetStartPoint_bhrl2","port":"in"},"metadata":{"route":9}},{"src":{"process":"CheckMaxDistance_cebq5","port":"pass"},"tgt":{"process":"SendPointer_v0eqv","port":"in"},"metadata":{"route":9}},{"src":{"process":"CheckMaxDistance_cebq5","port":"fail"},"tgt":{"process":"Fail_5b0qo","port":"in"},"metadata":{"route":1}},{"src":{"process":"GetDistance_owyyb","port":"missed"},"tgt":{"process":"Fail_5b0qo","port":"in"},"metadata":{"route":1}},{"src":{"process":"SplitPointer_v0u8k","port":"out"},"tgt":{"process":"GetDistance_owyyb","port":"in"},"metadata":{"route":0}},{"src":{"process":"GetDistance_owyyb","port":"out"},"tgt":{"process":"CheckMaxDistance_cebq5","port":"value"},"metadata":{"route":9}},{"data":"startpoint","tgt":{"process":"GetStartPoint_bhrl2","port":"key"}},{"data":"movepoint","tgt":{"process":"GetCurrentPoint_rwwt0","port":"key"}},{"data":"distance","tgt":{"process":"GetDistance_owyyb","port":"key"}},{"data":"<=","tgt":{"process":"CheckMaxDistance_cebq5","port":"operator"}}]}');
});
require.register("noflo-noflo-gestures/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of noflo-gestures.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-gestures/graphs/DetectDrag.json", function(exports, require, module){
module.exports = JSON.parse('{"properties":{"environment":{"runtime":"html","src":"./preview/iframe.html","width":"300","height":"300","content":""},"name":"DetectDrag"},"exports":[{"private":"receivegesture_3bwyo.in","public":"in"},{"private":"checkmindistance_zsyhq.comparison","public":"distance"},{"private":"sendpass_lskxq.out","public":"pass"},{"private":"sendfail_64mm2.out","public":"fail"},{"private":"checkmaxspeed_sojti.comparison","public":"maxspeed"}],"processes":{"ReceiveGesture_3bwyo":{"component":"core/Repeat","metadata":{"x":-605,"y":82,"label":"ReceiveGesture"}},"core/Split_qfhom":{"component":"core/Split","metadata":{"x":-605,"y":159,"label":"core/Split"}},"SendPass_lskxq":{"component":"strings/SendString","metadata":{"x":1143,"y":28,"label":"SendPass"}},"SendFail_64mm2":{"component":"strings/SendString","metadata":{"x":1145,"y":305,"label":"SendFail"}},"Failures_13q8s":{"component":"core/Merge","metadata":{"x":941,"y":311,"label":"Failures"}},"GetDistance_bjx0s":{"component":"objects/GetObjectKey","metadata":{"x":526,"y":161,"label":"GetDistance"}},"CheckMinDistance_zsyhq":{"component":"math/Compare","metadata":{"x":900,"y":160,"label":"CheckMinDistance"}},"GetIndividualPointer_hv93t":{"component":"objects/SplitObject","metadata":{"x":-410,"y":159,"label":"GetIndividualPointer"}},"SplitDistance_vreyf":{"component":"core/Split","metadata":{"x":711.9999999999998,"y":160,"label":"SplitDistance"}},"SplitPointer_8rn9q":{"component":"core/Split","metadata":{"x":-223.5000000000008,"y":159.16666666666666,"label":"SplitPointer"}},"SendPointer_b4unv":{"component":"strings/SendString","metadata":{"x":340.3333333333328,"y":160.16666666666669,"label":"SendPointer"}},"GetSpeed_o56fp":{"component":"objects/GetObjectKey","metadata":{"x":-40.49999999999977,"y":159,"label":"GetSpeed"}},"CheckMaxSpeed_sojti":{"component":"math/Compare","metadata":{"x":150.50000000000023,"y":161,"label":"CheckMaxSpeed"}}},"connections":[{"src":{"process":"ReceiveGesture_3bwyo","port":"out"},"tgt":{"process":"core/Split_qfhom","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_qfhom","port":"out"},"tgt":{"process":"SendFail_64mm2","port":"string"},"metadata":{"route":9}},{"src":{"process":"core/Split_qfhom","port":"out"},"tgt":{"process":"SendPass_lskxq","port":"string"},"metadata":{"route":9}},{"src":{"process":"Failures_13q8s","port":"out"},"tgt":{"process":"SendFail_64mm2","port":"in"},"metadata":{"route":1}},{"src":{"process":"GetDistance_bjx0s","port":"missed"},"tgt":{"process":"Failures_13q8s","port":"in"},"metadata":{"route":1}},{"src":{"process":"CheckMinDistance_zsyhq","port":"fail"},"tgt":{"process":"Failures_13q8s","port":"in"},"metadata":{"route":1}},{"src":{"process":"core/Split_qfhom","port":"out"},"tgt":{"process":"GetIndividualPointer_hv93t","port":"in"},"metadata":{"route":9}},{"src":{"process":"GetDistance_bjx0s","port":"out"},"tgt":{"process":"SplitDistance_vreyf","port":"in"},"metadata":{"route":9}},{"src":{"process":"SplitDistance_vreyf","port":"out"},"tgt":{"process":"CheckMinDistance_zsyhq","port":"value"},"metadata":{"route":9}},{"src":{"process":"GetIndividualPointer_hv93t","port":"out"},"tgt":{"process":"SplitPointer_8rn9q","port":"in"},"metadata":{"route":8}},{"src":{"process":"CheckMinDistance_zsyhq","port":"pass"},"tgt":{"process":"SendPass_lskxq","port":"in"},"metadata":{"route":5}},{"src":{"process":"SendPointer_b4unv","port":"out"},"tgt":{"process":"GetDistance_bjx0s","port":"in"},"metadata":{"route":9}},{"src":{"process":"SplitPointer_8rn9q","port":"out"},"tgt":{"process":"SendPointer_b4unv","port":"string"},"metadata":{"route":9}},{"src":{"process":"CheckMaxSpeed_sojti","port":"pass"},"tgt":{"process":"SendPointer_b4unv","port":"in"},"metadata":{"route":5}},{"src":{"process":"GetSpeed_o56fp","port":"out"},"tgt":{"process":"CheckMaxSpeed_sojti","port":"value"},"metadata":{"route":9}},{"src":{"process":"SplitPointer_8rn9q","port":"out"},"tgt":{"process":"GetSpeed_o56fp","port":"in"},"metadata":{"route":8}},{"src":{"process":"GetSpeed_o56fp","port":"missed"},"tgt":{"process":"Failures_13q8s","port":"in"},"metadata":{"route":1}},{"src":{"process":"CheckMaxSpeed_sojti","port":"fail"},"tgt":{"process":"Failures_13q8s","port":"in"},"metadata":{"route":1}},{"data":"distance","tgt":{"process":"GetDistance_bjx0s","port":"key"}},{"data":">=","tgt":{"process":"CheckMinDistance_zsyhq","port":"operator"}},{"data":"<=","tgt":{"process":"CheckMaxSpeed_sojti","port":"operator"}},{"data":"speed","tgt":{"process":"GetSpeed_o56fp","port":"key"}}]}');
});
require.register("noflo-noflo-gestures/graphs/DetectSwipe.json", function(exports, require, module){
module.exports = JSON.parse('{"properties":{"environment":{"runtime":"html","src":"./preview/iframe.html","width":"300","height":"300","content":""},"name":"DetectSwipe"},"exports":[{"private":"receivegesture_7fxc3.in","public":"in"},{"private":"sendpass_iuc21.out","public":"pass"},{"private":"sendfail_n9iay.out","public":"fail"},{"private":"checkspeed_cru21.comparison","public":"speed"},{"private":"checkdistance_786cc.comparison","public":"distance"}],"processes":{"ReceiveGesture_7fxc3":{"component":"core/Repeat","metadata":{"x":277,"y":124,"label":"ReceiveGesture"}},"GetIndividualPointer_9o878":{"component":"objects/SplitObject","metadata":{"x":473,"y":217,"label":"GetIndividualPointer"}},"SendPass_iuc21":{"component":"strings/SendString","metadata":{"x":2060,"y":113,"label":"SendPass"}},"GetSpeed_26n6h":{"component":"objects/GetObjectKey","metadata":{"x":863,"y":216,"label":"GetSpeed"}},"DetectionFailed_uj7oh":{"component":"core/Merge","metadata":{"x":1850,"y":337,"label":"DetectionFailed"}},"core/Split_cbjyy":{"component":"core/Split","metadata":{"x":273,"y":216,"label":"core/Split"}},"SendFail_n9iay":{"component":"strings/SendString","metadata":{"x":2062,"y":337.16666666666663,"label":"SendFail"}},"CheckSpeed_cru21":{"component":"math/Compare","metadata":{"x":1055.6666666666665,"y":215.66666666666666,"label":"CheckSpeed"}},"strings/SendString_75se6":{"component":"strings/SendString","metadata":{"x":1250.6666666666665,"y":216.66666666666666,"label":"strings/SendString"}},"GetDistance_zdjyf":{"component":"objects/GetObjectKey","metadata":{"x":1445.6666666666665,"y":215.66666666666666,"label":"GetDistance"}},"CheckDistance_786cc":{"component":"math/Compare","metadata":{"x":1648,"y":216,"label":"CheckDistance"}},"core/Split_x6p93":{"component":"core/Split","metadata":{"x":667.9999999999986,"y":215.66666666666663,"label":"core/Split"}}},"connections":[{"src":{"process":"GetSpeed_26n6h","port":"missed"},"tgt":{"process":"DetectionFailed_uj7oh","port":"in"},"metadata":{"route":1}},{"src":{"process":"CheckSpeed_cru21","port":"pass"},"tgt":{"process":"strings/SendString_75se6","port":"in"},"metadata":{"route":5}},{"src":{"process":"GetSpeed_26n6h","port":"out"},"tgt":{"process":"CheckSpeed_cru21","port":"value"},"metadata":{"route":1}},{"src":{"process":"CheckSpeed_cru21","port":"fail"},"tgt":{"process":"DetectionFailed_uj7oh","port":"in"},"metadata":{"route":1}},{"src":{"process":"strings/SendString_75se6","port":"out"},"tgt":{"process":"GetDistance_zdjyf","port":"in"},"metadata":{"route":5}},{"src":{"process":"GetDistance_zdjyf","port":"missed"},"tgt":{"process":"DetectionFailed_uj7oh","port":"in"},"metadata":{"route":1}},{"src":{"process":"CheckDistance_786cc","port":"fail"},"tgt":{"process":"DetectionFailed_uj7oh","port":"in"},"metadata":{"route":1}},{"src":{"process":"GetDistance_zdjyf","port":"out"},"tgt":{"process":"CheckDistance_786cc","port":"value"},"metadata":{"route":5}},{"src":{"process":"CheckDistance_786cc","port":"pass"},"tgt":{"process":"SendPass_iuc21","port":"in"},"metadata":{"route":5}},{"src":{"process":"DetectionFailed_uj7oh","port":"out"},"tgt":{"process":"SendFail_n9iay","port":"in"},"metadata":{"route":1}},{"src":{"process":"ReceiveGesture_7fxc3","port":"out"},"tgt":{"process":"core/Split_cbjyy","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_cbjyy","port":"out"},"tgt":{"process":"SendPass_iuc21","port":"string"},"metadata":{"route":9}},{"src":{"process":"core/Split_cbjyy","port":"out"},"tgt":{"process":"SendFail_n9iay","port":"string"},"metadata":{"route":9}},{"src":{"process":"core/Split_cbjyy","port":"out"},"tgt":{"process":"GetIndividualPointer_9o878","port":"in"},"metadata":{"route":9}},{"src":{"process":"GetIndividualPointer_9o878","port":"out"},"tgt":{"process":"core/Split_x6p93","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_x6p93","port":"out"},"tgt":{"process":"strings/SendString_75se6","port":"string"},"metadata":{"route":9}},{"src":{"process":"core/Split_x6p93","port":"out"},"tgt":{"process":"GetSpeed_26n6h","port":"in"},"metadata":{"route":9}},{"data":"speed","tgt":{"process":"GetSpeed_26n6h","port":"key"}},{"data":"distance","tgt":{"process":"GetDistance_zdjyf","port":"key"}},{"data":">=","tgt":{"process":"CheckSpeed_cru21","port":"operator"}},{"data":">=","tgt":{"process":"CheckDistance_786cc","port":"operator"}}]}');
});
require.register("noflo-noflo-gestures/graphs/DetectPinch.json", function(exports, require, module){
module.exports = JSON.parse('{"properties":{"environment":{"runtime":"html","src":"./preview/iframe.html","width":"300","height":"300","content":""},"name":"DetectPinch"},"exports":[{"private":"core/split_ewbre.in","public":"in"},{"private":"sendpass_cf0pu.out","public":"pass"},{"private":"sendfail_vmi5n.out","public":"fail"}],"processes":{"core/Split_ewbre":{"component":"core/Split","metadata":{"x":740,"y":151,"label":"core/Split"}},"SendFail_vmi5n":{"component":"strings/SendString","metadata":{"x":1423,"y":259,"label":"SendFail"}},"SendPass_cf0pu":{"component":"strings/SendString","metadata":{"x":1421,"y":65,"label":"SendPass"}},"objects/Size_jjmmg":{"component":"objects/Size","metadata":{"x":939,"y":150,"label":"objects/Size"}},"math/Compare_hk3su":{"component":"math/Compare","metadata":{"x":1146,"y":147,"label":"math/Compare"}}},"connections":[{"src":{"process":"objects/Size_jjmmg","port":"out"},"tgt":{"process":"math/Compare_hk3su","port":"value"},"metadata":{"route":9}},{"src":{"process":"math/Compare_hk3su","port":"pass"},"tgt":{"process":"SendPass_cf0pu","port":"in"},"metadata":{"route":5}},{"src":{"process":"math/Compare_hk3su","port":"fail"},"tgt":{"process":"SendFail_vmi5n","port":"in"},"metadata":{"route":1}},{"src":{"process":"core/Split_ewbre","port":"out"},"tgt":{"process":"SendFail_vmi5n","port":"string"},"metadata":{"route":9}},{"src":{"process":"core/Split_ewbre","port":"out"},"tgt":{"process":"SendPass_cf0pu","port":"string"},"metadata":{"route":9}},{"src":{"process":"core/Split_ewbre","port":"out"},"tgt":{"process":"objects/Size_jjmmg","port":"in"},"metadata":{"route":9}},{"data":1,"tgt":{"process":"math/Compare_hk3su","port":"comparison"}},{"data":">","tgt":{"process":"math/Compare_hk3su","port":"operator"}}]}');
});
require.register("noflo-noflo-gestures/graphs/FilterByTarget.json", function(exports, require, module){
module.exports = JSON.parse('{"properties":{"name":"FilterByTarget"},"exports":[{"private":"StartEvent_rjg24.in","public":"started"},{"private":"GetTarget_7cfim.object","public":"startevent"},{"private":"MoveEvent_reuhl.in","public":"move"},{"private":"VerifyTarget_ty3p5.accept","public":"accept"},{"private":"TargetElement_9tv87.out","public":"target"},{"private":"OnTarget_l85x9.out","public":"ontarget"},{"private":"AllowedMoves_y6ulv.out","public":"move"}],"processes":{"GetTarget_7cfim":{"component":"objects/GetObjectKey","metadata":{"x":634,"y":210,"label":"GetTarget"}},"MoveEvent_reuhl":{"component":"core/Repeat","metadata":{"x":425,"y":362,"label":"MoveEvent"}},"SplitTarget_sqlg0":{"component":"core/Split","metadata":{"x":836,"y":212,"label":"SplitTarget"}},"StartEvent_rjg24":{"component":"core/Repeat","metadata":{"x":426.00000000000006,"y":213,"label":"StartEvent"}},"VerifyTarget_ty3p5":{"component":"objects/FilterPropertyValue","metadata":{"x":1051.3333333333335,"y":211.33333333333331,"label":"VerifyTarget"}},"AllowedMoves_y6ulv":{"component":"flow/Gate","metadata":{"x":1508.6666666666665,"y":212.5,"label":"AllowedMoves"}},"SplitOnTarget_xmi67":{"component":"core/Split","metadata":{"x":1275.833333333334,"y":209.66666666666669,"label":"SplitOnTarget"}},"OnTarget_l85x9":{"component":"core/Repeat","metadata":{"x":1509.833333333334,"y":118.66666666666669,"label":"OnTarget"}},"TargetElement_9tv87":{"component":"core/Repeat","metadata":{"x":1507.833333333334,"y":26.666666666666686,"label":"TargetElement"}}},"connections":[{"src":{"process":"GetTarget_7cfim","port":"out"},"tgt":{"process":"SplitTarget_sqlg0","port":"in"},"metadata":{"route":5}},{"src":{"process":"StartEvent_rjg24","port":"out"},"tgt":{"process":"GetTarget_7cfim","port":"in"},"metadata":{"route":5}},{"src":{"process":"SplitTarget_sqlg0","port":"out"},"tgt":{"process":"VerifyTarget_ty3p5","port":"in"},"metadata":{"route":5}},{"src":{"process":"MoveEvent_reuhl","port":"out"},"tgt":{"process":"AllowedMoves_y6ulv","port":"in"},"metadata":{"route":2}},{"src":{"process":"VerifyTarget_ty3p5","port":"missed"},"tgt":{"process":"AllowedMoves_y6ulv","port":"close"},"metadata":{"route":1}},{"src":{"process":"VerifyTarget_ty3p5","port":"out"},"tgt":{"process":"SplitOnTarget_xmi67","port":"in"},"metadata":{"route":5}},{"src":{"process":"SplitOnTarget_xmi67","port":"out"},"tgt":{"process":"AllowedMoves_y6ulv","port":"open"},"metadata":{"route":5}},{"src":{"process":"SplitOnTarget_xmi67","port":"out"},"tgt":{"process":"OnTarget_l85x9","port":"in"},"metadata":{"route":5}},{"src":{"process":"SplitTarget_sqlg0","port":"out"},"tgt":{"process":"TargetElement_9tv87","port":"in"},"metadata":{"route":5}},{"data":"target","tgt":{"process":"GetTarget_7cfim","port":"key"}}]}');
});
require.register("noflo-noflo-gestures/graphs/GestureToObject.json", function(exports, require, module){
module.exports = JSON.parse('{"properties":{"environment":{"runtime":"html","src":"./preview/iframe.html","width":"300","height":"300","content":""},"name":"Behavior"},"exports":[{"private":"listengestures_ns8li.element","public":"element"},{"private":"gesturedatatoobject_yh3yq.out","public":"out"}],"processes":{"ListenGestures_ns8li":{"component":"gestures/ListenGestures","metadata":{"x":609,"y":139,"label":"ListenGestures"}},"GestureDataToObject_yh3yq":{"component":"groups/CollectObject","metadata":{"x":1252,"y":159,"label":"GestureDataToObject"}},"SplitEnd_akdq1":{"component":"core/Split","metadata":{"x":847.1666666666667,"y":85.66666666666666,"label":"SplitEnd"}},"ClearOnEnd_9w9o":{"component":"core/RepeatAsync","metadata":{"x":1051.1666666666667,"y":88.66666666666666,"label":"ClearOnEnd"}},"SplitSpeed_2jnkm":{"component":"core/Split","metadata":{"x":849.5,"y":147.5,"label":"SplitSpeed"}},"SplitStart_hr2rx":{"component":"core/Split","metadata":{"x":845.833333333333,"y":23.50000000000003,"label":"SplitStart"}},"ReleaseMoveOrEnd_ahcs5":{"component":"core/Merge","metadata":{"x":1050.3333333333326,"y":157.83333333333331,"label":"ReleaseMoveOrEnd"}}},"connections":[{"src":{"process":"SplitEnd_akdq1","port":"out"},"tgt":{"process":"ClearOnEnd_9w9o","port":"in"},"metadata":{"route":1}},{"src":{"process":"ClearOnEnd_9w9o","port":"out"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"clear"},"metadata":{"route":1}},{"src":{"process":"ListenGestures_ns8li","port":"end"},"tgt":{"process":"SplitEnd_akdq1","port":"in"},"metadata":{"route":1}},{"src":{"process":"ListenGestures_ns8li","port":"start"},"tgt":{"process":"SplitStart_hr2rx","port":"in"},"metadata":{"route":5}},{"src":{"process":"SplitStart_hr2rx","port":"out"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":5}},{"src":{"process":"ListenGestures_ns8li","port":"startpoint"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":5}},{"src":{"process":"ListenGestures_ns8li","port":"elements"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":7}},{"src":{"process":"ListenGestures_ns8li","port":"angle"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":9}},{"src":{"process":"ListenGestures_ns8li","port":"distance"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":9}},{"src":{"process":"SplitSpeed_2jnkm","port":"out"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":9}},{"src":{"process":"ListenGestures_ns8li","port":"movepoint"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":3}},{"src":{"process":"ListenGestures_ns8li","port":"current"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":3}},{"src":{"process":"ListenGestures_ns8li","port":"duration"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":9}},{"src":{"process":"SplitEnd_akdq1","port":"out"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":1}},{"src":{"process":"ListenGestures_ns8li","port":"endpoint"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"collect"},"metadata":{"route":1}},{"src":{"process":"ListenGestures_ns8li","port":"speed"},"tgt":{"process":"SplitSpeed_2jnkm","port":"in"},"metadata":{"route":8}},{"src":{"process":"SplitSpeed_2jnkm","port":"out"},"tgt":{"process":"ReleaseMoveOrEnd_ahcs5","port":"in"},"metadata":{"route":8}},{"src":{"process":"SplitEnd_akdq1","port":"out"},"tgt":{"process":"ReleaseMoveOrEnd_ahcs5","port":"in"},"metadata":{"route":1}},{"src":{"process":"ReleaseMoveOrEnd_ahcs5","port":"out"},"tgt":{"process":"GestureDataToObject_yh3yq","port":"release"},"metadata":{"route":8}},{"data":"elements","tgt":{"process":"GestureDataToObject_yh3yq","port":"allpackets"}},{"data":"startelement,startpoint,elements,angle,distance,speed,movepoint,current,duration,endelement,endpoint","tgt":{"process":"GestureDataToObject_yh3yq","port":"keys"}}]}');
});
require.register("noflo-noflo-gestures/graphs/ListenGestures.json", function(exports, require, module){
module.exports = JSON.parse('{"properties":{"environment":{"runtime":"html","src":"./preview/iframe.html","width":"300","height":"300","content":""},"name":"ListenGestures"},"exports":[{"private":"gestures/listenpointer_8ftd1.element","public":"element"},{"private":"movepoint_fjlur.out","public":"movepoint"},{"private":"distance_kwk39.out","public":"distance"},{"private":"gestureelements_yvm9m.out","public":"elements"},{"private":"angle_43qpo.out","public":"angle"},{"private":"speed_e99jq.out","public":"speed"},{"private":"getstartelement_w7m64.out","public":"start"},{"private":"startpoint_u8int.out","public":"startpoint"},{"private":"getendelement_slbp9.out","public":"end"},{"private":"getendingpoint_dettb.client","public":"endpoint"},{"private":"currentelement_cu0q5.out","public":"current"},{"private":"duration_qyevv.out","public":"duration"}],"processes":{"GestureStart_r8vr5":{"component":"core/Split","metadata":{"x":466,"y":-31,"label":"GestureStart"}},"GetStartingPoint_pidfs":{"component":"interaction/ReadCoordinates","metadata":{"x":765,"y":-191,"label":"GetStartingPoint"}},"GetMovePoint_9dia9":{"component":"interaction/ReadCoordinates","metadata":{"x":1368,"y":136,"label":"GetMovePoint"}},"core/Split_baeeb":{"component":"core/Split","metadata":{"x":1563,"y":137,"label":"core/Split"}},"core/Split_4ds1h":{"component":"core/Split","metadata":{"x":973,"y":-191,"label":"core/Split"}},"GestureAngle_dwjj":{"component":"math/CalculateAngle","metadata":{"x":1939,"y":-127,"label":"GestureAngle"}},"GestureDistance_esqkc":{"component":"math/CalculateDistance","metadata":{"x":1934,"y":20,"label":"GestureDistance"}},"LastMove_p5yj7":{"component":"core/Kick","metadata":{"x":1062,"y":176,"label":"LastMove"}},"GestureEnd_qqx8o":{"component":"core/Split","metadata":{"x":460,"y":162,"label":"GestureEnd"}},"GestureMove_hy46s":{"component":"core/Split","metadata":{"x":463,"y":65,"label":"GestureMove"}},"AllTouchedElements_i3x74":{"component":"packets/UniquePacket","metadata":{"x":1445,"y":6,"label":"AllTouchedElements"}},"GetMoveElement_iaexm":{"component":"objects/GetObjectKey","metadata":{"x":1059,"y":6,"label":"GetMoveElement"}},"GetStartElement_w7m64":{"component":"objects/GetObjectKey","metadata":{"x":968,"y":-404.66666666666663,"label":"GetStartElement"}},"MoveDate_6bjnl":{"component":"objects/CreateDate","metadata":{"x":2145,"y":164,"label":"MoveDate"}},"StartDate_swbwu":{"component":"objects/CreateDate","metadata":{"x":968,"y":-281,"label":"StartDate"}},"math/Subtract_j5v20":{"component":"math/Subtract","metadata":{"x":2516,"y":-193,"label":"math/Subtract"}},"SetStart_ql51c":{"component":"strings/SendString","metadata":{"x":765,"y":-284,"label":"SetStart"}},"math/Divide_x4gc8":{"component":"math/Divide","metadata":{"x":2939,"y":-199,"label":"math/Divide"}},"core/Split_x0a12":{"component":"core/Split","metadata":{"x":2151,"y":23,"label":"core/Split"}},"objects/CallMethod_iu7k2":{"component":"objects/CallMethod","metadata":{"x":2348,"y":167,"label":"objects/CallMethod"}},"objects/CallMethod_rtfd2":{"component":"objects/CallMethod","metadata":{"x":2139,"y":-274,"label":"objects/CallMethod"}},"Distance_kwk39":{"component":"core/Repeat","metadata":{"x":2580,"y":20,"label":"Distance"}},"GestureElements_yvm9m":{"component":"core/Repeat","metadata":{"x":1639,"y":4,"label":"GestureElements"}},"Angle_43qpo":{"component":"core/Repeat","metadata":{"x":2312,"y":-121,"label":"Angle"}},"Speed_e99jq":{"component":"core/Repeat","metadata":{"x":3362,"y":-171,"label":"Speed"}},"MovePoint_fjlur":{"component":"core/Repeat","metadata":{"x":1939,"y":262,"label":"MovePoint"}},"StartPoint_u8int":{"component":"core/Repeat","metadata":{"x":1382,"y":-189,"label":"StartPoint"}},"gestures/ListenPointer_8ftd1":{"component":"gestures/ListenPointer","metadata":{"x":213,"y":-1,"label":"gestures/ListenPointer"}},"GetEndElement_slbp9":{"component":"objects/GetObjectKey","metadata":{"x":1367.3333333333335,"y":283.3333333333335,"label":"GetEndElement"}},"core/RepeatAsync_c56tj":{"component":"core/RepeatAsync","metadata":{"x":1058.666666666667,"y":312.33333333333326,"label":"core/RepeatAsync"}},"strings/SendString_t6gby":{"component":"strings/SendString","metadata":{"x":1935,"y":166.33333333333337,"label":"strings/SendString"}},"groups/SendByGroup_z06kk":{"component":"groups/SendByGroup","metadata":{"x":556,"y":-151.66666666666669,"label":"groups/SendByGroup"}},"core/Split_ekxij":{"component":"core/Split","metadata":{"x":3158.5,"y":-166.33333333333343,"label":"core/Split"}},"core/Split_eph3d":{"component":"core/Split","metadata":{"x":2123.333333333334,"y":-122.66666666666669,"label":"core/Split"}},"core/Split_3elep":{"component":"core/Split","metadata":{"x":2731.1666666666697,"y":-171.83333333333258,"label":"core/Split"}},"core/Split_8l3yu":{"component":"core/Split","metadata":{"x":1251.3333333333333,"y":7.166666666666629,"label":"core/Split"}},"CurrentElement_cu0q5":{"component":"core/Repeat","metadata":{"x":1599.833333333333,"y":-192.00000000000006,"label":"CurrentElement"}},"Duration_qyevv":{"component":"core/Repeat","metadata":{"x":2937.833333333333,"y":-295.83333333333326,"label":"Duration"}},"GetEndingPoint_dettb":{"component":"interaction/ReadCoordinates","metadata":{"x":727.8333333333331,"y":335.3333333333333,"label":"GetEndingPoint"}},"core/Merge_6so":{"component":"core/Merge","metadata":{"x":1196.666666666667,"y":-188.99999999999983,"label":"core/Merge"}},"interaction/ReadCoordinates_82cb1":{"component":"interaction/ReadCoordinates","metadata":{"x":767.3333333333339,"y":-85.83333333333314,"label":"interaction/ReadCoordinates"}},"core/Drop_sa8z5":{"component":"core/Drop","metadata":{"x":1596.833333333333,"y":326.0000000000001,"label":"core/Drop"}},"core/Merge_lqxll":{"component":"core/Merge","metadata":{"x":768.9999999999995,"y":-403.66666666666663,"label":"core/Merge"}},"groups/SendByGroup_8yaj":{"component":"groups/SendByGroup","metadata":{"x":1166.999999999999,"y":-286.83333333333326,"label":"groups/SendByGroup"}}},"connections":[{"src":{"process":"core/Split_4ds1h","port":"out"},"tgt":{"process":"GestureAngle_dwjj","port":"origin"},"metadata":{"route":5}},{"src":{"process":"core/Split_baeeb","port":"out"},"tgt":{"process":"GestureAngle_dwjj","port":"destination"},"metadata":{"route":3}},{"src":{"process":"core/Split_4ds1h","port":"out"},"tgt":{"process":"GestureDistance_esqkc","port":"origin"},"metadata":{"route":5}},{"src":{"process":"core/Split_baeeb","port":"out"},"tgt":{"process":"GestureDistance_esqkc","port":"destination"},"metadata":{"route":3}},{"src":{"process":"GetMovePoint_9dia9","port":"client"},"tgt":{"process":"core/Split_baeeb","port":"in"},"metadata":{"route":3}},{"src":{"process":"GetStartingPoint_pidfs","port":"client"},"tgt":{"process":"core/Split_4ds1h","port":"in"},"metadata":{"route":5}},{"src":{"process":"SetStart_ql51c","port":"out"},"tgt":{"process":"StartDate_swbwu","port":"in"},"metadata":{"route":5}},{"src":{"process":"GestureDistance_esqkc","port":"distance"},"tgt":{"process":"core/Split_x0a12","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_x0a12","port":"out"},"tgt":{"process":"math/Divide_x4gc8","port":"dividend"},"metadata":{"route":9}},{"src":{"process":"objects/CallMethod_iu7k2","port":"out"},"tgt":{"process":"math/Subtract_j5v20","port":"minuend"},"metadata":{"route":3}},{"src":{"process":"MoveDate_6bjnl","port":"out"},"tgt":{"process":"objects/CallMethod_iu7k2","port":"in"},"metadata":{"route":3}},{"src":{"process":"core/Split_x0a12","port":"out"},"tgt":{"process":"Distance_kwk39","port":"in"},"metadata":{"route":9}},{"src":{"process":"AllTouchedElements_i3x74","port":"out"},"tgt":{"process":"GestureElements_yvm9m","port":"in"},"metadata":{"route":3}},{"src":{"process":"core/Split_baeeb","port":"out"},"tgt":{"process":"MovePoint_fjlur","port":"in"},"metadata":{"route":3}},{"src":{"process":"gestures/ListenPointer_8ftd1","port":"end"},"tgt":{"process":"GestureEnd_qqx8o","port":"in"},"metadata":{"route":1}},{"src":{"process":"gestures/ListenPointer_8ftd1","port":"move"},"tgt":{"process":"GestureMove_hy46s","port":"in"},"metadata":{"route":3}},{"src":{"process":"gestures/ListenPointer_8ftd1","port":"start"},"tgt":{"process":"GestureStart_r8vr5","port":"in"},"metadata":{"route":5}},{"src":{"process":"LastMove_p5yj7","port":"out"},"tgt":{"process":"GetEndElement_slbp9","port":"in"},"metadata":{"route":1}},{"src":{"process":"GestureEnd_qqx8o","port":"out"},"tgt":{"process":"LastMove_p5yj7","port":"in"},"metadata":{"route":1}},{"src":{"process":"GestureEnd_qqx8o","port":"out"},"tgt":{"process":"core/RepeatAsync_c56tj","port":"in"},"metadata":{"route":1}},{"src":{"process":"core/Split_baeeb","port":"out"},"tgt":{"process":"strings/SendString_t6gby","port":"in"},"metadata":{"route":3}},{"src":{"process":"strings/SendString_t6gby","port":"out"},"tgt":{"process":"MoveDate_6bjnl","port":"in"},"metadata":{"route":4}},{"src":{"process":"groups/SendByGroup_z06kk","port":"out"},"tgt":{"process":"GetStartingPoint_pidfs","port":"event"},"metadata":{"route":5}},{"src":{"process":"GestureStart_r8vr5","port":"out"},"tgt":{"process":"groups/SendByGroup_z06kk","port":"data"},"metadata":{"route":5}},{"src":{"process":"GestureMove_hy46s","port":"out"},"tgt":{"process":"groups/SendByGroup_z06kk","port":"in"},"metadata":{"route":3}},{"src":{"process":"GestureMove_hy46s","port":"out"},"tgt":{"process":"LastMove_p5yj7","port":"data"},"metadata":{"route":3}},{"src":{"process":"GestureMove_hy46s","port":"out"},"tgt":{"process":"GetMoveElement_iaexm","port":"in"},"metadata":{"route":3}},{"src":{"process":"GestureMove_hy46s","port":"out"},"tgt":{"process":"GetMovePoint_9dia9","port":"event"},"metadata":{"route":3}},{"src":{"process":"core/Split_x0a12","port":"out"},"tgt":{"process":"GestureDistance_esqkc","port":"clear"},"metadata":{"route":0}},{"src":{"process":"core/Split_ekxij","port":"out"},"tgt":{"process":"Speed_e99jq","port":"in"},"metadata":{"route":8}},{"src":{"process":"math/Divide_x4gc8","port":"quotient"},"tgt":{"process":"core/Split_ekxij","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_ekxij","port":"out"},"tgt":{"process":"math/Divide_x4gc8","port":"clear"},"metadata":{"route":0}},{"src":{"process":"core/RepeatAsync_c56tj","port":"out"},"tgt":{"process":"AllTouchedElements_i3x74","port":"clear"},"metadata":{"route":1}},{"src":{"process":"GestureAngle_dwjj","port":"angle"},"tgt":{"process":"core/Split_eph3d","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_eph3d","port":"out"},"tgt":{"process":"Angle_43qpo","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_eph3d","port":"out"},"tgt":{"process":"GestureAngle_dwjj","port":"clear"},"metadata":{"route":0}},{"src":{"process":"math/Subtract_j5v20","port":"difference"},"tgt":{"process":"core/Split_3elep","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_3elep","port":"out"},"tgt":{"process":"math/Divide_x4gc8","port":"divisor"},"metadata":{"route":9}},{"src":{"process":"GetMoveElement_iaexm","port":"out"},"tgt":{"process":"core/Split_8l3yu","port":"in"},"metadata":{"route":3}},{"src":{"process":"core/Split_8l3yu","port":"out"},"tgt":{"process":"AllTouchedElements_i3x74","port":"in"},"metadata":{"route":3}},{"src":{"process":"core/Split_8l3yu","port":"out"},"tgt":{"process":"CurrentElement_cu0q5","port":"in"},"metadata":{"route":3}},{"src":{"process":"core/Split_3elep","port":"out"},"tgt":{"process":"Duration_qyevv","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_3elep","port":"out"},"tgt":{"process":"math/Subtract_j5v20","port":"clear"},"metadata":{"route":0}},{"src":{"process":"GestureEnd_qqx8o","port":"out"},"tgt":{"process":"GetEndingPoint_dettb","port":"event"},"metadata":{"route":1}},{"src":{"process":"objects/CallMethod_rtfd2","port":"out"},"tgt":{"process":"math/Subtract_j5v20","port":"subtrahend"},"metadata":{"route":5}},{"src":{"process":"core/Split_4ds1h","port":"out"},"tgt":{"process":"core/Merge_6so","port":"in"},"metadata":{"route":5}},{"src":{"process":"core/Merge_6so","port":"out"},"tgt":{"process":"StartPoint_u8int","port":"in"},"metadata":{"route":5}},{"src":{"process":"interaction/ReadCoordinates_82cb1","port":"client"},"tgt":{"process":"core/Merge_6so","port":"in"},"metadata":{"route":5}},{"src":{"process":"GestureStart_r8vr5","port":"out"},"tgt":{"process":"interaction/ReadCoordinates_82cb1","port":"event"},"metadata":{"route":5}},{"src":{"process":"GetEndElement_slbp9","port":"missed"},"tgt":{"process":"core/Drop_sa8z5","port":"in"},"metadata":{"route":1}},{"src":{"process":"GestureStart_r8vr5","port":"out"},"tgt":{"process":"core/Merge_lqxll","port":"in"},"metadata":{"route":5}},{"src":{"process":"core/Merge_lqxll","port":"out"},"tgt":{"process":"GetStartElement_w7m64","port":"in"},"metadata":{"route":5}},{"src":{"process":"groups/SendByGroup_z06kk","port":"out"},"tgt":{"process":"core/Merge_lqxll","port":"in"},"metadata":{"route":5}},{"src":{"process":"groups/SendByGroup_8yaj","port":"out"},"tgt":{"process":"objects/CallMethod_rtfd2","port":"in"},"metadata":{"route":5}},{"src":{"process":"StartDate_swbwu","port":"out"},"tgt":{"process":"groups/SendByGroup_8yaj","port":"data"},"metadata":{"route":5}},{"src":{"process":"GestureStart_r8vr5","port":"out"},"tgt":{"process":"SetStart_ql51c","port":"in"},"metadata":{"route":5}},{"src":{"process":"GestureMove_hy46s","port":"out"},"tgt":{"process":"groups/SendByGroup_8yaj","port":"in"},"metadata":{"route":3}},{"data":"target","tgt":{"process":"GetMoveElement_iaexm","port":"key"}},{"data":"target","tgt":{"process":"GetStartElement_w7m64","port":"key"}},{"data":"now","tgt":{"process":"SetStart_ql51c","port":"string"}},{"data":"getTime","tgt":{"process":"objects/CallMethod_iu7k2","port":"method"}},{"data":"getTime","tgt":{"process":"objects/CallMethod_rtfd2","port":"method"}},{"data":"target","tgt":{"process":"GetEndElement_slbp9","port":"key"}},{"data":"now","tgt":{"process":"strings/SendString_t6gby","port":"string"}}]}');
});
require.register("noflo-noflo-gestures/graphs/ListenPointer.json", function(exports, require, module){
module.exports = JSON.parse('{"properties":{"name":"ListenPointer"},"exports":[{"private":"Listen_1025g.element","public":"element"},{"private":"Listen_1025g.capture","public":"capture"},{"private":"StartEvent_x8itv.out","public":"start"},{"private":"MoveEvent_qa3pp.out","public":"move"},{"private":"EndEvent_hmwp9.out","public":"end"}],"processes":{"Listen_1025g":{"component":"interaction/ListenPointer","metadata":{"x":500,"y":-65,"label":"Listen"}},"End_vom22":{"component":"core/Merge","metadata":{"x":843,"y":96,"label":"End"}},"Start_86u3g":{"component":"core/Split","metadata":{"x":848,"y":-157,"label":"Start"}},"MoveOnlyDuringGesture_986zt":{"component":"flow/Gate","metadata":{"x":1106,"y":-40,"label":"MoveOnlyDuringGesture"}},"EndOnlyOnce_vexfn":{"component":"flow/Gate","metadata":{"x":1107,"y":75,"label":"EndOnlyOnce"}},"SplitEnd_cnfy6":{"component":"core/Split","metadata":{"x":1407,"y":79,"label":"SplitEnd"}},"Asynchronize_x0hqm":{"component":"core/RepeatAsync","metadata":{"x":1404,"y":171.33333333333331,"label":"Asynchronize"}},"StartEvent_x8itv":{"component":"core/Repeat","metadata":{"x":1662,"y":-162,"label":"StartEvent"}},"MoveEvent_qa3pp":{"component":"core/Repeat","metadata":{"x":1662,"y":-35,"label":"MoveEvent"}},"EndEvent_hmwp9":{"component":"core/Repeat","metadata":{"x":1659,"y":75,"label":"EndEvent"}}},"connections":[{"src":{"process":"Listen_1025g","port":"leave"},"tgt":{"process":"End_vom22","port":"in"},"metadata":{"route":1}},{"src":{"process":"Listen_1025g","port":"cancel"},"tgt":{"process":"End_vom22","port":"in"},"metadata":{"route":1}},{"src":{"process":"Listen_1025g","port":"up"},"tgt":{"process":"End_vom22","port":"in"},"metadata":{"route":1}},{"src":{"process":"Listen_1025g","port":"down"},"tgt":{"process":"Start_86u3g","port":"in"},"metadata":{"route":5}},{"src":{"process":"Listen_1025g","port":"move"},"tgt":{"process":"MoveOnlyDuringGesture_986zt","port":"in"},"metadata":{"route":3}},{"src":{"process":"End_vom22","port":"out"},"tgt":{"process":"EndOnlyOnce_vexfn","port":"in"},"metadata":{"route":1}},{"src":{"process":"EndOnlyOnce_vexfn","port":"out"},"tgt":{"process":"SplitEnd_cnfy6","port":"in"},"metadata":{"route":1}},{"src":{"process":"Start_86u3g","port":"out"},"tgt":{"process":"EndOnlyOnce_vexfn","port":"open"},"metadata":{"route":5}},{"src":{"process":"SplitEnd_cnfy6","port":"out"},"tgt":{"process":"Asynchronize_x0hqm","port":"in"},"metadata":{"route":1}},{"src":{"process":"Asynchronize_x0hqm","port":"out"},"tgt":{"process":"EndOnlyOnce_vexfn","port":"close"},"metadata":{"route":1}},{"src":{"process":"Start_86u3g","port":"out"},"tgt":{"process":"MoveOnlyDuringGesture_986zt","port":"open"},"metadata":{"route":5}},{"src":{"process":"SplitEnd_cnfy6","port":"out"},"tgt":{"process":"MoveOnlyDuringGesture_986zt","port":"close"},"metadata":{"route":1}},{"src":{"process":"Start_86u3g","port":"out"},"tgt":{"process":"StartEvent_x8itv","port":"in"},"metadata":{"route":5}},{"src":{"process":"MoveOnlyDuringGesture_986zt","port":"out"},"tgt":{"process":"MoveEvent_qa3pp","port":"in"},"metadata":{"route":3}},{"src":{"process":"SplitEnd_cnfy6","port":"out"},"tgt":{"process":"EndEvent_hmwp9","port":"in"},"metadata":{"route":1}}]}');
});
require.register("noflo-noflo-gestures/graphs/DetectCardinalDirection.json", function(exports, require, module){
module.exports = JSON.parse('{"properties":{"environment":{"runtime":"html","src":"./preview/iframe.html","width":"300","height":"300","content":""},"name":"DetectCardinalDirection"},"exports":[{"private":"receivegesture_thbmw.in","public":"in"},{"private":"sendeast_218qx.out","public":"east"},{"private":"sendsouth_wx2b5.out","public":"south"},{"private":"sendwest_rkdz9.out","public":"west"},{"private":"sendnorth_c562k.out","public":"north"},{"private":"fail_5b0qo.out","public":"fail"},{"private":"checkmaxdistance_cebq5.comparison","public":"maxdistance"}],"processes":{"ReceiveGesture_thbmw":{"component":"core/Repeat","metadata":{"x":-294,"y":134,"label":"ReceiveGesture"}},"SplitGesture_dkk87":{"component":"core/Split","metadata":{"x":-296,"y":214,"label":"SplitGesture"}},"SendNorth_c562k":{"component":"strings/SendString","metadata":{"x":1733,"y":447,"label":"SendNorth"}},"SendEast_218qx":{"component":"strings/SendString","metadata":{"x":1721,"y":-5,"label":"SendEast"}},"RouteDirection_apgsp":{"component":"gestures/CardinalRouter","metadata":{"x":1469,"y":195,"label":"RouteDirection"}},"GetIndividualPointer_ozjfa":{"component":"objects/SplitObject","metadata":{"x":-86,"y":214,"label":"GetIndividualPointer"}},"GetStartPoint_bhrl2":{"component":"objects/GetObjectKey","metadata":{"x":879,"y":157,"label":"GetStartPoint"}},"GetCurrentPoint_rwwt0":{"component":"objects/GetObjectKey","metadata":{"x":877,"y":259,"label":"GetCurrentPoint"}},"GetGestureAngle_djpr6":{"component":"math/CalculateAngle","metadata":{"x":1083,"y":193,"label":"GetGestureAngle"}},"SendWest_rkdz9":{"component":"strings/SendString","metadata":{"x":1730.8333333333333,"y":348.33333333333337,"label":"SendWest"}},"SendSouth_wx2b5":{"component":"strings/SendString","metadata":{"x":1721.8333333333333,"y":107.33333333333337,"label":"SendSouth"}},"Fail_5b0qo":{"component":"core/Merge","metadata":{"x":1738.1666666666665,"y":564,"label":"Fail"}},"core/Split_n3qif":{"component":"core/Split","metadata":{"x":1276.999999999999,"y":193.66666666666669,"label":"core/Split"}},"GetDistance_owyyb":{"component":"objects/GetObjectKey","metadata":{"x":304,"y":216,"label":"GetDistance"}},"CheckMaxDistance_cebq5":{"component":"math/Compare","metadata":{"x":499,"y":214,"label":"CheckMaxDistance"}},"SendPointer_v0eqv":{"component":"strings/SendString","metadata":{"x":688,"y":214,"label":"SendPointer"}},"SplitPointer_v0u8k":{"component":"core/Split","metadata":{"x":109.00000000000006,"y":215.33333333333331,"label":"SplitPointer"}}},"connections":[{"src":{"process":"GetStartPoint_bhrl2","port":"object"},"tgt":{"process":"GetCurrentPoint_rwwt0","port":"in"},"metadata":{"route":9}},{"src":{"process":"GetStartPoint_bhrl2","port":"out"},"tgt":{"process":"GetGestureAngle_djpr6","port":"origin"},"metadata":{"route":9}},{"src":{"process":"GetCurrentPoint_rwwt0","port":"out"},"tgt":{"process":"GetGestureAngle_djpr6","port":"destination"},"metadata":{"route":9}},{"src":{"process":"SplitGesture_dkk87","port":"out"},"tgt":{"process":"SendEast_218qx","port":"string"},"metadata":{"route":9}},{"src":{"process":"SplitGesture_dkk87","port":"out"},"tgt":{"process":"SendWest_rkdz9","port":"string"},"metadata":{"route":9}},{"src":{"process":"SplitGesture_dkk87","port":"out"},"tgt":{"process":"SendNorth_c562k","port":"string"},"metadata":{"route":9}},{"src":{"process":"SplitGesture_dkk87","port":"out"},"tgt":{"process":"SendSouth_wx2b5","port":"string"},"metadata":{"route":9}},{"src":{"process":"RouteDirection_apgsp","port":"n"},"tgt":{"process":"SendNorth_c562k","port":"in"},"metadata":{"route":4}},{"src":{"process":"RouteDirection_apgsp","port":"w"},"tgt":{"process":"SendWest_rkdz9","port":"in"},"metadata":{"route":5}},{"src":{"process":"RouteDirection_apgsp","port":"s"},"tgt":{"process":"SendSouth_wx2b5","port":"in"},"metadata":{"route":6}},{"src":{"process":"RouteDirection_apgsp","port":"e"},"tgt":{"process":"SendEast_218qx","port":"in"},"metadata":{"route":7}},{"src":{"process":"ReceiveGesture_thbmw","port":"out"},"tgt":{"process":"SplitGesture_dkk87","port":"in"},"metadata":{"route":9}},{"src":{"process":"SplitGesture_dkk87","port":"out"},"tgt":{"process":"GetIndividualPointer_ozjfa","port":"in"},"metadata":{"route":9}},{"src":{"process":"GetCurrentPoint_rwwt0","port":"missed"},"tgt":{"process":"Fail_5b0qo","port":"in"},"metadata":{"route":1}},{"src":{"process":"GetStartPoint_bhrl2","port":"missed"},"tgt":{"process":"Fail_5b0qo","port":"in"},"metadata":{"route":1}},{"src":{"process":"GetGestureAngle_djpr6","port":"angle"},"tgt":{"process":"core/Split_n3qif","port":"in"},"metadata":{"route":9}},{"src":{"process":"core/Split_n3qif","port":"out"},"tgt":{"process":"RouteDirection_apgsp","port":"degrees"},"metadata":{"route":9}},{"src":{"process":"core/Split_n3qif","port":"out"},"tgt":{"process":"GetGestureAngle_djpr6","port":"clear"},"metadata":{"route":0}},{"src":{"process":"GetIndividualPointer_ozjfa","port":"out"},"tgt":{"process":"SplitPointer_v0u8k","port":"in"},"metadata":{"route":9}},{"src":{"process":"SplitPointer_v0u8k","port":"out"},"tgt":{"process":"SendPointer_v0eqv","port":"string"},"metadata":{"route":9}},{"src":{"process":"SendPointer_v0eqv","port":"out"},"tgt":{"process":"GetStartPoint_bhrl2","port":"in"},"metadata":{"route":9}},{"src":{"process":"CheckMaxDistance_cebq5","port":"pass"},"tgt":{"process":"SendPointer_v0eqv","port":"in"},"metadata":{"route":9}},{"src":{"process":"CheckMaxDistance_cebq5","port":"fail"},"tgt":{"process":"Fail_5b0qo","port":"in"},"metadata":{"route":1}},{"src":{"process":"GetDistance_owyyb","port":"missed"},"tgt":{"process":"Fail_5b0qo","port":"in"},"metadata":{"route":1}},{"src":{"process":"SplitPointer_v0u8k","port":"out"},"tgt":{"process":"GetDistance_owyyb","port":"in"},"metadata":{"route":0}},{"src":{"process":"GetDistance_owyyb","port":"out"},"tgt":{"process":"CheckMaxDistance_cebq5","port":"value"},"metadata":{"route":9}},{"data":"startpoint","tgt":{"process":"GetStartPoint_bhrl2","port":"key"}},{"data":"movepoint","tgt":{"process":"GetCurrentPoint_rwwt0","port":"key"}},{"data":"distance","tgt":{"process":"GetDistance_owyyb","port":"key"}},{"data":"<=","tgt":{"process":"CheckMaxDistance_cebq5","port":"operator"}}]}');
});
require.register("noflo-noflo-gestures/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-gestures","description":"Gesture recognition components for NoFlo","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-gestures","version":"0.1.0","keywords":[],"dependencies":{"noflo/noflo":"*","noflo/noflo-interaction":"*","noflo/noflo-math":"*","noflo/noflo-flow":"*","noflo/noflo-groups":"*","noflo/noflo-packets":"*","noflo/noflo-objects":"*","noflo/noflo-dom":"*","noflo/noflo-strings":"*","noflo/noflo-core":"*"},"scripts":["components/CalculateCenter.coffee","components/CalculateScale.coffee","components/CardinalRouter.coffee","components/DegreesToCardinal.coffee","components/DegreesToCompass.coffee","components/DetectTarget.coffee","graphs/DetectDrag.json","graphs/DetectSwipe.json","graphs/DetectPinch.json","graphs/FilterByTarget.json","graphs/GestureToObject.json","graphs/ListenGestures.json","graphs/ListenPointer.json","graphs/DetectCardinalDirection.json","index.js"],"json":["graphs/DetectDrag.json","graphs/DetectSwipe.json","graphs/DetectPinch.json","graphs/FilterByTarget.json","graphs/GestureToObject.json","graphs/ListenGestures.json","graphs/ListenPointer.json","graphs/DetectCardinalDirection.json","component.json"],"noflo":{"icon":"hand-right","components":{"CalculateCenter":"components/CalculateCenter.coffee","CalculateScale":"components/CalculateScale.coffee","CardinalRouter":"components/CardinalRouter.coffee","DegreesToCardinal":"components/DegreesToCardinal.coffee","DegreesToCompass":"components/DegreesToCompass.coffee","DetectTarget":"components/DetectTarget.coffee"},"graphs":{"DetectDrag":"graphs/DetectDrag.json","DetectSwipe":"graphs/DetectSwipe.json","DetectPinch":"graphs/DetectPinch.json","FilterByTarget":"graphs/FilterByTarget.json","GestureToObject":"graphs/GestureToObject.json","ListenGestures":"graphs/ListenGestures.json","ListenPointer":"graphs/ListenPointer.json","DetectCardinalDirection":"graphs/DetectCardinalDirection.json"}}}');
});
require.register("noflo-noflo-gestures/components/CalculateCenter.js", function(exports, require, module){
var CalculateCenter, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CalculateCenter = (function(_super) {
  __extends(CalculateCenter, _super);

  CalculateCenter.prototype.description = 'Calculate the center point for a gesture';

  function CalculateCenter() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port('object')
    };
    this.outPorts = {
      center: new noflo.Port('object')
    };
    this.inPorts["in"].on('data', function(gesture) {
      return _this.outPorts.center.send(_this.calculateCenter(gesture));
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.center.disconnect();
    });
  }

  CalculateCenter.prototype.calculateCenter = function(gesture) {
    var center, id, startX, startY, touch;
    if (Object.keys(gesture).length === 1) {
      return gesture.startpoint;
    }
    startX = [];
    startY = [];
    for (id in gesture) {
      touch = gesture[id];
      if (!touch) {
        continue;
      }
      if (!touch.startpoint) {
        continue;
      }
      startX.push(touch.startpoint.x);
      startY.push(touch.startpoint.y);
    }
    return center = {
      x: Math.min.apply(Math, startX) + Math.max.apply(Math, startX) / 2,
      y: Math.min.apply(Math, startY) + Math.max.apply(Math, startY) / 2
    };
  };

  return CalculateCenter;

})(noflo.Component);

exports.getComponent = function() {
  return new CalculateCenter;
};

});
require.register("noflo-noflo-gestures/components/CalculateScale.js", function(exports, require, module){
var CalculateScale, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CalculateScale = (function(_super) {
  __extends(CalculateScale, _super);

  CalculateScale.prototype.description = 'Calculate the scale based on gestural movement';

  function CalculateScale() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port('object')
    };
    this.outPorts = {
      scale: new noflo.Port('number')
    };
    this.inPorts["in"].on('data', function(gesture) {
      return _this.outPorts.scale.send(_this.calculateScale(gesture));
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.scale.disconnect();
    });
  }

  CalculateScale.prototype.calculateScale = function(gesture) {
    var id, movePoints, scale, startPoints, touch;
    if (Object.keys(gesture).length === 1) {
      return 1;
    }
    startPoints = [];
    movePoints = [];
    for (id in gesture) {
      touch = gesture[id];
      if (touch.startpoint) {
        startPoints.push(touch.startpoint);
      }
      if (touch.movepoint) {
        movePoints.push(touch.movepoint);
      }
    }
    if (startPoints.length < 2 || movePoints.length < 2) {
      return 1;
    }
    scale = this.calculateDistance(movePoints[0], movePoints[1]) / this.calculateDistance(startPoints[0], startPoints[1]);
    return scale;
  };

  CalculateScale.prototype.calculateDistance = function(origin, destination) {
    var deltaX, deltaY, distance;
    deltaX = destination.x - origin.x;
    deltaY = destination.y - origin.y;
    origin = null;
    destination = null;
    distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    return distance;
  };

  return CalculateScale;

})(noflo.Component);

exports.getComponent = function() {
  return new CalculateScale;
};

});
require.register("noflo-noflo-gestures/components/CardinalRouter.js", function(exports, require, module){
var CardinalRouter, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CardinalRouter = (function(_super) {
  __extends(CardinalRouter, _super);

  CardinalRouter.prototype.description = 'Route values based on their cardinal directions';

  CardinalRouter.prototype.icon = 'compass';

  function CardinalRouter() {
    var headings,
      _this = this;
    this.inPorts = {
      degrees: new noflo.Port('number')
    };
    this.outPorts = {
      e: new noflo.Port('number'),
      s: new noflo.Port('number'),
      w: new noflo.Port('number'),
      n: new noflo.Port('number')
    };
    headings = ['e', 's', 'w', 'n'];
    this.inPorts.degrees.on('data', function(degrees) {
      var heading, index;
      index = degrees - 45;
      if (index < 0) {
        index = index + 360;
      }
      index = parseInt(index / 90);
      heading = headings[index];
      if (!_this.outPorts[heading].isAttached()) {
        return;
      }
      _this.outPorts[heading].send(degrees);
      return _this.outPorts[heading].disconnect();
    });
  }

  return CardinalRouter;

})(noflo.Component);

exports.getComponent = function() {
  return new CardinalRouter;
};

});
require.register("noflo-noflo-gestures/components/DegreesToCardinal.js", function(exports, require, module){
var DegreesToCardinal, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

DegreesToCardinal = (function(_super) {
  __extends(DegreesToCardinal, _super);

  DegreesToCardinal.prototype.description = 'Convert a heading in degrees to a cardinal direction, e.g. N, S';

  DegreesToCardinal.prototype.icon = 'compass';

  function DegreesToCardinal() {
    var headings,
      _this = this;
    this.inPorts = {
      degrees: new noflo.Port('number')
    };
    this.outPorts = {
      heading: new noflo.Port('string')
    };
    headings = ['E', 'S', 'W', 'N'];
    this.inPorts.degrees.on('data', function(degrees) {
      var index;
      index = degrees - 45;
      if (index < 0) {
        index = index + 360;
      }
      index = parseInt(index / 90);
      return _this.outPorts.heading.send(headings[index]);
    });
    this.inPorts.degrees.on('disconnect', function() {
      return _this.outPorts.heading.disconnect();
    });
  }

  return DegreesToCardinal;

})(noflo.Component);

exports.getComponent = function() {
  return new DegreesToCardinal;
};

});
require.register("noflo-noflo-gestures/components/DegreesToCompass.js", function(exports, require, module){
var DegreesToCompass, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

DegreesToCompass = (function(_super) {
  __extends(DegreesToCompass, _super);

  DegreesToCompass.prototype.description = 'Convert a heading in degrees to a compass direction, e.g. N, SW';

  DegreesToCompass.prototype.icon = 'compass';

  function DegreesToCompass() {
    var headings,
      _this = this;
    this.inPorts = {
      degrees: new noflo.Port('number')
    };
    this.outPorts = {
      heading: new noflo.Port('string')
    };
    headings = ['NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
    this.inPorts.degrees.on('data', function(degrees) {
      var index;
      index = degrees - 22.5;
      if (index < 0) {
        index = index + 360;
      }
      index = parseInt(index / 45);
      return _this.outPorts.heading.send(headings[index]);
    });
    this.inPorts.degrees.on('disconnect', function() {
      return _this.outPorts.heading.disconnect();
    });
  }

  return DegreesToCompass;

})(noflo.Component);

exports.getComponent = function() {
  return new DegreesToCompass;
};

});
require.register("noflo-noflo-gestures/components/DetectTarget.js", function(exports, require, module){
var DetectTarget, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

DetectTarget = (function(_super) {
  __extends(DetectTarget, _super);

  DetectTarget.prototype.describe = 'Verify that the gesture target has the right properties';

  function DetectTarget() {
    var _this = this;
    this.target = null;
    this.key = 'current';
    this.inPorts = {
      "in": new noflo.Port('object'),
      key: new noflo.Port('string'),
      target: new noflo.Port('string'),
      clear: new noflo.Port('bang')
    };
    this.outPorts = {
      pass: new noflo.Port('object'),
      fail: new noflo.Port('object'),
      target: new noflo.Port('object')
    };
    this.inPorts.target.on('data', function(data) {
      var parts;
      parts = data.split('=');
      if (!_this.target) {
        _this.target = {};
      }
      return _this.target[parts[0]] = parts[1];
    });
    this.inPorts.key.on('data', function(key) {
      _this.key = key;
    });
    this.inPorts.clear.on('data', function() {
      return _this.target = null;
    });
    this.inPorts["in"].on('data', function(data) {
      var element, passed, touch;
      if (Object.keys(data).length > 1) {
        passed = true;
        for (touch in data) {
          element = data[touch];
          if (!_this.detectTarget(element)) {
            passed = false;
          }
        }
        if (passed) {
          if (_this.outPorts.target.isAttached()) {
            _this.outPorts.target.send(data[Object.keys(data)[0]][_this.key]);
          }
          _this.outPorts.pass.send(data);
        } else {
          _this.outPorts.fail.send(data);
        }
        return;
      }
      if (_this.detectTarget(data[Object.keys(data)[0]])) {
        if (_this.outPorts.target.isAttached()) {
          _this.outPorts.target.send(data[Object.keys(data)[0]][_this.key]);
        }
        return _this.outPorts.pass.send(data);
      } else {
        return _this.outPorts.fail.send(data);
      }
    });
    this.inPorts["in"].on('disconnect', function() {
      _this.outPorts.pass.disconnect();
      _this.outPorts.fail.disconnect();
      if (_this.outPorts.target.isAttached()) {
        return _this.outPorts.target.disconnect();
      }
    });
  }

  DetectTarget.prototype.detectTarget = function(element) {
    var key, value, _ref;
    if (!element[this.key]) {
      return false;
    }
    _ref = this.target;
    for (key in _ref) {
      value = _ref[key];
      if (element[this.key][key] !== value) {
        return false;
      }
    }
    return true;
  };

  return DetectTarget;

})(noflo.Component);

exports.getComponent = function() {
  return new DetectTarget;
};

});
require.register("noflo-noflo-objects/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of objects.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-objects/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-objects","description":"Object Utilities for NoFlo","version":"0.1.0","keywords":["noflo","objects","utilities"],"author":"Kenneth Kan <kenhkan@gmail.com>","repo":"noflo/objects","dependencies":{"noflo/noflo":"*","component/underscore":"*"},"scripts":["components/Extend.coffee","components/MergeObjects.coffee","components/SplitObject.coffee","components/ReplaceKey.coffee","components/Keys.coffee","components/Size.coffee","components/Values.coffee","components/Join.coffee","components/ExtractProperty.coffee","components/InsertProperty.coffee","components/SliceArray.coffee","components/SplitArray.coffee","components/FilterPropertyValue.coffee","components/FlattenObject.coffee","components/MapProperty.coffee","components/RemoveProperty.coffee","components/MapPropertyValue.coffee","components/GetObjectKey.coffee","components/UniqueArray.coffee","components/SetProperty.coffee","components/SimplifyObject.coffee","components/DuplicateProperty.coffee","components/CreateObject.coffee","components/CreateDate.coffee","components/SetPropertyValue.coffee","components/CallMethod.coffee","index.js"],"json":["component.json"],"noflo":{"icon":"list","components":{"Extend":"components/Extend.coffee","MergeObjects":"components/MergeObjects.coffee","SplitObject":"components/SplitObject.coffee","ReplaceKey":"components/ReplaceKey.coffee","Keys":"components/Keys.coffee","Size":"components/Size.coffee","Values":"components/Values.coffee","Join":"components/Join.coffee","ExtractProperty":"components/ExtractProperty.coffee","InsertProperty":"components/InsertProperty.coffee","SliceArray":"components/SliceArray.coffee","SplitArray":"components/SplitArray.coffee","FilterPropertyValue":"components/FilterPropertyValue.coffee","FlattenObject":"components/FlattenObject.coffee","MapProperty":"components/MapProperty.coffee","RemoveProperty":"components/RemoveProperty.coffee","MapPropertyValue":"components/MapPropertyValue.coffee","GetObjectKey":"components/GetObjectKey.coffee","UniqueArray":"components/UniqueArray.coffee","SetProperty":"components/SetProperty.coffee","SimplifyObject":"components/SimplifyObject.coffee","DuplicateProperty":"components/DuplicateProperty.coffee","CreateObject":"components/CreateObject.coffee","CreateDate":"components/CreateDate.coffee","SetPropertyValue":"components/SetPropertyValue.coffee","CallMethod":"components/CallMethod.coffee"}}}');
});
require.register("noflo-noflo-objects/components/Extend.js", function(exports, require, module){
var Extend, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require("underscore");

noflo = require("noflo");

Extend = (function(_super) {
  __extends(Extend, _super);

  Extend.prototype.description = "Extend an incoming object to some predefined  objects, optionally by a certain property";

  function Extend() {
    var _this = this;
    this.bases = [];
    this.mergedBase = {};
    this.key = null;
    this.reverse = false;
    this.inPorts = {
      "in": new noflo.Port,
      base: new noflo.Port,
      key: new noflo.Port,
      reverse: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.base.on("connect", function() {
      return _this.bases = [];
    });
    this.inPorts.base.on("data", function(base) {
      if (base != null) {
        return _this.bases.push(base);
      }
    });
    this.inPorts.key.on("data", function(key) {
      _this.key = key;
    });
    this.inPorts.reverse.on("data", function(reverse) {
      return _this.reverse = reverse === 'true';
    });
    this.inPorts["in"].on("connect", function(group) {});
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(incoming) {
      var base, out, _i, _len, _ref;
      out = {};
      _ref = _this.bases;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        base = _ref[_i];
        if ((_this.key == null) || (incoming[_this.key] != null) && incoming[_this.key] === base[_this.key]) {
          _.extend(out, base);
        }
      }
      if (_this.reverse) {
        return _this.outPorts.out.send(_.extend({}, incoming, out));
      } else {
        return _this.outPorts.out.send(_.extend(out, incoming));
      }
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Extend;

})(noflo.Component);

exports.getComponent = function() {
  return new Extend;
};

});
require.register("noflo-noflo-objects/components/MergeObjects.js", function(exports, require, module){
var MergeObjects, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require("underscore");

noflo = require("noflo");

MergeObjects = (function(_super) {
  __extends(MergeObjects, _super);

  MergeObjects.prototype.description = "merges all incoming objects into one";

  function MergeObjects() {
    var _this = this;
    this.merge = _.bind(this.merge, this);
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("connect", function() {
      _this.groups = [];
      return _this.objects = [];
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.groups.push(group);
    });
    this.inPorts["in"].on("data", function(object) {
      return _this.objects.push(object);
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.groups.pop();
    });
    this.inPorts["in"].on("disconnect", function() {
      _this.outPorts.out.send(_.reduce(_this.objects, _this.merge, {}));
      return _this.outPorts.out.disconnect();
    });
  }

  MergeObjects.prototype.merge = function(origin, object) {
    var key, oValue, value;
    for (key in object) {
      value = object[key];
      oValue = origin[key];
      if (oValue != null) {
        switch (toString.call(oValue)) {
          case "[object Array]":
            origin[key].push.apply(origin[key], value);
            break;
          case "[object Object]":
            origin[key] = this.merge(oValue, value);
            break;
          default:
            origin[key] = value;
        }
      } else {
        origin[key] = value;
      }
    }
    return origin;
  };

  return MergeObjects;

})(noflo.Component);

exports.getComponent = function() {
  return new MergeObjects;
};

});
require.register("noflo-noflo-objects/components/SplitObject.js", function(exports, require, module){
var SplitObject, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

SplitObject = (function(_super) {
  __extends(SplitObject, _super);

  SplitObject.prototype.description = "splits a single object into multiple IPs,    wrapped with the key as the group";

  function SplitObject() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var key, value, _results;
      _results = [];
      for (key in data) {
        value = data[key];
        _this.outPorts.out.beginGroup(key);
        _this.outPorts.out.send(value);
        _results.push(_this.outPorts.out.endGroup());
      }
      return _results;
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return SplitObject;

})(noflo.Component);

exports.getComponent = function() {
  return new SplitObject;
};

});
require.register("noflo-noflo-objects/components/ReplaceKey.js", function(exports, require, module){
var ReplaceKey, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

ReplaceKey = (function(_super) {
  __extends(ReplaceKey, _super);

  ReplaceKey.prototype.description = "given a regexp matching any key of an incoming  object as a data IP, replace the key with the provided string";

  function ReplaceKey() {
    var _this = this;
    this.patterns = {};
    this.inPorts = {
      "in": new noflo.Port,
      pattern: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.pattern.on("data", function(patterns) {
      _this.patterns = patterns;
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var key, newKey, pattern, replace, value, _ref;
      newKey = null;
      for (key in data) {
        value = data[key];
        _ref = _this.patterns;
        for (pattern in _ref) {
          replace = _ref[pattern];
          pattern = new RegExp(pattern);
          if (key.match(pattern) != null) {
            newKey = key.replace(pattern, replace);
            data[newKey] = value;
            delete data[key];
          }
        }
      }
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      _this.pattern = null;
      return _this.outPorts.out.disconnect();
    });
  }

  return ReplaceKey;

})(noflo.Component);

exports.getComponent = function() {
  return new ReplaceKey;
};

});
require.register("noflo-noflo-objects/components/Keys.js", function(exports, require, module){
var Keys, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Keys = (function(_super) {
  __extends(Keys, _super);

  Keys.prototype.description = "gets only the keys of an object and forward them as an array";

  function Keys() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port('object')
    };
    this.outPorts = {
      out: new noflo.Port('all')
    };
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var key, _i, _len, _ref, _results;
      _ref = _.keys(data);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        _results.push(_this.outPorts.out.send(key));
      }
      return _results;
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Keys;

})(noflo.Component);

exports.getComponent = function() {
  return new Keys;
};

});
require.register("noflo-noflo-objects/components/Size.js", function(exports, require, module){
var Size, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Size = (function(_super) {
  __extends(Size, _super);

  Size.prototype.description = "gets the size of an object and sends that out as a number";

  function Size() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port('object')
    };
    this.outPorts = {
      out: new noflo.Port('integer')
    };
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      return _this.outPorts.out.send(_.size(data));
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Size;

})(noflo.Component);

exports.getComponent = function() {
  return new Size;
};

});
require.register("noflo-noflo-objects/components/Values.js", function(exports, require, module){
var Values, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Values = (function(_super) {
  __extends(Values, _super);

  Values.prototype.description = "gets only the values of an object and forward them as an array";

  function Values() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var value, _i, _len, _ref, _results;
      _ref = _.values(data);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        value = _ref[_i];
        _results.push(_this.outPorts.out.send(value));
      }
      return _results;
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Values;

})(noflo.Component);

exports.getComponent = function() {
  return new Values;
};

});
require.register("noflo-noflo-objects/components/Join.js", function(exports, require, module){
var Join, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require("underscore");

noflo = require("noflo");

Join = (function(_super) {
  __extends(Join, _super);

  Join.prototype.description = "Join all values of a passed packet together as a  string with a predefined delimiter";

  function Join() {
    var _this = this;
    this.delimiter = ",";
    this.inPorts = {
      "in": new noflo.Port,
      delimiter: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.delimiter.on("data", function(delimiter) {
      _this.delimiter = delimiter;
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(object) {
      if (_.isObject(object)) {
        return _this.outPorts.out.send(_.values(object).join(_this.delimiter));
      }
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Join;

})(noflo.Component);

exports.getComponent = function() {
  return new Join;
};

});
require.register("noflo-noflo-objects/components/ExtractProperty.js", function(exports, require, module){
var ExtractProperty, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

ExtractProperty = (function(_super) {
  __extends(ExtractProperty, _super);

  ExtractProperty.prototype.description = "Given a key, return only the value matching that key  in the incoming object";

  function ExtractProperty() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port,
      key: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.key.on("connect", function() {
      return _this.keys = [];
    });
    this.inPorts.key.on("data", function(key) {
      return _this.keys.push(key);
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var key, value, _i, _len, _ref;
      if ((_this.keys != null) && _.isObject(data)) {
        value = data;
        _ref = _this.keys;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          value = value[key];
        }
        return _this.outPorts.out.send(value);
      }
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return ExtractProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new ExtractProperty;
};

});
require.register("noflo-noflo-objects/components/InsertProperty.js", function(exports, require, module){
var InsertProperty, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

InsertProperty = (function(_super) {
  __extends(InsertProperty, _super);

  InsertProperty.prototype.description = "Insert a property into incoming objects.";

  function InsertProperty() {
    var _this = this;
    this.properties = {};
    this.inPorts = {
      "in": new noflo.Port,
      property: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.property.on("connect", function() {
      return _this.properties = {};
    });
    this.inPorts.property.on("begingroup", function(key) {
      _this.key = key;
    });
    this.inPorts.property.on("data", function(value) {
      if (_this.key != null) {
        return _this.properties[_this.key] = value;
      }
    });
    this.inPorts.property.on("endgroup", function() {
      return _this.key = null;
    });
    this.inPorts["in"].on("begingroup", function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var key, value, _ref;
      if (!_.isObject(data)) {
        data = {};
      }
      _ref = _this.properties;
      for (key in _ref) {
        value = _ref[key];
        data[key] = value;
      }
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on("endgroup", function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on("disconnect", function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return InsertProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new InsertProperty;
};

});
require.register("noflo-noflo-objects/components/SliceArray.js", function(exports, require, module){
var SliceArray, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SliceArray = (function(_super) {
  __extends(SliceArray, _super);

  function SliceArray() {
    var _this = this;
    this.begin = 0;
    this.end = null;
    this.inPorts = {
      "in": new noflo.Port(),
      begin: new noflo.Port(),
      end: new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port(),
      error: new noflo.Port()
    };
    this.inPorts.begin.on('data', function(data) {
      return _this.begin = data;
    });
    this.inPorts.end.on('data', function(data) {
      return _this.end = data;
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.sliceData(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  SliceArray.prototype.sliceData = function(data) {
    var sliced;
    if (!data.slice) {
      return this.outPorts.error.send("Data " + (typeof data) + " cannot be sliced");
    }
    if (this.end !== null) {
      sliced = data.slice(this.begin, this.end);
    }
    if (this.end === null) {
      sliced = data.slice(this.begin);
    }
    return this.outPorts.out.send(sliced);
  };

  return SliceArray;

})(noflo.Component);

exports.getComponent = function() {
  return new SliceArray;
};

});
require.register("noflo-noflo-objects/components/SplitArray.js", function(exports, require, module){
var SplitArray, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SplitArray = (function(_super) {
  __extends(SplitArray, _super);

  function SplitArray() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.ArrayPort()
    };
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      var item, key, _i, _len, _results;
      if (toString.call(data) !== '[object Array]') {
        for (key in data) {
          item = data[key];
          _this.outPorts.out.beginGroup(key);
          _this.outPorts.out.send(item);
          _this.outPorts.out.endGroup();
        }
        return;
      }
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        item = data[_i];
        _results.push(_this.outPorts.out.send(item));
      }
      return _results;
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function(data) {
      return _this.outPorts.out.disconnect();
    });
  }

  return SplitArray;

})(noflo.Component);

exports.getComponent = function() {
  return new SplitArray;
};

});
require.register("noflo-noflo-objects/components/FilterPropertyValue.js", function(exports, require, module){
var FilterPropertyValue, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

FilterPropertyValue = (function(_super) {
  __extends(FilterPropertyValue, _super);

  FilterPropertyValue.prototype.icon = 'filter';

  function FilterPropertyValue() {
    var _this = this;
    this.accepts = {};
    this.regexps = {};
    this.inPorts = {
      accept: new noflo.ArrayPort('all'),
      regexp: new noflo.ArrayPort('string'),
      "in": new noflo.Port('object')
    };
    this.outPorts = {
      out: new noflo.Port('object'),
      missed: new noflo.Port('object')
    };
    this.inPorts.accept.on('data', function(data) {
      return _this.prepareAccept(data);
    });
    this.inPorts.regexp.on('data', function(data) {
      return _this.prepareRegExp(data);
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      if (_this.filtering()) {
        return _this.filterData(data);
      }
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  FilterPropertyValue.prototype.filtering = function() {
    return (Object.keys(this.accepts)).length > 0 || (Object.keys(this.regexps)).length > 0;
  };

  FilterPropertyValue.prototype.prepareAccept = function(map) {
    var e, mapParts;
    if (typeof map === 'object') {
      this.accepts = map;
      return;
    }
    mapParts = map.split('=');
    try {
      return this.accepts[mapParts[0]] = eval(mapParts[1]);
    } catch (_error) {
      e = _error;
      if (e instanceof ReferenceError) {
        return this.accepts[mapParts[0]] = mapParts[1];
      } else {
        throw e;
      }
    }
  };

  FilterPropertyValue.prototype.prepareRegExp = function(map) {
    var mapParts;
    mapParts = map.split('=');
    return this.regexps[mapParts[0]] = mapParts[1];
  };

  FilterPropertyValue.prototype.filterData = function(object) {
    var match, newData, property, regexp, value;
    newData = {};
    match = false;
    for (property in object) {
      value = object[property];
      if (this.accepts[property]) {
        if (this.accepts[property] !== value) {
          continue;
        }
        match = true;
      }
      if (this.regexps[property]) {
        regexp = new RegExp(this.regexps[property]);
        if (!regexp.exec(value)) {
          continue;
        }
        match = true;
      }
      newData[property] = value;
      continue;
    }
    if (!match) {
      if (!this.outPorts.missed.isAttached()) {
        return;
      }
      this.outPorts.missed.send(object);
      this.outPorts.missed.disconnect();
      return;
    }
    return this.outPorts.out.send(newData);
  };

  return FilterPropertyValue;

})(noflo.Component);

exports.getComponent = function() {
  return new FilterPropertyValue;
};

});
require.register("noflo-noflo-objects/components/FlattenObject.js", function(exports, require, module){
var FlattenObject, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

FlattenObject = (function(_super) {
  __extends(FlattenObject, _super);

  function FlattenObject() {
    var _this = this;
    this.map = {};
    this.inPorts = {
      map: new noflo.ArrayPort(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.map.on('data', function(data) {
      return _this.prepareMap(data);
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      var object, _i, _len, _ref, _results;
      _ref = _this.flattenObject(data);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        object = _ref[_i];
        _results.push(_this.outPorts.out.send(_this.mapKeys(object)));
      }
      return _results;
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  FlattenObject.prototype.prepareMap = function(map) {
    var mapParts;
    if (typeof map === 'object') {
      this.map = map;
      return;
    }
    mapParts = map.split('=');
    return this.map[mapParts[0]] = mapParts[1];
  };

  FlattenObject.prototype.mapKeys = function(object) {
    var key, map, _ref;
    _ref = this.map;
    for (key in _ref) {
      map = _ref[key];
      object[map] = object.flattenedKeys[key];
    }
    delete object.flattenedKeys;
    return object;
  };

  FlattenObject.prototype.flattenObject = function(object) {
    var flattened, flattenedValue, key, val, value, _i, _len;
    flattened = [];
    for (key in object) {
      value = object[key];
      if (typeof value === 'object') {
        flattenedValue = this.flattenObject(value);
        for (_i = 0, _len = flattenedValue.length; _i < _len; _i++) {
          val = flattenedValue[_i];
          val.flattenedKeys.push(key);
          flattened.push(val);
        }
        continue;
      }
      flattened.push({
        flattenedKeys: [key],
        value: value
      });
    }
    return flattened;
  };

  return FlattenObject;

})(noflo.Component);

exports.getComponent = function() {
  return new FlattenObject;
};

});
require.register("noflo-noflo-objects/components/MapProperty.js", function(exports, require, module){
var MapProperty, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

MapProperty = (function(_super) {
  __extends(MapProperty, _super);

  function MapProperty() {
    var _this = this;
    this.map = {};
    this.regexps = {};
    this.inPorts = {
      map: new noflo.ArrayPort(),
      regexp: new noflo.ArrayPort(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.map.on('data', function(data) {
      return _this.prepareMap(data);
    });
    this.inPorts.regexp.on('data', function(data) {
      return _this.prepareRegExp(data);
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.mapData(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  MapProperty.prototype.prepareMap = function(map) {
    var mapParts;
    if (typeof map === 'object') {
      this.map = map;
      return;
    }
    mapParts = map.split('=');
    return this.map[mapParts[0]] = mapParts[1];
  };

  MapProperty.prototype.prepareRegExp = function(map) {
    var mapParts;
    mapParts = map.split('=');
    return this.regexps[mapParts[0]] = mapParts[1];
  };

  MapProperty.prototype.mapData = function(data) {
    var expression, matched, newData, property, regexp, replacement, value, _ref;
    newData = {};
    for (property in data) {
      value = data[property];
      if (property in this.map) {
        property = this.map[property];
      }
      _ref = this.regexps;
      for (expression in _ref) {
        replacement = _ref[expression];
        regexp = new RegExp(expression);
        matched = regexp.exec(property);
        if (!matched) {
          continue;
        }
        property = property.replace(regexp, replacement);
      }
      if (property in newData) {
        if (Array.isArray(newData[property])) {
          newData[property].push(value);
        } else {
          newData[property] = [newData[property], value];
        }
      } else {
        newData[property] = value;
      }
    }
    return this.outPorts.out.send(newData);
  };

  return MapProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new MapProperty;
};

});
require.register("noflo-noflo-objects/components/RemoveProperty.js", function(exports, require, module){
var RemoveProperty, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore');

RemoveProperty = (function(_super) {
  __extends(RemoveProperty, _super);

  RemoveProperty.prototype.icon = 'remove';

  function RemoveProperty() {
    var _this = this;
    this.properties = [];
    this.inPorts = {
      "in": new noflo.Port(),
      property: new noflo.ArrayPort()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.property.on('data', function(data) {
      return _this.properties.push(data);
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(_this.removeProperties(data));
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  RemoveProperty.prototype.removeProperties = function(object) {
    var property, _i, _len, _ref;
    object = _.clone(object);
    _ref = this.properties;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      property = _ref[_i];
      delete object[property];
    }
    return object;
  };

  return RemoveProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new RemoveProperty;
};

});
require.register("noflo-noflo-objects/components/MapPropertyValue.js", function(exports, require, module){
var MapPropertyValue, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

MapPropertyValue = (function(_super) {
  __extends(MapPropertyValue, _super);

  function MapPropertyValue() {
    var _this = this;
    this.mapAny = {};
    this.map = {};
    this.regexpAny = {};
    this.regexp = {};
    this.inPorts = {
      map: new noflo.ArrayPort(),
      regexp: new noflo.ArrayPort(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.map.on('data', function(data) {
      return _this.prepareMap(data);
    });
    this.inPorts.regexp.on('data', function(data) {
      return _this.prepareRegExp(data);
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.mapData(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  MapPropertyValue.prototype.prepareMap = function(map) {
    var mapParts;
    if (typeof map === 'object') {
      this.mapAny = map;
      return;
    }
    mapParts = map.split('=');
    if (mapParts.length === 3) {
      this.map[mapParts[0]] = {
        from: mapParts[1],
        to: mapParts[2]
      };
      return;
    }
    return this.mapAny[mapParts[0]] = mapParts[1];
  };

  MapPropertyValue.prototype.prepareRegExp = function(map) {
    var mapParts;
    mapParts = map.split('=');
    if (mapParts.length === 3) {
      this.regexp[mapParts[0]] = {
        from: mapParts[1],
        to: mapParts[2]
      };
      return;
    }
    return this.regexpAny[mapParts[0]] = mapParts[1];
  };

  MapPropertyValue.prototype.mapData = function(data) {
    var expression, matched, property, regexp, replacement, value, _ref;
    for (property in data) {
      value = data[property];
      if (this.map[property] && this.map[property].from === value) {
        data[property] = this.map[property].to;
      }
      if (this.mapAny[value]) {
        data[property] = this.mapAny[value];
      }
      if (this.regexp[property]) {
        regexp = new RegExp(this.regexp[property].from);
        matched = regexp.exec(value);
        if (matched) {
          data[property] = value.replace(regexp, this.regexp[property].to);
        }
      }
      _ref = this.regexpAny;
      for (expression in _ref) {
        replacement = _ref[expression];
        regexp = new RegExp(expression);
        matched = regexp.exec(value);
        if (!matched) {
          continue;
        }
        data[property] = value.replace(regexp, replacement);
      }
    }
    return this.outPorts.out.send(data);
  };

  return MapPropertyValue;

})(noflo.Component);

exports.getComponent = function() {
  return new MapPropertyValue;
};

});
require.register("noflo-noflo-objects/components/GetObjectKey.js", function(exports, require, module){
var GetObjectKey, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

GetObjectKey = (function(_super) {
  __extends(GetObjectKey, _super);

  GetObjectKey.prototype.icon = 'indent-right';

  function GetObjectKey() {
    var _this = this;
    this.sendGroup = true;
    this.data = [];
    this.key = [];
    this.inPorts = {
      "in": new noflo.Port(),
      key: new noflo.ArrayPort(),
      sendgroup: new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port(),
      object: new noflo.Port(),
      missed: new noflo.Port()
    };
    this.inPorts["in"].on('connect', function() {
      return _this.data = [];
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      if (_this.key.length) {
        return _this.getKey(data);
      }
      return _this.data.push(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      var data, _i, _len, _ref;
      if (!_this.data.length) {
        _this.outPorts.out.disconnect();
        return;
      }
      if (!_this.key.length) {
        return;
      }
      _ref = _this.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data = _ref[_i];
        _this.getKey(data);
      }
      _this.outPorts.out.disconnect();
      if (_this.outPorts.object.isAttached()) {
        return _this.outPorts.object.disconnect();
      }
    });
    this.inPorts.key.on('data', function(data) {
      return _this.key.push(data);
    });
    this.inPorts.key.on('disconnect', function() {
      var data, _i, _len, _ref;
      if (!_this.data.length) {
        return;
      }
      _ref = _this.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data = _ref[_i];
        _this.getKey(data);
      }
      _this.data = [];
      return _this.outPorts.out.disconnect();
    });
    this.inPorts.sendgroup.on('data', function(data) {
      if (typeof data === 'string') {
        if (data.toLowerCase() === 'false') {
          _this.sendGroup = false;
          return;
        }
        _this.sendGroup = true;
        return;
      }
      return _this.sendGroup = data;
    });
  }

  GetObjectKey.prototype.error = function(data, error) {
    if (this.outPorts.missed.isAttached()) {
      this.outPorts.missed.send(data);
      this.outPorts.missed.disconnect();
      return;
    }
    throw error;
  };

  GetObjectKey.prototype.getKey = function(data) {
    var key, _i, _len, _ref;
    if (!this.key.length) {
      this.error(data, new Error('Key not defined'));
      return;
    }
    if (typeof data !== 'object') {
      this.error(data, new Error('Data is not an object'));
      return;
    }
    if (data === null) {
      this.error(data, new Error('Data is NULL'));
      return;
    }
    _ref = this.key;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      if (data[key] === void 0) {
        this.error(data, new Error("Object has no key " + key));
        continue;
      }
      if (this.sendGroup) {
        this.outPorts.out.beginGroup(key);
      }
      this.outPorts.out.send(data[key]);
      if (this.sendGroup) {
        this.outPorts.out.endGroup();
      }
    }
    if (!this.outPorts.object.isAttached()) {
      return;
    }
    return this.outPorts.object.send(data);
  };

  return GetObjectKey;

})(noflo.Component);

exports.getComponent = function() {
  return new GetObjectKey;
};

});
require.register("noflo-noflo-objects/components/UniqueArray.js", function(exports, require, module){
var UniqueArray, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

UniqueArray = (function(_super) {
  __extends(UniqueArray, _super);

  function UniqueArray() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(_this.unique(data));
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  UniqueArray.prototype.unique = function(array) {
    var member, newArray, seen, _i, _len;
    seen = {};
    newArray = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      member = array[_i];
      seen[member] = member;
    }
    for (member in seen) {
      newArray.push(member);
    }
    return newArray;
  };

  return UniqueArray;

})(noflo.Component);

exports.getComponent = function() {
  return new UniqueArray;
};

});
require.register("noflo-noflo-objects/components/SetProperty.js", function(exports, require, module){
var SetProperty, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SetProperty = (function(_super) {
  __extends(SetProperty, _super);

  function SetProperty() {
    var _this = this;
    this.properties = {};
    this.inPorts = {
      property: new noflo.ArrayPort(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.property.on('data', function(data) {
      return _this.setProperty(data);
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.addProperties(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  SetProperty.prototype.setProperty = function(prop) {
    var propParts;
    if (typeof prop === 'object') {
      this.prop = prop;
      return;
    }
    propParts = prop.split('=');
    return this.properties[propParts[0]] = propParts[1];
  };

  SetProperty.prototype.addProperties = function(object) {
    var property, value, _ref;
    _ref = this.properties;
    for (property in _ref) {
      value = _ref[property];
      object[property] = value;
    }
    return this.outPorts.out.send(object);
  };

  return SetProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new SetProperty;
};

});
require.register("noflo-noflo-objects/components/SimplifyObject.js", function(exports, require, module){
var SimplifyObject, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore')._;

SimplifyObject = (function(_super) {
  __extends(SimplifyObject, _super);

  function SimplifyObject() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on('beginGroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(_this.simplify(data));
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  SimplifyObject.prototype.simplify = function(data) {
    if (_.isArray(data)) {
      if (data.length === 1) {
        return data[0];
      }
      return data;
    }
    if (!_.isObject(data)) {
      return data;
    }
    return this.simplifyObject(data);
  };

  SimplifyObject.prototype.simplifyObject = function(data) {
    var keys, simplified,
      _this = this;
    keys = _.keys(data);
    if (keys.length === 1 && keys[0] === '$data') {
      return this.simplify(data['$data']);
    }
    simplified = {};
    _.each(data, function(value, key) {
      return simplified[key] = _this.simplify(value);
    });
    return simplified;
  };

  return SimplifyObject;

})(noflo.Component);

exports.getComponent = function() {
  return new SimplifyObject;
};

});
require.register("noflo-noflo-objects/components/DuplicateProperty.js", function(exports, require, module){
var DuplicateProperty, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

DuplicateProperty = (function(_super) {
  __extends(DuplicateProperty, _super);

  function DuplicateProperty() {
    var _this = this;
    this.properties = {};
    this.separator = '/';
    this.inPorts = {
      property: new noflo.ArrayPort(),
      separator: new noflo.Port(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.property.on('data', function(data) {
      return _this.setProperty(data);
    });
    this.inPorts.separator.on('data', function(data) {
      return _this.separator = data;
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.addProperties(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  DuplicateProperty.prototype.setProperty = function(prop) {
    var propParts;
    if (typeof prop === 'object') {
      this.prop = prop;
      return;
    }
    propParts = prop.split('=');
    if (propParts.length > 2) {
      this.properties[propParts.pop()] = propParts;
      return;
    }
    return this.properties[propParts[1]] = propParts[0];
  };

  DuplicateProperty.prototype.addProperties = function(object) {
    var newValues, newprop, original, originalProp, _i, _len, _ref;
    _ref = this.properties;
    for (newprop in _ref) {
      original = _ref[newprop];
      if (typeof original === 'string') {
        object[newprop] = object[original];
        continue;
      }
      newValues = [];
      for (_i = 0, _len = original.length; _i < _len; _i++) {
        originalProp = original[_i];
        newValues.push(object[originalProp]);
      }
      object[newprop] = newValues.join(this.separator);
    }
    return this.outPorts.out.send(object);
  };

  return DuplicateProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new DuplicateProperty;
};

});
require.register("noflo-noflo-objects/components/CreateObject.js", function(exports, require, module){
var CreateObject, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CreateObject = (function(_super) {
  __extends(CreateObject, _super);

  function CreateObject() {
    var _this = this;
    this.inPorts = {
      start: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('object')
    };
    this.inPorts.start.on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts.start.on("data", function() {
      return _this.outPorts.out.send({});
    });
    this.inPorts.start.on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts.start.on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return CreateObject;

})(noflo.Component);

exports.getComponent = function() {
  return new CreateObject;
};

});
require.register("noflo-noflo-objects/components/CreateDate.js", function(exports, require, module){
var CreateDate, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

CreateDate = (function(_super) {
  __extends(CreateDate, _super);

  CreateDate.prototype.description = 'Create a new Date object from string';

  CreateDate.prototype.icon = 'time';

  function CreateDate() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('object')
    };
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var date;
      if (data === "now" || data === null || data === true) {
        date = new Date;
      } else {
        date = new Date(data);
      }
      return _this.outPorts.out.send(date);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return CreateDate;

})(noflo.Component);

exports.getComponent = function() {
  return new CreateDate;
};

});
require.register("noflo-noflo-objects/components/SetPropertyValue.js", function(exports, require, module){
var SetPropertyValue, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SetPropertyValue = (function(_super) {
  __extends(SetPropertyValue, _super);

  function SetPropertyValue() {
    var _this = this;
    this.property = null;
    this.value = null;
    this.data = [];
    this.groups = [];
    this.keep = false;
    this.inPorts = {
      property: new noflo.Port(),
      value: new noflo.Port(),
      "in": new noflo.Port(),
      keep: new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.keep.on('data', function(keep) {
      return _this.keep = keep === 'true';
    });
    this.inPorts.property.on('data', function(data) {
      _this.property = data;
      if (_this.value && _this.data.length) {
        return _this.addProperties();
      }
    });
    this.inPorts.value.on('data', function(data) {
      _this.value = data;
      if (_this.property && _this.data.length) {
        return _this.addProperties();
      }
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.groups.push(group);
    });
    this.inPorts["in"].on('data', function(data) {
      if (_this.property && _this.value) {
        _this.addProperty({
          data: data,
          group: _this.groups.slice(0)
        });
        return;
      }
      return _this.data.push({
        data: data,
        group: _this.groups.slice(0)
      });
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.groups.pop();
    });
    this.inPorts["in"].on('disconnect', function() {
      if (_this.property && _this.value) {
        _this.outPorts.out.disconnect();
      }
      if (!_this.keep) {
        return _this.value = null;
      }
    });
  }

  SetPropertyValue.prototype.addProperty = function(object) {
    var group, _i, _j, _len, _len1, _ref, _ref1, _results;
    object.data[this.property] = this.value;
    _ref = object.group;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      group = _ref[_i];
      this.outPorts.out.beginGroup(group);
    }
    this.outPorts.out.send(object.data);
    _ref1 = object.group;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      group = _ref1[_j];
      _results.push(this.outPorts.out.endGroup());
    }
    return _results;
  };

  SetPropertyValue.prototype.addProperties = function() {
    var object, _i, _len, _ref;
    _ref = this.data;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      this.addProperty(object);
    }
    this.data = [];
    return this.outPorts.out.disconnect();
  };

  return SetPropertyValue;

})(noflo.Component);

exports.getComponent = function() {
  return new SetPropertyValue;
};

});
require.register("noflo-noflo-objects/components/CallMethod.js", function(exports, require, module){
var CallMethod, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

CallMethod = (function(_super) {
  __extends(CallMethod, _super);

  CallMethod.prototype.description = "call a method on an object";

  CallMethod.prototype.icon = 'gear';

  function CallMethod() {
    var _this = this;
    this.method = null;
    this.args = [];
    this.inPorts = {
      "in": new noflo.Port('object'),
      method: new noflo.Port('string'),
      "arguments": new noflo.Port('all')
    };
    this.outPorts = {
      out: new noflo.Port('all'),
      error: new noflo.Port('string')
    };
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on("data", function(data) {
      var msg;
      if (!_this.method) {
        return;
      }
      if (!data[_this.method]) {
        msg = "Method '" + _this.method + "' not available";
        if (_this.outPorts.error.isAttached()) {
          _this.outPorts.error.send(msg);
          _this.outPorts.error.disconnect();
          return;
        }
        throw new Error(msg);
      }
      _this.outPorts.out.send(data[_this.method].apply(data, _this.args));
      return _this.args = [];
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
    this.inPorts.method.on("data", function(data) {
      return _this.method = data;
    });
    this.inPorts["arguments"].on('connect', function() {
      return _this.args = [];
    });
    this.inPorts["arguments"].on('data', function(data) {
      return _this.args.push(data);
    });
  }

  return CallMethod;

})(noflo.Component);

exports.getComponent = function() {
  return new CallMethod;
};

});
require.register("noflo-noflo-flow/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of flow.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-flow/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-flow","description":"Flow Control for NoFlo","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-dom","version":"0.2.0","keywords":[],"dependencies":{"noflo/noflo":"*"},"scripts":["components/Concat.coffee","components/Gate.coffee","index.js"],"json":["component.json"],"noflo":{"icon":"random","components":{"Concat":"components/Concat.coffee","Gate":"components/Gate.coffee"}}}');
});
require.register("noflo-noflo-flow/components/Concat.js", function(exports, require, module){
var Concat, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Concat = (function(_super) {
  __extends(Concat, _super);

  Concat.prototype.description = 'Gathers data from all incoming connections and sends\
  them together in order of connection';

  function Concat() {
    var subscribed,
      _this = this;
    this.buffers = {};
    this.hasConnected = {};
    this.inPorts = {
      "in": new noflo.ArrayPort
    };
    this.outPorts = {
      out: new noflo.Port
    };
    subscribed = false;
    this.inPorts["in"].on('connect', function(socket) {
      var id, _i, _len, _ref;
      _this.hasConnected[_this.inPorts["in"].sockets.indexOf(socket)] = true;
      if (!subscribed) {
        _ref = _this.inPorts["in"].sockets;
        for (id = _i = 0, _len = _ref.length; _i < _len; id = ++_i) {
          socket = _ref[id];
          _this.subscribeSocket(id);
        }
        return subscribed = true;
      }
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      var socket, _i, _len, _ref;
      _ref = _this.inPorts["in"].sockets;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        socket = _ref[_i];
        if (socket.isConnected()) {
          return;
        }
      }
      _this.clearBuffers();
      return _this.outPorts.out.disconnect();
    });
  }

  Concat.prototype.clearBuffers = function() {
    var data, id, _ref;
    _ref = this.buffers;
    for (id in _ref) {
      data = _ref[id];
      if (!this.hasConnected[id]) {
        return;
      }
    }
    this.buffers = {};
    return this.hasConnected = {};
  };

  Concat.prototype.subscribeSocket = function(id) {
    var _this = this;
    this.buffers[id] = [];
    return this.inPorts["in"].sockets[id].on('data', function(data) {
      if (typeof _this.buffers[id] !== 'object') {
        _this.buffers[id] = [];
      }
      _this.buffers[id].push(data);
      return _this.checkSend();
    });
  };

  Concat.prototype.checkSend = function() {
    var buffer, id, socket, _i, _len, _ref, _ref1, _results;
    _ref = this.inPorts["in"].sockets;
    for (id = _i = 0, _len = _ref.length; _i < _len; id = ++_i) {
      socket = _ref[id];
      if (!this.buffers[id]) {
        return;
      }
      if (!this.buffers[id].length) {
        return;
      }
    }
    _ref1 = this.buffers;
    _results = [];
    for (id in _ref1) {
      buffer = _ref1[id];
      _results.push(this.outPorts.out.send(buffer.shift()));
    }
    return _results;
  };

  return Concat;

})(noflo.Component);

exports.getComponent = function() {
  return new Concat;
};

});
require.register("noflo-noflo-flow/components/Gate.js", function(exports, require, module){
var Gate, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Gate = (function(_super) {
  __extends(Gate, _super);

  Gate.prototype.description = 'This component forwards received packets when the gate is open';

  function Gate() {
    var _this = this;
    this.open = false;
    this.inPorts = {
      "in": new noflo.Port('all'),
      open: new noflo.Port('bang'),
      close: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('all')
    };
    this.inPorts["in"].on('connect', function() {
      if (!_this.open) {
        return;
      }
      return _this.outPorts.out.connect();
    });
    this.inPorts["in"].on('begingroup', function(group) {
      if (!_this.open) {
        return;
      }
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      if (!_this.open) {
        return;
      }
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      if (!_this.open) {
        return;
      }
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      if (!_this.open) {
        return;
      }
      return _this.outPorts.out.disconnect();
    });
    this.inPorts.open.on('data', function() {
      return _this.open = true;
    });
    this.inPorts.close.on('data', function() {
      _this.open = false;
      return _this.outPorts.out.disconnect();
    });
  }

  return Gate;

})(noflo.Component);

exports.getComponent = function() {
  return new Gate;
};

});
require.register("noflo-noflo-dom/index.js", function(exports, require, module){
/*
 * This file can be used for general library features that are exposed as CommonJS modules
 * that the components then utilize
 */

});
require.register("noflo-noflo-dom/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-dom","description":"Document Object Model components for NoFlo","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-dom","version":"0.0.1","keywords":[],"dependencies":{"noflo/noflo":"*"},"scripts":["components/AddClass.coffee","components/AppendChild.coffee","components/CreateElement.coffee","components/CreateFragment.coffee","components/GetAttribute.coffee","components/GetElement.coffee","components/HasClass.coffee","components/ReadHtml.coffee","components/RemoveElement.coffee","components/SetAttribute.coffee","components/WriteHtml.coffee","components/RemoveClass.coffee","components/RequestAnimationFrame.coffee","index.js"],"json":["component.json"],"noflo":{"icon":"html5","components":{"AddClass":"components/AddClass.coffee","AppendChild":"components/AppendChild.coffee","CreateElement":"components/CreateElement.coffee","CreateFragment":"components/CreateFragment.coffee","GetAttribute":"components/GetAttribute.coffee","GetElement":"components/GetElement.coffee","HasClass":"components/HasClass.coffee","WriteHtml":"components/WriteHtml.coffee","ReadHtml":"components/ReadHtml.coffee","RemoveElement":"components/RemoveElement.coffee","SetAttribute":"components/SetAttribute.coffee","RemoveClass":"components/RemoveClass.coffee","RequestAnimationFrame":"components/RequestAnimationFrame.coffee"}}}');
});
require.register("noflo-noflo-dom/components/AddClass.js", function(exports, require, module){
var AddClass, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

AddClass = (function(_super) {
  __extends(AddClass, _super);

  AddClass.prototype.description = 'Add a class to an element';

  function AddClass() {
    var _this = this;
    this.element = null;
    this["class"] = null;
    this.inPorts = {
      element: new noflo.Port('object'),
      "class": new noflo.Port('string')
    };
    this.outPorts = {};
    this.inPorts.element.on('data', function(data) {
      _this.element = data;
      if (_this["class"]) {
        return _this.addClass();
      }
    });
    this.inPorts["class"].on('data', function(data) {
      _this["class"] = data;
      if (_this.element) {
        return _this.addClass();
      }
    });
  }

  AddClass.prototype.addClass = function() {
    return this.element.classList.add(this["class"]);
  };

  return AddClass;

})(noflo.Component);

exports.getComponent = function() {
  return new AddClass;
};

});
require.register("noflo-noflo-dom/components/AppendChild.js", function(exports, require, module){
var AppendChild, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

AppendChild = (function(_super) {
  __extends(AppendChild, _super);

  AppendChild.prototype.description = 'Append elements as children of a parent element';

  function AppendChild() {
    var _this = this;
    this.parent = null;
    this.children = [];
    this.inPorts = {
      parent: new noflo.Port('object'),
      child: new noflo.Port('object')
    };
    this.outPorts = {};
    this.inPorts.parent.on('data', function(data) {
      _this.parent = data;
      if (_this.children.length) {
        return _this.append();
      }
    });
    this.inPorts.child.on('data', function(data) {
      if (!_this.parent) {
        _this.children.push(data);
        return;
      }
      return _this.parent.appendChild(data);
    });
  }

  AppendChild.prototype.append = function() {
    var child, _i, _len, _ref;
    _ref = this.children;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      this.parent.appendChild(child);
    }
    return this.children = [];
  };

  return AppendChild;

})(noflo.Component);

exports.getComponent = function() {
  return new AppendChild;
};

});
require.register("noflo-noflo-dom/components/CreateElement.js", function(exports, require, module){
var CreateElement, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CreateElement = (function(_super) {
  __extends(CreateElement, _super);

  CreateElement.prototype.description = 'Create a new DOM Element';

  function CreateElement() {
    var _this = this;
    this.inPorts = {
      tagname: new noflo.Port('string')
    };
    this.outPorts = {
      element: new noflo.Port('object')
    };
    this.inPorts.tagname.on('data', function(data) {
      return _this.outPorts.element.send(document.createElement(data));
    });
    this.inPorts.tagname.on('disconnect', function() {
      return _this.outPorts.element.disconnect();
    });
  }

  return CreateElement;

})(noflo.Component);

exports.getComponent = function() {
  return new CreateElement;
};

});
require.register("noflo-noflo-dom/components/CreateFragment.js", function(exports, require, module){
var CreateFragment, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CreateFragment = (function(_super) {
  __extends(CreateFragment, _super);

  CreateFragment.prototype.description = 'Create a new DOM DocumentFragment';

  function CreateFragment() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port('bang')
    };
    this.outPorts = {
      fragment: new noflo.Port('object')
    };
    this.inPorts["in"].on('data', function() {
      return _this.outPorts.fragment.send(document.createDocumentFragment());
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.fragment.disconnect();
    });
  }

  return CreateFragment;

})(noflo.Component);

exports.getComponent = function() {
  return new CreateFragment;
};

});
require.register("noflo-noflo-dom/components/GetAttribute.js", function(exports, require, module){
var GetAttribute, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

GetAttribute = (function(_super) {
  __extends(GetAttribute, _super);

  function GetAttribute() {
    var _this = this;
    this.attribute = null;
    this.element = null;
    this.inPorts = {
      element: new noflo.Port('object'),
      attribute: new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('string')
    };
    this.inPorts.element.on('data', function(data) {
      _this.element = data;
      if (_this.attribute) {
        return _this.getAttribute();
      }
    });
    this.inPorts.attribute.on('data', function(data) {
      _this.attribute = data;
      if (_this.element) {
        return _this.getAttribute();
      }
    });
  }

  GetAttribute.prototype.getAttribute = function() {
    var value;
    value = this.element.getAttribute(this.attribute);
    this.outPorts.out.beginGroup(this.attribute);
    this.outPorts.out.send(value);
    this.outPorts.out.endGroup();
    return this.outPorts.out.disconnect();
  };

  return GetAttribute;

})(noflo.Component);

exports.getComponent = function() {
  return new GetAttribute;
};

});
require.register("noflo-noflo-dom/components/GetElement.js", function(exports, require, module){
var GetElement, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

GetElement = (function(_super) {
  __extends(GetElement, _super);

  GetElement.prototype.description = 'Get a DOM element matching a query';

  function GetElement() {
    var _this = this;
    this.container = null;
    this.inPorts = {
      "in": new noflo.Port('object'),
      selector: new noflo.Port('string')
    };
    this.outPorts = {
      element: new noflo.Port('object'),
      error: new noflo.Port('object')
    };
    this.inPorts["in"].on('data', function(data) {
      if (typeof data.querySelector !== 'function') {
        _this.error('Given container doesn\'t support querySelectors');
        return;
      }
      return _this.container = data;
    });
    this.inPorts.selector.on('data', function(data) {
      return _this.select(data);
    });
  }

  GetElement.prototype.select = function(selector) {
    var el, element, _i, _len;
    if (this.container) {
      el = this.container.querySelectorAll(selector);
    } else {
      el = document.querySelectorAll(selector);
    }
    if (!el.length) {
      this.error("No element matching '" + selector + "' found");
      return;
    }
    for (_i = 0, _len = el.length; _i < _len; _i++) {
      element = el[_i];
      this.outPorts.element.send(element);
    }
    return this.outPorts.element.disconnect();
  };

  GetElement.prototype.error = function(msg) {
    if (this.outPorts.error.isAttached()) {
      this.outPorts.error.send(new Error(msg));
      this.outPorts.error.disconnect();
      return;
    }
    throw new Error(msg);
  };

  return GetElement;

})(noflo.Component);

exports.getComponent = function() {
  return new GetElement;
};

});
require.register("noflo-noflo-dom/components/HasClass.js", function(exports, require, module){
var HasClass, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

HasClass = (function(_super) {
  __extends(HasClass, _super);

  HasClass.prototype.description = 'Check if an element has a given class';

  function HasClass() {
    var _this = this;
    this.element = null;
    this["class"] = null;
    this.inPorts = {
      element: new noflo.Port('object'),
      "class": new noflo.Port('string')
    };
    this.outPorts = {
      element: new noflo.Port('object'),
      missed: new noflo.Port('object')
    };
    this.inPorts.element.on('data', function(data) {
      _this.element = data;
      if (_this["class"]) {
        return _this.checkClass();
      }
    });
    this.inPorts.element.on('disconnect', function() {
      _this.outPorts.element.disconnect();
      if (!_this.outPorts.missed.isAttached()) {
        return;
      }
      return _this.outPorts.missed.disconnect();
    });
    this.inPorts["class"].on('data', function(data) {
      _this["class"] = data;
      if (_this.element) {
        return _this.checkClass();
      }
    });
  }

  HasClass.prototype.checkClass = function() {
    if (this.element.classList.contains(this["class"])) {
      this.outPorts.element.send(this.element);
      return;
    }
    if (!this.outPorts.missed.isAttached()) {
      return;
    }
    return this.outPorts.missed.send(this.element);
  };

  return HasClass;

})(noflo.Component);

exports.getComponent = function() {
  return new HasClass;
};

});
require.register("noflo-noflo-dom/components/ReadHtml.js", function(exports, require, module){
var ReadHtml, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ReadHtml = (function(_super) {
  __extends(ReadHtml, _super);

  ReadHtml.prototype.description = 'Read HTML from an existing element';

  function ReadHtml() {
    var _this = this;
    this.inPorts = {
      container: new noflo.Port('object')
    };
    this.outPorts = {
      html: new noflo.Port('string')
    };
    this.inPorts.container.on('data', function(data) {
      _this.outPorts.html.send(data.innerHTML);
      return _this.outPorts.html.disconnect();
    });
  }

  return ReadHtml;

})(noflo.Component);

exports.getComponent = function() {
  return new ReadHtml;
};

});
require.register("noflo-noflo-dom/components/RemoveElement.js", function(exports, require, module){
var RemoveElement, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

RemoveElement = (function(_super) {
  __extends(RemoveElement, _super);

  RemoveElement.prototype.description = 'Remove an element from DOM';

  function RemoveElement() {
    var _this = this;
    this.inPorts = {
      element: new noflo.Port('object')
    };
    this.inPorts.element.on('data', function(element) {
      if (!element.parentNode) {
        return;
      }
      return element.parentNode.removeChild(element);
    });
  }

  return RemoveElement;

})(noflo.Component);

exports.getComponent = function() {
  return new RemoveElement;
};

});
require.register("noflo-noflo-dom/components/SetAttribute.js", function(exports, require, module){
var SetAttribute, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SetAttribute = (function(_super) {
  __extends(SetAttribute, _super);

  function SetAttribute() {
    var _this = this;
    this.attribute = null;
    this.value = null;
    this.element = null;
    this.inPorts = {
      element: new noflo.Port('object'),
      attribute: new noflo.Port('string'),
      value: new noflo.Port('string')
    };
    this.outPorts = {
      element: new noflo.Port('object')
    };
    this.inPorts.element.on('data', function(element) {
      _this.element = element;
      if (_this.attribute && _this.value) {
        return _this.setAttribute();
      }
    });
    this.inPorts.attribute.on('data', function(attribute) {
      _this.attribute = attribute;
      if (_this.element && _this.value) {
        return _this.setAttribute();
      }
    });
    this.inPorts.value.on('data', function(value) {
      _this.value = _this.normalizeValue(value);
      if (_this.attribute && _this.element) {
        return _this.setAttribute();
      }
    });
  }

  SetAttribute.prototype.setAttribute = function() {
    this.element.setAttribute(this.attribute, this.value);
    this.value = null;
    if (this.outPorts.element.isAttached()) {
      this.outPorts.element.send(this.element);
      return this.outPorts.element.disconnect();
    }
  };

  SetAttribute.prototype.normalizeValue = function(value) {
    var key, newVal, val;
    if (typeof value === 'object') {
      if (toString.call(value) !== '[object Array]') {
        newVal = [];
        for (key in value) {
          val = value[key];
          newVal.push(val);
        }
        value = newVal;
      }
      return value.join(' ');
    }
    return value;
  };

  return SetAttribute;

})(noflo.Component);

exports.getComponent = function() {
  return new SetAttribute;
};

});
require.register("noflo-noflo-dom/components/WriteHtml.js", function(exports, require, module){
var WriteHtml, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

WriteHtml = (function(_super) {
  __extends(WriteHtml, _super);

  WriteHtml.prototype.description = 'Write HTML inside an existing element';

  function WriteHtml() {
    var _this = this;
    this.container = null;
    this.html = null;
    this.inPorts = {
      html: new noflo.Port('string'),
      container: new noflo.Port('object')
    };
    this.outPorts = {
      container: new noflo.Port('object')
    };
    this.inPorts.html.on('data', function(data) {
      _this.html = data;
      if (_this.container) {
        return _this.writeHtml();
      }
    });
    this.inPorts.container.on('data', function(data) {
      _this.container = data;
      if (_this.html) {
        return _this.writeHtml();
      }
    });
  }

  WriteHtml.prototype.writeHtml = function() {
    this.container.innerHTML = this.html;
    this.html = null;
    if (this.outPorts.container.isAttached()) {
      this.outPorts.container.send(this.container);
      return this.outPorts.container.disconnect();
    }
  };

  return WriteHtml;

})(noflo.Component);

exports.getComponent = function() {
  return new WriteHtml;
};

});
require.register("noflo-noflo-dom/components/RemoveClass.js", function(exports, require, module){
var RemoveClass, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

RemoveClass = (function(_super) {
  __extends(RemoveClass, _super);

  RemoveClass.prototype.description = 'Remove a class from an element';

  function RemoveClass() {
    var _this = this;
    this.element = null;
    this["class"] = null;
    this.inPorts = {
      element: new noflo.Port('object'),
      "class": new noflo.Port('string')
    };
    this.outPorts = {};
    this.inPorts.element.on('data', function(data) {
      _this.element = data;
      if (_this["class"]) {
        return _this.removeClass();
      }
    });
    this.inPorts["class"].on('data', function(data) {
      _this["class"] = data;
      if (_this.element) {
        return _this.removeClass();
      }
    });
  }

  RemoveClass.prototype.removeClass = function() {
    return this.element.classList.remove(this["class"]);
  };

  return RemoveClass;

})(noflo.Component);

exports.getComponent = function() {
  return new RemoveClass;
};

});
require.register("noflo-noflo-dom/components/RequestAnimationFrame.js", function(exports, require, module){
var RequestAnimationFrame, noflo, requestAnimationFrame,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
  return window.setTimeout(function() {
    return callback(+new Date());
  }, 1000 / 60);
};

RequestAnimationFrame = (function(_super) {
  __extends(RequestAnimationFrame, _super);

  RequestAnimationFrame.prototype.description = 'Sends bangs that correspond with screen refresh rate.';

  RequestAnimationFrame.prototype.icon = 'film';

  function RequestAnimationFrame() {
    var _this = this;
    this.running = false;
    this.inPorts = {
      start: new noflo.Port('bang'),
      stop: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('bang')
    };
    this.inPorts.start.on('data', function(data) {
      _this.running = true;
      return _this.animate();
    });
    this.inPorts.stop.on('data', function(data) {
      return _this.running = false;
    });
  }

  RequestAnimationFrame.prototype.animate = function() {
    if (this.running) {
      requestAnimationFrame(this.animate.bind(this));
      return this.outPorts.out.send(true);
    }
  };

  RequestAnimationFrame.prototype.shutdown = function() {
    return this.running = false;
  };

  return RequestAnimationFrame;

})(noflo.Component);

exports.getComponent = function() {
  return new RequestAnimationFrame;
};

});
require.register("noflo-noflo-css/index.js", function(exports, require, module){
/*
 * This file can be used for general library features that are exposed as CommonJS modules
 * that the components then utilize
 */

});
require.register("noflo-noflo-css/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-css","description":"Cascading Style Sheets components for NoFlo","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-css","version":"0.0.1","keywords":[],"dependencies":{"noflo/noflo":"*"},"scripts":["components/MoveElement.coffee","components/RotateElement.coffee","components/SetElementTop.coffee","index.js"],"json":["component.json"],"noflo":{"icon":"css3","components":{"MoveElement":"components/MoveElement.coffee","RotateElement":"components/RotateElement.coffee","SetElementTop":"components/SetElementTop.coffee"}}}');
});
require.register("noflo-noflo-css/components/MoveElement.js", function(exports, require, module){
var MoveElement, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

MoveElement = (function(_super) {
  __extends(MoveElement, _super);

  MoveElement.prototype.description = 'Change the coordinates of a DOM element';

  MoveElement.prototype.icon = 'move';

  function MoveElement() {
    var _this = this;
    this.element = null;
    this.inPorts = {
      element: new noflo.Port('object'),
      point: new noflo.Port('object'),
      x: new noflo.Port('number'),
      y: new noflo.Port('number'),
      z: new noflo.Port('number')
    };
    this.inPorts.element.on('data', function(element) {
      return _this.element = element;
    });
    this.inPorts.point.on('data', function(point) {
      _this.setPosition('left', "" + point.x + "px");
      return _this.setPosition('top', "" + point.y + "px");
    });
    this.inPorts.x.on('data', function(x) {
      return _this.setPosition('left', "" + x + "px");
    });
    this.inPorts.y.on('data', function(y) {
      return _this.setPosition('top', "" + y + "px");
    });
    this.inPorts.z.on('data', function(z) {
      return _this.setPosition('zIndex', z);
    });
  }

  MoveElement.prototype.setPosition = function(attr, value) {
    this.element.style.position = 'absolute';
    return this.element.style[attr] = value;
  };

  return MoveElement;

})(noflo.Component);

exports.getComponent = function() {
  return new MoveElement;
};

});
require.register("noflo-noflo-css/components/RotateElement.js", function(exports, require, module){
var RotateElement, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

RotateElement = (function(_super) {
  __extends(RotateElement, _super);

  RotateElement.prototype.description = 'Change the coordinates of a DOM element';

  RotateElement.prototype.icon = 'rotate-right';

  function RotateElement() {
    var _this = this;
    this.element = null;
    this.inPorts = {
      element: new noflo.Port('object'),
      percent: new noflo.Port('number'),
      degrees: new noflo.Port('number')
    };
    this.inPorts.element.on('data', function(element) {
      return _this.element = element;
    });
    this.inPorts.percent.on('data', function(percent) {
      var degrees;
      if (!_this.element) {
        return;
      }
      degrees = 360 * percent % 360;
      return _this.setRotation(_this.element, degrees);
    });
    this.inPorts.degrees.on('data', function(degrees) {
      if (!_this.element) {
        return;
      }
      return _this.setRotation(_this.element, degrees);
    });
  }

  RotateElement.prototype.setRotation = function(element, degrees) {
    return this.setVendor(element, "transform", "rotate(" + degrees + "deg)");
  };

  RotateElement.prototype.setVendor = function(element, property, value) {
    var propertyCap;
    propertyCap = property.charAt(0).toUpperCase() + property.substr(1);
    element.style["webkit" + propertyCap] = value;
    element.style["moz" + propertyCap] = value;
    element.style["ms" + propertyCap] = value;
    element.style["o" + propertyCap] = value;
    return element.style[property] = value;
  };

  return RotateElement;

})(noflo.Component);

exports.getComponent = function() {
  return new RotateElement;
};

});
require.register("noflo-noflo-css/components/SetElementTop.js", function(exports, require, module){
var SetElementTop, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SetElementTop = (function(_super) {
  __extends(SetElementTop, _super);

  SetElementTop.prototype.description = 'Set element\'s CSS top';

  SetElementTop.prototype.icon = 'resize-vertical';

  function SetElementTop() {
    var _this = this;
    this.element = null;
    this.inPorts = {
      element: new noflo.Port('object'),
      top: new noflo.Port('number')
    };
    this.inPorts.element.on('data', function(element) {
      return _this.element = element;
    });
    this.inPorts.top.on('data', function(top) {
      if (!_this.element) {
        return;
      }
      _this.element.style.position = 'absolute';
      return _this.element.style.top = "" + top + "px";
    });
  }

  return SetElementTop;

})(noflo.Component);

exports.getComponent = function() {
  return new SetElementTop;
};

});
require.register("noflo-noflo-math/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of noflo-math.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-math/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-math","description":"Mathematical components for NoFlo","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-math","version":"0.0.1","keywords":[],"dependencies":{"noflo/noflo":"*"},"scripts":["components/Add.coffee","components/Subtract.coffee","components/Multiply.coffee","components/Divide.coffee","components/CalculateAngle.coffee","components/CalculateDistance.coffee","components/Compare.coffee","components/CountSum.coffee","lib/MathComponent.coffee","index.js"],"json":["component.json"],"noflo":{"icon":"plus-sign","components":{"Add":"components/Add.coffee","Subtract":"components/Subtract.coffee","Multiply":"components/Multiply.coffee","Divide":"components/Divide.coffee","CalculateAngle":"components/CalculateAngle.coffee","CalculateDistance":"components/CalculateDistance.coffee","Compare":"components/Compare.coffee","CountSum":"components/CountSum.coffee"}}}');
});
require.register("noflo-noflo-math/components/Add.js", function(exports, require, module){
var Add, MathComponent,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MathComponent = require('../lib/MathComponent').MathComponent;

Add = (function(_super) {
  __extends(Add, _super);

  Add.prototype.icon = 'plus';

  function Add() {
    Add.__super__.constructor.call(this, 'augend', 'addend', 'sum');
  }

  Add.prototype.calculate = function(augend, addend) {
    return augend + addend;
  };

  return Add;

})(MathComponent);

exports.getComponent = function() {
  return new Add;
};

});
require.register("noflo-noflo-math/components/Subtract.js", function(exports, require, module){
var MathComponent, Subtract,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MathComponent = require('../lib/MathComponent').MathComponent;

Subtract = (function(_super) {
  __extends(Subtract, _super);

  Subtract.prototype.icon = 'minus';

  function Subtract() {
    Subtract.__super__.constructor.call(this, 'minuend', 'subtrahend', 'difference');
  }

  Subtract.prototype.calculate = function(minuend, subtrahend) {
    return minuend - subtrahend;
  };

  return Subtract;

})(MathComponent);

exports.getComponent = function() {
  return new Subtract;
};

});
require.register("noflo-noflo-math/components/Multiply.js", function(exports, require, module){
var MathComponent, Multiply,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MathComponent = require('../lib/MathComponent').MathComponent;

Multiply = (function(_super) {
  __extends(Multiply, _super);

  Multiply.prototype.icon = 'asterisk';

  function Multiply() {
    Multiply.__super__.constructor.call(this, 'multiplicand', 'multiplier', 'product');
  }

  Multiply.prototype.calculate = function(multiplicand, multiplier) {
    return multiplicand * multiplier;
  };

  return Multiply;

})(MathComponent);

exports.getComponent = function() {
  return new Multiply;
};

});
require.register("noflo-noflo-math/components/Divide.js", function(exports, require, module){
var Divide, MathComponent,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MathComponent = require('../lib/MathComponent').MathComponent;

Divide = (function(_super) {
  __extends(Divide, _super);

  function Divide() {
    Divide.__super__.constructor.call(this, 'dividend', 'divisor', 'quotient');
  }

  Divide.prototype.calculate = function(dividend, divisor) {
    return dividend / divisor;
  };

  return Divide;

})(MathComponent);

exports.getComponent = function() {
  return new Divide;
};

});
require.register("noflo-noflo-math/components/CalculateAngle.js", function(exports, require, module){
var CalculateAngle, MathComponent,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MathComponent = require('../lib/MathComponent').MathComponent;

CalculateAngle = (function(_super) {
  __extends(CalculateAngle, _super);

  CalculateAngle.prototype.description = 'Calculate the angle between two points';

  CalculateAngle.prototype.icon = 'compass';

  function CalculateAngle() {
    CalculateAngle.__super__.constructor.call(this, 'origin', 'destination', 'angle', 'object');
  }

  CalculateAngle.prototype.calculate = function(origin, destination) {
    var angle, deltaX, deltaY;
    deltaX = destination.x - origin.x;
    deltaY = destination.y - origin.y;
    origin = null;
    destination = null;
    angle = (Math.atan2(deltaY, deltaX) * 180 / Math.PI) + 90;
    if (angle < 0) {
      angle = angle + 360;
    }
    return angle;
  };

  return CalculateAngle;

})(MathComponent);

exports.getComponent = function() {
  return new CalculateAngle;
};

});
require.register("noflo-noflo-math/components/CalculateDistance.js", function(exports, require, module){
var CalculateDistance, MathComponent,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MathComponent = require('../lib/MathComponent').MathComponent;

CalculateDistance = (function(_super) {
  __extends(CalculateDistance, _super);

  CalculateDistance.prototype.icon = 'arrow-right';

  CalculateDistance.prototype.description = 'Calculate the distance between two points';

  function CalculateDistance() {
    CalculateDistance.__super__.constructor.call(this, 'origin', 'destination', 'distance', 'object');
  }

  CalculateDistance.prototype.calculate = function(origin, destination) {
    var deltaX, deltaY, distance;
    deltaX = destination.x - origin.x;
    deltaY = destination.y - origin.y;
    origin = null;
    destination = null;
    distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    return distance;
  };

  return CalculateDistance;

})(MathComponent);

exports.getComponent = function() {
  return new CalculateDistance;
};

});
require.register("noflo-noflo-math/components/Compare.js", function(exports, require, module){
var Compare, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Compare = (function(_super) {
  __extends(Compare, _super);

  Compare.prototype.description = 'Compare two numbers';

  Compare.prototype.icon = 'check';

  function Compare() {
    var _this = this;
    this.operator = '==';
    this.value = null;
    this.comparison = null;
    this.inPorts = {
      value: new noflo.Port('number'),
      comparison: new noflo.Port('number'),
      operator: new noflo.Port('string')
    };
    this.outPorts = {
      pass: new noflo.Port('number'),
      fail: new noflo.Port('number')
    };
    this.inPorts.operator.on('data', function(operator) {
      _this.operator = operator;
    });
    this.inPorts.value.on('data', function(value) {
      _this.value = value;
      if (_this.comparison) {
        return _this.compare();
      }
    });
    this.inPorts.value.on('disconnect', function() {
      return _this.outPorts.pass.disconnect();
    });
    this.inPorts.comparison.on('data', function(comparison) {
      _this.comparison = comparison;
      if (_this.value) {
        return _this.compare();
      }
    });
  }

  Compare.prototype.compare = function() {
    switch (this.operator) {
      case 'eq':
      case '==':
        if (this.value === this.comparison) {
          return this.send(this.value);
        }
        break;
      case 'ne':
      case '!=':
        if (this.value !== this.comparison) {
          return this.send(this.value);
        }
        break;
      case 'gt':
      case '>':
        if (this.value > this.comparison) {
          return this.send(this.value);
        }
        break;
      case 'lt':
      case '<':
        if (this.value < this.comparison) {
          return this.send(this.value);
        }
        break;
      case 'ge':
      case '>=':
        if (this.value >= this.comparison) {
          return this.send(this.value);
        }
        break;
      case 'le':
      case '<=':
        if (this.value <= this.comparison) {
          return this.send(this.value);
        }
    }
    if (!this.outPorts.fail.isAttached()) {
      return;
    }
    this.outPorts.fail.send(this.value);
    return this.outPorts.fail.disconnect();
  };

  Compare.prototype.send = function(val) {
    return this.outPorts.pass.send(this.value);
  };

  return Compare;

})(noflo.Component);

exports.getComponent = function() {
  return new Compare;
};

});
require.register("noflo-noflo-math/components/CountSum.js", function(exports, require, module){
var CountSum, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CountSum = (function(_super) {
  __extends(CountSum, _super);

  function CountSum() {
    var _this = this;
    this.portCounts = {};
    this.inPorts = {
      "in": new noflo.ArrayPort('number')
    };
    this.outPorts = {
      out: new noflo.ArrayPort('number')
    };
    this.inPorts["in"].on('data', function(data, portId) {
      return _this.count(portId, data);
    });
    this.inPorts["in"].on('disconnect', function(socket, portId) {
      var _i, _len, _ref;
      _ref = _this.inPorts["in"].sockets;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        socket = _ref[_i];
        if (socket.isConnected()) {
          return;
        }
      }
      return _this.outPorts.out.disconnect();
    });
  }

  CountSum.prototype.count = function(port, data) {
    var id, socket, sum, _i, _len, _ref;
    sum = 0;
    this.portCounts[port] = data;
    _ref = this.inPorts["in"].sockets;
    for (id = _i = 0, _len = _ref.length; _i < _len; id = ++_i) {
      socket = _ref[id];
      if (typeof this.portCounts[id] === 'undefined') {
        this.portCounts[id] = 0;
      }
      sum += this.portCounts[id];
    }
    return this.outPorts.out.send(sum);
  };

  return CountSum;

})(noflo.Component);

exports.getComponent = function() {
  return new CountSum;
};

});
require.register("noflo-noflo-math/lib/MathComponent.js", function(exports, require, module){
var MathComponent, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

MathComponent = (function(_super) {
  __extends(MathComponent, _super);

  function MathComponent(primary, secondary, res, inputType) {
    var calculate,
      _this = this;
    if (inputType == null) {
      inputType = 'number';
    }
    this.inPorts = {};
    this.outPorts = {};
    this.inPorts[primary] = new noflo.Port(inputType);
    this.inPorts[secondary] = new noflo.Port(inputType);
    this.inPorts.clear = new noflo.Port('bang');
    this.outPorts[res] = new noflo.Port('number');
    this.primary = {
      value: null,
      group: [],
      disconnect: false
    };
    this.secondary = null;
    this.groups = [];
    calculate = function() {
      var group, _i, _j, _len, _len1, _ref, _ref1;
      _ref = _this.primary.group;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
        _this.outPorts[res].beginGroup(group);
      }
      _this.outPorts[res].send(_this.calculate(_this.primary.value, _this.secondary));
      _ref1 = _this.primary.group;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        group = _ref1[_j];
        _this.outPorts[res].endGroup();
      }
      if (_this.primary.disconnect) {
        return _this.outPorts[res].disconnect();
      }
    };
    this.inPorts[primary].on('begingroup', function(group) {
      return _this.groups.push(group);
    });
    this.inPorts[primary].on('data', function(data) {
      _this.primary = {
        value: data,
        group: _this.groups.slice(0),
        disconnect: false
      };
      if (_this.secondary !== null) {
        return calculate();
      }
    });
    this.inPorts[primary].on('endgroup', function() {
      return _this.groups.pop();
    });
    this.inPorts[primary].on('disconnect', function() {
      _this.primary.disconnect = true;
      return _this.outPorts[res].disconnect();
    });
    this.inPorts[secondary].on('data', function(data) {
      _this.secondary = data;
      if (_this.primary.value !== null) {
        return calculate();
      }
    });
    this.inPorts.clear.on('data', function(data) {
      var group, _i, _len, _ref;
      if (_this.outPorts[res].isConnected()) {
        _ref = _this.primary.group;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          group = _ref[_i];
          _this.outPorts[res].endGroup();
        }
        if (_this.primary.disconnect) {
          _this.outPorts[res].disconnect();
        }
      }
      _this.primary = {
        value: null,
        group: [],
        disconnect: false
      };
      _this.secondary = null;
      return _this.groups = [];
    });
  }

  return MathComponent;

})(noflo.Component);

exports.MathComponent = MathComponent;

});
require.register("noflo-noflo-core/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of core.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-core/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-core","description":"NoFlo Essentials","repo":"noflo/noflo-core","version":"0.1.0","author":{"name":"Henri Bergius","email":"henri.bergius@iki.fi"},"contributors":[{"name":"Kenneth Kan","email":"kenhkan@gmail.com"},{"name":"Ryan Shaw","email":"ryanshaw@unc.edu"}],"keywords":[],"dependencies":{"noflo/noflo":"*","component/underscore":"*"},"scripts":["components/Callback.coffee","components/DisconnectAfterPacket.coffee","components/Drop.coffee","components/Group.coffee","components/Kick.coffee","components/Merge.coffee","components/Output.coffee","components/Repeat.coffee","components/RepeatAsync.coffee","components/Split.coffee","components/RunInterval.coffee","components/MakeFunction.coffee","index.js"],"json":["component.json"],"noflo":{"components":{"Callback":"components/Callback.coffee","DisconnectAfterPacket":"components/DisconnectAfterPacket.coffee","Drop":"components/Drop.coffee","Group":"components/Group.coffee","Kick":"components/Kick.coffee","Merge":"components/Merge.coffee","Output":"components/Output.coffee","Repeat":"components/Repeat.coffee","RepeatAsync":"components/RepeatAsync.coffee","Split":"components/Split.coffee","RunInterval":"components/RunInterval.coffee","MakeFunction":"components/MakeFunction.coffee"}}}');
});
require.register("noflo-noflo-core/components/Callback.js", function(exports, require, module){
var Callback, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore')._;

Callback = (function(_super) {
  __extends(Callback, _super);

  Callback.prototype.description = 'This component calls a given callback function for each\
  IP it receives.  The Callback component is typically used to connect\
  NoFlo with external Node.js code.';

  Callback.prototype.icon = 'signout';

  function Callback() {
    var _this = this;
    this.callback = null;
    this.inPorts = {
      "in": new noflo.Port('all'),
      callback: new noflo.Port('function')
    };
    this.outPorts = {
      error: new noflo.Port('object')
    };
    this.inPorts.callback.on('data', function(data) {
      if (!_.isFunction(data)) {
        _this.error('The provided callback must be a function');
        return;
      }
      return _this.callback = data;
    });
    this.inPorts["in"].on('data', function(data) {
      if (!_this.callback) {
        _this.error('No callback provided');
        return;
      }
      return _this.callback(data);
    });
  }

  Callback.prototype.error = function(msg) {
    if (this.outPorts.error.isAttached()) {
      this.outPorts.error.send(new Error(msg));
      this.outPorts.error.disconnect();
      return;
    }
    throw new Error(msg);
  };

  return Callback;

})(noflo.Component);

exports.getComponent = function() {
  return new Callback;
};

});
require.register("noflo-noflo-core/components/DisconnectAfterPacket.js", function(exports, require, module){
var DisconnectAfterPacket, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

DisconnectAfterPacket = (function(_super) {
  __extends(DisconnectAfterPacket, _super);

  DisconnectAfterPacket.prototype.description = 'Forwards any packets, but also sends a disconnect after each of them';

  DisconnectAfterPacket.prototype.icon = 'pause';

  function DisconnectAfterPacket() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port('all')
    };
    this.outPorts = {
      out: new noflo.Port('all')
    };
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      _this.outPorts.out.send(data);
      return _this.outPorts.out.disconnect();
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
  }

  return DisconnectAfterPacket;

})(noflo.Component);

exports.getComponent = function() {
  return new DisconnectAfterPacket;
};

});
require.register("noflo-noflo-core/components/Drop.js", function(exports, require, module){
var Drop, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Drop = (function(_super) {
  __extends(Drop, _super);

  Drop.prototype.description = 'This component drops every packet it receives with no\
  action';

  Drop.prototype.icon = 'trash';

  function Drop() {
    this.inPorts = {
      "in": new noflo.ArrayPort('all')
    };
    this.outPorts = {};
  }

  return Drop;

})(noflo.Component);

exports.getComponent = function() {
  return new Drop;
};

});
require.register("noflo-noflo-core/components/Group.js", function(exports, require, module){
var Group, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Group = (function(_super) {
  __extends(Group, _super);

  Group.prototype.description = 'Adds a set of groups around the packets received at each connection';

  Group.prototype.icon = 'tags';

  function Group() {
    var _this = this;
    this.groups = [];
    this.newGroups = [];
    this.threshold = null;
    this.inPorts = {
      "in": new noflo.ArrayPort('all'),
      group: new noflo.ArrayPort('string'),
      threshold: new noflo.Port('integer')
    };
    this.outPorts = {
      out: new noflo.Port('all')
    };
    this.inPorts["in"].on('connect', function() {
      var group, _i, _len, _ref, _results;
      _ref = _this.newGroups;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
        _results.push(_this.outPorts.out.beginGroup(group));
      }
      return _results;
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on('endgroup', function(group) {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      var group, _i, _len, _ref;
      _ref = _this.newGroups;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
        _this.outPorts.out.endGroup();
      }
      _this.outPorts.out.disconnect();
      return _this.groups = [];
    });
    this.inPorts.group.on('data', function(data) {
      var diff;
      if (_this.threshold) {
        diff = _this.newGroups.length - _this.threshold + 1;
        if (diff > 0) {
          _this.newGroups = _this.newGroups.slice(diff);
        }
      }
      return _this.newGroups.push(data);
    });
    this.inPorts.threshold.on('data', function(threshold) {
      _this.threshold = threshold;
    });
  }

  return Group;

})(noflo.Component);

exports.getComponent = function() {
  return new Group;
};

});
require.register("noflo-noflo-core/components/Kick.js", function(exports, require, module){
var Kick, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Kick = (function(_super) {
  __extends(Kick, _super);

  Kick.prototype.description = 'This component generates a single packet and sends it to\
  the output port. Mostly usable for debugging, but can also be useful\
  for starting up networks.';

  Kick.prototype.icon = 'share';

  function Kick() {
    var _this = this;
    this.data = {
      packet: null,
      group: []
    };
    this.groups = [];
    this.inPorts = {
      "in": new noflo.Port('bang'),
      data: new noflo.Port('all')
    };
    this.outPorts = {
      out: new noflo.ArrayPort('all')
    };
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.groups.push(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.data.group = _this.groups.slice(0);
    });
    this.inPorts["in"].on('endgroup', function(group) {
      return _this.groups.pop();
    });
    this.inPorts["in"].on('disconnect', function() {
      _this.sendKick(_this.data);
      return _this.groups = [];
    });
    this.inPorts.data.on('data', function(data) {
      return _this.data.packet = data;
    });
  }

  Kick.prototype.sendKick = function(kick) {
    var group, _i, _j, _len, _len1, _ref, _ref1;
    _ref = kick.group;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      group = _ref[_i];
      this.outPorts.out.beginGroup(group);
    }
    this.outPorts.out.send(kick.packet);
    _ref1 = kick.group;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      group = _ref1[_j];
      this.outPorts.out.endGroup();
    }
    return this.outPorts.out.disconnect();
  };

  return Kick;

})(noflo.Component);

exports.getComponent = function() {
  return new Kick;
};

});
require.register("noflo-noflo-core/components/Merge.js", function(exports, require, module){
var Merge, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Merge = (function(_super) {
  __extends(Merge, _super);

  Merge.prototype.description = 'This component receives data on multiple input ports and\
    sends the same data out to the connected output port';

  Merge.prototype.icon = 'resize-small';

  function Merge() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.ArrayPort('all')
    };
    this.outPorts = {
      out: new noflo.Port('all')
    };
    this.inPorts["in"].on('connect', function() {
      return _this.outPorts.out.connect();
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      var socket, _i, _len, _ref;
      _ref = _this.inPorts["in"].sockets;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        socket = _ref[_i];
        if (socket.connected) {
          return;
        }
      }
      return _this.outPorts.out.disconnect();
    });
  }

  return Merge;

})(noflo.Component);

exports.getComponent = function() {
  return new Merge;
};

});
require.register("noflo-noflo-core/components/Output.js", function(exports, require, module){
var Output, noflo, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

if (!noflo.isBrowser()) {
  util = require('util');
} else {
  util = {
    inspect: function(data) {
      return data;
    }
  };
}

Output = (function(_super) {
  __extends(Output, _super);

  Output.prototype.description = 'This component receives input on a single inport, and\
    sends the data items directly to console.log';

  Output.prototype.icon = 'bug';

  function Output() {
    var _this = this;
    this.options = null;
    this.inPorts = {
      "in": new noflo.ArrayPort('all'),
      options: new noflo.Port('object')
    };
    this.outPorts = {
      out: new noflo.Port('all')
    };
    this.inPorts["in"].on('data', function(data) {
      _this.log(data);
      if (_this.outPorts.out.isAttached()) {
        return _this.outPorts.out.send(data);
      }
    });
    this.inPorts["in"].on('disconnect', function() {
      if (_this.outPorts.out.isAttached()) {
        return _this.outPorts.out.disconnect();
      }
    });
    this.inPorts.options.on('data', function(data) {
      return _this.setOptions(data);
    });
  }

  Output.prototype.setOptions = function(options) {
    var key, value, _results;
    if (typeof options !== 'object') {
      throw new Error('Options is not an object');
    }
    if (this.options == null) {
      this.options = {};
    }
    _results = [];
    for (key in options) {
      if (!__hasProp.call(options, key)) continue;
      value = options[key];
      _results.push(this.options[key] = value);
    }
    return _results;
  };

  Output.prototype.log = function(data) {
    if (this.options != null) {
      return console.log(util.inspect(data, this.options.showHidden, this.options.depth, this.options.colors));
    } else {
      return console.log(data);
    }
  };

  return Output;

})(noflo.Component);

exports.getComponent = function() {
  return new Output();
};

});
require.register("noflo-noflo-core/components/Repeat.js", function(exports, require, module){
var Repeat, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Repeat = (function(_super) {
  __extends(Repeat, _super);

  Repeat.prototype.description = 'Forwards packets and metadata in the same way it receives them';

  Repeat.prototype.icon = 'forward';

  function Repeat() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts["in"].on('connect', function() {
      return _this.outPorts.out.connect();
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Repeat;

})(noflo.Component);

exports.getComponent = function() {
  return new Repeat();
};

});
require.register("noflo-noflo-core/components/RepeatAsync.js", function(exports, require, module){
var RepeatAsync, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

RepeatAsync = (function(_super) {
  __extends(RepeatAsync, _super);

  RepeatAsync.prototype.description = "Like 'Repeat', except repeat on next tick";

  RepeatAsync.prototype.icon = 'step-forward';

  function RepeatAsync() {
    var _this = this;
    this.groups = [];
    this.inPorts = {
      "in": new noflo.Port('all')
    };
    this.outPorts = {
      out: new noflo.Port('all')
    };
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.groups.push(group);
    });
    this.inPorts["in"].on('data', function(data) {
      var groups, later;
      groups = _this.groups;
      later = function() {
        var group, _i, _j, _len, _len1;
        for (_i = 0, _len = groups.length; _i < _len; _i++) {
          group = groups[_i];
          _this.outPorts.out.beginGroup(group);
        }
        _this.outPorts.out.send(data);
        for (_j = 0, _len1 = groups.length; _j < _len1; _j++) {
          group = groups[_j];
          _this.outPorts.out.endGroup();
        }
        return _this.outPorts.out.disconnect();
      };
      return setTimeout(later, 0);
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.groups = [];
    });
  }

  return RepeatAsync;

})(noflo.Component);

exports.getComponent = function() {
  return new RepeatAsync;
};

});
require.register("noflo-noflo-core/components/Split.js", function(exports, require, module){
var Split, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Split = (function(_super) {
  __extends(Split, _super);

  Split.prototype.description = 'This component receives data on a single input port and\
    sends the same data out to all connected output ports';

  Split.prototype.icon = 'resize-full';

  function Split() {
    var _this = this;
    this.inPorts = {
      "in": new noflo.Port('all')
    };
    this.outPorts = {
      out: new noflo.ArrayPort('all')
    };
    this.inPorts["in"].on('connect', function() {
      return _this.outPorts.out.connect();
    });
    this.inPorts["in"].on('begingroup', function(group) {
      return _this.outPorts.out.beginGroup(group);
    });
    this.inPorts["in"].on('data', function(data) {
      return _this.outPorts.out.send(data);
    });
    this.inPorts["in"].on('endgroup', function() {
      return _this.outPorts.out.endGroup();
    });
    this.inPorts["in"].on('disconnect', function() {
      return _this.outPorts.out.disconnect();
    });
  }

  return Split;

})(noflo.Component);

exports.getComponent = function() {
  return new Split;
};

});
require.register("noflo-noflo-core/components/RunInterval.js", function(exports, require, module){
var RunInterval, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

RunInterval = (function(_super) {
  __extends(RunInterval, _super);

  RunInterval.prototype.description = 'Send a packet at the given interval';

  RunInterval.prototype.icon = 'clock';

  function RunInterval() {
    var _this = this;
    this.timer = null;
    this.interval = null;
    this.inPorts = {
      interval: new noflo.Port('number'),
      start: new noflo.Port('bang'),
      stop: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('bang')
    };
    this.inPorts.interval.on('data', function(interval) {
      _this.interval = interval;
      if (_this.timer != null) {
        clearInterval(_this.timer);
        return _this.timer = setInterval(function() {
          return _this.outPorts.out.send(true);
        }, _this.interval);
      }
    });
    this.inPorts.start.on('data', function() {
      if (_this.timer != null) {
        clearInterval(_this.timer);
      }
      _this.outPorts.out.connect();
      return _this.timer = setInterval(function() {
        return _this.outPorts.out.send(true);
      }, _this.interval);
    });
    this.inPorts.stop.on('data', function() {
      if (!_this.timer) {
        return;
      }
      clearInterval(_this.timer);
      _this.timer = null;
      return _this.outPorts.out.disconnect();
    });
  }

  RunInterval.prototype.shutdown = function() {
    if (this.timer != null) {
      return clearInterval(this.timer);
    }
  };

  return RunInterval;

})(noflo.Component);

exports.getComponent = function() {
  return new RunInterval;
};

});
require.register("noflo-noflo-core/components/MakeFunction.js", function(exports, require, module){
var MakeFunction, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

MakeFunction = (function(_super) {
  __extends(MakeFunction, _super);

  MakeFunction.prototype.description = 'Evaluates a function each time data hits the "in" port\
  and sends the return value to "out". Within the function "x" will\
  be the variable from the in port. For example, to make a ^2 function\
  input "return x*x;" to the function port.';

  MakeFunction.prototype.icon = 'code';

  function MakeFunction() {
    var _this = this;
    this.f = null;
    this.inPorts = {
      "in": new noflo.Port('all'),
      "function": new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('all'),
      "function": new noflo.Port('function'),
      error: new noflo.Port('object')
    };
    this.inPorts["function"].on('data', function(data) {
      var error;
      if (typeof data === "function") {
        _this.f = data;
      } else {
        try {
          _this.f = Function("x", data);
        } catch (_error) {
          error = _error;
          _this.error('Error creating function: ' + data);
        }
      }
      if (_this.f) {
        try {
          _this.f(true);
          if (_this.outPorts["function"].isAttached()) {
            return _this.outPorts["function"].send(_this.f);
          }
        } catch (_error) {
          error = _error;
          return _this.error('Error evaluating function: ' + data);
        }
      }
    });
    this.inPorts["in"].on('data', function(data) {
      if (!_this.f) {
        _this.error('No function defined');
        return;
      }
      return _this.outPorts.out.send(_this.f(data));
    });
  }

  MakeFunction.prototype.error = function(msg) {
    if (this.outPorts.error.isAttached()) {
      this.outPorts.error.send(new Error(msg));
      this.outPorts.error.disconnect();
      return;
    }
    throw new Error(msg);
  };

  return MakeFunction;

})(noflo.Component);

exports.getComponent = function() {
  return new MakeFunction;
};

});
require.register("the-behavior/index.js", function(exports, require, module){
var noflo = require('/noflo-noflo');

exports.runGraph = function (graph, callback) {
  graph.baseDir = 'the-behavior';
  noflo.createNetwork(graph, callback);
};

exports.prepareGraph = function (instance) {
  var graph = new noflo.Graph('the-behaviors');
  var behaviors = Array.prototype.slice.call(instance.getElementsByTagName('the-behavior'));

  // We use a single listener for all behaviors
  prevNode = exports.prepareListener(graph, instance);

  var componentLoader = require('/noflo-noflo/src/lib/ComponentLoader');
  var loader = new componentLoader.ComponentLoader('the-behavior');
  loader.listComponents(function () {});

  // Control detection with a gate. When any behavior has been recognized we stop
  // detection
  graph.addNode('Detect', 'flow/Gate');
  graph.addNode('AllowDetect', 'core/Merge');
  graph.addEdge('AllowDetect', 'out', 'Detect', 'open');
  graph.addNode('StopDetect', 'core/Merge');
  graph.addEdge('StopDetect', 'out', 'Detect', 'close');
  graph.addNode('SplitGesture', 'core/Split');
  graph.addEdge('Listen', 'out', 'SplitGesture', 'in');
  graph.addEdge('SplitGesture', 'out', 'Detect', 'in');
  // when that gesture ends we reopen it
  graph.addNode('AfterGestureReallowDetect', 'core/Kick');
  graph.addEdge('SplitGesture', 'out', 'AfterGestureReallowDetect', 'in');
  graph.addEdge('AfterGestureReallowDetect', 'out', 'AllowDetect', 'in');

  // Initially detection is enabled
  graph.addInitial(true, 'AllowDetect', 'in');

  // Connect listener to detection

  prevNode = ['Detect', 'out'];
  behaviors.forEach(function (behavior, idx) {
    // Build a subgraph for the behavior
    var id = behavior.type.charAt(0).toUpperCase() + behavior.type.slice(1) + idx;
    behavior.container = instance.container;
    var subgraph = exports.prepareDetectionGraph(behavior);
    //console.log(subgraph.toDOT());
    subgraph.baseDir = 'the-behavior';
    loader.loadGraph(id, subgraph, function (instance) {
      var graphNode = graph.addNode(id, instance);

      // Connect it with our listener
      graph.addEdge(prevNode[0], prevNode[1], id, 'detect');
      graph.addEdge('SplitGesture', 'out', id, 'in');

      // If the behavior passes we can stop detection
      graph.addEdge(id, 'pass', 'StopDetect', 'in');
    });

    // If this behavior fails, try next one
    prevNode = [id, 'fail'];
  });

  // If all detection failed, close detection
  graph.addEdge(prevNode[0], prevNode[1], 'StopDetect', 'in');

  return graph;
}

exports.prepareDetectionGraph = function (instance) {
  var prevNode;

  // Initialize subgraph
  var graph = new noflo.Graph(instance.type);

  // Entry point
  graph.addNode('Gesture', 'core/Repeat');
  graph.addExport('gesture.in', 'detect');
  graph.addNode('SplitGesture', 'core/Split');
  graph.addExport('splitgesture.in', 'in');
  prevNode = ['Gesture', 'out'];

  graph.addNode('Passed', 'core/Merge');
  graph.addNode('Target', 'core/Repeat');
  graph.addNode('AllowDetect', 'core/Repeat');

  // Go to action
  graph.addNode('DoAction', 'core/Merge');

  // When no gesture has been recognized we ignore the situation
  graph.addNode('NotYet', 'core/Drop');

  // Handle pass-thru
  exports.preparePassThrough(graph, instance);

  // Validate target node
  prevNode = exports.prepareAccept(graph, instance, prevNode);
  // Check the gesture
  switch (instance.type) {
    case 'pinch':
      prevNode = exports.preparePinch(graph, instance, prevNode);
      break;
    case 'drag':
      prevNode = exports.prepareDrag(graph, instance, prevNode);
      break;
    case 'swipe':
      prevNode = exports.prepareSwipe(graph, instance, prevNode);
      break;
  }
  // Check gesture direction
  prevNode = exports.prepareDirection(graph, instance, prevNode);

  // Gesture has been accepted, pass data to action
  graph.addEdge(prevNode[0], prevNode[1], 'Passed', 'in');

  prevNode = ['DoAction', 'out'];

  // Handle action
  switch (instance.action) {
    case 'move':
      exports.prepareMove(graph, instance, prevNode);
      break;
    case 'remove':
      exports.prepareRemove(graph, instance, prevNode);
      break;
    case 'attribute':
      exports.prepareAttribute(graph, instance, prevNode);
      break;
    default:
      // No built-in action, trigger event
      exports.prepareCallback(graph, instance, prevNode);
      break;
  }

  // Handle gesture end
  graph.addNode('AfterGestureClosePassthru', 'core/Kick');
  graph.addEdge('SplitGesture', 'out', 'AfterGestureClosePassthru', 'in');
  graph.addEdge('AfterGestureClosePassthru', 'out', 'PassThru', 'close');

  // Emit end event
  graph.addNode('EndCallback', 'core/Callback');
  graph.addNode('AfterGestureCall', 'core/Kick');
  graph.addEdge('SplitGesture', 'out', 'AfterGestureCall', 'data');
  graph.addEdge('AfterGestureCall', 'out', 'EndCallback', 'in');
  var endCallback = function (gesture) {
    instance.fire('gestureend', gesture);
  };
  graph.addInitial(endCallback, 'EndCallback', 'callback');
  // Only after a recognized resture
  graph.addNode('AllowEnd', 'flow/Gate');
  graph.addEdge('SplitPassed', 'out', 'AllowEnd', 'open');
  graph.addEdge('SplitPassed', 'out', 'PassThru', 'open');
  graph.addEdge('SplitGesture', 'out', 'AllowEnd', 'in');
  graph.addEdge('AllowEnd', 'out', 'AfterGestureCall', 'in');
  graph.addNode('AfterGestureCloseCallback', 'core/Kick');
  graph.addEdge('SplitGesture', 'out', 'AfterGestureCloseCallback', 'in');
  graph.addEdge('AfterGestureCloseCallback', 'out', 'AllowEnd', 'close');

  return graph;
}

exports.prepareListener = function (graph, instance) {
  graph.addNode('Listen', 'gestures/GestureToObject');

  switch (instance.listento) {
    case 'document':
      graph.addInitial(document, 'Listen', 'element');
      break;
    case 'container':
    default:
      graph.addInitial(instance.container, 'Listen', 'element');
      break;
  }
  return ['Listen', 'out'];
};

exports.preparePassThrough = function (graph, instance, prevNode) {
  // Report failures upstread
  graph.addNode('Failed', 'core/Merge');
  graph.addExport('failed.out', 'fail');

  // We use a gate for passing things after recognition straight to action
  graph.addNode('PassThru', 'flow/Gate');
  graph.addEdge('SplitGesture', 'out', 'PassThru', 'in');
  graph.addEdge('PassThru', 'out', 'DoAction', 'in');

  // Open on detected gesture
  graph.addEdge('SplitPassed', 'out', 'PassThru', 'open');

  // Close the gate after detection
  graph.addNode('SplitPassed', 'core/Split');
  graph.addEdge('Passed', 'out', 'SplitPassed', 'in');
  graph.addEdge('SplitPassed', 'out', 'DoAction', 'in');

  // Report passes upstream
  graph.addExport('splitpassed.out', 'pass');
};

exports.prepareAccept = function (graph, instance, prevNode) {
  if (!instance.accept) {
    graph.addInitial(instance.container, 'Target', 'in');
    return prevNode;
  }

  graph.addNode('DetectTarget', 'gestures/DetectTarget');
  graph.addInitial('startelement', 'DetectTarget', 'key');
  graph.addEdge(prevNode[0], prevNode[1], 'DetectTarget', 'in');
  graph.addEdge('DetectTarget', 'target', 'Target', 'in');
  graph.addInitial(instance.accept, 'DetectTarget', 'target');
  graph.addEdge('DetectTarget', 'fail', 'Failed', 'in');
  return ['DetectTarget', 'pass'];
};

exports.preparePinch = function (graph, instance, prevNode) {
  graph.addNode('DetectPinch', 'gestures/DetectPinch');
  graph.addEdge(prevNode[0], prevNode[1], 'DetectPinch', 'in');
  graph.addEdge('DetectPinch', 'fail', 'Failed', 'in');
  return ['DetectPinch', 'pass'];
};

exports.prepareDrag = function (graph, instance, prevNode) {
  var minDistance = 20;
  if (instance.mindistance) {
    minDistance = parseInt(instance.mindistance);
  }
  var maxSpeed = Infinity;
  if (instance.maxspeed) {
    maxSpeed = parseInt(instance.maxspeed);
  }
  graph.addNode('DetectDrag', 'gestures/DetectDrag');
  graph.addEdge(prevNode[0], prevNode[1], 'DetectDrag', 'in');
  graph.addInitial(minDistance, 'DetectDrag', 'distance');
  graph.addInitial(maxSpeed, 'DetectDrag', 'maxspeed');
  if (instance.type === 'drag') {
    graph.addEdge('DetectDrag', 'fail', 'NotYet', 'in');
  } else {
    graph.addEdge('DetectDrag', 'fail', 'Failed', 'in');
  }
  return ['DetectDrag', 'pass'];
};

exports.prepareSwipe = function (graph, instance, prevNode) {
  var minDistance = 50;
  if (instance.mindistance) {
    minDistance = parseInt(instance.mindistance);
  }
  var minSpeed = 1.5;
  if (instance.minspeed) {
    minSpeed = parseFloat(instance.minspeed);
  }
  graph.addNode('DetectSwipe', 'gestures/DetectSwipe');
  graph.addEdge(prevNode[0], prevNode[1], 'DetectSwipe', 'in');
  graph.addInitial(minDistance, 'DetectSwipe', 'distance');
  graph.addInitial(minSpeed, 'DetectSwipe', 'speed');
  graph.addEdge('DetectSwipe', 'fail', 'Failed', 'in');
  return ['DetectSwipe', 'pass'];
};

exports.prepareDirection = function (graph, instance, prevNode) {
  if (!instance.direction) {
    return prevNode;
  }
  var directions = instance.direction.split(' ');
  if (directions.length === 4) {
    return prevNode;
  }
  var maxDistance = Infinity;
  if (instance.maxdistance) {
    maxDistance = parseInt(instance.maxdistance);
  }
  var cardinals = ['east', 'south', 'north', 'west'];
  graph.addNode('DetectDirection', 'gestures/DetectCardinalDirection');
  graph.addInitial(maxDistance, 'DetectDirection', 'maxdistance');
  graph.addEdge(prevNode[0], prevNode[1], 'DetectDirection', 'in');
  graph.addNode('DirectionPassed', 'core/Merge');
  cardinals.forEach(function (dir) {
    if (directions.indexOf(dir) !== -1) {
      // Allowed direction
      graph.addEdge('DetectDirection', dir, 'DirectionPassed', 'in');
      return;
    }
    graph.addEdge('DetectDirection', dir, 'Failed', 'in');
  });
  graph.addEdge('DetectDirection', 'fail', 'Failed', 'in');
  return ['DirectionPassed', 'out'];
};

exports.prepareMove = function (graph, instance, prevNode) {
  graph.addNode('EachTouch', 'objects/SplitObject');
  graph.addEdge('DoAction', 'out', 'EachTouch', 'in');
  graph.addNode('GetPoint', 'objects/GetObjectKey');
  graph.addEdge('EachTouch', 'out', 'GetPoint', 'in');
  graph.addInitial('movepoint', 'GetPoint', 'key');
  graph.addEdge('GetPoint', 'missed', 'NotYet', 'in');
  graph.addNode('Move', 'css/MoveElement');
  graph.addEdge('Target', 'out', 'Move', 'element');
  graph.addEdge('GetPoint', 'out', 'Move', 'point');
};

exports.prepareRemove = function (graph, instance, prevNode) {
  graph.addNode('SendNode', 'strings/SendString');
  graph.addEdge('Target', 'out', 'SendNode', 'string');
  graph.addEdge('DoAction', 'out', 'SendNode', 'in');
  graph.addNode('RemoveNode', 'dom/RemoveElement');
  graph.addEdge('SendNode', 'out', 'RemoveNode', 'element');
};

exports.prepareAttribute = function (graph, instance, prevNode) {
  graph.addNode('EachTouch', 'objects/SplitObject');
  graph.addEdge(prevNode[0], prevNode[1], 'EachTouch', 'in');
  graph.addNode('GetPoint', 'objects/GetObjectKey');
  graph.addEdge('EachTouch', 'out', 'GetPoint', 'in');
  graph.addInitial('movepoint', 'GetPoint', 'key');
  graph.addEdge('GetPoint', 'missed', 'Failed', 'in');
  graph.addNode('Set', 'dom/SetAttribute');
  graph.addEdge('Target', 'out', 'Set', 'element');
  graph.addInitial(instance.type, 'Set', 'attribute');
  graph.addEdge('GetPoint', 'out', 'Set', 'value');
};

exports.getCenter = function (graph, instance, prevNode) {
  // Calculate center
  graph.addNode('AddCenter', 'objects/SetPropertyValue');
  graph.addInitial('center', 'AddCenter', 'property');
  graph.addNode('SplitPinch', 'core/Split');
  graph.addEdge(prevNode[0], prevNode[1], 'SplitPinch', 'in');
  graph.addEdge('SplitPinch', 'out', 'AddCenter', 'in');
  graph.addNode('CalculateCenter', 'gestures/CalculateCenter');
  graph.addEdge('SplitPinch', 'out', 'CalculateCenter', 'in');
  graph.addEdge('CalculateCenter', 'center', 'AddCenter', 'value');
  return ['AddCenter', 'out'];
};

exports.getScale = function (graph, instance, prevNode) {
  // Calculate scale
  graph.addNode('SplitAfterAdd', 'core/Split');
  graph.addEdge(prevNode[0], prevNode[1], 'SplitAfterAdd', 'in');
  graph.addNode('AddScale', 'objects/SetPropertyValue');
  graph.addInitial('scale', 'AddScale', 'property');
  graph.addEdge('SplitAfterAdd', 'out', 'AddScale', 'in');
  graph.addNode('CalculateScale', 'gestures/CalculateScale');
  graph.addEdge('SplitAfterAdd', 'out', 'CalculateScale', 'in');
  graph.addEdge('CalculateScale', 'scale', 'AddScale', 'value');
  return ['AddScale', 'out'];
};
exports.prepareCallback = function (graph, instance, prevNode) {
  prevNode = exports.getCenter(graph, instance, prevNode);
  if (instance.type === 'pinch') {
    prevNode = exports.getScale(graph, instance, prevNode);
  }
  graph.addNode('Callback', 'core/Callback');
  graph.addEdge(prevNode[0], prevNode[1], 'Callback', 'in');
  var callback = function (gesture) {
    instance.fire('gesture', gesture);
  };
  graph.addInitial(callback, 'Callback', 'callback');
  graph.addNode('DropTarget', 'core/Drop');
  graph.addEdge('Target', 'out', 'DropTarget', 'in');
};

});
require.register("the-behavior/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"the-behavior","description":"Polymer elements for gestural behavior","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-ui","version":"0.1.0","keywords":[],"dependencies":{"noflo/noflo":"*","noflo/noflo-interaction":"*","noflo/noflo-gestures":"*","noflo/noflo-objects":"*","noflo/noflo-flow":"*","noflo/noflo-dom":"*","noflo/noflo-css":"*","noflo/noflo-math":"*","noflo/noflo-core":"*"},"noflo":{"components":{},"graphs":{}},"main":"index.js","scripts":["index.js"],"json":["component.json"],"files":[]}');
});













require.alias("noflo-noflo/component.json", "the-behavior/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "the-behavior/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "the-behavior/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "the-behavior/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "the-behavior/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "the-behavior/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "the-behavior/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "the-behavior/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "the-behavior/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "the-behavior/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "the-behavior/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "the-behavior/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "the-behavior/deps/noflo/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-noflo-interaction/index.js", "the-behavior/deps/noflo-interaction/index.js");
require.alias("noflo-noflo-interaction/component.json", "the-behavior/deps/noflo-interaction/component.json");
require.alias("noflo-noflo-interaction/components/ListenDrag.js", "the-behavior/deps/noflo-interaction/components/ListenDrag.js");
require.alias("noflo-noflo-interaction/components/ListenHash.js", "the-behavior/deps/noflo-interaction/components/ListenHash.js");
require.alias("noflo-noflo-interaction/components/ListenKeyboard.js", "the-behavior/deps/noflo-interaction/components/ListenKeyboard.js");
require.alias("noflo-noflo-interaction/components/ListenMouse.js", "the-behavior/deps/noflo-interaction/components/ListenMouse.js");
require.alias("noflo-noflo-interaction/components/ListenPointer.js", "the-behavior/deps/noflo-interaction/components/ListenPointer.js");
require.alias("noflo-noflo-interaction/components/ListenScroll.js", "the-behavior/deps/noflo-interaction/components/ListenScroll.js");
require.alias("noflo-noflo-interaction/components/ListenSpeech.js", "the-behavior/deps/noflo-interaction/components/ListenSpeech.js");
require.alias("noflo-noflo-interaction/components/ListenTouch.js", "the-behavior/deps/noflo-interaction/components/ListenTouch.js");
require.alias("noflo-noflo-interaction/components/SetHash.js", "the-behavior/deps/noflo-interaction/components/SetHash.js");
require.alias("noflo-noflo-interaction/components/ReadCoordinates.js", "the-behavior/deps/noflo-interaction/components/ReadCoordinates.js");
require.alias("noflo-noflo-interaction/index.js", "noflo-interaction/index.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-interaction/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-interaction/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-interaction/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-interaction/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-interaction/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-interaction/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-interaction/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-interaction/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-interaction/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-interaction/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-interaction/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-interaction/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-interaction/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-noflo-gestures/graphs/DetectDrag.json", "the-behavior/deps/noflo-gestures/graphs/DetectDrag.json");
require.alias("noflo-noflo-gestures/graphs/DetectSwipe.json", "the-behavior/deps/noflo-gestures/graphs/DetectSwipe.json");
require.alias("noflo-noflo-gestures/graphs/DetectPinch.json", "the-behavior/deps/noflo-gestures/graphs/DetectPinch.json");
require.alias("noflo-noflo-gestures/graphs/FilterByTarget.json", "the-behavior/deps/noflo-gestures/graphs/FilterByTarget.json");
require.alias("noflo-noflo-gestures/graphs/GestureToObject.json", "the-behavior/deps/noflo-gestures/graphs/GestureToObject.json");
require.alias("noflo-noflo-gestures/graphs/ListenGestures.json", "the-behavior/deps/noflo-gestures/graphs/ListenGestures.json");
require.alias("noflo-noflo-gestures/graphs/ListenPointer.json", "the-behavior/deps/noflo-gestures/graphs/ListenPointer.json");
require.alias("noflo-noflo-gestures/graphs/DetectCardinalDirection.json", "the-behavior/deps/noflo-gestures/graphs/DetectCardinalDirection.json");
require.alias("noflo-noflo-gestures/index.js", "the-behavior/deps/noflo-gestures/index.js");
require.alias("noflo-noflo-gestures/graphs/DetectDrag.json", "the-behavior/deps/noflo-gestures/graphs/DetectDrag.json");
require.alias("noflo-noflo-gestures/graphs/DetectSwipe.json", "the-behavior/deps/noflo-gestures/graphs/DetectSwipe.json");
require.alias("noflo-noflo-gestures/graphs/DetectPinch.json", "the-behavior/deps/noflo-gestures/graphs/DetectPinch.json");
require.alias("noflo-noflo-gestures/graphs/FilterByTarget.json", "the-behavior/deps/noflo-gestures/graphs/FilterByTarget.json");
require.alias("noflo-noflo-gestures/graphs/GestureToObject.json", "the-behavior/deps/noflo-gestures/graphs/GestureToObject.json");
require.alias("noflo-noflo-gestures/graphs/ListenGestures.json", "the-behavior/deps/noflo-gestures/graphs/ListenGestures.json");
require.alias("noflo-noflo-gestures/graphs/ListenPointer.json", "the-behavior/deps/noflo-gestures/graphs/ListenPointer.json");
require.alias("noflo-noflo-gestures/graphs/DetectCardinalDirection.json", "the-behavior/deps/noflo-gestures/graphs/DetectCardinalDirection.json");
require.alias("noflo-noflo-gestures/component.json", "the-behavior/deps/noflo-gestures/component.json");
require.alias("noflo-noflo-gestures/components/CalculateCenter.js", "the-behavior/deps/noflo-gestures/components/CalculateCenter.js");
require.alias("noflo-noflo-gestures/components/CalculateScale.js", "the-behavior/deps/noflo-gestures/components/CalculateScale.js");
require.alias("noflo-noflo-gestures/components/CardinalRouter.js", "the-behavior/deps/noflo-gestures/components/CardinalRouter.js");
require.alias("noflo-noflo-gestures/components/DegreesToCardinal.js", "the-behavior/deps/noflo-gestures/components/DegreesToCardinal.js");
require.alias("noflo-noflo-gestures/components/DegreesToCompass.js", "the-behavior/deps/noflo-gestures/components/DegreesToCompass.js");
require.alias("noflo-noflo-gestures/components/DetectTarget.js", "the-behavior/deps/noflo-gestures/components/DetectTarget.js");
require.alias("noflo-noflo-gestures/index.js", "noflo-gestures/index.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-gestures/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-gestures/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-gestures/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-gestures/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-gestures/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-gestures/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-gestures/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-gestures/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-gestures/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-gestures/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-gestures/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-gestures/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-gestures/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-noflo-interaction/index.js", "noflo-noflo-gestures/deps/noflo-interaction/index.js");
require.alias("noflo-noflo-interaction/component.json", "noflo-noflo-gestures/deps/noflo-interaction/component.json");
require.alias("noflo-noflo-interaction/components/ListenDrag.js", "noflo-noflo-gestures/deps/noflo-interaction/components/ListenDrag.js");
require.alias("noflo-noflo-interaction/components/ListenHash.js", "noflo-noflo-gestures/deps/noflo-interaction/components/ListenHash.js");
require.alias("noflo-noflo-interaction/components/ListenKeyboard.js", "noflo-noflo-gestures/deps/noflo-interaction/components/ListenKeyboard.js");
require.alias("noflo-noflo-interaction/components/ListenMouse.js", "noflo-noflo-gestures/deps/noflo-interaction/components/ListenMouse.js");
require.alias("noflo-noflo-interaction/components/ListenPointer.js", "noflo-noflo-gestures/deps/noflo-interaction/components/ListenPointer.js");
require.alias("noflo-noflo-interaction/components/ListenScroll.js", "noflo-noflo-gestures/deps/noflo-interaction/components/ListenScroll.js");
require.alias("noflo-noflo-interaction/components/ListenSpeech.js", "noflo-noflo-gestures/deps/noflo-interaction/components/ListenSpeech.js");
require.alias("noflo-noflo-interaction/components/ListenTouch.js", "noflo-noflo-gestures/deps/noflo-interaction/components/ListenTouch.js");
require.alias("noflo-noflo-interaction/components/SetHash.js", "noflo-noflo-gestures/deps/noflo-interaction/components/SetHash.js");
require.alias("noflo-noflo-interaction/components/ReadCoordinates.js", "noflo-noflo-gestures/deps/noflo-interaction/components/ReadCoordinates.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-interaction/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-interaction/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-interaction/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-interaction/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-interaction/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-interaction/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-interaction/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-interaction/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-interaction/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-interaction/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-interaction/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-interaction/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-interaction/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-noflo-math/index.js", "noflo-noflo-gestures/deps/noflo-math/index.js");
require.alias("noflo-noflo-math/component.json", "noflo-noflo-gestures/deps/noflo-math/component.json");
require.alias("noflo-noflo-math/components/Add.js", "noflo-noflo-gestures/deps/noflo-math/components/Add.js");
require.alias("noflo-noflo-math/components/Subtract.js", "noflo-noflo-gestures/deps/noflo-math/components/Subtract.js");
require.alias("noflo-noflo-math/components/Multiply.js", "noflo-noflo-gestures/deps/noflo-math/components/Multiply.js");
require.alias("noflo-noflo-math/components/Divide.js", "noflo-noflo-gestures/deps/noflo-math/components/Divide.js");
require.alias("noflo-noflo-math/components/CalculateAngle.js", "noflo-noflo-gestures/deps/noflo-math/components/CalculateAngle.js");
require.alias("noflo-noflo-math/components/CalculateDistance.js", "noflo-noflo-gestures/deps/noflo-math/components/CalculateDistance.js");
require.alias("noflo-noflo-math/components/Compare.js", "noflo-noflo-gestures/deps/noflo-math/components/Compare.js");
require.alias("noflo-noflo-math/components/CountSum.js", "noflo-noflo-gestures/deps/noflo-math/components/CountSum.js");
require.alias("noflo-noflo-math/lib/MathComponent.js", "noflo-noflo-gestures/deps/noflo-math/lib/MathComponent.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-math/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-math/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-math/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-math/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-math/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-math/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-math/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-math/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-math/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-math/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-math/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-math/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-math/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-noflo-flow/index.js", "noflo-noflo-gestures/deps/noflo-flow/index.js");
require.alias("noflo-noflo-flow/component.json", "noflo-noflo-gestures/deps/noflo-flow/component.json");
require.alias("noflo-noflo-flow/components/Concat.js", "noflo-noflo-gestures/deps/noflo-flow/components/Concat.js");
require.alias("noflo-noflo-flow/components/Gate.js", "noflo-noflo-gestures/deps/noflo-flow/components/Gate.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-flow/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-flow/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-flow/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-flow/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-flow/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-flow/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-flow/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-flow/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-flow/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-flow/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-flow/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-flow/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-flow/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-noflo-groups/index.js", "noflo-noflo-gestures/deps/noflo-groups/index.js");
require.alias("noflo-noflo-groups/component.json", "noflo-noflo-gestures/deps/noflo-groups/component.json");
require.alias("noflo-noflo-groups/components/ReadGroups.js", "noflo-noflo-gestures/deps/noflo-groups/components/ReadGroups.js");
require.alias("noflo-noflo-groups/components/RemoveGroups.js", "noflo-noflo-gestures/deps/noflo-groups/components/RemoveGroups.js");
require.alias("noflo-noflo-groups/components/Regroup.js", "noflo-noflo-gestures/deps/noflo-groups/components/Regroup.js");
require.alias("noflo-noflo-groups/components/Group.js", "noflo-noflo-gestures/deps/noflo-groups/components/Group.js");
require.alias("noflo-noflo-groups/components/GroupZip.js", "noflo-noflo-gestures/deps/noflo-groups/components/GroupZip.js");
require.alias("noflo-noflo-groups/components/FilterByGroup.js", "noflo-noflo-gestures/deps/noflo-groups/components/FilterByGroup.js");
require.alias("noflo-noflo-groups/components/Objectify.js", "noflo-noflo-gestures/deps/noflo-groups/components/Objectify.js");
require.alias("noflo-noflo-groups/components/ReadGroup.js", "noflo-noflo-gestures/deps/noflo-groups/components/ReadGroup.js");
require.alias("noflo-noflo-groups/components/SendByGroup.js", "noflo-noflo-gestures/deps/noflo-groups/components/SendByGroup.js");
require.alias("noflo-noflo-groups/components/CollectGroups.js", "noflo-noflo-gestures/deps/noflo-groups/components/CollectGroups.js");
require.alias("noflo-noflo-groups/components/CollectObject.js", "noflo-noflo-gestures/deps/noflo-groups/components/CollectObject.js");
require.alias("noflo-noflo-groups/components/FirstGroup.js", "noflo-noflo-gestures/deps/noflo-groups/components/FirstGroup.js");
require.alias("noflo-noflo-groups/components/MapGroup.js", "noflo-noflo-gestures/deps/noflo-groups/components/MapGroup.js");
require.alias("noflo-noflo-groups/components/MergeGroups.js", "noflo-noflo-gestures/deps/noflo-groups/components/MergeGroups.js");
require.alias("noflo-noflo-groups/components/GroupByObjectKey.js", "noflo-noflo-gestures/deps/noflo-groups/components/GroupByObjectKey.js");
require.alias("component-underscore/index.js", "noflo-noflo-groups/deps/underscore/index.js");

require.alias("noflo-noflo/component.json", "noflo-noflo-groups/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-groups/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-groups/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-groups/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-groups/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-groups/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-groups/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-groups/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-groups/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-groups/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-groups/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-groups/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-groups/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-noflo-packets/index.js", "noflo-noflo-gestures/deps/noflo-packets/index.js");
require.alias("noflo-noflo-packets/component.json", "noflo-noflo-gestures/deps/noflo-packets/component.json");
require.alias("noflo-noflo-packets/components/CountPackets.js", "noflo-noflo-gestures/deps/noflo-packets/components/CountPackets.js");
require.alias("noflo-noflo-packets/components/Unzip.js", "noflo-noflo-gestures/deps/noflo-packets/components/Unzip.js");
require.alias("noflo-noflo-packets/components/Defaults.js", "noflo-noflo-gestures/deps/noflo-packets/components/Defaults.js");
require.alias("noflo-noflo-packets/components/DoNotDisconnect.js", "noflo-noflo-gestures/deps/noflo-packets/components/DoNotDisconnect.js");
require.alias("noflo-noflo-packets/components/OnlyDisconnect.js", "noflo-noflo-gestures/deps/noflo-packets/components/OnlyDisconnect.js");
require.alias("noflo-noflo-packets/components/SplitPacket.js", "noflo-noflo-gestures/deps/noflo-packets/components/SplitPacket.js");
require.alias("noflo-noflo-packets/components/Range.js", "noflo-noflo-gestures/deps/noflo-packets/components/Range.js");
require.alias("noflo-noflo-packets/components/Flatten.js", "noflo-noflo-gestures/deps/noflo-packets/components/Flatten.js");
require.alias("noflo-noflo-packets/components/Compact.js", "noflo-noflo-gestures/deps/noflo-packets/components/Compact.js");
require.alias("noflo-noflo-packets/components/Zip.js", "noflo-noflo-gestures/deps/noflo-packets/components/Zip.js");
require.alias("noflo-noflo-packets/components/SendWith.js", "noflo-noflo-gestures/deps/noflo-packets/components/SendWith.js");
require.alias("noflo-noflo-packets/components/FilterPackets.js", "noflo-noflo-gestures/deps/noflo-packets/components/FilterPackets.js");
require.alias("noflo-noflo-packets/components/FilterByValue.js", "noflo-noflo-gestures/deps/noflo-packets/components/FilterByValue.js");
require.alias("noflo-noflo-packets/components/FilterByPosition.js", "noflo-noflo-gestures/deps/noflo-packets/components/FilterByPosition.js");
require.alias("noflo-noflo-packets/components/FilterPacket.js", "noflo-noflo-gestures/deps/noflo-packets/components/FilterPacket.js");
require.alias("noflo-noflo-packets/components/UniquePacket.js", "noflo-noflo-gestures/deps/noflo-packets/components/UniquePacket.js");
require.alias("noflo-noflo-packets/components/GroupByPacket.js", "noflo-noflo-gestures/deps/noflo-packets/components/GroupByPacket.js");
require.alias("noflo-noflo-packets/components/LastPacket.js", "noflo-noflo-gestures/deps/noflo-packets/components/LastPacket.js");
require.alias("noflo-noflo-packets/components/Counter.js", "noflo-noflo-gestures/deps/noflo-packets/components/Counter.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-packets/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-packets/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-packets/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-packets/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-packets/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-packets/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-packets/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-packets/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-packets/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-packets/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-packets/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-packets/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-packets/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("component-underscore/index.js", "noflo-noflo-packets/deps/underscore/index.js");

require.alias("noflo-noflo-objects/index.js", "noflo-noflo-gestures/deps/noflo-objects/index.js");
require.alias("noflo-noflo-objects/component.json", "noflo-noflo-gestures/deps/noflo-objects/component.json");
require.alias("noflo-noflo-objects/components/Extend.js", "noflo-noflo-gestures/deps/noflo-objects/components/Extend.js");
require.alias("noflo-noflo-objects/components/MergeObjects.js", "noflo-noflo-gestures/deps/noflo-objects/components/MergeObjects.js");
require.alias("noflo-noflo-objects/components/SplitObject.js", "noflo-noflo-gestures/deps/noflo-objects/components/SplitObject.js");
require.alias("noflo-noflo-objects/components/ReplaceKey.js", "noflo-noflo-gestures/deps/noflo-objects/components/ReplaceKey.js");
require.alias("noflo-noflo-objects/components/Keys.js", "noflo-noflo-gestures/deps/noflo-objects/components/Keys.js");
require.alias("noflo-noflo-objects/components/Size.js", "noflo-noflo-gestures/deps/noflo-objects/components/Size.js");
require.alias("noflo-noflo-objects/components/Values.js", "noflo-noflo-gestures/deps/noflo-objects/components/Values.js");
require.alias("noflo-noflo-objects/components/Join.js", "noflo-noflo-gestures/deps/noflo-objects/components/Join.js");
require.alias("noflo-noflo-objects/components/ExtractProperty.js", "noflo-noflo-gestures/deps/noflo-objects/components/ExtractProperty.js");
require.alias("noflo-noflo-objects/components/InsertProperty.js", "noflo-noflo-gestures/deps/noflo-objects/components/InsertProperty.js");
require.alias("noflo-noflo-objects/components/SliceArray.js", "noflo-noflo-gestures/deps/noflo-objects/components/SliceArray.js");
require.alias("noflo-noflo-objects/components/SplitArray.js", "noflo-noflo-gestures/deps/noflo-objects/components/SplitArray.js");
require.alias("noflo-noflo-objects/components/FilterPropertyValue.js", "noflo-noflo-gestures/deps/noflo-objects/components/FilterPropertyValue.js");
require.alias("noflo-noflo-objects/components/FlattenObject.js", "noflo-noflo-gestures/deps/noflo-objects/components/FlattenObject.js");
require.alias("noflo-noflo-objects/components/MapProperty.js", "noflo-noflo-gestures/deps/noflo-objects/components/MapProperty.js");
require.alias("noflo-noflo-objects/components/RemoveProperty.js", "noflo-noflo-gestures/deps/noflo-objects/components/RemoveProperty.js");
require.alias("noflo-noflo-objects/components/MapPropertyValue.js", "noflo-noflo-gestures/deps/noflo-objects/components/MapPropertyValue.js");
require.alias("noflo-noflo-objects/components/GetObjectKey.js", "noflo-noflo-gestures/deps/noflo-objects/components/GetObjectKey.js");
require.alias("noflo-noflo-objects/components/UniqueArray.js", "noflo-noflo-gestures/deps/noflo-objects/components/UniqueArray.js");
require.alias("noflo-noflo-objects/components/SetProperty.js", "noflo-noflo-gestures/deps/noflo-objects/components/SetProperty.js");
require.alias("noflo-noflo-objects/components/SimplifyObject.js", "noflo-noflo-gestures/deps/noflo-objects/components/SimplifyObject.js");
require.alias("noflo-noflo-objects/components/DuplicateProperty.js", "noflo-noflo-gestures/deps/noflo-objects/components/DuplicateProperty.js");
require.alias("noflo-noflo-objects/components/CreateObject.js", "noflo-noflo-gestures/deps/noflo-objects/components/CreateObject.js");
require.alias("noflo-noflo-objects/components/CreateDate.js", "noflo-noflo-gestures/deps/noflo-objects/components/CreateDate.js");
require.alias("noflo-noflo-objects/components/SetPropertyValue.js", "noflo-noflo-gestures/deps/noflo-objects/components/SetPropertyValue.js");
require.alias("noflo-noflo-objects/components/CallMethod.js", "noflo-noflo-gestures/deps/noflo-objects/components/CallMethod.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-objects/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-objects/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-objects/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-objects/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-objects/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-objects/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-objects/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-objects/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-objects/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-objects/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-objects/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-objects/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-objects/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("component-underscore/index.js", "noflo-noflo-objects/deps/underscore/index.js");

require.alias("noflo-noflo-dom/index.js", "noflo-noflo-gestures/deps/noflo-dom/index.js");
require.alias("noflo-noflo-dom/component.json", "noflo-noflo-gestures/deps/noflo-dom/component.json");
require.alias("noflo-noflo-dom/components/AddClass.js", "noflo-noflo-gestures/deps/noflo-dom/components/AddClass.js");
require.alias("noflo-noflo-dom/components/AppendChild.js", "noflo-noflo-gestures/deps/noflo-dom/components/AppendChild.js");
require.alias("noflo-noflo-dom/components/CreateElement.js", "noflo-noflo-gestures/deps/noflo-dom/components/CreateElement.js");
require.alias("noflo-noflo-dom/components/CreateFragment.js", "noflo-noflo-gestures/deps/noflo-dom/components/CreateFragment.js");
require.alias("noflo-noflo-dom/components/GetAttribute.js", "noflo-noflo-gestures/deps/noflo-dom/components/GetAttribute.js");
require.alias("noflo-noflo-dom/components/GetElement.js", "noflo-noflo-gestures/deps/noflo-dom/components/GetElement.js");
require.alias("noflo-noflo-dom/components/HasClass.js", "noflo-noflo-gestures/deps/noflo-dom/components/HasClass.js");
require.alias("noflo-noflo-dom/components/ReadHtml.js", "noflo-noflo-gestures/deps/noflo-dom/components/ReadHtml.js");
require.alias("noflo-noflo-dom/components/RemoveElement.js", "noflo-noflo-gestures/deps/noflo-dom/components/RemoveElement.js");
require.alias("noflo-noflo-dom/components/SetAttribute.js", "noflo-noflo-gestures/deps/noflo-dom/components/SetAttribute.js");
require.alias("noflo-noflo-dom/components/WriteHtml.js", "noflo-noflo-gestures/deps/noflo-dom/components/WriteHtml.js");
require.alias("noflo-noflo-dom/components/RemoveClass.js", "noflo-noflo-gestures/deps/noflo-dom/components/RemoveClass.js");
require.alias("noflo-noflo-dom/components/RequestAnimationFrame.js", "noflo-noflo-gestures/deps/noflo-dom/components/RequestAnimationFrame.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-dom/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-dom/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-dom/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-dom/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-dom/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-dom/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-dom/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-dom/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-dom/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-dom/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-dom/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-dom/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-dom/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-noflo-strings/index.js", "noflo-noflo-gestures/deps/noflo-strings/index.js");
require.alias("noflo-noflo-strings/component.json", "noflo-noflo-gestures/deps/noflo-strings/component.json");
require.alias("noflo-noflo-strings/components/CompileString.js", "noflo-noflo-gestures/deps/noflo-strings/components/CompileString.js");
require.alias("noflo-noflo-strings/components/Filter.js", "noflo-noflo-gestures/deps/noflo-strings/components/Filter.js");
require.alias("noflo-noflo-strings/components/SendString.js", "noflo-noflo-gestures/deps/noflo-strings/components/SendString.js");
require.alias("noflo-noflo-strings/components/SplitStr.js", "noflo-noflo-gestures/deps/noflo-strings/components/SplitStr.js");
require.alias("noflo-noflo-strings/components/StringTemplate.js", "noflo-noflo-gestures/deps/noflo-strings/components/StringTemplate.js");
require.alias("noflo-noflo-strings/components/Replace.js", "noflo-noflo-gestures/deps/noflo-strings/components/Replace.js");
require.alias("noflo-noflo-strings/components/Jsonify.js", "noflo-noflo-gestures/deps/noflo-strings/components/Jsonify.js");
require.alias("noflo-noflo-strings/components/ParseJson.js", "noflo-noflo-gestures/deps/noflo-strings/components/ParseJson.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-strings/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-strings/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-strings/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-strings/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-strings/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-strings/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-strings/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-strings/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-strings/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-strings/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-strings/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-strings/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-strings/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("component-underscore/index.js", "noflo-noflo-strings/deps/underscore/index.js");

require.alias("noflo-noflo-core/index.js", "noflo-noflo-gestures/deps/noflo-core/index.js");
require.alias("noflo-noflo-core/component.json", "noflo-noflo-gestures/deps/noflo-core/component.json");
require.alias("noflo-noflo-core/components/Callback.js", "noflo-noflo-gestures/deps/noflo-core/components/Callback.js");
require.alias("noflo-noflo-core/components/DisconnectAfterPacket.js", "noflo-noflo-gestures/deps/noflo-core/components/DisconnectAfterPacket.js");
require.alias("noflo-noflo-core/components/Drop.js", "noflo-noflo-gestures/deps/noflo-core/components/Drop.js");
require.alias("noflo-noflo-core/components/Group.js", "noflo-noflo-gestures/deps/noflo-core/components/Group.js");
require.alias("noflo-noflo-core/components/Kick.js", "noflo-noflo-gestures/deps/noflo-core/components/Kick.js");
require.alias("noflo-noflo-core/components/Merge.js", "noflo-noflo-gestures/deps/noflo-core/components/Merge.js");
require.alias("noflo-noflo-core/components/Output.js", "noflo-noflo-gestures/deps/noflo-core/components/Output.js");
require.alias("noflo-noflo-core/components/Repeat.js", "noflo-noflo-gestures/deps/noflo-core/components/Repeat.js");
require.alias("noflo-noflo-core/components/RepeatAsync.js", "noflo-noflo-gestures/deps/noflo-core/components/RepeatAsync.js");
require.alias("noflo-noflo-core/components/Split.js", "noflo-noflo-gestures/deps/noflo-core/components/Split.js");
require.alias("noflo-noflo-core/components/RunInterval.js", "noflo-noflo-gestures/deps/noflo-core/components/RunInterval.js");
require.alias("noflo-noflo-core/components/MakeFunction.js", "noflo-noflo-gestures/deps/noflo-core/components/MakeFunction.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-core/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-core/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-core/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-core/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-core/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-core/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-core/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-core/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-core/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-core/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-core/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-core/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-core/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("component-underscore/index.js", "noflo-noflo-core/deps/underscore/index.js");

require.alias("noflo-noflo-objects/index.js", "the-behavior/deps/noflo-objects/index.js");
require.alias("noflo-noflo-objects/component.json", "the-behavior/deps/noflo-objects/component.json");
require.alias("noflo-noflo-objects/components/Extend.js", "the-behavior/deps/noflo-objects/components/Extend.js");
require.alias("noflo-noflo-objects/components/MergeObjects.js", "the-behavior/deps/noflo-objects/components/MergeObjects.js");
require.alias("noflo-noflo-objects/components/SplitObject.js", "the-behavior/deps/noflo-objects/components/SplitObject.js");
require.alias("noflo-noflo-objects/components/ReplaceKey.js", "the-behavior/deps/noflo-objects/components/ReplaceKey.js");
require.alias("noflo-noflo-objects/components/Keys.js", "the-behavior/deps/noflo-objects/components/Keys.js");
require.alias("noflo-noflo-objects/components/Size.js", "the-behavior/deps/noflo-objects/components/Size.js");
require.alias("noflo-noflo-objects/components/Values.js", "the-behavior/deps/noflo-objects/components/Values.js");
require.alias("noflo-noflo-objects/components/Join.js", "the-behavior/deps/noflo-objects/components/Join.js");
require.alias("noflo-noflo-objects/components/ExtractProperty.js", "the-behavior/deps/noflo-objects/components/ExtractProperty.js");
require.alias("noflo-noflo-objects/components/InsertProperty.js", "the-behavior/deps/noflo-objects/components/InsertProperty.js");
require.alias("noflo-noflo-objects/components/SliceArray.js", "the-behavior/deps/noflo-objects/components/SliceArray.js");
require.alias("noflo-noflo-objects/components/SplitArray.js", "the-behavior/deps/noflo-objects/components/SplitArray.js");
require.alias("noflo-noflo-objects/components/FilterPropertyValue.js", "the-behavior/deps/noflo-objects/components/FilterPropertyValue.js");
require.alias("noflo-noflo-objects/components/FlattenObject.js", "the-behavior/deps/noflo-objects/components/FlattenObject.js");
require.alias("noflo-noflo-objects/components/MapProperty.js", "the-behavior/deps/noflo-objects/components/MapProperty.js");
require.alias("noflo-noflo-objects/components/RemoveProperty.js", "the-behavior/deps/noflo-objects/components/RemoveProperty.js");
require.alias("noflo-noflo-objects/components/MapPropertyValue.js", "the-behavior/deps/noflo-objects/components/MapPropertyValue.js");
require.alias("noflo-noflo-objects/components/GetObjectKey.js", "the-behavior/deps/noflo-objects/components/GetObjectKey.js");
require.alias("noflo-noflo-objects/components/UniqueArray.js", "the-behavior/deps/noflo-objects/components/UniqueArray.js");
require.alias("noflo-noflo-objects/components/SetProperty.js", "the-behavior/deps/noflo-objects/components/SetProperty.js");
require.alias("noflo-noflo-objects/components/SimplifyObject.js", "the-behavior/deps/noflo-objects/components/SimplifyObject.js");
require.alias("noflo-noflo-objects/components/DuplicateProperty.js", "the-behavior/deps/noflo-objects/components/DuplicateProperty.js");
require.alias("noflo-noflo-objects/components/CreateObject.js", "the-behavior/deps/noflo-objects/components/CreateObject.js");
require.alias("noflo-noflo-objects/components/CreateDate.js", "the-behavior/deps/noflo-objects/components/CreateDate.js");
require.alias("noflo-noflo-objects/components/SetPropertyValue.js", "the-behavior/deps/noflo-objects/components/SetPropertyValue.js");
require.alias("noflo-noflo-objects/components/CallMethod.js", "the-behavior/deps/noflo-objects/components/CallMethod.js");
require.alias("noflo-noflo-objects/index.js", "noflo-objects/index.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-objects/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-objects/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-objects/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-objects/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-objects/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-objects/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-objects/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-objects/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-objects/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-objects/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-objects/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-objects/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-objects/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("component-underscore/index.js", "noflo-noflo-objects/deps/underscore/index.js");

require.alias("noflo-noflo-flow/index.js", "the-behavior/deps/noflo-flow/index.js");
require.alias("noflo-noflo-flow/component.json", "the-behavior/deps/noflo-flow/component.json");
require.alias("noflo-noflo-flow/components/Concat.js", "the-behavior/deps/noflo-flow/components/Concat.js");
require.alias("noflo-noflo-flow/components/Gate.js", "the-behavior/deps/noflo-flow/components/Gate.js");
require.alias("noflo-noflo-flow/index.js", "noflo-flow/index.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-flow/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-flow/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-flow/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-flow/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-flow/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-flow/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-flow/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-flow/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-flow/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-flow/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-flow/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-flow/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-flow/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-noflo-dom/index.js", "the-behavior/deps/noflo-dom/index.js");
require.alias("noflo-noflo-dom/component.json", "the-behavior/deps/noflo-dom/component.json");
require.alias("noflo-noflo-dom/components/AddClass.js", "the-behavior/deps/noflo-dom/components/AddClass.js");
require.alias("noflo-noflo-dom/components/AppendChild.js", "the-behavior/deps/noflo-dom/components/AppendChild.js");
require.alias("noflo-noflo-dom/components/CreateElement.js", "the-behavior/deps/noflo-dom/components/CreateElement.js");
require.alias("noflo-noflo-dom/components/CreateFragment.js", "the-behavior/deps/noflo-dom/components/CreateFragment.js");
require.alias("noflo-noflo-dom/components/GetAttribute.js", "the-behavior/deps/noflo-dom/components/GetAttribute.js");
require.alias("noflo-noflo-dom/components/GetElement.js", "the-behavior/deps/noflo-dom/components/GetElement.js");
require.alias("noflo-noflo-dom/components/HasClass.js", "the-behavior/deps/noflo-dom/components/HasClass.js");
require.alias("noflo-noflo-dom/components/ReadHtml.js", "the-behavior/deps/noflo-dom/components/ReadHtml.js");
require.alias("noflo-noflo-dom/components/RemoveElement.js", "the-behavior/deps/noflo-dom/components/RemoveElement.js");
require.alias("noflo-noflo-dom/components/SetAttribute.js", "the-behavior/deps/noflo-dom/components/SetAttribute.js");
require.alias("noflo-noflo-dom/components/WriteHtml.js", "the-behavior/deps/noflo-dom/components/WriteHtml.js");
require.alias("noflo-noflo-dom/components/RemoveClass.js", "the-behavior/deps/noflo-dom/components/RemoveClass.js");
require.alias("noflo-noflo-dom/components/RequestAnimationFrame.js", "the-behavior/deps/noflo-dom/components/RequestAnimationFrame.js");
require.alias("noflo-noflo-dom/index.js", "noflo-dom/index.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-dom/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-dom/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-dom/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-dom/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-dom/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-dom/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-dom/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-dom/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-dom/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-dom/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-dom/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-dom/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-dom/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-noflo-css/index.js", "the-behavior/deps/noflo-css/index.js");
require.alias("noflo-noflo-css/component.json", "the-behavior/deps/noflo-css/component.json");
require.alias("noflo-noflo-css/components/MoveElement.js", "the-behavior/deps/noflo-css/components/MoveElement.js");
require.alias("noflo-noflo-css/components/RotateElement.js", "the-behavior/deps/noflo-css/components/RotateElement.js");
require.alias("noflo-noflo-css/components/SetElementTop.js", "the-behavior/deps/noflo-css/components/SetElementTop.js");
require.alias("noflo-noflo-css/index.js", "noflo-css/index.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-css/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-css/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-css/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-css/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-css/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-css/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-css/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-css/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-css/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-css/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-css/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-css/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-css/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-noflo-math/index.js", "the-behavior/deps/noflo-math/index.js");
require.alias("noflo-noflo-math/component.json", "the-behavior/deps/noflo-math/component.json");
require.alias("noflo-noflo-math/components/Add.js", "the-behavior/deps/noflo-math/components/Add.js");
require.alias("noflo-noflo-math/components/Subtract.js", "the-behavior/deps/noflo-math/components/Subtract.js");
require.alias("noflo-noflo-math/components/Multiply.js", "the-behavior/deps/noflo-math/components/Multiply.js");
require.alias("noflo-noflo-math/components/Divide.js", "the-behavior/deps/noflo-math/components/Divide.js");
require.alias("noflo-noflo-math/components/CalculateAngle.js", "the-behavior/deps/noflo-math/components/CalculateAngle.js");
require.alias("noflo-noflo-math/components/CalculateDistance.js", "the-behavior/deps/noflo-math/components/CalculateDistance.js");
require.alias("noflo-noflo-math/components/Compare.js", "the-behavior/deps/noflo-math/components/Compare.js");
require.alias("noflo-noflo-math/components/CountSum.js", "the-behavior/deps/noflo-math/components/CountSum.js");
require.alias("noflo-noflo-math/lib/MathComponent.js", "the-behavior/deps/noflo-math/lib/MathComponent.js");
require.alias("noflo-noflo-math/index.js", "noflo-math/index.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-math/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-math/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-math/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-math/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-math/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-math/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-math/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-math/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-math/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-math/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-math/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-math/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-math/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-noflo-core/index.js", "the-behavior/deps/noflo-core/index.js");
require.alias("noflo-noflo-core/component.json", "the-behavior/deps/noflo-core/component.json");
require.alias("noflo-noflo-core/components/Callback.js", "the-behavior/deps/noflo-core/components/Callback.js");
require.alias("noflo-noflo-core/components/DisconnectAfterPacket.js", "the-behavior/deps/noflo-core/components/DisconnectAfterPacket.js");
require.alias("noflo-noflo-core/components/Drop.js", "the-behavior/deps/noflo-core/components/Drop.js");
require.alias("noflo-noflo-core/components/Group.js", "the-behavior/deps/noflo-core/components/Group.js");
require.alias("noflo-noflo-core/components/Kick.js", "the-behavior/deps/noflo-core/components/Kick.js");
require.alias("noflo-noflo-core/components/Merge.js", "the-behavior/deps/noflo-core/components/Merge.js");
require.alias("noflo-noflo-core/components/Output.js", "the-behavior/deps/noflo-core/components/Output.js");
require.alias("noflo-noflo-core/components/Repeat.js", "the-behavior/deps/noflo-core/components/Repeat.js");
require.alias("noflo-noflo-core/components/RepeatAsync.js", "the-behavior/deps/noflo-core/components/RepeatAsync.js");
require.alias("noflo-noflo-core/components/Split.js", "the-behavior/deps/noflo-core/components/Split.js");
require.alias("noflo-noflo-core/components/RunInterval.js", "the-behavior/deps/noflo-core/components/RunInterval.js");
require.alias("noflo-noflo-core/components/MakeFunction.js", "the-behavior/deps/noflo-core/components/MakeFunction.js");
require.alias("noflo-noflo-core/index.js", "noflo-core/index.js");
require.alias("noflo-noflo/component.json", "noflo-noflo-core/deps/noflo/component.json");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-core/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-core/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-core/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-core/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-core/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-core/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-core/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-core/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-core/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-core/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-core/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-core/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("component-underscore/index.js", "noflo-noflo-core/deps/underscore/index.js");

require.alias("the-behavior/index.js", "the-behavior/index.js");