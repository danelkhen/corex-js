using SharpKit.JavaScript;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CorexJs.DataBinding
{

    [JsType(JsMode.Json)]
    public class Property
    {
        public JsFunc<object, object> get { get; set; }
        public JsAction<object, object> set { get; set; }
    }
}