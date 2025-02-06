import type { MetaFunction } from "@remix-run/node";
import { useParams, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import BoxWidget from "~/components/widgets/box";
import { snakeToPretty } from "~/lib/utils";
import type { Theme } from "~/types/widget";

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
      const extraArgs = Object.fromEntries(
        Array.from(searchParams.entries()).filter(
          ([key]) => !["vars", "labels", "theme", "showHeader", "showBranding"].includes(key),
        ),
      );

      return (
        <BoxWidget
          region={region}
          accountId={accountId}
          variables={variables}
          labels={labels}
          extraArgs={extraArgs}
          theme={theme}
          showHeader={showHeader}
          showBranding={showBranding}
        />
      );
    }
    default:
      return <div className="text-red-500">Invalid widget type</div>;
  }
}
