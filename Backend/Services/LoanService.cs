using LendSecureSystem.Data;
using LendSecureSystem.DTOs.Loans;
using LendSecureSystem.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LendSecureSystem.Services
{
    public class LoanService : ILoanService
    {
        private readonly ApplicationDbContext _context;

        public LoanService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<LoanResponseDto> CreateLoanRequestAsync(Guid borrowerId, CreateLoanRequestDto request)
        {
            // Check Credit Score
            var user = await _context.Users.FindAsync(borrowerId);
            if (user.CreditScore < 500)
                throw new Exception("Credit Score too low. Improve your score to borrow.");

            // Check for overdue payments
            var hasOverduePayments = await _context.Repayments
                .Include(r => r.Loan)
                .AnyAsync(r => r.Loan.BorrowerId == borrowerId 
                    && r.Status == "Pending" 
                    && r.ScheduledDate < DateTime.UtcNow);

            if (hasOverduePayments)
                throw new Exception("Cannot request new loan. You have overdue payments that must be settled first.");

            var loan = new LoanRequest
            {
                LoanId = Guid.NewGuid(),
                BorrowerId = borrowerId,
                AmountRequested = request.Amount,
                TermMonths = request.TermMonths,
                Purpose = request.Purpose,
                InterestRate = request.InterestRate,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.LoanRequests.Add(loan);
            await _context.SaveChangesAsync();

            // Reload the loan with borrower info (use AsNoTracking to avoid null issues)
            var loanWithBorrower = await _context.LoanRequests
                .Include(l => l.Borrower)
                .ThenInclude(b => b.Profile)
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.LoanId == loan.LoanId);

            return MapToDto(loanWithBorrower ?? loan);
        }

        public async Task<LoanResponseDto> GetLoanByIdAsync(Guid loanId)
        {
            var loan = await _context.LoanRequests
                .Include(l => l.Borrower)
                .ThenInclude(b => b.Profile)
                .FirstOrDefaultAsync(l => l.LoanId == loanId);

            if (loan == null) return null;
            
            // Calculate totalFunded for this loan
            var totalFunded = await _context.LoanFundings
                .Where(f => f.LoanId == loanId)
                .SumAsync(f => (decimal?)f.Amount) ?? 0;

            return MapToDto(loan, totalFunded);
        }

        public async Task<List<LoanResponseDto>> GetLoansAsync(string role, Guid userId)
        {
            IQueryable<LoanRequest> query = _context.LoanRequests
                .Include(l => l.Borrower)
                .ThenInclude(b => b.Profile);

            if (role == "Borrower")
            {
                query = query.Where(l => l.BorrowerId == userId);
            }
            else if (role == "Lender")
            {
                // Lenders see Approved loans (to fund) or loans they funded (future logic)
                // For now, let's show Approved loans
                query = query.Where(l => l.Status == "Approved");
            }
            // Admin sees all

            var loans = await query.OrderByDescending(l => l.CreatedAt).ToListAsync();
            
            // Calculate totalFunded for each loan
            var loanIds = loans.Select(l => l.LoanId).ToList();
            var fundingTotals = await _context.LoanFundings
                .Where(f => loanIds.Contains(f.LoanId))
                .GroupBy(f => f.LoanId)
                .Select(g => new { LoanId = g.Key, TotalFunded = g.Sum(f => f.Amount) })
                .ToDictionaryAsync(x => x.LoanId, x => x.TotalFunded);
            
            return loans.Select(loan => MapToDto(loan, fundingTotals.GetValueOrDefault(loan.LoanId, 0))).ToList();
        }

        public async Task<LoanResponseDto> ApproveLoanAsync(Guid loanId, Guid approverId)
        {
            var loan = await _context.LoanRequests.FindAsync(loanId);
            if (loan == null) throw new Exception("Loan not found.");

            if (loan.Status != "Pending") throw new Exception("Loan is not pending.");

            loan.Status = "Approved";
            loan.ApproverId = approverId;
            loan.ApprovedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetLoanByIdAsync(loanId);
        }

        public async Task<LoanResponseDto> RejectLoanAsync(Guid loanId, Guid approverId)
        {
            var loan = await _context.LoanRequests.FindAsync(loanId);
            if (loan == null) throw new Exception("Loan not found.");

            if (loan.Status != "Pending") throw new Exception("Loan is not pending.");

            loan.Status = "Rejected";
            loan.ApproverId = approverId;
            // No ApprovedAt for rejection

            await _context.SaveChangesAsync();
            return await GetLoanByIdAsync(loanId);
        }

        private LoanResponseDto MapToDto(LoanRequest loan, decimal totalFunded = 0)
        {
            var borrowerName = "Unknown";
            if (loan.Borrower?.Profile != null)
            {
                borrowerName = $"{loan.Borrower.Profile.FirstName} {loan.Borrower.Profile.LastName}";
            }
            else if (loan.Borrower != null)
            {
                borrowerName = loan.Borrower.Email;
            }

            return new LoanResponseDto
            {
                LoanId = loan.LoanId,
                BorrowerId = loan.BorrowerId,
                BorrowerName = borrowerName,
                AmountRequested = loan.AmountRequested,
                Currency = loan.Currency,
                Purpose = loan.Purpose,
                TermMonths = loan.TermMonths,
                InterestRate = loan.InterestRate,
                Status = loan.Status,
                CreatedAt = loan.CreatedAt,
                ApprovedAt = loan.ApprovedAt,
                TotalFunded = totalFunded,
                BorrowerCreditScore = loan.Borrower?.CreditScore ?? 0
            };
        }

        public async Task CancelLoanAsync(Guid loanId, Guid borrowerId)
        {
            var loan = await _context.LoanRequests.FindAsync(loanId);
            
            if (loan == null)
                throw new Exception("Loan not found.");

            if (loan.BorrowerId != borrowerId)
                throw new Exception("Unauthorized: You can only cancel your own loans.");

            if (loan.Status != "Pending" && loan.Status != "Approved")
                throw new Exception("Only pending or approved loans can be cancelled.");

            // Get all fundings for this loan
            var fundings = await _context.LoanFundings
                .Where(f => f.LoanId == loanId)
                .ToListAsync();

            // Refund all lenders
            foreach (var funding in fundings)
            {
                var lenderWallet = await _context.Wallets
                    .FirstOrDefaultAsync(w => w.UserId == funding.LenderId);

                if (lenderWallet != null)
                {
                    // Refund the amount
                    lenderWallet.Balance += funding.Amount;
                    lenderWallet.UpdatedAt = DateTime.UtcNow;

                    // Create refund transaction
                    var refundTransaction = new WalletTransaction
                    {
                        TxnId = Guid.NewGuid(),
                        WalletId = lenderWallet.WalletId,
                        TxnType = "Credit - Loan Cancelled Refund",
                        Amount = funding.Amount,
                        Currency = lenderWallet.Currency,
                        RelatedLoanId = loanId,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.WalletTransactions.Add(refundTransaction);
                }
            }

            // Update loan status
            loan.Status = "Cancelled";
            await _context.SaveChangesAsync();
        }
    }
}
