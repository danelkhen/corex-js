function debug(){
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

    var list = Array.generateNumbers(10).select(i=>{name:"hello"+i});

    var el = _amp._builder.create("<myform/>", {t:list});
    //var el = _amp.mount("myform", obj);
    $(el).appendTo("body");


}