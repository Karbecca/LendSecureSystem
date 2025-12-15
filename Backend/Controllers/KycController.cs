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
            // READ-ONLY: Admin can view KYC status but CANNOT approve/reject
            // Professor requirement: AI-only verification
            var result = await _kycService.GetAllDocumentsAsync();
            return Ok(result);
        }

        // REMOVED: Admin approval endpoints disabled per professor's requirements
        // KYC verification is AI-only through face-api.js client-side detection
        // If AI verifies (IsVerified=true), status = Approved automatically
        // No manual admin intervention allowed

        /*
        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveDocument(Guid id)
        {
            // DISABLED: Professor requires AI-only KYC verification
            return StatusCode(403, new { message = "Admin KYC approval is disabled. System uses AI-only verification." });
        }

        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectDocument(Guid id)
        {
            // DISABLED: Professor requires AI-only KYC verification
            return StatusCode(403, new { message = "Admin KYC rejection is disabled. System uses AI-only verification." });
        }
        */
    }
}
