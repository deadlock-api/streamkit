import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import { useDebouncedState, snakeToPretty } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "Deadlock API - Chat Command Builder" },
    {
      name: "description",
      content:
        "Create custom deadlock commands for your chatbot. Works with StreamElements, Fossabot, Nightbot, and more!",
    },
  ];
};

const regions = ["Europe", "Asia", "NAmerica", "SAmerica", "Oceania"] as const;

interface Variable {
  name: string;
  description: string;
  extra_args?: string[];
}

export default function Index() {
  const [steamId, setSteamId] = useState("");
  const [region, setRegion] = useState("");
  const [template, debouncedTemplate, setTemplate] = useDebouncedState("", 500);
  const [extraArgs, setExtraArgs] = useState<{ [key: string]: string }>({});
  const [variables, setVariables] = useState<Variable[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    fetch("https://data.deadlock-api.com/v1/commands/available-variables")
      .then((res) => res.json())
      .then((data: Variable[]) => setVariables(data))
      .catch((err) => console.error("Failed to fetch available variables:", err));
  }, []);

  const parseSteamId = (steamId: string) => {
    try {
      let extractedSteamId = BigInt(steamId.replace(/\[U:\d+:/g, "").replace(/]/g, ""));
      // Convert SteamID64 to SteamID3
      if (extractedSteamId > 76561197960265728n) extractedSteamId -= 76561197960265728n;
      return extractedSteamId.toString();
    } catch (err) {
      console.error("Failed to parse Steam ID:", err);
      return steamId;
    }
  };

  const generateUrl = (steamId: string, region: string, template: string) => {
    if (!steamId || !region) {
      return "";
    }
    const baseUrl = "https://data.deadlock-api.com/v1/commands";
    const url = new URL(`${baseUrl}/${region}/${parseSteamId(steamId)}/resolve`);
    if (template) {
      url.searchParams.set("template", template);
    }
    for (const [key, value] of Object.entries(extraArgs)) {
      if (value) url.searchParams.set(key, value);
    }
    return url.toString();
  };

  const usedExtraArgs = () => {
    const extraArgs: Set<string> = new Set();
    for (const match of template.matchAll(/{([^}]+)}/g)) {
      variables.find((v) => v.name === match[1])?.extra_args?.forEach((arg) => extraArgs.add(arg));
    }
    return Array.from(extraArgs);
  };

  const generatedUrl = generateUrl(steamId, region, template);
  const debouncedGeneratedUrl = generateUrl(steamId, region, debouncedTemplate);

  const insertVariable = (varName: string) => {
    const cursorPos = (document.getElementById("template") as HTMLTextAreaElement)?.selectionStart || template.length;
    const newTemplate = template.slice(0, cursorPos) + `{${varName}}` + template.slice(cursorPos);
    setTemplate(newTemplate);
  };

  useEffect(() => {
    if (debouncedGeneratedUrl) {
      setPreview(null); // Reset preview before fetching
      setPreviewError("");
      fetch(debouncedGeneratedUrl)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch preview");
          }
          return res.text(); // Assuming the response is text
        })
        .then((data) => setPreview(data))
        .catch((err) => setPreviewError("Failed to load preview. Please check the generated URL."));
    } else {
      setPreview(null);
    }
  }, [debouncedGeneratedUrl]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Command Builder Section */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Command Builder</h1>
          <h2 className="text-black">
            Part of the{" "}
            <a href="https://deadlock-api.com" className="text-blue-600 hover:underline" target="_blank">
              Deadlock API
            </a>{" "}
            project.
          </h2>
          <br />
          <div className="space-y-4">
            <div>
              <label htmlFor="steamid" className="block text-sm font-medium text-gray-700">
                Steam ID3
              </label>
              <input
                type="text"
                id="steamid"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black bg-gray-200"
                placeholder="Enter your Steam ID3"
              />
              <p className="mt-2 text-sm text-gray-500">
                You can find your Steam ID3 from your Steam profile URL or by using a Steam ID finder tool.
              </p>
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                Region
              </label>
              <select
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black bg-gray-200"
              >
                <option value="">Select a region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="template" className="block text-sm font-medium text-gray-700">
                Command Template
              </label>
              <div className="relative mt-1">
                <textarea
                  id="template"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black bg-gray-200"
                  placeholder="Example: {steam_account_name} has {wins_today}W - {losses_today}L today"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Variables</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {variables.map((variable) => (
                  <button
                    key={variable.name}
                    onClick={() => insertVariable(variable.name)}
                    className="text-left p-2 rounded-md hover:bg-gray-100 transition-colors text-blue-600 text-sm"
                    title={variable.description}
                  >
                    {snakeToPretty(variable.name)}
                  </button>
                ))}
              </div>
            </div>

            {usedExtraArgs().length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Extra Arguments</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {usedExtraArgs().map((arg) => (
                    <div key={arg} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">{snakeToPretty(arg)}</span>
                      <input
                        type="text"
                        value={extraArgs[arg] || ""}
                        onChange={(e) => setExtraArgs({ ...extraArgs, [arg]: e.target.value })}
                        className="w-24 rounded-md border border-gray-300 px-2 py-1 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">Generated URL</label>
              {generatedUrl && (
                <div className="relative mt-1">
                  <div className="break-all rounded-md border border-gray-300 bg-gray-50 p-3 pr-24 text-sm text-gray-600">
                    {generatedUrl}
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedUrl)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-blue-500 px-3 py-1 text-sm font-medium text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Copy
                  </button>
                </div>
              )}
              {!generatedUrl && (
                <div className="rounded-md border border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
                  Fill in the Steam ID3 and Region to generate the URL
                </div>
              )}
            </div>

            {/* Command Preview Section */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Command Preview</label>
              <div className="mt-1 rounded-md border border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
                {previewError && <div className="text-red-600">{previewError}</div>}
                {!previewError && (
                  <div>
                    {preview ? (
                      <pre>{preview}</pre>
                    ) : (
                      "No preview available yet. Fill in the fields to generate a preview."
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Chat Bots Section */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">How to use?</label>
              <div className="mt-2 rounded-md border border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                <p className="mb-3">
                  Use the generated URL in your favorite chat bot to create dynamic commands. Below are examples of how
                  to use it with popular bots:
                </p>
                <ul className="space-y-4">
                  {[
                    { name: "StreamElements", command: `$(customapi ${generatedUrl || "https://your-command-url"})` },
                    { name: "Fossabot", command: `$(customapi ${generatedUrl || "https://your-command-url"})` },
                    { name: "Nightbot", command: `$(urlfetch ${generatedUrl || "https://your-command-url"})` },
                  ].map(({ name, command }, index) => (
                    <li key={index} className="flex items-center justify-between rounded-md bg-white p-3 shadow">
                      <div>
                        <strong>{name}:</strong> <code className="text-blue-600">{command}</code>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(command)}
                        className="ml-4 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Copy
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
