using System;

namespace LendSecureSystem.DTOs.Wallets
{
    public class WalletResponseDto
    {
        public Guid WalletId { get; set; }
        public decimal Balance { get; set; }
        public string Currency { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
