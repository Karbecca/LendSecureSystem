using System;

namespace LendSecureSystem.DTOs.KYC
{
    public class KycDocumentResponseDto
    {
        public Guid DocId { get; set; }
        public string DocType { get; set; }
        public string FilePath { get; set; }
        public string Status { get; set; }
        public DateTime? UploadedAt { get; set; } // Assuming we want to show when it was uploaded, though Model doesn't have UploadedAt, it has CreatedAt? No, Model has no CreatedAt for KYCDocument? Let me check Model again.
    }
}
