using Microsoft.EntityFrameworkCore;
using LendSecureSystem.Models;

namespace LendSecureSystem.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets - These represent your database tables
        public DbSet<User> Users { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<KYCDocument> KYCDocuments { get; set; }
        public DbSet<LoanRequest> LoanRequests { get; set; }
        public DbSet<LoanFunding> LoanFundings { get; set; }
        public DbSet<Repayment> Repayments { get; set; }
        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<WalletTransaction> WalletTransactions { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Permission> Permissions { get; set; }  // NEW
        public DbSet<UserPermission> UserPermissions { get; set; }  // NEW

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships and constraints
            // User -> UserProfile (One-to-One)
            modelBuilder.Entity<User>()
                .HasOne(u => u.Profile)
                .WithOne(p => p.User)
                .HasForeignKey<UserProfile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User -> KYCDocuments (One-to-Many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.KYCDocuments)
                .WithOne(k => k.User)
                .HasForeignKey(k => k.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // User -> LoanRequests (One-to-Many, as Borrower)
            modelBuilder.Entity<User>()
                .HasMany(u => u.LoanRequests)
                .WithOne(l => l.Borrower)
                .HasForeignKey(l => l.BorrowerId)
                .OnDelete(DeleteBehavior.Restrict);

            // User -> LoanFundings (One-to-Many, as Lender)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Fundings)
                .WithOne(f => f.Lender)
                .HasForeignKey(f => f.LenderId)
                .OnDelete(DeleteBehavior.Restrict);

            // User -> Wallets (One-to-Many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Wallets)
                .WithOne(w => w.User)
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // LoanRequest -> LoanFundings (One-to-Many)
            modelBuilder.Entity<LoanRequest>()
                .HasMany(l => l.Fundings)
                .WithOne(f => f.Loan)
                .HasForeignKey(f => f.LoanId)
                .OnDelete(DeleteBehavior.Cascade);

            // LoanRequest -> Repayments (One-to-Many)
            modelBuilder.Entity<LoanRequest>()
                .HasMany(l => l.Repayments)
                .WithOne(r => r.Loan)
                .HasForeignKey(r => r.LoanId)
                .OnDelete(DeleteBehavior.Cascade);

            // Wallet -> WalletTransactions (One-to-Many)
            modelBuilder.Entity<Wallet>()
                .HasMany(w => w.Transactions)
                .WithOne(t => t.Wallet)
                .HasForeignKey(t => t.WalletId)
                .OnDelete(DeleteBehavior.Cascade);

            // User -> UserPermissions (One-to-Many) - NEW
            modelBuilder.Entity<User>()
                .HasMany(u => u.UserPermissions)
                .WithOne(up => up.User)
                .HasForeignKey(up => up.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Permission -> UserPermissions (One-to-Many) - NEW
            modelBuilder.Entity<Permission>()
                .HasMany(p => p.UserPermissions)
                .WithOne(up => up.Permission)
                .HasForeignKey(up => up.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint for UserPermissions - NEW
            modelBuilder.Entity<UserPermission>()
                .HasIndex(up => new { up.UserId, up.PermissionId })
                .IsUnique();

            // Set default values
            modelBuilder.Entity<User>()
                .Property(u => u.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<User>()
                .Property(u => u.UpdatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Ensure unique email
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Ensure unique permission name - NEW
            modelBuilder.Entity<Permission>()
                .HasIndex(p => p.PermissionName)
                .IsUnique();
        }
    }
}