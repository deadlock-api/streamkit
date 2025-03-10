import { snakeToPretty } from "~/lib/utils";

interface ExtraArgumentsProps {
  extraArgs: { [key: string]: string };
  usedArgs: string[];
  onExtraArgChange: (arg: string, value: string) => void;
}

export function ExtraArguments({ extraArgs, usedArgs, onExtraArgChange }: ExtraArgumentsProps) {
  if (usedArgs.length === 0) return null;

  return (
    <div>
      <h3 className="block text-sm font-medium text-gray-700 mb-2">Extra Arguments</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {usedArgs.map((arg) => (
          <div key={arg} className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">{snakeToPretty(arg)}</span>
            <input
              type="text"
              value={extraArgs[arg] || ""}
              onChange={(e) => onExtraArgChange(arg, e.target.value)}
              className="w-24 rounded-md border border-gray-300 px-2 py-1 shadow focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
