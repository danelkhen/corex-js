using SharpKit.JavaScript;
using System;

namespace corexjs
{
    [JsType(JsMode.Prototype, Export = false, Name = "Date")]
    public class JsDateEx : JsDate
    {
        public static JsDateEx create(JsNumber y = null, JsNumber M = null, JsNumber d = null, JsNumber h = null, JsNumber m = null, JsNumber s = null, JsNumber f = null) { return null; }

        public JsDateEx(JsString s)
        {
        }

        public static JsDateEx tryParseExact(string p1, string p2)
        {
            throw new NotImplementedException();
        }
        public static JsDateEx tryParseExact(string p1, JsArray<JsString> p2) { return null; }

        public static JsDateEx today()
        {
            return null;
        }


        public JsDateEx subtract(JsDateEx jsDateEx)
        {
            throw new NotImplementedException();
        }

        public int totalDays()
        {
            throw new NotImplementedException();
        }

        public JsString format(string p)
        {
            throw new NotImplementedException();
        }

        public static JsDateEx current()
        {
            throw new NotImplementedException();
        }

        public JsDateEx addDays(int p)
        {
            throw new NotImplementedException();
        }
        public JsDateEx addYears(int p)
        {
            throw new NotImplementedException();
        }
        public JsDateEx addMonths(int p)
        {
            throw new NotImplementedException();
        }

        public bool equals(JsDateEx x)
        {
            throw new NotImplementedException();
        }

        public JsDateEx removeTime()
        {
            throw new NotImplementedException();
        }

        public int compareTo(JsDateEx startDate)
        {
            throw new NotImplementedException();
        }


        [JsProperty(NativeProperty = false)]
        public JsNumber Year
        {
            [JsMethod(Name = "year")]
            get;
            [JsMethod(Name = "year")]
            set;
        }
        [JsProperty(NativeProperty = false)]
        public JsNumber Month
        {
            [JsMethod(Name = "month")]
            get;
            [JsMethod(Name = "month")]
            set;
        }
        [JsProperty(NativeProperty = false)]
        public JsNumber Day
        {
            [JsMethod(Name = "day")]
            get;
            [JsMethod(Name = "day")]
            set;
        }

        public static JsDateEx fromUnix(JsNumber epoch)
        {
            throw new NotImplementedException();
        }

    }
}
