using LendSecureSystem.DTOs.Users;

namespace LendSecureSystem.Services
{
    public interface IUserService
    {
        Task<UserProfileDto> GetUserProfileAsync(Guid userId);
        Task<UserProfileDto> UpdateUserProfileAsync(Guid userId, UpdateProfileRequestDto request, string ipAddress, string userAgent);
        Task<List<UserListDto>> GetAllUsersAsync();
        Task<UserProfileDto> GetUserByIdAsync(Guid userId);
        Task<UserProfileDto> UpdateUserRoleAsync(Guid userId, string newRole, Guid adminId, string ipAddress, string userAgent);
    }
}