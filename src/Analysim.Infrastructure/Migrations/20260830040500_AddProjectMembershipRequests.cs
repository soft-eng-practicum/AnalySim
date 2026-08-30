using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    public partial class AddProjectMembershipRequests : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProjectMembershipRequests",
                columns: table => new
                {
                    ProjectMembershipRequestID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProjectID = table.Column<int>(type: "integer", nullable: false),
                    RequesterUserID = table.Column<int>(type: "integer", nullable: false),
                    TargetUserID = table.Column<int>(type: "integer", nullable: false),
                    CreatedByUserID = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    RespondedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectMembershipRequests", x => x.ProjectMembershipRequestID);
                    table.ForeignKey(
                        name: "FK_ProjectMembershipRequests_AspNetUsers_CreatedByUserID",
                        column: x => x.CreatedByUserID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectMembershipRequests_AspNetUsers_RequesterUserID",
                        column: x => x.RequesterUserID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectMembershipRequests_AspNetUsers_TargetUserID",
                        column: x => x.TargetUserID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectMembershipRequests_Projects_ProjectID",
                        column: x => x.ProjectID,
                        principalTable: "Projects",
                        principalColumn: "ProjectID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectMembershipRequests_CreatedByUserID",
                table: "ProjectMembershipRequests",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectMembershipRequests_ProjectID_TargetUserID_Type_Status",
                table: "ProjectMembershipRequests",
                columns: new[] { "ProjectID", "TargetUserID", "Type", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectMembershipRequests_RequesterUserID",
                table: "ProjectMembershipRequests",
                column: "RequesterUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectMembershipRequests_TargetUserID",
                table: "ProjectMembershipRequests",
                column: "TargetUserID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectMembershipRequests");
        }
    }
}
