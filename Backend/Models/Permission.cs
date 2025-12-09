using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LendSecureSystem.Models
{
    [Table("Permissions")]
    public class Permission
    {
        [Key]
        [Column("permission_id")]
        public Guid PermissionId { get; set; } = Guid.NewGuid();

        [Required]
        [StringLength(100)]
        [Column("permission_name")]
        public string PermissionName { get; set; }

        [StringLength(255)]
        [Column("description")]
        public string Description { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Property
        public ICollection<UserPermission> UserPermissions { get; set; }
    }
}