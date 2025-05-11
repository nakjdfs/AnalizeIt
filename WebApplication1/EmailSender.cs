using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using System.Runtime;
using System.Threading.Tasks;

namespace WebApplication1
{
	public class EmailSettings
	{
		public string SmtpServer { get; set; }
		public int SmtpPort { get; set; }
		public string Username { get; set; }
		public string AppPassword { get; set; }
	}

	public class EmailSender
	{
		private readonly EmailSettings _settings;

		public EmailSender(IOptions<EmailSettings> options)
		{
			_settings = options.Value;
		}

		public async Task SendEmailAsync(string toEmail, string subject, string body)
		{
			var email = new MimeMessage();
			email.From.Add(MailboxAddress.Parse(_settings.Username));
			email.To.Add(MailboxAddress.Parse(toEmail));
			email.Subject = subject;
			email.Body = new TextPart("html") { Text = body };

			try
			{
				using var smtp = new SmtpClient();
				await smtp.ConnectAsync(_settings.SmtpServer, _settings.SmtpPort, SecureSocketOptions.StartTls);
				await smtp.AuthenticateAsync(_settings.Username, _settings.AppPassword);
				await smtp.SendAsync(email);
				await smtp.DisconnectAsync(true);
			}
			catch (Exception ex)
			{
				Console.WriteLine("Error in sending email: " + ex.Message);
				throw; 
			}
		}
	}
}
