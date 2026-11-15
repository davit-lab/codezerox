import { fileKind } from "./project";

/** A small folded-corner page, tinted by file type. */
const FileGlyph = ({ name, size = 16 }: { name: string; size?: number }) => {
  const { hue, label } = fileKind(name);
  return (
    <svg
      width={size * 0.82}
      height={size}
      viewBox="0 0 14 17"
      fill="none"
      aria-hidden="true"
      className="pg-glyph"
      data-kind={label}
    >
      <path d="M1.5 1.5h7l4 4v10h-11z" fill={hue} fillOpacity="0.1" stroke={hue} strokeOpacity="0.85" strokeWidth="1" />
      <path d="M8.5 1.5v4h4" stroke={hue} strokeOpacity="0.85" strokeWidth="1" />
      <rect x="1.5" y="12" width="11" height="3.5" fill={hue} fillOpacity="0.9" />
    </svg>
  );
};

export const FileName = ({ name }: { name: string }) => {
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return <span className="pg-fname">{name}</span>;
  return (
    <span className="pg-fname">
      {name.slice(0, dot)}
      <span className="pg-fext">{name.slice(dot)}</span>
    </span>
  );
};

export default FileGlyph;
