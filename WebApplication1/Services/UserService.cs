namespace WebApplication1.Services
{
	public class UserService
	{
		public static string HashPassword(string password)
		{
			return BCrypt.Net.BCrypt.EnhancedHashPassword(password, 13);
		}

		public static bool VerifyPassword( string enteredPassword, string storedHashedPassword)
		{
			return BCrypt.Net.BCrypt.EnhancedVerify(enteredPassword, storedHashedPassword);
		}
	}
}
