import { useEffect, useRef } from "react";
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from "vexflow";
import { toVexFlowNote } from "../../utils/music";

type StaffNotationProps = {
  clef: "treble" | "bass";
  noteLabel: string;
};

export function StaffNotation({ clef, noteLabel }: StaffNotationProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const renderNotation = () => {
      const width = Math.max(280, Math.min(container.clientWidth || 560, 640));
      container.innerHTML = "";

      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(width, 220);

      const context = renderer.getContext();
      context.setFont("Arial", 16, "").setBackgroundFillStyle("#fffbeb");

      const stave = new Stave(12, 30, width - 24);
      stave.addClef(clef);
      stave.setContext(context).draw();

      const parsedNote = toVexFlowNote(noteLabel);
      const staveNote = new StaveNote({
        clef,
        keys: [parsedNote.key],
        duration: "q",
      });

      if (parsedNote.accidental) {
        staveNote.addModifier(new Accidental(parsedNote.accidental), 0);
      }

      const voice = new Voice({ numBeats: 1, beatValue: 4 });
      voice.setMode(Voice.Mode.SOFT);
      voice.addTickables([staveNote]);

      new Formatter().format([voice], Math.max(120, width - 140));
      voice.draw(context, stave);
    };

    renderNotation();

    const resizeObserver = new ResizeObserver(() => {
      renderNotation();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [clef, noteLabel]);

  return (
    <div className="staff-card">
      <div className="staff-header">
        <span>{clef === "treble" ? "높은자리표" : "낮은자리표"}</span>
        <span>현재 음표 {noteLabel}</span>
      </div>
      <div ref={containerRef} className="staff-notation" aria-label={`현재 문제 음표 ${noteLabel}`} />
    </div>
  );
}
