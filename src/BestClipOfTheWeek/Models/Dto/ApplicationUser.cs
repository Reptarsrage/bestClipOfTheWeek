using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace BestClipOfTheWeek.Models.Dto
{
    public class ApplicationUser : IdentityUser
    {
        [PersonalData]
        public ICollection<Term> Terms { get; set; }

        public ApplicationUser()
        {
            Terms = new List<Term>();
        }
    }
}
