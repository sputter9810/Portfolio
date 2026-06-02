
import discord

from discord.ext import commands
from discord import app_commands

from database.database import db
from utils.data_loader import CLASSES
from utils.embeds import (
    achievement_progress_embed
)


class Achievements(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @app_commands.command(
        name="achievements",
        description="View your achievements"
    )
    async def achievements(
        self,
        interaction: discord.Interaction
    ):
        achievements = db.fetchall(
            """
            SELECT *
            FROM unlocked_achievements
            WHERE user_id = ?
            """,
            (str(interaction.user.id),)
        )

        embed = discord.Embed(
            title=f"🏆 {interaction.user.display_name}'s Achievements",
            color=discord.Color.orange()
        )

        if not achievements:
            embed.description = (
                "No achievements unlocked yet."
            )

        else:
            for achievement in achievements:
                embed.add_field(
                    name="Achievement",
                    value=achievement["achievement_id"],
                    inline=False
                )

        await interaction.response.send_message(
            embed=embed
        )

    achievement_group = app_commands.Group(
        name="achievement",
        description="Achievement progress commands"
    )

    @achievement_group.command(
        name="progress",
        description="View class progress"
    )
    async def achievement_progress(
        self,
        interaction: discord.Interaction,
        class_name: str
    ):
        if class_name not in CLASSES:
            await interaction.response.send_message(
                "Invalid class.",
                ephemeral=True
            )
            return

        rows = db.fetchall(
            """
            SELECT DISTINCT subclass
            FROM characters
            WHERE user_id = ?
            AND class_name = ?
            """,
            (
                str(interaction.user.id),
                class_name
            )
        )

        completed = [
            row["subclass"]
            for row in rows
        ]

        remaining = [
            subclass
            for subclass in CLASSES[class_name]
            if subclass not in completed
        ]

        embed = achievement_progress_embed(
            f"{class_name} Progress",
            completed,
            remaining
        )

        await interaction.response.send_message(
            embed=embed
        )


async def setup(bot):
    await bot.add_cog(Achievements(bot))
