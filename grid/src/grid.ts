
/** <summary>
/// Render
///     Verify
///         ApplyOrderBy
///         ApplyPaging
///     RenderTable
///         RenderHeaderCell
///         RenderCell
///     RenderSearch
///     RenderPager
///
/// Html Template
///     <div class="Grid">
///         <div class="Search form-inline">
///             <input class="tbSearch form-control" placeholder="Find">
///         </div>
///         <div class="Pager">
///             <div class="PagerInfo"><a class="PrevPage">Prev</a><span class="PageInfo">1 / 1</span><a class="NextPage">Next</a></div>
///         </div>
///         <table>
///             <thead>
///                 <tr>
///                     <th></th>
///                 </tr>
///             </thead>
///             <tbody>
///                 <tr>
///                     <td></td>
///                 </tr>
///             </tbody>
///             <tfoot>
///                 <tr>
///                     <th></th>
///                 </tr>
///             </tfoot>
///         </table>
///     </div>
///
/// </summary>
/// <typeparam name="T"></typeparam>
//[JsType(JsMode.Prototype, NativeOverloads = false)]
*/
class Grid<T>
{
    constructor(el?: JQuery, opts?: GridOptions<T>) {
        this.El = el;
        this.Options = opts;
        this.Init();
    }
    Init(): void {
        this.RenderTimer = new Timer(() => this.Render());
    }

    Options: GridOptions<T>;
    El: JQuery;
    RenderTimer: Timer;
    TotalPages: number;
    CurrentList: Array<T>;
    SearchInputEl: JQuery;
    OrderByCol: GridCol1<T>;
    OrderByColClickCount: number;

    Render(): void {
        this.Verify();
        this.RenderSearch();
        this.RenderPager();
        this.RenderTable();
        if (this.Options.RenderFinished != null)
            this.Options.RenderFinished();
    }

    Cols: Array<GridCol1<T>>;

    FinalizeCol(col: GridCol1<T>): GridCol1<T> {
        var final = Q.copy(col);
        final.SourceCol = col;
        var defs = new Array<GridCol>();
        if (col.Def != null)
            defs.push(col.Def);
        if (col.Defs != null)
            defs.addRange(col.Defs);
        if (defs.length == 0)
            return final;
        defs.forEach(def => Q.copy(this.FinalizeCol(def as GridCol1<T>), final));
        return final;
    }
    Verify(): void {
        if (this.Options.Columns == null)
            this.Options.Columns = new Array<GridCol1<T>>();
        if (this.Options.PageIndex == null)
            this.Options.PageIndex = 0;
        if (this.Options.PageSize == null)
            this.Options.PageSize = 20;
        if (this.Options.Items == null)
            this.Options.Items = new Array<T>();

        this.Cols = this.Options.Columns.select(t => this.FinalizeCol(t));
        this.Cols.forEach(col => {
            if (col.Name == null && col.Prop != null)
                col.Name = Utils.ItemProp(this.Options.Items, col.Prop);
            if (col.Getter == null && col.Prop != null)
                col.Getter = col.Prop as JsFunc1<T, any>;
            if (col.Getter == null && col.Name != null)
                col.Getter = t => t[col.Name] as string;
            if (col.Comparer == null && col.Getter != null)
                col.Comparer = Utils.ToComparer(col.Getter);
            if (col.Title == null && col.Name != null)
                col.Title = col.Name;
            if (col.Visible == null)
                col.Visible = true;
        });

        this.CurrentList = this.Options.Items;
        this.ApplyQuery();
        this.ApplyOrderBy();
        this.ApplyPaging();
    }

    ApplyOrderBy(): void {
        if (this.Options.OrderBy2 == null)
            return;
        if (this.Options.OrderByDesc)
            this.CurrentList = Utils.Order(Utils.ToDescending(this.Options.OrderBy2), this.CurrentList);//.orderByDescending(Options.OrderBy);
        else
            this.CurrentList = Utils.Order(this.Options.OrderBy2, this.CurrentList);
    }

    ApplyPaging(): void {
        this.TotalPages = Math.ceil(this.CurrentList.length / this.Options.PageSize);
        if (this.Options.PageIndex >= this.TotalPages)
            this.Options.PageIndex = this.TotalPages - 1;
        if (this.Options.PageIndex < 0)
            this.Options.PageIndex = 0;
        var from = this.Options.PageIndex * this.Options.PageSize;
        var until = from + this.Options.PageSize;
        this.CurrentListBeforePaging = this.CurrentList;
        this.CurrentList = this.CurrentList.slice(from, until);
    }

