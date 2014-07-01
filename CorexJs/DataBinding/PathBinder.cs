using SharpKit.Html;
using SharpKit.JavaScript;
using SharpKit.jQuery;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CorexJs.DataBinding
{
    [JsType(JsMode.Prototype, Name = "PathBinder", Filename = "~/res/databind.js")]
    public class PathBinder : PropertyBinder
    {
        public PathBinder(JsString source, JsString target, bool oneWay, JsString triggers)
        {
            this.sourcePath = source;
            this.targetPath = target;
            this.oneway = oneWay;
            this.triggers = triggers;
        }
        [JsMethod(Export = false)]
        public PathBinder()
        {

        }

        public JsString sourcePath { get; set; }
        public JsString targetPath { get; set; }
        public JsString triggers { get; set; }


        protected override void init(Event e)
        {
            base.init(e);
            if (targetPath.isNullOrEmpty())
                targetPath = getDefaultTargetPath(e.target);

            sourceProp = createProperty(sourcePath);
            targetProp = createProperty(targetPath);
            if (triggers != null && triggers.length > 0)
            {
                var target = new jQuery(e.target);
                target.on(triggers, onTrigger);
            }

        }

        Property createProperty(JsString path)
        {
            return new Property
            {
                get = t => t.tryGetByPath(path),
                set = (t, v) => t.trySet(path, v),
            };
        }
        protected virtual void onTrigger(Event e)
        {
            HtmlContext.console.log("Trigger: " + e.type);
            if (oneway)
                databind(e);
            else
                databindback(e);
        }

        public virtual void destroy(Event e)
        {
            if (triggers != null && triggers.length > 0)
            {
                var target = new jQuery(e.target);
                target.off(triggers, databindback);
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