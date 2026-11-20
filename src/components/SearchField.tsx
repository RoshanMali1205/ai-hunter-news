import { Icon } from "./Icon";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder = "Search stories",
  label = "Search stories",
}: SearchFieldProps) {
  const hasQuery = value.trim().length > 0;
  return (
    <label className={`search-field${hasQuery ? " has-value" : ""}`}>
      <Icon name="search" />
      <input
        aria-label={label}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {hasQuery && (
        <button type="button" aria-label="Clear search" onClick={() => onChange("")}>
          <Icon name="close" />
        </button>
      )}
    </label>
  );
}
