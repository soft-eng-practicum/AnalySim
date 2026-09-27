using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Analysim.Infrastructure.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureProjectMemberPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "MembersCanEditProject",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "MembersCanManageFiles",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "MembersCanManageMembers",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "MembersCanManageNotebooks",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "MembersCanManageProjectLogs",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "MembersCanManagePublications",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "MembersCanManageTags",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "MembersCanUploadFiles",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "MembersCanUploadNotebooks",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MembersCanEditProject",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "MembersCanManageFiles",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "MembersCanManageMembers",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "MembersCanManageNotebooks",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "MembersCanManageProjectLogs",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "MembersCanManagePublications",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "MembersCanManageTags",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "MembersCanUploadFiles",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "MembersCanUploadNotebooks",
                table: "Projects");
        }
    }
}
