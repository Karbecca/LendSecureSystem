using LendSecureSystem.DTOs.Auth;

namespace LendSecureSystem.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, string ipAddress, string userAgent);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request, string ipAddress, string userAgent);
        Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
        Task<UserDto> GetCurrentUserAsync(Guid userId);
    }
}