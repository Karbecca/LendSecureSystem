using LendSecureSystem.Data;
using LendSecureSystem.DTOs.Funding;
using LendSecureSystem.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LendSecureSystem.Services
{
    public class FundingService : IFundingService
    {
        private readonly ApplicationDbContext _context;

        public FundingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<FundingResponseDto> FundLoanAsync(Guid lenderId, FundLoanRequestDto request)
        {
            // Validate loan
            var loan = await _context.LoanRequests.FindAsync(request.LoanId);
            if (loan == null)
                throw new Exception("Loan not found.");

            if (loan.Status != "Approved")
                throw new Exception("Can only fund approved loans.");

            // Get lender's wallet
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.UserId == lenderId);

            if (wallet == null)
                throw new Exception("Wallet not found.");

            if (wallet.Balance < request.Amount)
                throw new Exception("Insufficient balance.");

            // Calculate total funded so far
            var totalFunded = await _context.LoanFundings
                .Where(f => f.LoanId == request.LoanId)
                .SumAsync(f => f.Amount);

            if (totalFunded + request.Amount > loan.AmountRequested)
                throw new Exception($"Funding amount exceeds loan request. Remaining: {loan.AmountRequested - totalFunded}");

            // Create funding record
            var funding = new LoanFunding
            {
                FundingId = Guid.NewGuid(),
                LoanId = request.LoanId,
                LenderId = lenderId,
                Amount = request.Amount,
                FundedAt = DateTime.UtcNow
            };

            _context.LoanFundings.Add(funding);

            // Update wallet balance
            wallet.Balance -= request.Amount;
            wallet.UpdatedAt = DateTime.UtcNow;

            // Create transaction record
            var transaction = new WalletTransaction
            {
                TxnId = Guid.NewGuid(),
                WalletId = wallet.WalletId,
                TxnType = "Debit - Loan Funding",
                Amount = request.Amount,
                Currency = wallet.Currency,
                RelatedLoanId = request.LoanId,
                CreatedAt = DateTime.UtcNow
            };

            _context.WalletTransactions.Add(transaction);

            // Check if loan is fully funded
            if (totalFunded + request.Amount >= loan.AmountRequested)
            {
                loan.Status = "Funded";
            }

            await _context.SaveChangesAsync();

            // Load lender for response
            var lender = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.UserId == lenderId);

            return new FundingResponseDto
            {
                FundingId = funding.FundingId,
                LoanId = funding.LoanId,
                LenderId = lenderId,
                LenderName = lender?.Profile != null 
                    ? $"{lender.Profile.FirstName} {lender.Profile.LastName}" 
                    : lender?.Email ?? "Unknown",
                Amount = funding.Amount,
                FundedAt = funding.FundedAt
            };
        }

        public async Task<List<FundingResponseDto>> GetMyFundingsAsync(Guid lenderId)
        {
            var fundings = await _context.LoanFundings
                .Where(f => f.LenderId == lenderId)
                .Include(f => f.Lender)
                .ThenInclude(l => l.Profile)
                .OrderByDescending(f => f.FundedAt)
                .ToListAsync();

            return fundings.Select(f => new FundingResponseDto
            {
                FundingId = f.FundingId,
                LoanId = f.LoanId,
                LenderId = f.LenderId,
                LenderName = f.Lender?.Profile != null 
                    ? $"{f.Lender.Profile.FirstName} {f.Lender.Profile.LastName}" 
                    : f.Lender?.Email ?? "Unknown",
                Amount = f.Amount,
                FundedAt = f.FundedAt
            }).ToList();
        }
    }
}
