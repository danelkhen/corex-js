///** <summary>
///// Render
/////     Verify
/////         ApplyOrderBy
/////         ApplyPaging
/////     RenderTable
/////         RenderHeaderCell
/////         RenderCell
/////     RenderSearch
/////     RenderPager
/////
///// Html Template
/////     <div class="Grid">
/////         <div class="Search form-inline">
/////             <input class="tbSearch form-control" placeholder="Find">
/////         </div>
/////         <div class="Pager">
/////             <div class="PagerInfo"><a class="PrevPage">Prev</a><span class="PageInfo">1 / 1</span><a class="NextPage">Next</a></div>
/////         </div>
/////         <table>
/////             <thead>
/////                 <tr>
/////                     <th></th>
/////                 </tr>
/////             </thead>
/////             <tbody>
/////                 <tr>
/////                     <td></td>
/////                 </tr>
/////             </tbody>
/////             <tfoot>
/////                 <tr>
/////                     <th></th>
/////                 </tr>
/////             </tfoot>
/////         </table>
/////     </div>
/////
///// </summary>
///// <typeparam name="T"></typeparam>
////[JsType(JsMode.Prototype, NativeOverloads = false)]
//*/
//export class Grid<T>
//{
//    constructor(el?: jQuery, opts?: GridOptions<T>) {
//        this.El = el;
//        this.Options = opts;
//        this.Init();
//    }
//    Init(): void {
//        RenderTimer = new Timer(Render);
//    }
//    Options: GridOptions<T>;
//    El: jQuery;
//    RenderTimer: Timer;
//    TotalPages: JsNumber;
//    CurrentList: JsArray<T>;
//    SearchInputEl: jQuery;
//    OrderByCol: GridCol<T>;
//    OrderByColClickCount: JsNumber;
//    Render(): void {
//        Verify();
//        RenderSearch();
//        RenderPager();
//        RenderTable();
//        if (Options.RenderFinished != null)
//            Options.RenderFinished();
//    }
//    Cols: JsArray<GridCol<T>>;
//    FinalizeCol(col: GridCol<T>): GridCol<T> {
//        var final = Q.copy(col);
//        final.SourceCol = col;
//        var defs = new JsArray<GridCol>();
//        if (col.Def != null)
//            defs.push(col.Def);
//        if (col.Defs != null)
//            defs.addRange(col.Defs);
//        if (defs.length == 0)
//            return final;
//        defs.forEach(def => Q.copy(FinalizeCol(def.As<GridCol<T>>()), final));
//        return final;
//    }
//    Verify(): void {
//        if (Options.Columns == null)
//            Options.Columns = new JsArray<GridCol<T>>();
//        if (Options.PageIndex == null)
//            Options.PageIndex = 0;
//        if (Options.PageSize == null)
//            Options.PageSize = 20;
//        if (Options.Items == null)
//            Options.Items = new JsArray<T>();
//        Cols = Options.Columns.select(FinalizeCol);
//        Cols.forEach(col => {
//            if (col.Name == null && col.Prop != null)
//                col.Name = Options.Items.ItemProp(col.Prop);
//            if (col.Getter == null && col.Prop != null)
//                col.Getter = col.Prop.As<JsFunc<T, object>>();
//            if (col.Getter == null && col.Name != null)
//                col.Getter = t => t.As<JsObject>()[col.Name].As<JsString>();
//            if (col.Comparer == null && col.Getter != null)
//                col.Comparer = col.Getter.ToComparer();
//            if (col.Title == null && col.Name != null)
//                col.Title = col.Name;
//            if (col.Visible == null)
//                col.Visible = true;
//        });
//        CurrentList = Options.Items;
//        ApplyQuery();
//        ApplyOrderBy();
//        ApplyPaging();
//    }
//    ApplyOrderBy(): void {
//        if (Options.OrderBy2 == null)
//            return;
//        if (Options.OrderByDesc)
//            CurrentList = Options.OrderBy2.ToDescending().Order(CurrentList);//.orderByDescending(Options.OrderBy);
//        else
//            CurrentList = Options.OrderBy2.Order(CurrentList);
//    }
//    ApplyPaging(): void {
//        TotalPages = JsMath.ceil(CurrentList.length / Options.PageSize);
//        if (Options.PageIndex >= TotalPages)
//            Options.PageIndex = TotalPages - 1;
//        if (Options.PageIndex < 0)
//            Options.PageIndex = 0;
//        var from = Options.PageIndex * Options.PageSize;
//        var until = from + Options.PageSize;
//        CurrentListBeforePaging = CurrentList;
//        CurrentList = CurrentList.slice(from, until);
//    }
//    ApplyQuery(): void {
//        if (Options.Query.isNullOrEmpty())
//            return;
//        var tokens = Options.Query.toLowerCase().split(' ');
//        CurrentList = CurrentList.where(obj => {
//            var line = Cols.select(col => col.Getter(obj)).join(" ").toLocaleLowerCase();
//            var match = tokens.all(token => line.contains(token));
//            return match;
//        });
//    }
//    Search(): void {
//        RenderTimer.set(100);
//    }
//    OrderBy(GridCol<T>col): void {
//        if (OrderByCol == null)// || OrderByCol.SourceCol == col.SourceCol
//        {
//            OrderByColClickCount = 1;
//            OrderByCol = col;
//            //Options.OrderBy = t => OrderByCol.Getter(t);
//            Options.OrderByDesc = false;
//            Options.OrderBy2 = OrderByCol.Comparer;//.Getter.ToComparer();
//        }
//        else {
//            OrderByColClickCount++;
//            if (OrderByColClickCount == 2) {
//                Options.OrderByDesc = true;
//            }
//            else if (OrderByColClickCount == 3) {
//                Options.OrderBy2 = null;
//                OrderByCol = null;
//                OrderByColClickCount = null;
//            }
//        }
//        Render();
//    }
//    DataRows: jQuery;
//    VisibleColumns: JsArray<GridCol<T>>;
//    HeaderRows: jQuery;
//    RenderTable(): void {
//        Table = El.getAppend("table");
//        var thead = Table.getAppend("thead");
//        var tbody = Table.getAppend("tbody");
//        var tfoot = Table.getAppendRemove("tfoot", Options.FooterItem != null ? 1 : 0);
//        VisibleColumns = Cols.where(t => t.Visible == true);
//        HeaderRows = thead.getAppend("tr").bindChildrenToList("th", VisibleColumns, (th, col) => {
//            RenderHeaderCell(col, th);
//        });
//        var list = CurrentList;
//        DataRows = tbody.bindChildrenToList("tr", list, (tr, obj, i) => {
//            RenderRow(tr, obj, i);
//        });
//        if (Options.FooterItem != null) {
//            tfoot.getAppend("tr").bindChildrenToList("th", VisibleColumns, (th, col) => RenderCell(col, Options.FooterItem, th));
//        }
//        //TODO: works ok when table width=100%, with overflow ellipsis, disabling for now:
//        //AutoSizeColumns();
//    }
//    AutoSizeColumns(): void {
//        if (VisibleColumns.first(t => t.Width != null) == null)
//            return;
//        Table.css("width", "");
//        HeaderRows.css("width", "");
//        var widths = VisibleColumns.select((col, i) => {
//            var th = HeaderRows[i];
//            if (col.Width == null)
//                return th.offsetWidth.As<JsNumber>();
//            return col.Width;
//        });
//        VisibleColumns.forEach((col, i) => {
//            var th = HeaderRows[i];
//            if (col.Width == null)
//                th.style.width = th.offsetWidth + "px";
//            else
//                th.style.width = col.Width + "px";
//        });
//        var totalWidth = widths.sum();
//        Table.css("width", totalWidth + "px");
//    }
//    RenderRow(T obj) {
//        if (DataRows == null)
//            return;
//        var index = CurrentList.indexOf(obj);
//        if (index < 0)
//            return;
//        var tr = DataRows[index].ToJ();
//        RenderRow(tr, obj, index);
//    }
//    RenderRow(jQuery tr, T obj, JsNumber index = null): void {
//        var trClass = "";
//        if (Options.RowClass != null)
//            trClass = Options.RowClass(obj, index);
//        if (tr[0].className != trClass)
//            tr[0].className = trClass;
//        tr.bindChildrenToList("td", VisibleColumns, (td, col) => {
//            RenderCell(col, obj, td);
//        });
//    }
//    RenderHeaderCell(GridCol < T>col, jQuery th): void {
//        if (col.RenderHeaderCell != null) {
//            col.RenderHeaderCell(col, th);
//            return;
//        }
//        th.off();
//        th.mousedown(e => {
//            if (e.which != 1)
//                return;
//            e.preventDefault();
//            OrderBy(col);
//        });
//        th.text(col.Title ?? col.Name);
//        var classes = new JsArray<JsString>();
//        if (col.Class != null)
//            classes.push(col.Class);
//        if (OrderByCol != null && OrderByCol.SourceCol == col.SourceCol) {
//            classes.push("OrderBy");
//            if (!Options.OrderByDesc)
//                classes.push("Asc");
//            if (Options.OrderByDesc)
//                classes.push("Desc");
//        }
//        th[0].className = classes.join(" ");
//        if (col.Width != null)
//            th.css("width", col.Width + "px");
//    }
//    RenderCell(col: GridCol<T>, obj: T, td: jQuery): void {
//        if (col.RenderCell != null) {
//            col.RenderCell(col, obj, td);
//            return;
//        }
//        object value = obj;
//        if (col.Getter != null)
//            value = col.Getter(obj);
//        JsString sValue = value.As<JsString>();
//        if (col.Format != null && value != null)
//            sValue = col.Format(value);
//        if (sValue == null)
//            sValue = "";
//        td.text(sValue).attr("title", sValue);
//        var classes = new JsArray<JsString>();
//        if (col.Class != null)
//            classes.push(col.Class);
//        if (col.ClassFunc != null)
//            classes.push(col.ClassFunc(value));
//        var cn = classes.join(" ");
//        if (td[0].className != cn)
//            td[0].className = cn;
//    }
//    RenderSearch() {
//        if (SearchEl == null && SearchInputEl == null)
//            SearchEl = El.getAppend(".Search").addClass("form-inline");
//        if (SearchInputEl == null)
//            SearchInputEl = SearchEl.getAppend("input.tbSearch").addClass("form-control").attr("placeholder", "Find");
//        if (SearchInputEl.DataGetSet("GridSearchInputEventAttached", true))
//            return;
//        SearchInputEl.on("input", e => {
//            Options.Query = SearchInputEl.valString();
//            Search();
//        });
//    }
//    RenderPager(): void {
//        //if (TotalPages <= 1)
//        //{
//        //    El.getAppendRemove(".Pager", 0);
//        //    return;
//        //}
//        El.toggleClass("HasNoPages", TotalPages == 0);
//        El.toggleClass("HasOnePage", TotalPages == 1);
//        El.toggleClass("HasManyPages", TotalPages > 1);
//        El.toggleClass("HasPrevPage", Options.PageIndex > 0);
//        El.toggleClass("HasNextPage", Options.PageIndex < TotalPages - 1);
//        var pages = JsArrayEx.generateNumbers(0, TotalPages);
//        if (PagerEl == null)
//            PagerEl = El.getAppend(".Pager").addClass("btn-group");
//        PagerEl.getAppend("a.btn.btn-default.PrevPage").getAppend("span.glyphicon.glyphicon-backward").parent().off().mousedown(e => {
//            e.preventDefault();
//            Options.PageIndex--;
//            Render();
//        });
//        var info = PagerEl.getAppend("a.btn.btn-default.PagerInfo");
//        info.text(Options.PageIndex + 1 + " / " + TotalPages + " (Total: " + CurrentListBeforePaging.length + ")");
//        PagerEl.getAppend("a.btn.btn-default.NextPage").getAppend("span.glyphicon.glyphicon-forward").parent().off().mousedown(e => {
//            e.preventDefault();
//            Options.PageIndex++;
//            Render();
//        });
//        //return;
//        //var links = pager.getAppend(".Pages").bindChildrenToList("a.Page", pages, (link, page) =>
//        //{
//        //    var link2 = new jQuery(link);
//        //    var displayPage = (page + 1).ToString();
//        //    link2.off().text(displayPage).mousedown(e =>
//        //    {
//        //        Options.PageIndex = page;
//        //        Render();
//        //    });
//        //});
//    }
//    CurrentListBeforePaging: JsArray<T>;
//    SearchEl: jQuery;
//    PagerEl: jQuery;
//    Table: jQuery;
//    GetItem(jQuery el): T {
//        return el.closest("tr").DataItem<T>();
//    }
//    GetRow(T obj): jQuery {
//        if (DataRows == null)
//            return new jQuery();
//        var index = CurrentList.indexOf(obj);
//        if (index != null)
//            return new jQuery(DataRows[index]);
//        return new jQuery();
//    }
//    static Get(jQuery el): Grid<T> {
//        return el.data("Grid").As<Grid<T>>();
//    }
//}
using;
SharpKit.JavaScript;
using;
SharpKit.jQuery;
var corexjs;
(function (corexjs) {
    var ui;
    (function (ui) {
        var grid;
        (function (grid_1) {
            [JsType(JsMode.Prototype, Name = "jQuery", PrototypeName = "fn", OmitDefaultConstructor = true, OmitInheritance = true)];
            var jQueryGridPlugin = (function () {
                function jQueryGridPlugin() {
                }
                return jQueryGridPlugin;
            }());
            jQuery;
            {
                jQuery;
                Grid(GridOptions < T > opts);
                {
                    this.toArray().forEach(function (el) {
                        var el2 = new jQuery(el);
                        var grid = el2.data("Grid").As();
                        if (grid != null) {
                            grid.Options = opts;
                            grid.El = new jQuery(el);
                            grid.Render();
                        }
                        else {
                            grid = new Grid(el2, opts);
                            el2.data("Grid", grid);
                            grid.Render();
                        }
                    });
                    return this;
                }
            }
            [JsType(JsMode.Prototype, Name = "$", Export = false)];
            var Extensions4 = (function () {
                function Extensions4() {
                }
                Extensions4.jQuery = Grid(this, jQuery, j, GridOptions < T > opts);
                return Extensions4;
            }());
            {
                return null;
            }
        })(grid = ui.grid || (ui.grid = {}));
    })(ui = corexjs.ui || (corexjs.ui = {}));
})(corexjs || (corexjs = {}));
using;
SharpKit.JavaScript;
using;
SharpKit.jQuery;
using;
System;
var corexjs;
(function (corexjs) {
    [JsType(JsMode.Prototype, NativeOverloads = false)];
    var Utils = (function () {
        function Utils() {
        }
        Utils.JsFunc = ;
        Utils.prototype.ToComparer = function (JsFunc, V, bool) {
            if (JsFunc === void 0) { JsFunc = ; }
            if (V === void 0) { V =  > getter; }
            if (bool === void 0) { bool = desc = false; }
            if (desc)
                return getter.ToDescendingComparer();
            var valueComparer = GetDefaultComparer();
            var comparer = new JsFunc(function (x, y) { return valueComparer(getter(x), getter(y)); });
            return comparer;
        };
        Utils.JsFunc = ;
        Utils.prototype.ToDescendingComparer = function (JsFunc, V) {
            if (JsFunc === void 0) { JsFunc = ; }
            if (V === void 0) { V =  > getter; }
            var valueComparer = GetDefaultComparer();
            var comparer = new JsFunc(function (x, y) { return valueComparer(getter(x), getter(y)) * -1; });
            return comparer;
        };
        Utils.JsFunc = ;
        Utils.prototype.ToDescending = function (JsFunc, T, JsNumber) {
            if (JsFunc === void 0) { JsFunc = ; }
            if (JsNumber === void 0) { JsNumber =  > comparer; }
            return new JsFunc(function (x, y) { return comparer(x, y) * -1; });
        };
        Utils.JsFunc = ;
        Utils.prototype.ThenBy = function (JsFunc, T, JsNumber, JsFunc, T, JsNumber) {
            if (JsFunc === void 0) { JsFunc = ; }
            if (JsNumber === void 0) { JsNumber =  > comparer; }
            if (JsFunc === void 0) { JsFunc = ; }
            if (JsNumber === void 0) { JsNumber =  > comparer2; }
            return new JsFunc(function (x, y) {
                var diff = comparer(x, y);
                if (diff == 0)
                    diff = comparer2(x, y);
                return diff;
            });
        };
        Utils.JsFunc = ;
        Utils.prototype.ThenBy = function (JsFunc, T, JsNumber, JsFunc, V, bool) {
            if (JsFunc === void 0) { JsFunc = ; }
            if (JsNumber === void 0) { JsNumber =  > comparer; }
            if (JsFunc === void 0) { JsFunc = ; }
            if (V === void 0) { V =  > getter; }
            if (bool === void 0) { bool = desc = false; }
            return comparer.ThenBy(getter.ToComparer(desc));
        };
        Utils.JsArray = ;
        Utils.prototype.Order = function (JsFunc, T, JsNumber, JsArray) {
            if (JsFunc === void 0) { JsFunc = ; }
            if (JsNumber === void 0) { JsNumber =  > comparer; }
            if (JsArray === void 0) { JsArray = list; }
            var list2 = list.toArray();
            list2.sort(comparer);
            return list2;
        };
        Utils.JsFunc = ;
        Utils.prototype.GetDefaultComparer = function () {
            var comparer = new JsFunc(Comparer(_default.compare));
            return comparer;
        };
        Utils.T = DataGetSet(this, jQuery, j, JsString, name, T, value);
        return Utils;
    }());
    {
        var val = value.As();
        var value2 = j.data(name);
        if (value2 == val)
            return value2.As();
        j.data(name, val);
        return value2.As();
    }
    JsString;
    Prop(JsNativeFunc < T, object > prop);
    {
        JsString;
        code;
        if (prop.As()["isDelegate"].As())
            code = prop.As()["func"].As().toString();
        else
            code = prop.As().toString();
        return code.substringBetween(".", ";");
    }
    JsString;
    ItemProp(this, JsArray < T > list, JsNativeFunc < T, object > prop);
    {
        return Utils.Prop(prop);
    }
    JsFunc < T, V > ItemGetter(this, JsArray < T > list, JsFunc < T, V > prop);
    {
        return prop;
    }
})(corexjs || (corexjs = {}));
[JsType(JsMode.Prototype, Export = false, Name = "Comparer")];
var Comparer = (function () {
    function Comparer() {
        this.JsNumber = compare(T, x, T, y);
    }
    return Comparer;
}());
{
    return null;
}
Comparer < T > _default;
{
    get;
    set;
}
