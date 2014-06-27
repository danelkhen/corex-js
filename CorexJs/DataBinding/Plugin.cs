using System;
using SharpKit.Html;
using SharpKit.JavaScript;
using SharpKit.jQuery;

namespace CorexJs.DataBinding
{
    [JsType(JsMode.Prototype, Filename = "res/databind.js")]//PreCode = "(function(){", PostCode = "})();", 
    public class Plugin
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


        static void element_setup_default(Event e)
        {
            var bindings = getBindings(e.target);
            if (bindings != null)
            {
                var binders = bindings.map(t => new Binder(new BinderOptions { SourcePath = t.SourcePath, TargetPath = t.TargetPath }));
                var target = new jQuery(e.target);
                target.data("_binders", binders);
                binders.forEach(t => t.init(e));
            }
        }

        static void element_teardown_default(Event e)
        {
            var target = new jQuery(e.target);
            var binders = target.data("_binders").As<JsArray<Binder>>();
            if (binders != null)
            {
                binders.forEach(t => t.destroy(e));
                target.removeData("_binders");
            }

        }

        static void element_databind_default(Event e)
        {
            //console.log(e.type, e.target.nodeName, e.target.className, JSON.stringify(J(e.target).data("source")));
            var target = new jQuery(e.target);
            var dataSource = target.data("source");
            var dataMember = target.data("member").As<JsString>();

            var isInited = target.data("databind-isinited").ExactEquals(true);
            if (!isInited)
                triggerDataBindingEvent(target, "setup", "onsetup", element_setup_default);


            var binders = target.data("_binders").As<JsArray<Binder>>();
            if (binders != null)
            {
                binders.forEach(t => t.databind(e));
            }

            ////triggerAttributeEvent(e, "onbind", source, member);
            ////if (e.isDefaultPrevented())
            ////    return;

            //var bindings = getBindings(e.target);
            //if (bindings != null)
            //    databind_bind(dataSource, e.target, bindings);

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
            var target = new jQuery(e.target);
            var dataSource = target.data("source");

            var binders = target.data("_binders").As<JsArray<Binder>>();
            if (binders != null)
            {
                binders.forEach(t => t.databindback(e));
            }
            //var bindings = getBindings(e.target);
            //if (bindings != null)
            //    databind_bindBack(dataSource, e.target, bindings);

            target.children(":not(.Template)").databindback();
        }


        static JsArray<Binding> getBindings(HtmlElement el)
        {
            var bindings = parseBindings(new jQuery(el).data("bindings").As<JsString>(), null);
            return bindings;
        }

        static JsArray<Binding> parseBindings(JsString s, JsString defaultTarget)
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
                    TargetPath = pair2[1] ?? defaultTarget
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
            var source = target.data("source");
            var member = target.data("member").As<JsString>();
            triggerAttributeEvent(e, attrName, source, member);
        }

        static void triggerAttributeEvent(Event e, JsString attrName, object source, JsString member)
        {
            var att = new jQuery(e.target).data(attrName).As<JsString>();
            if (att == null)
                return;
            var func = new JsFunction("event", "source", "member", "target", att);
            var returnValue = func.call(e.target, e, source, member, e.target);
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


    [JsType(JsMode.Prototype, Name = "BindingExt", Filename = "res/databind.js")]
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
