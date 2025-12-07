using LendSecureSystem.Models;

namespace LendSecureSystem.Services
{
    public interface IAuditService
    {
        Task LogActionAsync(Guid userId, string action, string details, string ipAddress, string userAgent);
        Task<List<AuditLog>> GetAuditLogsAsync(int page = 1, int pageSize = 50, string action = null);
        Task<List<AuditLog>> GetUserAuditLogsAsync(Guid userId, int page = 1, int pageSize = 50);
    }
}