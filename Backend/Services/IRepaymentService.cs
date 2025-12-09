using LendSecureSystem.DTOs.Repayments;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LendSecureSystem.Services
{
    public interface IRepaymentService
    {
        Task GenerateScheduleAsync(Guid loanId);
        Task<List<RepaymentResponseDto>> GetLoanRepaymentsAsync(Guid loanId);
        Task<List<RepaymentResponseDto>> GetMyRepaymentsAsync(Guid borrowerId);
        Task<RepaymentResponseDto> MakePaymentAsync(Guid borrowerId, Guid repaymentId);
    }
}
