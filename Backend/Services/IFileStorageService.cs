using Microsoft.AspNetCore.Http;

namespace LendSecureSystem.Services
{
    public interface IFileStorageService
    {
        Task<string> SaveFileAsync(IFormFile file, string folderName);
        Task DeleteFileAsync(string filePath);
    }
}
