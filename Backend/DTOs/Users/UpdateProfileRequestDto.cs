using System.ComponentModel.DataAnnotations;

namespace LendSecureSystem.DTOs.Users
{
    public class UpdateProfileRequestDto
    {
        [StringLength(100)]
        public string FirstName { get; set; }

        [StringLength(100)]
        public string LastName { get; set; }

        [Phone(ErrorMessage = "Invalid phone number")]
        [StringLength(50)]
        public string Phone { get; set; }

        [DataType(DataType.Date)]
        public DateTime? Dob { get; set; }

        public string Address { get; set; }
    }
}