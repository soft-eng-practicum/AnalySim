namespace Analysim.Web.ViewModels.Project
{
    public class ProjectMemberPermissionsVM
    {
        public bool MembersCanEditProject { get; set; }
        public bool MembersCanManageMembers { get; set; }
        public bool MembersCanManageTags { get; set; }
        public bool MembersCanUploadFiles { get; set; }
        public bool MembersCanManageFiles { get; set; }
        public bool MembersCanUploadNotebooks { get; set; }
        public bool MembersCanManageNotebooks { get; set; }
        public bool MembersCanManagePublications { get; set; }
        public bool MembersCanManageProjectLogs { get; set; }
    }
}
