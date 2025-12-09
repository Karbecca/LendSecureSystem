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

            return MapToDto(loan);
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
            return loans.Select(MapToDto).ToList();
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

        private LoanResponseDto MapToDto(LoanRequest loan)
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
                ApprovedAt = loan.ApprovedAt
            };
        }
    }
}
