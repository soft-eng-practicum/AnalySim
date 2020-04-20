using Microsoft.EntityFrameworkCore.Migrations;

namespace NeuroSimHub.Migrations
{
    public partial class ManyToManyApplicationUserProject : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Projects_AspNetUsers_UserID",
                table: "Projects");

            migrationBuilder.AlterColumn<string>(
                name: "UserID",
                table: "Projects",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateTable(
                name: "ApplicationUserProjects",
                columns: table => new
                {
                    ApplicationUserID = table.Column<string>(nullable: false),
                    ProjectID = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationUserProjects", x => new { x.ApplicationUserID, x.ProjectID });
                    table.ForeignKey(
                        name: "FK_ApplicationUserProjects_AspNetUsers_ApplicationUserID",
                        column: x => x.ApplicationUserID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationUserProjects_Projects_ProjectID",
                        column: x => x.ProjectID,
                        principalTable: "Projects",
                        principalColumn: "ProjectID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationUserProjects_ProjectID",
                table: "ApplicationUserProjects",
                column: "ProjectID");

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_AspNetUsers_UserID",
                table: "Projects",
                column: "UserID",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Projects_AspNetUsers_UserID",
                table: "Projects");

            migrationBuilder.DropTable(
                name: "ApplicationUserProjects");

            migrationBuilder.AlterColumn<string>(
                name: "UserID",
                table: "Projects",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_AspNetUsers_UserID",
                table: "Projects",
                column: "UserID",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
