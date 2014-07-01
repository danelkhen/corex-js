using SharpKit.JavaScript;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CorexJs.DataBinding
{
    [JsType(JsMode.Prototype, Filename = "~/res/databind.js", Name = "BindersContext")]
    class BindersContext
    {
        public Binder oneway(JsString source, JsString target)
        {
            return new Binder(source, target, true, null);
        }
        public Binder onewayonchange(JsString source, JsString target)
        {
            return new Binder(source, target, true, "change");
        }
        public Binder twoway(JsString source, JsString target)
        {
            return new Binder(source, target, false, null);
        }
        public Binder onchange(JsString source, JsString target = null)
        {
            return new Binder(source, target, false, "change");
        }
        public ChildrenBinder children(JsString source)
        {
            return new ChildrenBinder(source);
        }
    }
}