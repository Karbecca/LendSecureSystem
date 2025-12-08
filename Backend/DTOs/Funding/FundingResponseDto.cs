using System;

namespace LendSecureSystem.DTOs.Funding
{
    public class FundingResponseDto
    {
        public Guid FundingId { get; set; }
        public Guid LoanId { get; set; }
        public Guid LenderId { get; set; }
        public string LenderName { get; set; }
        public decimal Amount { get; set; }
        public DateTime FundedAt { get; set; }
    }
}
