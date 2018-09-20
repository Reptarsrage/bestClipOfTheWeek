using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace BestClipOfTheWeek.Extensions
{
    public static class HtmlHelperExtensions
    {
        /// <summary>
        /// Returns icon for external login
        /// </summary>
        public static HtmlString GetIconForExternalLogin(this IHtmlHelper html, string name)
        {
            switch (name)
            {
                case "Microsoft":
                    return new HtmlString(@"<i class=""fab fa-microsoft fa-2x microsoft""></i>");
                case "Facebook":
                    return new HtmlString(@"<i class=""fab fa-facebook fa-2x facebook""></i>");
                case "Twitter":
                    return new HtmlString(@"<i class=""fab fa-twitter fa-2x twitter""></i>");
                case "Google":
                    return new HtmlString(@"<i class=""fab fa-google fa-2x google""></i>");
                default:
                    return HtmlString.Empty;
            }
        }

        /// <summary>
        ///     Sets active class on bootstrap nav links if given route matches the current path
        /// </summary>
        /// <remarks>
        ///     Shamelessly stolen from
        ///     <see href="https://stackoverflow.com/questions/20410623/how-to-add-active-class-to-html-actionlink-in-asp-net-mvc" />
        /// </remarks>
        public static string IsActive(this IHtmlHelper html, string control, string action)
        {
            var routeData = html.ViewContext.RouteData;

            var routeAction = (string) routeData.Values["action"];
            var routeControl = (string) routeData.Values["controller"];

            // both must match
            var returnActive = string.Equals(control, routeControl) && string.Equals(action, routeAction);

            return returnActive ? "active" : string.Empty;
        }
    }
}
