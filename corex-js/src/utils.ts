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

class Comparer {

    compare(x, y) {
        if (x > y)
            return 1;
        if (x < y)
            return -1;
        return 0;
    }
    static _default = new Comparer();
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
function combineCompareFuncs(compareFuncs) {
    return function (a, b) {
        var count = compareFuncs.length;
        for (var i = 0; i < count; i++) {
            var compare = compareFuncs[i];
            var x = compare(a, b);
            if (x != 0)
                return x;
        }
        return 0;
    };
}

function createCompareFuncFromSelector(selector, desc) {
    desc = desc ? -1 : 1;
    var compare = Comparer._default.compare;
    var type = typeof (selector);
    if (type == "string" || type == "number") {
        return function (x, y) {
            return compare(x[selector], y[selector]) * desc;
        };
    }
    return function (x, y) {
        return compare(selector(x), selector(y)) * desc;
    };
}

function toStringOrEmpty(val) {
    return val == null ? "" : val.toString();
}

Function.addTo(window, [toStringOrEmpty, createCompareFuncFromSelector, combineCompareFuncs]);


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


class ComparerHelper {
    static combine(comparers: any[]) {
        var func = function MultiComparer(x, y) {
            for (var i = 0; i < comparers.length; i++) {
                var comparer = comparers[i];
                var diff = comparer(x, y);
                if (diff != 0)
                    return diff;
            }
            return 0;
        };
        func.comparers = comparers;
        return func;
    }
    static _default(x, y) {
        if (x > y)
            return 1;
        if (x < y)
            return -1;
        return 0;
    }
    //createCombined( [ "name", ["size", true], ["custom", false, customComparer] ] )
    static createCombined(list) {
        var comparers = list.select(function (item) {
            if (item instanceof Array)
                return ComparerHelper.create.apply(this, item);
            return ComparerHelper.create(item);
        });
        var combined = ComparerHelper.combine(comparers);
        return combined;
    }
    static create(selector, desc?, comparer?) {
        var selectorFunc = Q.createSelectorFunction(selector);
        if (comparer == null)
            comparer = ComparerHelper._default;
        if (desc) {
            var func = function DescendingComparer(x, y) {
                var x1 = selectorFunc(x);
                var y1 = selectorFunc(y);
                var diff = comparer(x1, y1);
                diff *= -1;
                return diff;
            };
            return func;
        }
        var func = function AscendingComparer(x, y) {
            var x1 = selectorFunc(x);
            var y1 = selectorFunc(y);
            var diff = comparer(x1, y1);
            return diff;
        };
        return func;
    }
}
