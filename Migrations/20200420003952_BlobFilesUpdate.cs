using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace NeuroSimHub.Migrations
{
    public partial class BlobFilesUpdate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BlobFiles",
                columns: table => new
                {
                    BlobFileID = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Container = table.Column<string>(nullable: false),
                    Directory = table.Column<string>(nullable: false),
                    Name = table.Column<string>(nullable: false),
                    Size = table.Column<string>(nullable: false),
                    Uri = table.Column<string>(nullable: false),
                    DateCreated = table.Column<int>(nullable: false),
                    UserID = table.Column<string>(nullable: false),
                    ProjectID1 = table.Column<int>(nullable: false),
                    ProjectID = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlobFiles", x => x.BlobFileID);
                    table.ForeignKey(
                        name: "FK_BlobFiles_Projects_ProjectID1",
                        column: x => x.ProjectID1,
                        principalTable: "Projects",
                        principalColumn: "ProjectID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BlobFiles_AspNetUsers_UserID",
                        column: x => x.UserID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BlobFiles_ProjectID1",
                table: "BlobFiles",
                column: "ProjectID1");

            migrationBuilder.CreateIndex(
                name: "IX_BlobFiles_UserID",
                table: "BlobFiles",
                column: "UserID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BlobFiles");
        }
    }
}
