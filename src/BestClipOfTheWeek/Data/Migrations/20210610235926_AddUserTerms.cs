using Microsoft.EntityFrameworkCore.Migrations;

namespace BestClipOfTheWeek.Data.Migrations
{
    public partial class AddUserTerms : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Terms",
                columns: table => new
                {
                    TermId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Color = table.Column<string>(type: "TEXT", nullable: false),
                    Enabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    ApplicationUserId = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Terms", x => x.TermId);
                    table.ForeignKey(
                        name: "FK_Terms_AspNetUsers_ApplicationUserId",
                        column: x => x.ApplicationUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Terms_ApplicationUserId",
                table: "Terms",
                column: "ApplicationUserId");


            migrationBuilder.Sql(@"
                CREATE TRIGGER new_user_terms
                AFTER INSERT ON AspNetUsers
                BEGIN
                    INSERT INTO Terms (Name,Color,Enabled,ApplicationUserId) VALUES
                    ('Alpha', '#ff0000', 1, NEW.Id),
                    ('Bravo', '#ff8000', 1, NEW.Id),
                    ('Charlie', '#fff700', 1, NEW.Id),
                    ('Delta', '#d0ff00', 1, NEW.Id),
                    ('Echo', '#00ff6e', 1, NEW.Id),
                    ('Foxtrot', '#00fff2', 1, NEW.Id),
                    ('Golf', '#009dff', 1, NEW.Id),
                    ('Hotel', '#0040ff', 1, NEW.Id),
                    ('India', '#8400ff', 1, NEW.Id),
                    ('Juliet', '#d400ff', 1, NEW.Id),
                    ('Kilo', '#ff00ee', 1, NEW.Id),
                    ('Lima', '#ff005d', 1, NEW.Id),
                    ('Mike', '#9e2b55', 1, NEW.Id),
                    ('November', '#9e2b87', 1, NEW.Id),
                    ('Oscar', '#872b9e', 1, NEW.Id),
                    ('Papa', '#3a2b9e', 1, NEW.Id),
                    ('Quebec', '#2b709e', 1, NEW.Id),
                    ('Romeo', '#2b9e94', 1, NEW.Id),
                    ('Sierra', '#2b9e4d', 1, NEW.Id),
                    ('Tango', '#689e2b', 1, NEW.Id),
                    ('Uniform', '#a9ab4b', 1, NEW.Id),
                    ('Victor', '#bf8e11', 1, NEW.Id),
                    ('Whiskey', '#bf5a11', 1, NEW.Id),
                    ('X-ray', '#bf1d11', 1, NEW.Id),
                    ('Yankee', '#c78783', 1, NEW.Id),
                    ('Zulu', '#737373', 1, NEW.Id);
                END;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Terms");

            migrationBuilder.Sql("DROP TRIGGER new_user_terms");
        }
    }
}
