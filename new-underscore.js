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
				if (typeof(list) == 'string') list = list.split();

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

		identity: function(value) {
        	return value;
    	}
	};
	
}();