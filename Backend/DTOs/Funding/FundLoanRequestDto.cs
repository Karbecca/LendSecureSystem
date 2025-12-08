using System;
using System.ComponentModel.DataAnnotations;

namespace LendSecureSystem.DTOs.Funding
{
    public class FundLoanRequestDto
    {
        [Required]
        public Guid LoanId { get; set; }

        [Required]
        [Range(100, 1000000, ErrorMessage = "Amount must be between 100 and 1,000,000")]
        public decimal Amount { get; set; }
    }
}
