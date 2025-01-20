import { useEffect, useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import { useParams, useSearchParams } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "Deadlock Stats Widget" }, { name: "description", content: "Stats widget powered by Deadlock API" }];
};

interface StatDisplay {
  value: string;
  label: string;
  color?: string;
}

export default function DeadlockWidget() {
  const { region, accountId } = useParams();
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState<{ [key: string]: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get variables from query parameters or use defaults
  const variables = searchParams.get("vars")?.split(",") ?? ["leaderboard_place", "wins_today", "losses_today"];

  // Get labels from query parameters or use defaults
  const labels = searchParams.get("labels")?.split(",") ?? ["Rank", "Wins", "Losses"];

  // Create mapping of variables to their display properties
  const getStatDisplays = (): StatDisplay[] => {
    if (!stats) return [];

    return variables.map((variable, index) => {
      const label = labels[index] || variable;
      let color = "text-gray-900";

      // Apply specific colors based on variable type
      if (variable.includes("wins")) {
        color = "text-green-600";
      } else if (variable.includes("losses") || variable.includes("deaths")) {
        color = "text-red-600";
      }

      return {
        value: variable.includes("leaderboard") ? `#${stats[variable]}` : stats[variable],
        label,
        color,
      };
    });
  };

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
    const intervalId = setInterval(fetchStats, 2 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [stats, region, accountId, variables.join(",")]); // Add variables to dependencies

  const statDisplays = getStatDisplays();

  return (
    <div className="fixed left-4 top-4">
      <div className="w-80 overflow-hidden rounded-lg bg-white/90 shadow-lg backdrop-blur-sm">
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
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">{error}</div>
          ) : stats ? (
            <div className={`grid gap-4 ${statDisplays.length > 3 ? "grid-cols-2" : "grid-cols-3"}`}>
              {statDisplays.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className={`mt-1 text-xl font-semibold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
