using LendSecureSystem.DTOs.Funding;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LendSecureSystem.Services
{
    public interface IFundingService
    {
        Task<FundingResponseDto> FundLoanAsync(Guid lenderId, FundLoanRequestDto request);
        Task<List<FundingResponseDto>> GetMyFundingsAsync(Guid lenderId);
    }
}
