import { useMemo, useState } from "react";
import { getChromaticNotesInRange, midiToNote, noteToMidi } from "../../utils/music";

type PianoKeyboardProps = {
  notes: string[];
  onSelect: (note: string) => void;
  onInteractionStart?: () => void;
};

export function PianoKeyboard({ notes, onSelect, onInteractionStart }: PianoKeyboardProps) {
  const [activeNote, setActiveNote] = useState<string | null>(null);

  const layout = useMemo(() => buildKeyboardLayout(notes), [notes]);

  const handlePress = (note: string, enabled: boolean) => {
    if (!enabled) {
      return;
    }

    onInteractionStart?.();
    setActiveNote(note);
    window.setTimeout(() => setActiveNote((current) => (current === note ? null : current)), 180);
    onSelect(note);
  };

  return (
    <div className="keyboard-shell">
      <div className="keyboard">
        <div className="white-keys">
          {layout.whiteKeys.map((key) => (
            <button
              key={key.note}
              type="button"
              className={`piano-white-key ${activeNote === key.note ? "active" : ""}`}
              onPointerDown={(event) => {
                event.preventDefault();
                handlePress(key.note, key.enabled);
              }}
              disabled={!key.enabled}
            >
              <span className="key-label">{key.note}</span>
            </button>
          ))}
        </div>

        <div className="black-keys" aria-hidden="true">
          {layout.blackKeys.map((key) => (
            <button
              key={key.note}
              type="button"
              className={`piano-black-key ${key.enabled ? "" : "disabled"} ${
                activeNote === key.note ? "active" : ""
              }`}
              style={{ left: `${key.left}%` }}
              onPointerDown={(event) => {
                event.preventDefault();
                handlePress(key.note, key.enabled);
              }}
              disabled={!key.enabled}
              tabIndex={-1}
            >
              <span className="key-label">{key.note}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

type WhiteKey = {
  note: string;
  enabled: boolean;
};

type BlackKey = {
  note: string;
  enabled: boolean;
  left: number;
};

function buildKeyboardLayout(notes: string[]) {
  if (notes.length === 0) {
    return { whiteKeys: [], blackKeys: [] };
  }

  const enabledNotes = new Set(notes);
  const minMidi = Math.min(...notes.map(noteToMidi));
  const maxMidi = Math.max(...notes.map(noteToMidi));
  const rangeNotes = getChromaticNotesInRange(midiToNote(minMidi), midiToNote(maxMidi));
  const sortedWhiteNotes = rangeNotes
    .filter((note) => !note.includes("#"))
    .sort((left, right) => noteToMidi(left) - noteToMidi(right));
  const whiteKeys: WhiteKey[] = sortedWhiteNotes.map((note) => ({
    note,
    enabled: enabledNotes.has(note),
  }));

  const blackKeys: BlackKey[] = [];

  sortedWhiteNotes.forEach((note, index) => {
    const step = note[0];
    if (step === "E" || step === "B") {
      return;
    }

    const sharpNote = midiToNote(noteToMidi(note) + 1);
    const nextWhite = sortedWhiteNotes[index + 1];
    if (!nextWhite) {
      return;
    }

    const currentMidi = noteToMidi(note);
    const nextMidi = noteToMidi(nextWhite);
    if (nextMidi - currentMidi !== 1 && nextMidi - currentMidi !== 2) {
      return;
    }

    blackKeys.push({
      note: sharpNote,
      enabled: enabledNotes.has(sharpNote),
      left: ((index + 1) / sortedWhiteNotes.length) * 100,
    });
  });

  return { whiteKeys, blackKeys };
}
