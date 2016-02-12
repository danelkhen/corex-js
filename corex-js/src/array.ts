///<reference path="function.ts" />
"use strict";
Array.prototype.forEachJoin = function (action, actionBetweenItems) {
    var first = true;
    for (var i = 0; i < this.length; i++) {
        if (first)
            first = false;
        else
            actionBetweenItems();
        action(this[i]);
    }
}
Array.prototype.first = function (predicate) {
    if (predicate == null)
        return this[0];
    for (var i = 0; i < this.length; i++) {
        if (predicate(this[i]))
            return this[i];
    }
    return null;
}
Array.prototype.toArray = function () {
    return this.slice(0);
}
Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
}
Array.prototype.insertRange = function (index, items) {
    var args = items.toArray();
    args.insert(0, 0);
    args.insert(0, index);
    this.splice.apply(this, args);
}
Array.prototype.last = function (predicate) {
    var len = this.length;
    if (len == 0)
        return null;
    if (predicate == null)
        return this[len - 1];
    for (var i = len - 1; i >= 0; i--) {
        if (predicate(this[i]))
            return this[i];
    }
    return null;
}
Array.prototype.toObject = function (selector) {
    if (selector == null) {
        return this.copyPairsToObject();
    }
    var obj = {};
    for (var i = 0; i < this.length; i++) {
        var obj2 = selector(this[i]);
        if (obj2 instanceof Array)
            obj2.copyPairsToObject(obj);
        else {
            for (var p in obj2)
                obj[p] = obj2[p];
        }
    }
    return obj;
};
Array.prototype.toObjectKeys = function (defaultValue) {
    var obj = {};
    for (var i = 0; i < this.length; i++) {
        var p = this[i];
        obj[p] = defaultValue;
    }
    return obj;
};
Array.prototype.keysToObject = Array.prototype.toObjectKeys;
Array.prototype.pairsToObject = Array.prototype.toObject;
Array.prototype.copyPairsToObject = function (obj) {
    if (obj == null)
        obj = {};
    for (var i = 0; i < this.length; i += 2) {
        obj[this[i]] = this[i + 1];
    }
    return obj;
};
Array.prototype.removeFirst = function () {
    return this.splice(0, 1)[0];
}
Array.prototype.remove = function (item) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === item) {
            this.removeAt(i);
            return true;
        }
    }
    return false;
}
Array.prototype.removeRange = function (items) {
    items.forEach(function (t) { this.remove(t); });
}
Array.prototype.contains = function (s) {
    return this.indexOf(s) >= 0;
}
Array.prototype.containsAny = function (items) {
    return items.any(function (t) { return this.contains(t); }.bind(this));
}
Array.prototype.any = function (predicate) {
    return this.some(Q.createSelectorFunction(predicate));
}
Array.prototype.distinct = function (keyGen?) {
    if (keyGen == null)
        keyGen = Object.getHashKey;
    var list = [];
    var set = {};
    this.forEach(function (t) {
        var key = keyGen(t);
        if (set[key])
            return;
        set[key] = true;
        list.push(t);
    });
    return list;
}
Array.prototype.removeAll = function (predicate, thisArg?) {
    var toRemove = [];
    for (var i = 0; i < this.length; i++) {
        if (predicate(this[i])) {
            toRemove.push(i);
        }
    }
    while (toRemove.length > 0) {
        var index = toRemove.pop();
        this.removeAt(index);
    }
}
Array.prototype.removeAt = function (index) {
    this.splice(index, 1);
}
///<summary>Iterates over the array, performing an async function for each item, going to the next one only when the previous one has finished (called his callback)</summary>
Array.prototype.forEachAsyncProgressive = function (actionWithCallback, finalCallback) {
    this._forEachAsyncProgressive(actionWithCallback, finalCallback, 0);
}
Array.prototype.where = function (predicate) {
    return this.filter(Q.createSelectorFunction(predicate));
}
Array.prototype.whereEq = function (selector, value) {
    selector = Q.createSelectorFunction(selector);
    return this.filter(function (t, i) { return selector(t, i) == value; });
}
Array.prototype.whereNotEq = function (selector, value) {
    selector = Q.createSelectorFunction(selector);
    return this.filter(function (t, i) { return selector(t, i) != value; });
}
Array.prototype.firstEq = function (selector, value) {
    selector = Q.createSelectorFunction(selector);
    return this.first(function (t, i) { return selector(t, i) == value; });
}
Array.prototype.firstNotEq = function (selector, value) {
    selector = Q.createSelectorFunction(selector);
    return this.first(function (t, i) { return selector(t, i) != value; });
}
Array.prototype.addRange = function (items) {
    this.push.apply(this, items);
}
Array.prototype.diff = function (target) {
    var source = this;
    var res = {
        added: source.where(function (t) { return !target.contains(t); }),
        removed: target.where(function (t) { return !source.contains(t); }),
    };
    return res;
}
Array.prototype.hasDiff = function (target) {
    var diff = this.diff(target);
    return diff.added.length > 0 || diff.removed.length > 0;
}
Array.prototype._forEachAsyncProgressive = function (actionWithCallback, finalCallback, index) {
    if (index == null)
        index = 0;
    if (index >= this.length) {
        if (finalCallback != null)
            finalCallback();
        return;
    }
    var item = this[index];
    actionWithCallback(item, function () { this._forEachAsyncProgressive(actionWithCallback, finalCallback, index + 1); }.bind(this));
}
/// Iterates over the array, performing an async function for each item, going to the next one only when the previous one has finished (called his callback)
Array.prototype.mapAsyncProgressive = function (actionWithCallback, finalCallback) {
    this._mapAsyncProgressive(actionWithCallback, finalCallback, 0, []);
}
Array.prototype._mapAsyncProgressive = function (actionWithCallbackWithResult, finalCallback, index, results) {
    if (index == null)
        index = 0;
    if (index >= this.length) {
        if (finalCallback != null)
            finalCallback(results);
        return;
    }
    var item = this[index];
    actionWithCallbackWithResult(item, function (res) {
        results.push(res);
        this._mapAsyncProgressive(actionWithCallbackWithResult, finalCallback, index + 1, results);
    }.bind(this));
}
Array.prototype.mapWith = function (anotherList, funcForTwoItems) {
    if (funcForTwoItems == null)
        funcForTwoItems = function (x, y) { return [x, y]; };
    var list = [];
    var maxLength = Math.max(this.length, anotherList.length);
    for (var i = 0; i < maxLength; i++)
        list.push(funcForTwoItems(this[i], anotherList[i]));
    return list;
}
Array.prototype.min = function () {
    var min = null;
    for (var i = 0; i < this.length; i++) {
        var value = this[i];
        if (min == null || value < min)
            min = value;
    }
    return min;
}
Array.prototype.max = function () {
    var max = null;
    for (var i = 0; i < this.length; i++) {
        var value = this[i];
        if (max == null || value > max)
            max = value;
    }
    return max;
}
Array.prototype.getEnumerator = function () {
    return new ArrayEnumerator(this);
}
Array.prototype.orderBy = function (selector, desc, comparer) {
    if (arguments.length == 1 && selector instanceof Array)
        return this.toArray().sortBy(selector);
    return this.toArray().sortBy(selector, desc, comparer);
}
Array.prototype.orderByDescending = function (selector, desc) {
    return this.orderBy(selector, true);
}
Array.prototype.sortBy = function (selector, desc, comparer) {
    var compareFunc;
    if (arguments.length == 1 && selector instanceof Array)
        compareFunc = ComparerHelper.createCombined(selector);
    else
        compareFunc = ComparerHelper.create(selector, desc, comparer);
    this.sort(compareFunc);
    return this;
}
Array.prototype.sortByDescending = function (selector) {
    return this.sortBy(selector, true);
}
//Performs an async function on each item in the array, invoking a finalCallback when all are completed
//asyncFunc -> function(item, callback -> function(result))
//finalCallback -> function(results);
Array.prototype.mapAsyncParallel = function (asyncFunc, finalCallback) {
    var results = [];
    var list = this;
    var length = list.length;
    if (length == 0) {
        finalCallback(results);
        return;
    }
    var finished = 0;
    var cb = function (res, index) {
        results[index] = res;
        finished++;
        if (finished == length)
            finalCallback(results);
    };
    list.forEach(function (item, i) {
        asyncFunc(item, function (res) { cb(res, i); });
    });
}
//Performs an async function on each item in the array, invoking a finalCallback when all are completed
//asyncFunc -> function(item, callback -> function(result))
//finalCallback -> function(results);
Array.prototype.forEachAsyncParallel = function (asyncFunc, finalCallback) {
    var list = this;
    var length = list.length;
    if (length == 0) {
        finalCallback();
        return;
    }
    var finished = 0;
    var cb = function (res, index) {
        finished++;
        if (finished == length)
            finalCallback();
    };
    list.forEach(function (item, i) {
        asyncFunc(item, cb);//function () { cb(i); });
    });
}
Array.prototype.clear = function () {
    this.splice(0, this.length);
}
Array.prototype.itemsEqual = function (list) {
    if (list == this)
        return true;
    if (list.length != this.length)
        return false;
    for (var i = 0; i < this.length; i++)
        if (this[i] != list[i])
            return false;
    return true;
}
Array.prototype.select = function (selector) {
    var func = Q.createSelectorFunction(selector);
    return this.map(func);
}
Array.prototype.selectInvoke = function (name) {
    if (arguments.length == 0)
        return this.map(function (t) { return t(); });
    return this.map(function (t) { return t[name](); });
}
Array.prototype.joinWith = function (list2, keySelector1, keySelector2, resultSelector) {
    keySelector1 = Q.createSelectorFunction(keySelector1);
    keySelector2 = Q.createSelectorFunction(keySelector2);
    resultSelector = Q.createSelectorFunction(resultSelector);

    var list1 = this;

    var groups1 = list1.groupByToObject(keySelector1);
    var groups2 = list2.groupByToObject(keySelector2);

    var list = [];
    var group = {};
    for (var p in groups1) {
        if (groups2[p] != null)
            list.push(resultSelector(groups1[p], groups2[p]));
    }

    return list;
}
Array.prototype.all = function (predicate) {
    return this.every(Q.createSelectorFunction(predicate));
}
Array.prototype.flatten = function () {
    var list = [];
    this.forEach(function (t) {
        list.addRange(t);
    });
    return list;
}
Array.prototype.selectToObject = function (keySelector, valueSelector) {
    var obj = {};
    if (valueSelector == null) {
        var list = this.select(keySelector);
        for (var i = 0; i < list.length; i++) {
            var obj2 = this[i];
            if (obj2 != null) {
                if (obj2 instanceof Array) {
                    for (var i = 0; i < obj2.length; i++) {
                        obj[obj2[0]] = obj2[1];
                    }
                }
                else {
                    Q.copy(obj2, obj, { overwrite: true });
                }
            }
        }
    }
    else {
        keySelector = Q.createSelectorFunction(keySelector);
        valueSelector = Q.createSelectorFunction(valueSelector);

        for (var i = 0; i < this.length; i++) {
            var item = this[i];
            obj[keySelector(item)] = valueSelector(item);
        }
    }
    return obj;
}
Array.prototype.groupByToObject = function (keySelector, itemSelector) {
    keySelector = Q.createSelectorFunction(keySelector);
    itemSelector = Q.createSelectorFunction(itemSelector);
    var obj = {};
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        var key = keySelector(item);
        if (obj[key] == null) {
            obj[key] = [];
            obj[key].key = key;
        }
        var value = itemSelector(item);
        obj[key].push(value);
    }
    return obj;
}
Array.prototype.groupBy = function (keySelector, itemSelector) {
    var groupsMap = this.groupByToObject(keySelector, itemSelector);
    return Object.values(groupsMap);
}
Array.prototype.splitIntoChunksOf = function (countInEachChunk) {
    var chunks = Math.ceil(this.length / countInEachChunk);
    var list = [];
    for (var i = 0; i < this.length; i += countInEachChunk) {
        list.push(this.slice(i, i + countInEachChunk));
    }
    return list;
}
Array.prototype.avg = function () {
    if (this.length == 0)
        return null;
    return this.sum() / this.length;
}
Array.prototype.selectMany = function (selector) {
    var list = [];
    this.select(selector).forEach(function (t) { t.forEach(function (x) { list.push(x); }); });
    return list;
}
Array.prototype.sum = function () {
    if (this.length == 0)
        return 0;
    var sum = this[0];
    for (var i = 1; i < this.length; i++)
        sum += this[i];
    return sum;
}
Array.prototype.skip = function (count) {
    return this.slice(count);
}
Array.prototype.take = function (count) {
    return this.slice(0, count);
}
Array.prototype.toSelector = function () {
    return Q.createSelectorFunction(this);
}
Array.prototype.removeNulls = function () {
    return this.removeAll(function (t) { return t == null; });
}
Array.prototype.exceptNulls = function () {
    return this.where(function (t) { return t != null; });
}
Array.prototype.truncate = function (totalItems) {
    if (this.length <= totalItems)
        return;
    this.splice(totalItems, this.length - totalItems);
}
Array.prototype.random = function () {
    return this[Math.randomInt(0, this.length - 1)];
}
Array.prototype.selectRecursive = function (selector, recursiveFunc) {
    if (recursiveFunc == null) {
        recursiveFunc = selector;
        selector = null;
    }
    var list = this.select(selector);
    var children = this.select(recursiveFunc);
    var list2 = children.selectRecursive(selector, recursiveFunc);
    list.addRange(list2);
    return list;
}
Array.prototype.selectManyRecursive = function (selector, recursiveFunc) {
    if (recursiveFunc == null) {
        recursiveFunc = selector;
        selector = null;
    }
    var list;
    if (selector == null)
        list = this.toArray();
    else
        list = this.selectMany(selector);
    var children = this.selectMany(recursiveFunc);
    if (children.length > 0) {
        var list2 = children.selectManyRecursive(selector, recursiveFunc);
        list.addRange(list2);
    }
    return list;
}

