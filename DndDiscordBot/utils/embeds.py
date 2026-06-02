
import discord

from utils.emoji_map import CLASS_EMOJIS


def success_embed(title: str, description: str):
    embed = discord.Embed(
        title=f"✅ {title}",
        description=description,
        color=discord.Color.green()
    )

    return embed


def error_embed(message: str):
    embed = discord.Embed(
        title="❌ Error",
        description=message,
        color=discord.Color.red()
    )

    return embed


def profile_embed(user, stats):
    embed = discord.Embed(
        title=f"⚔️ {user.display_name}'s Adventurer Profile",
        color=discord.Color.blurple()
    )

    embed.add_field(
        name="🏆 Achievements",
        value=str(stats["achievements"]),
        inline=True
    )

    embed.add_field(
        name="🎭 Characters",
        value=str(stats["characters"]),
        inline=True
    )

    embed.add_field(
        name="🗺️ Campaigns",
        value=str(stats["campaigns"]),
        inline=True
    )

    embed.set_footer(
        text="D&D Achievement Tracker"
    )

    return embed


def character_embed(character):
    class_emoji = CLASS_EMOJIS.get(
        character["class_name"],
        "⚔️"
    )

    subrace = character["subrace"]

    if not subrace:
        subrace = "None"

    embed = discord.Embed(
        title=f"{class_emoji} {character['character_name']}",
        color=discord.Color.gold()
    )

    embed.add_field(
        name="Race",
        value=f"{character['race']} ({subrace})",
        inline=False
    )

    embed.add_field(
        name="Class",
        value=(
            f"{character['class_name']} — "
            f"{character['subclass']}"
        ),
        inline=False
    )

    embed.add_field(
        name="Campaign",
        value=character["campaign"],
        inline=False
    )

    embed.add_field(
        name="Level",
        value=str(character["level"]),
        inline=True
    )

    embed.add_field(
        name="Status",
        value=character["status"],
        inline=True
    )

    return embed


def achievement_unlock_embed(
    name: str,
    description: str
):
    embed = discord.Embed(
        title="🏆 Achievement Unlocked!",
        description=f"**{name}**\n{description}",
        color=discord.Color.orange()
    )

    return embed


def achievement_progress_embed(
    title: str,
    completed: list,
    remaining: list
):
    embed = discord.Embed(
        title=title,
        color=discord.Color.blurple()
    )

    completed_text = "\n".join(
        [f"✅ {item}" for item in completed]
    )

    remaining_text = "\n".join(
        [f"⬜ {item}" for item in remaining]
    )

    if not completed_text:
        completed_text = "None"

    if not remaining_text:
        remaining_text = "None"

    embed.add_field(
        name="Completed",
        value=completed_text,
        inline=True
    )

    embed.add_field(
        name="Remaining",
        value=remaining_text,
        inline=True
    )

    return embed
