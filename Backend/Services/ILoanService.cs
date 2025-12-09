using LendSecureSystem.DTOs.Loans;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LendSecureSystem.Services
{
    public interface ILoanService
    {
        Task<LoanResponseDto> CreateLoanRequestAsync(Guid borrowerId, CreateLoanRequestDto request);
        Task<LoanResponseDto> GetLoanByIdAsync(Guid loanId);
        Task<List<LoanResponseDto>> GetLoansAsync(string role, Guid userId); // Role determines what they see
        Task<LoanResponseDto> ApproveLoanAsync(Guid loanId, Guid approverId);
        Task<LoanResponseDto> RejectLoanAsync(Guid loanId, Guid approverId);
    }
}
