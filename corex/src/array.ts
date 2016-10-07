///<reference path="function.ts" />
"use strict";

export class ArrayEx<T> extends Array<T> {
    constructor(private list: Array<T>) { 
        super();
    }

    forEachJoin(action, actionBetweenItems) {
        let first = true;
        for (let i = 0; i < this.length; i++) {
            if (first)
                first = false;
            else
                actionBetweenItems();
            action(this[i]);
        }
    }
    first(predicate) {
        if (predicate == null)
            return this[0];
        for (let i = 0; i < this.length; i++) {
            if (predicate(this[i]))
                return this[i];
        }
        return null;
    }
    toArray() {
        return this.slice(0);
    }
    insert(index, item) {
        this.splice(index, 0, item);
    }
    insertRange(index, items) {
        let args = items.toArray();
        args.insert(0, 0);
        args.insert(0, index);
        this.splice.apply(this, args);
    }
    last(predicate) {
        let len = this.length;
        if (len == 0)
            return null;
        if (predicate == null)
            return this[len - 1];
        for (let i = len - 1; i >= 0; i--) {
            if (predicate(this[i]))
                return this[i];
        }
        return null;
    }
    toObject(selector) {
        if (selector == null) {
            return this.copyPairsToObject();
        }
        let obj = {};
        for (let i = 0; i < this.length; i++) {
            let obj2 = selector(this[i]);
            if (obj2 instanceof Array)
                obj2.copyPairsToObject(obj);
            else {
                for (let p in obj2)
                    obj[p] = obj2[p];
            }
        }
        return obj;
    };
    toObjectKeys(defaultValue) {
        let obj = {};
        for (let i = 0; i < this.length; i++) {
            let p = <string><any>this[i];
            obj[p] = defaultValue;
        }
        return obj;
    };
    copyPairsToObject(obj?: Object) {
        if (obj == null)
            obj = {};
        for (let i = 0; i < this.length; i += 2) {
            obj[<string><any>this[i]] = this[i + 1];
        }
        return obj;
    };
    removeFirst() {
        return this.splice(0, 1)[0];
    }
    remove(item) {
        for (let i = 0; i < this.length; i++) {
            if (this[i] === item) {
                this.removeAt(i);
                return true;
            }
        }
        return false;
    }
    removeRange(items) {
        items.forEach(function (t) { this.remove(t); });
    }
    contains(s) {
        return this.indexOf(s) >= 0;
    }
    containsAny(items) {
        return items.any(function (t) { return this.contains(t); }.bind(this));
    }
    any(predicate) {
        return this.some(Q.createSelectorFunction(predicate));
    }
    distinct(keyGen?) {
        if (keyGen == null)
            keyGen = Object.getHashKey;
        let list = [];
        let set = {};
        this.forEach(function (t) {
            let key = keyGen(t);
            if (set[key])
                return;
            set[key] = true;
            list.push(t);
        });
        return list;
    }
    removeAll(predicate, thisArg?) {
        let toRemove = [];
        for (let i = 0; i < this.length; i++) {
            if (predicate(this[i])) {
                toRemove.push(i);
            }
        }
        while (toRemove.length > 0) {
            let index = toRemove.pop();
            this.removeAt(index);
        }
    }
    removeAt(index) {
        this.splice(index, 1);
    }
    ///<summary>Iterates over the array, performing an async function for each item, going to the next one only when the previous one has finished (called his callback)</summary>
    forEachAsyncProgressive(actionWithCallback, finalCallback) {
        this._forEachAsyncProgressive(actionWithCallback, finalCallback, 0);
    }
    where(predicate) {
        return this.filter(Q.createSelectorFunction(predicate));
    }
    whereEq(selector, value) {
        selector = Q.createSelectorFunction(selector);
        return this.filter(function (t, i) { return selector(t, i) == value; });
    }
    whereNotEq(selector, value) {
        selector = Q.createSelectorFunction(selector);
        return this.filter(function (t, i) { return selector(t, i) != value; });
    }
    firstEq(selector, value) {
        selector = Q.createSelectorFunction(selector);
        return this.first(function (t, i) { return selector(t, i) == value; });
    }
    firstNotEq(selector, value) {
        selector = Q.createSelectorFunction(selector);
        return this.first(function (t, i) { return selector(t, i) != value; });
    }
    addRange(items) {
        this.push.apply(this, items);
    }
    diff(target) {
        let source = this;
        let res = {
            added: source.where(function (t) { return !target.contains(t); }),
            removed: target.where(function (t) { return !source.contains(t); }),
        };
        return res;
    }
    hasDiff(target) {
        let diff = this.diff(target);
        return diff.added.length > 0 || diff.removed.length > 0;
    }
    _forEachAsyncProgressive(actionWithCallback, finalCallback, index) {
        if (index == null)
            index = 0;
        if (index >= this.length) {
            if (finalCallback != null)
                finalCallback();
            return;
        }
        let item = this[index];
        actionWithCallback(item, function () { this._forEachAsyncProgressive(actionWithCallback, finalCallback, index + 1); }.bind(this));
    }
    /// Iterates over the array, performing an async function for each item, going to the next one only when the previous one has finished (called his callback)
    mapAsyncProgressive(actionWithCallback, finalCallback) {
        this._mapAsyncProgressive(actionWithCallback, finalCallback, 0, []);
    }
    _mapAsyncProgressive(actionWithCallbackWithResult, finalCallback, index, results) {
        if (index == null)
            index = 0;
        if (index >= this.length) {
            if (finalCallback != null)
                finalCallback(results);
            return;
        }
        let item = this[index];
        actionWithCallbackWithResult(item, function (res) {
            results.push(res);
            this._mapAsyncProgressive(actionWithCallbackWithResult, finalCallback, index + 1, results);
        }.bind(this));
    }
    mapWith(anotherList, funcForTwoItems) {
        if (funcForTwoItems == null)
            funcForTwoItems = (x, y) => [x, y];
        let list = [];
        let maxLength = Math.max(this.length, anotherList.length);
        for (let i = 0; i < maxLength; i++)
            list.push(funcForTwoItems(this[i], anotherList[i]));
        return list;
    }
    min() {
        let min = null;
        for (let i = 0; i < this.length; i++) {
            let value = this[i];
            if (min == null || value < min)
                min = value;
        }
        return min;
    }
    max() {
        let max = null;
        for (let i = 0; i < this.length; i++) {
            let value = this[i];
            if (max == null || value > max)
                max = value;
        }
        return max;
    }
    getEnumerator() {
        return new ArrayEnumerator(this);
    }
    orderBy(selector, desc, comparer?) {
        if (arguments.length == 1 && selector instanceof Array)
            return this.toArray().sortBy(selector);
        return this.toArray().sortBy(selector, desc, comparer);
    }
    orderByDescending(selector, desc) {
        return this.orderBy(selector, true);
    }
    sortBy(selector, desc?, comparer?) {
        let compareFunc;
        if (arguments.length == 1 && selector instanceof Array)
            compareFunc = ComparerHelper.createCombined(selector);
        else
            compareFunc = ComparerHelper.create(selector, desc, comparer);
        this.sort(compareFunc);
        return this;
    }
    sortByDescending(selector) {
        return this.sortBy(selector, true);
    }
    //Performs an async function on each item in the array, invoking a finalCallback when all are completed
    //asyncFunc -> function(item, callback -> function(result))
    //finalCallback -> function(results);
    mapAsyncParallel(asyncFunc, finalCallback) {
        let results = [];
        let list = this;
        let length = list.length;
        if (length == 0) {
            finalCallback(results);
            return;
        }
        let finished = 0;
        let cb = (res, index) => {
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
    forEachAsyncParallel(asyncFunc, finalCallback) {
        let list = this;
        let length = list.length;
        if (length == 0) {
            finalCallback();
            return;
        }
        let finished = 0;
        let cb = (res, index) => {
            finished++;
            if (finished == length)
                finalCallback();
        };
        list.forEach(function (item, i) {
            asyncFunc(item, cb);//function () { cb(i); });
        });
    }
    clear() {
        this.splice(0, this.length);
    }
    itemsEqual(list) {
        if (list == this)
            return true;
        if (list.length != this.length)
            return false;
        for (let i = 0; i < this.length; i++)
            if (this[i] != list[i])
                return false;
        return true;
    }
    select(selector) {
        let func = Q.createSelectorFunction(selector);
        return this.map(func);
    }
    selectInvoke(name) {
        let list: any[] = this;
        if (arguments.length == 0)
            return list.map(t => t());
        return list.map(t => t[name]());
    }
    joinWith(list2, keySelector1, keySelector2, resultSelector) {
        keySelector1 = Q.createSelectorFunction(keySelector1);
        keySelector2 = Q.createSelectorFunction(keySelector2);
        resultSelector = Q.createSelectorFunction(resultSelector);

        let list1 = this;
        list2 = ArrayEx.from(list2);

        let groups1 = list1.groupByToObject(keySelector1);
        let groups2 = list2.groupByToObject(keySelector2);

        let list = [];
        let group = {};
        for (let p in groups1) {
            if (groups2[p] != null)
                list.push(resultSelector(groups1[p], groups2[p]));
        }

        return list;
    }
    all(predicate) {
        return this.every(Q.createSelectorFunction(predicate));
    }
    flatten() {
        let list = [];
        this.forEach(function (t) {
            list.addRange(t);
        });
        return list;
    }
    selectToObject(keySelector, valueSelector) {
        let obj = {};
        if (valueSelector == null) {
            let list = this.select(keySelector);
            for (let i = 0; i < list.length; i++) {
                let obj2 = this[i];
                if (obj2 != null) {
                    if (obj2 instanceof Array) {
                        let list2 = <Array<any>><any>obj2;
                        for (let i = 0; i < list2.length; i++) {
                            obj[list2[0]] = list2[1];
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

            for (let i = 0; i < this.length; i++) {
                let item = this[i];
                obj[keySelector(item)] = valueSelector(item);
            }
        }
        return obj;
    }
    groupByToObject(keySelector, itemSelector?) {
        keySelector = Q.createSelectorFunction(keySelector);
        itemSelector = Q.createSelectorFunction(itemSelector);
        let obj = {};
        for (let i = 0; i < this.length; i++) {
            let item = this[i];
            let key = keySelector(item);
            if (obj[key] == null) {
                obj[key] = [];
                obj[key].key = key;
            }
            let value = itemSelector(item);
            obj[key].push(value);
        }
        return obj;
    }
    groupBy(keySelector, itemSelector) {
        let groupsMap = this.groupByToObject(keySelector, itemSelector);
        return Object.values(groupsMap);
    }
    splitIntoChunksOf(countInEachChunk) {
        let chunks = Math.ceil(this.length / countInEachChunk);
        let list = [];
        for (let i = 0; i < this.length; i += countInEachChunk) {
            list.push(this.slice(i, i + countInEachChunk));
        }
        return list;
    }
    avg() {
        if (this.length == 0)
            return null;
        return this.sum() / this.length;
    }
    selectMany(selector) {
        let list = [];
        this.select(selector).forEach(function (t) { (<any[]>t).forEach(function (x) { list.push(x); }); });
        return list;
    }
    sum() {
        if (this.length == 0)
            return 0;
        let sum = <number><any>this[0];
        for (let i = 1; i < this.length; i++)
            sum += <number><any>this[i];
        return sum;
    }
    skip(count) {
        return this.slice(count);
    }
    take(count) {
        return this.slice(0, count);
    }
    toSelector() {
        return Q.createSelectorFunction(this);
    }
    removeNulls() {
        return this.removeAll(function (t) { return t == null; });
    }
    exceptNulls() {
        return this.where(function (t) { return t != null; });
    }
    truncate(totalItems) {
        if (this.length <= totalItems)
            return;
        this.splice(totalItems, this.length - totalItems);
    }
    random() {
        return this[Math.randomInt(0, this.length - 1)];
    }
    selectRecursive(selector, recursiveFunc) {
        if (recursiveFunc == null) {
            recursiveFunc = selector;
            selector = null;
        }
        let list = this.select(selector);
        let children = this.select(recursiveFunc);
        let list2 = children.selectRecursive(selector, recursiveFunc);
        list.addRange(list2);
        return list;
    }
    selectManyRecursive(selector, recursiveFunc) {
        if (recursiveFunc == null) {
            recursiveFunc = selector;
            selector = null;
        }
        let list;
        if (selector == null)
            list = this.toArray();
        else
            list = this.selectMany(selector);
        let children = this.selectMany(recursiveFunc);
        if (children.length > 0) {
            let list2 = children.selectManyRecursive(selector, recursiveFunc);
            list.addRange(list2);
        }
        return list;
    }

    forEachWith(list, action) {
        return Array.forEachTwice(this, list, action);
    }
    selectWith(list, func) {
        return Array.selectTwice(this, list, func);
    }

    //Produces a cartesian product of two lists, if no selector(x1, y1) is defined, will return an array of pairs [[x1,y1],[x1,y2],[x1,y3]...]
    crossJoin(list2, selector) {
        let list1 = this;
        let list3 = [];
        if (selector == null)
            selector = (x, y) => [x, y];
        list1.forEach(function (t1) {
            list2.forEach(function (t2) {
                list3.push(selector(t1, t2));
            });
        });
        return list3;
    }

    //Array Static Extensions
    static joinAll(lists, keySelector, resultSelector) {
        keySelector = Q.createSelectorFunction(keySelector);
        resultSelector = Q.createSelectorFunction(resultSelector);

        let groupMaps = lists.map(function (list) {
            return list.groupByToObject(keySelector);
        });

        let groupMap1 = groupMaps[0];

        let list = [];
        for (let p in groupMap1) {
            if (groupMaps.all(p))
                list.push(resultSelector(groupMaps.select(p)));
        }

        return list;
    }
    static outerJoin(list1, list2, keySelector1, keySelector2, resultSelector) {
        keySelector1 = Q.createSelectorFunction(keySelector1);
        keySelector2 = Q.createSelectorFunction(keySelector2);
        resultSelector = Q.createSelectorFunction(resultSelector);


        let groups1 = list1.groupByToObject(keySelector1);
        let groups2 = list2.groupByToObject(keySelector2);


        let allKeys = ArrayEx.from(Object.keys(groups1));
        allKeys.addRange(Object.keys(groups2));
        allKeys = allKeys.distinct();
        //allKeys.sort();

        let list3 = ArrayEx.from([]);
        allKeys.forEach(function (key) {
            let group1 = groups1[key] || [];
            let group2 = groups2[key] || [];
            let res = ArrayEx.selectTwice(group1, group2, function (item1, item2) { return resultSelector(key, item1, item2); });
            list3.addRange(res);
        });
        return list3;
    }
    static outerJoinAll(lists, keySelector, resultSelector) {
        keySelector = Q.createSelectorFunction(keySelector);
        resultSelector = Q.createSelectorFunction(resultSelector);


        let listsGroups = lists.select(function (list) { return list.groupByToObject(keySelector); });
        //[{key1:items, key2:items}, {key1:items, key2:items}]

        let allKeys = listsGroups.selectMany(function (t) { return Object.values(t).select("key"); }).distinct();

        let list3 = [];
        allKeys.forEach(function (key) {
            let lists = listsGroups.select(function (obj) { return obj[key] || []; });
            let list2 = Array.selectAll(lists, function (items, index) { return resultSelector(key, items); });
            list3.addRange(list2);
        });
        return list3;
    }
    static forEachAll(lists, action) {
        let max = lists.select("length").max();
        for (let i = 0; i < max; i++) {
            let values = lists.select(i);
            action(values, i);
        }
    }
    static selectAll(lists, func) {
        let list2 = [];
        Array.forEachAll(lists, function (items, i) {
            list2.push(func(items, i));
        });
        return list2;
    }
    static forEachTwice(list1, list2, action) {
        let l1 = list1.length;
        let l2 = list2.length;
        let max = Math.max(l1, l2);
        for (let i = 0; i < max; i++) {
            action(list1[i], list2[i], i);
        }
    }
    static selectTwice(list1, list2, func) {
        let list = [];
        Array.forEachTwice(list1, list2, function (t1, t2, index) {
            let item = func(t1, t2, index);
            list.push(item);
        });
        return list;
    }
    static generate(length, generator) {
        let list = new Array(length);
        for (let i = 0; i < length; i++) {
            list[i] = generator(i);
        }
        return list;
    }
    static wrapIfNeeded(obj) {
        if (obj instanceof Array)
            return obj;
        return [obj];
    }
    static toArray(arrayLike) {
        return Array.prototype.slice.call(arrayLike, 0);
    }

    static from<T>(x: T[]): ArrayEx<T> {
        let xx:any = x;
        if(xx._isArrayEx)
            return xx;
        Object.keys(ArrayEx).forEach(key=>x[key] = ArrayEx.prototype[key]);
        return xx;
    }

    static generateNumbers(from, until) {
        if (arguments.length == 1) {
            until = from;
            from = 0;
        }
        let length = until - from;
        let list = new Array(length);
        for (let i = 0; i < length; i++) {
            list[i] = i + from;
        }
        return list;
    }
    static fromIterator(iterator) {
        let list = [];
        let iteration = iterator.next();
        while (!iteration.done) {
            list.push(iteration.value);
            iteration = iterator.next();
        }
        return list;
    }
}
/*
    //Array Extension Aliases
    peek = last;
    removeLast = pop;
    add = push;


      keysToObject = toObjectKeys;
    pairsToObject = toObject;

    static slice = slice.toStaticFunction();
    static concat = concat.toStaticFunction();

*/