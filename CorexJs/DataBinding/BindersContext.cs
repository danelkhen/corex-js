using SharpKit.JavaScript;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CorexJs.DataBinding
{
    [JsType(JsMode.Prototype, Filename = "~/res/databind.js")]
    class BindersContext
    {
        /*
            a->b
            a<->b
            a-->b
            a<-->b
        */
        public IBinder @default(JsString s)
        {
            if (s.contains("-->"))
            {
                var tokens = s.split("-->");
                return children(tokens[0]);
            }
            else if (s.contains("<->"))
            {
                var tokens = s.split("<->");
                return twoway(tokens[0], tokens[1]);
            }
            else if (s.contains("->"))
            {
                var tokens = s.split("->");
                return oneway(tokens[0], tokens[1]);
            }
            else
            {
                var tokens = s.split("->");
                return oneway(tokens[0], tokens[1]);
            }
        }
        public PathBinder oneway(JsString source, JsString target)
        {
            return new PathBinder(source, target, true, null);
        }
        public PathBinder onewayonchange(JsString source, JsString target)
        {
            return new PathBinder(source, target, true, "change");
        }
        public PathBinder twoway(JsString source, JsString target)
        {
            return new PathBinder(source, target, false, null);
        }
        public PathBinder onchange(JsString source, JsString target = null)
        {
            return new PathBinder(source, target, false, "change");
        }
        public ChildrenBinder children(JsString source)
        {
            return new ChildrenBinder(source);
        }
        public ToggleClassBinder toggleclass(JsString source, JsString className, bool oneway, JsString triggers)
        {
            return new ToggleClassBinder(source, className, oneway, triggers);
        }
        public ToggleClassBinder toggleclassoneway(JsString source, JsString className, JsString triggers)
        {
            return new ToggleClassBinder(source, className, true, triggers);
        }
    }
}