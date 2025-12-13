using System;

namespace LendSecureSystem.DTOs.Repayments
{
    public class RepaymentResponseDto
    {
        public Guid RepaymentId { get; set; }
        public Guid LoanId { get; set; }
        public DateTime ScheduledDate { get; set; }
        public decimal PrincipalAmount { get; set; }
        public decimal InterestAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }
        public DateTime? PaidAt { get; set; }
        public decimal LateFee { get; set; }
    }
}
