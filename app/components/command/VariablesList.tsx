import { snakeToPretty } from "~/lib/utils";

interface Variable {
  name: string;
  description: string;
  extra_args?: string[];
}

interface VariablesListProps {
  variables: Variable[];
  onVariableClick: (varName: string) => void;
}

export function VariablesList({ variables, onVariableClick }: VariablesListProps) {
  return (
    <div>
      <h3 className="block text-sm font-medium text-gray-700 mb-2">Available Variables</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {variables.map((variable) => (
          <button
            type="button"
            key={variable.name}
            onClick={() => onVariableClick(variable.name)}
            className="text-left p-2 rounded-md hover:bg-gray-100 transition-colors text-blue-600 text-sm"
            title={variable.description}
          >
            {snakeToPretty(variable.name)}
          </button>
        ))}
      </div>
    </div>
  );
}
