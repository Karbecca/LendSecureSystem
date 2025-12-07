using Microsoft.EntityFrameworkCore;
using LendSecureSystem.Data;
using LendSecureSystem.Models;

namespace LendSecureSystem.Services
{
    public class AuditService : IAuditService
    {
        private readonly ApplicationDbContext _context;

        public AuditService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task LogActionAsync(Guid userId, string action, string details, string ipAddress, string userAgent)
        {
            var auditLog = new AuditLog
            {
                LogId = Guid.NewGuid(),
                UserId = userId,
                Action = action,
                Details = details,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                CreatedAt = DateTime.UtcNow
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        public async Task<List<AuditLog>> GetAuditLogsAsync(int page = 1, int pageSize = 50, string action = null)
        {
            var query = _context.AuditLogs
                .Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
                .AsQueryable();

            // Filter by action if provided
            if (!string.IsNullOrEmpty(action))
            {
                query = query.Where(a => a.Action.Contains(action));
            }

            // Pagination
            var logs = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return logs;
        }

        public async Task<List<AuditLog>> GetUserAuditLogsAsync(Guid userId, int page = 1, int pageSize = 50)
        {
            var logs = await _context.AuditLogs
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return logs;
        }
    }
}