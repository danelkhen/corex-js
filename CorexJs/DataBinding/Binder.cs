﻿using SharpKit.Html;
using SharpKit.JavaScript;
using SharpKit.jQuery;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CorexJs.DataBinding
{
    [JsType(JsMode.Prototype, Filename = "~/res/databind.js")]
    class Binder
    {
        public Binder(BinderOptions options)
        {
            Options = options;
        }
        BinderOptions Options;

        public virtual void init(Event e)
        {
            if (Options.TargetPath == null)
                Options.TargetPath = getDefaultTargetPath(e.target);
            if (Options.BindBackOn != null && Options.BindBackOn.length > 0)
            {
                var target = new jQuery(e.target);
                target.on(Options.BindBackOn, databindback);
            }

        }

        public virtual void databind(Event e)
        {
            var target = new jQuery(e.target);
            var source = target.data("source");
            if (Options.TargetPath == "children")
                bindArrayToChildren(target, null, source.tryGetByPath(Options.SourcePath));
            else
                databind_tryCopy(source, Options.SourcePath, e.target, Options.TargetPath);
        }

        public virtual void databindback(Event e)
        {
            if (Options.OneWay)
                return;
            if (Options.TargetPath == "children")
                return;
            var target = new jQuery(e.target);
            var source = target.data("source");
            databind_tryCopy(e.target, Options.TargetPath, source, Options.SourcePath);
        }

        public virtual void destroy(Event e)
        {
            if (Options.BindBackOn != null && Options.BindBackOn.length > 0)
            {
                var target = new jQuery(e.target);
                target.off(Options.BindBackOn, databindback);
            }
        }

        static void databind_tryCopy(object source, JsString sourcePath, object target, JsString targetPath)
        {
            var value = source.tryGetByPath(sourcePath);
            JsObjectExt.trySet(target, targetPath, value);
        }

        static void bindArrayToChildren(object target, object template, object source)
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

        static void bindArrayToChildrenInternal(JsArray<object> source, jQuery target, JsArray<HtmlElement> children, JsFunc<object, jQuery> creator)
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
        static JsString getDefaultTargetPath(HtmlElement el)
        {
            if (el.nodeName == "INPUT")
            {
                if (new[] { "radio", "checkbox" }.AsJsArray().contains(el.As<HtmlInputElement>().type))
                    return "checked";
            }
            return "value";
        }


    }
}