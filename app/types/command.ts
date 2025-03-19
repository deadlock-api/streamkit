export interface Variable {
  name: string;
  description: string;
  extra_args?: string[];
  category?: string;
}

export interface CommandBuilderProps {
  region: string;
  accountId: string;
}
