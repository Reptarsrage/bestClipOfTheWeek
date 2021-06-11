using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using BestClipOfTheWeek.Models;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Options;

namespace BestClipOfTheWeek
{
    // This class is used by the application to send email for account confirmation and password reset.
    // For more details see https://go.microsoft.com/fwlink/?LinkID=532713
    public class EmailSender : IEmailSender
    {
        private readonly SmtpClient _client;
        private readonly IOptions<EmailSenderOptions> _options;
        private readonly MailAddress _fromAddress;

        public EmailSender(IOptions<EmailSenderOptions> options)
        {
            _options = options;
            _fromAddress = new MailAddress(_options.Value.User, "Best Clip Of The Week");
            _client = new SmtpClient
            {
                Host = "smtp.gmail.com",
                Port = 587,
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Credentials = new NetworkCredential(_fromAddress.Address, _options.Value.Password),
                Timeout = 20000
            };
        }

        /// <summary>
        /// Sends a mail to a user using Gmail STMP
        /// </summary>
        /// <param name="email">Address to send to</param>
        /// <param name="subject">Email subject line</param>
        /// <param name="htmlMessage">Email body</param>
        /// <remarks>
        /// For troubleshooting
        /// <see href="https://stackoverflow.com/questions/704636/sending-email-through-gmail-smtp-server-with-c-sharp" />
        /// </remarks>
        public async Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            using (var msg = new MailMessage(_fromAddress.Address, email, subject, htmlMessage) { IsBodyHtml = true })
            {
                await _client.SendMailAsync(msg);
            }
        }
    }
}