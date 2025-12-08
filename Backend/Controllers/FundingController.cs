using LendSecureSystem.DTOs.Funding;
using LendSecureSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
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

        public FundingController(IFundingService fundingService)
        {
            _fundingService = fundingService;
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
    }
}
