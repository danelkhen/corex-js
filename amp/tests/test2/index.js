"use strict"



function index() {
    $(main);

    function fromFakeFunc(func, ctx) {
        var funcInfo = FunctionHelper.parse(func.toString());

        var compiler = new Compiler();
        var nodes = compiler.parse(funcInfo.body);
        console.log(nodes);
        var prms = funcInfo.prms.join(", ");
        if (funcInfo.prms.length > 1)
            prms = "(" + prms + ")";

        var root;
        if (nodes.length == 1) {
            root = nodes[0];
            root.text = prms+" => " + root.text;
        }
        else {
            root = { text: prms+" => group()", children: nodes };
        }
        var code = compiler.generate(root);
        //var ctx = new LANG();
        var func3 = compiler.compile(code, ctx);
        //console.log(code);
        //var func2 = new Function("C", code);
        //console.log(func2);
        //var func3 = function(){
        //    return func2(Control.from);
        //};
        console.log(func3);
        var res = func3(ctx);
        return res;
    }

    function main() {
        var res = fromFakeFunc(test, new LANG());
        //var func = test;
        //var funcInfo = FunctionHelper.parse(func.toString());

        //var compiler = new Compiler();
        //var nodes = compiler.parse(funcInfo.body);
        //console.log(nodes);
        //var code = compiler.generate(nodes[0]);
        //var ctx = new LANG();

        //var func3 = compiler.compile(code, ctx);
        ////console.log(code);
        ////var func2 = new Function("C", code);
        ////console.log(func2);
        ////var func3 = function(){
        ////    return func2(Control.from);
        ////};
        //console.log(func3);
        //var res = func3(ctx);
        res("GGGGGGGGGGGGGGGGGGGGGGGGGGGGG").render();
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

function LANG() {
    Function.addTo(this, [group, repeater, create, APPEND]);

    function APPEND(obj, children) {
        return Control.append(obj, children);
    }
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


