using LendSecureSystem.Data;
using LendSecureSystem.DTOs.KYC;
using LendSecureSystem.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LendSecureSystem.Services
{
    public class KycService : IKycService
    {
        private readonly ApplicationDbContext _context;
        private readonly IFileStorageService _fileStorage;

        public KycService(ApplicationDbContext context, IFileStorageService fileStorage)
        {
            _context = context;
            _fileStorage = fileStorage;
        }

        public async Task<KycDocumentResponseDto> UploadDocumentAsync(Guid userId, KycUploadRequestDto request)
        {
            // 1. Save file
            var filePath = await _fileStorage.SaveFileAsync(request.File, "kyc");

            // 2. Create DB record
            var doc = new KYCDocument
            {
                DocId = Guid.NewGuid(),
                UserId = userId,
                DocType = request.DocType,
                FilePath = filePath,
                Status = "Pending"
            };

            _context.KYCDocuments.Add(doc);
            await _context.SaveChangesAsync();

            return MapToDto(doc);
        }

        public async Task<List<KycDocumentResponseDto>> GetUserDocumentsAsync(Guid userId)
        {
            var docs = await _context.KYCDocuments
                .Where(d => d.UserId == userId)
                .ToListAsync();

            return docs.Select(MapToDto).ToList();
        }

        public async Task<List<KycDocumentResponseDto>> GetAllDocumentsAsync()
        {
            var docs = await _context.KYCDocuments
                .Include(d => d.User)  // Include user information
                    .ThenInclude(u => u.Profile)  // Include user profile
                .OrderByDescending(d => d.Status == "Pending") // Pending first
                .ToListAsync();

            return docs.Select(MapToDto).ToList();
        }

        public async Task<KycDocumentResponseDto> ReviewDocumentAsync(Guid docId, Guid reviewerId, string status)
        {
            var doc = await _context.KYCDocuments.FindAsync(docId);
            if (doc == null)
            {
                throw new Exception("Document not found.");
            }

            doc.Status = status;
            doc.ReviewerId = reviewerId;
            doc.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(doc);
        }

        public async Task<KycDocumentResponseDto> GetDocumentByIdAsync(Guid docId)
        {
            var doc = await _context.KYCDocuments.FindAsync(docId);
            if (doc == null)
            {
                return null;
            }
            return MapToDto(doc);
        }

        private KycDocumentResponseDto MapToDto(KYCDocument doc)
        {
            return new KycDocumentResponseDto
            {
                DocId = doc.DocId,
                UserId = doc.UserId,
                DocType = doc.DocType,
                FilePath = doc.FilePath,
                Status = doc.Status,
                ReviewerId = doc.ReviewerId,
                ReviewedAt = doc.ReviewedAt,
                User = doc.User?.Profile != null ? new UserInfoDto
                {
                    FirstName = doc.User.Profile.FirstName,
                    LastName = doc.User.Profile.LastName,
                    Email = doc.User.Email
                } : null
            };
        }
    }
}
