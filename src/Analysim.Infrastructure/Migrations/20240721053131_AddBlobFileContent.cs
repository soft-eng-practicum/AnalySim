using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    public partial class AddBlobFileContent : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "content",
                table: "BlobFiles");

            migrationBuilder.CreateTable(
                name: "BlobFileContent",
                columns: table => new
                {
                    BlobFileID = table.Column<int>(type: "integer", nullable: false),
                    Content = table.Column<byte[]>(type: "bytea", nullable: false),
                    DateCreated = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlobFileContent", x => x.BlobFileID);
                    table.ForeignKey(
                        name: "FK_BlobFileContent_BlobFiles_BlobFileID",
                        column: x => x.BlobFileID,
                        principalTable: "BlobFiles",
                        principalColumn: "BlobFileID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "0984d128-6257-4161-8192-020f99f694be");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "ea0606a3-23ff-4e21-b422-48e1978b3742");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "cfefead9-0a1b-4538-b66d-087e71f89f81");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BlobFileContent");

            migrationBuilder.AddColumn<byte[]>(
                name: "content",
                table: "BlobFiles",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "9fc99bb8-09a8-4ec2-bd5f-4a4af1dd3a77");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "10fc1a18-c1f1-4d00-a45d-3bccf8c9bd88");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "3c24d855-92d4-44f6-9a12-9171afa4c468");
        }
    }
}
