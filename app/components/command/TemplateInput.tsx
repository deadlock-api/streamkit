import React from "react";

interface TemplateInputProps {
  template: string;
  setTemplate: (value: string) => void;
}

export function TemplateInput({ template, setTemplate }: TemplateInputProps) {
  return (
    <div>
      <label htmlFor="template" className="block text-sm font-medium text-gray-700">
        Command Template
      </label>
      <div className="relative mt-1">
        <textarea
          id="template"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-black bg-white"
          placeholder="Example: {steam_account_name} has {wins_today}W - {losses_today}L today"
          rows={3}
        />
      </div>
    </div>
  );
}
