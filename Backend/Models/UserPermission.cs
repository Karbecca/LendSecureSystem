using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LendSecureSystem.Models
{
    [Table("UserPermissions")]
    public class UserPermission
    {
        [Key]
        [Column("user_permission_id")]
        public Guid UserPermissionId { get; set; } = Guid.NewGuid();

        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [Required]
        [Column("permission_id")]
        public Guid PermissionId { get; set; }

        [Column("granted_at")]
        public DateTime GrantedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("UserId")]
        public User User { get; set; }

        [ForeignKey("PermissionId")]
        public Permission Permission { get; set; }
    }
}