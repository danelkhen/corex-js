"use strict"


function index() {
    $(main);
    function main() {
        //var ctl = horizontal().append([
        //    vertical().append([
        //        template(function (item) {
        //            return [
        //                create("div.test").append([text("hello1 " + item)]),
        //                create("div.test").append([text("hello2")]),
        //                create("div.test").append([text("hello3")]),
        //            ];
        //        }),
        //    ]),
        //    vertical().append([
        //        create("div.test").append([text("hello4")]),
        //        create("div.test").append([text("hello5")]),
        //        create("div.test").append([text("hello6")]),
        //    ])
        //])
        //;
        //$("body").empty().append(ctl.render());

        var ctl = repeater(["a", "b"]).append([
            template(function (item) {
                return [create("div.test").append([text("item " + item)])];
            }),
        ])
        ;
        $("body").empty().append(ctl.render());
    }

    function template(func) {
        return Control({
            render: function() {
                var children = func(this.data);
                return children.select(t=>t.render());
            }
        });
    }
    function repeater(list, opts) {
        return Control({
            render: function () {
                var node = this;
                var map = node.__map;
                if (map == null) {
                    map = new Map();
                    node.__map = map;
                }
                var template = function (obj, i) {
                    var cloned = map.get(obj);
                    if (cloned == null) {
                        cloned = node.children.select(t=>t.clone());
                        cloned.forEach(t=>t.opts.data = obj);
                        map.set(obj, cloned);
                    }
                    return cloned;
                }
                var children = list.selectMany(template).select(t=>t.render());
                return children;// invisible(children);
            }
        });
    }

    //function func(func_) {
    //    return Control({ renderSelf: () => $.create(selector) });
    //}
    function create(selector) {
        return Control({ renderSelf: () => $.create(selector) });
    }
    function value(el) {
        return Control({ renderSelf: () => el });
    }
    function text(s) {
        return Control({ renderSelf: () => document.createTextNode(s) });
    }

    function conditional(condition) {
        if (!condition)
            return null;
        return invisible();
    }

    function vertical() {
        return Control({
            render: function () {
                var node = this;
                node.childrenProcessed = true;
                var el = node.lastRes || $();
                if (node.children.length == 0)
                    return el.empty();
                el = el.verify("table.layout.vertical");
                var tbl = el;
                var tbody = tbl.getAppend("tbody");
                var results = node.children.select(t=>t.render());
                tbody.getAppendRemoveForEach("tr", results, function (tr, res) {
                    var td = tr.getAppend("td");
                    var childNodes = $(toNodes(res));
                    var height = childNodes.data("layout-height");
                    if (height == null)
                        height = childNodes.data("layout-size");
                    if (height != null)
                        td.css({ height: height });
                    td.setChildNodes(childNodes);
                });
                return el;
            }
        });
    }

    function horizontal() {
        return Control({
            render: function () {
                var node = this;
                var el = node.lastRes || $();
                node.childrenProcessed = true;
                if (node.children.length == 0)
                    return el.empty();
                el = el.verify("table.layout.horizontal");
                var tbl = el;
                var tr = tbl.getAppend("tbody").getAppend("tr");
                var results = node.children.select(t=>t.render());
                tr.getAppendRemoveForEach("td", results, function (td, res) {
                    var childNodes = $(toNodes(res));
                    var width = childNodes.data("layout-width");
                    if (width == null)
                        width = childNodes.data("layout-size");
                    if (width != null)
                        td.css({ width: width });
                    td.setChildNodes(childNodes);
                });
                return el;
            }
        });
    }


}


function Control(_opts) {
    if (this == null)
        return new Control(_opts);
    var _this = this;
    var _selfResult;
    var _childrenResults;

    Function.addTo(_this, [render, append, clone]);
    Object.defineProperties(_this, {
        opts: { get: function () { return _opts; } },
    });

    function clone() {
        return new Control(shallowCopy(_opts));
    }
    function append(list) {
        if (_opts.children == null)
            _opts.children = [];
        if (list instanceof Array)
            _opts.children.addRange(list);
        else
            _opts.children.add(list);
        return this;
    }
    main();
    function main() {
    }

    function render() {
        if (_opts.render != null) {
            _selfResult = _opts.render();
            return _selfResult
        }
        if (_opts.renderSelf != null)
            _selfResult = _opts.renderSelf();
        else
            throw new Error("renderSelf not defined");
        if (_opts.children != null) {
            _childrenResults = _opts.children.select(t=>t.render());
            if (_opts.setChildren)
                _opts.setChildren(_childrenResults);
            else
                $(toNodes(_selfResult)).setChildNodes(toNodes(_childrenResults));
        }
        return _selfResult;
    }
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
        list.add(document.createTextNode(res));
}

function HierarchyUtils() {
    Function.addTo(HierarchyUtils, [setChildren]);
    function setChildren(el, childElements) {
        childElements.forEach(function (childEl, index) {
            var currentChild = el.childNodes[index];
            if (currentChild == childEl)
                return;
            if (currentChild != null) {
                el.insertBefore(childEl, currentChild);
                return;
            }
            el.appendChild(childEl);
        });
        for (var i = childElements.length; i < el.childNodes.length; i++) {
            var childNode = el.childNodes[i];
            el.removeChild(childNode);
        }

        return el;
    }
}
HierarchyUtils();


$.fn.setChildNodes = function (childNodes) {
    if (!(childNodes instanceof Array))
        childNodes = childNodes.toArray();
    HierarchyUtils.setChildren(this[0], childNodes);
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
