import type { Decision, Facts, Rule, Truth } from '@forge-sbd/contracts';

/** Evaluate a validated declarative rule without turning missing data into false. */
export function evaluate(rule: Rule, facts: Facts): Decision {
  if (rule.op === 'fact') {
    const value = Object.hasOwn(facts, rule.key) ? facts[rule.key] ?? 'unknown' : 'unknown';
    return { value, rule, children: [], fact: { key: rule.key, value } };
  }
  if (rule.op === 'not') {
    const child = evaluate(rule.arg, facts);
    return { value: child.value === 'unknown' ? 'unknown' : !child.value, rule, children: [child] };
  }
  if (rule.args.length === 0) throw new Error('Grupos de regras não podem ser vazios.');
  const children = rule.args.map((arg) => evaluate(arg, facts));
  const values = children.map((child) => child.value);
  let value: Truth;
  if (rule.op === 'all') {
    value = values.includes(false) ? false : values.includes('unknown') ? 'unknown' : true;
  } else {
    value = values.includes(true) ? true : values.includes('unknown') ? 'unknown' : false;
  }
  return { value, rule, children };
}