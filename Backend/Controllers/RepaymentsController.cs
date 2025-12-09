using LendSecureSystem.DTOs.Repayments;
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
    public class RepaymentsController : ControllerBase
    {
        private readonly IRepaymentService _repaymentService;

        public RepaymentsController(IRepaymentService repaymentService)
        {
            _repaymentService = repaymentService;
        }

        [HttpGet("loan/{loanId}")]
        public async Task<IActionResult> GetLoanRepayments(Guid loanId)
        {
            var result = await _repaymentService.GetLoanRepaymentsAsync(loanId);
            return Ok(result);
        }

        [HttpGet("my-repayments")]
        [Authorize(Roles = "Borrower")]
        public async Task<IActionResult> GetMyRepayments()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized(new { message = "User ID not found in token." });
            var userId = Guid.Parse(userIdClaim.Value);

            var result = await _repaymentService.GetMyRepaymentsAsync(userId);
            return Ok(result);
        }

        [HttpPost("pay")]
        [Authorize(Roles = "Borrower")]
        public async Task<IActionResult> MakePayment([FromBody] MakePaymentRequestDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) return Unauthorized(new { message = "User ID not found in token." });
                var userId = Guid.Parse(userIdClaim.Value);

                var result = await _repaymentService.MakePaymentAsync(userId, request.RepaymentId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
