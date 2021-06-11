using BestClipOfTheWeek.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BestClipOfTheWeek.Repositories
{
    /// <summary>
    /// CRUD operations for user terms
    /// </summary>
    public interface ITermsRepository
    {
        /// <summary>
        /// Add a new user term
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <param name="term">Term to add</param>
        /// <returns>The newly assigned <see cref="Term.TermId"/></returns>
        Task<int> AddTerm(string userId, Models.Dto.Term term);

        /// <summary>
        /// Read user terms
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of terms for the specified user.</returns>
        Task<IEnumerable<Models.Dto.Term>> ReadTerms(string userId);

        /// <summary>
        /// Updates an existing user term
        /// </summary>
        /// <param name="terms">Term to update. Make sure <see cref="Term.TermId"/> stays the same.</param>
        Task UpdateTerm(Models.Dto.Term terms);

        /// <summary>
        /// Remove a user term
        /// </summary>
        /// <param name="id"><see cref="Term.TermId"/></param>
        Task RemoveTerm(int id);
    }

    /// <inheritdoc cref="ITermsRepository"/>
    public class TermsRepository : ITermsRepository
    {
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Creates a new instance of a <see cref="TermsRepository"/>
        /// </summary>
        /// <param name="context"></param>
        public TermsRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <inheritdoc cref="ITermsRepository.ReadTerms"/>
        public async Task<IEnumerable<Models.Dto.Term>> ReadTerms(string userId)
        {
            var user = await GetUserAndTerms(userId);
            return user.Terms;
        }

        /// <inheritdoc cref="ITermsRepository.AddTerm"/>
        public async Task<int> AddTerm(string userId, Models.Dto.Term term)
        {
            var user = await GetUserAndTerms(userId);
            _context.Users.Attach(user);
            user.Terms = user.Terms ?? new List<Models.Dto.Term>();
            user.Terms.Add(term);
            await _context.SaveChangesAsync();
            return term.TermId;
        }

        /// <inheritdoc cref="ITermsRepository.UpdateTerm"/>
        public async Task UpdateTerm(Models.Dto.Term term)
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
        private async Task<Models.Dto.Term> GetTerm(int termId)
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
        private async Task<Models.Dto.ApplicationUser> GetUserAndTerms(string userId)
        {
            return await _context.Users
                .Where(b => b.Id.Equals(userId))
                .Include(b => b.Terms)
                .SingleAsync();
        }
    }
}
