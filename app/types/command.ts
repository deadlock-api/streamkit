export interface CommandVariable {
  name: string;
  description: string;
  extra_args?: string[];
  category?: string;
}

export interface CommandBuilderProps {
  region: string;
  accountId: string;
}
