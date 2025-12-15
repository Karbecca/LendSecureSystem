using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using LendSecureSystem.Data;
using LendSecureSystem.Services;
using LendSecureSystem.Helpers;
using LendSecureSystem.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ========================================
// 1. DATABASE CONFIGURATION (Hybrid Mode)
// ========================================
// Checks for "Render" environment variable to detect Hosting
var isProduction = Environment.GetEnvironmentVariable("RENDER") == "true";

if (isProduction)
{
    // PROD: Use PostgreSQL (Render)
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString));
    Console.WriteLine($"[Config] Using PostgreSQL Database (Production Mode)");
}
else
{
    // DEV: Use SQL Server (Local Team)
    // Fallback to "LocalConnection" or "DefaultConnection" if LocalConnection missing
    var localConn = builder.Configuration.GetConnectionString("LocalConnection") 
                    ?? "Server=localhost;Database=LendSecureDb;Trusted_Connection=True;TrustServerCertificate=True;";
    
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(localConn));
    Console.WriteLine($"[Config] Using SQL Server Database (Local Mode)");
}

// ========================================
// 2. JWT AUTHENTICATION CONFIGURATION
// ========================================
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

if (string.IsNullOrEmpty(secretKey))
    throw new InvalidOperationException("JWT SecretKey is not configured in appsettings.json");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// ========================================
// AUTHORIZATION - PBAC POLICIES
// ========================================
builder.Services.AddAuthorizationBuilder()
    // Auth Permissions
    .AddPolicy("ViewProfilePermission", policy =>
        policy.Requirements.Add(new LendSecureSystem.Authorization.PermissionRequirement("auth.view_profile")))
    .AddPolicy("UpdateProfilePermission", policy =>
        policy.Requirements.Add(new LendSecureSystem.Authorization.PermissionRequirement("auth.update_profile")))

    // User Management Permissions
    .AddPolicy("ViewAllUsersPermission", policy =>
        policy.Requirements.Add(new LendSecureSystem.Authorization.PermissionRequirement("users.view_all")))
    .AddPolicy("ViewAnyUserPermission", policy =>
        policy.Requirements.Add(new LendSecureSystem.Authorization.PermissionRequirement("users.view_any")))
    .AddPolicy("UpdateUserRolePermission", policy =>
        policy.Requirements.Add(new LendSecureSystem.Authorization.PermissionRequirement("users.update_role")))

    // Admin Dashboard Permissions
    .AddPolicy("ViewDashboardPermission", policy =>
        policy.Requirements.Add(new LendSecureSystem.Authorization.PermissionRequirement("admin.view_dashboard")))
    .AddPolicy("ViewAuditLogsPermission", policy =>
        policy.Requirements.Add(new LendSecureSystem.Authorization.PermissionRequirement("admin.view_audit_logs")))
    .AddPolicy("ViewCompliancePermission", policy =>
        policy.Requirements.Add(new LendSecureSystem.Authorization.PermissionRequirement("admin.view_compliance")));

// Register permission authorization handler
builder.Services.AddSingleton<IAuthorizationHandler, LendSecureSystem.Authorization.PermissionAuthorizationHandler>();

// ========================================
// 3. CORS CONFIGURATION
// ========================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "https://lendsecuresystem.onrender.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ========================================
// 4. DEPENDENCY INJECTION - SERVICES
// ========================================
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<JwtHelper>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddScoped<IKycService, KycService>();
builder.Services.AddScoped<ILoanService, LoanService>();
builder.Services.AddScoped<IWalletService, WalletService>();
builder.Services.AddScoped<IRepaymentService, RepaymentService>();
builder.Services.AddScoped<IFundingService, FundingService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

// ========================================
// 5. CONTROLLERS
// ========================================
builder.Services.AddControllers();

// ========================================
// 6. SWAGGER/OPENAPI CONFIGURATION
// ========================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "LendSecure API",
        Version = "v1",
        Description = "Secure Peer-to-Peer Lending Platform API"
    });

    // JWT Authentication in Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ========================================
// 7. MIDDLEWARE PIPELINE
// ========================================

// Global Error Handling Middleware
app.UseMiddleware<ErrorHandlingMiddleware>();

// Swagger (Development only)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "LendSecure API v1");
        c.RoutePrefix = "swagger";
    });
}

// Static Files
app.UseStaticFiles();

// HTTPS Redirection
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// CORS
app.UseCors("AllowFrontend");

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map Controllers
app.MapControllers();

// ========================================
// 8. ROOT ENDPOINT (FIX FOR 404 ERROR)
// ========================================
app.MapGet("/", () => new { message = "LendSecure API is running", version = "1.0.0", status = "operational" })
    .WithName("HealthCheck");

app.Run();