using LendSecureSystem.DTOs.Funding;
using LendSecureSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace LendSecureSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FundingController : ControllerBase
    {
        private readonly IFundingService _fundingService;
        private readonly IAuditService _auditService;

        public FundingController(IFundingService fundingService, IAuditService auditService)
        {
            _fundingService = fundingService;
            _auditService = auditService;
        }

        [HttpPost("fund-loan")]
        [Authorize(Roles = "Lender")]
        public async Task<IActionResult> FundLoan([FromBody] FundLoanRequestDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) return Unauthorized(new { message = "User ID not found in token." });
                var userId = Guid.Parse(userIdClaim.Value);

                var result = await _fundingService.FundLoanAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("my-fundings")]
        [Authorize(Roles = "Lender")]
        public async Task<IActionResult> GetMyFundings()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized(new { message = "User ID not found in token." });
            var userId = Guid.Parse(userIdClaim.Value);

            var result = await _fundingService.GetMyFundingsAsync(userId);
            return Ok(result);
        }

        [HttpGet("my-audit-logs")]
        [Authorize(Roles = "Lender")]
        public async Task<IActionResult> GetMyAuditLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized(new { message = "User ID not found in token." });
            var userId = Guid.Parse(userIdClaim.Value);

            var logs = await _auditService.GetUserAuditLogsAsync(userId, page, pageSize);

            var logDtos = logs.Select(log => new
            {
                logId = log.LogId,
                action = log.Action,
                details = log.Details,
                ipAddress = log.IpAddress,
                createdAt = log.CreatedAt
            }).ToList();

            return Ok(logDtos);
        }
    }
}
