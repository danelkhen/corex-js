using SharpKit.JavaScript;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace tidytree
{

    [JsType(JsMode.Json)]
    public class Point
    {
        public JsNumber X { get; set; }
        public JsNumber Y { get; set; }

    }

    [JsType(JsMode.Json)]
    public class Rectangle
    {
        public JsNumber X { get; set; }
        public JsNumber Y { get; set; }
        public JsNumber Width { get; set; }
        public JsNumber Height { get; set; }
    }


}

