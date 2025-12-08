using LendSecureSystem.DTOs.KYC;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LendSecureSystem.Services
{
    public interface IKycService
    {
        Task<KycDocumentResponseDto> UploadDocumentAsync(Guid userId, KycUploadRequestDto request);
        Task<List<KycDocumentResponseDto>> GetUserDocumentsAsync(Guid userId);
        Task<List<KycDocumentResponseDto>> GetAllDocumentsAsync();
        Task<KycDocumentResponseDto> ReviewDocumentAsync(Guid docId, Guid reviewerId, string status);
        Task<KycDocumentResponseDto> GetDocumentByIdAsync(Guid docId);
    }
}
