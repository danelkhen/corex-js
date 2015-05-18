using SharpKit.Html;
using SharpKit.JavaScript;

namespace SharpKit.jQuery
{
    [JsType(JsMode.Prototype, Export=false)]//Filename = "~/js/corex-jquery.js")]
    public static class jQueryExtensions
    {
        [JsMethod(InlineCodeExpression = "$(el)")]
        public static jQuery ToJ(this HtmlElement el) { return null; }
        [JsMethod(InlineCodeExpression = "$(s)")]
        public static jQuery ToJ(this JsString s) { return null; }
        [JsMethod(InlineCodeExpression = "$(s)")]
        public static jQuery ToJ(this string s) { return null; }
        [JsMethod(InlineCodeExpression = "j.data('DataItem')")]
        public static T DataItem<T>(this jQuery j)
        {
            return j.data("DataItem").As<T>();
        }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static jQuery getAppend(this jQuery j, JsString selector) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static jQuery getAppendRemove(this jQuery j, JsString selector, JsNumber total) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static jQuery getAppendRemove(this jQuery j, JsString selector, bool condition) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static jQuery tab(this jQuery j, JsString cmd) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static jQuery bindChildrenToList<T>(this jQuery j, JsString selector, JsArray<T> list, JsAction<jQuery, T> action) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static jQuery getAppendRemoveForEach<T>(this jQuery j, JsString selector, JsArray<T> list, JsAction<jQuery, T> action) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static jQuery bindChildrenToList<T>(this jQuery j, JsString selector, JsArray<T> list, JsAction<jQuery, T, JsNumber> action) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static jQuery off(this jQuery j) { return null; }
    }
}
