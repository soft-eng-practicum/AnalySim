using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Analysim.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueIndexesForProjectRouteAndTagName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Tag_Name",
                table: "Tag",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Projects_Route",
                table: "Projects",
                column: "Route",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tag_Name",
                table: "Tag");

            migrationBuilder.DropIndex(
                name: "IX_Projects_Route",
                table: "Projects");
        }
    }
}
