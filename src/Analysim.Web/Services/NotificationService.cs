using System;
using System.Threading.Tasks;
using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.SignalR;
using Web.Hubs;

namespace Web.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(ApplicationDbContext dbContext, IHubContext<NotificationHub> hubContext)
        {
            _dbContext = dbContext;
            _hubContext = hubContext;
        }

        public async Task SendNotificationAsync(int userId, string title, string message, NotificationType type, string linkUrl)
        {
            // Persist notification to the database
            var notification = new Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                Type = type,
                IsRead = false,
                LinkUrl = linkUrl,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _dbContext.Notifications.AddAsync(notification);
            await _dbContext.SaveChangesAsync();

            // Push notification to connected client(s) via SignalR
            await _hubContext.Clients
                .Group(userId.ToString())
                .SendAsync("ReceiveNotification", new
                {
                    id = notification.Id,
                    userId = notification.UserId,
                    title = notification.Title,
                    message = notification.Message,
                    type = notification.Type.ToString(),
                    isRead = notification.IsRead,
                    linkUrl = notification.LinkUrl,
                    createdAt = notification.CreatedAt
                });
        }
    }
}
