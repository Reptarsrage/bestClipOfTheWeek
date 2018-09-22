using System.Collections.Generic;
using System.Threading.Tasks;
using BestClipOfTheWeek.Models;

namespace BestClipOfTheWeek.Repositories
{
    public interface ITermsRepository
    {
        // C
        Task<int> AddTerm(string userId, Term term);
        Task AddTerms(string userId, IEnumerable<Term> terms);

        // R
        Task<List<Term>> ReadTerms(string userId);

        // U
        Task UpdateTerm(Term terms);
        Task UpdateTerms(IEnumerable<Term> terms);

        // D
        Task RemoveTerm(int id);
        Task RemoveTerms(List<int> ids);
    }
}