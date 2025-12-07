using System.ComponentModel.DataAnnotations;

namespace LendSecureSystem.DTOs.Users
{
    public class UpdateRoleRequestDto
    {
        [Required(ErrorMessage = "Role is required")]
        [RegularExpression("^(Borrower|Lender|Admin)$", ErrorMessage = "Role must be Borrower, Lender, or Admin")]
        public string Role { get; set; }
    }
}