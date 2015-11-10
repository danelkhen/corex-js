"use strict"
function LANG() {
    Function.addTo(this, [group, repeater, create, C, conditional, vertical, horizontal, get]);

    function Temp(obj) {
        if (this == null)
            return new Temp(obj);
        if (obj == null)
            obj = { setChildren: function (children) { return children; } };
        shallowCopy(obj, this);
    }

    function get(url) {
        return new Temp({
            setChildren: function (children) {
                var func = children[0];
                var div = $.create(".placeholder");
                $.get(url).done(function (res) {
                    var res2 = func(res);
                    Element_setChildren(div[0], res2);
                    div.replaceWith(div.contents());
                });
                return div[0];
            }
        });
    }


    function group() {
        return new Temp({
            setChildren: function (children) {
                return children;
            },
        });
    }

    function repeater(list, opts) {
        return new Temp({
            setChildren: function (children) {
                if (children == null || children.length == 0)
                    return [];
                var controls = list.selectMany((obj, i) => children.select(child => {
                    if (typeof (child) == "function")
                        return child(obj, i);
                    return child;
                }));
                return controls;
            },
        });
    }

    function create(selector) {
        return $.create(selector)[0];
    }

    function conditional(condition) {
        return new Temp({
            setChildren: function (children) {
                if (condition)
                    return children;
                return null;
            }
        });
    }

    function vertical() {
        return new Temp({
            setChildren: function (children) {
                var el = $();
                if (children.length == 0)
                    return el.empty();
                el = el.verify("table.layout.vertical");
                var tbl = el;
                var tbody = tbl.getAppend("tbody");
                tbody.getAppendRemoveForEach("tr", children, function (tr, child) {
                    var td = tr.getAppend("td");
                    var childNodes = $(toNodes(child));
                    var height = childNodes.data("layout-height");
                    if (height == null)
                        height = childNodes.data("layout-size");
                    if (height != null)
                        td.css({ height: height });
                    Element_setChildren(td[0], childNodes);
                });
                return el[0];
            }
        });
    }

    function horizontal() {
        return new Temp({
            setChildren: function (children) {
                var el = $();
                el = el.verify("table.layout.horizontal");
                var tbl = el;
                var tr = tbl.getAppend("tbody").getAppend("tr");
                tr.getAppendRemoveForEach("td", children, function (td, child) {
                    var childNodes = $(toNodes(child));
                    var width = childNodes.data("layout-width");
                    if (width == null)
                        width = childNodes.data("layout-size");
                    if (width != null)
                        td.css({ width: width });
                    Element_setChildren(td[0], childNodes);
                });
                return el[0];
            }
        });
    }

    function C(obj, children) {
        //TODO:
        //if (arguments.length >= 2) {
        //    if (typeof (obj.setChildrenAsync) == "function") {
        //        var deferred = obj.setChildrenAsync(children);
        //        return obj;
        //    }
        //}
        if (typeof (obj.setChildren) == "function") {
            var res = obj.setChildren(children);
            return res;
        }
        if (arguments.length >= 2) {
            if (obj instanceof Element)
                return Element_setChildren(obj, children);
            if (obj instanceof jQuery)
                return Element_setChildren(obj[0], children);
            console.warn("can't setChildren for obj", obj);
        }
        return obj;
    }


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


    function Element_setChildren(el, children) {
        var childNodes = toNodes(children);
        setChildNodes(el, childNodes);
        return el;
    }
    //$.fn.setChildren = function (childNodes) {
    //    var children = toNodes(childNodes);
    //    setChildNodes(this[0], children);
    //    return this;
    //}
    function shallowCopy(src, dest) {
        return $.extend(dest || {}, src);
    }

    //Element.prototype.setChildren = function (list) {
    //    var childNodes = toNodes(list);
    //    setChildNodes(this, childNodes);
    //    return this;
    //}


}
Function.addTo(LANG, Object.values(new LANG()));
$.fn.verify = function (selector) {
    if (!this.is(selector))
        return $.create(selector);
    return this;
}
