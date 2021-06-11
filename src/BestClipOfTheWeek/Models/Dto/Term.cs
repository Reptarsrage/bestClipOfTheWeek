namespace BestClipOfTheWeek.Models.Dto
{
    /// <summary>
    /// Term DTO
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
        public string Name { get; set; } = default!;

        /// <summary>
        /// Hex color code for the term
        /// </summary>
        public string Color { get; set; } = default!;

        /// <summary>
        /// Flag indicating if term is active
        /// </summary>
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
