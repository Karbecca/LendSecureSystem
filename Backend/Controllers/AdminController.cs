using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using LendSecureSystem.Data;
using LendSecureSystem.DTOs.Admin;
using LendSecureSystem.Services;

namespace LendSecureSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuditService _auditService;

        public AdminController(ApplicationDbContext context, IAuditService auditService)
        {
            _context = context;
            _auditService = auditService;
        }

        /// <summary>
        /// Get admin dashboard statistics
        /// </summary>
        [Authorize(Policy = "ViewDashboardPermission")]
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var stats = new DashboardStatsDto
                {
                    TotalUsers = await _context.Users.CountAsync(),
                    TotalBorrowers = await _context.Users.CountAsync(u => u.Role == "Borrower"),
                    TotalLenders = await _context.Users.CountAsync(u => u.Role == "Lender"),
                    TotalLoans = await _context.LoanRequests.CountAsync(),
                    PendingLoans = await _context.LoanRequests.CountAsync(l => l.Status == "Pending"),
                    ApprovedLoans = await _context.LoanRequests.CountAsync(l => l.Status == "Approved"),
                    FundedLoans = await _context.LoanRequests.CountAsync(l => l.Status == "Funded"),
                    PendingKYCs = await _context.KYCDocuments.CountAsync(k => k.Status == "Pending"),
                    TotalFundedAmount = await _context.LoanFundings.SumAsync(f => (decimal?)f.Amount) ?? 0,
                    TotalOutstandingAmount = await _context.Repayments
                        .Where(r => r.Status == "Pending")
                        .SumAsync(r => (decimal?)(r.PrincipalAmount + r.InterestAmount)) ?? 0
                };

                return Ok(new
                {
                    success = true,
                    data = stats
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        /// <summary>
        /// Get audit logs with pagination and filtering
        /// </summary>
        [Authorize(Policy = "ViewAuditLogsPermission")]
        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] string action = null)
        {
            try
            {
                var logs = await _auditService.GetAuditLogsAsync(page, pageSize, action);

                var logDtos = logs.Select(log => new AuditLogDto
                {
                    LogId = log.LogId,
                    UserId = log.UserId,
                    UserEmail = log.User?.Email ?? "Unknown",
                    Action = log.Action,
                    Details = log.Details,
                    IpAddress = log.IpAddress,
                    CreatedAt = log.CreatedAt
                }).ToList();

                // Get total count for pagination
                var totalCount = await _context.AuditLogs.CountAsync();

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        logs = logDtos,
                        pagination = new
                        {
                            page,
                            pageSize,
                            totalCount,
                            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        /// <summary>
        /// Get compliance report (summary of system activity)
        /// </summary>
        [Authorize(Policy = "ViewCompliancePermission")]
        [HttpGet("compliance-report")]
        public async Task<IActionResult> GetComplianceReport()
        {
            try
            {
                var report = new
                {
                    GeneratedAt = DateTime.UtcNow,
                    TotalUsers = await _context.Users.CountAsync(),
                    VerifiedUsers = await _context.KYCDocuments.CountAsync(k => k.Status == "Approved"),
                    TotalLoans = await _context.LoanRequests.CountAsync(),
                    TotalTransactions = await _context.WalletTransactions.CountAsync(),
                    TotalAuditLogs = await _context.AuditLogs.CountAsync(),
                    RecentActivity = await _context.AuditLogs
                        .OrderByDescending(a => a.CreatedAt)
                        .Take(10)
                        .Select(a => new
                        {
                            a.Action,
                            a.Details,
                            a.CreatedAt
                        })
                        .ToListAsync()
                };

                return Ok(new
                {
                    success = true,
                    data = report
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}