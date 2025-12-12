using LendSecureSystem.Data;
using LendSecureSystem.DTOs.Repayments;
using LendSecureSystem.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LendSecureSystem.Services
{
    public class RepaymentService : IRepaymentService
    {
        private readonly ApplicationDbContext _context;

        public RepaymentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task GenerateScheduleAsync(Guid loanId)
        {
            var loan = await _context.LoanRequests.FindAsync(loanId);
            if (loan == null)
                throw new Exception("Loan not found.");

            // Check if schedule already exists
            var existingSchedule = await _context.Repayments
                .AnyAsync(r => r.LoanId == loanId);

            if (existingSchedule)
                return; // Schedule already generated

            // Calculate repayment amounts
            var totalAmount = loan.AmountRequested;
            var interestRate = loan.InterestRate / 100m; // Convert percentage to decimal
            var termMonths = loan.TermMonths;
            
            // Simple interest calculation
            var totalInterest = totalAmount * interestRate * (termMonths / 12m);
            var totalRepayment = totalAmount + totalInterest;
            
            // 4 weekly installments
            var numberOfPayments = 4;
            var installmentAmount = totalRepayment / numberOfPayments;
            var principalPerPayment = totalAmount / numberOfPayments;
            var interestPerPayment = totalInterest / numberOfPayments;

            // Generate 4 weekly repayments
            for (int i = 0; i < numberOfPayments; i++)
            {
                var repayment = new Repayment
                {
                    RepaymentId = Guid.NewGuid(),
                    LoanId = loanId,
                    ScheduledDate = DateTime.UtcNow.AddDays(7 * (i + 1)), // Week 1, 2, 3, 4
                    PrincipalAmount = principalPerPayment,
                    InterestAmount = interestPerPayment,
                    Status = "Pending"
                };

                _context.Repayments.Add(repayment);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<List<RepaymentResponseDto>> GetLoanRepaymentsAsync(Guid loanId)
        {
            var repayments = await _context.Repayments
                .Where(r => r.LoanId == loanId)
                .OrderBy(r => r.ScheduledDate)
                .Select(r => new RepaymentResponseDto
                {
                    RepaymentId = r.RepaymentId,
                    LoanId = r.LoanId,
                    ScheduledDate = r.ScheduledDate,
                    PrincipalAmount = r.PrincipalAmount,
                    InterestAmount = r.InterestAmount,
                    TotalAmount = r.PrincipalAmount + r.InterestAmount,
                    Status = r.Status,
                    PaidAt = r.PaidAt
                })
                .ToListAsync();

            return repayments;
        }

        public async Task<List<RepaymentResponseDto>> GetMyRepaymentsAsync(Guid borrowerId)
        {
            var repayments = await _context.Repayments
                .Include(r => r.Loan)
                .Where(r => r.Loan.BorrowerId == borrowerId && r.Status == "Pending")
                .OrderBy(r => r.ScheduledDate)
                .Select(r => new RepaymentResponseDto
                {
                    RepaymentId = r.RepaymentId,
                    LoanId = r.LoanId,
                    ScheduledDate = r.ScheduledDate,
                    PrincipalAmount = r.PrincipalAmount,
                    InterestAmount = r.InterestAmount,
                    TotalAmount = r.PrincipalAmount + r.InterestAmount,
                    Status = r.Status,
                    PaidAt = r.PaidAt
                })
                .ToListAsync();

            return repayments;
        }

        public async Task<RepaymentResponseDto> MakePaymentAsync(Guid borrowerId, Guid repaymentId)
        {
            var repayment = await _context.Repayments
                .Include(r => r.Loan)
                .FirstOrDefaultAsync(r => r.RepaymentId == repaymentId);

            if (repayment == null)
                throw new Exception("Repayment not found.");

            if (repayment.Loan.BorrowerId != borrowerId)
                throw new Exception("Unauthorized: This repayment does not belong to you.");

            if (repayment.Status != "Pending")
                throw new Exception("Repayment has already been paid.");

            var totalAmount = repayment.PrincipalAmount + repayment.InterestAmount;

            // Get borrower's wallet
            var borrowerWallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.UserId == borrowerId);

            if (borrowerWallet == null)
                throw new Exception("Wallet not found.");

            if (borrowerWallet.Balance < totalAmount)
                throw new Exception($"Insufficient balance. Required: {totalAmount}, Available: {borrowerWallet.Balance}");

            // Deduct from borrower's wallet
            borrowerWallet.Balance -= totalAmount;
            borrowerWallet.UpdatedAt = DateTime.UtcNow;

            // Create borrower transaction
            var borrowerTransaction = new WalletTransaction
            {
                TxnId = Guid.NewGuid(),
                WalletId = borrowerWallet.WalletId,
                TxnType = "Debit - Loan Repayment",
                Amount = totalAmount,
                Currency = borrowerWallet.Currency,
                RelatedLoanId = repayment.LoanId,
                CreatedAt = DateTime.UtcNow
            };

            _context.WalletTransactions.Add(borrowerTransaction);

            // Get all fundings for this loan to distribute payment
            var fundings = await _context.LoanFundings
                .Where(f => f.LoanId == repayment.LoanId)
                .ToListAsync();

            var totalFunded = fundings.Sum(f => f.Amount);

            // Distribute repayment proportionally to lenders
            foreach (var funding in fundings)
            {
                var lenderShare = (funding.Amount / totalFunded) * totalAmount;

                var lenderWallet = await _context.Wallets
                    .FirstOrDefaultAsync(w => w.UserId == funding.LenderId);

                if (lenderWallet != null)
                {
                    lenderWallet.Balance += lenderShare;
                    lenderWallet.UpdatedAt = DateTime.UtcNow;

                    // Create lender transaction
                    var lenderTransaction = new WalletTransaction
                    {
                        TxnId = Guid.NewGuid(),
                        WalletId = lenderWallet.WalletId,
                        TxnType = "Credit - Loan Repayment",
                        Amount = lenderShare,
                        Currency = lenderWallet.Currency,
                        RelatedLoanId = repayment.LoanId,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.WalletTransactions.Add(lenderTransaction);
                }
            }

            // Update repayment status
            repayment.Status = "Paid";
            repayment.PaidAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new RepaymentResponseDto
            {
                RepaymentId = repayment.RepaymentId,
                LoanId = repayment.LoanId,
                ScheduledDate = repayment.ScheduledDate,
                PrincipalAmount = repayment.PrincipalAmount,
                InterestAmount = repayment.InterestAmount,
                TotalAmount = totalAmount,
                Status = repayment.Status,
                PaidAt = repayment.PaidAt
            };
        }

        public async Task<List<RepaymentResponseDto>> GetLenderRepaymentsAsync(Guid lenderId)
        {
            // Get all loan IDs that this lender has funded
            var fundedLoanIds = await _context.LoanFundings
                .Where(f => f.LenderId == lenderId)
                .Select(f => f.LoanId)
                .Distinct()
                .ToListAsync();

            // Get repayments for those loans
            var repayments = await _context.Repayments
                .Where(r => fundedLoanIds.Contains(r.LoanId))
                .Include(r => r.Loan)
                .OrderBy(r => r.ScheduledDate)
                .ToListAsync();

            // Calculate lender's share of each repayment based on their funding proportion
            var result = new List<RepaymentResponseDto>();
            
            foreach (var repayment in repayments)
            {
                // Get total funded for this loan
                var totalFunded = await _context.LoanFundings
                    .Where(f => f.LoanId == repayment.LoanId)
                    .SumAsync(f => f.Amount);

                // Get lender's funding for this loan
                var lenderFunding = await _context.LoanFundings
                    .Where(f => f.LoanId == repayment.LoanId && f.LenderId == lenderId)
                    .SumAsync(f => f.Amount);

                var proportion = totalFunded > 0 ? lenderFunding / totalFunded : 0;
                var totalRepaymentAmount = repayment.PrincipalAmount + repayment.InterestAmount;

                result.Add(new RepaymentResponseDto
                {
                    RepaymentId = repayment.RepaymentId,
                    LoanId = repayment.LoanId,
                    ScheduledDate = repayment.ScheduledDate,
                    PrincipalAmount = repayment.PrincipalAmount * proportion,
                    InterestAmount = repayment.InterestAmount * proportion,
                    TotalAmount = totalRepaymentAmount * proportion,
                    Status = repayment.Status,
                    PaidAt = repayment.PaidAt
                });
            }

            return result;
        }
    }
}
