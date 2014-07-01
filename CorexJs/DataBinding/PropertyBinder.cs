using SharpKit.Html;
using SharpKit.JavaScript;
using SharpKit.jQuery;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CorexJs.DataBinding
{
    [JsType(JsMode.Prototype, Name = "PropertyBinder", Filename = "~/res/databind.js")]
    public class PropertyBinder : IBinder
    {
        public PropertyBinder(Property source, Property target, bool oneway)
        {
            this.sourceProp = source;
            this.targetProp = target;
            this.oneway = oneway;
        }
        public PropertyBinder()
        {

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
        }

        public bool oneway { get;set; }
        public Property sourceProp { get; set; }
        public Property targetProp { get;set; }
        public virtual void databind(Event e)
        {
            verifyInit(e);
            var target = new jQuery(e.target);
            var source = target.data("source");
            var value = sourceProp.get(source);
            targetProp.set(e.target, value);
            //HtmlContext.console.log("databind: source." + sourcePath + " -> source." + targetPath + " = ", e.target.tryGetByPath(targetPath));
        }

        public virtual void databindback(Event e)
        {
            if (oneway)
                return;
            verifyInit(e);
            var target = new jQuery(e.target);
            var source = target.data("source");

            var value = targetProp.get(e.target);
            sourceProp.set(source, value);

            //HtmlContext.console.log("databindback: target." + targetPath + " -> source." + sourcePath + " = ", source.tryGetByPath(sourcePath));
        }

    }



    [JsType(JsMode.Json)]
    public class Property
    {
        public JsFunc<object, object> get { get; set; }
        public JsAction<object, object> set { get; set; }
    }


}