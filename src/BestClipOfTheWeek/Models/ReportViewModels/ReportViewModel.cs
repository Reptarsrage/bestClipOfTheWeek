using BestClipOfTheWeek.Models.TermViewModels;
using System.Collections.Generic;

namespace BestClipOfTheWeek.Models.ReportViewModels
{
    public class IndexViewModel
    {
        public IList<TermViewModel> Terms { get; set; }

        public bool ShowTerms => Terms != null;
    }
}