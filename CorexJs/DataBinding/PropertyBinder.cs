using SharpKit.Html;
using SharpKit.JavaScript;
using SharpKit.jQuery;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CorexJs.DataBinding
{
    [JsType(JsMode.Prototype, Filename = "~/res/databind.js")]
    public class PropertyBinder : BaseBinder
    {
        public PropertyBinder(Property source, Property target, bool oneway) : base(oneway)
        {
            this.sourceProp = source;
            this.targetProp = target;
            this.oneway = oneway;
        }
        [JsMethod(Export = false)]
        public PropertyBinder()
        {

        }


        public Property sourceProp { get; set; }
        public Property targetProp { get;set; }

        protected override void onTransfer(object source, HtmlElement target)
        {
            var value = sourceProp.get(source);
            targetProp.set(target, value);
            HtmlContext.console.log("onTransfer", source, target, value);
        }

        protected override void onTransferBack(object source, HtmlElement target)
        {
            var value = targetProp.get(target);
            sourceProp.set(source, value);
            HtmlContext.console.log("onTransferBack", source, target, value);
        }


    }



    [JsType(JsMode.Json)]
    public class Property
    {
        public JsFunc<object, object> get { get; set; }
        public JsAction<object, object> set { get; set; }
    }





}