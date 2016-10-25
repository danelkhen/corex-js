
$.fn.Grid = function <T>(opts: GridOptions<T>): JQuery {
    this.toArray().forEach(el => {
        var el2 = $(el);
        var grid:Grid<T> = el2.data("Grid");
        if (grid != null) {
            grid.Options = opts;
            grid.El = $(el);
            grid.Render();
        }
        else {
            grid = new Grid<T>(el2, opts);
            el2.data("Grid", grid);
            grid.Render();
        }
    });
    return this;
}

interface JQuery {
    Grid<T>(opts: GridOptions<T>): JQuery;
}



