type ParsedNote = {
  key: string;
  accidental?: "#" | "b";
};

export function toVexFlowNote(note: string): ParsedNote {
  const match = /^([A-G])([#b]?)(\d)$/.exec(note);

  if (!match) {
    return { key: "c/4" };
  }

  const [, step, accidental, octave] = match;

  return {
    key: `${step.toLowerCase()}/${octave}`,
    accidental: accidental === "#" || accidental === "b" ? accidental : undefined,
  };
}

const NATURAL_NOTE_ORDER = ["C", "D", "E", "F", "G", "A", "B"] as const;

export function getNaturalNotesInRange(minNote: string, maxNote: string) {
  const minMidi = noteToMidi(minNote);
  const maxMidi = noteToMidi(maxNote);
  const notes: string[] = [];

  for (let octave = 0; octave <= 8; octave += 1) {
    for (const step of NATURAL_NOTE_ORDER) {
      const note = `${step}${octave}`;
      const midi = noteToMidi(note);
      if (midi >= minMidi && midi <= maxMidi) {
        notes.push(note);
      }
    }
  }

  return notes;
}

export function getPlayableNotesForLevel(config: {
  clef: "treble" | "bass";
  min_note: string;
  max_note: string;
  allow_accidental: boolean;
  allow_ledger_line: boolean;
}) {
  const notesInRange = config.allow_accidental
    ? getAccidentalTargetNotesInRange(config.min_note, config.max_note)
    : getNaturalNotesInRange(config.min_note, config.max_note);

  if (!config.allow_ledger_line) {
    return notesInRange;
  }

  return notesInRange.filter((note) => isLedgerLineNote(note, config.clef));
}

export function getKeyboardNotesForLevel(config: {
  min_note: string;
  max_note: string;
  allow_accidental: boolean;
}) {
  if (config.allow_accidental) {
    return getChromaticNotesInRange(config.min_note, config.max_note);
  }

  return getNaturalNotesInRange(config.min_note, config.max_note);
}

export function noteToMidi(note: string) {
  const match = /^([A-G])([#b]?)(\d)$/.exec(note);

  if (!match) {
    return 60;
  }

  const [, step, accidental, octave] = match;
  const semitoneMap: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };

  let semitone = semitoneMap[step];
  if (accidental === "#") {
    semitone += 1;
  }
  if (accidental === "b") {
    semitone -= 1;
  }

  return (Number(octave) + 1) * 12 + semitone;
}

export function midiToNote(midi: number) {
  const steps = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(midi / 12) - 1;
  const step = steps[midi % 12] ?? "C";
  return `${step}${octave}`;
}

export function getChromaticNotesInRange(minNote: string, maxNote: string) {
  const minMidi = noteToMidi(minNote);
  const maxMidi = noteToMidi(maxNote);
  const notes: string[] = [];

  for (let midi = minMidi; midi <= maxMidi; midi += 1) {
    notes.push(midiToNote(midi));
  }

  return notes;
}

function getAccidentalTargetNotesInRange(minNote: string, maxNote: string) {
  const chromaticNotes = getChromaticNotesInRange(minNote, maxNote);

  return chromaticNotes.flatMap((note) => {
    if (!note.includes("#")) {
      return [note];
    }

    const flat = sharpToFlat(note);
    return flat ? [note, flat] : [note];
  });
}

function isLedgerLineNote(note: string, clef: "treble" | "bass") {
  const midi = noteToMidi(note);

  if (clef === "treble") {
    const staffMin = noteToMidi("E4");
    const staffMax = noteToMidi("F5");
    return midi < staffMin || midi > staffMax;
  }

  const staffMin = noteToMidi("G2");
  const staffMax = noteToMidi("A3");
  return midi < staffMin || midi > staffMax;
}

function sharpToFlat(note: string) {
  const match = /^([A-G])#(\d)$/.exec(note);
  if (!match) {
    return null;
  }

  const [, step, octave] = match;
  const flatMap: Record<string, string> = {
    C: "Db",
    D: "Eb",
    F: "Gb",
    G: "Ab",
    A: "Bb",
  };

  const flatStep = flatMap[step];
  return flatStep ? `${flatStep}${octave}` : null;
}
