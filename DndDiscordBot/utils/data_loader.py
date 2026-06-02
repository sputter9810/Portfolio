import json


with open("data/classes.json", "r", encoding="utf-8") as file:
    CLASSES = json.load(file)


with open("data/races.json", "r", encoding="utf-8") as file:
    RACES = json.load(file)


VALID_CLASSES = list(CLASSES.keys())
VALID_RACES = list(RACES.keys())



def valid_class(class_name: str):
    return class_name in VALID_CLASSES



def valid_subclass(class_name: str, subclass: str):
    if class_name not in CLASSES:
        return False

    return subclass in CLASSES[class_name]



def valid_race(race: str):
    return race in VALID_RACES



def valid_subrace(race: str, subrace: str):
    if race not in RACES:
        return False

    return subrace in RACES[race]