import { SOURCE_BY_ID } from "../data/sources";
import type { SourceId } from "../types";

interface SourcePlateProps {
  source: SourceId;
  compact?: boolean;
}

export function SourcePlate({ source, compact = false }: SourcePlateProps) {
  const definition = SOURCE_BY_ID[source];
  return (
    <span
      className={`source-plate${compact ? " source-plate-compact" : ""}`}
      style={{ "--source-color": definition.color } as React.CSSProperties}
      aria-label={definition.name}
      title={definition.name}
    >
      <span>{definition.initials}</span>
    </span>
  );
}
