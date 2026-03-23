import re


NOTE_PATTERN = re.compile(r"^([A-G])([#b]?)(\d)$")


def note_to_midi(note: str) -> int:
    match = NOTE_PATTERN.match(note)
    if not match:
        return 60

    step, accidental, octave = match.groups()
    semitone_map = {
        "C": 0,
        "D": 2,
        "E": 4,
        "F": 5,
        "G": 7,
        "A": 9,
        "B": 11,
    }

    semitone = semitone_map[step]
    if accidental == "#":
        semitone += 1
    if accidental == "b":
        semitone -= 1

    return (int(octave) + 1) * 12 + semitone
