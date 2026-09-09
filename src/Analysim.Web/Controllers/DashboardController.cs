using Analysim.Web.ViewModels.Dashboard;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private const string FollowerRole = "follower";
        private const string OwnerRole = "owner";
        private const double BytesPerGigabyte = 1024d * 1024d * 1024d;

        private readonly ApplicationDbContext _dbContext;
        private readonly IConfiguration _configuration;

        public DashboardController(ApplicationDbContext dbContext, IConfiguration configuration)
        {
            _dbContext = dbContext;
            _configuration = configuration;
        }

        [Authorize]
        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            if (!TryGetCurrentUserId(out var userId))
                return Unauthorized(new { message = "Invalid user identifier." });

            var projectIds = await GetCurrentUserProjectIds(userId);
            var storage = await BuildStorageUsage(userId);

            var totalDataFiles = projectIds.Count == 0
                ? 0
                : await _dbContext.BlobFiles
                    .CountAsync(b => b.ProjectID.HasValue
                        && projectIds.Contains(b.ProjectID.Value)
                        && b.Extension != ".$$");

            var totalNotebooks = projectIds.Count == 0
                ? 0
                : await _dbContext.Notebook
                    .CountAsync(n => n.ProjectID.HasValue
                        && projectIds.Contains(n.ProjectID.Value)
                        && n.Extension != ".$$"
                        && n.type != "folder");

            return Ok(new
            {
                result = new DashboardOverviewVM
                {
                    TotalProjects = projectIds.Count,
                    TotalDataFiles = totalDataFiles,
                    TotalNotebooks = totalNotebooks,
                    StorageUsedBytes = storage.UsedBytes,
                    StorageQuotaBytes = storage.QuotaBytes
                },
                message = "Dashboard overview received."
            });
        }

        [Authorize]
        [HttpGet("storage-usage")]
        public async Task<IActionResult> GetStorageUsage()
        {
            if (!TryGetCurrentUserId(out var userId))
                return Unauthorized(new { message = "Invalid user identifier." });

            var storage = await BuildStorageUsage(userId);

            return Ok(new
            {
                result = storage,
                message = "Dashboard storage usage received."
            });
        }

        [Authorize]
        [HttpGet("research-impact")]
        public async Task<IActionResult> GetResearchImpact()
        {
            if (!TryGetCurrentUserId(out var userId))
                return Unauthorized(new { message = "Invalid user identifier." });

            var projectIds = await GetCurrentUserProjectIds(userId);

            if (projectIds.Count == 0)
            {
                return Ok(new
                {
                    result = new DashboardResearchImpactVM
                    {
                        Recommends = 0,
                        Followers = 0,
                        Members = 0,
                        Forks = 0,
                        RecommendsPlaceholder = true
                    },
                    message = "Dashboard research impact received."
                });
            }

            var followers = await _dbContext.ProjectUsers
                .CountAsync(pu => projectIds.Contains(pu.ProjectID)
                    && pu.UserRole == FollowerRole
                    && pu.IsFollowing);

            var members = await _dbContext.ProjectUsers
                .CountAsync(pu => projectIds.Contains(pu.ProjectID)
                    && pu.UserRole != FollowerRole);

            var forks = await _dbContext.Projects
                .CountAsync(p => projectIds.Contains(p.ForkedFromProjectID));

            return Ok(new
            {
                result = new DashboardResearchImpactVM
                {
                    Recommends = 0,
                    Followers = followers,
                    Members = members,
                    Forks = forks,
                    RecommendsPlaceholder = true
                },
                message = "Dashboard research impact received."
            });
        }

        [Authorize]
        [HttpGet("popular-projects")]
        public async Task<IActionResult> GetPopularProjects(
            [FromQuery] int limit = 4,
            [FromQuery] string scope = "public")
        {
            limit = Math.Clamp(limit, 1, 20);
            scope = string.IsNullOrWhiteSpace(scope) ? "public" : scope.Trim().ToLowerInvariant();

            IQueryable<Project> query;
            int? userId = null;

            if (scope == "mine")
            {
                if (!TryGetCurrentUserId(out var currentUserId))
                    return Unauthorized(new { message = "Invalid user identifier." });

                userId = currentUserId;
                query = _dbContext.Projects
                    .Where(p => p.ProjectUsers.Any(pu =>
                        pu.UserID == currentUserId &&
                        pu.UserRole != FollowerRole));
            }
            else
            {
                query = _dbContext.Projects
                    .Where(p => p.Visibility.ToLower() == "public");
            }

            var projects = await BuildProjectListItems(query, userId);

            var result = projects
                .OrderByDescending(p => p.PopularityScore)
                .ThenByDescending(p => p.LastUpdated)
                .Take(limit)
                .ToList();

            return Ok(new
            {
                result,
                message = "Popular projects received."
            });
        }

        [Authorize]
        [HttpGet("activity")]
        public async Task<IActionResult> GetActivity([FromQuery] int months = 6)
        {
            if (!TryGetCurrentUserId(out var userId))
                return Unauthorized(new { message = "Invalid user identifier." });

            months = Math.Clamp(months, 1, 24);

            var projectIds = await GetCurrentUserProjectIds(userId);
            var result = await BuildActivity(projectIds, months);

            return Ok(new
            {
                result,
                message = "Dashboard activity received."
            });
        }

        [Authorize]
        [HttpGet("projects")]
        public async Task<IActionResult> GetProjects(
            [FromQuery] string query = "",
            [FromQuery] string visibility = "",
            [FromQuery] string tag = "",
            [FromQuery] string sortBy = "lastUpdated",
            [FromQuery] string sortDirection = "desc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            if (!TryGetCurrentUserId(out var userId))
                return Unauthorized(new { message = "Invalid user identifier." });

            page = Math.Max(page, 1);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var projectsQuery = _dbContext.Projects
                .Where(p => p.ProjectUsers.Any(pu =>
                    pu.UserID == userId &&
                    pu.UserRole != FollowerRole));

            projectsQuery = ApplyProjectFilters(projectsQuery, query, visibility, tag);

            var projects = await BuildProjectListItems(projectsQuery, userId);
            projects = SortProjects(projects, sortBy, sortDirection).ToList();

            var totalResults = projects.Count;
            var totalPages = (int)Math.Ceiling(totalResults / (double)pageSize);
            var items = projects
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(new
            {
                result = new DashboardPagedResultVM<DashboardProjectListItemVM>
                {
                    Items = items,
                    Page = page,
                    PageSize = pageSize,
                    TotalResults = totalResults,
                    TotalPages = totalPages
                },
                message = "Dashboard projects received."
            });
        }

        [HttpGet("public-projects")]
        public async Task<IActionResult> GetPublicProjects(
            [FromQuery] string query = "",
            [FromQuery] string tag = "",
            [FromQuery] string sortBy = "popularity",
            [FromQuery] string sortDirection = "desc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            page = Math.Max(page, 1);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var projectsQuery = _dbContext.Projects
                .Where(p => p.Visibility.ToLower() == "public");

            projectsQuery = ApplyProjectFilters(projectsQuery, query, "", tag);

            var projects = await BuildProjectListItems(projectsQuery, null);
            projects = SortProjects(projects, sortBy, sortDirection).ToList();

            var totalResults = projects.Count;
            var totalPages = (int)Math.Ceiling(totalResults / (double)pageSize);
            var items = projects
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(new
            {
                result = new DashboardPagedResultVM<DashboardProjectListItemVM>
                {
                    Items = items,
                    Page = page,
                    PageSize = pageSize,
                    TotalResults = totalResults,
                    TotalPages = totalPages
                },
                message = "Public projects received."
            });
        }

        [Authorize]
        [HttpPost("collaborators")]
        public async Task<IActionResult> InviteCollaborator([FromForm] InviteCollaboratorVM formdata)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (!TryGetCurrentUserId(out var userId))
                return Unauthorized(new { message = "Invalid user identifier." });

            var project = await _dbContext.Projects.FindAsync(formdata.ProjectID);
            if (project == null) return NotFound(new { message = "Project Not Found" });

            var isOwner = await _dbContext.ProjectUsers
                .AnyAsync(pu => pu.ProjectID == formdata.ProjectID
                    && pu.UserID == userId
                    && pu.UserRole == OwnerRole);

            if (!isOwner) return Unauthorized(new { message = "You are not the owner of the project" });

            var role = string.IsNullOrWhiteSpace(formdata.UserRole)
                ? "member"
                : formdata.UserRole.Trim().ToLowerInvariant();

            if (role != "member" && role != "admin")
                return BadRequest(new { message = "Collaborator role must be member or admin." });

            var identifier = formdata.Identifier.Trim().ToLowerInvariant();
            var invitedUser = await _dbContext.Users
                .FirstOrDefaultAsync(u =>
                    u.UserName.ToLower() == identifier ||
                    (u.Email != null && u.Email.ToLower() == identifier));

            if (invitedUser == null) return NotFound(new { message = "User Not Found" });
            if (invitedUser.Id == userId) return BadRequest(new { message = "Cannot invite yourself." });

            var projectUser = await _dbContext.ProjectUsers
                .Include(pu => pu.User)
                .SingleOrDefaultAsync(pu =>
                    pu.ProjectID == formdata.ProjectID &&
                    pu.UserID == invitedUser.Id);

            if (projectUser != null)
            {
                if (projectUser.UserRole != FollowerRole)
                {
                    return Conflict(new
                    {
                        result = projectUser,
                        message = "User is already a collaborator on this project."
                    });
                }

                projectUser.UserRole = role;
                projectUser.IsFollowing = true;
                _dbContext.Entry(projectUser).State = EntityState.Modified;
                await _dbContext.SaveChangesAsync();

                return Ok(new
                {
                    result = projectUser,
                    message = "Follower promoted to collaborator successfully."
                });
            }

            projectUser = new ProjectUser
            {
                ProjectID = formdata.ProjectID,
                UserID = invitedUser.Id,
                UserRole = role,
                IsFollowing = true
            };

            await _dbContext.ProjectUsers.AddAsync(projectUser);
            await _dbContext.SaveChangesAsync();

            _dbContext.Entry(projectUser).Reference(pu => pu.User).Load();

            return Ok(new
            {
                result = projectUser,
                message = "Collaborator invited successfully."
            });
        }

        private bool TryGetCurrentUserId(out int userId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out userId);
        }

        private async Task<List<int>> GetCurrentUserProjectIds(int userId)
        {
            return await _dbContext.ProjectUsers
                .Where(pu => pu.UserID == userId && pu.UserRole != FollowerRole)
                .Select(pu => pu.ProjectID)
                .ToListAsync();
        }

        private async Task<DashboardStorageUsageVM> BuildStorageUsage(int userId)
        {
            var usedBytes = await _dbContext.BlobFiles
                .Where(b => b.UserID == userId)
                .Select(b => (long)b.Size)
                .SumAsync();

            var quotaBytes = GetStorageQuotaBytes();
            var percentUsed = quotaBytes > 0
                ? Math.Round(usedBytes / (double)quotaBytes * 100, 2)
                : 0;

            return new DashboardStorageUsageVM
            {
                UsedBytes = usedBytes,
                QuotaBytes = quotaBytes,
                UsedGigabytes = Math.Round(usedBytes / BytesPerGigabyte, 2),
                QuotaGigabytes = Math.Round(quotaBytes / BytesPerGigabyte, 2),
                PercentUsed = percentUsed
            };
        }

        private long GetStorageQuotaBytes()
        {
            return long.TryParse(_configuration["UserQuota"], out var quotaBytes)
                ? quotaBytes
                : 0;
        }

        private IQueryable<Project> ApplyProjectFilters(
            IQueryable<Project> projects,
            string query,
            string visibility,
            string tag)
        {
            if (!string.IsNullOrWhiteSpace(query))
            {
                var searchTerm = query.Trim().ToLower();
                projects = projects.Where(p =>
                    p.Name.ToLower().Contains(searchTerm) ||
                    p.Route.ToLower().Contains(searchTerm) ||
                    p.Description.ToLower().Contains(searchTerm) ||
                    p.ProjectTags.Any(pt => pt.Tag.Name.ToLower().Contains(searchTerm)));
            }

            if (!string.IsNullOrWhiteSpace(visibility))
            {
                var visibilityFilter = visibility.Trim().ToLower();
                projects = projects.Where(p => p.Visibility.ToLower() == visibilityFilter);
            }

            if (!string.IsNullOrWhiteSpace(tag))
            {
                var tagFilter = tag.Trim().ToLower();
                projects = projects.Where(p =>
                    p.ProjectTags.Any(pt => pt.Tag.Name.ToLower().Contains(tagFilter)));
            }

            return projects;
        }

        private async Task<List<DashboardProjectListItemVM>> BuildProjectListItems(
            IQueryable<Project> projectsQuery,
            int? currentUserId)
        {
            var projects = await projectsQuery
                .Include(p => p.BlobFiles)
                .Include(p => p.Notebooks)
                .Include(p => p.ProjectUsers).ThenInclude(pu => pu.User)
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
                .ToListAsync();

            var projectIds = projects.Select(p => p.ProjectID).ToList();

            var forkCounts = projectIds.Count == 0
                ? new Dictionary<int, int>()
                : await _dbContext.Projects
                    .Where(p => projectIds.Contains(p.ForkedFromProjectID))
                    .GroupBy(p => p.ForkedFromProjectID)
                    .Select(g => new { ProjectID = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(g => g.ProjectID, g => g.Count);

            var items = projects.Select(project =>
            {
                var currentUserProjectRole = currentUserId.HasValue
                    ? project.ProjectUsers.FirstOrDefault(pu => pu.UserID == currentUserId.Value)?.UserRole
                    : null;

                var ownerUserName = project.ProjectUsers
                    .FirstOrDefault(pu => pu.UserRole == OwnerRole)
                    ?.User
                    ?.UserName;

                return new DashboardProjectListItemVM
                {
                    ProjectID = project.ProjectID,
                    Name = project.Name ?? "",
                    Visibility = project.Visibility ?? "",
                    Description = project.Description ?? "",
                    Route = project.Route ?? "",
                    DateCreated = project.DateCreated,
                    LastUpdated = project.LastUpdated,
                    CurrentUserRole = currentUserProjectRole ?? "",
                    OwnerUserName = ownerUserName ?? GetOwnerFromRoute(project.Route),
                    DataFileCount = project.BlobFiles?.Count(b => b.Extension != ".$$") ?? 0,
                    NotebookCount = project.Notebooks?.Count(n => n.Extension != ".$$" && n.type != "folder") ?? 0,
                    FollowersCount = project.ProjectUsers?.Count(pu => pu.UserRole == FollowerRole && pu.IsFollowing) ?? 0,
                    MembersCount = project.ProjectUsers?.Count(pu => pu.UserRole != FollowerRole) ?? 0,
                    ForksCount = forkCounts.TryGetValue(project.ProjectID, out var forks) ? forks : 0,
                    RecommendsCount = 0,
                    Tags = project.ProjectTags?
                        .Where(pt => pt.Tag != null)
                        .Select(pt => pt.Tag.Name)
                        .ToList() ?? new List<string>()
                };
            }).ToList();

            ApplyPopularityScores(items);

            return items;
        }

        private static IEnumerable<DashboardProjectListItemVM> SortProjects(
            IEnumerable<DashboardProjectListItemVM> projects,
            string sortBy,
            string sortDirection)
        {
            var descending = !string.Equals(sortDirection, "asc", StringComparison.OrdinalIgnoreCase);
            var normalizedSort = string.IsNullOrWhiteSpace(sortBy)
                ? "lastupdated"
                : sortBy.Trim().ToLowerInvariant();

            Func<DashboardProjectListItemVM, object> selector = normalizedSort switch
            {
                "name" => p => p.Name,
                "created" or "datecreated" => p => p.DateCreated,
                "files" or "datafiles" => p => p.DataFileCount,
                "notebooks" => p => p.NotebookCount,
                "followers" => p => p.FollowersCount,
                "members" => p => p.MembersCount,
                "forks" => p => p.ForksCount,
                "popularity" => p => p.PopularityScore,
                _ => p => p.LastUpdated
            };

            return descending
                ? projects.OrderByDescending(selector).ThenBy(p => p.Name)
                : projects.OrderBy(selector).ThenBy(p => p.Name);
        }

        private static void ApplyPopularityScores(List<DashboardProjectListItemVM> projects)
        {
            var rawScores = projects.ToDictionary(
                p => p.ProjectID,
                p => CalculateRawPopularityScore(p));

            var maxScore = rawScores.Values.DefaultIfEmpty(0).Max();

            foreach (var project in projects)
            {
                project.PopularityScore = maxScore <= 0
                    ? 0
                    : (int)Math.Round(rawScores[project.ProjectID] / (double)maxScore * 100);
            }
        }

        private static int CalculateRawPopularityScore(DashboardProjectListItemVM project)
        {
            return project.FollowersCount * 3
                + project.MembersCount * 2
                + project.ForksCount * 5
                + project.RecommendsCount * 3;
        }

        private static string GetOwnerFromRoute(string route)
        {
            if (string.IsNullOrWhiteSpace(route)) return "";

            var parts = route.Split('/');
            return parts.Length > 0 ? parts[0] : "";
        }

        private async Task<DashboardActivityVM> BuildActivity(List<int> projectIds, int months)
        {
            var now = DateTimeOffset.UtcNow;
            var firstMonth = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, TimeSpan.Zero)
                .AddMonths(-(months - 1));

            var monthBuckets = Enumerable.Range(0, months)
                .Select(offset => firstMonth.AddMonths(offset))
                .Select(month => new DashboardActivityMonthVM
                {
                    Month = month.ToString("MMM", CultureInfo.InvariantCulture).ToLowerInvariant(),
                    Year = month.Year
                })
                .ToList();

            if (projectIds.Count == 0)
            {
                return new DashboardActivityVM
                {
                    Months = monthBuckets,
                    GrowthRate = 0
                };
            }

            var projects = await _dbContext.Projects
                .Where(p => projectIds.Contains(p.ProjectID)
                    && (p.DateCreated >= firstMonth || p.LastUpdated >= firstMonth))
                .Select(p => new { p.DateCreated, p.LastUpdated })
                .ToListAsync();

            var blobFiles = await _dbContext.BlobFiles
                .Where(b => b.ProjectID.HasValue
                    && projectIds.Contains(b.ProjectID.Value)
                    && (b.DateCreated >= firstMonth || b.LastModified >= firstMonth))
                .Select(b => new { b.DateCreated, b.LastModified })
                .ToListAsync();

            var notebooks = await _dbContext.Notebook
                .Where(n => n.ProjectID.HasValue
                    && projectIds.Contains(n.ProjectID.Value)
                    && (n.DateCreated >= firstMonth || n.LastModified >= firstMonth))
                .Select(n => new { n.DateCreated, n.LastModified })
                .ToListAsync();

            var firstMonthDateTime = firstMonth.UtcDateTime;
            var logs = await _dbContext.ProjectLogs
                .Where(l => projectIds.Contains(l.ProjectID)
                    && (l.CreatedAt >= firstMonthDateTime || l.UpdatedAt >= firstMonthDateTime))
                .Select(l => new { l.CreatedAt, l.UpdatedAt })
                .ToListAsync();

            foreach (var project in projects)
            {
                IncrementMonth(monthBuckets, project.DateCreated, true);
                if (project.LastUpdated > project.DateCreated.AddSeconds(1))
                    IncrementMonth(monthBuckets, project.LastUpdated, false);
            }

            foreach (var blobFile in blobFiles)
            {
                IncrementMonth(monthBuckets, blobFile.DateCreated, true);
                if (blobFile.LastModified > blobFile.DateCreated.AddSeconds(1))
                    IncrementMonth(monthBuckets, blobFile.LastModified, false);
            }

            foreach (var notebook in notebooks)
            {
                IncrementMonth(monthBuckets, notebook.DateCreated, true);
                if (notebook.LastModified > notebook.DateCreated.AddSeconds(1))
                    IncrementMonth(monthBuckets, notebook.LastModified, false);
            }

            foreach (var log in logs)
            {
                IncrementMonth(monthBuckets, ToUtcOffset(log.CreatedAt), true);
                if (log.UpdatedAt > log.CreatedAt.AddSeconds(1))
                    IncrementMonth(monthBuckets, ToUtcOffset(log.UpdatedAt), false);
            }

            foreach (var bucket in monthBuckets)
            {
                bucket.Total = bucket.Created + bucket.Updated;
            }

            return new DashboardActivityVM
            {
                Months = monthBuckets,
                GrowthRate = CalculateGrowthRate(monthBuckets)
            };
        }

        private static void IncrementMonth(
            List<DashboardActivityMonthVM> buckets,
            DateTimeOffset date,
            bool created)
        {
            var bucket = buckets.FirstOrDefault(b => b.Year == date.Year
                && string.Equals(
                    b.Month,
                    date.ToString("MMM", CultureInfo.InvariantCulture).ToLowerInvariant(),
                    StringComparison.Ordinal));

            if (bucket == null) return;

            if (created)
                bucket.Created++;
            else
                bucket.Updated++;
        }

        private static DateTimeOffset ToUtcOffset(DateTime date)
        {
            var utcDate = date.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(date, DateTimeKind.Utc)
                : date.ToUniversalTime();

            return new DateTimeOffset(utcDate);
        }

        private static double CalculateGrowthRate(List<DashboardActivityMonthVM> buckets)
        {
            if (buckets.Count < 2) return 0;

            var previous = buckets[buckets.Count - 2].Total;
            var current = buckets[buckets.Count - 1].Total;

            if (previous == 0) return current > 0 ? 100 : 0;

            return Math.Round((current - previous) / (double)previous * 100, 2);
        }
    }
}
