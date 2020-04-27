using Microsoft.EntityFrameworkCore.Migrations;

namespace NeuroSimHub.Migrations
{
    public partial class AddedProjectRoute : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Route",
                table: "ApplicationUserProjects",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationUserProjects_Route",
                table: "ApplicationUserProjects",
                column: "Route",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ApplicationUserProjects_Route",
                table: "ApplicationUserProjects");

            migrationBuilder.DropColumn(
                name: "Route",
                table: "ApplicationUserProjects");
        }
    }
}
