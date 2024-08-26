using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    public partial class cascadeProblemSolved : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BlobFiles_Projects_ProjectID",
                table: "BlobFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_Notebook_Projects_ProjectID",
                table: "Notebook");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "b2996c18-b35e-4568-b061-1c3c2027543b");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "90f1b211-a965-4941-b973-71cd8a653cd7");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "21584cfd-491d-4638-9753-5f9ec755712f");

            migrationBuilder.AddForeignKey(
                name: "FK_BlobFiles_Projects_ProjectID",
                table: "BlobFiles",
                column: "ProjectID",
                principalTable: "Projects",
                principalColumn: "ProjectID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notebook_Projects_ProjectID",
                table: "Notebook",
                column: "ProjectID",
                principalTable: "Projects",
                principalColumn: "ProjectID",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BlobFiles_Projects_ProjectID",
                table: "BlobFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_Notebook_Projects_ProjectID",
                table: "Notebook");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "d630afa7-f2be-44a5-80aa-a1f5efe4d02e");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "183110f8-c919-481c-b637-47e18cf3c099");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "61b1a777-55bb-4d58-9105-fa1b1503fe70");

            migrationBuilder.AddForeignKey(
                name: "FK_BlobFiles_Projects_ProjectID",
                table: "BlobFiles",
                column: "ProjectID",
                principalTable: "Projects",
                principalColumn: "ProjectID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notebook_Projects_ProjectID",
                table: "Notebook",
                column: "ProjectID",
                principalTable: "Projects",
                principalColumn: "ProjectID");
        }
    }
}
