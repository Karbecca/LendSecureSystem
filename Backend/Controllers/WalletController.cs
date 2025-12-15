using LendSecureSystem.DTOs.Wallets;
using LendSecureSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace LendSecureSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WalletController : ControllerBase
    {
        private readonly IWalletService _walletService;
        private readonly IPaymentService _paymentService;

        public WalletController(IWalletService walletService, IPaymentService paymentService)
        {
            _walletService = walletService;
            _paymentService = paymentService;
        }



        [HttpGet]
        public async Task<IActionResult> GetWallet()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized(new { message = "User ID not found in token." });
            var userId = Guid.Parse(userIdClaim.Value);

            var result = await _walletService.GetWalletAsync(userId);
            return Ok(result);
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized(new { message = "User ID not found in token." });
            var userId = Guid.Parse(userIdClaim.Value);

            var result = await _walletService.GetTransactionsAsync(userId);
            return Ok(result);
        }

        [HttpPost("add-funds")]
        public async Task<IActionResult> AddFunds([FromBody] AddFundsRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) return Unauthorized(new { message = "User ID not found in token." });
                var userId = Guid.Parse(userIdClaim.Value);

                var result = await _walletService.AddFundsAsync(userId, request.Amount);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("initiate")]
        public async Task<IActionResult> InitiateTransaction([FromBody] TransactionInitRequestDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) return Unauthorized(new { message = "User ID not found." });
                var userId = Guid.Parse(userIdClaim.Value);

                var result = await _paymentService.InitiateTransactionAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("confirm")]
        public async Task<IActionResult> ConfirmTransaction([FromBody] TransactionConfirmRequestDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) return Unauthorized(new { message = "User ID not found." });
                var userId = Guid.Parse(userIdClaim.Value);

                var result = await _paymentService.ConfirmTransactionAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class AddFundsRequest
    {
        public decimal Amount { get; set; }
    }
}
