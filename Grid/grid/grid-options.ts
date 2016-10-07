    export interface GridCol
    {
        SourceCol:GridCol ;
        Name: JsString ;
        Def:GridCol ;
        Defs:JsArray<GridCol> ;
        Prop:JsNativeFunc<object, object> ;
        JsString Title;
        JsFunc<object, object> Getter;
        JsFunc<object, object, JsNumber> Comparer;
        JsBoolean Visible;
        JsFunc<object, JsString> Format;
        JsFunc<object, JsString> ClassFunc;
        JsString Class;
        JsNumber Width;
        JsAction<GridCol, object, jQuery> RenderCell;
        JsAction<GridCol, jQuery> RenderHeaderCell;
    }

    export interface GridCol<T> extends GridCol
    {
        JsNativeFunc<T, object> Prop;
        JsFunc<T, object> Getter;
        JsFunc<T, T, JsNumber> Comparer;
        JsAction<GridCol<T>, T, jQuery> RenderCell ;
        JsAction<GridCol<T>, jQuery> RenderHeaderCell;
    }
    
    export interface GridCol<T, V> extends GridCol<T>
    {
        JsNativeFunc<T, V> Prop;
        JsFunc<T, V> Getter;
        JsFunc<V, JsString> Format;
        JsFunc<V, JsString> ClassFunc;
    }


    export static class Extensions5
    {
        public static ToGrid<T>(list:JsArray<T> , j:jQuery , opts:GridOptions<T> ):jQuery 
        {
            opts.Items = list;
            return j.Grid(opts);
        }
    }

    export class GridOptions<T>
    {
        JsArray<GridCol<T>> Columns;
        JsArray<T> Items;
        T FooterItem;
        JsNumber PageIndex;
        JsNumber PageSize;
        JsString Query;
        JsFunc<T, T, JsNumber> OrderBy2;
        bool OrderByDesc;
        JsFunc<T, JsNumber, JsString> RowClass;
        JsAction RenderFinished;
    }
