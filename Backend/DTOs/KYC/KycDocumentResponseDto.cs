using System;

namespace LendSecureSystem.DTOs.KYC
{
    public class KycDocumentResponseDto
    {
        public Guid DocId { get; set; }
        public Guid UserId { get; set; }
        public string DocType { get; set; }
        public string FilePath { get; set; }
        public string Status { get; set; }
        public Guid? ReviewerId { get; set; }
        public DateTime? ReviewedAt { get; set; }
        
        // User information
        public UserInfoDto User { get; set; }
    }

    public class UserInfoDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
    }
}
