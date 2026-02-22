using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public NotificationController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /*
         * Type : GET
         * URL : /api/notification/getnotifications
         * Description: Return current user's notifications, newest first
         * Response Status: 200 Ok, 401 Unauthorized
         */
        [HttpGet("[action]")]
        public async Task<IActionResult> GetNotifications()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "Invalid user identifier." });

            var notifications = await _dbContext.Notifications
                .Where(n => n.UserId == userId.Value)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new
                {
                    id = n.Id,
                    userId = n.UserId,
                    title = n.Title,
                    message = n.Message,
                    type = n.Type.ToString(),
                    isRead = n.IsRead,
                    linkUrl = n.LinkUrl,
                    createdAt = n.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                result = notifications,
                message = "Received notifications"
            });
        }

        /*
         * Type : PUT
         * URL : /api/notification/markread/{id}
         * Description: Mark a single notification as read
         * Response Status: 200 Ok, 401 Unauthorized, 404 Not Found
         */
        [HttpPut("[action]/{id}")]
        public async Task<IActionResult> MarkRead([FromRoute] int id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "Invalid user identifier." });

            var notification = await _dbContext.Notifications
                .SingleOrDefaultAsync(n => n.Id == id && n.UserId == userId.Value);

            if (notification == null) return NotFound(new { message = "Notification not found." });

            notification.IsRead = true;
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Notification marked as read." });
        }

        /*
         * Type : PUT
         * URL : /api/notification/markallread
         * Description: Mark all of current user's notifications as read
         * Response Status: 200 Ok, 401 Unauthorized
         */
        [HttpPut("[action]")]
        public async Task<IActionResult> MarkAllRead()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "Invalid user identifier." });

            var unread = await _dbContext.Notifications
                .Where(n => n.UserId == userId.Value && !n.IsRead)
                .ToListAsync();

            unread.ForEach(n => n.IsRead = true);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = $"Marked {unread.Count} notifications as read." });
        }

        // Helper to extract userId from JWT claim
        private int? GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst("sub")?.Value;
            if (int.TryParse(claim, out var id)) return id;
            return null;
        }
    }
}
