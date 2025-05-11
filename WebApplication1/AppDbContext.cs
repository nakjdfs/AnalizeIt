using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Text.Json;

namespace WebApplication1.Data
{
	public class AppDbContext : DbContext
	{
		public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) 
		{

		}
		public DbSet<Analysis> Analyses { get; set;}
		public DbSet<User> Users { get; set; }
		public DbSet<BusisnessProcess> BusinessProcesses { get; set; }
		public DbSet<AplicationComponent> ApplicationComponents { get; set; }
		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);
			modelBuilder.Entity<User>()
				.HasMany(u => u.Analyses)
				.WithOne(a => a.User)
				.HasForeignKey(a => a.UserId)
				.OnDelete(DeleteBehavior.Cascade);

			modelBuilder.Entity<Analysis>()
				.HasMany(a => a.BusinessProcesses)
				.WithOne(e => e.Analysis)
				.HasForeignKey(e => e.AnalysisId)
				.OnDelete(DeleteBehavior.Cascade);

			modelBuilder.Entity<Analysis>()
				.HasMany(a => a.ApplicationComponents)
				.WithOne(e => e.Analysis)
				.HasForeignKey(e => e.AnalysisId)
				.OnDelete(DeleteBehavior.Cascade);

			modelBuilder.Entity<Analysis>(entity =>
			{
				// converter MatrixA
				var matrixConverter = new ValueConverter<int[][], string>(
					v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
					v => JsonSerializer.Deserialize<int[][]>(v, (JsonSerializerOptions)null));

				entity.Property(e => e.MatrixA)
					  .HasConversion(matrixConverter)
					  .HasColumnType("jsonb");
			});
		}
	}
}
