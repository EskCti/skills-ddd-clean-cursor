using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace RetailOps.Api.Controllers
{
    [ApiController]
    [Route("api/metrics")]
    public class MetricsController : ControllerBase
    {
        private readonly ILogger<MetricsController> _logger;
        private readonly string _metricsDataPath;

        public MetricsController(ILogger<MetricsController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _metricsDataPath = configuration["Metrics:DataPath"] 
                ?? "/home/eskokado/projetos/eskcti/saas/ecommerce_cs/.agents/skills/data/metrics";
        }

        /// <summary>
        /// Obtém métricas gerais do sistema OpenSpec
        /// </summary>
        [HttpGet("system")]
        public ActionResult<SystemMetricsResponse> GetSystemMetrics()
        {
            try
            {
                _logger.LogInformation("Obtendo métricas do sistema OpenSpec");
                
                var metrics = new SystemMetricsResponse
                {
                    Timestamp = DateTime.UtcNow,
                    Status = "operational",
                    Components = GetSystemComponentsStatus(),
                    Performance = GetPerformanceMetrics(),
                    BoundedContexts = GetBoundedContextsMetrics(),
                    Skills = GetSkillsMetrics(),
                    Cache = GetCacheMetrics(),
                    Quality = GetQualityMetrics(),
                    Productivity = GetProductivityMetrics()
                };

                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter métricas do sistema");
                return StatusCode(500, new { error = "Erro interno ao processar métricas" });
            }
        }

        /// <summary>
        /// Obtém métricas específicas de um Bounded Context
        /// </summary>
        [HttpGet("bc/{bcId}")]
        public ActionResult<BoundedContextMetricsResponse> GetBoundedContextMetrics(string bcId)
        {
            try
            {
                _logger.LogInformation("Obtendo métricas do BC: {BcId}", bcId);
                
                // Simulação de dados - em produção, buscar de banco de dados ou arquivos
                var metrics = new BoundedContextMetricsResponse
                {
                    BcId = bcId,
                    Name = GetBcName(bcId),
                    Status = GetBcStatus(bcId),
                    Timestamp = DateTime.UtcNow,
                    CompletionRate = GetBcCompletionRate(bcId),
                    TotalTasks = GetBcTotalTasks(bcId),
                    CompletedTasks = GetBcCompletedTasks(bcId),
                    Layers = GetBcLayersMetrics(bcId),
                    CacheEfficiency = GetBcCacheEfficiency(bcId),
                    EstimatedCompletion = GetBcEstimatedCompletion(bcId)
                };

                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter métricas do BC {BcId}", bcId);
                return StatusCode(500, new { error = $"Erro interno ao processar métricas do BC {bcId}" });
            }
        }

        /// <summary>
        /// Obtém métricas de performance de skills
        /// </summary>
        [HttpGet("skills/performance")]
        public ActionResult<SkillsPerformanceResponse> GetSkillsPerformance()
        {
            try
            {
                _logger.LogInformation("Obtendo métricas de performance de skills");
                
                var metrics = new SkillsPerformanceResponse
                {
                    Timestamp = DateTime.UtcNow,
                    TopUsedSkills = GetTopUsedSkills(),
                    PerformanceByStack = GetPerformanceByStack(),
                    AverageExecutionTime = GetAverageExecutionTime(),
                    SuccessRate = GetSkillsSuccessRate()
                };

                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter métricas de performance de skills");
                return StatusCode(500, new { error = "Erro interno ao processar métricas de skills" });
            }
        }

        /// <summary>
        /// Obtém histórico de métricas
        /// </summary>
        [HttpGet("history")]
        public ActionResult<MetricsHistoryResponse> GetMetricsHistory(
            [FromQuery] string? metricType,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int limit = 100)
        {
            try
            {
                _logger.LogInformation("Obtendo histórico de métricas: {MetricType}", metricType);
                
                var history = new MetricsHistoryResponse
                {
                    Timestamp = DateTime.UtcNow,
                    MetricType = metricType ?? "all",
                    Period = new DatePeriod
                    {
                        Start = startDate ?? DateTime.UtcNow.AddDays(-7),
                        End = endDate ?? DateTime.UtcNow
                    },
                    DataPoints = GetHistoricalDataPoints(metricType, startDate, endDate, limit)
                };

                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter histórico de métricas");
                return StatusCode(500, new { error = "Erro interno ao processar histórico de métricas" });
            }
        }

        /// <summary>
        /// Atualiza métricas do sistema (chamado pelo script de atualização)
        /// </summary>
        [HttpPost("update")]
        public ActionResult<UpdateMetricsResponse> UpdateMetrics([FromBody] UpdateMetricsRequest request)
        {
            try
            {
                _logger.LogInformation("Atualizando métricas do sistema");
                
                // Validar request
                if (string.IsNullOrEmpty(request.Source))
                {
                    return BadRequest(new { error = "Source é obrigatório" });
                }

                // Salvar métricas no histórico
                var timestamp = DateTime.UtcNow;
                var historyFile = Path.Combine(_metricsDataPath, $"metrics-{timestamp:yyyyMMddHHmmss}.json");
                
                var metricsData = new
                {
                    timestamp,
                    source = request.Source,
                    data = request.Data
                };

                var json = JsonSerializer.Serialize(metricsData, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                Directory.CreateDirectory(_metricsDataPath);
                System.IO.File.WriteAllText(historyFile, json);

                // Atualizar dashboard
                UpdateDashboardMetrics(request.Data);

                var response = new UpdateMetricsResponse
                {
                    Success = true,
                    Timestamp = timestamp,
                    Message = "Métricas atualizadas com sucesso",
                    HistoryFile = historyFile
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar métricas");
                return StatusCode(500, new { error = "Erro interno ao atualizar métricas" });
            }
        }

        /// <summary>
        /// Obtém alertas ativos do sistema
        /// </summary>
        [HttpGet("alerts")]
        public ActionResult<AlertsResponse> GetActiveAlerts()
        {
            try
            {
                _logger.LogInformation("Obtendo alertas ativos do sistema");
                
                var alerts = new AlertsResponse
                {
                    Timestamp = DateTime.UtcNow,
                    ActiveAlerts = GetActiveAlertsList(),
                    CriticalCount = GetCriticalAlertsCount(),
                    WarningCount = GetWarningAlertsCount(),
                    InfoCount = GetInfoAlertsCount()
                };

                return Ok(alerts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter alertas do sistema");
                return StatusCode(500, new { error = "Erro interno ao processar alertas" });
            }
        }

        #region Métodos Auxiliares (Simulação)

        private SystemComponentStatus[] GetSystemComponentsStatus()
        {
            return new[]
            {
                new SystemComponentStatus
                {
                    Name = "OpenSpec Core",
                    Status = "operational",
                    LastUpdated = DateTime.UtcNow.AddMinutes(-5),
                    Performance = 99.8m
                },
                new SystemComponentStatus
                {
                    Name = "Skills Engine",
                    Status = "operational",
                    LastUpdated = DateTime.UtcNow.AddMinutes(-3),
                    Performance = 450
                },
                new SystemComponentStatus
                {
                    Name = "Context Cache",
                    Status = "operational",
                    LastUpdated = DateTime.UtcNow.AddMinutes(-2),
                    Performance = 72
                },
                new SystemComponentStatus
                {
                    Name = "Validation System",
                    Status = "operational",
                    LastUpdated = DateTime.UtcNow.AddMinutes(-1),
                    Performance = 120
                },
                new SystemComponentStatus
                {
                    Name = "CI/CD Pipeline",
                    Status = "operational",
                    LastUpdated = DateTime.UtcNow.AddMinutes(-10),
                    Performance = 15
                }
            };
        }

        private PerformanceMetrics GetPerformanceMetrics()
        {
            return new PerformanceMetrics
            {
                AverageTaskTimeHours = 1.8m,
                TaskSuccessRate = 94.0m,
                CacheHitRate = 72.0m,
                AverageExecutionTimeMs = 450,
                ValidationErrorRate = 8.0m,
                AverageDeployTimeMinutes = 12
            };
        }

        private BoundedContextMetrics[] GetBoundedContextsMetrics()
        {
            return new[]
            {
                new BoundedContextMetrics
                {
                    BcId = "BC-001",
                    Name = "Auth e Usuários",
                    Status = "in_progress",
                    CompletionRate = 67.0m,
                    TotalTasks = 20,
                    CompletedTasks = 14,
                    Priority = "high"
                },
                new BoundedContextMetrics
                {
                    BcId = "BC-002",
                    Name = "Produtos e Catálogo",
                    Status = "planned",
                    CompletionRate = 0,
                    TotalTasks = 0,
                    CompletedTasks = 0,
                    Priority = "medium"
                }
            };
        }

        private SkillsMetrics GetSkillsMetrics()
        {
            return new SkillsMetrics
            {
                TotalSkills = 110,
                ByStack = new SkillsByStack
                {
                    CSharp = 42,
                    Vue = 28,
                    Android = 25,
                    TypeScript = 15
                }
            };
        }

        private CacheMetrics GetCacheMetrics()
        {
            return new CacheMetrics
            {
                TotalRequests = 1200,
                Hits = 864,
                Misses = 336,
                HitRate = 72.0m,
                MemoryUsageMb = 45.8m,
                EvictionCount = 23
            };
        }

        private QualityMetrics GetQualityMetrics()
        {
            return new QualityMetrics
            {
                TestCoverage = new TestCoverageMetrics
                {
                    Domain = 92.5m,
                    Application = 88.3m,
                    Infrastructure = 85.7m,
                    Presentation = 79.2m,
                    Overall = 86.4m
                },
                CodeAnalysis = new CodeAnalysisMetrics
                {
                    TotalLines = 12500,
                    ComplexFiles = 8,
                    DuplicationRate = 3.2m,
                    TechnicalDebtHours = 42
                },
                SecurityMetrics = new SecurityMetrics
                {
                    CriticalVulnerabilities = 0,
                    HighVulnerabilities = 2,
                    MediumVulnerabilities = 5,
                    SecurityTestsPassed = 98
                }
            };
        }

        private ProductivityMetrics GetProductivityMetrics()
        {
            return new ProductivityMetrics
            {
                DevelopmentVelocity = new DevelopmentVelocityMetrics
                {
                    TasksPerWeek = 12.5m,
                    StoryPointsPerSprint = 28,
                    AverageLeadTimeDays = 3.2m
                },
                DeveloperEfficiency = new[]
                {
                    new DeveloperEfficiency
                    {
                        Name = "Dev A",
                        TasksCompleted = 42,
                        AverageTimeHours = 1.8m
                    },
                    new DeveloperEfficiency
                    {
                        Name = "Dev B",
                        TasksCompleted = 38,
                        AverageTimeHours = 2.1m
                    },
                    new DeveloperEfficiency
                    {
                        Name = "Dev C",
                        TasksCompleted = 25,
                        AverageTimeHours = 2.4m
                    }
                }
            };
        }

        private string GetBcName(string bcId)
        {
            return bcId switch
            {
                "BC-001" => "Auth e Usuários",
                "BC-002" => "Produtos e Catálogo",
                _ => "Bounded Context Desconhecido"
            };
        }

        private string GetBcStatus(string bcId)
        {
            return bcId switch
            {
                "BC-001" => "in_progress",
                "BC-002" => "planned",
                _ => "unknown"
            };
        }

        private decimal GetBcCompletionRate(string bcId)
        {
            return bcId switch
            {
                "BC-001" => 67.0m,
                "BC-002" => 0,
                _ => 0
            };
        }

        private int GetBcTotalTasks(string bcId)
        {
            return bcId switch
            {
                "BC-001" => 20,
                "BC-002" => 0,
                _ => 0
            };
        }

        private int GetBcCompletedTasks(string bcId)
        {
            return bcId switch
            {
                "BC-001" => 14,
                "BC-002" => 0,
                _ => 0
            };
        }

        private BcLayerMetrics[] GetBcLayersMetrics(string bcId)
        {
            if (bcId != "BC-001") return Array.Empty<BcLayerMetrics>();

            return new[]
            {
                new BcLayerMetrics { Layer = "domain_csharp", Tasks = 3, Completed = 3, AverageTimeHours = 1.5m },
                new BcLayerMetrics { Layer = "application_csharp", Tasks = 3, Completed = 3, AverageTimeHours = 2.2m },
                new BcLayerMetrics { Layer = "infrastructure_csharp", Tasks = 3, Completed = 3, AverageTimeHours = 1.8m },
                new BcLayerMetrics { Layer = "presentation_csharp", Tasks = 1, Completed = 1, AverageTimeHours = 1.2m },
                new BcLayerMetrics { Layer = "frontend_vue", Tasks = 4, Completed = 2, AverageTimeHours = 1.6m },
                new BcLayerMetrics { Layer = "mobile_android", Tasks = 4, Completed = 0, AverageTimeHours = 0 },
                new BcLayerMetrics { Layer = "tests", Tasks = 2, Completed = 2, AverageTimeHours = 1.5m }
            };
        }

        private CacheEfficiencyMetrics GetBcCacheEfficiency(string bcId)
        {
            if (bcId != "BC-001") return new CacheEfficiencyMetrics();

            return new CacheEfficiencyMetrics
            {
                TotalCacheRequests = 68,
                CacheHits = 49,
                CacheMisses = 19,
                HitRate = 72.06m
            };
        }

        private DateTime? GetBcEstimatedCompletion(string bcId)
        {
            if (bcId != "BC-001") return null;

            return DateTime.UtcNow.AddDays(7); // Estimativa: 7 dias
        }

        private TopUsedSkill[] GetTopUsedSkills()
        {
            return new[]
            {
                new TopUsedSkill { Name = "Core Entity (C#)", UsageCount = 42 },
                new TopUsedSkill { Name = "Core Value Object (C#)", UsageCount = 38 },
                new TopUsedSkill { Name = "Core Use Case (C#)", UsageCount = 35 },
                new TopUsedSkill { Name = "Backend Controller (C#)", UsageCount = 28 },
                new TopUsedSkill { Name = "Backend Data (C#)", UsageCount = 25 }
            };
        }

        private PerformanceByStack[] GetPerformanceByStack()
        {
            return new[]
            {
                new PerformanceByStack { Stack = "C#", AverageTimeMs = 450, SuccessRate = 94.5m },
                new PerformanceByStack { Stack = "Vue", AverageTimeMs = 320, SuccessRate = 92.8m },
                new PerformanceByStack { Stack = "Android", AverageTimeMs = 580, SuccessRate = 89.3m }
            };
        }

        private decimal GetAverageExecutionTime()
        {
            return 450;
        }

        private decimal GetSkillsSuccessRate()
        {
            return 94.0m;
        }

        private HistoricalDataPoint[] GetHistoricalDataPoints(string? metricType, DateTime? startDate, DateTime? endDate, int limit)
        {
            // Simulação de dados históricos
            var dataPoints = new List<HistoricalDataPoint>();
            var start = startDate ?? DateTime.UtcNow.AddDays(-7);
            var end = endDate ?? DateTime.UtcNow;

            for (int i = 0; i < limit && i < 10; i++)
            {
                var date = start.AddHours(i * 2);
                dataPoints.Add(new HistoricalDataPoint
                {
                    Timestamp = date,
                    Value = 70 + (i * 3) + new Random().Next(-5, 5),
                    Metric = metricType ?? "cache_hit_rate"
                });
            }

            return dataPoints.ToArray();
        }

        private void UpdateDashboardMetrics(object data)
        {
            // Em produção, atualizar arquivo do dashboard ou banco de dados
            _logger.LogInformation("Dashboard atualizado com novas métricas");
        }

        private Alert[] GetActiveAlertsList()
        {
            return new[]
            {
                new Alert
                {
                    Id = "ALERT-001",
                    Type = "warning",
                    Component = "Validation System",
                    Message = "Taxa de erros de validação acima do limite (8%)",
                    CreatedAt = DateTime.UtcNow.AddHours(-2),
                    Priority = "medium"
                },
                new Alert
                {
                    Id = "ALERT-002",
                    Type = "info",
                    Component = "Cache System",
                    Message = "Cache hit rate atingiu 72% (meta: 70%)",
                    CreatedAt = DateTime.UtcNow.AddHours(-1),
                    Priority = "low"
                }
            };
        }

        private int GetCriticalAlertsCount() => 0;
        private int GetWarningAlertsCount() => 1;
        private int GetInfoAlertsCount() => 1;

        #endregion
    }

    #region Modelos de Request/Response

    public class UpdateMetricsRequest
    {
        public string Source { get; set; } = string.Empty;
        public object Data { get; set; } = new();
    }

    public class UpdateMetricsResponse
    {
        public bool Success { get; set; }
        public DateTime Timestamp { get; set; }
        public string Message { get; set; } = string.Empty;
        public string HistoryFile { get; set; } = string.Empty;
    }

    public class SystemMetricsResponse
    {
        public DateTime Timestamp { get; set; }
        public string Status { get; set; } = string.Empty;
        public SystemComponentStatus[] Components { get; set; } = Array.Empty<SystemComponentStatus>();
        public PerformanceMetrics Performance { get; set; } = new();
        public BoundedContextMetrics[] BoundedContexts { get; set; } = Array.Empty<BoundedContextMetrics>();
        public SkillsMetrics Skills { get; set; } = new();
        public CacheMetrics Cache { get; set; } = new();
        public QualityMetrics Quality { get; set; } = new();
        public ProductivityMetrics Productivity { get; set; } = new();
    }

    public class BoundedContextMetricsResponse
    {
        public string BcId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public decimal CompletionRate { get; set; }
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public BcLayerMetrics[] Layers { get; set; } = Array.Empty<BcLayerMetrics>();
        public CacheEfficiencyMetrics CacheEfficiency { get; set; } = new();
        public DateTime? EstimatedCompletion { get; set; }
    }

    public class SkillsPerformanceResponse
    {
        public DateTime Timestamp { get; set; }
        public TopUsedSkill[] TopUsedSkills { get; set; } = Array.Empty<TopUsedSkill>();
        public PerformanceByStack[] PerformanceByStack { get; set; } = Array.Empty<PerformanceByStack>();
        public decimal AverageExecutionTime { get; set; }
        public decimal SuccessRate { get; set; }
    }

    public class MetricsHistoryResponse
    {
        public DateTime Timestamp { get; set; }
        public string MetricType { get; set; } = string.Empty;
        public DatePeriod Period { get; set; } = new();
        public HistoricalDataPoint[] DataPoints { get; set; } = Array.Empty<HistoricalDataPoint>();
    }

    public class AlertsResponse
    {
        public DateTime Timestamp { get; set; }
        public Alert[] ActiveAlerts { get; set; } = Array.Empty<Alert>();
        public int CriticalCount { get; set; }
        public int WarningCount { get; set; }
        public int InfoCount { get; set; }
    }

    #endregion

    #region Modelos de Dados

    public class SystemComponentStatus
    {
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime LastUpdated { get; set; }
        public decimal Performance { get; set; }
    }

    public class PerformanceMetrics
    {
        public decimal AverageTaskTimeHours { get; set; }
        public decimal TaskSuccessRate { get; set; }
        public decimal CacheHitRate { get; set; }
        public decimal AverageExecutionTimeMs { get; set; }
        public decimal ValidationErrorRate { get; set; }
        public decimal AverageDeployTimeMinutes { get; set; }
    }

    public class BoundedContextMetrics
    {
        public string BcId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal CompletionRate { get; set; }
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public string Priority { get; set; } = string.Empty;
    }

    public class SkillsMetrics
    {
        public int TotalSkills { get; set; }
        public SkillsByStack ByStack { get; set; } = new();
    }

    public class SkillsByStack
    {
        public int CSharp { get; set; }
        public int Vue { get; set; }
        public int Android { get; set; }
        public int TypeScript { get; set; }
    }

    public class CacheMetrics
    {
        public int TotalRequests { get; set; }
        public int Hits { get; set; }
        public int Misses { get; set; }
        public decimal HitRate { get; set; }
        public decimal MemoryUsageMb { get; set; }
        public int EvictionCount { get; set; }
    }

    public class QualityMetrics
    {
        public TestCoverageMetrics TestCoverage { get; set; } = new();
        public CodeAnalysisMetrics CodeAnalysis { get; set; } = new();
        public SecurityMetrics SecurityMetrics { get; set; } = new();
    }

    public class TestCoverageMetrics
    {
        public decimal Domain { get; set; }
        public decimal Application { get; set; }
        public decimal Infrastructure { get; set; }
        public decimal Presentation { get; set; }
        public decimal Overall { get; set; }
    }

    public class CodeAnalysisMetrics
    {
        public int TotalLines { get; set; }
        public int ComplexFiles { get; set; }
        public decimal DuplicationRate { get; set; }
        public int TechnicalDebtHours { get; set; }
    }

    public class SecurityMetrics
    {
        public int CriticalVulnerabilities { get; set; }
        public int HighVulnerabilities { get; set; }
        public int MediumVulnerabilities { get; set; }
        public int SecurityTestsPassed { get; set; }
    }

    public class ProductivityMetrics
    {
        public DevelopmentVelocityMetrics DevelopmentVelocity { get; set; } = new();
        public DeveloperEfficiency[] DeveloperEfficiency { get; set; } = Array.Empty<DeveloperEfficiency>();
    }

    public class DevelopmentVelocityMetrics
    {
        public decimal TasksPerWeek { get; set; }
        public int StoryPointsPerSprint { get; set; }
        public decimal AverageLeadTimeDays { get; set; }
    }

    public class DeveloperEfficiency
    {
        public string Name { get; set; } = string.Empty;
        public int TasksCompleted { get; set; }
        public decimal AverageTimeHours { get; set; }
    }

    public class BcLayerMetrics
    {
        public string Layer { get; set; } = string.Empty;
        public int Tasks { get; set; }
        public int Completed { get; set; }
        public decimal AverageTimeHours { get; set; }
    }

    public class CacheEfficiencyMetrics
    {
        public int TotalCacheRequests { get; set; }
        public int CacheHits { get; set; }
        public int CacheMisses { get; set; }
        public decimal HitRate { get; set; }
    }

    public class TopUsedSkill
    {
        public string Name { get; set; } = string.Empty;
        public int UsageCount { get; set; }
    }

    public class PerformanceByStack
    {
        public string Stack { get; set; } = string.Empty;
        public decimal AverageTimeMs { get; set; }
        public decimal SuccessRate { get; set; }
    }

    public class DatePeriod
    {
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
    }

    public class HistoricalDataPoint
    {
        public DateTime Timestamp { get; set; }
        public decimal Value { get; set; }
        public string Metric { get; set; } = string.Empty;
    }

    public class Alert
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Component { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string Priority { get; set; } = string.Empty;
    }

    #endregion
}