using SharpKit.JavaScript;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using SharpKit.jQuery;

namespace CorexJs.DataBinding
{
    [JsType(JsMode.Prototype, Name = "ToggleClassBinder", Filename = "~/res/databind.js")]
    public class ToggleClassBinder : PathBinder
    {
        private JsString className;

        public ToggleClassBinder(JsString source, JsString className, bool oneWay, JsString triggers) : base(source, null, oneWay, triggers)
        {
            this.className = className;
        }

        protected override void init(Event e)
        {
            base.init(e);
            targetProp = new Property
            {
                get = t=>new jQuery(t).hasClass(className),
                set =(t,v) => new jQuery(t).toggleClass(className, v.As<bool>()),
            };
        }

    }
}