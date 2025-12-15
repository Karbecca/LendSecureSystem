using LendSecureSystem.Data;
using LendSecureSystem.DTOs.Wallets;
using LendSecureSystem.Models;
using Microsoft.EntityFrameworkCore;
using MailKit.Net.Smtp;
using MimeKit;
using System;
using System.Collections.Concurrent;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace LendSecureSystem.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWalletService _walletService;
        
        // In-Memory Storage for Pending Transactions (Safe for Demo)
        // Key: TxnId, Value: (UserId, Request, OTP, CreatedAt)
        private static ConcurrentDictionary<Guid, TransactionState> _pendingTransactions = new();

        public PaymentService(ApplicationDbContext context, IWalletService walletService)
        {
            _context = context;
            _walletService = walletService;
        }

        public async Task<TransactionInitResponseDto> InitiateTransactionAsync(Guid userId, TransactionInitRequestDto request)
        {
            // 1. Validate Input Logic
            ValidateRequest(request);

            // 2. Generate OTP
            var otp = new Random().Next(100000, 999999).ToString();
            var txnId = Guid.NewGuid();

            // 3. Store State (In Memory)
            _pendingTransactions[txnId] = new TransactionState
            {
                UserId = userId,
                Request = request,
                Otp = otp,
                CreatedAt = DateTime.UtcNow
            };

            // 4. Send Email (REAL)
            string emailStatus = "Email Sent";
            try 
            {
                await SendEmailAsync(request.Email, otp);
            }
            catch (Exception ex)
            {
                emailStatus = $"Email Failed: {ex.Message}";
                // Continue anyway so they can see the OTP in the response
            }

            return new TransactionInitResponseDto
            {
                TxnId = txnId,
                Status = "Pending",
                Message = $"OTP sent to {request.Email}. ({emailStatus})",
                DevelopmentOtp = otp // Critical for Demo if Email fails
            };
        }

        public async Task<WalletResponseDto> ConfirmTransactionAsync(Guid userId, TransactionConfirmRequestDto request)
        {
            // 1. Find Transaction
            if (!_pendingTransactions.TryGetValue(request.TxnId, out var state))
            {
                throw new Exception("Transaction expired or not found.");
            }

            if (state.UserId != userId) throw new Exception("Unauthorized transaction.");

            // 2. Verify OTP
            if (state.Otp != request.Otp)
            {
                throw new Exception("Invalid OTP.");
            }

            // 3. Execute Money Movement
            WalletResponseDto result;
            if (state.Request.Type.ToLower() == "deposit")
            {
                 // Inbound: Gateway -> Wallet
                 result = await _walletService.AddFundsAsync(userId, state.Request.Amount);
            }
            else
            {
                 // Outbound: Wallet -> Gateway
                 result = await _walletService.WithdrawFundsAsync(userId, state.Request.Amount);
            }

            // 4. Cleanup
            _pendingTransactions.TryRemove(request.TxnId, out _);

            return result;
        }

        private void ValidateRequest(TransactionInitRequestDto request)
        {
            if (request.Amount < 100) throw new Exception("Minimum amount is 100 RWF.");

            if (request.Provider == "Momo" || request.Provider == "Airtel")
            {
                if (!Regex.IsMatch(request.AccountNumber, @"^07[2389]\d{7}$"))
                    throw new Exception("Invalid Rwandese Phone Number.");
            }
            else if (request.Provider == "Visa" || request.Provider == "Mastercard")
            {
                if (!Regex.IsMatch(request.AccountNumber, @"^\d{16}$"))
                    throw new Exception("Invalid Card Number (Must be 16 digits).");
            }
        }

        private async Task SendEmailAsync(string toEmail, string otp)
        {
            // HARDCODED CONFIG FOR DEMO (Replace with User Secrets later if needed)
            var email = "jessbra4@gmail.com"; 
            var password = "rftk krdq imll uqdx"; 

            if (string.IsNullOrEmpty(toEmail)) return;

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("LendSecure Security", email));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = "LendSecure Transaction OTP";

            message.Body = new TextPart("plain")
            {
                Text = $"Your One-Time Password is: {otp}\n\nDo not share this code with anyone."
            };

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync("smtp.gmail.com", 587, false);
                await client.AuthenticateAsync(email, password);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
        }

        private class TransactionState
        {
            public Guid UserId { get; set; }
            public TransactionInitRequestDto Request { get; set; }
            public string Otp { get; set; }
            public DateTime CreatedAt { get; set; }
        }
    }
}