    ApplyQuery(): void {
        if (Q.isNullOrEmpty(this.Options.Query))
            return;
        var tokens = this.Options.Query.toLowerCase().split(' ');
        this.CurrentList = this.CurrentList.where(obj => {
            var line = this.Cols.select(col => col.Getter(obj)).join(" ").toLocaleLowerCase();
            var match = tokens.all(token => line.contains(token));
            return match;
        });
    }
    Search(): void {
        this.RenderTimer.set(100);
    }

    OrderBy(col: GridCol1<T>): void {
        if (this.OrderByCol == null)// || OrderByCol.SourceCol == col.SourceCol
        {
            this.OrderByColClickCount = 1;
            this.OrderByCol = col;
            //Options.OrderBy = t => OrderByCol.Getter(t);
            this.Options.OrderByDesc = false;
            this.Options.OrderBy2 = this.OrderByCol.Comparer;//.Getter.ToComparer();
        }
        else {
            this.OrderByColClickCount++;
            if (this.OrderByColClickCount == 2) {
                this.Options.OrderByDesc = true;
            }
            else if (this.OrderByColClickCount == 3) {
                this.Options.OrderBy2 = null;
                this.OrderByCol = null;
                this.OrderByColClickCount = null;
            }
        }
        this.Render();
    }

    DataRows: JQuery;
    VisibleColumns: Array<GridCol1<T>>;
    HeaderRows: JQuery;

    RenderTable(): void {
        this.Table = this.El.getAppend("table");
        var thead = this.Table.getAppend("thead");
        var tbody = this.Table.getAppend("tbody");
        var tfoot = this.Table.getAppendRemove("tfoot", this.Options.FooterItem != null ? 1 : 0);

        this.VisibleColumns = this.Cols.where(t => t.Visible == true);
        this.HeaderRows = thead.getAppend("tr").bindChildrenToList("th", this.VisibleColumns, (th, col) => {
            this.RenderHeaderCell(col, th);
        });
        var list = this.CurrentList;
        this.DataRows = tbody.bindChildrenToList("tr", list, (tr, obj, i) => {
            this.RenderRow2(tr, obj, i);
        });
        if (this.Options.FooterItem != null) {
            tfoot.getAppend("tr").bindChildrenToList("th", this.VisibleColumns, (th, col) => this.RenderCell(col, this.Options.FooterItem, th));
        }
        //TODO: works ok when table width=100%, with overflow ellipsis, disabling for now:
        //AutoSizeColumns();
    }

    AutoSizeColumns(): void {
        if (this.VisibleColumns.first(t => t.Width != null) == null)
            return;
        this.Table.css("width", "");
        this.HeaderRows.css("width", "");
        var widths = this.VisibleColumns.select((col, i) => {
            var th = this.HeaderRows[i];
            if (col.Width == null)
                return th.offsetWidth;
            return col.Width;
        });
        this.VisibleColumns.forEach((col, i) => {
            var th = this.HeaderRows[i];
            if (col.Width == null)
                th.style.width = th.offsetWidth + "px";
            else
                th.style.width = col.Width + "px";
        });

        var totalWidth = widths.sum();
        this.Table.css("width", totalWidth + "px");
    }


    RenderRow(obj: T) {
        if (this.DataRows == null)
            return;
        var index = this.CurrentList.indexOf(obj);
        if (index < 0)
            return;
        var tr = $(this.DataRows[index]);
        this.RenderRow2(tr, obj, index);
    }

    RenderRow2(tr: JQuery, obj: T, index?: number): void {
        var trClass = "";
        if (this.Options.RowClass != null)
            trClass = this.Options.RowClass(obj, index);
        if (tr[0].className != trClass)
            tr[0].className = trClass;
        tr.bindChildrenToList("td", this.VisibleColumns, (td, col) => {
            this.RenderCell(col, obj, td);
        });
    }

