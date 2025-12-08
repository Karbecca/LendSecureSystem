using System;

namespace LendSecureSystem.DTOs.Loans
{
    public class LoanResponseDto
    {
        public Guid LoanId { get; set; }
        public Guid BorrowerId { get; set; }
        public string BorrowerName { get; set; }
        public decimal AmountRequested { get; set; }
        public string Currency { get; set; }
        public string Purpose { get; set; }
        public short TermMonths { get; set; }
        public decimal InterestRate { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
    }
}
