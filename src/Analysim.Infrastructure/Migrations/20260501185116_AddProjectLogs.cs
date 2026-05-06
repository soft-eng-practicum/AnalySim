using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    public partial class AddProjectLogs : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProjectLogID",
                table: "ProjectComments",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProjectLogs",
                columns: table => new
                {
                    LogID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    ProjectID = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: true),
                    BlobFileID = table.Column<int>(type: "integer", nullable: true),
                    Content = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectLogs", x => x.LogID);
                    table.ForeignKey(
                        name: "FK_ProjectLogs_AspNetUsers_UserID",
                        column: x => x.UserID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectLogs_BlobFiles_BlobFileID",
                        column: x => x.BlobFileID,
                        principalTable: "BlobFiles",
                        principalColumn: "BlobFileID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProjectLogs_Projects_ProjectID",
                        column: x => x.ProjectID,
                        principalTable: "Projects",
                        principalColumn: "ProjectID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "0c915a79-dc98-430c-a82f-048743d03033");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "a31a3c30-80f8-4608-84b8-6599710cfc4e");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "5d4427c2-ffb3-4204-842c-465b37f576da");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectComments_ProjectLogID",
                table: "ProjectComments",
                column: "ProjectLogID");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectLogs_BlobFileID",
                table: "ProjectLogs",
                column: "BlobFileID");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectLogs_ProjectID",
                table: "ProjectLogs",
                column: "ProjectID");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectLogs_UserID",
                table: "ProjectLogs",
                column: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectComments_ProjectLogs_ProjectLogID",
                table: "ProjectComments",
                column: "ProjectLogID",
                principalTable: "ProjectLogs",
                principalColumn: "LogID",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectComments_ProjectLogs_ProjectLogID",
                table: "ProjectComments");

            migrationBuilder.DropTable(
                name: "ProjectLogs");

            migrationBuilder.DropIndex(
                name: "IX_ProjectComments_ProjectLogID",
                table: "ProjectComments");

            migrationBuilder.DropColumn(
                name: "ProjectLogID",
                table: "ProjectComments");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "45fc9c92-801d-433f-ab00-280c2334bc89");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "922f6db8-d335-4aa4-9331-12097412cf5e");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "cecf34c5-c9e0-4b99-9fb7-1441045209d8");
        }
    }
}
