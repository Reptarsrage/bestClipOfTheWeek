using BestClipOfTheWeek.Data;
using BestClipOfTheWeek.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BestClipOfTheWeek.Repositories
{
    /// <inheritdoc cref="ITermsRepository"/>
    public class TermsRepository : ITermsRepository
    {
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Creates a new instanace of a <see cref="TermsRepository"/>
        /// </summary>
        /// <param name="context"></param>
        public TermsRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <inheritdoc cref="ITermsRepository.ReadTerms"/>
        public async Task<List<Term>> ReadTerms(string userId)
        {
            var user = await GetUserAndTerms(userId);
            return user.Terms;
        }

        /// <inheritdoc cref="ITermsRepository.AddTerm"/>
        public async Task<int> AddTerm(string userId, Term term)
        {
            var user = await GetUserAndTerms(userId);
            _context.Users.Attach(user);
            user.Terms = user.Terms ?? new List<Term>();
            user.Terms.Add(term);
            await _context.SaveChangesAsync();
            return term.TermId;
        }

        /// <inheritdoc cref="ITermsRepository.UpdateTerm"/>
        public async Task UpdateTerm(Term term)
        {
            var termOld = await GetTerm(term.TermId);
            _context.Terms.Attach(termOld);
            termOld.Color = term.Color;
            termOld.Name = term.Name;
            termOld.Enabled = term.Enabled;
            await _context.SaveChangesAsync();
        }

        /// <inheritdoc cref="ITermsRepository.RemoveTerm"/>
        public async Task RemoveTerm(int id)
        {
            var termOld = await GetTerm(id);
            _context.Terms.Remove(termOld);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Helper method to get a term by Id
        /// </summary>
        /// <param name="termId"><see cref="Term.TermId"/></param>
        /// <returns>The requested term</returns>
        private async Task<Term> GetTerm(int termId)
        {
            return await _context.Terms
                .Where(b => b.TermId.Equals(termId))
                .SingleAsync();
        }

        /// <summary>
        /// Helper method to get a user by Id, including all terms for that user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>The requested <see cref="ApplicationUser"/></returns>
        private async Task<ApplicationUser> GetUserAndTerms(string userId)
        {
            return await _context.Users
                .Where(b => b.Id.Equals(userId))
                .Include(b => b.Terms)
                .SingleAsync();
        }
    }
}
