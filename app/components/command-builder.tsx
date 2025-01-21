import { useEffect, useState } from "react";
import { snakeToPretty, useDebouncedState } from "~/lib/utils";

interface Variable {
  name: string;
  description: string;
  extra_args?: string[];
}

interface CommandBuilderProps {
  region: string;
  accountId: string;
}

export default function CommandBuilder({ region, accountId }: CommandBuilderProps) {
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

  const generateUrl = (steamId: string, region: string, template: string) => {
    if (!steamId || !region) {
      return "";
    }
    const baseUrl = "https://data.deadlock-api.com/v1/commands";
    const url = new URL(`${baseUrl}/${region}/${steamId}/resolve`);
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
      for (const arg of variables.find((v) => v.name === match[1])?.extra_args || []) {
        extraArgs.add(arg);
      }
    }
    return Array.from(extraArgs);
  };

  const generatedUrl = generateUrl(accountId, region, template);
  const debouncedGeneratedUrl = generateUrl(accountId, region, debouncedTemplate);

  const insertVariable = (varName: string) => {
    const cursorPos = (document.getElementById("template") as HTMLTextAreaElement)?.selectionStart || template.length;
    const newTemplate = `${template.slice(0, cursorPos)}{${varName}}${template.slice(cursorPos)}`;
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
        .catch(() => setPreviewError("Failed to load preview. Please check the generated URL."));
    } else {
      setPreview(null);
    }
  }, [debouncedGeneratedUrl]);

  return (
    <div className="mt-4 space-y-6">
      <div>
        <label htmlFor="template" className="block text-sm font-medium text-gray-700">
          Command Template
        </label>
        <div className="relative mt-1">
          <textarea
            id="template"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black bg-white"
            placeholder="Example: {steam_account_name} has {wins_today}W - {losses_today}L today"
            rows={3}
          />
        </div>
      </div>

      <div>
        <h3 className="block text-sm font-medium text-gray-700 mb-2">Available Variables</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {variables.map((variable) => (
            <button
              type="button"
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
          <h3 className="block text-sm font-medium text-gray-700 mb-2">Extra Arguments</h3>
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

      <div>
        <h3 className="block text-sm font-medium text-gray-700">Generated URL</h3>
        {generatedUrl ? (
          <div className="relative mt-1">
            <div className="break-all rounded-md border border-gray-300 bg-gray-50 p-3 pr-24 text-sm text-gray-600">
              {generatedUrl}
            </div>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(generatedUrl)}
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

      {/* Command Preview Section */}
      <div>
        <h3 className="block text-sm font-medium text-gray-700">Command Preview</h3>
        <div className="mt-1 rounded-md border border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
          {previewError ? (
            <div className="text-red-600">{previewError}</div>
          ) : (
            <div>
              {preview ? <pre>{preview}</pre> : "No preview available yet. Fill in the fields to generate a preview."}
            </div>
          )}
        </div>
      </div>

      {/* Chat Bots Section */}
      <div>
        <h3 className="block text-sm font-medium text-gray-700">How to use?</h3>
        <div className="mt-2 rounded-md border border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
          <p className="mb-3">
            Use the generated URL in your favorite chat bot to create dynamic commands. Below are examples of how to use
            it with popular bots:
          </p>
          <ul className="space-y-4">
            {[
              { name: "StreamElements", command: `$(customapi ${generatedUrl || "https://your-command-url"})` },
              { name: "Fossabot", command: `$(customapi ${generatedUrl || "https://your-command-url"})` },
              { name: "Nightbot", command: `$(urlfetch ${generatedUrl || "https://your-command-url"})` },
            ].map(({ name, command }) => (
              <li key={name} className="flex items-center justify-between rounded-md bg-white p-3 shadow">
                <div>
                  <strong>{name}:</strong> <code className="text-blue-600">{command}</code>
                </div>
                <button
                  id={`copy-${name}`}
                  type="button"
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
  );
}
