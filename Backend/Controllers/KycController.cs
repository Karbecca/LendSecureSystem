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

        // REMOVED: Admin KYC viewing disabled for PRIVACY
        // Professor requirement: KYC is AI-only verification with complete user privacy
        // Admins have NO ACCESS to KYC documents
        
        /*
        [HttpGet("documents")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllDocuments()
        {
            return StatusCode(403, new { message = "Admin access to KYC documents disabled for privacy." });
        }

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveDocument(Guid id)
        {
            return StatusCode(403, new { message = "Admin KYC approval disabled. System uses AI-only verification." });
        }

        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectDocument(Guid id)
        {
            return StatusCode(403, new { message = "Admin KYC rejection disabled. System uses AI-only verification." });
        }
        */
    }
}
