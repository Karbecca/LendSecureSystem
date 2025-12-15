using LendSecureSystem.DTOs.Wallets;
using System;
using System.Threading.Tasks;

namespace LendSecureSystem.Services
{
    public interface IPaymentService
    {
        Task<TransactionInitResponseDto> InitiateTransactionAsync(Guid userId, TransactionInitRequestDto request);
        Task<WalletResponseDto> ConfirmTransactionAsync(Guid userId, TransactionConfirmRequestDto request);
    }
}
