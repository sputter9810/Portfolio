
import discord
from discord.ext import commands
from discord import app_commands

from database.database import db

from utils.embeds import (
    error_embed,
    success_embed,
    character_embed
)

from utils.achievement_logic import (
    AchievementLogic,
    FIRST_CLASS_ACHIEVEMENTS
)

from utils.data_loader import (
    valid_class,
    valid_subclass,
    valid_race,
    valid_subrace,
    CLASSES,
    RACES
)


# --------------------------------------------------
# AUTOCOMPLETE HELPERS
# --------------------------------------------------

async def class_autocomplete(
    interaction: discord.Interaction,
    current: str
):
    return [
        app_commands.Choice(
            name=class_name,
            value=class_name
        )
        for class_name in CLASSES.keys()
        if current.lower() in class_name.lower()
    ][:25]


async def subclass_autocomplete(
    interaction: discord.Interaction,
    current: str
):
    selected_class = interaction.namespace.class_name

    if selected_class not in CLASSES:
        return []

    return [
        app_commands.Choice(
            name=subclass,
            value=subclass
        )
        for subclass in CLASSES[selected_class]
        if current.lower() in subclass.lower()
    ][:25]


async def race_autocomplete(
    interaction: discord.Interaction,
    current: str
):
    return [
        app_commands.Choice(
            name=race,
            value=race
        )
        for race in RACES.keys()
        if current.lower() in race.lower()
    ][:25]


async def subrace_autocomplete(
    interaction: discord.Interaction,
    current: str
):
    selected_race = interaction.namespace.race

    if selected_race not in RACES:
        return []

    return [
        app_commands.Choice(
            name=subrace,
            value=subrace
        )
        for subrace in RACES[selected_race]
        if current.lower() in subrace.lower()
    ][:25]


async def character_name_autocomplete(
    interaction: discord.Interaction,
    current: str
):
    characters = db.fetchall(
        "SELECT character_name FROM characters WHERE user_id = ?",
        (str(interaction.user.id),)
    )

    return [
        app_commands.Choice(
            name=character["character_name"],
            value=character["character_name"]
        )
        for character in characters
        if current.lower() in character["character_name"].lower()
    ][:25]


# --------------------------------------------------
# CHARACTER COG
# --------------------------------------------------

