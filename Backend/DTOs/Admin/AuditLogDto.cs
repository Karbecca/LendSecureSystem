namespace LendSecureSystem.DTOs.Admin
{
    public class AuditLogDto
    {
        public Guid LogId { get; set; }
        public Guid UserId { get; set; }
        public string UserEmail { get; set; }
        public string Action { get; set; }
        public string Details { get; set; }
        public string IpAddress { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}