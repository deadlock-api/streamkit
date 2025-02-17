import type { MetaFunction } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import CommandBuilder from "~/components/command/CommandBuilder";
import WidgetBuilder from "~/components/widget-builder";

export const meta: MetaFunction = () => {
  return [
    { title: "Deadlock API - Chat Command Builder - Widget Builder" },
    {
      name: "description",
      content:
        "Create custom deadlock chat commands and widgets for your stream. Works with StreamElements, Fossabot, Nightbot, and more!",
    },
  ];
};

const regions = ["Europe", "Asia", "NAmerica", "SAmerica", "Oceania"] as const;

export default function Index() {
  const [searchParams] = useSearchParams();
  const [steamId, setSteamId] = useState(searchParams.get("steamid") ?? "");
  const [region, setRegion] = useState(searchParams.get("region") ?? "");

  const parseSteamId = (steamId: string) => {
    try {
      let extractedSteamId = BigInt(
        steamId
          .replace(/\[U:\d+:/g, "")
          .replace(/U:\d+:/g, "")
          .replace(/\[STEAM_0:\d+:/g, "")
          .replace(/STEAM_0:\d+:/g, "")
          .replace(/]/g, ""),
      );
      // Convert SteamID64 to SteamID3
      if (extractedSteamId > 76561197960265728n) extractedSteamId -= 76561197960265728n;
      return extractedSteamId.toString();
    } catch (err) {
      console.error("Failed to parse Steam ID:", err);
      return steamId;
    }
  };

  const fetchSteamName = async (region: string, steamId: string) => {
    if (!steamId) return null;
    if (!region) return null;
    const url = new URL(`https://data.deadlock-api.com/v1/commands/${region}/${steamId}/resolve-variables`);
    url.searchParams.append("variables", "steam_account_name");
    const res = await fetch(url);
    return (await res.json()).steam_account_name;
  };

  const {
    data: steamAccountName,
    isLoading: steamAccountLoading,
    error: steamAccountError,
  } = useQuery<string>({
    queryKey: ["steamName", region, steamId],
    queryFn: () => fetchSteamName(region, steamId),
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[90rem] rounded-lg bg-white p-8 shadow-md space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Deadlock Streamkit</h1>
        <h2 className="text-black text-center space-y-4">
          Part of the{" "}
          <a href="https://deadlock-api.com" className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
            Deadlock API
          </a>{" "}
          project.
        </h2>

        <div className="max-w-[700px] mx-auto">
          <label htmlFor="steamid" className="block text-sm font-medium text-gray-700">
            Steam ID3
          </label>
          <input
            type="number"
            id="steamid"
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="Enter your Steam ID3"
          />
          <p className="mt-2 text-sm text-gray-500">
            You can find your Steam ID3 from your Steam profile URL or by using a Steam ID finder tool.
          </p>
        </div>

        <div className="max-w-[700px] mx-auto">
          <label htmlFor="region" className="block text-sm font-medium text-gray-700">
            Region
          </label>
          <select
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-black"
          >
            <option value="">Select a region</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {steamId && region && (
          <div className="max-w-[700px] mx-auto">
            {steamAccountLoading ? (
              <div
                className="flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3 max-w-lg ml-auto mr-auto rounded"
                role="alert"
              >
                <svg className="fill-current w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <title>Loading</title>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"
                  />
                </svg>
                <p className="block sm:inline">Fetching Steam account...</p>
              </div>
            ) : steamAccountError || !steamAccountName ? (
              <div
                className="flex items-center bg-orange-500 text-white text-sm font-bold px-4 py-3 max-w-lg ml-auto mr-auto rounded "
                role="alert"
              >
                <svg className="fill-current w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <title>Warn</title>
                  <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z" />
                </svg>
                <p className="block sm:inline text-white">
                  Failed to fetch Steam account name. Please make sure you entered a valid Steam ID3 and region.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Found Steam account:{" "}
                <span className="font-bold text-gray-900">
                  {steamAccountName} ({steamId})
                </span>
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-x-6">
          <div className="flex-1 max-w-[700px] mx-auto mt-6">
            <h2 className="text-xl font-bold text-gray-900">Command Builder</h2>
            <CommandBuilder region={region} accountId={parseSteamId(steamId)} />
          </div>
          <div className="flex-1 max-w-[700px] mx-auto mt-6">
            <h2 className="text-xl font-bold text-gray-900">Widget Builder</h2>
            <WidgetBuilder region={region} accountId={parseSteamId(steamId)} />
          </div>
        </div>
      </div>
    </div>
  );
}
