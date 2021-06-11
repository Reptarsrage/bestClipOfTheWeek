using System.ComponentModel.DataAnnotations;

namespace BestClipOfTheWeek.Models
{
    /// <summary>
    /// Terms API view model
    /// </summary>
    public class Term
    {
        /// <summary>
        /// Term Id
        /// </summary>
        public int TermId { get; set; }

        /// <summary>
        /// Term name
        /// </summary>
        [Required]
        [StringLength(30, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 2)]
        public string? Name { get; set; }

        /// <summary>
        /// Hex color code for the term
        /// </summary>
        [Required]
        [StringLength(7, ErrorMessage = "The {0} must be at a valid hex color value (e.g. #ffffff).", MinimumLength = 7)]
        public string? Color { get; set; }

        /// <summary>
        /// Flag insicating if term is active
        /// </summary>
        [Required]
        public bool Enabled { get; set; }

        public override bool Equals(object? obj)
        {
            return obj is Term term && TermId == term.TermId;
        }

        public override int GetHashCode()
        {
            return TermId.GetHashCode();
        }
    }
}
