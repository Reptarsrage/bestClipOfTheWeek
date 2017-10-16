namespace BestClipOfTheWeek.Models
{
    public class Term
    {
        public int TermId { get; set; }

        public string Name { get; set; }

        public string Color { get; set; }

        public bool Enabled { get; set; }

        public override bool Equals(object obj)
        {
            if (obj == null || !(obj is Term))
                return false;

            var t = (Term)obj;
            return t.TermId.Equals(TermId);
        }

        public override int GetHashCode()
        {
            return 1824229738 + TermId.GetHashCode();
        }
    }
}