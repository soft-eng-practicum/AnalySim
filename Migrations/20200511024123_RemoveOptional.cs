using Microsoft.EntityFrameworkCore.Migrations;

namespace NeuroSimHub.Migrations
{
    public partial class RemoveOptional : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BlobFiles_Projects_ProjectID",
                table: "BlobFiles");

            migrationBuilder.AlterColumn<int>(
                name: "Size",
                table: "BlobFiles",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ProjectID",
                table: "BlobFiles",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "cf137ab9-140d-4a55-8071-a6a52dec0778");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "d89e7e0d-d2fc-4104-a030-6900bb58050d");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "b501fdc5-f2f2-4a4e-a6b6-a5d36f1126dc");

            migrationBuilder.AddForeignKey(
                name: "FK_BlobFiles_Projects_ProjectID",
                table: "BlobFiles",
                column: "ProjectID",
                principalTable: "Projects",
                principalColumn: "ProjectID",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BlobFiles_Projects_ProjectID",
                table: "BlobFiles");

            migrationBuilder.AlterColumn<int>(
                name: "Size",
                table: "BlobFiles",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<int>(
                name: "ProjectID",
                table: "BlobFiles",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "1193a235-4ff2-4021-8a05-4ada8a054f2e");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "96d281cd-f369-4564-b2a9-eea3465ac91d");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "1098eb47-00e9-42df-965f-b44f3ace1a76");

            migrationBuilder.AddForeignKey(
                name: "FK_BlobFiles_Projects_ProjectID",
                table: "BlobFiles",
                column: "ProjectID",
                principalTable: "Projects",
                principalColumn: "ProjectID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
