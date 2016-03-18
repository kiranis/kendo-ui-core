(function(){

var uploadInstance,
    Upload = kendo.ui.Upload;

function createUpload(options) {
    removeHTML();

    copyUploadPrototype();

    $('#uploadInstance').kendoUpload($.extend({ async:{"saveUrl":"javascript:;",autoUpload:true,showFileList:true} }, options));

    var uploadInstance = $('#uploadInstance').data("kendoUpload");
    uploadInstance._module.createFormData = function() { return { append: $.noop } };
    uploadInstance._module.postFormData = function(url, data, fileEntry) {
        fileEntry.data("request", { abort: function() { } });
    };

    return uploadInstance;
}

function simulateDrop(srcFiles) {
    uploadInstance._onDrop(
    {   originalEvent: {
            dataTransfer: {
                files: srcFiles
            }
        },
        stopPropagation: function() { },
        preventDefault: function() { }
    });
}

function moduleSetup() {
    Upload.prototype._supportsFormData = function() { return true; };
    uploadInstance = createUpload();
}

function moduleTeardown() {
    removeHTML();
    $.mockjaxClear();
}

// -----------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------
module("Upload / Drag and Drop", {
    setup: moduleSetup,
    teardown: moduleTeardown
});

test("enabled for Safari on Mac", function() {
    uploadInstance._userAgent = function() {
        return "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; en-us) AppleWebKit/534.16+ (KHTML, like Gecko) Version/5.0.3 Safari/533.19.4";
    };

    ok(uploadInstance._supportsDrop());
});

test("disabled for Safari on Windows", function() {
    uploadInstance._userAgent = function() {
        return "Mozilla/5.0 (Windows; U; Windows NT 6.1; sv-SE) AppleWebKit/533.19.4 (KHTML, like Gecko) Version/5.0.3 Safari/533.19.4";
    };

    ok(!uploadInstance._supportsDrop());
});

test("enabled for all other browsers supporting FormData", function() {
    uploadInstance._userAgent = function() {
        return "xxxx";
    };

    ok(uploadInstance._supportsDrop());
});

test("disabled for all browsers not supporting FormData", function() {
    Upload.prototype._supportsFormData = function() { return false; };
    uploadInstance = createUpload();

    ok(!uploadInstance._supportsDrop());
});

test("dropped file is enqueued", function () {
    if (!uploadInstance._supportsDrop()) {
        ok(true, "Disabled in this browser");
        return;
    }

    simulateDrop([ { name: "first.txt", size: 1 } ]);

    equal($(".k-file", uploadInstance.wrapper).length, 1);
});

test("select event fires on drop", 1, function() {
    uploadInstance = createUpload({ "select" : (function() { ok(true); }) });
    simulateDrop([ { name: "first.txt", size: 1 } ]);
});

test("select event fired on drop can be cancelled", 1, function() {
    uploadInstance = createUpload({ "select" : (function(e) { e.preventDefault(); }) });
    simulateDrop([ { name: "first.txt", size: 1 } ]);

    equal($(".k-file", uploadInstance.wrapper).length, 0);
});

test("select event is not fired on drop when the widget is disabled", 1, function() {
    var isFired = false;

    uploadInstance = createUpload({ "select" : (function() { isFired = true; }), enabled: false });
    simulateDrop([ { name: "first.txt", size: 1 } ]);

    equal(isFired, false);
});

test("dropping file when the widget is disabled does not add it to files list", 1, function() {
    uploadInstance = createUpload({ "select" : (function() { isFired = true; }), enabled: false });
    simulateDrop([ { name: "first.txt", size: 1 } ]);

    equal($(".k-file", uploadInstance.wrapper).length, 0);
});

test("k-upload-empty class is present after dropping file when the widget is disabled", 1, function() {
    uploadInstance = createUpload({ "select" : (function() { isFired = true; }), enabled: false });
    simulateDrop([ { name: "first.txt", size: 1 } ]);

    ok($(uploadInstance.wrapper).hasClass("k-upload-empty"));
});

test("files in select event arguments are wrapped", 1, function() {
    uploadInstance = createUpload({ "select" : (function(e) {
            equal(e.files[0].rawFile.name, "first.txt");
        })
    });

    simulateDrop([ { name: "first.txt", size: 1 } ]);
});

test("dropping anything that is not a file is ignored", function () {
    simulateDrop([]);

    equal($(".k-file", uploadInstance.wrapper).length, 0);
});

test("only one file is selected when multiple files are dropped (multiple='false')", function() {
    uploadInstance = createUpload({ multiple: false });

    simulateDrop([ { name: "first.txt", size: 1 }, { name: "second.txt", size: 2 } ]);

    equal($(".k-file", uploadInstance.wrapper).length, 1);
});

module("Upload / Drag and drop / Synchronous upload", {
    setup: function() {
        Upload.prototype._supportsFormData = function() { return true; };
        copyUploadPrototype();

        $('#uploadInstance').kendoUpload();

        uploadInstance = $('#uploadInstance').data("kendoUpload");
    },
    teardown: moduleTeardown
});

test("disabled in synchronous mode", function() {
    Upload.prototype._supportsFormData = function() { return true; };
    ok(!uploadInstance._supportsDrop());
});

})();