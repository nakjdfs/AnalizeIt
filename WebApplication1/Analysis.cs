using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Xml;

namespace WebApplication1
{
	public class Element
	{
		[Key]
		public int Id { get; set; }
		public string ElementId { get; set; }
		public string Label { get; set; }
		public string Type { get; set; }

	}
	public class  BusisnessProcess : Element
	{
		public int AnalysisId { get; set; }
		public Analysis Analysis { get; set; }
	}
	public class ApplicationComponent : Element
	{
		public int AnalysisId { get; set; }
		public Analysis Analysis { get; set; }
	}

	public class AplicationComponent
	{
		[Key]
		public int Id { get; set; }
		public string ElementId { get; set; }
		public string Label { get; set; }
		public string Type { get; set; }
		public int AnalysisId { get; set; }
		public Analysis Analysis { get; set; }
	}

	public class Analysis
	{
		[Key]
		public int Id { get; set; }
		public string? Name { get; set; }
		public string? Description { get; set; }
		public string? FilePath { get; set; }
		public DateTime CreatedAt { get; set; }
		public DateTime UpdatedAt { get; set; }
		public int[][] MatrixA { get; set; } 
		public double CVariable { get; set; }

		public int UserId { get; set; }
		public User User { get; set; }

		public List<BusisnessProcess> BusinessProcesses { get; set; }
		public List<AplicationComponent> ApplicationComponents { get; set; }

		[NotMapped]
		public Dictionary<string, Element> ElementsById { get; set; }
		[NotMapped]
		public XmlNodeList relationships { get; set; }

		public Analysis(string name, string description, string filePath, int userId)
		{
			Name = name;
			Description = description;
			UserId = userId;
			FilePath = "./UploadedFiles/" + filePath;
			CreatedAt = DateTime.UtcNow;
			UpdatedAt = DateTime.UtcNow;
		}
		public void Update(string name, string description, string filePath)
		{
			Name = name;
			Description = description;
			FilePath = "./UploadedFiles/" + filePath;
			UpdatedAt = DateTime.UtcNow;
		}

		public void ComputeG_Grpaph()
		{
			this.BusinessProcesses = new List<BusisnessProcess>();
			this.ApplicationComponents = new List<AplicationComponent>();
			this.ElementsById = new Dictionary<string, Element>();

			XmlDocument doc = new XmlDocument();
			doc.Load(FilePath);
			string defaultNamespace = doc.DocumentElement.NamespaceURI;

			XmlNamespaceManager ns = new XmlNamespaceManager(doc.NameTable);
			ns.AddNamespace("nameSpace", defaultNamespace);
			XmlNodeList elementNodes = doc.SelectNodes("//nameSpace:elements/nameSpace:element", ns);
			this.relationships = doc.SelectNodes("//nameSpace:relationships/nameSpace:relationship", ns);

			foreach (XmlNode element in elementNodes)
			{
				string id = element.Attributes["identifier"]?.Value;
				string type = null;
				foreach (XmlAttribute attr in element.Attributes)
				{
					if (attr.Name == "xsi:type")
					{
						type = attr.Value;
						break;
					}
				}
				string label = element["label"]?.InnerText ?? "(No Label)";

				var el = new Element { ElementId = id, Label = label, Type = type };
				ElementsById[id] = el;

				if (type == "BusinessProcess")
					BusinessProcesses.Add(new BusisnessProcess { ElementId = id, Label = label, Type = type });
				//BusinessProcesses.Add(el);
				else if (type == "ApplicationComponent")
					ApplicationComponents.Add(new AplicationComponent { ElementId = id, Label = label, Type = type });
				//ApplicationComponents.Add(el);
			}
			foreach (var businessProcess in BusinessProcesses)
			{
				Console.WriteLine($"Business Process: {businessProcess.ElementId}, Label: {businessProcess.Label}");
			}
			foreach (var applicationComponent in ApplicationComponents)
			{
				Console.WriteLine($"Application Component: {applicationComponent.ElementId}, Label: {applicationComponent.Label}");
			}
		}

		public void ComputeMatrixA()
		{
			int n = BusinessProcesses.Count;
			int m = ApplicationComponents.Count;
			MatrixA = new int[n][];
			for (int i = 0; i < n; i++)
			{
				MatrixA[i] = new int[m];
			}

			foreach (XmlNode rel in relationships)
			{
				string source = rel.Attributes["source"]?.Value;
				string target = rel.Attributes["target"]?.Value;

				if (!ElementsById.ContainsKey(source) || !ElementsById.ContainsKey(target))
					continue;

				// Check if it's a BusinessProcess -> ApplicationComponent or vice versa
				for (int i = 0; i < n; i++)
				{
					for (int j = 0; j < m; j++)
					{
						if ((source == BusinessProcesses[i].ElementId && target == ApplicationComponents[j].ElementId) ||
							(target == BusinessProcesses[i].ElementId && source == ApplicationComponents[j].ElementId))
						{
							MatrixA[i][j] = 1;
						}
					}
				}
			}
		}
		public void ComputeCVariable()
		{
			int n = BusinessProcesses.Count;
			int m = ApplicationComponents.Count;
			// Step 1: Compute y[i] = number of components supporting process i
			double[] y = new double[n];
			for (int i = 0; i < n; i++)
			{
				int count = 0;
				for (int j = 0; j < m; j++)
					count += MatrixA[i][j];
				y[i] = count;
			}

			// Step 2: Linear regression to approximate f(x) = a*x + b
			double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
			for (int i = 0; i < n; i++)
			{
				double x = i + 1; // process number (starts from 1)
				sumX += x;
				sumY += y[i];
				sumXY += x * y[i];
				sumX2 += x * x;
			}

			double a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
			double b = (sumY - a * sumX) / n;

			// Step 3: Integrate f(x) = ax + b from x=1 to x=n
			double integralNumerator = (a / 2) * (n * n - 1) + b * (n - 1);

			// Step 4: Integrate constant function n from 1 to n
			double integralDenominator = n * (n - 1);

			this.CVariable = integralNumerator / integralDenominator;
		}

	}
}
