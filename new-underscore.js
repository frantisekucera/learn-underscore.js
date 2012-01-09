var _ = function() {

	return {
		// Iterates over a list of elements, yielding each in turn to an iterator function. The iterator is
		//  bound to the context object, if one is passed. Each invocation of iterator is called with three
		// arguments: (element, index, list). If list is a JavaScript object, iterator's arguments will be
		// (value, key, list).
		each: function(list, iterator, context) {
			// If not null.
			if (list != null) {
				// Split string.
				if (this.isString(list)) list = list.split();

				if (list.length === +list.length) {
					// On array iterate.
					for (var i=0; i < list.length; i++) {
						if (i in list && iterator.call(context, list[i], i, list)) return;
					}
				} else {
					// On object traverse keys.
					for (key in list) {
						if (list.hasOwnProperty(key)) {
							iterator.call(context, list[key], key, list);
						}
					}
				}
			}
		},

		// Produces a new array of values by mapping each value in list through a transformation function
		// (iterator). If the native map method exists, it will be used instead. If list is a JavaScript
		// object, iterator's arguments will be (value, key, list).
		map: function(list, iterator, context) {
			result = [];
			this.each(list, function(item, index, list) {
				result.push(iterator.call(context, item, index, list));
			});

			if (list.length === +list.length) result.length = list.length;

			return result;
		},

		// Boils down a list of values into a single value. Memo is the initial state of the reduction,
		//  and each successive step of it should be returned by iterator.
		reduce: function(list, iterator, memo, context) {
			// Forgot to check if memo is set first.
			var hasMemo = arguments.length > 2;
			this.each(list, function(item, index, list) {
				// Then we set memo with the first value!
				if (!hasMemo) {
					memo = item;
					hasMemo--;
				} else {
					// Pass in memo as a value.
					memo = iterator.call(context, memo, item, index, list);
				}
			});
			// Throw TypeError if memo was still not computed.
			if (!hasMemo) throw new TypeError('!');
			return memo;
		},

		// Returns true if any of the values in the list pass the iterator truth test. Short-circuits and
		//  stops traversing the list if a true element is found.
		any: function(list, iterator, context) {
			// Forgot the identity function. It is used to check if values return true.
			iterator || (iterator = _.identity);
			var result = false;
			this.each(list, function(item, index, list) {
				// Also forgot to wrap the right side of ||.
				if (result || (result = iterator.call(context, item, index, list))) return result;
			});
			return result;
		},

		// Looks through each value in the list, returning the first one that passes a truth test (iterator).
		//  The function returns as soon as it finds an acceptable element, and doesn't traverse the entire list.
		find: function(list, iterator, context) {
			var result;
			this.any(list, function(item, index, list) {
				if (iterator.call(context, item, index, list)) {
					// Forgot to save the item and return true for any to quit.
					result = item;
					return true;
				}
			});
			return result;
		},

		// Looks through each value in the list, returning an array of all the values that pass a truth test
		//  (iterator).
		select: function(list, iterator, context) {
			var result = [];
			this.any(list, function(item, index, list) {
				if (iterator.call(context, item, index, list)) {
					result.push(item);
				}
			});
			return result;
		},

		// Returns the values in list without the elements that the truth test (iterator) passes. The opposite
		//  of select.
		reject: function(list, iterator, context) {
			var result = [];
			this.any(list, function(item, index, list) {
				if (!iterator.call(context, item, index, list)) {
					result.push(item);
				}
			});
			return result;
		},

		// Returns true if all of the values in the list pass the iterator truth test.
		all: function(list, iterator, context) {
			result = true;
			this.any(list, function(item, index, list) {
				if (!iterator.call(context, item, index, list)) {
					// Early exit.
					result = false;
					return true;
				}
			});
			return result;
		},

		// Returns true if the value is present in the list, using === to test equality. Uses indexOf
		// internally, if list is an Array.
		include: function(list, value) {
			var result = false;
			// One needs to check if indexOf exists on the list/object.
			if (list.indexOf) {
				// Forgot to check that indexOf returns -1 when item is not found.
				result = list.indexOf(value) != -1;
			} else {
				result = this.any(list, function(item) {
					return (item === value);
				});
			}
			return result;
		},

		// Calls the method named by methodName on each value in the list. Any extra arguments passed
		//  to invoke will be forwarded on to the method invocation.
		invoke: function(list, methodName, arguments) {
			// Give us anything beyond methodName.
			var args = [].slice.call(arguments, 2);
			// Remember to use _.map as we want to save the result.
			return this.map(list, function(item, index, list) {
				// methodName.call returns true if method is a function, otherwise call a method on the
				//  item. Then pass the item with any extra args into the actual methodName call.
				return (methodName.call ? methodName : item[methodName]).apply(item, args);
			});
		},

		// A convenient version of what is perhaps the most common use-case for map: extracting a list
		//  of property values.
		pluck: function(list, propertyName) {
			return this.map(list, function(item, index, list) {
				return item[propertyName];
			});
		},

		// Returns the maximum value in list. If iterator is passed, it will be used on each value to
		//  generate the criterion by which the value is ranked.
		//  Actually, it should return the item in a list with the maximum value!
		max: function(list, iterator, context) {
			if (arguments.length > 1) {
				// Have a wrapper object so we can save the max value and item.
				var max = {'value': -Infinity, 'item': null};
				this.each(list, function(item, index, list) {
					var result = iterator.call(context, item, index, list);
					if (result > max.value) max = {'value': result, 'item': item};
				});
				return max.item;
			} else {
				// Forgot to call isArray and apply Math.max.
				if (this.isArray(list)) {
					return Math.max.apply(Math, list);
				} else {
					return -Infinity;
				}
			}
		},

		// Return the item in a list with the minimum value!
		min: function(list, iterator, context) {
			if (arguments.length > 1) {
				// Have a wrapper object so we can save the min value and item.
				var min = {'value': +Infinity, 'item': null};
				this.each(list, function(item, index, list) {
					var result = iterator.call(context, item, index, list);
					if (result < min.value) min = {'value': result, 'item': item};
				});
				return min.item;
			} else {
				if (this.isArray(list)) {
					return Math.min.apply(Math, list);
				} else {
					return +Infinity;
				}
			}
		},

		identity: function(value) {
        	return value;
    	},

    	isArray: function(obj) {
        	// Object.prototype.toString returns the value of internal Class property.
        	return toString.call(obj) == '[object Array]';
    	},

    	isString: function(obj) {
        	// Object.prototype.toString returns the value of internal Class property.
        	return toString.call(obj) == '[object String]';
    	}
	};
	
}();