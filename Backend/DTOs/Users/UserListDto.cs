namespace LendSecureSystem.DTOs.Users
{
    public class UserListDto
    {
        public Guid UserId { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}