using System;
using System.ComponentModel.DataAnnotations;

namespace LendSecureSystem.DTOs.Repayments
{
    public class MakePaymentRequestDto
    {
        [Required]
        public Guid RepaymentId { get; set; }
    }
}