    RenderHeaderCell(col: GridCol1<T>, th: JQuery): void {
        if (col.RenderHeaderCell != null) {
            col.RenderHeaderCell(col, th);
            return;
        }
        let span = th.getAppend("button");
        span.off();
        span.mousedown(e => {
            if (e.which != 1)
                return;
            e.preventDefault();
            this.OrderBy(col);
        });
        span.text(col.Title!=null ? col.Title : col.Name);
        var classes = new Array<string>();
        if (col.Class != null)
            classes.push(col.Class);
        if (this.OrderByCol != null && this.OrderByCol.SourceCol == col.SourceCol) {
            classes.push("OrderBy");
            if (!this.Options.OrderByDesc)
                classes.push("Asc");
            if (this.Options.OrderByDesc)
                classes.push("Desc");
        }
        th[0].className = classes.join(" ");
        if (col.Width != null)
            th.css("width", col.Width + "px");
    }

    RenderCell(col: GridCol1<T>, obj: T, td: JQuery): void {
        if (col.RenderCell != null) {
            col.RenderCell(col, obj, td);
            return;
        }

        let value = obj;
        if (col.Getter != null)
            value = col.Getter(obj);
        let sValue = value as any as string;
        if (col.Format != null && value != null)
            sValue = col.Format(value);
        if (sValue == null)
            sValue = "";
        td.text(sValue).attr("title", sValue);
        var classes = new Array<string>();
        if (col.Class != null)
            classes.push(col.Class);
        if (col.ClassFunc != null)
            classes.push(col.ClassFunc(value));
        var cn = classes.join(" ");
        if (td[0].className != cn)
            td[0].className = cn;
    }
    RenderSearch() {
        if (this.SearchEl == null && this.SearchInputEl == null)
            this.SearchEl = this.El.getAppend(".Search").addClass("form-inline");
        if (this.SearchInputEl == null)
            this.SearchInputEl = this.SearchEl.getAppend("input.tbSearch").addClass("form-control").attr("placeholder", "Find");
        if (Utils.DataGetSet(this.SearchInputEl, "GridSearchInputEventAttached", true))
            return;
        this.SearchInputEl.on("input", e => {
            this.Options.Query = this.SearchInputEl.val();
            this.Search();
        });
    }
    RenderPager(): void {
        //if (TotalPages <= 1)
        //{
        //    El.getAppendRemove(".Pager", 0);
        //    return;
        //}
        this.El.toggleClass("HasNoPages", this.TotalPages == 0);
        this.El.toggleClass("HasOnePage", this.TotalPages == 1);
        this.El.toggleClass("HasManyPages", this.TotalPages > 1);
        this.El.toggleClass("HasPrevPage", this.Options.PageIndex > 0);
        this.El.toggleClass("HasNextPage", this.Options.PageIndex < this.TotalPages - 1);
        var pages = Array.generateNumbers(0, this.TotalPages);
        if (this.PagerEl == null)
            this.PagerEl = this.El.getAppend(".Pager").addClass("btn-group");
        this.PagerEl.getAppend("a.btn.btn-default.PrevPage").getAppend("span.glyphicon.glyphicon-backward").parent().off().mousedown(e => {
            e.preventDefault();
            this.Options.PageIndex--;
            this.Render();
        });
        var info = this.PagerEl.getAppend("a.btn.btn-default.PagerInfo");
        info.text(this.Options.PageIndex + 1 + " / " + this.TotalPages + " (Total: " + this.CurrentListBeforePaging.length + ")");
        this.PagerEl.getAppend("a.btn.btn-default.NextPage").getAppend("span.glyphicon.glyphicon-forward").parent().off().mousedown(e => {
            e.preventDefault();
            this.Options.PageIndex++;
            this.Render();
        });
        //return;
        //var links = pager.getAppend(".Pages").bindChildrenToList("a.Page", pages, (link, page) =>
        //{
        //    var link2 = new jQuery(link);
        //    var displayPage = (page + 1).ToString();
        //    link2.off().text(displayPage).mousedown(e =>
        //    {
        //        Options.PageIndex = page;
        //        Render();
        //    });
        //});
    }




    CurrentListBeforePaging: Array<T>;
    SearchEl: JQuery;
    PagerEl: JQuery;

    Table: JQuery;

    GetItem(el: JQuery): T {
        return el.closest("tr").dataItem();
    }
    GetRow(obj: T): JQuery {
        if (this.DataRows == null)
            return $();
        var index = this.CurrentList.indexOf(obj);
        if (index != null)
            return $(this.DataRows[index]);
        return $();
    }
    static Get<T>(el: JQuery): Grid<T> {
        return el.data("Grid");
    }
}



