import type { MetaFunction } from "@remix-run/node";
import CommandBuilder from "~/components/command-builder";

export const meta: MetaFunction = () => {
  return [
    { title: "Deadlock API - Chat Command Builder" },
    {
      name: "description",
      content:
        "Create custom deadlock commands for your chatbot. Works with StreamElements, Fossabot, Nightbot, and more!",
    },
  ];
};

export default function Index() {
  return <CommandBuilder />;
}
