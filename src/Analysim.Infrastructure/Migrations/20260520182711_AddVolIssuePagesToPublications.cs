using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    public partial class AddVolIssuePagesToPublications : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Issue",
                table: "Publications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Pages",
                table: "Publications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Volume",
                table: "Publications",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "ProjectComments",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "d7c6278e-3f78-4db6-8832-aa41ea9fd62c");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "7383e31e-a884-4cd6-82f7-a6287b4e30a5");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "398ef1f2-6b82-45f2-9601-ed2129f197e9");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Issue",
                table: "Publications");

            migrationBuilder.DropColumn(
                name: "Pages",
                table: "Publications");

            migrationBuilder.DropColumn(
                name: "Volume",
                table: "Publications");

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "ProjectComments",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "f8accda8-f6e5-43e2-acdc-ec7489690c7e");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "5acac352-55a0-4b09-bc33-6a734391391b");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "67d7e55c-aee8-4fe1-8cb4-c89f670c3c24");
        }
    }
}
