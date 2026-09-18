import { describe, expect, it } from 'vitest';
import type { Facts, Rule, Truth } from '@forge-sbd/contracts';
import { evaluate } from './evaluate.js';

const a: Rule = { op: 'fact', key: 'a' };
const b: Rule = { op: 'fact', key: 'b' };
const cases: [Truth, Truth, Truth, Truth][] = [
  [true, true, true, true],
  [true, false, false, true],
  [true, 'unknown', 'unknown', true],
  [false, true, false, true],
  [false, false, false, false],
  [false, 'unknown', false, 'unknown'],
  ['unknown', true, 'unknown', true],
  ['unknown', false, false, 'unknown'],
  ['unknown', 'unknown', 'unknown', 'unknown'],
];

describe('contextual requirements decisions', () => {
  it.each(cases)('AND(%s, %s) = %s', (left, right, and) => {
    expect(evaluate({ op: 'all', args: [a, b] }, { a: left, b: right }).value).toBe(and);
  });

  it.each(cases)('OR(%s, %s)', (left, right, _and, or) => {
    expect(evaluate({ op: 'any', args: [a, b] }, { a: left, b: right }).value).toBe(or);
  });

  it.each<[Truth, Truth]>([[true, false], [false, true], ['unknown', 'unknown']])(
    'NOT(%s) = %s', (value, expected) => {
      expect(evaluate({ op: 'not', arg: a }, { a: value }).value).toBe(expected);
    },
  );

  it('keeps missing facts unknown rather than excluding requirements', () => {
    expect(evaluate(a, {}).value).toBe('unknown');
  });

  it('keeps the facts used in a nested decision available for explanation', () => {
    const rule: Rule = { op: 'all', args: [a, { op: 'not', arg: b }] };
    const facts: Facts = { a: true, b: false };
    const decision = evaluate(rule, facts);
    expect(decision.value).toBe(true);
    expect(decision.children[0]?.fact).toEqual({ key: 'a', value: true });
    expect(decision.children[1]?.children[0]?.fact).toEqual({ key: 'b', value: false });
    expect(facts).toEqual({ a: true, b: false });
  });

  it('does not inherit facts through the object prototype', () => {
    const facts: Facts = Object.create({ a: true });
    expect(evaluate(a, facts).value).toBe('unknown');
  });

  it('rejects empty groups instead of treating malformed rules as applicable', () => {
    expect(() => evaluate({ op: 'all', args: [] }, {})).toThrow();
    expect(() => evaluate({ op: 'any', args: [] }, {})).toThrow();
  });
});
