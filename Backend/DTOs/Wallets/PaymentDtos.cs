using System;

namespace LendSecureSystem.DTOs.Wallets
{
    public class TransactionInitRequestDto
    {
        public string Type { get; set; } // "Deposit" or "Withdraw"
        public decimal Amount { get; set; }
        public string Provider { get; set; } // "MTN", "Airtel", "BK", "Equity", "Visa"
        public string AccountNumber { get; set; } // Phone or Account/Card
        public string Email { get; set; } // To send the OTP to
    }

    public class TransactionInitResponseDto
    {
        public Guid TxnId { get; set; }
        public string Status { get; set; }
        public string Message { get; set; }
        public string DevelopmentOtp { get; set; } // For demo purposes only
    }

    public class TransactionConfirmRequestDto
    {
        public Guid TxnId { get; set; }
        public string Otp { get; set; }
    }
}
