import { type ReactElement, useEffect, useState } from "react";
import type { Variable } from "~/components/command/CommandBuilder";
import { ExtraArguments } from "~/components/widgets/ExtraArguments";
import BoxWidget from "~/components/widgets/box";
import { snakeToPretty } from "~/lib/utils";
import type { Theme } from "~/types/widget";

const widgetTypes: string[] = ["box"];

interface WidgetBuilderProps {
  region: string;
  accountId: string;
}

export default function WidgetBuilder({ region, accountId }: WidgetBuilderProps) {
  const [widgetType, setWidgetType] = useState<string>(widgetTypes[0]);
  const [theme, setTheme] = useState<Theme>("dark");
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);
  const [widgetPreview, setWidgetPreview] = useState<ReactElement | null>(null);
  const [variables, setVariables] = useState<string[]>(["leaderboard_place", "wins_today", "losses_today"]);
  const [labels, setLabels] = useState<string[]>(["Leaderboard Place", "Wins Today", "Losses Today"]);
  const [extraArgs, setExtraArgs] = useState<{ [key: string]: string }>({});
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);
  const [showHeader, setShowHeader] = useState(true);
  const [showBranding, setShowBranding] = useState(true);
  const [showMatchHistory, setShowMatchHistory] = useState(true);

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
    url.searchParams.set("theme", theme);
    url.searchParams.set("showHeader", showHeader.toString());
    url.searchParams.set("showBranding", showBranding.toString());
    url.searchParams.set("showMatchHistory", showMatchHistory.toString());
    for (const [arg, value] of Object.entries(extraArgs)) {
      if (value) url.searchParams.set(arg, value);
    }
    setWidgetUrl(url.toString());
    switch (widgetType) {
      case "box":
        setWidgetPreview(
          <BoxWidget
            region={region}
            accountId={accountId}
            variables={variables}
            labels={labels}
            extraArgs={extraArgs}
            theme={theme}
            showHeader={showHeader}
            showBranding={showBranding}
            showMatchHistory={showMatchHistory}
          />,
        );
        break;
      default:
        setWidgetPreview(null);
    }
  }, [region, accountId, widgetType, variables, labels, extraArgs, theme, showHeader, showBranding, showMatchHistory]);

  const themes: { value: Theme; label: string }[] = [
    { value: "dark", label: "Dark Theme" },
    { value: "light", label: "Light Theme" },
    { value: "glass", label: "Glass Theme" },
  ];

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
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
            Theme
          </label>
          <select
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className="mt-1 block rounded-md border border-gray-300 bg-white px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-black pr-6"
          >
            {themes.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showHeader"
              checked={showHeader}
              onChange={(e) => setShowHeader(e.target.checked)}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="showHeader" className="text-sm font-medium text-gray-700">
              Show Player Name Header
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showBranding"
              checked={showBranding}
              onChange={(e) => setShowBranding(e.target.checked)}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="showBranding" className="text-sm font-medium text-gray-700">
              Show "Widget by deadlock-api.com"
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showMatchHistory"
              checked={showMatchHistory}
              onChange={(e) => setShowMatchHistory(e.target.checked)}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="showMatchHistory" className="text-sm font-medium text-gray-700">
              Show Recent Matches
            </label>
          </div>
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
                    <div key={index}>
                      <div className="flex gap-3">
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
                        <button
                          type="button"
                          onClick={() => {
                            setVariables(variables.filter((_, i) => i !== index));
                            setLabels(labels.filter((_, i) => i !== index));
                          }}
                          className="rounded-md bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <ExtraArguments
                    extraArgs={availableVariables
                      .filter((v) => variables.includes(v.name))
                      .flatMap((v) => v.extra_args ?? [])}
                    extraValues={extraArgs || {}}
                    onChange={(arg, value) => setExtraArgs({ ...extraArgs, [arg]: value })}
                  />
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

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Preview</h3>
        <div className="p-4 rounded-lg bg-gray-100 flex items-center justify-center">{widgetPreview}</div>
      </div>
    </div>
  );
}
