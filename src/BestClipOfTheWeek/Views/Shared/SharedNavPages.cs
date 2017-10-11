using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System;

namespace BestClipOfTheWeek.Views.Shared
{
    public static class SharedNavPages
    {
        public static string ActivePageKey => "ActivePage";

        public static string Index => "Index";

        public static string About => "About";

        public static string Contact => "Contact";

        public static string Report => "Report";

        public static string Term => "Term";

        public static string Quick => "Quick";

        public static string Commenters => "Commenters";

        public static string IndexNavClass(ViewContext viewContext) => PageNavClass(viewContext, Index);

        public static string AboutNavClass(ViewContext viewContext) => PageNavClass(viewContext, About);

        public static string ContactNavClass(ViewContext viewContext) => PageNavClass(viewContext, Contact);

        public static string ReportNavClass(ViewContext viewContext) => PageNavClass(viewContext, Report);

        public static string TermNavClass(ViewContext viewContext) => PageNavClass(viewContext, Term);

        public static string QuickNavClass(ViewContext viewContext) => PageNavClass(viewContext, Quick);

        public static string CommentersNavClass(ViewContext viewContext) => PageNavClass(viewContext, Commenters);

        public static string PageNavClass(ViewContext viewContext, string page)
        {
            var activePage = viewContext.ViewData["ActivePage"] as string;
            return string.Equals(activePage, page, StringComparison.OrdinalIgnoreCase) ? "active" : null;
        }

        public static void AddActivePage(this ViewDataDictionary viewData, string activePage) => viewData[ActivePageKey] = activePage;
    }
}
