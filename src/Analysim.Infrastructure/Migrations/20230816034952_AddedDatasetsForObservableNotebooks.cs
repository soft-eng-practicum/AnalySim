using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    public partial class AddedDatasetsForObservableNotebooks : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ObservableNotebookDataset",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    datasetName = table.Column<string>(type: "text", nullable: true),
                    datasetUrl = table.Column<string>(type: "text", nullable: true),
                    NotebookID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ObservableNotebookDataset", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ObservableNotebookDataset_Notebook_NotebookID",
                        column: x => x.NotebookID,
                        principalTable: "Notebook",
                        principalColumn: "NotebookID");
                });

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "7fa9e039-be75-4db9-96e7-e26a62dab4db");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "02737bc4-0513-43f2-a9b9-44b966b13992");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "70122352-f283-40f6-ab31-0ad199e4f596");

            migrationBuilder.CreateIndex(
                name: "IX_ObservableNotebookDataset_NotebookID",
                table: "ObservableNotebookDataset",
                column: "NotebookID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ObservableNotebookDataset");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "40d303bf-f039-448b-8a31-24a9a87edfba");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "7ce721c5-99ae-49a4-8981-e075c092d503");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "fe37a2eb-79c0-4ae4-b302-8a2be8a50789");
        }
    }
}
