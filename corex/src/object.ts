//"use strict";
////******** Object
//Object.toArray = function (obj) {
//    var list = [];
//    for (var p in obj) {
//        list.push(p, obj[p]);
//    }
//    return list;
//}
//Object.allKeys = function (obj) {
//    var list = [];
//    for (var p in obj) {
//        list.push(p);
//    }
//    return list;
//}
//Object.keysValues = function (obj) {
//    var list = [];
//    for (var p in obj) {
//        list.push({ key: p, value: obj[p] });
//    }
//    return list;
//}
//Object.pairs = function (obj) {
//    var list = [];
//    list.isArrayOfPairs = true;
//    for (var p in obj) {
//        list.push([p, obj[p]]);
//    }
//    return list;
//}
//Object.fromPairs = function (keysValues) {
//    var obj = {};
//    keysValues.forEach(function (pair) {
//        obj[pair[0]] = pair[1];
//    });
//    return obj;
//}
//Object.fromKeysValues = function (keysValues) {
//    var obj = {};
//    keysValues.forEach(function (keyValue) {
//        obj[keyValue.key] = keyValue.value;
//    });
//    return obj;
//}
//Object.reversePairs = function (obj) {
//    var list = [];
//    for (var i = 0; i < obj.length; i++) {
//        list.push([obj[i][1], obj[i][0]]);
//    }
//    return list;
//}
//Object.forEach = function (obj, keyValueAction) {
//    Object.keys(obj).forEach(function (p) {
//        keyValueAction(p, obj[p]);
//    });
//}
//Object.toSortedByKey = function (obj) {
//    var sortedKeys = Object.keys(obj).sort();
//    return sortedKeys.toObject(function (key) { return [key, obj[key]]; })
//}
//Object.getCreateArray = function (obj, p) {
//    var value = obj[p];
//    if (value == null) {
//        value = [];
//        obj[p] = value;
//    }
//    return value;
//}
//Object.jsonStringifyEquals = function (x, y) {
//    return JSON.stringify(x) == JSON.stringify(y);
//}
//Object.tryGet = function (obj, indexers) {
//    if (typeof (indexers) == "string")
//        indexers = indexers.split(".");
//    var value = obj;
//    for (var i = 0; i < indexers.length; i++) {
//        if (value == null)
//            return null;
//        value = value[indexers[i]];
//    }
//    return value;
//}
//Object.trySet = function (obj, indexers, value) {
//    if (typeof (indexers) == "string")
//        indexers = indexers.split(".");
//    var obj2 = obj;
//    if (indexers.length > 1) {
//        obj2 = Object.tryGet(obj, indexers.take(indexers.length - 1));
//    }
//    if (obj2 == null)
//        return;
//    obj2[indexers[indexers.length - 1]] = value;
//}
//Object.select = function (obj, selector) {
//    return Q.createSelectorFunction(selector)(obj);
//}
/////Deletes all keys in obj that have the same value: Object.delete({a:"b", c:"d"}, {a:"b", c:"g"})   =>   {c:"d"};
//Object.deleteKeysWithValues = function (obj, keysValues) {
//    Object.keys(keysValues).forEach(function (key) {
//        var value = keysValues[key];
//        if (obj[key] == value)
//            delete obj[key];
//    });
//}

//var __hashKeyIndex = 0;
//Object.getHashKey = function (obj) {
//    if (obj == null)
//        return null;
//    var x = obj.valueOf();
//    var type = typeof (x);
//    if (type == "number")
//        return x.toString();
//    if (type == "string")
//        return x;
//    if (x.__hashKey == null) {
//        x.__hashKey = "\0" + "_" + x.constructor.name + "_" + __hashKeyIndex++;
//    }
//    return x.__hashKey
//}
//Object.values = function (obj) {
//    var list = [];
//    for (var p in obj) {
//        list.push(obj[p]);
//    }
//    return list;
//}

//Object.removeAll = function (obj, predicate) {
//    var toRemove = [];
//    Object.forEach(obj, function (key, value) {
//        if (predicate(key, value))
//            toRemove.push(key);
//    });
//    toRemove.forEach(function (t) { delete obj[t]; });
//}

//Object.clear = function (obj) {
//    Object.keys(obj).forEach(function (p) { delete obj[p]; });
//}



