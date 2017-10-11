using System.Threading.Tasks;

namespace BestClipOfTheWeek.Services
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string email, string subject, string message);
    }
}
