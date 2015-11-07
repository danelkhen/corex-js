function LANG() {
    Function.addTo(this, [group, repeater, create, build]);

    var _appenders = [
        [Node, Node, (x, y) => x.appendChild(y)],
        [jQuery, Node, (x, y) => x.appendChild(y)],
    ];

    function build(node) {
        var obj = node.value;
        if (node.children != null && node.children.length > 0) {
            var childrenValues = node.children.select(build);
            var ctl;
            if (obj instanceof Control)
                ctl = obj;
            else if (node.type == "function")
                ctl = new Control({ renderSelf: obj });
            else
                ctl = new Control({ renderSelf: () => obj });
            ctl.append(childrenValues);
            return ctl;
        }
        return obj;
    }
    //function append(obj, children) {
    //    if (obj instanceof Control) {
    //        obj.append(children);
    //        return obj;
    //    }
    //    if (obj instanceof Node) {
    //        var node = obj;
    //        $(node).setChildNodes(toNodes(children));
    //        return node;
    //        //children.forEach(child => node.appendChild(child));
    //    }
    //    console.warn("Don't know how to append:", obj, children);
    //    return obj;

    //}


    function group() {
        return new Control({
            render: function () {
                var list = this.children.select(t=>t.render());
                return list;
            }
        });
    }

    function repeater(list, opts) {
        return Control({
            append: function (children) {
                this.templateFunc = children[0];
            },
            render: function () {
                var node = this;
                var templateFunc = this.templateFunc;
                var controls = list.select((obj, i) => this.templateFunc(obj, i));//node.children[0].render(obj));
                var children = controls.select(t=>t.render());
                return children;

                //TODO: cache:
                //var map = node.__map;
                //if (map == null) {
                //    map = new Map();
                //    node.__map = map;
                //}
                //var template = function (obj, i) {
                //    var cloned = map.get(obj);
                //    if (cloned == null) {
                //        cloned = node.children.select(t=>t.clone());
                //        cloned.forEach(t=>t.opts.data = obj);
                //        map.set(obj, cloned);
                //    }
                //    return cloned;
                //}
                //var children = list.selectMany(template).select(t=>t.render());
                //return children;// invisible(children);
            }
        });
    }

    function create(selector) {
        return Control({ renderSelf: () => $.create(selector) });
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
Function.addTo(LANG, Object.values(new LANG()));
