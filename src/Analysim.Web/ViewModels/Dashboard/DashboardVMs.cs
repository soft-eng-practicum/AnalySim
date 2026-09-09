using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Analysim.Web.ViewModels.Dashboard
{
    public class DashboardOverviewVM
    {
        public int TotalProjects { get; set; }
        public int TotalDataFiles { get; set; }
        public int TotalNotebooks { get; set; }
        public long StorageUsedBytes { get; set; }
        public long StorageQuotaBytes { get; set; }
    }

    public class DashboardStorageUsageVM
    {
        public long UsedBytes { get; set; }
        public long QuotaBytes { get; set; }
        public double UsedGigabytes { get; set; }
        public double QuotaGigabytes { get; set; }
        public double PercentUsed { get; set; }
    }

    public class DashboardResearchImpactVM
    {
        public int Recommends { get; set; }
        public int Followers { get; set; }
        public int Members { get; set; }
        public int Forks { get; set; }
        public bool RecommendsPlaceholder { get; set; }
    }

    public class DashboardProjectListItemVM
    {
        public int ProjectID { get; set; }
        public string Name { get; set; }
        public string Visibility { get; set; }
        public string Description { get; set; }
        public string Route { get; set; }
        public DateTimeOffset DateCreated { get; set; }
        public DateTimeOffset LastUpdated { get; set; }
        public string CurrentUserRole { get; set; }
        public string OwnerUserName { get; set; }
        public int DataFileCount { get; set; }
        public int NotebookCount { get; set; }
        public int FollowersCount { get; set; }
        public int MembersCount { get; set; }
        public int ForksCount { get; set; }
        public int RecommendsCount { get; set; }
        public int PopularityScore { get; set; }
        public List<string> Tags { get; set; } = new List<string>();
    }

    public class DashboardPagedResultVM<T>
    {
        public IEnumerable<T> Items { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalResults { get; set; }
        public int TotalPages { get; set; }
    }

    public class DashboardActivityMonthVM
    {
        public string Month { get; set; }
        public int Year { get; set; }
        public int Created { get; set; }
        public int Updated { get; set; }
        public int Total { get; set; }
    }

    public class DashboardActivityVM
    {
        public IEnumerable<DashboardActivityMonthVM> Months { get; set; }
        public double GrowthRate { get; set; }
    }

    public class InviteCollaboratorVM
    {
        [Required(ErrorMessage = "Project ID is a required field.")]
        public int ProjectID { get; set; }

        [Required(ErrorMessage = "User identifier is a required field.")]
        public string Identifier { get; set; }

        public string UserRole { get; set; } = "member";
    }
}
