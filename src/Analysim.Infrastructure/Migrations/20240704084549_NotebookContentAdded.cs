using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    public partial class NotebookContentAdded : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Content",
                table: "Notebook");

            migrationBuilder.DropColumn(
                name: "author",
                table: "Notebook");

            migrationBuilder.DropColumn(
                name: "version",
                table: "Notebook");

            migrationBuilder.CreateTable(
                name: "NotebookContent",
                columns: table => new
                {
                    NotebookID = table.Column<int>(type: "integer", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    Content = table.Column<byte[]>(type: "bytea", nullable: false),
                    Author = table.Column<string>(type: "text", nullable: false),
                    Size = table.Column<int>(type: "integer", nullable: false),
                    DateCreated = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotebookContent", x => new { x.NotebookID, x.Version });
                    table.ForeignKey(
                        name: "FK_NotebookContent_Notebook_NotebookID",
                        column: x => x.NotebookID,
                        principalTable: "Notebook",
                        principalColumn: "NotebookID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "93ca655e-a94a-403a-a5e7-cf1db3905ccd");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "0a6522d2-c24e-4969-8491-a2b3475b8678");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "2a2b0fb9-7f18-4cbc-9fcb-bb72c436400b");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NotebookContent");

            migrationBuilder.AddColumn<byte[]>(
                name: "Content",
                table: "Notebook",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "author",
                table: "Notebook",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "version",
                table: "Notebook",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "6d585686-3238-4e6d-9df3-592b2f3ee11d");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "a03b00b6-0863-4f46-915b-7f87d5ac2e34");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "1f600912-efbb-4ab2-9e8f-fb3b53016827");
        }
    }
}
