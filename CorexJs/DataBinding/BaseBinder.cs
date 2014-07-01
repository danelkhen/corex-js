using SharpKit.Html;
using SharpKit.JavaScript;
using SharpKit.jQuery;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CorexJs.DataBinding
{
    [JsType(JsMode.Prototype, Name = "BaseBinder", Filename = "~/res/databind.js")]
    public class BaseBinder : IBinder
    {
        public BaseBinder(bool oneway)
        {
            this.oneway = oneway;
        }
        [JsMethod(Export =false)]
        public BaseBinder()
        {

        }
        private bool inited;

        protected virtual void verifyInit(Event e)
        {
            if (inited)
                return;
            init(e);
        }

        protected virtual void init(Event e)
        {
            if (inited)
            {
                HtmlContext.console.log("already inited");
                return;
            }
            inited = true;
        }

        public bool oneway { get; set; }
        public virtual void databind(Event e)
        {
            verifyInit(e);
            var target = new jQuery(e.target);
            var source = target.data("source");
            onTransfer(source, e.target);
        }

        public virtual void databindback(Event e)
        {
            if (oneway)
                return;
            verifyInit(e);
            var target = new jQuery(e.target);
            var source = target.data("source");
            onTransferBack(source, e.target);

            //HtmlContext.console.log("databindback: target." + targetPath + " -> source." + sourcePath + " = ", source.tryGetByPath(sourcePath));
        }


        protected virtual void onTransfer(object source, HtmlElement target)
        {
        }
        protected virtual void onTransferBack(object source, HtmlElement target)
        {
        }

    }
}