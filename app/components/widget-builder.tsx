import { type ReactElement, useEffect, useState } from "react";
import type { Variable } from "~/components/command/CommandBuilder";
import BoxWidget from "~/components/widgets/box";
import { snakeToPretty } from "~/lib/utils";

const widgetTypes: string[] = ["box"];

interface WidgetBuilderProps {
  region: string;
  accountId: string;
}

export default function WidgetBuilder({ region, accountId }: WidgetBuilderProps) {
  const [widgetType, setWidgetType] = useState<string>(widgetTypes[0]);
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);
  const [widgetPreview, setWidgetPreview] = useState<ReactElement | null>(null);
  const [variables, setVariables] = useState<string[]>(["leaderboard_place", "wins_today", "losses_today"]);
  const [labels, setLabels] = useState<string[]>(["Leaderboard Place", "Wins Today", "Losses Today"]);
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);

  useEffect(() => {
    fetch("https://data.deadlock-api.com/v1/commands/available-variables")
      .then((res) => res.json())
      .then((data: Variable[]) => setAvailableVariables(data))
      .catch((err) => console.error("Failed to fetch available variables:", err));
  }, []);

  useEffect(() => {
    if (!accountId || !region) return;

    const url = new URL(`https://streamkit.deadlock-api.com/widgets/${region}/${accountId}/${widgetType}`);
    if (variables.length > 0) url.searchParams.set("vars", variables.join(","));
    if (labels.length > 0) url.searchParams.set("labels", labels.join(","));
    setWidgetUrl(url.toString());
    switch (widgetType) {
      case "box":
        setWidgetPreview(<BoxWidget region={region} accountId={accountId} variables={variables} labels={labels} />);
        break;
      default:
        setWidgetPreview(null);
    }
  }, [region, accountId, widgetType, variables, labels]);

  return (
    <div className="mt-4 space-y-6">
      <div className="max-w-2xl space-y-6">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="type"
            value={widgetType}
            onChange={(e) => setWidgetType(e.target.value)}
            className="mt-1 block rounded-md border border-gray-300 bg-white px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-black pr-6"
          >
            {widgetTypes.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="block text-sm font-medium text-gray-700 mb-2">Variables and Labels</h3>
          <div className="space-y-3">
            {!variables ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {variables.map((variable, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    <div key={index} className="flex gap-3">
                      <select
                        value={variable}
                        onChange={(e) => {
                          const newVariables = [...variables];
                          newVariables[index] = e.target.value;
                          const newLabels = [...labels];
                          newLabels[index] = e.target.value ? snakeToPretty(e.target.value) : "";
                          setVariables(newVariables);
                          setLabels(newLabels);
                        }}
                        className="block w-1/2 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select a variable</option>
                        {availableVariables.map((v) => (
                          <option key={v.name} value={v.name} title={v.description}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={labels[index]}
                        onChange={(e) => {
                          const newLabels = [...labels];
                          newLabels[index] = e.target.value;
                          setLabels(newLabels);
                        }}
                        className="block w-1/2 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Label (optional)"
                      />
                      {variables.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newVariables = variables.filter((_, i) => i !== index);
                            const newLabels = labels.filter((_, i) => i !== index);
                            setVariables(newVariables);
                            setLabels(newLabels);
                          }}
                          className="rounded-md bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setVariables([...variables, ""]);
                    setLabels([...labels, ""]);
                  }}
                  className="rounded-md bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
                >
                  Add Variable
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="block text-sm font-medium text-gray-700">Generated URL</h3>
        {widgetUrl ? (
          <div className="relative mt-1">
            <div className="break-all rounded-md border border-gray-300 bg-gray-50 p-3 pr-24 text-sm text-gray-600">
              {widgetUrl}
            </div>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(widgetUrl)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-blue-500 px-3 py-1 text-sm font-medium text-white transition hover:bg-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Copy
            </button>
          </div>
        ) : (
          <div className="rounded-md border border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
            No URL available yet. Fill in the fields to generate a URL.
          </div>
        )}
      </div>

      <div>
        <h3 className="block text-sm font-medium text-gray-700">Widget Preview</h3>

        {widgetPreview ? (
          <div className="relative mt-1">{widgetPreview}</div>
        ) : (
          <div className="rounded-md border border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
            No preview available yet. Fill in the fields to generate a preview.
          </div>
        )}
      </div>
    </div>
  );
}
