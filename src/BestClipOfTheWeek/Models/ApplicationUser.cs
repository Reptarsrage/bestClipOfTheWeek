using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace BestClipOfTheWeek.Models
{
    // Add profile data for application users by adding properties to the ApplicationUser class
    public class ApplicationUser : IdentityUser
    {
        public ApplicationUser()
        {
            Terms = new List<Term>();
        }

        public List<Term> Terms { get; set; }

        public static List<Term> GetDefaultTerms()
        {
            return new List<Term>
            {
                new Term { TermId = -1, Name = "Alpha", Color = "#ff0000", Enabled = true },
                new Term { TermId = -1, Name = "Bravo", Color = "#ff8000", Enabled = true },
                new Term { TermId = -1, Name = "Charlie", Color = "#fff700", Enabled = true },
                new Term { TermId = -1, Name = "Delta", Color = "#d0ff00", Enabled = true },
                new Term { TermId = -1, Name = "Echo", Color = "#00ff6e", Enabled = true },
                new Term { TermId = -1, Name = "Foxtrot", Color = "#00fff2", Enabled = true },
                new Term { TermId = -1, Name = "Golf", Color = "#009dff", Enabled = true },
                new Term { TermId = -1, Name = "Hotel", Color = "#0040ff", Enabled = true },
                new Term { TermId = -1, Name = "India", Color = "#8400ff", Enabled = true },
                new Term { TermId = -1, Name = "Juliet", Color = "#d400ff", Enabled = true },
                new Term { TermId = -1, Name = "Kilo", Color = "#ff00ee", Enabled = true },
                new Term { TermId = -1, Name = "Lima", Color = "#ff005d", Enabled = true },
                new Term { TermId = -1, Name = "Mike", Color = "#9e2b55", Enabled = true },
                new Term { TermId = -1, Name = "November", Color = "#9e2b87", Enabled = true },
                new Term { TermId = -1, Name = "Oscar", Color = "#872b9e", Enabled = true },
                new Term { TermId = -1, Name = "Papa", Color = "#3a2b9e", Enabled = true },
                new Term { TermId = -1, Name = "Quebec", Color = "#2b709e", Enabled = true },
                new Term { TermId = -1, Name = "Romeo", Color = "#2b9e94", Enabled = true },
                new Term { TermId = -1, Name = "Sierra", Color = "#2b9e4d", Enabled = true },
                new Term { TermId = -1, Name = "Tango", Color = "#689e2b", Enabled = true },
                new Term { TermId = -1, Name = "Uniform", Color = "#a9ab4b", Enabled = true },
                new Term { TermId = -1, Name = "Victor", Color = "#bf8e11", Enabled = true },
                new Term { TermId = -1, Name = "Whiskey", Color = "#bf5a11", Enabled = true },
                new Term { TermId = -1, Name = "X-ray", Color = "#bf1d11", Enabled = true },
                new Term { TermId = -1, Name = "Yankee", Color = "#c78783", Enabled = true },
                new Term { TermId = -1, Name = "Zulu", Color = "#737373", Enabled = true },
            };
        }
    }
}
