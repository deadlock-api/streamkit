import type { MetaFunction } from "@remix-run/node";
import { useParams, useSearchParams } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BoxWidget } from "~/components/widgets/box";
import { RawWidget } from "~/components/widgets/raw";
import { snakeToPretty } from "~/lib/utils";
import type { Color, Region, Theme } from "~/types/widget";

export const meta: MetaFunction = () => {
  return [{ title: "Deadlock Stats Widget" }, { name: "description", content: "Stats widget powered by Deadlock API" }];
};

export default function Widget() {
  const { region, accountId, widgetType } = useParams();
  const [version, setVersion] = useState<number | null>(null);
  const [searchParams] = useSearchParams();

  const { data: fetchedVersion, error: versionError } = useQuery<number>({
    queryKey: ["version", widgetType],
    queryFn: () =>
      fetch("https://data.deadlock-api.com/v1/commands/widget-versions")
        .then((res) => res.json())
        .then((data) => (widgetType ? data[widgetType] : data)),
    staleTime: (5 * 60 - 10) * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (!fetchedVersion) return;
    if (version === null) setVersion(fetchedVersion);
    else if (fetchedVersion > version) window.location.reload();
  }, [fetchedVersion, version]);

  useEffect(() => {
    document.body.style.backgroundColor = "transparent";
    document.documentElement.style.backgroundColor = "transparent";
    return () => {
      document.documentElement.style.backgroundColor = ""; // Reset when navigating away
      document.body.style.backgroundColor = ""; // Reset when navigating away
    };
  }, []);

  if (!region || !accountId) {
    return <div className="text-red-500">Region and Account ID are required</div>;
  }

  switch (widgetType) {
    case "box": {
      const variables = searchParams.get("vars")?.split(",");
      const labels = searchParams.get("labels")?.split(",") ?? variables?.map(snakeToPretty);
      const theme = (searchParams.get("theme") ?? "dark") as Theme;
      const showHeader = searchParams.get("showHeader") !== "false";
      const showBranding = searchParams.get("showBranding") !== "false";
      const showMatchHistory = searchParams.get("showMatchHistory") !== "false";
      const matchHistoryShowsToday = searchParams.get("matchHistoryShowsToday") !== "false";
      const numMatches = Number.parseInt(searchParams.get("numMatches") ?? "10", 10);
      const opacity = Number.parseInt(searchParams.get("opacity") ?? "100", 10);
      const extraArgs = Object.fromEntries(
        Array.from(searchParams.entries()).filter(
          ([key]) =>
            ![
              "vars",
              "labels",
              "theme",
              "showHeader",
              "showBranding",
              "numMatches",
              "matchHistoryShowsToday",
              "showMatchHistory",
              "opacity",
            ].includes(key),
        ),
      );

      return (
        <BoxWidget
          region={region as Region}
          accountId={accountId}
          variables={variables}
          labels={labels}
          extraArgs={extraArgs}
          theme={theme}
          showHeader={showHeader}
          showBranding={showBranding}
          showMatchHistory={showMatchHistory}
          matchHistoryShowsToday={matchHistoryShowsToday}
          numMatches={numMatches}
          opacity={opacity}
        />
      );
    }
    case "raw": {
      const variable = searchParams.get("variable");
      const fontColor = (searchParams.get("fontColor") as Color) ?? "#FFFFFF";
      const extraArgs = Object.fromEntries(
        Array.from(searchParams.entries()).filter(([key]) => !["variable", "fontColor"].includes(key)),
      );
      console.log(extraArgs);
      if (!variable) return <div className="text-red-500">Variable is required</div>;
      return (
        <RawWidget
          region={region as Region}
          accountId={accountId}
          variable={variable}
          fontColor={fontColor}
          extraArgs={extraArgs}
        />
      );
    }
    default:
      return <div className="text-red-500">Invalid widget type</div>;
  }
}
