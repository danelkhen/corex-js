using SharpKit.JavaScript;
using SharpKit.jQuery;

namespace corexjs.ui.grid
{

    /// <summary>
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
    [JsType(JsMode.Prototype, NativeOverloads = false)]
    public class Grid<T>
    {
        public Grid()
        {
            Init();
        }

        public Grid(jQuery el, GridOptions<T> opts)
        {
            El = el;
            Options = opts;
            Init();
        }
        void Init()
        {
            RenderTimer = new Timer(Render);
        }


        public GridOptions<T> Options { get; set; }

        public jQuery El { get; set; }

        Timer RenderTimer;
        JsNumber TotalPages;
        public JsArray<T> CurrentList { get; set; }
        public jQuery SearchInputEl { get; set; }
        public GridCol<T> OrderByCol { get; set; }
        JsNumber OrderByColClickCount;

        public void Render()
        {
            Verify();
            RenderSearch();
            RenderPager();
            RenderTable();
            if (Options.RenderFinished != null)
                Options.RenderFinished();
        }

        JsArray<GridCol<T>> Cols;

        GridCol<T> FinalizeCol(GridCol<T> col)
        {
            var final = Q.copy(col);
            var defs = new JsArray<GridCol>();
            if (col.Def != null)
                defs.push(col.Def);
            if (col.Defs != null)
                defs.addRange(col.Defs);
            if (defs.length == 0)
                return final;
            defs.forEach(def => Q.copy(FinalizeCol(def.As<GridCol<T>>()), final));
            return final;
        }
        void Verify()
        {
            if (Options.Columns == null)
                Options.Columns = new JsArray<GridCol<T>>();
            if (Options.PageIndex == null)
                Options.PageIndex = 0;
            if (Options.PageSize == null)
                Options.PageSize = 20;
            if (Options.Items == null)
                Options.Items = new JsArray<T>();

            Cols = Options.Columns.select(FinalizeCol);
            Cols.forEach(col =>
            {
                if (col.Name == null && col.Prop != null)
                    col.Name = Options.Items.ItemProp(col.Prop);
                if (col.Getter == null && col.Prop != null)
                    col.Getter = col.Prop.As<JsFunc<T, object>>();
                if (col.Getter == null && col.Name != null)
                    col.Getter = t => t.As<JsObject>()[col.Name].As<JsString>();
                if (col.Comparer == null && col.Getter != null)
                    col.Comparer = col.Getter.ToComparer();
                if (col.Title == null && col.Name != null)
                    col.Title = col.Name;
                if (col.Visible == null)
                    col.Visible = true;
            });

            CurrentList = Options.Items;
            ApplyQuery();
            ApplyOrderBy();
            ApplyPaging();
        }

        void ApplyOrderBy()
        {
            if (Options.OrderBy2 == null)
                return;
            if (Options.OrderByDesc)
                CurrentList = Options.OrderBy2.ToDescending().Order(CurrentList);//.orderByDescending(Options.OrderBy);
            else
                CurrentList = Options.OrderBy2.Order(CurrentList);
        }

        void ApplyPaging()
        {
            TotalPages = JsMath.ceil(CurrentList.length / Options.PageSize);
            if (Options.PageIndex >= TotalPages)
                Options.PageIndex = TotalPages - 1;
            if (Options.PageIndex < 0)
                Options.PageIndex = 0;
            var from = Options.PageIndex * Options.PageSize;
            var until = from + Options.PageSize;
            CurrentListBeforePaging = CurrentList;
            CurrentList = CurrentList.slice(from, until);
        }

        void ApplyQuery()
        {
            if (Options.Query.isNullOrEmpty())
                return;
            var tokens = Options.Query.toLowerCase().split(' ');
            CurrentList = CurrentList.where(obj =>
            {
                var line = Cols.select(col => col.Getter(obj)).join(" ").toLocaleLowerCase();
                var match = tokens.all(token => line.contains(token));
                return match;
            });
        }
        void Search()
        {
            RenderTimer.set(100);
        }

        void OrderBy(GridCol<T> col)
        {
            if (OrderByCol != col)
            {
                OrderByColClickCount = 1;
                OrderByCol = col;
                //Options.OrderBy = t => OrderByCol.Getter(t);
                Options.OrderByDesc = false;
                Options.OrderBy2 = OrderByCol.Comparer;//.Getter.ToComparer();
            }
            else
            {
                OrderByColClickCount++;
                if (OrderByColClickCount == 2)
                {
                    Options.OrderByDesc = true;
                }
                else if (OrderByColClickCount == 3)
                {
                    Options.OrderBy2 = null;
                    OrderByCol = null;
                    OrderByColClickCount = null;
                }
            }
            Render();
        }

        jQuery DataRows;
        private JsArray<GridCol<T>> VisibleColumns;
        private jQuery HeaderRows;

        void RenderTable()
        {
            Table = El.getAppend("table");
            var thead = Table.getAppend("thead");
            var tbody = Table.getAppend("tbody");
            var tfoot = Table.getAppendRemove("tfoot", Options.FooterItem != null ? 1 : 0);

            VisibleColumns = Cols.where(t => t.Visible == true);
            HeaderRows = thead.getAppend("tr").bindChildrenToList("th", VisibleColumns, (th, col) =>
            {
                RenderHeaderCell(col, th);
            });
            var list = CurrentList;
            DataRows = tbody.bindChildrenToList("tr", list, (tr, obj, i) =>
            {
                RenderRow(tr, obj, i);
            });
            if (Options.FooterItem != null)
            {
                tfoot.getAppend("tr").bindChildrenToList("th", VisibleColumns, (th, col) => RenderCell(col, Options.FooterItem, th));
            }
            //TODO: works ok when table width=100%, with overflow ellipsis, disabling for now:
            //AutoSizeColumns();
        }

