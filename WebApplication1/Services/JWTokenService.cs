using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace WebApplication1.Services
{
	public class JwtSettings
	{
		public string SecretKey { get; set; }
		public string Issuer { get; set; }
		public string Audience { get; set; }
		public int ExpireMinutes { get; set; }
	}
	public class JwtTokenService
	{
		private readonly JwtSettings _settings;
		private readonly int TimeToExpire = 1;

		public JwtTokenService(IOptions<JwtSettings> options)
		{
			_settings = options.Value;
		}

		public string GenerateToken(int userId)
		{
			var claims = new[]
			{
			new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
			//new Claim(JwtRegisteredClaimNames.Email, email),
			new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
		};

			var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
			var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

			var token = new JwtSecurityToken(
				issuer: _settings.Issuer,
				audience: _settings.Audience,
				claims: claims,
				expires: DateTime.UtcNow.AddMinutes(_settings.ExpireMinutes),
				signingCredentials: creds);

			return new JwtSecurityTokenHandler().WriteToken(token);
		}

		public string GenerateEmailVerificationToken(int userId, string email)
		{
			var claims = new[]
			{
				new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
				new Claim(JwtRegisteredClaimNames.Email, email),
				new Claim("type", "email-verification"),
				new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
			};

			var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
			var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

			var token = new JwtSecurityToken(
				issuer: _settings.Issuer,
				audience: _settings.Audience,
				claims: claims,
				expires: DateTime.UtcNow.AddDays(TimeToExpire),
				signingCredentials: creds);

			return new JwtSecurityTokenHandler().WriteToken(token);
		}
		public string ValidateToken(string token)
		{
			var handler = new JwtSecurityTokenHandler();
			var principal = handler.ValidateToken(token, new TokenValidationParameters
			{
				ValidateIssuer = true,
				ValidateAudience = true,
				ValidIssuer = _settings.Issuer,
				ValidAudience = _settings.Audience,
				IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey)),
				ValidateLifetime = true,
				ValidateIssuerSigningKey = true
			}, out var validatedToken);

			var userId = principal.FindFirstValue(JwtRegisteredClaimNames.Sub);
			return userId;
		}
	}
}
