﻿using System;
using Xunit;
using Kendo.Mvc.Extensions.Tests;
using System.Collections.Generic;
using Kendo.Mvc.Tests;

namespace Kendo.Mvc.UI.Tests
{
    public class EditorSerializationTests
    {
        private readonly Editor editor;

        public EditorSerializationTests()
        {
            editor = new Editor(TestHelper.CreateViewContext());
        }

        [Fact]
        public void Default_StyleSheets_should_not_be_serialized()
        {
            editor.AssertSettings(settings =>
            {
                settings.ContainsKey("stylesheets").ShouldBeFalse();
            });
        }

        [Fact]
        public void StyleSheets_should_be_serialized()
        {
            var values = new List<string> { "value1", "value2" };

            editor.StyleSheets = values;

            editor.Encoded = true;

            editor.AssertSettings(settings =>
            {
                settings["encoded"].ShouldEqual(true);
            });
        }

        [Fact]
        public void Default_Tools_should_not_be_serialized()
        {
            editor.AssertSettings(settings =>
            {
                settings.ContainsKey("tools").ShouldBeFalse();
            });
        }

        [Fact]
        public void Tools_should_be_serialized()
        {
            editor.Tools = new List<EditorTool>() { new EditorTool() { Name = "FontName" } };

            editor.AssertSettings(settings =>
            {
                settings.ContainsKey("tools").ShouldBeTrue();
            });
        }
    }
}