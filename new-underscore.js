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
		}
	};
	
}();