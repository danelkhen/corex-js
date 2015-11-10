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

    function main() {
        //var func = fromFakeFunc(test);
        var ctl = test({ contacts: [{ name: "ggg", phones: ["09-98234", "234324324"] }, { name: "fff", phones: ["02-111234", "1111"] }] });
        console.log(ctl);
    }
}

