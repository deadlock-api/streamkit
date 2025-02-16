import { useQuery } from "@tanstack/react-query";
import { type ReactElement, useEffect, useState } from "react";
import type { Variable } from "~/components/command/CommandBuilder";
import { ExtraArguments } from "~/components/widgets/ExtraArguments";
import { BoxWidget } from "~/components/widgets/box";
import { RawWidget } from "~/components/widgets/raw";
import { DEFAULT_LABELS, DEFAULT_VARIABLES } from "~/constants/widget";
import { snakeToPretty } from "~/lib/utils";
import type { Color, Region, Theme } from "~/types/widget";

const widgetTypes: string[] = ["box", "raw"];

interface WidgetBuilderProps {
  region: string;
  accountId: string;
}

type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;
type PreviewBackgroundColor = RGB | RGBA | HEX;

export default function WidgetBuilder({ region, accountId }: WidgetBuilderProps) {
  const [widgetType, setWidgetType] = useState<string>(widgetTypes[0]);
  const [theme, setTheme] = useState<Theme>("dark");
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);
  const [widgetPreview, setWidgetPreview] = useState<ReactElement | null>(null);
  const [widgetPreviewBackgroundImage, setWidgetPreviewBackgroundImage] = useState<boolean>(true);
  const [widgetPreviewBackgroundColor, setWidgetPreviewBackgroundColor] = useState<PreviewBackgroundColor>("#f3f4f6");
  const [variables, setVariables] = useState<string[]>(DEFAULT_VARIABLES);
  const [variable, setVariable] = useState<string>("wins_losses_today");
  const [prefix, setPrefix] = useState<string>("Score: ");
  const [suffix, setSuffix] = useState<string>("");
  const [fontColorLikeRank, setFontColorLikeRank] = useState<boolean>(true);
  const [fontColor, setFontColor] = useState<Color>("#ffffff");
  const [labels, setLabels] = useState<string[]>(DEFAULT_LABELS);
  const [extraArgs, setExtraArgs] = useState<{ [key: string]: string }>({});
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);
  const [showHeader, setShowHeader] = useState(true);
  const [showBranding, setShowBranding] = useState(true);
  const [showMatchHistory, setShowMatchHistory] = useState(true);
  const [matchHistoryShowsToday, setMatchHistoryShowsToday] = useState(false);
  const [numMatches, setNumMatches] = useState(10);
  const [opacity, setOpacity] = useState(100);

  const { data, error } = useQuery<Variable[]>({
    queryKey: ["available-variables"],
    queryFn: () => fetch("https://data.deadlock-api.com/v1/commands/available-variables").then((res) => res.json()),
    staleTime: Number.POSITIVE_INFINITY,
  });

  useEffect(() => {
    if (data) setAvailableVariables(data);
    if (error) {
      setAvailableVariables([]);
      console.error(error);
    }
  }, [data, error]);

  useEffect(() => {
    if (!accountId || !region) return;

    const url = new URL(`https://streamkit.deadlock-api.com/widgets/${region}/${accountId}/${widgetType}`);
    for (const [arg, value] of Object.entries(extraArgs)) {
      if (value) url.searchParams.set(arg, value);
    }
    switch (widgetType) {
      case "box":
        if (variables.length > 0) url.searchParams.set("vars", variables.join(","));
        if (labels.length > 0) url.searchParams.set("labels", labels.join(","));
        url.searchParams.set("theme", theme);
        url.searchParams.set("showHeader", showHeader.toString());
        url.searchParams.set("showBranding", showBranding.toString());
        url.searchParams.set("showMatchHistory", showMatchHistory.toString());
        url.searchParams.set("matchHistoryShowsToday", matchHistoryShowsToday.toString());
        url.searchParams.set("numMatches", numMatches.toString());
        url.searchParams.set("opacity", opacity.toString());
        setWidgetUrl(url.toString());
        setWidgetPreview(
          <BoxWidget
            region={region as Region}
            accountId={accountId}
            variables={variables}
            labels={labels}
            extraArgs={extraArgs}
            theme={theme}
            showHeader={showHeader}
            showBranding={showBranding}
            showMatchHistory={showMatchHistory}
            matchHistoryShowsToday={matchHistoryShowsToday}
            numMatches={numMatches}
            opacity={opacity}
          />,
        );
        break;
      case "raw":
        url.searchParams.set("fontColor", fontColor);
        url.searchParams.set("variable", variable);
        url.searchParams.set("fontColorLikeRank", fontColorLikeRank.toString());
        url.searchParams.set("prefix", prefix);
        url.searchParams.set("suffix", suffix);
        setWidgetUrl(url.toString());
        setWidgetPreview(
          <RawWidget
            region={region as Region}
            accountId={accountId}
            variable={variable}
            fontColor={fontColor}
            fontColorLikeRank={fontColorLikeRank}
            extraArgs={extraArgs}
            prefix={prefix}
            suffix={suffix}
          />,
        );
        break;
      default:
        setWidgetPreview(null);
    }
  }, [
    region,
    accountId,
    widgetType,
    variables,
    variable,
    fontColor,
    labels,
    extraArgs,
    theme,
    showHeader,
    showBranding,
    matchHistoryShowsToday,
    showMatchHistory,
    numMatches,
    opacity,
    prefix,
    suffix,
    fontColorLikeRank,
  ]);

  const themes: { value: Theme; label: string }[] = [
    { value: "dark", label: "Dark Theme" },
    { value: "light", label: "Light Theme" },
    { value: "glass", label: "Glass Theme" },
  ];

  return (
    <div className="mt-4 space-y-6">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              id="type"
              value={widgetType}
              onChange={(e) => setWidgetType(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-black"
            >
              {widgetTypes.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {widgetType === "box" && (
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                Theme
              </label>
              <select
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-black"
              >
                {themes.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {widgetType === "raw" && (
          <>
            <div className="w-fit">
              <label htmlFor="variable" className="block text-sm font-medium text-gray-700">
                Variable
              </label>
              <select
                id="variable"
                value={variable}
                onChange={(e) => setVariable(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-black"
              >
                <option value="">Select a variable</option>
                {availableVariables.map((v) => (
                  <option key={v.name} value={v.name} title={v.description}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 items-center w-full gap-4">
              <div>
                <label htmlFor="prefix" className="block text-sm font-medium text-gray-700">
                  Prefix
                </label>
                <input
                  type="text"
                  id="prefix"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-black"
                />
              </div>
              <div>
                <label htmlFor="suffix" className="block text-sm font-medium text-gray-700">
                  Suffix
                </label>
                <input
                  type="text"
                  id="suffix"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-black"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 items-center w-full gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fontColorLikeRank"
                  checked={fontColorLikeRank}
                  onChange={(e) => setFontColorLikeRank(e.target.checked)}
                  className="block rounded-md border border-gray-300 bg-white px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden text-black"
                />
                <label htmlFor="fontColor" className="block text-sm font-medium text-gray-700">
                  Font Color Like Rank (if available)
                </label>
              </div>
              <div>
                <label htmlFor="fontColor" className="block text-sm font-medium text-gray-700">
                  Font Color
                </label>
                <input
                  type="color"
                  id="fontColor"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value as Color)}
                  className="mt-1 block w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-black disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200"
                />
              </div>
            </div>
            <ExtraArguments
              extraArgs={availableVariables.filter((v) => variable === v.name).flatMap((v) => v.extra_args ?? [])}
              extraValues={extraArgs || {}}
              onChange={(arg, value) => setExtraArgs({ ...extraArgs, [arg]: value })}
            />
          </>
        )}

        {widgetType === "box" && (
          <>
            <div className="flex flex-col gap-3">
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
                  Show Branding
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
              <div className="ml-6 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="matchHistoryShowsToday"
                    checked={matchHistoryShowsToday}
                    disabled={!showMatchHistory}
                    onChange={(e) => setMatchHistoryShowsToday(e.target.checked)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <label htmlFor="matchHistoryShowsToday" className="text-sm font-medium text-gray-700">
                    Show Todays Matches
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={50}
                    disabled={!showMatchHistory || matchHistoryShowsToday}
                    id="numMatches"
                    value={numMatches}
                    onChange={(e) => setNumMatches(e.target.valueAsNumber)}
                    className="rounded border-gray-300 bg-gray-200 w-min"
                  />
                  <span className="text-sm font-medium text-gray-700">{numMatches} Matches</span>
                </div>
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
          </>
        )}
      </div>

      <div className="space-y-6">
        {theme !== "glass" && widgetType === "box" && (
          <div>
            <label htmlFor="opacity" className="block text-sm font-medium text-gray-700">
              Background Opacity
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="range"
                id="opacity"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
              />
              <span className="text-sm text-gray-600 min-w-[3ch]">{opacity}%</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Preview</h3>
          {widgetPreview && (
            <div
              className="p-4 rounded-lg flex items-center justify-center bg-cover"
              style={
                widgetPreviewBackgroundImage
                  ? {
                      background: "url('deadlock-background.webp'), url('deadlock-background.png')",
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                    }
                  : { backgroundColor: widgetPreviewBackgroundColor }
              }
            >
              {widgetPreview}
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="preview-bg-image-toggle"
                checked={widgetPreviewBackgroundImage}
                value={widgetPreviewBackgroundImage ? 1 : 0}
                onChange={(e) => setWidgetPreviewBackgroundImage(e.target.checked)}
                className="rounded-md border border-gray-300 w-4 h-4"
              />
              <label htmlFor="preview-bg-image-toggle" className="text-sm text-gray-700">
                Show Image
              </label>
            </div>
            {!widgetPreviewBackgroundImage && (
              <div className="flex items-center gap-2">
                <label htmlFor="preview-bg-color-picker" className="text-sm text-gray-700">
                  Background Color
                </label>
                <input
                  type="color"
                  id="preview-bg-color-picker"
                  disabled={widgetPreviewBackgroundImage}
                  value={widgetPreviewBackgroundColor}
                  onChange={(e) => setWidgetPreviewBackgroundColor(e.target.value as PreviewBackgroundColor)}
                  className="rounded-md border border-gray-300 w-8 h-8 p-0"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="block text-sm font-medium text-gray-700 mb-2">Generated URL</h3>
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
          <div
            className="flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3 max-w-lg ml-auto mr-auto rounded"
            role="alert"
          >
            <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Info</title>
              <path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z" />
            </svg>
            <p className="block sm:inline">
              Old OBS-Versions might cause issues.
              <br />
              Please update to the latest version if you encounter any issues!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
