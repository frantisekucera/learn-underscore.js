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
    var slice = ArrayProto.slice,
            unshift = ArrayProto.unshift,
            toString = ObjProto.toString,
            hasOwnProperty = ObjProto.hasOwnProperty;

    // All **ECMAScript 5** native function implementations that we hope to use
    // are declared here.
    var
            nativeMap = ArrayProto.map,
            nativeReduce = ArrayProto.reduce,
            nativeReduceRight = ArrayProto.reduceRight,
            nativeFilter = ArrayProto.filter,
            nativeEvery = ArrayProto.every,
            nativeSome = ArrayProto.some,
            nativeIndexOf = ArrayProto.indexOf,
            nativeLastIndexOf = ArrayProto.lastIndexOf,
            nativeIsArray = Array.isArray,
            nativeKeys = Object.keys,
            nativeBind = FuncProto.bind;

    // Create a safe reference to the Underscore object for use below.
    var _ = function(obj) {
        return new wrapper(obj);
    };

    // Export the Underscore object for **Node.js** and **"CommonJS"**, with
    // backwards-compatibility for the old `require()` API. If we're not in
    // CommonJS, add `_` to the global object.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
        }
        exports._ = _;
    } else if (typeof define === 'function' && define.amd) {
        // Register as a named module with AMD.
        define('underscore', function() {
            return _;
        });
    } else {
        // Exported as a string, for Closure Compiler "advanced" mode.
        root['_'] = _;
    }

    // Current version.
    _.VERSION = '1.2.3';

    // Collection Functions
    // --------------------

    // The cornerstone, an `each` implementation, aka `forEach`.
    // Handles objects with the built-in `forEach`, arrays, strings and raw objects.
    var each = _.each = _.forEach = function(obj, iterator, context) {

        // Cannot execute if `obj` is undefined.
        if (obj == null) return;

        // If a string is passed in, split into char array.
        obj = (typeof(obj) == 'string') ? obj.split("") : obj;

        // Works with objects that provide `length` property, arrays.
        if (obj.length === +obj.length) {
            // Traverse the array.
            for (var i = 0, l = obj.length; i < l; i++) {
                // Iterator is the fce we will execute for each item, while passed in `context` overrides `this`,
                // which is often `window`.
                // Other parameters are each item the index and the `obj` itself.
                // If wanting to break from a loop `return` can be used.
                // The reason why we check for presence of index in the `obj` is because we can have a property
                // `length` on an object. This will return.
                if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            // You can also go through each element of an associative array.
            for (var key in obj) {
                // We can check if `key` is a property of the `obj` using `call` though as someone could have defined
                // a `hasOwnProperty`.
                if (hasOwnProperty.call(obj, key)) {
                    // The same call on the passed in fce as with an array.
                    if (iterator.call(context, obj[key], key, obj) === breaker) return;
                }
            }
        }
        
    };

    // Return the results of applying the iterator to each element.
    // Delegates to **ECMAScript 5**'s native `map` if available.
    _.map = function(obj, iterator, context) {
        var results = [];
        // Much like with each, return empty results array when `obj` is undefined.
        if (obj == null) return results;

        // If object has native map function defined, use it.
        if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
        
        // Launch a forEach.
        each(obj, function(value, index, list) {
            // Save the result of the call in the array.
            // If no value is returned, we will get 'undefined'.
            // Arrays.push() is slightly faster that results[results.length], just not
            // supported in IE6.
            results.push(iterator.call(context, value, index, list));
        });

        // For objects that have a length property provided.
        // This seems to have been provided for dealing with sparse arrays, but does not
        // seem to be needed?
        if (obj.length === +obj.length) results.length = obj.length;
        
        return results;
    };

    // **Reduce** builds up a single result from a list of values, aka `inject`,
    // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
    _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
        // arguments is an Object that holds the args passed and their length, allows
        // us to pass a variable number of args etc.
        // Here we say we have an initial value for memo.
        var initial = arguments.length > 2;
        
        if (obj == null) obj = [];
        
        // Use native function.
        if (nativeReduce && obj.reduce === nativeReduce) {
            if (context) iterator = _.bind(iterator, context);
            return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
        }
        
        // Traverse the object.
        each(obj, function(value, index, list) {
            if (!initial) {
                // When initial memo is not set, init using the first value.
                memo = value;
                initial = true;
            } else {
                memo = iterator.call(context, memo, value, index, list);
            }
        });
        
        if (!initial) throw new TypeError('Reduce of empty array with no initial value');
        
        return memo;
    };

    // Determine if at least one element in the object matches a truth test.
    // Delegates to **ECMAScript 5**'s native `some` if available.
    // Aliased as `any`.
    var any = _.some = _.any = function(obj, iterator, context) {
        // If iterator is undefined, set it to the fce _.identity.
        // _.identity returns the same value that is used as the argument.
        iterator || (iterator = _.identity);
        var result = false;
        
        // Early bath.
        if (obj == null) return result;
        
        // Use native fce.
        if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
        
        // Result is set to false and we iterate through the object until we get true back.
        each(obj, function(value, index, list) {
            if (result || (result = iterator.call(context, value, index, list))) return breaker;
        });

        // Convert to boolean without inverting the value.
        // For example the obj might have a string and iterator is simply looking for a value,
        // then we would get the string back as a result and need to convert it to boolean.
        return !!result;
    };

    // Return the first value which passes a truth test. Aliased as `detect`.
    _.find = _.detect = function(obj, iterator, context) {
        var result;
        
        any(obj, function(value, index, list) {
            if (iterator.call(context, value, index, list)) {
                // Instead of returning boolean like in _.any, return the actual value.
                result = value;
                return true;
            }
        });

        return result;
    };

    // Return all the elements that pass a truth test.
    // Delegates to **ECMAScript 5**'s native `filter` if available.
    // Aliased as `select`.
    // Like find, but returning all, not just first that passes.
    _.filter = _.select = function(obj, iterator, context) {
        var results = [];
        
        if (obj == null) return results;
        
        if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
        
        // We could also use any and return false every thime while pushing the value onto the
        // results set.
        each(obj, function(value, index, list) {
            if (iterator.call(context, value, index, list)) results.push(value);
        });

        return results;
    };

    // Return all the elements for which a truth test fails. Reverse of select.
    _.reject = function(obj, iterator, context) {
        var results = [];
        
        if (obj == null) return results;

        each(obj, function(value, index, list) {
            if (!iterator.call(context, value, index, list)) results.push(value);
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
        
        // Much like any, but we expect result to be always true.
        each(obj, function(value, index, list) {
            if (!(result = result && iterator.call(context, value, index, list))) return breaker;
        });

        return result;
    };

    // Determine if a given value is included in the array or object using `===`.
    // Aliased as `contains`.
    _.include = _.contains = function(obj, target) {
        var found = false;
        
        if (obj == null) return found;
        
        if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
        
        // Determines if at least one elements matches the truth test (any), where the test matches
        // for === equality.
        found = any(obj, function(value) {
            return value === target;
        });

        return found;
    };

    // Invoke a method (with arguments) on every item in a collection.
    _.invoke = function(obj, method) {
        // arguments is an Object, not array, of arguments passed.
        // So we use Array.prototype.slice that gives us a copy of a section of an Object(Array)
        // as the Object does not have a slice method of its own.
        // This gives us all the args beyond position 2.
        var args = slice.call(arguments, 2);

        // Apply the function on each element. Returning the results (map).
        return _.map(obj, function(value) {
            // Take the method and have it in a context of the value (this would be an array for ex.).
            // Call the function with the value and pass in any extra arguments args.
            // method.call is true when method is a function, false if it is a string.
            // Do not know why (method || value) is needed.
            return (method.call ? (method || value) : value[method]).apply(value, args);
        });
    };

    // Convenience version of a common use case of `map`: fetching a property.
    _.pluck = function(obj, key) {
        return _.map(obj, function(value){ return value[key]; });
    };

    // Return the maximum element or (element-based computation).
    _.max = function(obj, iterator, context) {
        // No special iterator passed.
        if (!iterator) {
            // On ordinary, arrays, use Math.max function.
            if (_.isArray(obj)) return Math.max.apply(Math, obj);
            // Global property corresponding to negative infinity.
            if (_.isEmpty(obj)) return -Infinity;
        }

        var result = {computed : -Infinity};
        
        each(obj, function(value, index, list) {
            // How can the iterator evar eval to false if checked before?
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            // LTR rule, if current value is >= than saved value, save it into the result
            // if (computed >= result.computed) result = {value : value, computed : computed};
            computed >= result.computed && (result = {value : value, computed : computed});
        });
        
        // Return the original value passed into the iterator, not the computed one.
        return result.value;
    };

    // Return the minimum element (or element-based computation). The same as _.max, just
    // a different operator used.
    _.min = function(obj, iterator, context) {
        if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
        if (!iterator && _.isEmpty(obj)) return Infinity;
        var result = {computed : Infinity};
        
        each(obj, function(value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed < result.computed && (result = {value : value, computed : computed});
        });

        return result.value;
    };

    // Generate an integer Array containing an arithmetic progression. A port of
    // the native Python `range()` function. See
    // [the Python documentation](http://docs.python.org/library/functions.html#range).
    _.range = function(start, stop, step) {
        // No or only "stop" arguments.
        if (arguments.length <= 1) {
            stop = start || 0;
            // Beginning with 0.
            start = 0;
        }
        // Stepping by 1 or custom defined.
        step = arguments[2] || 1;

        // Use the Math library, so that we can use functions as if they were local.
        with(Math) {
            // Array length.
            // Math.ceil rounds to the nearest Int upwards.
            // Math.max returns the larger of two numbers.
            var len = max(ceil((stop - start) / step), 0);
        }
        var idx = 0;
        // Init the Array.
        var range = new Array(len);

        // Traverse the array
        while(idx < len) {
            // While increasing the index, save the starting value...
            range[idx++] = start;
            // ... and increase it with the step.
            start += step;
        }

        return range;
    };

    // Shuffle an array.
    _.shuffle = function(obj) {
        var shuffled = [], rand;

        // console.log(shuffled.slice(0));

        each(obj, function(value, index, list) {
            if (index == 0) {
                shuffled[0] = value;
            } else {
                // Fisher–Yates shuffle
                with(Math) {
                    rand = floor(random() * (index + 1));
                }
                shuffled[index] = shuffled[rand];
                shuffled[rand] = value;
            }
        });

        return shuffled;
    };

    // Sort the object's values by a criterion produced by an iterator.
    _.sortBy = function(obj, iterator, context) {
        // _.pluck fetching a property.
        return _.pluck(
            // Create a wrapper object with criteria around each element.
            _.map(obj, function(value, index, list) {
                return {
                    value : value,
                    // The iterator is the sort function.
                    criteria : iterator.call(context, value, index, list)
                };
            // Supply a compare function to the sort.
            }).sort(function(left, right) {
                // Use the criteria values from our wrapper objects.
                var a = left.criteria, b = right.criteria;
                // If left < right then -1.
                // If left > right then 1.
                // If left == right then 0.
                return a < b ? -1 : (a > b ? 1 : 0);
            }),
            // But return only the value attribute of the object.
            'value');
    };

    // Groups the object's values by a criterion. Pass either a string attribute
    // to group by, or a function that returns the criterion.
    _.groupBy = function(obj, val) {
        var result = {};

        // An addition where we use dot notation in a string to access inner objects.
        var iterator = _.isFunction(val) ? val : function(obj) { return function() {
            // Get deeper into the object.
            each(val.split('.'), function(part, index) {
                obj[part] && (obj = obj[part]);
            });
            return obj;
        }()};

        each(obj, function(value, index) {
            // Key is the result to group by.
            var key = iterator(value, index);
            // Create a key in the result array if not present and push the result value to it.
            (result[key] || (result[key] = [])).push(value);
        });

        return result;
    };

    // Use a comparator function to figure out at what index an object should
    // be inserted so as to maintain order. Uses binary search.
    _.sortedIndex = function(array, obj, iterator) {
        iterator || (iterator = _.identity);

        // Get the left and right index of the array.
        var low = 0, high = array.length;

        // While low is still lower than high
        while (low < high) {
            // Determine the equidistant between the left and right.
            // Make a binary shift to the right, which is a neat way of getting a rounded
            // half of the total.
            // var mid = Math.floor((low + high) / 2);
            var mid = (low + high) >> 1;
            // If the searched for value is still smaller than the equidistant, we ditch the
            // left branch, otherwise we ditch the right branch.
            iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
        }

        return low;
    };

    // Safely convert anything iterable into a real, live array.
    _.toArray = function(iterable) {
        if (!iterable)                return [];
        if (iterable.toArray)         return iterable.toArray();
        // Array.prototype.slice or [].slice, a deep copy
        if (_.isArray(iterable))      return slice.call(iterable);
        if (_.isArguments(iterable))  return slice.call(iterable);
        
        // On any other object, give is the values.
        return _.values(iterable);
    };

    // Return the number of elements in an object.
    _.size = function(obj) {
        // First safely turn to an array, then use its length property.
        return _.toArray(obj).length;
    };

    // Function (ahem) Functions
    // ------------------

    // Reusable constructor function for prototype setting.
    /*var ctor = function(){};*/

    // Create a function bound to a given object (assigning `this`, and arguments,
    // optionally). Binding with arguments is also known as `curry`.
    // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
    // We check for `func.bind` first, to fail fast when `func` is undefined.
    /*_.bind = function bind(func, context) {
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
     };*/

    // Object Functions
    // ----------------

    // Retrieve the values of an object's properties.
    _.values = function(obj) {
        // _.identity returns the value.
        return _.map(obj, _.identity);
    };

    // Return a sorted list of the function names available on the object.
    // Aliased as `methods`
    _.functions = _.methods = function(obj) {
        var names = [];
        // Let us enumerate the keys.
        for (var key in obj) {
            // _.isFunction will make use of toString to get inner Class property.
            if (_.isFunction(obj[key])) names.push(key);
        }
        return names.sort();
    };

    // Is a given array, string, or object empty?
    // An "empty" object has no enumerable own-properties.
    _.isEmpty = function(obj) {
        if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
        for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
        return true;
    };

    // Is a given value an array?
    // Delegates to ECMA5's native Array.isArray (IE9, FF4 etc.)
    _.isArray = nativeIsArray || function(obj) {
        // Object.prototype.toString returns the value of internal Class property.
        return toString.call(obj) == '[object Array]';
    };

    // Is a given variable an arguments object?
    _.isArguments = function(obj) {
        return toString.call(obj) == '[object Arguments]';
    };
    
    if (!_.isArguments(arguments)) {
        _.isArguments = function(obj) {
            return !!(obj && hasOwnProperty.call(obj, 'callee'));
        };
    }

    // Is a given value a function?
    _.isFunction = function(obj) {
        return toString.call(obj) == '[object Function]';
    };

    // Is a given value a string?
    _.isString = function(obj) {
        return toString.call(obj) == '[object String]';
    };

    // Utility Functions
    // -----------------

    // Keep the identity function around for default iterators.
    _.identity = function(value) {
        return value;
    };

    // Add your own custom functions to the Underscore object, ensuring that
    // they're correctly added to the OOP wrapper as well.
    /*_.mixin = function(obj) {
     each(_.functions(obj), function(name){
     addToWrapper(name, _[name] = obj[name]);
     });
     };*/

    // The OOP Wrapper
    // ---------------

    // If Underscore is called as a function, it returns a wrapped object that
    // can be used OO-style. This wrapper holds altered versions of all the
    // underscore functions. Wrapped objects may be chained.
    /*var wrapper = function(obj) { this._wrapped = obj; };*/

    // Expose `wrapper.prototype` as `_.prototype`
    /*_.prototype = wrapper.prototype;*/

    // Helper function to continue chaining intermediate results.
    /*var result = function(obj, chain) {
     return chain ? _(obj).chain() : obj;
     };*/

    // A method to easily add functions to the OOP wrapper.
    /*var addToWrapper = function(name, func) {
     wrapper.prototype[name] = function() {
     var args = slice.call(arguments);
     unshift.call(args, this._wrapped);
     return result(func.apply(_, args), this._chain);
     };
     };*/

    // Add all of the Underscore functions to the wrapper object.
    /*_.mixin(_);*/

}).call(this);