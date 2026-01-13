export interface ParsedParameter {
  index: number;
  placeholderContext: string;
  value: any;
  type: string;
  rawValue: string;
}

export interface ReplacedValue {
  start: number;
  end: number;
  value: string;
}

export interface ParsedSQL {
  originalSQL: string;
  executableSQL: string;
  parameters: ParsedParameter[];
  replacedValues?: ReplacedValue[]; // Positions of replaced parameter values
}

export type ViewMode = 'all' | 'sql' | 'bound' | 'table';
