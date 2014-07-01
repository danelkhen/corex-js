using SharpKit.Html;
using SharpKit.JavaScript;
using SharpKit.jQuery;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CorexJs.DataBinding
{
    [JsType(JsMode.Prototype, Export=false)]
    public interface IBinder
    {
        void databind(Event e);
        void databindback(Event e);
    }
    [JsType(JsMode.Prototype, Name = "Binder", Filename = "~/res/databind.js")]
    public class Binder : IBinder
    {
        public Binder(JsString source, JsString target, bool oneWay, JsString triggers)
        {
            this.sourcePath = source;
            this.targetPath = target;
            this.oneway = oneWay;
            this.triggers = triggers;
        }

        private bool IsInited;

        protected virtual void verifyInit(Event e)
        {
            if (IsInited)
                return;
            init(e);
        }

        protected virtual void init(Event e)
        {
            if (IsInited)
            {
                HtmlContext.console.log("already inited");
                return;
            }
            IsInited = true;
            if (targetPath.isNullOrEmpty())
                targetPath = getDefaultTargetPath(e.target);
            if (triggers != null && triggers.length > 0)
            {
                var target = new jQuery(e.target);
                target.on(triggers, onTrigger);
            }

        }
        protected virtual void onTrigger(Event e)
        {
            HtmlContext.console.log("Trigger: " + e.type);
            if (oneway)
                databind(e);
            else
                databindback(e);
        }
        public virtual void databind(Event e)
        {
            verifyInit(e);
            var target = new jQuery(e.target);
            var source = target.data("source");
            databind_tryCopy(source, sourcePath, e.target, targetPath);
            HtmlContext.console.log("databind: source." + sourcePath + " -> source." + targetPath + " = ", e.target.tryGetByPath(targetPath));
        }

        public virtual void databindback(Event e)
        {
            if (oneway)
                return;
            verifyInit(e);
            var target = new jQuery(e.target);
            var source = target.data("source");
            databind_tryCopy(e.target, targetPath, source, sourcePath);
            HtmlContext.console.log("databindback: target." + targetPath + " -> source." + sourcePath +" = ", source.tryGetByPath(sourcePath));
        }

        public virtual void destroy(Event e)
        {
            if (triggers != null && triggers.length > 0)
            {
                var target = new jQuery(e.target);
                target.off(triggers, databindback);
            }
        }

        static void databind_tryCopy(object source, JsString sourcePath, object target, JsString targetPath)
        {
            var value = source.tryGetByPath(sourcePath);
            JsObjectExt.trySet(target, targetPath, value);
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
        public bool oneway { get; set; }
        public JsString sourcePath { get; set; }
        public JsString targetPath { get; set; }
        public JsString triggers { get; set; }


    }




}