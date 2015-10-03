"use strict"
function debug() {
    debugger;
}
function main() {
    //if(this==window||this==null)
    //    return new main();
    var _amp = new Amp();
    $("#templates").children().toArray().forEach(function (el) {
        _amp._templates.push(el.outerHTML);
    });
    $("#templates").remove();
    _amp.loadTemplates();

    var list = Array.generateNumbers(10).select(function (i) { return { name: "hello" + i }; });

    var el = _amp._builder.create("<myform/>", { t: list });

    //var el = _amp.mount("myform", obj);
    $(el).appendTo("body");
    $(el).find("input").first()[0].a = "b";
    console.log($(el).find("input").first()[0].a);
    //$(el).find("input").first().val("bbbbbbbbbbb");
    list[0].name = "gggggggggggggggggggg";
    list.push({name:"aaaaaaaaaaaa"});

    window.setTimeout(function () {
        var el2 = _amp._builder.update(el);
        console.log($(el2).find("input").first()[0], $(el2).find("input").first()[0].a);
    }, 1000);



}