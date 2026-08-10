using Core.Entities;
using Core.Helper;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

namespace Web.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IMailNetService _mailNetService;
        private readonly IConfiguration _configuration;

        public NotificationService(
            ApplicationDbContext dbContext,
            IMailNetService mailNetService,
            IConfiguration configuration
        )
        {
            _dbContext = dbContext;
            _mailNetService = mailNetService;
            _configuration = configuration;
        }

        public async Task PublishAsync(NotificationEvent notificationEvent)
        {
            if (notificationEvent == null || string.IsNullOrWhiteSpace(notificationEvent.Type))
                return;

            switch (notificationEvent.Type)
            {
                case NotificationTypes.CommentReply:
                    await PublishCommentReplyAsync(notificationEvent);
                    break;

                case NotificationTypes.ProjectMemberAdded:
                    await PublishProjectMemberAddedAsync(notificationEvent);
                    break;

                case NotificationTypes.ProjectJoined:
                    await PublishProjectJoinedAsync(notificationEvent);
                    break;

                case NotificationTypes.ProjectLogCreated:
                case NotificationTypes.ProjectLogUpdated:
                    await PublishProjectLogUpdateAsync(notificationEvent);
                    break;
            }
        }

        private async Task PublishCommentReplyAsync(NotificationEvent notificationEvent)
        {
            if (!notificationEvent.CommentID.HasValue)
                return;

            var comment = await _dbContext.ProjectComments
                .AsNoTracking()
                .Include(c => c.ParentComment)
                .Include(c => c.Project)
                .SingleOrDefaultAsync(c => c.CommentID == notificationEvent.CommentID.Value);

            if (comment == null || comment.ParentComment == null)
                return;

            var recipientUserId = notificationEvent.RecipientUserID ?? comment.ParentComment.UserID;
            if (notificationEvent.ActorUserID.HasValue && recipientUserId == notificationEvent.ActorUserID.Value)
                return;

            var actorName = await GetUserDisplayNameAsync(notificationEvent.ActorUserID, "Someone");
            var projectName = GetProjectName(comment.Project);
            var link = BuildProjectLink(comment.Project, comment.ProjectLogID.HasValue ? "log" : "comment");
            var title = "Someone replied to your comment";
            var body = $"{actorName} replied to your comment on {projectName}.";
            var data = new Dictionary<string, string>(notificationEvent.Data)
            {
                ["parentCommentPreview"] = Preview(comment.ParentComment.Content),
                ["replyPreview"] = Preview(comment.Content)
            };

            await CreateAndSendAsync(
                notificationEvent,
                new[] { recipientUserId },
                title,
                body,
                link,
                data,
                emailSubject: "Someone replied to your comment on AnalySim",
                emailBuilder: recipientName => BuildCommentReplyEmail(
                    recipientName,
                    actorName,
                    projectName,
                    data["parentCommentPreview"],
                    data["replyPreview"],
                    BuildAbsoluteLink(link)
                )
            );
        }

        private async Task PublishProjectMemberAddedAsync(NotificationEvent notificationEvent)
        {
            if (!notificationEvent.ProjectID.HasValue || !notificationEvent.RecipientUserID.HasValue)
                return;

            var project = await _dbContext.Projects
                .AsNoTracking()
                .SingleOrDefaultAsync(p => p.ProjectID == notificationEvent.ProjectID.Value);

            if (project == null)
                return;

            if (notificationEvent.ActorUserID.HasValue && notificationEvent.RecipientUserID.Value == notificationEvent.ActorUserID.Value)
                return;

            var actorName = await GetUserDisplayNameAsync(notificationEvent.ActorUserID, "Someone");
            var projectName = GetProjectName(project);
            var role = notificationEvent.Data.TryGetValue("role", out var roleValue) ? roleValue : "member";
            var link = BuildProjectLink(project, null);
            var title = "You were added to a project";
            var body = $"{actorName} added you to {projectName} as {role}.";

            await CreateAndSendAsync(
                notificationEvent,
                new[] { notificationEvent.RecipientUserID.Value },
                title,
                body,
                link,
                notificationEvent.Data
            );
        }

        private async Task PublishProjectJoinedAsync(NotificationEvent notificationEvent)
        {
            if (!notificationEvent.ProjectID.HasValue || !notificationEvent.ActorUserID.HasValue)
                return;

            var project = await _dbContext.Projects
                .AsNoTracking()
                .SingleOrDefaultAsync(p => p.ProjectID == notificationEvent.ProjectID.Value);

            if (project == null)
                return;

            var recipients = await _dbContext.ProjectUsers
                .AsNoTracking()
                .Where(pu =>
                    pu.ProjectID == notificationEvent.ProjectID.Value &&
                    pu.UserRole == "owner" &&
                    pu.UserID != notificationEvent.ActorUserID.Value)
                .Select(pu => pu.UserID)
                .Distinct()
                .ToListAsync();

            var actorName = await GetUserDisplayNameAsync(notificationEvent.ActorUserID, "Someone");
            var projectName = GetProjectName(project);
            var link = BuildProjectLink(project, null);
            var title = "Someone joined your project";
            var body = $"{actorName} joined {projectName}.";

            await CreateAndSendAsync(
                notificationEvent,
                recipients,
                title,
                body,
                link,
                notificationEvent.Data
            );
        }

        private async Task PublishProjectLogUpdateAsync(NotificationEvent notificationEvent)
        {
            if (!notificationEvent.ProjectLogID.HasValue)
                return;

            var projectLog = await _dbContext.ProjectLogs
                .AsNoTracking()
                .Include(l => l.Project)
                .SingleOrDefaultAsync(l => l.LogID == notificationEvent.ProjectLogID.Value);

            if (projectLog == null)
                return;

            var actorUserId = notificationEvent.ActorUserID ?? projectLog.UserID;
            var recipients = await _dbContext.ProjectUsers
                .AsNoTracking()
                .Where(pu =>
                    pu.ProjectID == projectLog.ProjectID &&
                    pu.IsFollowing &&
                    pu.UserID != actorUserId)
                .Select(pu => pu.UserID)
                .Distinct()
                .ToListAsync();

            var actorName = await GetUserDisplayNameAsync(actorUserId, "Someone");
            var projectName = GetProjectName(projectLog.Project);
            var logTitle = string.IsNullOrWhiteSpace(projectLog.Title) ? "Project update" : projectLog.Title.Trim();
            var link = BuildProjectLink(projectLog.Project, "log");
            var created = notificationEvent.Type == NotificationTypes.ProjectLogCreated;
            var title = created ? "New update on a followed project" : "Followed project update changed";
            var body = created
                ? $"{actorName} posted \"{logTitle}\" on {projectName}."
                : $"{actorName} updated \"{logTitle}\" on {projectName}.";
            var data = new Dictionary<string, string>(notificationEvent.Data)
            {
                ["projectLogTitle"] = logTitle,
                ["projectLogPreview"] = Preview(projectLog.Content)
            };

            await CreateAndSendAsync(
                notificationEvent,
                recipients,
                title,
                body,
                link,
                data
            );
        }

        private async Task CreateAndSendAsync(
            NotificationEvent notificationEvent,
            IEnumerable<int> recipientUserIds,
            string title,
            string body,
            string link,
            IDictionary<string, string> data,
            string emailSubject = null,
            Func<string, (string BodyHtml, string BodyText)> emailBuilder = null
        )
        {
            var recipients = recipientUserIds
                .Where(id => !notificationEvent.ActorUserID.HasValue || id != notificationEvent.ActorUserID.Value)
                .Distinct()
                .ToList();

            if (recipients.Count == 0)
                return;

            var recipientUsers = await _dbContext.Users
                .Where(u => recipients.Contains(u.Id))
                .ToListAsync();

            var notifications = new List<Notification>();
            var emailJobs = new List<(User User, string Subject, string BodyHtml, string BodyText)>();

            foreach (var recipient in recipientUsers)
            {
                var preferences = await GetPreferencesAsync(recipient, notificationEvent.Type);

                if (preferences.InAppEnabled)
                {
                    notifications.Add(new Notification
                    {
                        RecipientUserID = recipient.Id,
                        ActorUserID = notificationEvent.ActorUserID,
                        Type = notificationEvent.Type,
                        ProjectID = notificationEvent.ProjectID,
                        CommentID = notificationEvent.CommentID,
                        ProjectLogID = notificationEvent.ProjectLogID,
                        Title = title,
                        Body = body,
                        Link = link,
                        DataJson = JsonSerializer.Serialize(data ?? new Dictionary<string, string>()),
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                if (preferences.EmailEnabled &&
                    emailBuilder != null &&
                    !string.IsNullOrWhiteSpace(recipient.Email))
                {
                    var recipientName = string.IsNullOrWhiteSpace(recipient.UserName) ? "there" : recipient.UserName;
                    var email = emailBuilder(recipientName);
                    emailJobs.Add((recipient, emailSubject ?? title, email.BodyHtml, email.BodyText));
                }
            }

            if (notifications.Count > 0)
            {
                await _dbContext.Notifications.AddRangeAsync(notifications);
                await _dbContext.SaveChangesAsync();
            }

            foreach (var emailJob in emailJobs)
            {
                try
                {
                    var recipientName = string.IsNullOrWhiteSpace(emailJob.User.UserName)
                        ? "there"
                        : emailJob.User.UserName;

                    await _mailNetService.SendEmail(
                        emailJob.User.Email,
                        recipientName,
                        emailJob.Subject,
                        emailJob.BodyHtml,
                        emailJob.BodyText
                    );
                }
                catch (Exception)
                {
                }
            }
        }

        private async Task<(bool InAppEnabled, bool EmailEnabled)> GetPreferencesAsync(User user, string notificationType)
        {
            var preference = await _dbContext.UserNotificationPreferences
                .AsNoTracking()
                .SingleOrDefaultAsync(p => p.UserID == user.Id && p.NotificationType == notificationType);

            if (preference != null)
                return (preference.InAppEnabled, preference.EmailEnabled);

            if (notificationType == NotificationTypes.CommentReply)
                return (true, user.ReceiveCommentReplyEmails);

            return (true, false);
        }

        private async Task<string> GetUserDisplayNameAsync(int? userId, string fallback)
        {
            if (!userId.HasValue)
                return fallback;

            var username = await _dbContext.Users
                .AsNoTracking()
                .Where(u => u.Id == userId.Value)
                .Select(u => u.UserName)
                .SingleOrDefaultAsync();

            return string.IsNullOrWhiteSpace(username) ? fallback : username;
        }

        private static string GetProjectName(Project project)
        {
            if (project == null || string.IsNullOrWhiteSpace(project.Name))
                return "this project";

            return project.Name;
        }

        private static string BuildProjectLink(Project project, string tab)
        {
            if (project == null)
                return null;

            var route = string.IsNullOrWhiteSpace(project.Route)
                ? project.ProjectID.ToString()
                : project.Route.Trim('/');

            return string.IsNullOrWhiteSpace(tab)
                ? $"/project/{route}"
                : $"/project/{route}/{tab}";
        }

        private string BuildAbsoluteLink(string relativeLink)
        {
            if (string.IsNullOrWhiteSpace(relativeLink))
                return null;

            var clientBaseUrl = _configuration["ClientSettings:BaseUrl"]?.TrimEnd('/');

            return string.IsNullOrWhiteSpace(clientBaseUrl)
                ? null
                : $"{clientBaseUrl}{relativeLink}";
        }

        private static string Preview(string value, int maxLength = 200)
        {
            if (string.IsNullOrWhiteSpace(value))
                return string.Empty;

            var trimmed = value.Trim();
            return trimmed.Length <= maxLength
                ? trimmed
                : trimmed.Substring(0, maxLength) + "...";
        }

        private static (string BodyHtml, string BodyText) BuildCommentReplyEmail(
            string recipientName,
            string actorName,
            string projectName,
            string parentCommentPreview,
            string replyPreview,
            string absoluteLink
        )
        {
            var safeRecipientName = WebUtility.HtmlEncode(recipientName);
            var safeActorName = WebUtility.HtmlEncode(actorName);
            var safeProjectName = WebUtility.HtmlEncode(projectName);
            var safeParentCommentPreview = WebUtility.HtmlEncode(parentCommentPreview);
            var safeReplyPreview = WebUtility.HtmlEncode(replyPreview);

            var linkHtml = string.IsNullOrWhiteSpace(absoluteLink)
                ? ""
                : $"<p><a href='{WebUtility.HtmlEncode(absoluteLink)}'>View the conversation</a></p>";

            var linkText = string.IsNullOrWhiteSpace(absoluteLink)
                ? ""
                : $"\n\nView the conversation: {absoluteLink}";

            var bodyHtml = $@"
                <p>Hi {safeRecipientName},</p>
                <p><strong>{safeActorName}</strong> replied to your comment on <strong>{safeProjectName}</strong>.</p>
                <p><strong>Your comment:</strong></p>
                <blockquote style='border-left: 4px solid #ccc; padding-left: 12px; color: #555;'>
                    {safeParentCommentPreview}
                </blockquote>
                <p><strong>Their reply:</strong></p>
                <blockquote style='border-left: 4px solid #ccc; padding-left: 12px; color: #555;'>
                    {safeReplyPreview}
                </blockquote>
                {linkHtml}
            ";

            var bodyText =
                $"Hi {recipientName},\n\n" +
                $"{actorName} replied to your comment on {projectName}.\n\n" +
                $"Your comment:\n\"{parentCommentPreview}\"\n\n" +
                $"Their reply:\n\"{replyPreview}\"" +
                linkText;

            return (bodyHtml, bodyText);
        }
    }
}
