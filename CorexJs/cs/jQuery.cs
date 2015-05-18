using SharpKit.JavaScript;
using SharpKit.jQuery;

namespace corexjs
{
    [JsType(JsMode.Prototype, Export=false)]//Filename = "~/js/corex-jquery.js")]
    public static class jQueryExtensions
    {
        [JsMethod(InlineCodeExpression = "j.data('DataItem')")]
        public static T DataItem<T>(this jQuery j)
        {
            return j.data("DataItem").As<T>();
        }
    }
}
