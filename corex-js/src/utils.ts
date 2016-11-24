"use strict";

//******** JSON

JSON.iterateRecursively = function (obj, action) {
    if (obj == null || typeof (obj) != "object" || obj instanceof Date)
        return;

    if (obj instanceof Array) {
        var list = obj;
        list.forEach(function (item, index) {
            action(obj, index, item);
            JSON.iterateRecursively(item, action);
        });
    }
    else {
        Object.keys(obj).forEach(function (key) {
            var value = obj[key];
            action(obj, key, value);
            JSON.iterateRecursively(value, action);
        });
    }
}


//******** Math

Math.randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



//******** Error

Error.prototype.wrap = function (e) {
    e.innerError = this;
    return e;
}
Error.prototype.causedBy = function (e) {
    this.innerError = e;
}


class ArrayEnumerator<T>{
    constructor(public list: Array<T>) {
    }
    index = -1;
    moveNext = function () {
        if (this.index == -2)
            throw new Error("End of array");
        this.index++;
        if (this.index >= this.list.length) {
            this.index = -2;
            return false;
        }
        return true;
    }
    getCurrent = function () {
        if (this.index < 0)
            throw new Error("Invalid array position");
        return this.list[this.index];
    }
}



class Timer {
    action;
    _ms;
    timeout;
    constructor(action, ms?) {
        this.action = action;
        if (ms != null)
            this.set(ms);
    }
    set(ms?) {
        if (ms == null)
            ms = this._ms;
        else
            this._ms = ms;
        this.clear();
        if (ms == null)
            return;
        this.timeout = window.setTimeout(this.onTick.bind(this), ms);
    }
    onTick() {
        this.clear();
        this.action();
    }
    clear(ms?) {
        if (this.timeout == null)
            return;
        window.clearTimeout(this.timeout);
        this.timeout = null;
    }
}

class QueryString {

    static parse(query, obj, defaults) {
        if (query == null)
            query = window.location.search.substr(1);
        if (obj == null)
            obj = {};
        if (defaults == null)
            defaults = {};
        var index2 = query.indexOf("#");
        if (index2 >= 0)
            query = query.substr(0, index2);
        if (query.length == 0)
            return obj;
        var parts = query.split('&');
        var pairs = parts.select(function (part) { return part.split('='); });
        pairs.forEach(function (pair) {
            var key = pair[0];
            var eValue = pair[1];
            var value;
            var defaultValue = defaults[key];
            var currentValue = obj[key];
            if (currentValue == null || currentValue == defaultValue) {
                value = decodeURIComponent(eValue);
                obj[key] = value;
            }
            else if (currentValue instanceof Array || defaultValue instanceof Array) {
                if (currentValue == null) {
                    currentValue = [];
                    obj[key] = currentValue;
                }
                if (defaultValue != null && currentValue.itemsEqual(defaultValue))
                    currentValue.clear();
                if (eValue != "") {
                    var items = eValue.split(",").select(function (item) { return decodeURIComponent(item); });
                    items.forEach(function (item) {
                        if (!currentValue.contains(item))
                            currentValue.add(item);
                    });
                }
            }
            else if (currentValue != null) {
                value = decodeURIComponent(eValue);
                obj[key] = value;
                //value = decodeURIComponent(eValue);
                //obj[key] = [currentValue, value];
            }
            if (typeof (defaultValue) == "boolean" && typeof (value) != "boolean") {
                var boolValue = value == 1 || value == true || value == "1" || value == "true";
                obj[key] = boolValue;
            }

        });
        return obj;
    }
    static stringify(obj) {
        var sb = [];
        QueryString.write(obj, sb);
        return sb.join("&");
    }
    static write(obj, sb) {
        Object.keys(obj).forEach(function (p) {
            var value = obj[p];
            if (value == null)
                return;
            if (value instanceof Array) {
                if (value.length > 0)
                    sb.push(p + "=" + value.exceptNulls().select(function (item) { return encodeURIComponent(item); }).join(","));
            }
            else {
                sb.push(p + "=" + encodeURIComponent(value));
            }
        });
    }

}

class ValueOfEqualityComparer {

