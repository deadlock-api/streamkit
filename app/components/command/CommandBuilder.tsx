import { useEffect, useState } from "react";
import { fetchWithRetry, useDebouncedState } from "~/lib/utils";
import { ChatBotInstructions } from "./ChatBotInstructions";
import { CommandPreview } from "./CommandPreview";
import { ExtraArguments } from "./ExtraArguments";
import { TemplateInput } from "./TemplateInput";
import { UrlDisplay } from "./UrlDisplay";
import { VariablesList } from "./VariablesList";

export interface Variable {
  name: string;
  description: string;
  extra_args?: string[];
}

export interface CommandBuilderProps {
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
    fetchWithRetry("https://data.deadlock-api.com/v1/commands/available-variables")
      .then((res) => res.json())
      .then((data: Variable[]) => setVariables(data.filter((v) => !v.name.endsWith("_img"))))
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
      setPreview(null);
      setPreviewError("");
      fetchWithRetry(debouncedGeneratedUrl)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch preview");
          }
          return res.text();
        })
        .then((data) => setPreview(data))
        .catch(() => setPreviewError("Failed to load preview. Please check the generated URL."));
    } else {
      setPreview(null);
    }
  }, [debouncedGeneratedUrl]);

  const handleExtraArgChange = (arg: string, value: string) => {
    setExtraArgs({ ...extraArgs, [arg]: value });
  };

  return (
    <div className="mt-4 space-y-6">
      <TemplateInput template={template} setTemplate={setTemplate} />
      <VariablesList variables={variables} onVariableClick={insertVariable} />
      <ExtraArguments extraArgs={extraArgs} usedArgs={usedExtraArgs()} onExtraArgChange={handleExtraArgChange} />
      <UrlDisplay generatedUrl={generatedUrl} />
      <CommandPreview preview={preview} previewError={previewError} />
      <ChatBotInstructions generatedUrl={generatedUrl} />
    </div>
  );
}
