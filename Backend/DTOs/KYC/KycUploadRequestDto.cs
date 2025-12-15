using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace LendSecureSystem.DTOs.KYC
{
    public class KycUploadRequestDto
    {
        [Required]
        public IFormFile File { get; set; }

        [Required]
        public string DocType { get; set; }

        public bool IsVerified { get; set; } = false; // Set by Frontend AI
    }
}
