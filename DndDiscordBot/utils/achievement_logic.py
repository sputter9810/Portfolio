
import json

from database.database import db
from utils.data_loader import CLASSES


with open(
    "data/achievements.json",
    "r",
    encoding="utf-8"
) as file:
    ACHIEVEMENTS = json.load(file)


FIRST_CLASS_ACHIEVEMENTS = {
    class_name: f"first_{class_name.lower().replace(' ', '_')}"
    for class_name in CLASSES.keys()
}


CAMPAIGN_ACHIEVEMENTS = {
    1: "first_campaign",
    5: "five_campaigns",
    10: "ten_campaigns"
}


class AchievementLogic:

    @staticmethod
    def unlock_achievement(
        user_id: str,
        achievement_id: str
    ):
        existing = db.fetchone(
            """
            SELECT *
            FROM unlocked_achievements
            WHERE user_id = ?
            AND achievement_id = ?
            """,
            (
                user_id,
                achievement_id
            )
        )

        if existing:
            return False

        db.execute(
            """
            INSERT INTO unlocked_achievements
            (user_id, achievement_id)
            VALUES (?, ?)
            """,
            (
                user_id,
                achievement_id
            )
        )

        return True

    @staticmethod
    def check_all_classes(user_id: str):
        rows = db.fetchall(
            """
            SELECT DISTINCT class_name
            FROM characters
            WHERE user_id = ?
            """,
            (user_id,)
        )

        played_classes = {
            row["class_name"]
            for row in rows
        }

        if len(played_classes) == len(CLASSES.keys()):
            return AchievementLogic.unlock_achievement(
                user_id,
                "all_classes"
            )

        return False

    @staticmethod
    def check_campaign_milestones(user_id: str):
        rows = db.fetchall(
            """
            SELECT DISTINCT campaign
            FROM characters
            WHERE user_id = ?
            """,
            (user_id,)
        )

        campaign_count = len(rows)

        unlocked = []

        for required, achievement_id in CAMPAIGN_ACHIEVEMENTS.items():
            if campaign_count >= required:

                if AchievementLogic.unlock_achievement(
                    user_id,
                    achievement_id
                ):
                    unlocked.append(
                        achievement_id
                    )

        return unlocked

    @staticmethod
    def check_subclass_completion(
        user_id: str,
        class_name: str
    ):
        rows = db.fetchall(
            """
            SELECT DISTINCT subclass
            FROM characters
            WHERE user_id = ?
            AND class_name = ?
            """,
            (
                user_id,
                class_name
            )
        )

        played_subclasses = {
            row["subclass"]
            for row in rows
        }

        all_subclasses = set(
            CLASSES[class_name]
        )

        if played_subclasses == all_subclasses:

            achievement_id = (
                f"all_{class_name.lower().replace(' ', '_')}_subclasses"
            )

            return AchievementLogic.unlock_achievement(
                user_id,
                achievement_id
            )

        return False
