import sqlite3
from pathlib import Path

DB_PATH = Path("database/dnd_bot.db")
SCHEMA_PATH = Path("database/schema.sql")


class Database:
    def __init__(self):
        self.connection = sqlite3.connect(DB_PATH)
        self.connection.row_factory = sqlite3.Row
        self.cursor = self.connection.cursor()

    def setup(self):
        with open(SCHEMA_PATH, "r", encoding="utf-8") as file:
            schema = file.read()

        self.cursor.executescript(schema)
        self.connection.commit()

    def execute(self, query, params=()):
        self.cursor.execute(query, params)
        self.connection.commit()

    def fetchone(self, query, params=()):
        self.cursor.execute(query, params)
        return self.cursor.fetchone()

    def fetchall(self, query, params=()):
        self.cursor.execute(query, params)
        return self.cursor.fetchall()


db = Database()