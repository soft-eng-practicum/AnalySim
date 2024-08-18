using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    public partial class AddFileVersioning : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "54f675a4-9023-4eae-b3cb-5465a1fd9ad1");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "546de497-8f57-423b-bc75-704996fad40a");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "1b82e1d9-15ec-410f-9f54-fe0661fe72cb");
        }
    }
}
