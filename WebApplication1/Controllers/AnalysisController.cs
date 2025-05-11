using Aspose.Pdf.Text;
using Aspose.Pdf;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Asn1.X509;
using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;
using WebApplication1.Data;

namespace WebApplication1.Controllers
{
	public class CreateAnalysisDto
	{
		public string Name { get; set; }
		public string Description { get; set; }
		public string FileName { get; set; }
		public int UserId { get; set; }
	}

	[ApiController]
	[Route("[controller]")]
	public class AnalysisController : Controller
	{
		private readonly ILogger<AnalysisController> _logger;
		private readonly AppDbContext _context;

		public AnalysisController(ILogger<AnalysisController> logger, AppDbContext context)
		{
			_logger = logger;
			_context = context;
		}

		// POST: AnalysisController/UploadFile

		[Authorize]
		[HttpPost("upload-file")]
		public async Task<IActionResult> AddFile(IFormFile xmlFile)
		{
			if (xmlFile == null || xmlFile.Length == 0 || Path.GetExtension(xmlFile.FileName) != ".xml")
			{
				return BadRequest("Uploaded file was not .xml or corrupted");
			}

			var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "UploadedFiles");
			Directory.CreateDirectory(uploadsFolder);

			var fileNameWithoutExt = Path.GetFileNameWithoutExtension(Path.GetFileName(xmlFile.FileName));
			var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
			var newFileName = $"{fileNameWithoutExt}_{timestamp}.xml";

			var filePath = Path.Combine(uploadsFolder, newFileName);

			using (var stream = new FileStream(filePath, FileMode.Create))
			{
				await xmlFile.CopyToAsync(stream);
			}

			return Ok(new { message = "File was succesfully uploaded!", fileName= newFileName });
		}

		// POST: AnalysisController/CreateAnalysis
		[Authorize]
		[HttpPost("create-analysis")]
		public async Task<IActionResult> AnalysisCreation([FromBody] CreateAnalysisDto request)
		{
			var name = request.Name;
			var description = request.Description;
			var fileName = request.FileName;
			var userId = request.UserId;

			var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
			if (user == null)
			{
				return BadRequest("User not found.");
			}
			if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(fileName) || string.IsNullOrEmpty(description))
			{
				return BadRequest("Fields are empty");
			}
			Analysis analysis = new Analysis(name, description, fileName, userId);
			analysis.ComputeG_Grpaph();
			analysis.ComputeMatrixA();
			analysis.ComputeCVariable();
			try
			{
				_context.Analyses.Add(analysis);
				await _context.SaveChangesAsync();
			}
			catch (Exception ex)
			{
				return BadRequest($"Error: {ex.Message}");
			}

			return Ok(new { message = "Analysis created successfully", analysisId = analysis.Id});
		}
		
		[Authorize]
		[HttpGet("get-analyses/{userId}")]
		public async Task<IActionResult> GetAllAnalyses(int userId)
		{
			var user = await _context.Users.Include(u => u.Analyses).FirstOrDefaultAsync(u => u.Id == userId);
			if (user == null)
			{
				return NotFound("User not found");
			}

			var analyses = user.Analyses;
			return Ok(analyses);
		}

		[Authorize]
		[HttpGet("get-analysis")]
		public async Task<IActionResult> GetAnalysisById([FromQuery] int id,[FromQuery] int userId)
		{
			var analysis = await _context.Analyses
				.Include(a => a.BusinessProcesses)
				.Include(a => a.ApplicationComponents)
				.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
			if (analysis == null)
			{
				return NotFound("Analysis not found");
			}
			return Ok(analysis);
		}

		[Authorize]
		[HttpGet("generate-report")]
		public async Task<IActionResult> GenerateReport([FromQuery] int analysisId)
		{
			var analysis = await _context.Analyses
				.Include(a => a.ApplicationComponents)
				.Include(a => a.BusinessProcesses)
				.FirstOrDefaultAsync(a => a.Id == analysisId);
			if (analysis == null)
				return NotFound("Analysis not found");

			var doc = new Aspose.Pdf.Document();
			var page = doc.Pages.Add();
			if (analysis.ApplicationComponents.Count > 20)
			{
				page.PageInfo.Width = PageSize.A2.Width * (analysis.ApplicationComponents.Count % 5); 
				page.PageInfo.Height = PageSize.A3.Height;
			}
			

			// Information
			page.Paragraphs.Add(new Aspose.Pdf.Text.TextFragment($"Report for: {analysis.Name}") { TextState = { FontSize = 18, FontStyle = FontStyles.Bold } });
			page.Paragraphs.Add(new Aspose.Pdf.Text.TextFragment($"Description: {analysis.Description}"));
			page.Paragraphs.Add(new Aspose.Pdf.Text.TextFragment($"C-Variable: {analysis.CVariable}"));
			page.Paragraphs.Add(new Aspose.Pdf.Text.TextFragment($"Created At: {analysis.CreatedAt:yyyy-MM-dd HH:mm}"));
			page.Paragraphs.Add(new Aspose.Pdf.Text.TextFragment(" "));

			// Table
			var table = new Aspose.Pdf.Table
			{
				ColumnWidths = string.Join(" ", Enumerable.Repeat("50", analysis.ApplicationComponents.Count + 1)),
				DefaultCellTextState = new TextState { FontSize = 10 },
				DefaultCellPadding = new MarginInfo(4, 2, 4, 2),
				Border = new BorderInfo(BorderSide.All, 0.5f)
			};

			var headerRow = table.Rows.Add();
			headerRow.Cells.Add(" ");
			foreach (var ac in analysis.ApplicationComponents)
			{
				headerRow.Cells.Add(ac.Label);
			}

			for (int i = 0; i < analysis.MatrixA.Length; i++)
			{
				var row = table.Rows.Add();
				string rowLabel = (i < analysis.BusinessProcesses.Count) ? analysis.BusinessProcesses[i].Label : $"Row{i + 1}";
				row.Cells.Add(rowLabel);

				for (int j = 0; j < analysis.MatrixA[i].Length; j++)
				{
					row.Cells.Add(analysis.MatrixA[i][j].ToString());
				}
			}

			page.Paragraphs.Add(table);

			// Save File
			var reportsFolder = Path.Combine(Directory.GetCurrentDirectory(), "GeneratedReports");
			Directory.CreateDirectory(reportsFolder);
			var fileName = $"AnalysisReport_{analysisId}_{DateTime.UtcNow.Ticks}.pdf";
			var filePath = Path.Combine(reportsFolder, fileName);
			doc.Save(filePath);

			// Return File
			var stream = new MemoryStream(System.IO.File.ReadAllBytes(filePath));
			return File(stream.ToArray(), "application/pdf", fileName);
		}


		[Authorize]
		[HttpDelete("delete-analysis")]
		public async Task<IActionResult> DeleteAnalysis([FromQuery] int id, [FromQuery] int userId )
		{
			var analysis = await _context.Analyses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
			if (analysis == null)
			{
				return NotFound("Analysis not found");
			}
			try
			{
				_context.Analyses.Remove(analysis);
				await _context.SaveChangesAsync();
			}
			catch (Exception ex)
			{
				return BadRequest($"Error: {ex.Message}");
			}

			return Ok("Analysis has been deleted");
		}
	}
}
