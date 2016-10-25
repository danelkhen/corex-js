using SharpKit.JavaScript;
using SharpKit.jQuery;

namespace corexjs.ui.grid
{
    [JsType(JsMode.Json)]
    public class GridCol
    {
        internal GridCol SourceCol { get; set; }
        public JsString Name { get; set; }
        public GridCol Def { get; set; }
        public JsArray<GridCol> Defs { get; set; }
        public JsNativeFunc<object, object> Prop { get; set; }
        public JsString Title { get; set; }
        public JsFunc<object, object> Getter { get; set; }
        public JsFunc<object, object, JsNumber> Comparer { get; set; }
        public JsBoolean Visible { get; set; }
        public JsFunc<object, JsString> Format { get; set; }
        public JsFunc<object, JsString> ClassFunc { get; set; }
        public JsString Class { get; set; }
        public JsNumber Width { get; set; }
        public JsAction<GridCol, object, jQuery> RenderCell { get; set; }
        public JsAction<GridCol, jQuery> RenderHeaderCell { get; set; }
    }

    [JsType(JsMode.Json)]
    public class GridCol<T> : GridCol
    {
        public new JsNativeFunc<T, object> Prop { get; set; }
        public new JsFunc<T, object> Getter { get; set; }
        public new JsFunc<T, T, JsNumber> Comparer { get; set; }

        public new JsAction<GridCol<T>, T, jQuery> RenderCell  { get; set; }

        public new JsAction<GridCol<T>, jQuery> RenderHeaderCell { get; set; }
    }
    [JsType(JsMode.Json)]
    public class GridCol<T, V> : GridCol<T>
    {
        public new JsNativeFunc<T, V> Prop { get; set; }
        public new JsFunc<T, V> Getter { get; set; }
        public new JsFunc<V, JsString> Format { get; set; }
        public new JsFunc<V, JsString> ClassFunc { get; set; }
    }


    [JsType(JsMode.Prototype)]
    public static class Extensions5
    {
        public static jQuery ToGrid<T>(this JsArray<T> list, jQuery j, GridOptions<T> opts)
        {
            opts.Items = list;
            return j.Grid(opts);
        }
    }

    [JsType(JsMode.Json)]
    public class GridOptions<T>
    {
        public JsArray<GridCol<T>> Columns { get; set; }
        public JsArray<T> Items { get; set; }
        public T FooterItem { get; set; }
        public JsNumber PageIndex { get; set; }
        public JsNumber PageSize { get; set; }
        public JsString Query { get; set; }
        //public JsFunc<T, object> OrderBy { get; set; }
        public JsFunc<T, T, JsNumber> OrderBy2 { get; set; }
        public bool OrderByDesc { get; set; }
        public JsFunc<T, JsNumber, JsString> RowClass { get; set; }
        public JsAction RenderFinished { get; set; }
    }
}