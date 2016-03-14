(function() {
    var Pane = kendo.spreadsheet.Pane;
    var Sheet = kendo.spreadsheet.Sheet;
    var RangeRef = kendo.spreadsheet.RangeRef;
    var CellRef = kendo.spreadsheet.CellRef;

    var PARTIAL = "k-selection-partial";
    var FULL = "k-selection-full";
    var sheet;

    module("selection", {
        setup: function() {
            sheet = new Sheet(1000, 100, 10, 10, 10, 10);
        }
    });

    function rangeRef(topLeftRow, topLeftCol, bottomRightRow, bottomRightCol) {
        var ref = new RangeRef(
            new CellRef(topLeftRow, topLeftCol),
            new CellRef(bottomRightRow, bottomRightCol)
        );

        return ref;
    }

    var DUMMY_VIEW = {ref: rangeRef(0,0, 100, 100), top: 0, left: 0};

    function createPane(row, column, rowCount, columnCount) {
        return new Pane(sheet, sheet._grid.pane({row: row, column: column, rowCount: rowCount, columnCount: columnCount}));
    }

    test("selects the range", function() {
        var pane = createPane(0, 0);

        sheet.range("A1:C2").select();

        pane._currentView = DUMMY_VIEW;

        var selections = pane.renderSelection().children;
        var table = selections[0];

        equal(selections.length, 2);
        equal(table.attr.style.height, 1 + 2 * 10 + "px");
        equal(table.attr.style.width, 1 + 3 * 10 + "px");
        equal(table.attr.className, "k-spreadsheet-selection k-single-selection");
    });

    test("selects the union", function() {
        var pane = createPane(0, 0);

        sheet.range("A1:C2,C2:D3").select();

        pane._currentView = DUMMY_VIEW;

        var selections = pane.renderSelection().children;

        equal(selections.length, 3);

        var tableA1C2 = selections[0];

        equal(tableA1C2.attr.style.height, 1 + 2 * 10 + "px");
        equal(tableA1C2.attr.style.width, 1 + 3 * 10 + "px");
        equal(tableA1C2.attr.className, "k-spreadsheet-selection");

        var tableC2D3 = selections[1];

        equal(tableC2D3.attr.style.height, 1 + 2 * 10 + "px");
        equal(tableC2D3.attr.style.width, 1 + 2 * 10 + "px");
        equal(tableC2D3.attr.className, "k-spreadsheet-selection");
    });

    test("selects the cell", function() {
        var pane = createPane(0, 0);

        sheet.range("B3:B3").select();

        pane._currentView = DUMMY_VIEW;
        var selections = pane.renderSelection().children;

        equal(selections.length, 2);

        var table = selections[0];

        equal(table.attr.style.height, 1 + 1 * 10 + "px");
        equal(table.attr.style.width, 1 + 1 * 10 + "px");
        equal(table.attr.className, "k-spreadsheet-selection k-single-selection");
    });

    test("selects the union of range and cell", function() {
        var pane = createPane(0, 0);

        sheet.range("C2:D3,B5:B5").select();

        pane._currentView = DUMMY_VIEW;
        var selections = pane.renderSelection().children;

        equal(selections.length, 3);

        var tableC2D3 = selections[0];

        equal(tableC2D3.attr.style.height, 1 + 2 * 10 + "px");
        equal(tableC2D3.attr.style.width, 1 + 2 * 10 + "px");
        equal(tableC2D3.attr.className, "k-spreadsheet-selection");

        var tableB5B5 = selections[1];

        equal(tableB5B5.attr.style.height, 1 + 1 * 10 + "px");
        equal(tableB5B5.attr.style.width, 1 + 1 * 10 + "px");
        equal(tableB5B5.attr.className, "k-spreadsheet-selection");
    });

    test("expands the selection ref around two neighbour merged cells", function() {
        sheet.range("A1:B2").merge();
        sheet.range("C2:D3").merge();

        var ref = sheet.select("B3:C3");

        equal(ref.toString(), "A1:D3");
    });

    test("expands the selection ref around merged cell", function() {
        sheet.range("B2:C3").merge().value("foo");
        var ref = sheet.select("A1:B2");

        equal(ref.topLeft.row, 0);
        equal(ref.topLeft.col, 0);
        equal(ref.bottomRight.row, 2);
        equal(ref.bottomRight.col, 2);
    });

    test("expands the selection around merged cell", function() {
        var pane = createPane(0, 0);

        sheet.range("B2:C3").merge().value("foo");
        sheet.range("A1:B2").select();

        pane._currentView = DUMMY_VIEW;
        var selections = pane.renderSelection().children;

        equal(selections.length, 2);

        var tableA1C3 = selections[0];

        equal(tableA1C3.attr.style.height, 1 + 3 * 10 + "px");
        equal(tableA1C3.attr.style.width, 1 + 3 * 10 + "px");
        equal(tableA1C3.attr.className, "k-spreadsheet-selection k-single-selection");
    });

    test("selection sets the FULL headers for range and cell", function() {
        sheet.range("A1:B2,D3").select();

        var selectedHeaders = sheet.selectedHeaders();

        equal(Object.keys(selectedHeaders.cols).length, 3);
        equal(selectedHeaders.cols[0], "partial");
        equal(selectedHeaders.cols[1], "partial");
        equal(selectedHeaders.cols[3], "partial");

        equal(Object.keys(selectedHeaders.rows).length, 3);
        equal(selectedHeaders.rows[0], "partial");
        equal(selectedHeaders.rows[1], "partial");
        equal(selectedHeaders.rows[2], "partial");
    });

    test("selection sets the FULL headers for range and row", function() {
        sheet.range("A3:C7,10:10").select();

        var selectedHeaders = sheet.selectedHeaders();

        equal(Object.keys(selectedHeaders.cols).length, 3);
        equal(selectedHeaders.cols[0], "partial");
        equal(selectedHeaders.cols[1], "partial");
        equal(selectedHeaders.cols[2], "partial");
        equal(selectedHeaders.allRows, false);

        equal(Object.keys(selectedHeaders.rows).length, 6);
        equal(selectedHeaders.rows[2], "partial");
        equal(selectedHeaders.rows[3], "partial");
        equal(selectedHeaders.rows[4], "partial");
        equal(selectedHeaders.rows[5], "partial");
        equal(selectedHeaders.rows[6], "partial");

        equal(selectedHeaders.rows[9], "full");
        equal(selectedHeaders.allCols, true);
    });

    function find(classTestRe, children) {
        for (var i = 0; i < children.length; i++) {
            if (classTestRe.test(children[i].attr.className)) {
                return children[i];
            }
        }
    }

    function filterByClass(className) {
        return function(element) {
            return element.attr.className.indexOf(className) > - 1;
        }
    }

    var rowHeader = $.proxy(find, null, /k-spreadsheet-row-header/);
    var columnHeader = $.proxy(find, null, /k-spreadsheet-column-header/);

    var ROW_HEADER_INDEX = 5;
    var COL_HEADER_INDEX = 6;

    function getHeaders(pane) {
        var elements = pane.render(1000, 1000).children;

        var rowHeaderCells = elements.filter(filterByClass('k-spreadsheet-row-header'));
        var colHeaderCells = elements.filter(filterByClass('k-spreadsheet-column-header'));

        return {
            rows: rowHeaderCells[0].children,
            cols: colHeaderCells[0].children
        }
    }


    function hasClass(element, className) {
        ok(element.attr.className.indexOf(className) > -1, element.attr.className + " does not contain " + className);
    }

    test("visually selects the FULL headers for range and cell", function() {
        var pane = createPane(0, 0, 100, 100);

        sheet.range("A1:B2,D3").select();

        var headers = getHeaders(pane);

        hasClass(headers.rows[0], PARTIAL)
        hasClass(headers.rows[1], PARTIAL)
        hasClass(headers.rows[2], PARTIAL)

        hasClass(headers.cols[0], PARTIAL)
        hasClass(headers.cols[1], PARTIAL)
        hasClass(headers.cols[3], PARTIAL)
    });


    test("visually selects the FULL headers for range and row", function() {
        var pane = createPane(0, 0, 100, 100);

        sheet.range("A3:C7,10:10").select();

        var headers = getHeaders(pane);

        hasClass(headers.rows[2], PARTIAL)
        hasClass(headers.rows[3], PARTIAL)
        hasClass(headers.rows[4], PARTIAL)
        hasClass(headers.rows[5], PARTIAL)
        hasClass(headers.rows[6], PARTIAL)
        hasClass(headers.rows[9], FULL)

        //row 10 is FULL => all colHeaders should be PARTIAL
        for (var i = 0; i < headers.cols.length; i++) {
            hasClass(headers.cols[i], PARTIAL)
        }
    });

    test("visually selects the FULL headers for row and range", function() {
        var pane = createPane(0, 0, 100, 100);

        sheet.range("4:4,A3:C7").select();

        var headers = getHeaders(pane);

        hasClass(headers.rows[2], PARTIAL);
        hasClass(headers.rows[3], FULL);
        hasClass(headers.rows[4], PARTIAL);
        hasClass(headers.rows[5], PARTIAL);
        hasClass(headers.rows[6], PARTIAL);

        //row 10 is FULL => all colHeaders should be PARTIAL
        for (var i = 0; i < headers.cols.length; i++) {
            hasClass(headers.cols[i], PARTIAL);
        }
    });

    test("visually selects the FULL headers for range and col", function() {
        var pane = createPane(0, 0, 100, 100);

        sheet.range("A3:C7,C:C").select();

        var headers = getHeaders(pane);

        //col C is FULL => all rowHeaders should be PARTIAL
        for (var i = 0; i < headers.rows.length; i++) {
            hasClass(headers.rows[i], PARTIAL);
        }

        hasClass(headers.cols[0], PARTIAL);
        hasClass(headers.cols[1], PARTIAL);
        hasClass(headers.cols[2], FULL);
    });

    test("top left selection is marked as such", function() {
        var pane = createPane(0, 0, 100, 100);

        pane._currentView = DUMMY_VIEW;

        sheet.range("A1").select();

        var selections = pane.renderSelection().children;
        var activeCell = selections[1];

        ok(activeCell.attr.className.indexOf("k-single") > -1)
        ok(activeCell.attr.className.indexOf("k-top") > -1)
        ok(activeCell.attr.className.indexOf("k-left") > -1)
    });

    test("top left selection is marked as such", function() {
        var pane = createPane(0, 0, 100, 100);

        pane._currentView = DUMMY_VIEW;

        sheet.range("A2").select();

        var selections = pane.renderSelection().children;
        var activeCell = selections[1];

        ok(activeCell.attr.className.indexOf("k-single") > -1)
        ok(activeCell.attr.className.indexOf("k-left") > -1)
    });

    test("top left selection is marked as such", function() {
        var pane = createPane(0, 0, 100, 100);

        pane._currentView = DUMMY_VIEW;

        sheet.range("A101").select();

        var selections = pane.renderSelection().children;
        var activeCell = selections[1];

        ok(activeCell.attr.className.indexOf("k-single") > -1)
        ok(activeCell.attr.className.indexOf("k-left") > -1)
        ok(activeCell.attr.className.indexOf("k-bottom") > -1)
    });
})();