        void AutoSizeColumns()
        {
            if (VisibleColumns.first(t => t.Width != null) == null)
                return;
            Table.css("width", "");
            HeaderRows.css("width", "");
            var widths = VisibleColumns.select((col, i) =>
            {
                var th = HeaderRows[i];
                if (col.Width == null)
                    return th.offsetWidth.As<JsNumber>();
                return col.Width;
            });
            VisibleColumns.forEach((col, i) =>
            {
                var th = HeaderRows[i];
                if (col.Width == null)
                    th.style.width = th.offsetWidth + "px";
                else
                    th.style.width = col.Width + "px";
            });

            var totalWidth = widths.sum();
            Table.css("width", totalWidth + "px");
        }


        public void RenderRow(T obj)
        {
            if (DataRows == null)
                return;
            var index = CurrentList.indexOf(obj);
            if (index < 0)
                return;
            var tr = DataRows[index].ToJ();
            RenderRow(tr, obj, index);
        }

        public void RenderRow(jQuery tr, T obj, JsNumber index = null)
        {
            var trClass = "";
            if (Options.RowClass != null)
                trClass = Options.RowClass(obj, index);
            if (tr[0].className != trClass)
                tr[0].className = trClass;
            tr.bindChildrenToList("td", VisibleColumns, (td, col) =>
            {
                RenderCell(col, obj, td);
            });
        }

        void RenderHeaderCell(GridCol<T> col, jQuery th)
        {
            if (col.RenderHeaderCell != null)
            {
                col.RenderHeaderCell(col, th);
                return;
            }
            th.off();
            th.mousedown(e =>
            {
                if (e.which != 1)
                    return;
                e.preventDefault();
                OrderBy(col);
            });
            th.text(col.Title ?? col.Name);
            var classes = new JsArray<JsString>();
            if (col.Class != null)
                classes.push(col.Class);
            if (col == OrderByCol)
            {
                classes.push("OrderBy");
                if (!Options.OrderByDesc)
                    classes.push("Asc");
                if (Options.OrderByDesc)
                    classes.push("Desc");
            }
            th[0].className = classes.join(" ");
            if (col.Width != null)
                th.css("width", col.Width + "px");
        }

        void RenderCell(GridCol<T> col, T obj, jQuery td)
        {
            if (col.RenderCell != null)
            {
                col.RenderCell(col, obj, td);
                return;
            }

            object value = obj;
            if (col.Getter != null)
                value = col.Getter(obj);
            JsString sValue = value.As<JsString>();
            if (col.Format != null && value != null)
                sValue = col.Format(value);
            if (sValue == null)
                sValue = "";
            td.text(sValue).attr("title", sValue);
            var classes = new JsArray<JsString>();
            if (col.Class != null)
                classes.push(col.Class);
            if (col.ClassFunc != null)
                classes.push(col.ClassFunc(value));
            var cn = classes.join(" ");
            if (td[0].className != cn)
                td[0].className = cn;
        }
        void RenderSearch()
        {
            if (SearchEl == null && SearchInputEl == null)
                SearchEl = El.getAppend(".Search").addClass("form-inline");
            if (SearchInputEl == null)
                SearchInputEl = SearchEl.getAppend("input.tbSearch").addClass("form-control").attr("placeholder", "Find");
            if (SearchInputEl.DataGetSet("GridSearchInputEventAttached", true))
                return;
            SearchInputEl.on("input", e =>
            {
                Options.Query = SearchInputEl.valString();
                Search();
            });
        }
        void RenderPager()
        {
            //if (TotalPages <= 1)
            //{
            //    El.getAppendRemove(".Pager", 0);
            //    return;
            //}
            El.toggleClass("HasNoPages", TotalPages == 0);
            El.toggleClass("HasOnePage", TotalPages == 1);
            El.toggleClass("HasManyPages", TotalPages > 1);
            El.toggleClass("HasPrevPage", Options.PageIndex > 0);
            El.toggleClass("HasNextPage", Options.PageIndex < TotalPages - 1);
            var pages = JsArrayEx.generateNumbers(0, TotalPages);
            if (PagerEl == null)
                PagerEl = El.getAppend(".Pager").addClass("btn-group");
            PagerEl.getAppend("a.btn.btn-default.PrevPage").getAppend("span.glyphicon.glyphicon-backward").parent().off().mousedown(e =>
            {
                e.preventDefault();
                Options.PageIndex--;
                Render();
            });
            var info = PagerEl.getAppend("a.btn.btn-default.PagerInfo");
            info.text(Options.PageIndex + 1 + " / " + TotalPages + " (Total: " + CurrentListBeforePaging.length + ")");
            PagerEl.getAppend("a.btn.btn-default.NextPage").getAppend("span.glyphicon.glyphicon-forward").parent().off().mousedown(e =>
            {
                e.preventDefault();
                Options.PageIndex++;
                Render();
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




        public JsArray<T> CurrentListBeforePaging { get; set; }
        public jQuery SearchEl { get; set; }
        public jQuery PagerEl { get; set; }

        jQuery Table;

        public T GetItem(jQuery el)
        {
            return el.closest("tr").DataItem<T>();
        }
        public jQuery GetRow(T obj)
        {
            if (DataRows == null)
                return new jQuery();
            var index = CurrentList.indexOf(obj);
            if (index != null)
                return new jQuery(DataRows[index]);
            return new jQuery();
        }
        public static Grid<T> Get(jQuery el)
        {
            return el.data("Grid").As<Grid<T>>();
        }
    }
}



