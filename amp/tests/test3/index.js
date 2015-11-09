"use strict"
//function C(obj, children) {
//    var ctl = obj;
//    if(obj instanceof Element){
//        ctl = new Control({render:() => obj});
//    }
//    if(arguments.length>=2) {
//        obj.setChildren(children);
//    }
//    return ctl;
//}

function index() {
    $(main);

    function parseFakeFunc(funcText) {
        var compiler = new Compiler();
        var nodes = compiler.parse(funcText); //funcInfo.body);
        if (nodes.length != 1)
            throw new Error();
        return nodes[0];
    }
    function fromFakeFunc(func, ctx) {
        var compiler = new Compiler();
        var root = parseFakeFunc(func.toString());
        var code = compiler.generate(root);
        if (ctx == null)
            ctx = {};
        if (ctx.C == null)
            ctx.C = simpleSetChildren;
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
        var func = fromFakeFunc(test, { C: LANG.C });
        var ctl = func({ contacts: [{ name: "ggg", phones:["09-98234", "234324324"] }, { name: "fff", phones:["02-111234", "1111"] }] });
        console.log(ctl);
        //var res = ctl[0].render();
        //console.log(res);
        //var node = res;
        //console.log(node);
        //var ctl = LANG.build(node);
        //ctl("gggggggggggggggggggggggggggggg").render();
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
