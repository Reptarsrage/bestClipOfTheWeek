using System.ComponentModel.DataAnnotations;

namespace BestClipOfTheWeek.Models.AccountViewModels
{
    public class ForgotPasswordViewModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
