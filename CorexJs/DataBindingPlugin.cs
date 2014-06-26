using SharpKit.Html;
using SharpKit.JavaScript;
using SharpKit.jQuery;

namespace CorexJs
{
    [JsType(JsMode.Global, PreCode ="(function(){", PostCode ="})();", Filename="res/databind.js")]
    public class DataBindingPlugin : jQueryContext
    {

        static DataBindingPlugin()
        {
            init();
        }
        public static void init()
        {
            J(document).on("databind", document_databind);
            J(document).on("databindback", document_databindback);
        }

        public static void document_databind(Event e)
        {
            //console.log(e.type, e.target.nodeName, e.target.className, JSON.stringify(J(e.target).data("context")));
            if (e.isDefaultPrevented())
                return;

            var target = J(e.target);
            var dataContext = target.data("context");
            var dataMember = target.data("member").As<JsString>();
            var att = J(e.target).data("onbind").As<JsString>();
            if (att != null)
            {
                var func = new JsFunction("event", "context", "member", att);
                var returnValue = func.call(e.target, e, dataContext, dataMember);
                if (!e.isDefaultPrevented() && returnValue.ExactEquals(false))
                {
                    e.preventDefault();
                    return;
                }
            }
            var bindings = parseBindings(J(e.target).data("bindings").As<JsString>(), getDefaultBindingTarget(e.target));
            if (bindings != null)
            {
                databind_bind(dataContext, e.target, bindings);
            }

            var children = target.children(":not(.Template)");

            var childDataContext = dataContext;
            if (childDataContext != null && dataMember != null)
                childDataContext = childDataContext.As<JsObject>()[dataMember];

            children.toArray().forEach(t =>
            {
                var t2 = J(t);
                var ctx = t2.data("context");
                if (ctx == null || t2.data("inherited-context") == ctx)
                {
                    t2.data("context", childDataContext);
                    t2.data("inherited-context", childDataContext);
                }
                else
                {
                    console.log();
                }
            });
            children.databind();
        }

        public static void databind_bind(object source, object target, JsObject<JsString> bindings)
        {
            if (bindings == null || target == null || source == null)
                return;
            JsObjectExt.forEach(bindings, (sourcePath, targetPath) =>
            {
                if (targetPath == "children")
                {
                    bindArrayToChildren(target, null, JsObjectExt.tryGet(source, sourcePath));
                }
                else
                {
                    databind_tryCopy(source, sourcePath, target, targetPath);
                }
            });
        }

        public static void databind_bindBack(object source, object target, JsObject<JsString> bindings)
        {
            JsObjectExt.forEach(bindings, (sourcePath, targetPath) =>
            {
                databind_tryCopy(target, targetPath, source, sourcePath);
            });
        }

        public static void databind_tryCopy(object source, JsString sourcePath, object target, JsString targetPath)
        {
            var value = JsObjectExt.tryGet(source, sourcePath);
            JsObjectExt.trySet(target, targetPath, value);
        }

        public static void document_databindback(Event e)
        {
            //console.log(e.type, e.target.nodeName, e.target.className);
            if (e.isDefaultPrevented())
                return;

            var target = J(e.target);
            var dataContext = target.data("context");
            var dataMember = target.data("member");
            var att = J(e.target).data("onbindback").As<JsString>();

            if (att != null)
            {
                var func = new JsFunction("event", "context", "member", att);
                var returnValue = func.call(e.target, e, dataContext, dataMember);
                if (!e.isDefaultPrevented() && returnValue.ExactEquals(false))
                {
                    e.preventDefault();
                    return;
                }
            }
            var bindings = parseBindings(J(e.target).data("bindings").As<JsString>(), getDefaultBindingTarget(e.target));
            if (bindings != null)
            {
                databind_bindBack(dataContext, e.target, bindings);
            }

            target.children(":not(.Template)").databindback();
        }

        public static void bindArrayToChildren(object el, object template, object context)
        {
            var list = context.As<JsArray<object>>();
            var el2 = J(el);
            var template2 = J(template);
            if (template2.length == 0)
                template2 = el2.find(".Template:first");
            if (template2.length == 0)
                return;
            if (list == null)
                list = el2.data("context").As<JsArray<object>>();
            if (!(list is JsArray<object>))
                return;
            var children = el2.children(":not(.Template)").toArray();

            JsFunc<object, jQuery> createTemplate = t =>
            {
                return template2.clone(true).removeClass("Template").data("context", t);
            };
            var index = 0;
            var index2 = 0;
            while (index2 < children.length)
            {
                var ch2 = J(children[index2]);
                var dc2 = ch2.data("context");
                if (dc2 == null)
                    continue;
                var dc = list[index];
                if (dc != dc2)
                {
                    if (dc == null)
                    {
                        ch2.remove();
                        index2++;
                        continue;
                    }
                    else
                    {
                        var ch3 = createTemplate(dc);
                        ch3.insertBefore(ch2);
                        index++;
                        continue;
                    }
                }
                index2++;
                index++;
            }
            while (index < list.length)
            {
                el2.append(createTemplate(list[index]));
                index++;
            }
        }

        public static JsString getDefaultBindingTarget(HtmlElement el)
        {
            if (el.nodeName == "INPUT")
            {
                if (new[] { "radio", "checkbox" }.AsJsArray().contains(el.As<HtmlInputElement>().type))
                    return "checked";
            }
            return "value";
        }


        public static JsObject<JsString> parseBindings(JsString s, JsString defaultTarget)
        {
            if (s == null || s == "")
                return null;
            var pairs = s.split(';');
            var obj = new JsObject<JsString>();
            pairs.forEach(pair =>
            {
                if (pair == "")
                    return;
                var pair2 = pair.split(":");
                obj[pair2[0]] = pair2[1] ?? defaultTarget;
            });
            return obj;
        }


        [JsType(JsMode.Prototype, Name = "$", OmitDefaultConstructor = true, OmitInheritance = true, Filename = "res/databind.js", PrototypeName ="fn")]
        class Plugin : jQuery
        {
            public jQuery databind()
            {
                this.trigger("databind");
                return this;
            }

            public jQuery databindback()
            {
                this.trigger("databindback");
                return this;
            }
        }


    }

    [JsType(JsMode.Prototype, Export =false)]
    static class jQueryDataBindingPluginExtension
    {
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static jQuery databind(this jQuery j) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static jQuery databindback(this jQuery j) { return null; }
    }

}