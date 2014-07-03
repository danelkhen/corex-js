using System;
using SharpKit.Html;
using SharpKit.JavaScript;
using SharpKit.jQuery;

namespace CorexJs.DataBinding
{
    [JsType(JsMode.Prototype, Filename = "~/res/databind.js")]//PreCode = "(function(){", PostCode = "})();", 
    public static class Plugin
    {
        public static jQuery databindflat(jQuery q)
        {
            triggerDataBindingEvent(q, "databind", new DataBindEventProps { flat = true }, "onbind", element_databind_default);
            return q;
        }
        public static jQuery databind(jQuery q)
        {
            triggerDataBindingEvent(q, "databind", null, "onbind", element_databind_default);
            return q;
        }


        public static jQuery databindback(jQuery q)
        {
            triggerDataBindingEvent(q, "databindback", null, "onbindback", element_databindback_default);
            return q;
        }

        public static jQuery addBinder(jQuery q, PathBinder binder)
        {
            var binders = q.ProcessAndGetDataAttribute("binders", evalBinders);
            //var binders = q.data("binders").As<JsArray<Binder>>();
            if (binders == null)
            {
                binders = new JsArray<PathBinder>();
                q.data("binders", binders);
            }
            binders.push(binder);
            return q;
        }

        public static jQuery set_datasource(jQuery q, object source)
        {
            return q.data("source", source);
        }

        public static object get_datasource(jQuery q)
        {
            return q.ProcessAndGetDataAttribute<object>("source", evalDataSource);
        }

        static T ProcessAndGetDataAttribute<T>(this jQuery q, JsString name, JsFunc<JsString, T> processor) where T :class
        {
            var x = q.data(name);
            if (x == null)
                return null;
            if (JsContext.JsTypeOf(x)== JsTypes.@string && q.attr("data-"+name)==x)
            {
                var value = processor(x.As<JsString>());
                q.data(name, value);
                return value;
            }
            return x.As<T>();
        }

        static JsArray<PathBinder> evalDataSource(JsString code)
        {
            if (!code.contains("return"))
                code = "return " + code;

            var ctx = new BindersContext();
            var func = new JsFunction(code);
            var res = func.call(null).As<JsArray<PathBinder>>();
            return res;
        }

        static JsArray<PathBinder> evalBinders(JsString code)
        {
            if (!code.contains("return"))
                code = "return " + code;

            var ctx = new BindersContext();
            code = "with(ctx){" + code + "}";
            var func = new JsFunction("ctx", code);
            var res = func.call(null, ctx).As<JsArray<PathBinder>>();
            return res;
        }
        static void element_setup_default(Event e)
        {
            var target = new jQuery(e.target);
            var binders2 = target.ProcessAndGetDataAttribute("bindings", parseBindings);
            var binders = target.ProcessAndGetDataAttribute("binders", evalBinders);
            if (binders2 != null)
            {
                if (binders == null)
                {
                    binders = new JsArray<PathBinder>();
                    target.data("binders", binders);
                }
                binders.addRange(binders2);
            }
        }

        static void element_teardown_default(Event e)
        {
            var target = new jQuery(e.target);
            var binders = target.data("binders").As<JsArray<PathBinder>>();
            if (binders != null)
            {
                binders.forEach(t => t.destroy(e));
                target.removeData("binders");
            }

        }

        static bool isinited(this jQuery target)
        {
            return target.data("databind-isinited").ExactEquals(true);
        }
        static void set_isinited(this jQuery target)
        {
            target.data("databind-isinited", true);
        }
        static void verifyInit(HtmlElement el)
        {
            var target = new jQuery(el);
            var isInited = target.isinited();
            if (!isInited)
            {
                target.set_isinited();
                triggerDataBindingEvent(target, "init", null, "oninit", element_setup_default);
            }
        }
        static void element_databind_default(Event e)
        {
            verifyInit(e.target);

            var target = new jQuery(e.target);
            HtmlContext.console.log(e.type, e.target.nodeName, e.target.className, JSON.stringify(target.datasource()));
            var dataSource = target.datasource();
            var dataMember = target.data("member").As<JsString>();

            var binders = target.data("binders").As<JsArray<PathBinder>>();
            if (binders != null)
            {
                binders.forEach(t => t.databind(e));
            }

            if (e.As<DataBindEventProps>().flat)
                return;

            var children = target.children(":not(.Template)");

            var childSource = dataSource;
            if (childSource != null && dataMember != null)
                childSource = childSource.As<JsObject>()[dataMember];

            children.toArray().forEach(t =>
            {
                var t2 = new jQuery(t);
                var ctx = t2.datasource();// ("source");
                if (ctx == null || t2.data("inherited-source") == ctx)
                {
                    t2.datasource(childSource);
                    t2.data("inherited-source", childSource);
                }
            });
            children.databind();
        }

