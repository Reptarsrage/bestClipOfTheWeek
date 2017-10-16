using System.ComponentModel.DataAnnotations;

namespace BestClipOfTheWeek.Models.TermViewModels
{
    public class TermViewModel
    {
        public int TermId { get; set; }

        [Required]
        [DataType(DataType.Text)]
        [Display(Name = "Term")]
        [StringLength(30, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 2)]
        public string Name { get; set; }

        [Required]
        [DataType(DataType.Text)]
        [Display(Name = "Color")]
        [StringLength(7, ErrorMessage = "The {0} must be at a valid hex color value (e.g. #ffffff).", MinimumLength = 6)]
        public string Color { get; set; }

        [Required]
        [Display(Name = "Enabled")]
        public bool Enabled { get; set; }

        public TermViewModel()
        {
        }

        public TermViewModel(Term t)
        {
            TermId = t.TermId;
            Name = t.Name;
            Color = t.Color.Replace("#", "");
            Enabled = t.Enabled;
        }

        public Term GetTerm()
        {
            return new Term
            {
                TermId = TermId,
                Name = Name,
                Color = Color.StartsWith("#")  ? Color : $"#{Color}",
                Enabled = Enabled,
            };
        }
    }
}