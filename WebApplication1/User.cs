using System.ComponentModel.DataAnnotations;

namespace WebApplication1
{
	public class User
	{
		[Key]
		public int Id { get; set; }
		public string? Login { get; set; }
		public string? Password { get; set; }
		public string? Email { get; set; }
		public bool IsVerified { get; set; } = false;
		public List<Analysis>? Analyses { get; set; }
	}
}
