using Microsoft.EntityFrameworkCore;
using LendSecureSystem.Data;
using LendSecureSystem.Models;
using LendSecureSystem.DTOs.Auth;
using LendSecureSystem.Helpers;

namespace LendSecureSystem.Services
{
    public class AuthService : IAuthService
    {
        private static readonly string[] AdminPermissions = new[]
        {
            "auth.view_profile", "auth.update_profile",
            "users.view_all", "users.view_any", "users.update_role",
            "admin.view_dashboard", "admin.view_audit_logs", "admin.view_compliance"
        };
        
        private readonly ApplicationDbContext _context;
        private readonly JwtHelper _jwtHelper;

        public AuthService(ApplicationDbContext context, JwtHelper jwtHelper)
        {
            _context = context;
            _jwtHelper = jwtHelper;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, string ipAddress, string userAgent)
        {
            // Check if email already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (existingUser != null)
            {
                throw new Exception("An account with this email already exists.");
            }

            // Hash password using BCrypt
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create new user
            var user = new User
            {
                UserId = Guid.NewGuid(),
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = request.Role,
                MfaEnabled = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Create default wallet with demo balance
            var wallet = new Wallet
            {
                WalletId = Guid.NewGuid(),
                UserId = user.UserId,
                Balance = 10000.00m, // Demo money - 10,000 RWF
                Currency = "RWF",
                UpdatedAt = DateTime.UtcNow
            };

            // Create user profile
            var profile = new UserProfile
            {
                ProfileId = Guid.NewGuid(),
                UserId = user.UserId,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone
            };

            // Save to database
            _context.Users.Add(user);
            _context.Wallets.Add(wallet);
            _context.UserProfiles.Add(profile);

            // ============================================================
            // GRANT PERMISSIONS FOR ADMIN
            // ============================================================
            if (user.Role == "Admin")
            {
                foreach (var permName in AdminPermissions)
                {
                    // 1. Ensure Permission Exists
                    var permission = await _context.Permissions.FirstOrDefaultAsync(p => p.PermissionName == permName);
                    if (permission == null)
                    {
                        permission = new Permission
                        {
                            PermissionId = Guid.NewGuid(),
                            PermissionName = permName,
                            Description = $"System generated permission: {permName}"
                        };
                        _context.Permissions.Add(permission);
                    }

                    // 2. Assign to User
                    var userPerm = new UserPermission
                    {
                        UserId = user.UserId,
                        PermissionId = permission.PermissionId, 
                        GrantedAt = DateTime.UtcNow
                    };
                    _context.UserPermissions.Add(userPerm);
                }
            }

            await _context.SaveChangesAsync();

            // Log registration
            var auditLog = new AuditLog
            {
                LogId = Guid.NewGuid(),
                UserId = user.UserId,
                Action = "User Registration",
                Details = $"New {request.Role} account created",
                IpAddress = ipAddress,
                UserAgent = userAgent,
                CreatedAt = DateTime.UtcNow
            };
            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();

            // Generate JWT token
            var token = _jwtHelper.GenerateToken(user);
            var refreshToken = _jwtHelper.GenerateRefreshToken();

            return new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresIn = 3600, // 1 hour
                User = new UserDto
                {
                    UserId = user.UserId,
                    Email = user.Email,
                    Role = user.Role,
                    FirstName = profile.FirstName,
                    LastName = profile.LastName,
                    Phone = profile.Phone,
                    CreatedAt = user.CreatedAt ?? DateTime.MinValue
                }
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, string ipAddress, string userAgent)
        {
            // Find user by email
            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                throw new Exception("Invalid email or password.");
            }

            // Verify password using BCrypt
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

            if (!isPasswordValid)
            {
                throw new Exception("Invalid email or password.");
            }

            // Log login action
            var auditLog = new AuditLog
            {
                LogId = Guid.NewGuid(),
                UserId = user.UserId,
                Action = "User Login",
                Details = $"{user.Role} logged in successfully",
                IpAddress = ipAddress,
                UserAgent = userAgent,
                CreatedAt = DateTime.UtcNow
            };
            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();

            // Generate JWT token
            var token = _jwtHelper.GenerateToken(user);
            var refreshToken = _jwtHelper.GenerateRefreshToken();

            return new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresIn = 3600, // 1 hour
                User = new UserDto
                {
                    UserId = user.UserId,
                    Email = user.Email,
                    Role = user.Role,
                    FirstName = user.Profile?.FirstName,
                    LastName = user.Profile?.LastName,
                    Phone = user.Profile?.Phone,
                    CreatedAt = user.CreatedAt ?? DateTime.MinValue
                }
            };
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
        {
            // In a real app, you'd store refresh tokens in DB and validate them
            // For now, we'll just generate a new token
            // This is a simplified implementation
            throw new NotImplementedException("Refresh token logic not fully implemented yet");
        }

        public async Task<UserDto> GetCurrentUserAsync(Guid userId)
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                throw new Exception("User not found.");
            }

            return new UserDto
            {
                UserId = user.UserId,
                Email = user.Email,
                Role = user.Role,
                FirstName = user.Profile?.FirstName,
                LastName = user.Profile?.LastName,
                Phone = user.Profile?.Phone,
                CreatedAt = user.CreatedAt ?? DateTime.MinValue
            };
        }
    }
}