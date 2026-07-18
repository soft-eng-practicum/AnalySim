using Core.Entities;
using Core.Helper;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Linq;
using System.Threading.Tasks;

namespace Web.Services
{
    public class AuthTokenService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly JwtSettings _jwtSettings;

        public AuthTokenService(ApplicationDbContext dbContext, IOptions<JwtSettings> jwtSettings)
        {
            _dbContext = dbContext;
            _jwtSettings = jwtSettings.Value;
        }

        public async Task<AuthTokenResult> CreateSessionAsync(User user, string ipAddress)
        {
            var refreshToken = GenerateRefreshToken();
            var refreshTokenHash = HashToken(refreshToken);
            var refreshExpiresAt = DateTime.UtcNow.AddDays(GetRefreshTokenLifetimeDays());

            await _dbContext.RefreshTokens.AddAsync(new RefreshToken
            {
                UserID = user.Id,
                TokenHash = refreshTokenHash,
                TokenFamilyID = Guid.NewGuid(),
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = refreshExpiresAt,
                CreatedByIp = ipAddress
            });

            await _dbContext.SaveChangesAsync();

            return CreateTokenResult(user, refreshToken, refreshExpiresAt);
        }

        public async Task<AuthTokenResult> RotateRefreshTokenAsync(string refreshToken, string ipAddress)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return null;
            }

            var tokenHash = HashToken(refreshToken);
            var storedToken = await _dbContext.RefreshTokens
                .Include(rt => rt.User)
                .SingleOrDefaultAsync(rt => rt.TokenHash == tokenHash);

            if (storedToken == null)
            {
                return null;
            }

            if (!storedToken.IsActive)
            {
                await RevokeTokenFamilyAsync(storedToken.TokenFamilyID, ipAddress, "Refresh token reuse detected");
                return null;
            }

            if (storedToken.User.LockoutEnd.HasValue && storedToken.User.LockoutEnd.Value > DateTimeOffset.UtcNow)
            {
                await RevokeTokenFamilyAsync(storedToken.TokenFamilyID, ipAddress, "User account disabled");
                return null;
            }

            var replacementToken = GenerateRefreshToken();
            var replacementHash = HashToken(replacementToken);
            var replacementExpiresAt = DateTime.UtcNow.AddDays(GetRefreshTokenLifetimeDays());

            storedToken.RevokedAt = DateTime.UtcNow;
            storedToken.RevokedByIp = ipAddress;
            storedToken.RevokedReason = "Replaced by rotated refresh token";
            storedToken.ReplacedByTokenHash = replacementHash;

            await _dbContext.RefreshTokens.AddAsync(new RefreshToken
            {
                UserID = storedToken.UserID,
                TokenHash = replacementHash,
                TokenFamilyID = storedToken.TokenFamilyID,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = replacementExpiresAt,
                CreatedByIp = ipAddress
            });

            await _dbContext.SaveChangesAsync();

            return CreateTokenResult(storedToken.User, replacementToken, replacementExpiresAt);
        }

        public async Task RevokeRefreshTokenAsync(string refreshToken, string ipAddress, string reason)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return;
            }

            var tokenHash = HashToken(refreshToken);
            var storedToken = await _dbContext.RefreshTokens.SingleOrDefaultAsync(rt => rt.TokenHash == tokenHash);

            if (storedToken == null || storedToken.IsRevoked)
            {
                return;
            }

            storedToken.RevokedAt = DateTime.UtcNow;
            storedToken.RevokedByIp = ipAddress;
            storedToken.RevokedReason = reason;

            await _dbContext.SaveChangesAsync();
        }

        public async Task RevokeAllUserRefreshTokensAsync(int userId, string ipAddress, string reason)
        {
            var tokens = await _dbContext.RefreshTokens
                .Where(rt => rt.UserID == userId && rt.RevokedAt == null)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.RevokedAt = DateTime.UtcNow;
                token.RevokedByIp = ipAddress;
                token.RevokedReason = reason;
            }

            await _dbContext.SaveChangesAsync();
        }

        public static string HashToken(string token)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(bytes);
        }

        private async Task RevokeTokenFamilyAsync(Guid tokenFamilyId, string ipAddress, string reason)
        {
            var activeFamilyTokens = await _dbContext.RefreshTokens
                .Where(rt => rt.TokenFamilyID == tokenFamilyId && rt.RevokedAt == null)
                .ToListAsync();

            foreach (var token in activeFamilyTokens)
            {
                token.RevokedAt = DateTime.UtcNow;
                token.RevokedByIp = ipAddress;
                token.RevokedReason = reason;
            }

            await _dbContext.SaveChangesAsync();
        }

        private AuthTokenResult CreateTokenResult(User user, string refreshToken, DateTime refreshExpiresAt)
        {
            var accessTokenExpiresAt = DateTime.UtcNow.AddMinutes(GetAccessTokenLifetimeMinutes());

            return new AuthTokenResult
            {
                User = user,
                AccessToken = CreateAccessToken(user, accessTokenExpiresAt),
                AccessTokenExpiresAt = accessTokenExpiresAt,
                RefreshToken = refreshToken,
                RefreshTokenExpiresAt = refreshExpiresAt
            };
        }

        private string CreateAccessToken(User user, DateTime expiresAt)
        {
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_jwtSettings.Secret));
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim("LoggedOn", DateTime.UtcNow.ToString("O")),
                    new Claim(ClaimTypes.Name, user.UserName)
                }),
                SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                Expires = expiresAt
            };

            return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
        }

        private static string GenerateRefreshToken()
        {
            var randomBytes = RandomNumberGenerator.GetBytes(64);
            return Base64UrlEncoder.Encode(randomBytes);
        }

        private double GetAccessTokenLifetimeMinutes()
        {
            if (double.TryParse(_jwtSettings.ExpireTime, out var minutes) && minutes > 0)
            {
                return minutes;
            }

            return 15;
        }

        private int GetRefreshTokenLifetimeDays()
        {
            return _jwtSettings.RefreshTokenExpireDays > 0 ? _jwtSettings.RefreshTokenExpireDays : 14;
        }
    }
}
