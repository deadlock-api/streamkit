interface UrlDisplayProps {
  generatedUrl: string;
}

export function UrlDisplay({ generatedUrl }: UrlDisplayProps) {
  return (
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
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
  );
}
