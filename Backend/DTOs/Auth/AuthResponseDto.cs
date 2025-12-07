using LendSecureSystem.DTOs.Auth;

namespace LendSecureSystem.DTOs.Auth
{
    public class AuthResponseDto
    {
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public int ExpiresIn { get; set; } // seconds
        public UserDto User { get; set; }
    }
}