class Characters(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    character_group = app_commands.Group(
        name="character",
        description="Character commands"
    )

    # --------------------------------------------------
    # CREATE CHARACTER
    # --------------------------------------------------

    @character_group.command(
        name="create",
        description="Create a character"
    )
    async def create_character(
        self,
        interaction: discord.Interaction,
        name: str,
        race: str,
        subrace: str,
        class_name: str,
        subclass: str,
        campaign: str,
        level: int = 1
    ):
        await interaction.response.defer()

        try:
            profile = db.fetchone(
                "SELECT * FROM profiles WHERE user_id = ?",
                (str(interaction.user.id),)
            )

            if not profile:
                await interaction.followup.send(
                    embed=error_embed(
                        "Create a profile first using /profile create"
                    ),
                    ephemeral=True
                )
                return

            existing_character = db.fetchone(
                """
                SELECT *
                FROM characters
                WHERE user_id = ?
                AND character_name = ?
                """,
                (
                    str(interaction.user.id),
                    name
                )
            )

            if existing_character:
                await interaction.followup.send(
                    embed=error_embed(
                        "You already have a character with that name."
                    ),
                    ephemeral=True
                )
                return

            # VALIDATION

            if not valid_class(class_name):
                await interaction.followup.send(
                    embed=error_embed("Invalid class."),
                    ephemeral=True
                )
                return

            if not valid_subclass(class_name, subclass):
                await interaction.followup.send(
                    embed=error_embed(
                        "Invalid subclass for selected class."
                    ),
                    ephemeral=True
                )
                return

            if not valid_race(race):
                await interaction.followup.send(
                    embed=error_embed("Invalid race."),
                    ephemeral=True
                )
                return

            if not valid_subrace(race, subrace):
                await interaction.followup.send(
                    embed=error_embed(
                        "Invalid subrace for selected race."
                    ),
                    ephemeral=True
                )
                return

            # INSERT CHARACTER

            db.execute(
                """
                INSERT INTO characters
                (
                    user_id,
                    character_name,
                    race,
                    subrace,
                    class_name,
                    subclass,
                    campaign,
                    level
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    str(interaction.user.id),
                    name,
                    race,
                    subrace,
                    class_name,
                    subclass,
                    campaign,
                    level
                )
            )

            # ACHIEVEMENTS

            try:
                achievement_id = FIRST_CLASS_ACHIEVEMENTS.get(class_name)

                if achievement_id:
                    AchievementLogic.unlock_achievement(
                        str(interaction.user.id),
                        achievement_id
                    )

            except Exception as e:
                print(f"Achievement Error: {e}")

            # FETCH CHARACTER

            character = db.fetchone(
                """
                SELECT *
                FROM characters
                WHERE user_id = ?
                AND character_name = ?
                """,
                (
                    str(interaction.user.id),
                    name
                )
            )

            print(character)

            await interaction.followup.send(
                embed=character_embed(character)
            )

        except Exception as e:
            print(f"CREATE CHARACTER ERROR: {e}")

            await interaction.followup.send(
                embed=error_embed(
                    f"Character creation failed.\n{e}"
                ),
                ephemeral=True
            )

    # --------------------------------------------------
    # VIEW CHARACTER
    # --------------------------------------------------

    @character_group.command(
        name="view",
        description="View a character"
    )
    @app_commands.autocomplete(
        character_name=character_name_autocomplete
    )
    async def view_character(
        self,
        interaction: discord.Interaction,
        character_name: str
    ):
        character = db.fetchone(
            """
            SELECT *
            FROM characters
            WHERE user_id = ?
            AND character_name = ?
            """,
            (
                str(interaction.user.id),
                character_name
            )
        )

        if not character:
            await interaction.response.send_message(
                embed=error_embed(
                    "Character not found."
                ),
                ephemeral=True
            )
            return

        await interaction.response.send_message(
            embed=character_embed(character)
        )

    # --------------------------------------------------
    # DELETE CHARACTER
    # --------------------------------------------------

    @character_group.command(
        name="delete",
        description="Delete a character"
    )
    @app_commands.autocomplete(
        character_name=character_name_autocomplete
    )
    async def delete_character(
        self,
        interaction: discord.Interaction,
        character_name: str
    ):
        character = db.fetchone(
            """
            SELECT *
            FROM characters
            WHERE user_id = ?
            AND character_name = ?
            """,
            (
                str(interaction.user.id),
                character_name
            )
        )

        if not character:
            await interaction.response.send_message(
                embed=error_embed(
                    "Character not found."
                ),
                ephemeral=True
            )
            return

        db.execute(
            """
            DELETE FROM characters
            WHERE user_id = ?
            AND character_name = ?
            """,
            (
                str(interaction.user.id),
                character_name
            )
        )

        await interaction.response.send_message(
            embed=success_embed(
                "Character Deleted",
                f"{character_name} has been deleted."
            )
        )

    # --------------------------------------------------
    # EDIT CHARACTER
    # --------------------------------------------------

    @character_group.command(
        name="edit",
        description="Edit a character"
    )
    @app_commands.autocomplete(
        character_name=character_name_autocomplete
    )
    async def edit_character(
        self,
        interaction: discord.Interaction,
        character_name: str,
        level: int = None,
        campaign: str = None,
        status: str = None
    ):
        character = db.fetchone(
            """
            SELECT *
            FROM characters
            WHERE user_id = ?
            AND character_name = ?
            """,
            (
                str(interaction.user.id),
                character_name
            )
        )

        if not character:
            await interaction.response.send_message(
                embed=error_embed(
                    "Character not found."
                ),
                ephemeral=True
            )
            return

        if level is not None:
            db.execute(
                """
                UPDATE characters
                SET level = ?
                WHERE user_id = ?
                AND character_name = ?
                """,
                (
                    level,
                    str(interaction.user.id),
                    character_name
                )
            )

        if campaign is not None:
            db.execute(
                """
                UPDATE characters
                SET campaign = ?
                WHERE user_id = ?
                AND character_name = ?
                """,
                (
                    campaign,
                    str(interaction.user.id),
                    character_name
                )
            )

        if status is not None:
            db.execute(
                """
                UPDATE characters
                SET status = ?
                WHERE user_id = ?
                AND character_name = ?
                """,
                (
                    status,
                    str(interaction.user.id),
                    character_name
                )
            )

        updated_character = db.fetchone(
            """
            SELECT *
            FROM characters
            WHERE user_id = ?
            AND character_name = ?
            """,
            (
                str(interaction.user.id),
                character_name
            )
        )

        await interaction.response.send_message(
            embed=character_embed(updated_character)
        )

    # --------------------------------------------------
    # LIST CHARACTERS
    # --------------------------------------------------

    @character_group.command(
        name="list",
        description="List your characters"
    )
    async def list_characters(
        self,
        interaction: discord.Interaction
    ):
        characters = db.fetchall(
            """
            SELECT *
            FROM characters
            WHERE user_id = ?
            ORDER BY character_name
            """,
            (str(interaction.user.id),)
        )

        if not characters:
            await interaction.response.send_message(
                embed=error_embed(
                    "You have no characters."
                ),
                ephemeral=True
            )
            return

        embed = discord.Embed(
            title=f"🎭 {interaction.user.display_name}'s Characters",
            color=discord.Color.purple()
        )

        for character in characters:
            embed.add_field(
                name=character["character_name"],
                value=(
                    f"{character['race']} "
                    f"({character['subrace']})\n"
                    f"{character['class_name']} — "
                    f"{character['subclass']}\n"
                    f"Level {character['level']}"
                ),
                inline=False
            )

        await interaction.response.send_message(
            embed=embed
        )

    # --------------------------------------------------
    # AUTOCOMPLETE REGISTRATION
    # --------------------------------------------------

    @create_character.autocomplete("class_name")
    async def class_name_autocomplete(
        self,
        interaction: discord.Interaction,
        current: str
    ):
        return await class_autocomplete(
            interaction,
            current
        )

    @create_character.autocomplete("subclass")
    async def subclass_name_autocomplete(
        self,
        interaction: discord.Interaction,
        current: str
    ):
        return await subclass_autocomplete(
            interaction,
            current
        )

    @create_character.autocomplete("race")
    async def race_name_autocomplete(
        self,
        interaction: discord.Interaction,
        current: str
    ):
        return await race_autocomplete(
            interaction,
            current
        )

    @create_character.autocomplete("subrace")
    async def subrace_name_autocomplete(
        self,
        interaction: discord.Interaction,
        current: str
    ):
        return await subrace_autocomplete(
            interaction,
            current
        )


async def setup(bot):
    await bot.add_cog(Characters(bot))