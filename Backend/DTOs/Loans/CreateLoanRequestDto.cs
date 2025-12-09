using System.ComponentModel.DataAnnotations;

namespace LendSecureSystem.DTOs.Loans
{
    public class CreateLoanRequestDto
    {
        [Required]
        [Range(1000, 1000000, ErrorMessage = "Amount must be between 1,000 and 1,000,000")]
        public decimal Amount { get; set; }

        [Required]
        [Range(1, 60, ErrorMessage = "Term must be between 1 and 60 months")]
        public short TermMonths { get; set; }

        [Required]
        public string Purpose { get; set; }

        [Required]
        [Range(0, 100, ErrorMessage = "Interest rate must be between 0 and 100")]
        public decimal InterestRate { get; set; }
    }
}
