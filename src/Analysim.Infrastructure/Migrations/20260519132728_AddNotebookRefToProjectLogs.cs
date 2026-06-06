using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    public partial class AddNotebookRefToProjectLogs : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ReferencedNotebookID",
                table: "ProjectLogs",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReferencedNotebookVersion",
                table: "ProjectLogs",
                type: "integer",
                nullable: true);

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

            migrationBuilder.CreateIndex(
                name: "IX_ProjectLogs_ReferencedNotebookID",
                table: "ProjectLogs",
                column: "ReferencedNotebookID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectLogs_Notebook_ReferencedNotebookID",
                table: "ProjectLogs",
                column: "ReferencedNotebookID",
                principalTable: "Notebook",
                principalColumn: "NotebookID",
                onDelete: ReferentialAction.SetNull);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectLogs_Notebook_ReferencedNotebookID",
                table: "ProjectLogs");

            migrationBuilder.DropIndex(
                name: "IX_ProjectLogs_ReferencedNotebookID",
                table: "ProjectLogs");

            migrationBuilder.DropColumn(
                name: "ReferencedNotebookID",
                table: "ProjectLogs");

            migrationBuilder.DropColumn(
                name: "ReferencedNotebookVersion",
                table: "ProjectLogs");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "f1d80f82-74ad-4f0e-b39a-228c651b424a");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "cfb8a477-eb7b-4e91-865d-122d17565ce0");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "ecaa6f71-1595-44f7-9337-57b461da675a");
        }
    }
}
