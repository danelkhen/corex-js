"use strict"

function test() {
document.body
    "hello"
    repeater(["a", "b"])
        item => create("div.test")
            "item " + item
    "world"
}


function index() {
    $(main);
    function main() {
        var func = test;
        var funcInfo = FunctionHelper.parse(func.toString());

        var compiler = new Compiler();
        var nodes = compiler.parse(funcInfo.body);
        console.log(nodes);
        var code = compiler.generate(nodes[0]);
        var ctx = new LANG();

        var func3 = compiler.compile(code, ctx);
        //console.log(code);
        //var func2 = new Function("C", code);
        //console.log(func2);
        //var func3 = function(){
        //    return func2(Control.from);
        //};
        console.log(func3);
        var ctl = func3(ctx);
        ctl.render();
        console.log(ctl);
        return;
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

        var ctl = value(document.body).append([
            "hello",
            repeater(["a", "b"]).append([
                item => create("div.test").append([
                    "item " + item,
                ]),
            ])
        ])
        ;
        ctl.render();
        //$("body").empty().append(ctl.render());
    }
    }
function LANG(){
    Function.addTo(this, [group, repeater, create, APPEND]);

    function APPEND(obj, children) {
        return Control.append(obj, children);
    }
    function func(func_) {
        return new Control({ renderSelf: func_ });
    }

    function group() {
        return new Control({
            render: function () {
                var list = this.children.select(t=>t.render());
                return list;
            }
        });
    }

    function template(func) {
        return Control({
            render: function () {
                var children = func(this.data);
                return children.select(t=>t.render());
            }
        });
    }
    function repeater(list, opts) {
        return Control({
            render: function () {
                var node = this;
                //cloned = node.children[0].clone();//.select(t=>t.clone());
                var controls = list.select(obj => node.children[0].render(obj));
                var children = controls.select(t=>t.render());
                return children;

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


