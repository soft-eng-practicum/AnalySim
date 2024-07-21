using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    public partial class ModifiedObservableDataset : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "datasetURL",
                table: "ObservableNotebookDataset");

            migrationBuilder.AddColumn<int>(
                name: "BlobFileID",
                table: "ObservableNotebookDataset",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "f829819d-4c3a-4c65-8754-0e5b032602f0");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "447a532f-8a80-49c1-837f-f99b7e4ed463");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "4683f1fa-4153-41a6-bd1d-b999f2fdc1a2");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BlobFileID",
                table: "ObservableNotebookDataset");

            migrationBuilder.AddColumn<string>(
                name: "datasetURL",
                table: "ObservableNotebookDataset",
                type: "text",
                nullable: true);

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
    }
}
