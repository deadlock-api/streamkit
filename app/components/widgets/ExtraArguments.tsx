import { snakeToPretty } from "~/lib/utils";

interface ExtraArgumentsProps {
  extraArgs: string[];
  extraValues: { [key: string]: string };
  onChange: (arg: string, value: string) => void;
}

export function ExtraArguments({ extraArgs, extraValues, onChange }: ExtraArgumentsProps) {
  if (!extraArgs || extraArgs.length === 0) return null;

  extraArgs = [...new Set(extraArgs)];

  return (
    <div className="ml-8 mt-2 space-y-2">
      {extraArgs.map((arg) => (
        <div key={arg} className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{snakeToPretty(arg)}:</span>
          <input
            type="text"
            value={extraValues[arg] ?? ""}
            onChange={(e) => onChange(arg, e.target.value)}
            className="block w-36 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={`Enter ${snakeToPretty(arg)}`}
          />
        </div>
      ))}
    </div>
  );
}
