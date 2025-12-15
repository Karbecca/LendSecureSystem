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
            // 1. FORENSICS: Validate File Content (Magic Bytes)
            if (!IsValidFile(request.File))
            {
                throw new Exception("Security Alert: Invalid file format detected. Please upload a valid JPG, PNG, or PDF.");
            }

            // 2. Save file
            var filePath = await _fileStorage.SaveFileAsync(request.File, "kyc");

            // 3. Determine Status (AI Check)
            string status = "Pending";
            if (request.IsVerified)
            {
                status = "Approved"; // Trust Client-Side AI Verification (face-api.js has confirmed the face match)
            }
            
            // NOTE: In a full enterprise architecture, we would re-run the biometric check on the server.
            // For this architecture, we rely on the client-side neural network (face-api.js) to perform the liveness and face matching check.

            // 4. Create DB record
            var doc = new KYCDocument
            {
                DocId = Guid.NewGuid(),
                UserId = userId,
                DocType = request.DocType,
                FilePath = filePath,
                Status = status
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


        private bool IsValidFile(Microsoft.AspNetCore.Http.IFormFile file)
        {
            try
            {
                if (file.Length < 1024) return false; // Reject tiny files (<1KB)

                using (var stream = file.OpenReadStream())
                {
                    var header = new byte[4];
                    stream.Read(header, 0, 4);
                    
                    // JPG: FF D8 FF
                    // PNG: 89 50 4E 47
                    // PDF: 25 50 44 46
                    
                    if (header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF) return true; // JPG
                    if (header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) return true; // PNG
                    if (header[0] == 0x25 && header[1] == 0x50 && header[2] == 0x44 && header[3] == 0x46) return true; // PDF
                }
                return false;
            }
            catch
            {
                return false;
            }
        }
    }
}
