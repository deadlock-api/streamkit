interface CommandPreviewProps {
  preview: string | null;
  previewError: string | null;
}

export function CommandPreview({ preview, previewError }: CommandPreviewProps) {
  return (
    <div>
      <h3 className="block text-sm font-medium text-gray-700">Command Preview</h3>
      <div className="mt-1 rounded-md border border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
        {previewError ? (
          <div className="text-red-600">{previewError}</div>
        ) : (
          <div>
            {preview ? (
              <pre className="whitespace-pre-wrap">{preview}</pre>
            ) : (
              "No preview available yet. Fill in the fields to generate a preview."
            )}
          </div>
        )}
      </div>
    </div>
  );
}
