using SharpKit.Html;
using SharpKit.JavaScript;
using SharpKit.jQuery;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CorexJs.DataBinding
{
    [JsType(JsMode.Prototype, Name = "ChildrenBinder", Filename = "~/res/databind.js")]
    class ChildrenBinder : IBinder
    {
        JsString sourcePath;
        public ChildrenBinder(JsString sourcePath)
        {
            this.sourcePath = sourcePath;
        }

        public void databind(Event e)
        {
            var target = new jQuery(e.target);
            var source = target.data("source");
            bindArrayToChildren(target, null, source.tryGetByPath(sourcePath));
        }

        public void databindback(Event e)
        {
        }

        internal static void bindArrayToChildren(object target, object template, object source)
        {
            var list = source.As<JsArray<object>>();
            var el2 = new jQuery(target);
            var template2 = new jQuery(template);
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

        internal static void bindArrayToChildrenInternal(JsArray<object> source, jQuery target, JsArray<HtmlElement> children, JsFunc<object, jQuery> creator)
        {
            var index = 0;
            var index2 = 0;
            while (index2 < children.length)
            {
                var ch2 = new jQuery(children[index2]);
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

    }
}