import { useEffect, useState } from "react";
import { snakeToPretty } from "~/lib/utils";

const UPDATE_INTERVAL_MS = 2 * 60 * 1000;

interface StatDisplay {
  value: string;
  label: string;
}

type DeadlockWidgetProps = {
  region: string;
  accountId: string;
  variables: string[];
  labels?: string[];
};

export default function BoxWidget({ region, accountId, variables, labels }: DeadlockWidgetProps) {
  const [stats, setStats] = useState<{ [key: string]: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  labels = labels ?? variables.map(snakeToPretty);

  // Create mapping of variables to their display properties
  const getStatDisplays = (): StatDisplay[] => {
    if (!stats) return [];

    return variables.map((variable, index) => ({
      value: (variable.includes("leaderboard") ? "#" : "") + stats[variable],
      label: labels[index],
    }));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: stats is not a dependency
  useEffect(() => {
    const fetchStats = async () => {
      if (!region || !accountId) {
        setError("Region and Account ID are required");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://data.deadlock-api.com/v1/commands/${region}/${accountId}/resolve-variables?variables=${variables.join(",")}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }

        const data = await response.json();
        // Only update if data has changed
        if (JSON.stringify(data) !== JSON.stringify(stats)) {
          setStats(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStats();

    // Set up interval for subsequent fetches (every 2 minutes)
    const intervalId = setInterval(fetchStats, UPDATE_INTERVAL_MS);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [region, accountId, variables]);

  const statDisplays = getStatDisplays();

  return (
    <div className="inline-block min-w-[200px] max-w-[600px] overflow-hidden rounded-lg bg-white/90 shadow-lg backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gray-800/95 px-4 py-2 text-center">
        <p className="text-sm text-gray-300">
          Widget made by{" "}
          <a
            href="https://deadlock-api.com"
            className="font-medium text-blue-400 hover:text-blue-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            deadlock-api.com
          </a>
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading && !stats ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : stats ? (
          <div className={`grid gap-4 ${statDisplays.length > 3 ? "grid-cols-2" : "grid-cols-3"}`}>
            {statDisplays.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
