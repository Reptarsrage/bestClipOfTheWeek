using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace BestClipOfTheWeek.Services
{
    // This class is used by the application to send email for account confirmation and password reset.
    // For more details see https://go.microsoft.com/fwlink/?LinkID=532713
    public class EmailSender : IEmailSender
    {
        private readonly string _email;
        private readonly string _password;

        public EmailSender(string email, string password)
        {
            _email = email;
            _password = password;
        }

        public async Task SendEmailAsync(string email, string subject, string message)
        {
            var fromAddress = new MailAddress(_email, "Best Clip Of The Week");
            var toAddress = new MailAddress(email);

            using (var smtp = new SmtpClient
            {
                Host = "smtp.gmail.com",
                Port = 587,
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Credentials = new NetworkCredential(fromAddress.Address, _password),
                Timeout = 20000
            })
            using (var mail = new MailMessage(fromAddress, toAddress)
            {
                Subject = subject,
                Body = message
            })
            {
                await smtp.SendMailAsync(mail);
            }
        }
    }
}
