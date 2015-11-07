"use strict"



function index() {
    $(main);

    function parseFakeFunc(funcText){
        var funcInfo = FunctionHelper.parse(funcText);

        var compiler = new Compiler();
        var nodes = compiler.parse(funcInfo.body);
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
        return root;
    }
    function fromFakeFunc(func, ctx) {
        var compiler = new Compiler();
        var root = parseFakeFunc(func.toString());
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
        var node = res;
        console.log(node);
        var ctl = LANG.build(node);
        ctl("gggggggggggggggggggggggggggggg").render();
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
