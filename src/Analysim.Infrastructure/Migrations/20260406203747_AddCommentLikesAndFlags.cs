using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    public partial class AddCommentLikesAndFlags : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProjectCommentFlags",
                columns: table => new
                {
                    FlagID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CommentID = table.Column<int>(type: "integer", nullable: false),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectCommentFlags", x => x.FlagID);
                    table.ForeignKey(
                        name: "FK_ProjectCommentFlags_AspNetUsers_UserID",
                        column: x => x.UserID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectCommentFlags_ProjectComments_CommentID",
                        column: x => x.CommentID,
                        principalTable: "ProjectComments",
                        principalColumn: "CommentID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectCommentLikes",
                columns: table => new
                {
                    CommentID = table.Column<int>(type: "integer", nullable: false),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectCommentLikes", x => new { x.CommentID, x.UserID });
                    table.ForeignKey(
                        name: "FK_ProjectCommentLikes_AspNetUsers_UserID",
                        column: x => x.UserID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectCommentLikes_ProjectComments_CommentID",
                        column: x => x.CommentID,
                        principalTable: "ProjectComments",
                        principalColumn: "CommentID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "df646dd7-958b-4e8d-9516-832f7251f4b2");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "ace78628-a4c7-4edc-bef9-61dfb7bbe225");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "1782edfd-8928-4ec8-88e5-738cdebac23d");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectCommentFlags_CommentID_UserID",
                table: "ProjectCommentFlags",
                columns: new[] { "CommentID", "UserID" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectCommentFlags_UserID",
                table: "ProjectCommentFlags",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectCommentLikes_UserID",
                table: "ProjectCommentLikes",
                column: "UserID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectCommentFlags");

            migrationBuilder.DropTable(
                name: "ProjectCommentLikes");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "fa79cb69-0854-4116-be7e-0cc32666a38c");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "c0e380b3-6959-457d-b623-72d23bd85ed1");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "6c80828f-17ef-44b7-8820-bcc50e82e8f3");
        }
    }
}
