using SharpKit.Html;
using SharpKit.JavaScript;
using SharpKit.jQuery;

namespace CorexJs
{
    [JsType(JsMode.Prototype, Name = "DataBindingPlugin", Filename = "res/databind.js")]//PreCode = "(function(){", PostCode = "})();", 
    public class DataBindingPlugin : jQueryContext
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


        static void element_databind_default(Event e)
        {
            //console.log(e.type, e.target.nodeName, e.target.className, JSON.stringify(J(e.target).data("source")));
            var target = J(e.target);
            var dataSource = target.data("source");
            var dataMember = target.data("member").As<JsString>();

            //triggerAttributeEvent(e, "onbind", source, member);
            //if (e.isDefaultPrevented())
            //    return;

            var bindings = getBindings(e.target);
            if (bindings != null)
                databind_bind(dataSource, e.target, bindings);

            var children = target.children(":not(.Template)");

            var childSource = dataSource;
            if (childSource != null && dataMember != null)
                childSource = childSource.As<JsObject>()[dataMember];

            children.toArray().forEach(t =>
            {
                var t2 = J(t);
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
            var target = J(e.target);
            var dataSource = target.data("source");

            var bindings = getBindings(e.target);
            if (bindings != null)
                databind_bindBack(dataSource, e.target, bindings);

            target.children(":not(.Template)").databindback();
        }

        static void databind_bind(object source, object target, JsArray<Binding> bindings)
        {
            if (bindings == null || target == null || source == null)
                return;
            bindings.forEach(t =>
            {
                if (t.TargetPath == "children")
                    bindArrayToChildren(target, null, source.tryGetByPath(t.SourcePath));
                else
                    databind_tryCopy(source, t.SourcePath, target, t.TargetPath);
            });
        }

        static void databind_bindBack(object source, object target, JsArray<Binding> bindings)
        {
            bindings.forEach(t =>
            {
                if (t.TargetPath == "children")
                {
                }
                else
                {
                    databind_tryCopy(target, t.TargetPath, source, t.SourcePath);
                }
            });
        }

        static void databind_tryCopy(object source, JsString sourcePath, object target, JsString targetPath)
        {
            var value = source.tryGetByPath(sourcePath);
            JsObjectExt.trySet(target, targetPath, value);
        }

        static void bindArrayToChildren(object target, object template, object source)
        {
            var list = source.As<JsArray<object>>();
            var el2 = J(target);
            var template2 = J(template);
            if (template2.length == 0)
                template2 = el2.find(".Template:first");
            if (template2.length == 0)
                return;
            if (list == null)
                list = el2.data("source").As<JsArray<object>>();
            if (!(list is JsArray<object>))
                return;
            var children = el2.children(":not(.Template)").toArray();

            JsFunc<object, jQuery> createTemplate = t => template2.clone(true).removeClass("Template").data("source", t);

            bindArrayToChildrenInternal(list, el2, children, createTemplate);
        }

        static void bindArrayToChildrenInternal(JsArray<object> source, jQuery target, JsArray<HtmlElement> children, JsFunc<object, jQuery> creator)
        {
            var index = 0;
            var index2 = 0;
            while (index2 < children.length)
            {
                var ch2 = J(children[index2]);
                var dc2 = ch2.data("source");
                if (dc2 == null)
                {
                    index2++;
                    continue;
                }
                var dc = source[index];
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
                        var ch3 = creator(dc);
                        ch3.insertBefore(ch2);
                        index++;
                        continue;
                    }
                }
                index2++;
                index++;
            }
            while (index < source.length)
            {
                target.append(creator(source[index]));
                index++;
            }
        }

        static JsArray<Binding> getBindings(HtmlElement el)
        {
            var bindings = parseBindings(J(el).data("bindings").As<JsString>(), getDefaultBindingTarget(el));
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

        static JsString getDefaultBindingTarget(HtmlElement el)
        {
            if (el.nodeName == "INPUT")
            {
                if (new[] { "radio", "checkbox" }.AsJsArray().contains(el.As<HtmlInputElement>().type))
                    return "checked";
            }
            return "value";
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
            var att = J(e.target).data(attrName).As<JsString>();
            if (att == null)
                return;
            var func = new JsFunction("event", "source", "member", "target", att);
            var returnValue = func.call(e.target, e, source, member, e.target);
            if (!e.isDefaultPrevented() && returnValue.ExactEquals(false))
                e.preventDefault();
        }



    }

    [JsType(JsMode.Prototype, Name = "$", PrototypeName = "fn", OmitDefaultConstructor = true, OmitInheritance = true, Filename = "res/databind.js")]
    class Plugin : jQuery
    {
        public jQuery databind() { return DataBindingPlugin.databind(this); }

        public jQuery databindback() { return DataBindingPlugin.databindback(this); }
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
    [JsType(JsMode.Prototype, Export = false)]
    static class jQueryDataBindingPluginExtension
    {
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static jQuery databind(this jQuery j) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static jQuery databindback(this jQuery j) { return null; }
    }

}