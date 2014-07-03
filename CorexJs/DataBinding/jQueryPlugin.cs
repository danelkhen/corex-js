using SharpKit.Html;
using SharpKit.JavaScript;
using SharpKit.jQuery;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CorexJs.DataBinding
{

    [JsType(JsMode.Prototype, Name = "$", PrototypeName = "fn", OmitDefaultConstructor = true, OmitInheritance = true, Filename = "~/res/databind.js")]
    class jQueryPlugin : jQuery
    {
        public jQuery databind() { return Plugin.databind(this); }
        public jQuery databindflat() { return Plugin.databindflat(this); }

        public jQuery databindback() { return Plugin.databindback(this); }
        public jQuery addBinder(PathBinder binder) { return Plugin.addBinder(this, binder); }

        public jQuery dataparent()
        {
            var source = this.data("source");
            jQuery prev = this;
            jQuery el = this.parent();
            while (el.length > 0)
            {
                if (el.data("source") != source)
                    break;
                prev = el;
                el = el.parent();
            }
            return prev;
        }
        public object datasource(object source = null)
        {
            if (JsContext.arguments.length == 0)
                return Plugin.get_datasource(this);
            return Plugin.set_datasource(this, source);
        }
        public jQuery wheredatasource(object obj)
        {
            return this.filter((i, el) => new jQuery(el).datasource() == obj);
        }
    }

    [JsType(JsMode.Prototype, Export = false)]
    static class jQueryDataBindingPluginExtension
    {
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static jQuery databind(this jQuery j) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static jQuery databindback(this jQuery j) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static jQuery dataparent(this jQuery j) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static object datasource(this jQuery j) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static jQuery datasource(this jQuery j, object source=null) { return null; }
    }


}