using LendSecureSystem.Data;
using LendSecureSystem.DTOs.Wallets;
using LendSecureSystem.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LendSecureSystem.Services
{
    public class WalletService : IWalletService
    {
        private readonly ApplicationDbContext _context;

        public WalletService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<WalletResponseDto> GetWalletAsync(Guid userId)
        {
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null)
                throw new Exception("Wallet not found.");

            return new WalletResponseDto
            {
                WalletId = wallet.WalletId,
                Balance = wallet.Balance,
                Currency = wallet.Currency,
                UpdatedAt = wallet.UpdatedAt
            };
        }

        public async Task<List<TransactionResponseDto>> GetTransactionsAsync(Guid userId)
        {
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null)
                throw new Exception("Wallet not found.");

            var transactions = await _context.WalletTransactions
                .Where(t => t.WalletId == wallet.WalletId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TransactionResponseDto
                {
                    TxnId = t.TxnId,
                    TxnType = t.TxnType,
                    Amount = t.Amount,
                    Currency = t.Currency,
                    RelatedLoanId = t.RelatedLoanId,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();

            return transactions;
        }

        public async Task<WalletResponseDto> AddFundsAsync(Guid userId, decimal amount)
        {
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null)
                throw new Exception("Wallet not found.");

            wallet.Balance += amount;
            wallet.UpdatedAt = DateTime.UtcNow;

            // Create transaction record
            var transaction = new WalletTransaction
            {
                TxnId = Guid.NewGuid(),
                WalletId = wallet.WalletId,
                TxnType = "Credit",
                Amount = amount,
                Currency = wallet.Currency,
                CreatedAt = DateTime.UtcNow
            };

            _context.WalletTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            return new WalletResponseDto
            {
                WalletId = wallet.WalletId,
                Balance = wallet.Balance,
                Currency = wallet.Currency,
                UpdatedAt = wallet.UpdatedAt
            };
        }

        public async Task<WalletResponseDto> WithdrawFundsAsync(Guid userId, decimal amount)
        {
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null)
                throw new Exception("Wallet not found.");

            if (wallet.Balance < amount)
                throw new Exception("Insufficient funds.");

            wallet.Balance -= amount;
            wallet.UpdatedAt = DateTime.UtcNow;

            // Create transaction record
            var transaction = new WalletTransaction
            {
                TxnId = Guid.NewGuid(),
                WalletId = wallet.WalletId,
                TxnType = "Debit",
                Amount = amount,
                Currency = wallet.Currency,
                CreatedAt = DateTime.UtcNow
            };

            _context.WalletTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            return new WalletResponseDto
            {
                WalletId = wallet.WalletId,
                Balance = wallet.Balance,
                Currency = wallet.Currency,
                UpdatedAt = wallet.UpdatedAt
            };
        }
    }
}