        static void element_databindback_default(Event e)
        {
            verifyInit(e.target);

            var target = new jQuery(e.target);
            var dataSource = target.datasource();

            var binders = target.data("binders").As<JsArray<PathBinder>>();
            if (binders != null)
                binders.forEach(t => t.databindback(e));

            target.children(":not(.Template)").databindback();
        }



        static JsArray<PathBinder> parseBindings(JsString s)
        {
            return null;
            //var obj = parseStyleAttr(s);
            //if (obj == null)
            //    return null;
            //var list = new JsArray<Binder>();
            //obj.forEach((k, v) =>
            //{
            //    var tokens = v.split(' ');
            //    var options = new BinderOptions { sourcePath = tokens[0], targetPath = k };
            //    for (var i = 1; i < tokens.length; i++)
            //    {
            //        var token = tokens[i];
            //        var open = token.indexOf("(");
            //        var close = token.indexOf(")");
            //        if (open > 0 && close > open)
            //        {
            //            var name = token.substring(0, open);
            //            var values = token.substring(open + 1, close);
            //            options.As<JsObject>()[name] = values;
            //        }
            //        else
            //        {
            //            options.As<JsObject>()[token] = true;
            //        }
            //    }
            //    list.push(new Binder(options));
            //});
            //return list;
        }

        static JsObject<JsString> parseStyleAttr(JsString s)
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
                obj[pair2[0]] = pair2[1];
            });
            return obj;
        }

        static void triggerDataBindingEvent(jQuery q, JsString type, object props, JsString attrName, JsAction<Event> defaultBehavior)
        {
            q.each((i, el) =>
            {
                var ev = new Event(type, props);
                triggerDataBindingAttrEvent(ev, attrName, el);
                if (ev.isDefaultPrevented())
                    return;
                var target = new jQuery(el);
                target.triggerHandler(ev);
                if (ev.isDefaultPrevented())
                    return;
                defaultBehavior(ev);
            });
        }

        static void triggerDataBindingAttrEvent(Event e, JsString attrName, HtmlElement el)
        {
            var target = new jQuery(el);
            var context = new
            {
                source = target.datasource(),
                member = target.data("member").As<JsString>(),
            };
            e.target = el;
            triggerAttributeEvent(e, attrName, context);
        }

        static void triggerAttributeEvent(Event e, JsString attrName, object globalContext)
        {
            var target = new jQuery(e.target);
            var att = target.data(attrName).As<JsString>();
            if (att == null)
                return;
            JsFunction func = null;
            try
            {
                func = new JsFunction("event", "context", "with(context){" + att + "}");
            }
            catch(JsError ee)
            {
                HtmlContext.console.warn(ee, att);
                return;
            }
            var returnValue = func.call(e.target, e, globalContext);
            if (!e.isDefaultPrevented() && returnValue.ExactEquals(false))
                e.preventDefault();
        }



    }



    [JsType(JsMode.Prototype, Name = "BindingExt", Filename = "~/res/databind.js")]
    static class BindingExtensions
    {
        public static object tryGetByPath(this object obj, JsString path)
        {
            if (path == null || path == "")
                return obj;
            return obj.tryGet(path);
        }

    }


    [JsType(JsMode.Json)]
    class DataBindEventProps
    {
        public bool flat { get; set; }
    }

}


//[JsType(JsMode.Prototype, Name="BinderHelper", Filename ="res/databind.js")]
//class BinderHelper
//{
//    public static Binder twoWay(JsString sourcePath, JsString targetPath)
//    {
//        return new Binder
//        {
//            databind = e =>
//            {
//                var target = new jQuery(e.target);
//                var source = target.data("source");
//                DataBindingPlugin.databind_tryCopy(source, sourcePath, e.target, targetPath);
//            },
//            databindback = e =>
//            {
//                var target = new jQuery(e.target);
//                var source = target.data("source");
//                DataBindingPlugin.databind_tryCopy(e.target, targetPath, source, sourcePath);
//            }
//        };
//    }
//}
//static void databind_bind(object source, object target, JsArray<Binding> bindings)
//{
//    if (bindings == null || target == null || source == null)
//        return;
//    bindings.forEach(t =>
//    {
//        if (t.TargetPath == "children")
//            bindArrayToChildren(target, null, source.tryGetByPath(t.SourcePath));
//        else
//            databind_tryCopy(source, t.SourcePath, target, t.TargetPath);
//    });
//}

//static void databind_bindBack(object source, object target, JsArray<Binding> bindings)
//{
//    bindings.forEach(t =>
//    {
//        if (t.TargetPath == "children")
//        {
//        }
//        else
//        {
//            databind_tryCopy(target, t.TargetPath, source, t.SourcePath);
//        }
//    });
//}
