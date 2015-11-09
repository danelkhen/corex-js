"use strict"
function LANG() {
    Function.addTo(this, [group, repeater, create, C, conditional]);

    function Temp(obj) {
        if (this == null)
            return new Temp(obj);
        if (obj == null)
            obj = { setChildren: function (children) { return children; } };
        shallowCopy(obj, this);
    }

    function C(obj, children) {
        if (arguments.length >= 2 || typeof (obj.setChildren) == "function") {
            var res = obj.setChildren(children);
            return res;
        }
        return obj;
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
                var node = this;
                var el = node.lastRes || $();
                if (children.length == 0)
                    return el.empty();
                el = el.verify("table.layout.vertical");
                var tbl = el;
                var tbody = tbl.getAppend("tbody");
                var results = node.children.select(t=>t.render());
                tbody.getAppendRemoveForEach("tr", children, function (tr, child) {
                    var td = tr.getAppend("td");
                    var childNodes = $(toNodes(res));
                    var height = childNodes.data("layout-height");
                    if (height == null)
                        height = childNodes.data("layout-size");
                    if (height != null)
                        td.css({ height: height });
                    td.setChildren([child]);
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
Function.addTo(LANG, Object.values(new LANG()));
