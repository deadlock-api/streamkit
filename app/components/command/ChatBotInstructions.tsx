interface ChatBotInstructionsProps {
  generatedUrl: string;
}

export function ChatBotInstructions({ generatedUrl }: ChatBotInstructionsProps) {
  const chatBots = [
    { name: "StreamElements", command: `$(customapi ${generatedUrl || "https://your-command-url"})` },
    { name: "Fossabot", command: `$(customapi ${generatedUrl || "https://your-command-url"})` },
    { name: "Nightbot", command: `$(urlfetch ${generatedUrl || "https://your-command-url"})` },
  ];

  return (
    <div>
      <h3 className="block text-sm font-medium text-gray-700">How to use?</h3>
      <div className="mt-2 rounded-md border border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
        <p className="mb-3">
          Use the generated URL in your favorite chat bot to create dynamic commands. Below are examples of how to use
          it with popular bots:
        </p>
        <ul className="space-y-4">
          {chatBots.map(({ name, command }) => (
            <li key={name} className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm">
              <div>
                <strong>{name}:</strong> <code className="text-blue-600">{command}</code>
              </div>
              <button
                id={`copy-${name}`}
                type="button"
                onClick={() => navigator.clipboard.writeText(command)}
                className="ml-4 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Copy
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
