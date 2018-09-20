using Microsoft.AspNetCore.Mvc.Rendering;

namespace BestClipOfTheWeek.Extensions
{
    public static class HtmlHelperExtensions
    {
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
