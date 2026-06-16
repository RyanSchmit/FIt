import { useCallback, useRef, useState } from "react";

interface Props {
  onCsv: (csv: string, name: string) => void;
  currentName: string;
}

export default function FileDrop({ onCsv, currentName }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => onCsv(String(reader.result), file.name);
      reader.readAsText(file);
    },
    [onCsv],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-2.5 text-sm transition ${
        dragging
          ? "border-accent bg-accent/10 text-accent"
          : "border-ink-600 bg-ink-850 text-slate-400 hover:border-ink-600/80 hover:text-slate-200"
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <div className="leading-tight">
        <div className="font-medium text-slate-300">Drop a Strong export</div>
        <div className="text-xs text-slate-500">
          Loaded: <span className="text-slate-400">{currentName}</span>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
