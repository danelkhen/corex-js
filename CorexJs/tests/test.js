function main() {
    var _amp = new Amp();
    $("#templates").children().toArray().forEach(function (el) {
        _amp._templates.push(el.outerHTML);
    });
    _amp.loadTemplates();

    var obj = {name:"shooki"};

    var el = _amp._builder.create("<myform/>", {t:obj});
    //var el = _amp.mount("myform", obj);
    el.appendTo("body");


}