using System;
using SharpKit.Html;
using SharpKit.JavaScript;
using SharpKit.jQuery;

namespace CorexJs.DataBinding
{
    [JsType(JsMode.Prototype, Filename = "~/res/databind.js")]//PreCode = "(function(){", PostCode = "})();", 
    public static class Plugin
    {
        public static jQuery databind(jQuery q)
        {
            triggerDataBindingEvent(q, "databind", "onbind", element_databind_default);
            return q;
        }

        public static jQuery databindback(jQuery q)
        {
            triggerDataBindingEvent(q, "databindback", "onbindback", element_databindback_default);
            return q;
        }


        static T ProcessAndGetDataAttribute<T>(this jQuery q, JsString name, JsFunc<JsString, T> processor) where T :class
        {
            var x = q.data(name);
            if (x == null)
                return null;
            if (JsContext.JsTypeOf(x)== JsTypes.@string)
            {
                var value = processor(x.As<JsString>());
                q.data(name, value);
                return value;
            }
            return x.As<T>();
        }
        static void element_setup_default(Event e)
        {
            var target = new jQuery(e.target);
            var bindings = getBindings(e.target);
            var binders = target.ProcessAndGetDataAttribute("binders", s=>new JsFunction(s).call().As<JsArray<Binder>>());
            if (bindings != null)
            {
                var binders2 = bindings.map(t => new Binder(new BinderOptions { SourcePath = t.SourcePath, TargetPath = t.TargetPath }));
                if (binders == null)
                {
                    binders = new JsArray<Binder>();
                    target.data("binders", binders);
                }
                binders.addRange(binders2);
                binders.forEach(t => t.init(e));
            }
        }

        static void element_teardown_default(Event e)
        {
            var target = new jQuery(e.target);
            var binders = target.data("binders").As<JsArray<Binder>>();
            if (binders != null)
            {
                binders.forEach(t => t.destroy(e));
                target.removeData("binders");
            }

        }

        static void verifyInit(Event e)
        {
            var target = new jQuery(e.target);
            var isInited = target.data("databind-isinited").ExactEquals(true);
            if (!isInited)
                triggerDataBindingEvent(target, "setup", "onsetup", element_setup_default);
        }
        static void element_databind_default(Event e)
        {
            verifyInit(e);

            //console.log(e.type, e.target.nodeName, e.target.className, JSON.stringify(J(e.target).data("source")));
            var target = new jQuery(e.target);
            var dataSource = target.data("source");
            var dataMember = target.data("member").As<JsString>();

            verifyInit(e);

            var binders = target.data("binders").As<JsArray<Binder>>();
            if (binders != null)
            {
                binders.forEach(t => t.databind(e));
            }

            var children = target.children(":not(.Template)");

            var childSource = dataSource;
            if (childSource != null && dataMember != null)
                childSource = childSource.As<JsObject>()[dataMember];

            children.toArray().forEach(t =>
            {
                var t2 = new jQuery(t);
                var ctx = t2.data("source");
                if (ctx == null || t2.data("inherited-source") == ctx)
                {
                    t2.data("source", childSource);
                    t2.data("inherited-source", childSource);
                }
            });
            children.databind();
        }

        static void element_databindback_default(Event e)
        {
            verifyInit(e);

            var target = new jQuery(e.target);
            var dataSource = target.data("source");

            var binders = target.data("binders").As<JsArray<Binder>>();
            if (binders != null)
                binders.forEach(t => t.databindback(e));

            target.children(":not(.Template)").databindback();
        }


        static JsArray<Binding> getBindings(HtmlElement el)
        {
            return new jQuery(el).ProcessAndGetDataAttribute("bindings", parseStyleAttr);
            //var bindings = parseStyleAttr(new jQuery(el).data("bindings").As<JsString>());
            //return bindings;
        }

        static JsArray<Binding> parseStyleAttr(JsString s)
        {
            if (s == null || s == "")
                return null;
            var pairs = s.split(';');
            var list = new JsArray<Binding>();
            pairs.forEach(pair =>
            {
                if (pair == "")
                    return;
                var pair2 = pair.split(":");
                var b = new Binding
                {
                    SourcePath = pair2[0],
                    TargetPath = pair2[1]
                };
                list.Add(b);
            });
            return list;
        }


        static void triggerDataBindingEvent(jQuery q, JsString type, JsString attrName, JsAction<Event> defaultBehavior)
        {
            q.each((i, el) =>
            {
                var ev = new Event(type);
                var target = new jQuery(el);
                triggerDataBindingAttrEvent(ev, attrName, target);
                if (ev.isDefaultPrevented())
                    return;
                target.triggerHandler(ev);
                if (ev.isDefaultPrevented())
                    return;
                defaultBehavior(ev);
            });
        }

        static void triggerDataBindingAttrEvent(Event e, JsString attrName, jQuery target)
        {
            var context = new
            {
                source = target.data("source"),
                member = target.data("member").As<JsString>(),
            };
            triggerAttributeEvent(e, attrName, context);
        }

        static void triggerAttributeEvent(Event e, JsString attrName, object globalContext)
        {
            var att = new jQuery(e.target).data(attrName).As<JsString>();
            if (att == null)
                return;
            var func = new JsFunction("event", "context", "with(context){"+att+"}");
            var returnValue = func.call(e.target, e, globalContext);
            if (!e.isDefaultPrevented() && returnValue.ExactEquals(false))
                e.preventDefault();
        }



    }



    [JsType(JsMode.Json)]
    class BinderOptions
    {
        public bool OneWay { get; set; }
        public JsString SourcePath { get; set; }
        public JsString TargetPath { get; set; }
        public JsString BindBackOn { get; set; }
    }

    [JsType(JsMode.Json)]
    class Binding
    {
        public JsString SourcePath { get; set; }
        public JsString TargetPath { get; set; }
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
