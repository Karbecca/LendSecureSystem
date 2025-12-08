using System;

namespace LendSecureSystem.DTOs.Wallets
{
    public class TransactionResponseDto
    {
        public Guid TxnId { get; set; }
        public string TxnType { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public Guid? RelatedLoanId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
