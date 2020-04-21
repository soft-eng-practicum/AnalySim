using Microsoft.EntityFrameworkCore.Migrations;

namespace NeuroSimHub.Migrations
{
    public partial class OptionalForeignKey : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BlobFiles_AspNetUsers_UserID",
                table: "BlobFiles");

            migrationBuilder.AlterColumn<string>(
                name: "UserID",
                table: "BlobFiles",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddForeignKey(
                name: "FK_BlobFiles_AspNetUsers_UserID",
                table: "BlobFiles",
                column: "UserID",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BlobFiles_AspNetUsers_UserID",
                table: "BlobFiles");

            migrationBuilder.AlterColumn<string>(
                name: "UserID",
                table: "BlobFiles",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BlobFiles_AspNetUsers_UserID",
                table: "BlobFiles",
                column: "UserID",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
