import discord
from discord.ext import commands
from discord import app_commands

from database.database import db
from utils.embeds import success_embed, error_embed, profile_embed


class Profiles(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    profile_group = app_commands.Group(name="profile", description="Profile commands")

    @profile_group.command(name="create", description="Create your profile")
    async def create_profile(self, interaction: discord.Interaction):
        existing = db.fetchone(
            "SELECT * FROM profiles WHERE user_id = ?",
            (str(interaction.user.id),)
        )

        if existing:
            await interaction.response.send_message(
                embed=error_embed("You already have a profile."),
                ephemeral=True
            )
            return

        db.execute(
            "INSERT INTO profiles (user_id, username) VALUES (?, ?)",
            (str(interaction.user.id), interaction.user.name)
        )

        await interaction.response.send_message(
            embed=success_embed(
                "Profile Created",
                f"Welcome, {interaction.user.display_name}!"
            )
        )

    @profile_group.command(name="view", description="View your profile")
    async def view_profile(self, interaction: discord.Interaction):
        profile = db.fetchone(
            "SELECT * FROM profiles WHERE user_id = ?",
            (str(interaction.user.id),)
        )

        if not profile:
            await interaction.response.send_message(
                embed=error_embed("You do not have a profile yet."),
                ephemeral=True
            )
            return

        characters = db.fetchone(
            "SELECT COUNT(*) as count FROM characters WHERE user_id = ?",
            (str(interaction.user.id),)
        )["count"]

        achievements = db.fetchone(
            "SELECT COUNT(*) as count FROM unlocked_achievements WHERE user_id = ?",
            (str(interaction.user.id),)
        )["count"]

        campaigns = db.fetchone(
            "SELECT COUNT(DISTINCT campaign) as count FROM characters WHERE user_id = ?",
            (str(interaction.user.id),)
        )["count"]

        stats = {
            "characters": characters,
            "achievements": achievements,
            "campaigns": campaigns
        }

        await interaction.response.send_message(
            embed=profile_embed(interaction.user, stats)
        )


async def setup(bot):
    await bot.add_cog(Profiles(bot))