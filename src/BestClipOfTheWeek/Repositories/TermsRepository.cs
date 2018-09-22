using BestClipOfTheWeek.Data;
using BestClipOfTheWeek.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

    public class TermsRepository : ITermsRepository
    {
        private readonly ApplicationDbContext _context;

        public TermsRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Term>> ReadTerms(string userId)
        {
            var user = await GetUserAndTerms(userId);
            return user.Terms;
        }

        public async Task UpdateTerms(IEnumerable<Term> terms)
        {
            foreach (var term in terms)
            {
                await UpdateTerm(term);
            }
        }

        public async Task AddTerms(string userId, IEnumerable<Term> terms)
        {
            var user = await GetUserAndTerms(userId);
            _context.Users.Attach(user);
            user.Terms = user.Terms ?? new List<Term>();
            user.Terms.AddRange(terms);
            await _context.SaveChangesAsync();
        }

        public async Task<int> AddTerm(string userId, Term term)
        {
            var user = await GetUserAndTerms(userId);
            _context.Users.Attach(user);
            user.Terms = user.Terms ?? new List<Term>();
            user.Terms.Add(term);
            await _context.SaveChangesAsync();
            return term.TermId;
        }

        public async Task UpdateTerm(Term term)
        {
            var termOld = await GetTerm(term.TermId);
            _context.Terms.Attach(termOld);
            termOld.Color = term.Color;
            termOld.Name = term.Name;
            termOld.Enabled = term.Enabled;
            await _context.SaveChangesAsync();
        }

        public async Task RemoveTerm(int id)
        {
            var termOld = await GetTerm(id);
            _context.Terms.Remove(termOld);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveTerms(List<int> ids)
        {
            foreach (var id in ids)
            {
                await RemoveTerm(id);
            }
        }

        private async Task<Term> GetTerm(int id)
        {
            return await _context.Terms
                .Where(b => b.TermId.Equals(id))
                .FirstOrDefaultAsync();
        }

        private async Task<ApplicationUser> GetUserAndTerms(string userId)
        {
            return await _context.Users
                .Where(b => b.Id.Equals(userId))
                .Include(b => b.Terms)
                .FirstOrDefaultAsync();
        }
    }
}