//Array Extension Aliases
Array.prototype.peek = Array.prototype.last;
Array.prototype.removeLast = Array.prototype.pop;
Array.prototype.add = Array.prototype.push;
Array.prototype.forEachWith = function (list, action) {
    return Array.forEachTwice(this, list, action);
}
Array.prototype.selectWith = function (list, func) {
    return Array.selectTwice(this, list, func);
}

//Produces a cartesian product of two lists, if no selector(x1, y1) is defined, will return an array of pairs [[x1,y1],[x1,y2],[x1,y3]...]
Array.prototype.crossJoin = function (list2, selector) {
    var list1 = this;
    var list3 = [];
    if (selector == null)
        selector = function (x, y) { return [x, y]; };
    list1.forEach(function (t1) {
        list2.forEach(function (t2) {
            list3.push(selector(t1, t2));
        });
    });
    return list3;
}

//Array Static Extensions
Array.joinAll = function (lists, keySelector, resultSelector) {
    keySelector = Q.createSelectorFunction(keySelector);
    resultSelector = Q.createSelectorFunction(resultSelector);

    var groupMaps = lists.map(function (list) {
        return list.groupByToObject(keySelector);
    });

    var groupMap1 = groupMaps[0];

    var list = [];
    for (var p in groupMap1) {
        if (groupMaps.all(p))
            list.push(resultSelector(groupMaps.select(p)));
    }

    return list;
}
Array.outerJoin = function (list1, list2, keySelector1, keySelector2, resultSelector) {
    keySelector1 = Q.createSelectorFunction(keySelector1);
    keySelector2 = Q.createSelectorFunction(keySelector2);
    resultSelector = Q.createSelectorFunction(resultSelector);


    var groups1 = list1.groupByToObject(keySelector1);
    var groups2 = list2.groupByToObject(keySelector2);


    var allKeys = Object.keys(groups1);
    allKeys.addRange(Object.keys(groups2));
    allKeys = allKeys.distinct();
    //allKeys.sort();

    var list3 = [];
    allKeys.forEach(function (key) {
        var group1 = groups1[key] || [];
        var group2 = groups2[key] || [];
        var res = Array.selectTwice(group1, group2, function (item1, item2) { return resultSelector(key, item1, item2); });
        list3.addRange(res);
    });
    return list3;
}
Array.outerJoinAll = function (lists, keySelector, resultSelector) {
    keySelector = Q.createSelectorFunction(keySelector);
    resultSelector = Q.createSelectorFunction(resultSelector);


    var listsGroups = lists.select(function (list) { return list.groupByToObject(keySelector); });
    //[{key1:items, key2:items}, {key1:items, key2:items}]

    var allKeys = listsGroups.selectMany(function (t) { return Object.values(t).select("key"); }).distinct();

    var list3 = [];
    allKeys.forEach(function (key) {
        var lists = listsGroups.select(function (obj) { return obj[key] || []; });
        var list2 = Array.selectAll(lists, function (items, index) { return resultSelector(key, items); });
        list3.addRange(list2);
    });
    return list3;
}
Array.forEachAll = function (lists, action) {
    var max = lists.select("length").max();
    for (var i = 0; i < max; i++) {
        var values = lists.select(i);
        action(values, i);
    }
}
Array.selectAll = function (lists, func) {
    var list2 = [];
    Array.forEachAll(lists, function (items, i) {
        list2.push(func(items, i));
    });
    return list2;
}
Array.forEachTwice = function (list1, list2, action) {
    var l1 = list1.length;
    var l2 = list2.length;
    var max = Math.max(l1, l2);
    for (var i = 0; i < max; i++) {
        action(list1[i], list2[i], i);
    }
}
Array.selectTwice = function (list1, list2, func) {
    var list = [];
    Array.forEachTwice(list1, list2, function (t1, t2, index) {
        var item = func(t1, t2, index);
        list.push(item);
    });
    return list;
}
Array.generate = function (length, generator) {
    var list = new Array(length);
    for (var i = 0; i < length; i++) {
        list[i] = generator(i);
    }
    return list;
}
Array.wrapIfNeeded = function (obj) {
    if (obj instanceof Array)
        return obj;
    return [obj];
}
Array.toArray = function (arrayLike) {
    return Array.prototype.slice.call(arrayLike, 0);
}
if (Array.from == null) {
    Array.from = function (arrayLike) {
        return Array.prototype.slice.call(arrayLike, 0);
    }
}
Array.generateNumbers = function (from, until) {
    if (arguments.length == 1) {
        until = from;
        from = 0;
    }
    var length = until - from;
    var list = new Array(length);
    for (var i = 0; i < length; i++) {
        list[i] = i + from;
    }
    return list;
}
Array.slice = Array.prototype.slice.toStaticFunction();
Array.concat = Array.prototype.concat.toStaticFunction();
Array.fromIterator = function (iterator) {
    var list = [];
    var iteration = iterator.next();
    while (!iteration.done) {
        list.push(iteration.value);
        iteration = iterator.next();
    }
    return list;
}
