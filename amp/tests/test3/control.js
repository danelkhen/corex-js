﻿"use strict"

function isPromise(obj) {
    return typeof (obj.then) == "function" && typeof (obj.fail) == "function";
}
function toNodesAsync(results) {
    var deferred = $.Deferred();
    var list = toNodes(results);
    var promises = list.where(isPromise);
    $.whenAll(promises).done(function () {
        var values = Array.from(arguments);
        promises.forEach(function (p, i) {
            var index = list.indexOf(p);
            list[index] = values[i];
        });
        var list2 = toNodes(list);
        deferred.resolveWith(null, [list2]);
    });
    return deferred;
}

function toNodes(results) {
    var list = [];
    _addNodes(results, list);
    return list;
}
function _addNodes(res, list) {
    if (res == null)
        return;
    if (res instanceof Array)
        res.forEach(t=>_addNodes(t, list));
    else if (res instanceof jQuery)
        res.toArray().forEach(t=>_addNodes(t, list));
    else if (res instanceof Node)
        list.add(res);
    else
        list.add(res);//document.createTextNode(res));
}

function setChildNodes(el, childNodes) {
    childNodes.forEach(function (childNode, index) {
        var currentChild = el.childNodes[index];
        if (currentChild == childNode)
            return;
        if (currentChild != null) {
            if (!(childNode instanceof Node)) {
                if (currentChild.nodeType == 3 && currentChild.data == String(childNode))
                    return;
                childNode = el.ownerDocument.createTextNode(childNode);
            }
            el.insertBefore(childNode, currentChild);
            return;
        }
        if (!(childNode instanceof Node))
            childNode = el.ownerDocument.createTextNode(childNode);
        el.appendChild(childNode);
    });
    for (var i = childNodes.length; i < el.childNodes.length; i++) {
        var childNode = el.childNodes[i];
        el.removeChild(childNode);
    }

    return el;
}


$.fn.setChildren = function (childNodes) {
    var children = toNodes(childNodes);
    setChildNodes(this[0], children);
    return this;
}
$.fn.verify = function (selector) {
    if (!this.is(selector))
        return $.create(selector);
    return this;
}
function shallowCopy(src, dest) {
    return $.extend(dest || {}, src);
}

Element.prototype.setChildren = function (list) {
    var childNodes = toNodes(list);
    setChildNodes(this, childNodes);
    return this;
}


//Element.prototype.setChildrenAsync = function (list) {
//    var _this = this;
//    return toNodesAsync(list).done(function (childNodes) {
//        setChildNodes(_this, childNodes);
//    });
//}

