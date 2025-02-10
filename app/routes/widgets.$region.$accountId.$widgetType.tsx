import type { MetaFunction } from "@remix-run/node";
import { useParams, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import { BoxWidget } from "~/components/widgets/box";
import { snakeToPretty } from "~/lib/utils";
import type { Region, Theme } from "~/types/widget";

export const meta: MetaFunction = () => {
  return [{ title: "Deadlock Stats Widget" }, { name: "description", content: "Stats widget powered by Deadlock API" }];
};

export default function Widget() {
  const { region, accountId, widgetType } = useParams();
  const [searchParams] = useSearchParams();

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
      const theme = (searchParams.get("theme") || "dark") as Theme;
      const showHeader = searchParams.get("showHeader") !== "false";
      const showBranding = searchParams.get("showBranding") !== "false";
      const showMatchHistory = searchParams.get("showMatchHistory") !== "false";
      const matchHistoryShowsToday = searchParams.get("matchHistoryShowsToday") !== "false";
      const numMatches = Number.parseInt(searchParams.get("numMatches") ?? "10", 10);
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
        />
      );
    }
    default:
      return <div className="text-red-500">Invalid widget type</div>;
  }
}
