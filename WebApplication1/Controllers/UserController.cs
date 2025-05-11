using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebApplication1.Data;
using WebApplication1.Services;

namespace WebApplication1.Controllers
{
	public class LoginDto
	{
		public string Login { get; set; }
		public string Password { get; set; }
	}
	public class RegistrationDto
	{
		public string Login { get; set; }
		public string Email { get; set; }
		public string Password { get; set; }
		public string RPassword { get; set; }

	}

	[Route("[controller]")]
	[ApiController]
	public class UserController : ControllerBase
	{
		public const string emailHead = "AnalyseIt account verification";
		public const string emailMessage = "To verify your account please follow the link:\n ";
		private readonly ILogger<AnalysisController> _logger;
		private readonly AppDbContext _context;
		private readonly EmailSender _emailSender;
		private readonly JwtTokenService _jwtTokenService;
		public UserController(ILogger<AnalysisController> logger, AppDbContext context, EmailSender emailSender, JwtTokenService jwtTokenService)
		{
			_logger = logger;
			_context = context;
			_emailSender = emailSender;
			_jwtTokenService = jwtTokenService;
		}
		[HttpPost("user-registration")]
		public async Task<IActionResult> UserRegistration([FromBody] RegistrationDto request)
		{
			var login = request.Login;
			var email = request.Email;
			var password = request.Password;
			var rpassword = request.RPassword;
			if (string.IsNullOrEmpty(login) || string.IsNullOrEmpty(email) 
				|| string.IsNullOrEmpty(password) || string.IsNullOrEmpty(rpassword))
			{
				return BadRequest("Please fill in all fields.");
			}
			if (_context.Users.Any(u => u.Login == login))
			{
				return BadRequest("User with this login already exists.");
			}
			if (_context.Users.Any(u => u.Email == email))
			{
				return BadRequest("This email is already registred by a different user");
			}
			if (password != rpassword)
			{
				return BadRequest("Passwords do not match.");
			}



			User user = new User
			{
				Login = login,
				Email = email,
				Password = UserService.HashPassword(password),
				IsVerified = false
			};

			try
			{
				_context.Users.Add(user);
				await _context.SaveChangesAsync();
			}
			catch (Exception ex)
			{
				return BadRequest($"Error: {ex.Message}");
			}

			string token = _jwtTokenService.GenerateEmailVerificationToken(user.Id, user.Email);
			string verificationLink = $"http://localhost:5173/verification?token={token}";
			await _emailSender.SendEmailAsync(email, emailHead, emailMessage + verificationLink);

			return Ok("User registration");
		}

		[HttpPost("login")]
		public IActionResult Login([FromBody] LoginDto request)
		{
			var login = request.Login;
			var password = request.Password;
			var user = _context.Users.FirstOrDefault(u => u.Login == login);
			if (user == null)
				return Unauthorized("Wrong login or password");
			if (!UserService.VerifyPassword(password, user.Password))
				return Unauthorized("Wrong login or password");
			if (!user.IsVerified)
				return Unauthorized("User is not verified. Please check your email.");

			try
			{
				var userToken = _jwtTokenService.GenerateToken(user.Id);
				return Ok(new { userToken });
			}
			catch (Exception ex)
			{
				return BadRequest($"Error: {ex.Message}");
			}
		}

		[HttpGet("verify-email")]
		public async Task<IActionResult> VerifyEmail([FromQuery] string token, [FromServices] IOptions<JwtSettings> jwtOptions)
		{
			Console.WriteLine(token);
			var jwtSettings = jwtOptions.Value;
			var tokenHandler = new JwtSecurityTokenHandler();

			try
			{
				var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
				{
					ValidateIssuer = true,
					ValidateAudience = true,
					ValidateLifetime = true,
					ValidateIssuerSigningKey = true,
					ValidIssuer = jwtSettings.Issuer,
					ValidAudience = jwtSettings.Audience,
					IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey))
				}, out var validatedToken);

				var userIdStr = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
							 ?? principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
				Console.WriteLine(userIdStr);

				if (!int.TryParse(userIdStr, out int userId))
				{
					return BadRequest("Invalid token payload.");
				}

				var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
				if (user == null) return NotFound("User not found.");

				user.IsVerified = true;
				await _context.SaveChangesAsync();

				return Ok("Email confirmed successfully.");
			}
			catch (SecurityTokenException)
			{
				return BadRequest("Invalid or expired token.");
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Internal error: {ex.Message}");
			}
		}

		[HttpPost("logout")]
		public IActionResult Logout()
		{
			try
			{
				Response.Cookies.Delete("userToken");
				return Ok(new { message = "You have been logged out" });
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = ex.Message });
			}
		}

		[Authorize]
		[HttpDelete("delete-user/{id}")]
		public async Task<IActionResult> DeleteUser(int id)
		{
			var user = await _context.Users.FindAsync(id);
			if (user == null)
			{
				return NotFound("User not found");
			}
			try {
				_context.Users.Remove(user);
				await _context.SaveChangesAsync();
			}
			catch (Exception ex)
			{
				return BadRequest($"Error: {ex.Message}");
			}

			return Ok("User succesfully deleted");
		}

	}
}