    equals(x, y) {
        if (x == y)
            return true;
        if (x == null || y == null)
            return false;
        return x.valueOf() == y.valueOf();
    }
    getHashKey(x) {
        return Object.getHashKey(x);
    }
}



//if (typeof (window) != "undefined")
//    Function.addTo(window, [toStringOrEmpty, createCompareFuncFromSelector, combineCompareFuncs]);


class Dictionary<K, T> {
    _obj;
    count;
    keyGen;
    constructor() {
        this._obj = new Object();
        this.count = 0;
        this.keyGen = Object.getHashKey;
    }
    clear() {
        this._obj = new Object();
        this.count = 0;
    };
    add(key, value) {
        var k = this.keyGen(key);
        if (this._obj.hasOwnProperty(k))
            throw new Error();
        this._obj[k] = value;
        this.count++;
    };
    get(key) {
        var k = this.keyGen(key);
        if (!this._obj.hasOwnProperty(k))
            throw new Error();
        return this._obj[k];
    };
    set(key, value) {
        var k = this.keyGen(key);
        this._obj[k] = value;
    };
    values() {
        return Object.values(this._obj);
    };
};


class MultiComparer<T> implements Comparer<T>{
    constructor(comparers?: Comparer<T>[], comparerFuncs?: ComparerFunc<T>[]) {
        this.comparers = comparers;
        this.comparerFuncs = comparerFuncs;
        if (this.comparerFuncs == null && this.comparers != null) {
            this.comparerFuncs = this.comparers.map(t => t.compare.bind(t));
        }
    }

    comparers: Comparer<T>[];
    comparerFuncs: ComparerFunc<T>[];
    compare(x: T, y: T): number {
        if (this.comparerFuncs == null)
            return 0;
        for (let comparerFunc of this.comparerFuncs) {
            let diff = comparerFunc(x, y);
            if (diff != 0)
                return diff;
        }
        return 0;
    }
}

class DefaultComparer<T> implements Comparer<T> {

    compare(x, y) {
        if (x > y)
            return 1;
        if (x < y)
            return -1;
        return 0;
    }
}

class ComparerHelper {
    static combine<T>(comparers: Comparer<T>[]): MultiComparer<T> {
        return new MultiComparer(comparers);
    }
    static combineFuncs<T>(comparerFuncs: ComparerFunc<T>[]): ComparerFunc<T> {
        let mc = new MultiComparer(null, comparerFuncs);
        return mc.compare.bind(mc);
    }
    static _default = new DefaultComparer<any>();

    static createCombined<T>(list: SelectorComparer<T, any>[]): ComparerFunc<T> {
        var comparers = list.select(function (item) {
            if (item instanceof Array)
                return ComparerHelper.create.apply(this, item);
            return ComparerHelper.create(item);
        });
        var combined = ComparerHelper.combineFuncs(comparers);
        return combined;
    }

    static create<T, R>(cfg: SelectorComparer<T, R>): ComparerFunc<T> { //selector: SelectorFunc<T, R>, desc?: boolean, comparer?: ComparerFunc<T>): ComparerFunc<T> {
        let selector = cfg.selector;
        let desc = cfg.descending;
        let valueComparer = cfg.valueComparerFunc;
        var selectorFunc = Q.createSelectorFunction(selector);
        if (valueComparer == null)
            valueComparer = ComparerHelper._default.compare;
        if (desc) {
            var func = function DescendingComparer(x, y) {
                var x1 = selectorFunc(x);
                var y1 = selectorFunc(y);
                var diff = valueComparer(x1, y1);
                diff *= -1;
                return diff;
            };
            return func;
        }
        var func = function AscendingComparer(x, y) {
            var x1 = selectorFunc(x);
            var y1 = selectorFunc(y);
            var diff = valueComparer(x1, y1);
            return diff;
        };
        return func;
    }

}

interface SelectorComparer<T, R> {
    selector: SelectorFunc<T, R>;
    descending?: boolean;
    valueComparerFunc?: ComparerFunc<R>;
}

interface SelectorFunc<T, R> {
    (obj: T, index: number): R;
}
interface Comparer<T> {
    compare: ComparerFunc<T>;
}
interface ComparerFunc<T> {
    (x: T, y: T): number;
}
//namespace Comparer {
//    export let _default = new DefaultComparer<any>();
//}

