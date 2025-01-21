import { type ReactElement, useEffect, useState } from "react";
import BoxWidget from "~/components/widgets/box";

const widgetTypes: string[] = ["box"];

interface WidgetBuilderProps {
  region: string;
  accountId: string;
}

export default function WidgetBuilder({ region, accountId }: WidgetBuilderProps) {
  const [widgetType, setWidgetType] = useState<string>(widgetTypes[0]);
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);
  const [widgetPreview, setWidgetPreview] = useState<ReactElement | null>(null);

  useEffect(() => {
    if (!accountId || !region) return;

    const baseUrl = "https://streamkit.deadlock-api.com/widgets";
    setWidgetUrl(`${baseUrl}/${region}/${accountId}/${widgetType}`);
    switch (widgetType) {
      case "box":
        setWidgetPreview(<BoxWidget region={region} accountId={accountId} />);
        break;
      default:
        setWidgetPreview(null);
    }
  }, [region, accountId, widgetType]);

  return (
    <div className="mt-4 space-y-6">
      <div className="max-w-2xl">
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          id="type"
          value={widgetType}
          onChange={(e) => setWidgetType(e.target.value)}
          className="mt-1 block rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black pr-6"
        >
          {widgetTypes.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
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
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-blue-500 px-3 py-1 text-sm font-medium text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
