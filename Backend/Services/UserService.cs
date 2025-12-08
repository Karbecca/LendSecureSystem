using Microsoft.EntityFrameworkCore;
using LendSecureSystem.Data;
using LendSecureSystem.DTOs.Users;
using LendSecureSystem.Models;

namespace LendSecureSystem.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UserProfileDto> GetUserProfileAsync(Guid userId)
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                throw new Exception("User not found.");
            }

            return new UserProfileDto
            {
                UserId = user.UserId,
                Email = user.Email,
                Role = user.Role,
                FirstName = user.Profile?.FirstName,
                LastName = user.Profile?.LastName,
                Phone = user.Profile?.Phone,
                Dob = user.Profile?.Dob,
                Address = user.Profile?.Address,
                CreatedAt = user.CreatedAt ?? DateTime.MinValue,
                UpdatedAt = user.UpdatedAt ?? DateTime.MinValue
            };
        }

        public async Task<UserProfileDto> UpdateUserProfileAsync(Guid userId, UpdateProfileRequestDto request, string ipAddress, string userAgent)
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                throw new Exception("User not found.");
            }

            // Update profile
            if (user.Profile == null)
            {
                user.Profile = new UserProfile
                {
                    ProfileId = Guid.NewGuid(),
                    UserId = userId
                };
                _context.UserProfiles.Add(user.Profile);
            }

            user.Profile.FirstName = request.FirstName ?? user.Profile.FirstName;
            user.Profile.LastName = request.LastName ?? user.Profile.LastName;
            user.Profile.Phone = request.Phone ?? user.Profile.Phone;
            user.Profile.Dob = request.Dob ?? user.Profile.Dob;
            user.Profile.Address = request.Address ?? user.Profile.Address;

            user.UpdatedAt = DateTime.UtcNow;

            // Log audit
            var auditLog = new AuditLog
            {
                LogId = Guid.NewGuid(),
                UserId = userId,
                Action = "Profile Updated",
                Details = $"User updated their profile information",
                IpAddress = ipAddress,
                UserAgent = userAgent,
                CreatedAt = DateTime.UtcNow
            };
            _context.AuditLogs.Add(auditLog);

            await _context.SaveChangesAsync();

            return await GetUserProfileAsync(userId);
        }

        public async Task<List<UserListDto>> GetAllUsersAsync()
        {
            var users = await _context.Users
                .Include(u => u.Profile)
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserListDto
                {
                    UserId = u.UserId,
                    Email = u.Email,
                    Role = u.Role,
                    FullName = u.Profile != null
                        ? $"{u.Profile.FirstName} {u.Profile.LastName}".Trim()
                        : "N/A",
                    Phone = u.Profile != null ? u.Profile.Phone : "N/A",
                    CreatedAt = u.CreatedAt ?? DateTime.MinValue
                })
                .ToListAsync();

            return users;
        }

        public async Task<UserProfileDto> GetUserByIdAsync(Guid userId)
        {
            return await GetUserProfileAsync(userId);
        }

        public async Task<UserProfileDto> UpdateUserRoleAsync(Guid userId, string newRole, Guid adminId, string ipAddress, string userAgent)
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                throw new Exception("User not found.");
            }

            var oldRole = user.Role;
            user.Role = newRole;
            user.UpdatedAt = DateTime.UtcNow;

            // Log audit
            var auditLog = new AuditLog
            {
                LogId = Guid.NewGuid(),
                UserId = adminId,
                Action = "User Role Updated",
                Details = $"Admin changed user {user.Email} role from {oldRole} to {newRole}",
                IpAddress = ipAddress,
                UserAgent = userAgent,
                CreatedAt = DateTime.UtcNow
            };
            _context.AuditLogs.Add(auditLog);

            await _context.SaveChangesAsync();

            return await GetUserProfileAsync(userId);
        }
    }
}