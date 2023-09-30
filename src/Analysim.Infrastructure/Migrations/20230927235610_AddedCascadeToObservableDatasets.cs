using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    public partial class AddedCascadeToObservableDatasets : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ObservableNotebookDataset_Notebook_NotebookID",
                table: "ObservableNotebookDataset");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "164ef201-7cc6-4e7c-a8b1-25c621e8e3f1");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "5520036a-5f99-4e00-ad47-931ea04ece88");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "9f86a98f-0408-4b06-8430-607b41d0548f");

            migrationBuilder.AddForeignKey(
                name: "FK_ObservableNotebookDataset_Notebook_NotebookID",
                table: "ObservableNotebookDataset",
                column: "NotebookID",
                principalTable: "Notebook",
                principalColumn: "NotebookID",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ObservableNotebookDataset_Notebook_NotebookID",
                table: "ObservableNotebookDataset");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "08095796-c165-4b56-b0be-1dc76a50a228");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "54b3fc3b-746f-437b-9125-736ce864ce55");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "e2583ef3-6590-4fa4-879d-5f37500666a8");

            migrationBuilder.AddForeignKey(
                name: "FK_ObservableNotebookDataset_Notebook_NotebookID",
                table: "ObservableNotebookDataset",
                column: "NotebookID",
                principalTable: "Notebook",
                principalColumn: "NotebookID");
        }
    }
}
