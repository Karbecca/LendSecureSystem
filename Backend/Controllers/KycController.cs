using LendSecureSystem.DTOs.KYC;
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
    public class KycController : ControllerBase
    {
        private readonly IKycService _kycService;

        public KycController(IKycService kycService)
        {
            _kycService = kycService;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadDocument([FromForm] KycUploadRequestDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) return Unauthorized(new { message = "User ID not found in token." });
                var userId = Guid.Parse(userIdClaim.Value);
                var result = await _kycService.UploadDocumentAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("my-documents")]
        public async Task<IActionResult> GetMyDocuments()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized(new { message = "User ID not found in token." });
            var userId = Guid.Parse(userIdClaim.Value);
            var result = await _kycService.GetUserDocumentsAsync(userId);
            return Ok(result);
        }

        [HttpGet("documents")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllDocuments()
        {
            var result = await _kycService.GetAllDocumentsAsync();
            return Ok(result);
        }

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveDocument(Guid id)
        {
            try
            {
                var reviewerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (reviewerIdClaim == null) return Unauthorized(new { message = "Reviewer ID not found in token." });
                var reviewerId = Guid.Parse(reviewerIdClaim.Value);
                var result = await _kycService.ReviewDocumentAsync(id, reviewerId, "Approved");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectDocument(Guid id)
        {
            try
            {
                var reviewerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (reviewerIdClaim == null) return Unauthorized(new { message = "Reviewer ID not found in token." });
                var reviewerId = Guid.Parse(reviewerIdClaim.Value);
                var result = await _kycService.ReviewDocumentAsync(id, reviewerId, "Rejected");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
