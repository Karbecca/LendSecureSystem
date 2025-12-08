using LendSecureSystem.DTOs.Wallets;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LendSecureSystem.Services
{
    public interface IWalletService
    {
        Task<WalletResponseDto> GetWalletAsync(Guid userId);
        Task<List<TransactionResponseDto>> GetTransactionsAsync(Guid userId);
        Task<WalletResponseDto> AddFundsAsync(Guid userId, decimal amount);
    }
}
