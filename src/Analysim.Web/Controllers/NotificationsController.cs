using Core.Entities;
using Core.Helper;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Web.ViewModels.Notification;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private static readonly string[] SupportedNotificationTypes =
        {
            NotificationTypes.CommentReply,
            NotificationTypes.ProjectInvitationReceived,
            NotificationTypes.ProjectMemberAdded,
            NotificationTypes.ProjectJoined,
            NotificationTypes.ProjectLogCreated,
            NotificationTypes.ProjectLogUpdated
        };

        private readonly ApplicationDbContext _dbContext;

        public NotificationsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications(
            [FromQuery] bool unreadOnly = false,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20
        )
        {
            var userIdResult = TryGetCurrentUserId(out var userId);
            if (userIdResult != null) return userIdResult;

            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 20;
            if (pageSize > 100) pageSize = 100;

            var query = _dbContext.Notifications
                .AsNoTracking()
                .Where(n => n.RecipientUserID == userId);

            if (unreadOnly)
                query = query.Where(n => !n.IsRead);

            var total = await query.CountAsync();

            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(n => new
                {
                    n.NotificationID,
                    n.Type,
                    n.ActorUserID,
                    n.ProjectID,
                    n.CommentID,
                    n.ProjectLogID,
                    n.Title,
                    n.Body,
                    n.Link,
                    n.DataJson,
                    n.IsRead,
                    n.ReadAt,
                    n.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                result = notifications,
                total,
                page,
                pageSize,
                message = "Received notifications"
            });
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userIdResult = TryGetCurrentUserId(out var userId);
            if (userIdResult != null) return userIdResult;

            var count = await _dbContext.Notifications
                .AsNoTracking()
                .CountAsync(n => n.RecipientUserID == userId && !n.IsRead);

            return Ok(new
            {
                result = count,
                message = "Received unread notification count"
            });
        }

        [HttpPut("{notificationId}/read")]
        public async Task<IActionResult> MarkAsRead([FromRoute] int notificationId)
        {
            var userIdResult = TryGetCurrentUserId(out var userId);
            if (userIdResult != null) return userIdResult;

            var notification = await _dbContext.Notifications
                .SingleOrDefaultAsync(n => n.NotificationID == notificationId && n.RecipientUserID == userId);

            if (notification == null)
                return NotFound(new { message = "Notification not found." });

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
                await _dbContext.SaveChangesAsync();
            }

            return Ok(new
            {
                result = notification,
                message = "Notification marked as read"
            });
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userIdResult = TryGetCurrentUserId(out var userId);
            if (userIdResult != null) return userIdResult;

            var unreadNotifications = await _dbContext.Notifications
                .Where(n => n.RecipientUserID == userId && !n.IsRead)
                .ToListAsync();

            var now = DateTime.UtcNow;

            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
                notification.ReadAt = now;
            }

            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                result = unreadNotifications.Count,
                message = "All notifications marked as read"
            });
        }

        [HttpGet("preferences")]
        public async Task<IActionResult> GetPreferences()
        {
            var userIdResult = TryGetCurrentUserId(out var userId);
            if (userIdResult != null) return userIdResult;

            var user = await _dbContext.Users
                .AsNoTracking()
                .SingleOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound(new { message = "User not found." });

            var preferences = await _dbContext.UserNotificationPreferences
                .AsNoTracking()
                .Where(p => p.UserID == userId)
                .ToListAsync();

            var result = SupportedNotificationTypes.Select(type =>
            {
                var preference = preferences.SingleOrDefault(p => p.NotificationType == type);

                return new
                {
                    notificationType = type,
                    inAppEnabled = preference?.InAppEnabled ?? true,
                    emailEnabled = preference?.EmailEnabled ?? GetDefaultEmailPreference(user, type)
                };
            }).ToList();

            return Ok(new
            {
                result,
                message = "Received notification preferences"
            });
        }

        [HttpPut("preferences/{notificationType}")]
        public async Task<IActionResult> UpdatePreference(
            [FromRoute] string notificationType,
            [FromBody] NotificationPreferenceUpdateVM formdata
        )
        {
            var userIdResult = TryGetCurrentUserId(out var userId);
            if (userIdResult != null) return userIdResult;

            if (!SupportedNotificationTypes.Contains(notificationType))
                return BadRequest(new { message = "Unsupported notification type." });

            var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            var preference = await _dbContext.UserNotificationPreferences
                .SingleOrDefaultAsync(p => p.UserID == userId && p.NotificationType == notificationType);

            if (preference == null)
            {
                preference = new UserNotificationPreference
                {
                    UserID = userId,
                    NotificationType = notificationType
                };

                await _dbContext.UserNotificationPreferences.AddAsync(preference);
            }

            preference.InAppEnabled = formdata.InAppEnabled;
            preference.EmailEnabled = formdata.EmailEnabled;

            if (notificationType == NotificationTypes.CommentReply)
                user.ReceiveCommentReplyEmails = formdata.EmailEnabled;

            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                result = new
                {
                    notificationType = preference.NotificationType,
                    preference.InAppEnabled,
                    preference.EmailEnabled
                },
                message = "Notification preference updated"
            });
        }

        private IActionResult TryGetCurrentUserId(out int userId)
        {
            userId = 0;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out userId))
                return Unauthorized(new { message = "Invalid user identifier." });

            return null;
        }

        private static bool GetDefaultEmailPreference(User user, string notificationType)
        {
            return notificationType == NotificationTypes.CommentReply && user.ReceiveCommentReplyEmails;
        }
    }
}
