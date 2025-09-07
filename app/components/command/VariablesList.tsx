import { snakeToPretty } from "~/lib/utils";
import type { Variable } from "~/types/command";

interface VariablesListProps {
  variables: Variable[];
  onVariableClick: (varName: string) => void;
}

const CATEGORY_SORT: Record<string, number> = {
  General: 0,
  Daily: 1,
  Leaderboard: 2,
  Overall: 3,
  Hero: 4,
  Item: 5,
  Miscellaneous: 6,
};

function sort_weight(category: string): number {
  return CATEGORY_SORT[category] ?? 99;
}

function groupBy<T>(xs: T[], callback: (item: T) => string): Record<string, T[]> {
  return xs.reduce(
    (rv, x) => {
      rv[callback(x)] = rv[callback(x)] || [];
      rv[callback(x)].push(x);
      return rv;
    },
    {} as Record<string, T[]>,
  );
}

export function VariablesList({ variables, onVariableClick }: VariablesListProps) {
  const groupedVariables = groupBy(variables, (item) => item.category || "Miscellaneous");
  return (
    <div>
      <h3 className="block text-lg font-medium text-gray-700 mb-2">Available Variables</h3>
      <div className="space-y-2">
        {Object.entries(groupedVariables)
          .sort((a, b) => sort_weight(a[0]) - sort_weight(b[0]))
          .map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">{category}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 ml-2">
                {items.map((variable) => (
                  <button
                    type="button"
                    key={variable.name}
                    onClick={() => onVariableClick(variable.name)}
                    className="text-left p-2 rounded-md hover:bg-gray-200 transition-colors text-blue-600 text-sm"
                    title={variable.description}
                  >
                    {snakeToPretty(variable.name)}
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
