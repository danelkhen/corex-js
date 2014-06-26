function main() {
    var list = [{ name: "Shooki", isCool: true }, { name: "Booki", isCool: false }];
    $(document).data("context", list);
    $(document).databind();
    //window.setTimeout(function(){
    //    list.push({name:"New", isCool:false});
    //    $(document.body).databind();
    //}, 1000);
}

function bindArrayToChildren(el, template, list){
    var el2 = $(el);
    var children = el2.children(":not(.Template)").toArray();

    function createTemplate(t){
        return $(template).clone(true).removeClass('Template').data('context', t);
    }
    var index = 0;
    var index2 = 0;
    while(index2<children.length) {
        var ch2 = $(children[index2]);
        var dc2 = ch2.data("context");
        if(dc2==null)
            continue;
        var dc = list[index];
        if(dc!=dc2){
            if(dc==null){
                ch2.remove();
                index2++;
                continue;
            }
            else{
                var ch3 = createTemplate(dc);
                ch3.insertBefore(ch2);
                index++;
                continue;
            }
        }
        index2++;
        index++;
    }
    while(index<list.length){
        el2.append(createTemplate(list[index]));
        index++;
    }
}



function DataBindingPlugin(){
    init();
    function init() {
        $(document).on("databind", document_databind);
        $(document).on("databindback", document_databindback);
    }

    

    function document_databind(e) {
        //console.log(e.type, e.target.nodeName, e.target.className, JSON.stringify($(e.target).data("context")));
        if (e.isDefaultPrevented())
            return;

        var target = $(e.target);
        var dataContext = target.data("context");
        var dataMember = target.data("member");
        var att = $(e.target).data("onbind");
        if (att != null) {
            var func = new Function("event", "context", "member", att);
            var returnValue = func.call(e.target, e, dataContext, dataMember);
            if (!e.isDefaultPrevented() && returnValue === false) {
                e.preventDefault();
                return;
            }
        }
        var bindings = parseBindings($(e.target).data("bindings"), getDefaultBindingTarget(e.target));
        if (bindings != null) {
            databind_bind(dataContext, e.target, bindings);
        }

        var children = target.children(":not(.Template)");

        var childDataContext = dataContext;
        if (childDataContext != null && dataMember != null)
            childDataContext = childDataContext[dataMember];

        children.toArray().forEach(function(t){
            var t2 = $(t);
            var ctx = t2.data("context");
            if(ctx==null || t2.data("inherited-context")==ctx){
                t2.data("context", childDataContext);
                t2.data("inherited-context", childDataContext);
            }
            else{
                console.log();
            }
        });
        children.databind();
    }



    function databind_bind(source, target, bindings) {
        if (bindings == null || target == null || source == null)
            return;
        Object.forEach(bindings, function (sourcePath, targetPath) {
            databind_tryCopy(source, sourcePath, target, targetPath);
        });
    }

    function databind_bindBack(source, target, bindings) {
        Object.forEach(bindings, function (sourcePath, targetPath) {
            databind_tryCopy(target, targetPath, source, sourcePath);
        });
    }

    function databind_tryCopy(source, sourcePath, target, targetPath){
        var value = Object.tryGet(source, sourcePath);
        Object.trySet(target, targetPath, value);
    }

    function document_databindback(e) {
        //console.log(e.type, e.target.nodeName, e.target.className);
        if (e.isDefaultPrevented())
            return;

        var target = $(e.target);
        var dataContext = target.data("context");
        var dataMember = target.data("member");
        var att = $(e.target).data("onbindback");

        if (att != null) {
            var func = new Function("event", "context", "member", att);
            var returnValue = func.call(e.target, e, dataContext, dataMember);
            if (!e.isDefaultPrevented() && returnValue === false) {
                e.preventDefault();
                return;
            }
        }
        var bindings = parseBindings($(e.target).data("bindings"), getDefaultBindingTarget(e.target));
        if (bindings != null) {
            databind_bindBack(dataContext, e.target, bindings);
        }

        target.children(":not(.Template)").databindback();
    }

    function getDefaultBindingTarget(el){
        if(el.nodeName=="INPUT"){
            if(["radio","checkbox"].contains(el.type))
                return "checked";
        }
        return "value";
    }


    function parseBindings(s, defaultTarget){
        if(s==null || s=="")
            return null;
        var pairs = s.split(';');
        var obj = {};
        pairs.forEach(function(pair){
            if(pair=="")
                return;
            var pair2 = pair.split(":");
            obj[pair2[0]] = pair2[1] || defaultTarget;
        });
        return obj;
    }
    
    $.databind = function(){
        $(document).databind();
    }
    $.fn.databind = function () {
        this.trigger("databind");
        return this;
    }

    $.fn.databindback = function () {
        this.trigger("databindback");
        return this;
    }
};
DataBindingPlugin();

