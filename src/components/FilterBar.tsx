import type { FilterKey } from "../types/coffee";

const filterLabels: Record<FilterKey, string> = {
  "open-now": "Open now",
  walkable: "Walkable"
};

interface FilterBarProps {
  activeFilters: FilterKey[];
  onToggleFilter: (filter: FilterKey) => void;
}

export function FilterBar({ activeFilters, onToggleFilter }: FilterBarProps) {
  return (
    <div className="filter-bar">
      {Object.entries(filterLabels).map(([key, label]) => {
        const filter = key as FilterKey;
        const active = activeFilters.includes(filter);

        return (
          <button
            key={filter}
            className={active ? "filter-chip active" : "filter-chip"}
            onClick={() => onToggleFilter(filter)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
