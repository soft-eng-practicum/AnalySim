using Microsoft.EntityFrameworkCore.Migrations;

namespace NeuroSimHub.Migrations
{
    public partial class MovedRouteColumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ApplicationUserProjects_Route",
                table: "ApplicationUserProjects");

            migrationBuilder.DropColumn(
                name: "Route",
                table: "ApplicationUserProjects");

            migrationBuilder.AddColumn<string>(
                name: "Route",
                table: "Projects",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Route",
                table: "Projects");

            migrationBuilder.AddColumn<string>(
                name: "Route",
                table: "ApplicationUserProjects",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationUserProjects_Route",
                table: "ApplicationUserProjects",
                column: "Route",
                unique: true);
        }
    }
}
