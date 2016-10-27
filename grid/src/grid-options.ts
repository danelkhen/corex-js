
interface GridCol {
    SourceCol?: GridCol;
    Name?: string;
    Def?: GridCol;
    Defs?: Array<GridCol>;
    Prop?: JsFunc1<any, any>;
    Title?: string;
    Getter?: JsFunc1<any, any>;
    Comparer?: JsFunc2<any, any, number>;
    Visible?: boolean;
    Format?: JsFunc1<any, string>;
    ClassFunc?: JsFunc1<any, string>;
    Class?: string;
    Width?: number;
    RenderCell?: JsAction3<GridCol, any, JQuery>;
    RenderHeaderCell?: JsAction2<GridCol, JQuery>;
}

interface GridCol1<T> extends GridCol {
    Prop?: JsFunc1<T, any>;
    Getter?: JsFunc1<T, any>;
    Comparer?: JsFunc2<T, T, number>;
    RenderCell?: JsAction3<GridCol1<T>, T, JQuery>;
    RenderHeaderCell?: JsAction2<GridCol1<T>, JQuery>;
}

interface GridCol2<T, V> extends GridCol1<T> {
    Prop?: JsFunc1<T, V>;
    Getter?: JsFunc1<T, V>;
    Format?: JsFunc1<V, string>;
    ClassFunc?: JsFunc1<V, string>;
}


class Extensions5 {
    static ToGrid<T>(list: Array<T>, j: JQuery, opts: GridOptions<T>): JQuery {
        opts.Items = list;
        return j.Grid(opts);
    }
}

interface GridOptions<T>
{
    Columns?: Array<GridCol1<T>>;
    Items?: Array<T>;
    FooterItem?: T;
    PageIndex?: number;
    PageSize?: number;
    Query?: string;
    OrderBy2?: JsFunc2<T, T, number>;
    OrderByDesc?: boolean;
    RowClass?: JsFunc2<T, number, string>;
    RenderFinished?: JsAction;
}
