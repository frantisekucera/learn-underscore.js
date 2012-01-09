$(document).ready(function() {

    module("Collections");

    test("collections: each", function() {
        // Pass a null object in.
        var pisvejc,
            answer = 0;
        _.each(pisvejc, function(num, i) {
            answer += i;
        });
        equals(answer, 0, 'return on null input object');

        // New functionality, splitting a string into chars.
        var answer = "";
        _.each("pisvejc", function(char, i) {
            answer += char;
        });
        equals(answer, "pisvejc", 'split into char array if input is a string');

        // Dumb array iteration.
        _.each([1, 2, 3], function(num, i) {
            equals(num, i + 1, 'each iterators provide value and iteration count');
        });

        // Overriding `this` or changing the context.
        var answer = 0,
            that   = 10;
        _.each([1, 2, 3], function(num, i) {
            equals(this + num, that + i + 1, 'override this');
        }, that);

        // What if someone has a property `length` on an object?
        var answer = 0,
            boat = {'length': 50};
        _.each(boat, function(num, i) {
            answer += num;
        });
        equals(answer, 0, 'having a property length on an object needs to return withouth exec');

        // Overriding 'this' by providing an object.
        var answers = [];
        _.each([1, 2, 3], function(num) {
                    answers.push(num * this.multiplier);
                }, {multiplier: 5});
        equals(answers.join(', '), '5, 10, 15', 'context object property accessed');

        // The function is aliased.
        //answers = [];
        //_.forEach([1, 2, 3], function(num) {
        //    answers.push(num);
        //});
        //equals(answers.join(', '), '1, 2, 3', 'aliased as "forEach"');

        // Do not try to get values from a prototype.
        answers = [];
        // Every object is based on a prototype, which gives it a set of inherent properties.
        // To create a new object based on a different than Object prototype, we use the new
        // keyword.
        // {} is the same as new Object().
        var obj = {one : 1, two : 2, three : 3};
        // When trying to get a value of a property, JS first traverses the properties the object
        // itself has. Failing that, it looks to the prototype (and prototype of the prototype...).
        obj.constructor.prototype.four = 4;
        _.each(obj, function(value, key) {
            answers.push(key);
        });
        equals(answers.join(", "), 'one, two, three', 'iterating over objects works, and ignores the object prototype.');
        delete obj.constructor.prototype.four;

        // The same case as before, but this time we override a property from a prototype.
        answers = [];
        function Objektik() {
            this.one = "X";
        }
        var obj = new Objektik();
        obj.one = 1;
        obj.two = 2;
        obj.three = 3;
        _.each(obj, function(value, key) {
            answers.push(value);
        });
        equals(answers.join(", "), '1, 2, 3', 'iterating over objects works, and ignores the object prototype.');

        // The third value passed is the original object iterated on.
        answer = null;
        _.each([1, 2, 3], function(num, index, arr) {
            equals(arr[index], num, 'can reference the original collection from inside the iterator');
        });

        // Returns on undefined object.
        answers = 0;
        _.each(null, function() {
            ++answers;
        });
        equals(answers, 0, 'handles a null properly');
    });

    test('collections: map', function() {
        // Double the value passed in.
        var doubled = _.map([1, 2, 3], function(num){ return num * 2; });
        equals(doubled.join(', '), '2, 4, 6', 'doubled numbers');

        // Do not define a return in an iterator function, get back 'undefined'.
        var doubled = _.map([1, 2, 3], function(){ ; });
        equals(doubled[1], undefined, 'no iterator function return');

        // Override the 'this' context.
        var tripled = _.map([1, 2, 3], function(num){ return num * this.multiplier; }, {multiplier : 3});
        equals(tripled.join(', '), '3, 6, 9', 'tripled numbers with context');

        //var doubled = _([1, 2, 3]).map(function(num){ return num * 2; });
        //equals(doubled.join(', '), '2, 4, 6', 'OO-style doubled numbers');

        // Iterate over DOM objects (more a test of each).
        //var ids = _.map($('div.underscore-test').children(), function(element) {
        //    equals(typeof(element), typeof($('<a/>')), 'can use collection methods on NodeLists');
        //    return element.id;
        //});
        //ok(_.include(ids, 'qunit-banner'), 'can use collection methods on NodeLists');

        //var ifnull = _.map(null, function(){});
        //ok(_.isArray(ifnull) && ifnull.length === 0, 'handles a null properly');

        // Use sparse arrays.
        var arr = ['terminator', 'predator', 'eliminator'];
        arr[9] = 'alien';
        equals(arr.length, 10, "a sparse array");
        var result = _.map(arr, function(v) { return v; });
        equals(result.length, 10, "can preserve a sparse array's length");
    });

    test('collections: reduce', function() {
        // Sum all values in an array by keeping a count in memo/sum.
        var sum = _.reduce([1, 2, 3], function(sum, num){ return sum + num; });
        equals(sum, 6, 'can sum up an array');

        //var context = {multiplier : 3};
        //sum = _.reduce([1, 2, 3], function(sum, num){ return sum + num * this.multiplier; }, 0, context);
        //equals(sum, 18, 'can reduce with a context object');

        // Alias the function and pass in the initial value for memo.
        sum = _.reduce([1, 2, 3], function(sum, num){ return sum + num; }, 3);
        equals(sum, 9, 'pass initial value for memo');

        // Get an error if we do not have an initial value for memo and we cannot get it from the
        // first element in the object.
        var fail = false;
        try {
            _.reduce([], function(){ ; });
        } catch (ex) {
            fail = true;
        }
        ok(fail, "throw an error if no init value is set and cannot be got from first el in obj")

        //sum = _([1, 2, 3]).reduce(function(sum, num){ return sum + num; }, 0);
        //equals(sum, 6, 'OO-style reduce');

        ok(_.reduce(null, function(){}, 138) === 138, 'handles a null (with initial value) properly');
        equals(_.reduce([], function(){}, undefined), undefined, 'undefined can be passed as a special case');
        raises(function() { _.reduce([], function(){}); }, TypeError, 'throws an error for empty arrays with no initial value');

        var sparseArray = [];
        sparseArray[0] = 20;
        sparseArray[2] = -5;
        equals(_.reduce(sparseArray, function(a, b){ return a - b; }), 25, 'initially-sparse arrays with no memo');
    });

    test('collections: any', function() {
        var nativeSome = Array.prototype.some;
        Array.prototype.some = null;
        
        // We have nothing, so we get false.
        ok(!_.any([]), 'the empty set');
        
        // We get false back as there are no true values.
        ok(!_.any([false, false, false]), 'all false values');
        
        // We get true back as one value is set to true.
        ok(_.any([false, false, true]), 'one true value');
        
        // We are looking for any result, a string, getting bool back.
        ok(_.any([null, 0, 'a string here mate', false]), 'a string');
        
        // Empty string evaluates as false.
        ok(!_.any([null, 0, '', false]), 'falsy values');
        
        // Look for even numbers and find none.
        ok(!_.any([1, 11, 29], function(num){ return num % 2 == 0; }), 'all odd numbers');
        
        // Find one even number. 
        ok(_.any([1, 10, 29], function(num){ return num % 2 == 0; }), 'an even number');
        
        //ok(_.some([false, false, true]), 'aliased as "some"');
        
        Array.prototype.some = nativeSome;
    });

    test('collections: find', function() {
        var result = _.find([1, 2, 3], function(num){ return num * 2 == 4; });
        equals(result, 2, 'found the first "2" and broke the loop');
    });

    test('collections: select', function() {
        var evens = _.select([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
        equals(evens.join(', '), '2, 4, 6', 'selected each even number');

        //evens = _.filter([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
        //equals(evens.join(', '), '2, 4, 6', 'aliased as "filter"');
    });

    test('collections: reject', function() {
        var odds = _.reject([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
        equals(odds.join(', '), '1, 3, 5', 'rejected each even number');
    });

    test('collections: all', function() {
        ok(_.all([], _.identity), 'the empty set');
        ok(_.all([true, true, true], _.identity), 'all true values');
        ok(!_.all([true, false, true], _.identity), 'one false value');
        ok(_.all([0, 10, 28], function(num){ return num % 2 == 0; }), 'even numbers');
        ok(!_.all([0, 11, 28], function(num){ return num % 2 == 0; }), 'an odd number');
        //ok(_.every([true, true, true], _.identity), 'aliased as "every"');
    });

    test('collections: include', function() {
        ok(_.include([1,2,3], 2), 'two is in the array');
        ok(!_.include([1,3,9], 2), 'two is not in the array');
        ok(_.contains({moe:1, larry:3, curly:9}, 3) === true, '_.include on objects checks their values');
        //ok(_([1,2,3]).include(2), 'OO-style include');
    });

    test('collections: invoke', function() {
        var list = [[5, 1, 7], [3, 2, 1]];
        var result = _.invoke(list, 'sort');
        equals(result[0].join(', '), '1, 5, 7', 'first array sorted');
        equals(result[1].join(', '), '1, 2, 3', 'second array sorted');

        // An example where we pass a function instead of a function name.
        var result = _.invoke([5, "hey", 7], function() { return this == "hey"; });
        equals(result.join(', '), "false, true, false", 'function passed as an argument');
    });

    test('collections: pluck', function() {
        var people = [{name : 'moe', age : 30}, {name : 'curly', age : 50}];
        equals(_.pluck(people, 'name').join(', '), 'moe, curly', 'pulls names out of objects');
    });

    test('collections: max', function() {
        //equals(3, _.max([1, 2, 3]), 'can perform a regular Math.max');

        var neg = _.max([3, 1, 2], function(num){ return -num; });
        equals(neg, 1, 'can perform a computation-based max');

        equals(-Infinity, _.max({}), 'Maximum value of an empty object');
        equals(-Infinity, _.max([]), 'Maximum value of an empty array');
    });

    test('collections: min', function() {
        equals(1, _.min([1, 2, 3]), 'can perform a regular Math.min');

        var neg = _.min([1, 2, 3], function(num){ return -num; });
        equals(neg, 3, 'can perform a computation-based min');

        equals(Infinity, _.min({}), 'Minimum value of an empty object');
        equals(Infinity, _.min([]), 'Minimum value of an empty array');
    });

    test('collections: range', function() {
        // An array of 5 elements, beginning with a 0.
        var numbers = _.range(5);
        equals(numbers.join(','), "0,1,2,3,4", 'create a range of values ala Python');

        // No arguments passed, an empty array returned.
        equals(_.range().length, 0, "empty array");

        // An array of 5 elements, beginning with a 0.
        var numbers = _.range(2.32, 5.78);
        equals(numbers.join(','), "2.32,3.32,4.32,5.32", 'we are not restricted by Int');
    });

    test('collections: shuffle', function() {
        var numbers = _.range(10);
        var shuffled = _.shuffle(numbers);
        
        _.each(shuffled, function(num) {
            equals(numbers[num], num, 'in any order, the numbers match');
        });

        shuffled = shuffled.sort();
        notStrictEqual(numbers, shuffled, 'original object is unmodified');
        equals(shuffled.join(','), numbers.join(','), 'contains the same members before and after shuffle');
    });

    test('collections: sortBy', function() {
        var people = [{name : 'curly', age : 50}, {name : 'moe', age : 30}];
        people = _.sortBy(people, function(person){ return person.age; });
        equals(_.pluck(people, 'name').join(', '), 'moe, curly', 'stooges sorted by age');
    });

    test('collections: groupBy', function() {
        var parity = _.groupBy([1, 2, 3, 4, 5, 6], function(num){ return num % 2; });
        ok('0' in parity && '1' in parity, 'created a group for each value');
        equals(parity[0].join(', '), '2, 4, 6', 'put each even number in the right group');

        var list = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
        var grouped = _.groupBy(list, 'length');
        equals(grouped['3'].join(' '), 'one two six ten');
        equals(grouped['4'].join(' '), 'four five nine');
        equals(grouped['5'].join(' '), 'three seven eight');

        // A new addition that uses dot notation to access inner objects.
        var objects = [{'o' : {'a' : 12}}, {'o' : {'a' : 5}}, {'o' : {'a' : 7}}];
        var grouped = _.groupBy(objects, 'o.a');
        ok('5' in grouped && '7' in grouped && '12' in grouped, 'inner objects through keys');
    });

    test('collections: sortedIndex', function() {
        var numbers = [10, 20, 30, 40, 50], num = 35;
        var index = _.sortedIndex(numbers, num);
        equals(index, 3, '35 should be inserted at index 3');
    });

    test('collections: toArray', function() {
        ok(!_.isArray(arguments), 'arguments object is not an array');
        ok(_.isArray(_.toArray(arguments)), 'arguments object converted into array');
        
        // A deep copy.
        var a = [1,2,3];
        ok(_.toArray(a) !== a, 'array is cloned');
        equals(_.toArray(a).join(', '), '1, 2, 3', 'cloned array contains same elements');

        // For an object, we get its values.
        var numbers = _.toArray({one : 1, two : 2, three : 3});
        equals(numbers.join(', '), '1, 2, 3', 'object flattened into array');
    });

    test('collections: size', function() {
        equals(_.size({one : 1, two : 2, three : 3}), 3, 'can compute the size of an object');
    });

    test('collection: functions', function() {
        var obj = {'one': 1, 'two': function(x) {return x;}, 'three': {'four': 'four'}};
        equals(_.functions(obj).join(), 'two', 'can get functions off of objects');
    });

});
