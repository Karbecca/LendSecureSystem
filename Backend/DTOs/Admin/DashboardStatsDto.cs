namespace LendSecureSystem.DTOs.Admin
{
    public class DashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalBorrowers { get; set; }
        public int TotalLenders { get; set; }
        public int TotalLoans { get; set; }
        public int PendingLoans { get; set; }
        public int ApprovedLoans { get; set; }
        public int FundedLoans { get; set; }
        public int PendingKYCs { get; set; }
        public decimal TotalFundedAmount { get; set; }
        public decimal TotalOutstandingAmount { get; set; }
    }
}