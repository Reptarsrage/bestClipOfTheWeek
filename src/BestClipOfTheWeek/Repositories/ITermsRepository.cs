using System.Collections.Generic;
using System.Threading.Tasks;
using BestClipOfTheWeek.Models;

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
        Task<int> AddTerm(string userId, Term term);

        /// <summary>
        /// Read user terms
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of terms for the specified user.</returns>
        Task<List<Term>> ReadTerms(string userId);

        /// <summary>
        /// Updates an existing user term
        /// </summary>
        /// <param name="terms">Term to update. Make sure <see cref="Term.TermId"/> stays the same.</param>
        Task UpdateTerm(Term terms);

        /// <summary>
        /// Remove a user term
        /// </summary>
        /// <param name="id"><see cref="Term.TermId"/></param>
        Task RemoveTerm(int id);
    }
}
