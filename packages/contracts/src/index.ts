export const domains = ['web', 'api', 'mobile', 'backend', 'infra', 'cloud', 'cicd'] as const;
export type Domain = typeof domains[number];
export type Truth = boolean | 'unknown';
export type Answer = {state: 'known'; value: boolean | string | string[]} | {state: 'unknown'};
export type Answers = Record<string, Answer>;
export type Facts = Record<string, Truth>;
export type Rule = {op: 'fact'; key: string} | {op: 'all' | 'any'; args: Rule[]} | {op: 'not'; arg: Rule};
export type Decision = {
  value: Truth;
  rule: Rule;
  children: Decision[];
  fact?: {key: string; value: Truth};
};
export type Question = {
  id: string;
  section: string;
  label: string;
  kind: 'boolean' | 'single' | 'multiple';
  options?: string[];
  optionLabels?: Record<string, string>;
  required: boolean;
  visibleWhen?: Rule;
};
export type Questionnaire = {version: string; questions: Question[]};
export type Control = {
  id: string;
  version: string;
  title: string;
  purpose: string;
  guidance: string;
  acceptance: string;
  phase: string;
  priority: 'high' | 'medium' | 'low';
  domains: Domain[];
  origin: 'demonstration';
  rule?: Rule;
};
export type Catalog = {version: string; rulesVersion: string; controls: Control[]};
export type ContextResult = {
  facts: Facts;
  activeQuestionIds: string[];
  unansweredIds: string[];
  unknownIds: string[];
  contradictions: string[];
};
export type AssessmentDto = {
  id: string;
  projectId: string;
  createdAt: string;
  fingerprint: string;
  catalogVersion: string;
  questionnaireVersion: string;
  rulesVersion: string;
  context: {domains: Domain[]; answers: Answers};
  decisions: {controlId: string; value: Truth; explanation: Decision | null}[];
  requirements: {
    control: Control;
    applicability: 'applicable' | 'needs_information';
    implementation: 'pending';
    verification: 'not_verified';
  }[];
};
