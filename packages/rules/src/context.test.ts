import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import type {Answers,Questionnaire} from '@forge-sbd/contracts';
import {deriveContext,validateQuestionnaire,validateCatalog} from './index.js';
const load = (file:string) => JSON.parse(readFileSync(new URL('../../../content/'+file,import.meta.url),'utf8'));
describe('conditional project context',()=>{
 it('activates mobile/API/cloud without browser session questions',()=>{
  const result=deriveContext(validateQuestionnaire(load('survey-1.json')),['mobile','api','cloud'],{},[]);
  expect(result.activeQuestionIds).toContain('q16');
  expect(result.activeQuestionIds).toContain('q14');
  expect(result.activeQuestionIds).toContain('q21');
  expect(result.activeQuestionIds).not.toContain('q12');
  expect(result.facts['domain.web']).toBe(false);
 });
 it('preserves unknown API ownership as a pending decision',()=>{
  const result=deriveContext(validateQuestionnaire(load('survey-1.json')),['api'],{q14:{state:'unknown'}},[]);
  expect(result.facts.q14).toBe('unknown');
  expect(result.unknownIds).toContain('q14');
  expect(result.unansweredIds).not.toContain('q14');
 });
 it('ignores stale Kubernetes answer when containers are absent',()=>{
  const result=deriveContext(validateQuestionnaire(load('survey-1.json')),['infra'],{
   q19:{state:'known',value:false},q20:{state:'known',value:true}},[]);
  expect(result.activeQuestionIds).not.toContain('q20');
  expect(result.facts.q20).toBe('unknown');
 });
 it('exposes conditional Kubernetes questions when containers are unknown',()=>{
  const result=deriveContext(validateQuestionnaire(load('survey-1.json')),['infra'],{q19:{state:'unknown'}},[]);
  expect(result.activeQuestionIds).toContain('q20');
 });
 it('does not reuse reactivated answers without confirmation',()=>{
  const result=deriveContext(validateQuestionnaire(load('survey-1.json')),['infra'],{
   q19:{state:'known',value:true},q20:{state:'known',value:true}},['q20']);
  expect(result.unansweredIds).toContain('q20');
  expect(result.facts.q20).toBe('unknown');
 });
 it('creates known option facts and rejects unsupported options',()=>{
  const survey=validateQuestionnaire(load('survey-1.json'));
  const result=deriveContext(survey,['mobile'],{q16:{state:'known',value:['android']}},[]);
  expect(result.facts['q16.android']).toBe(true);
  expect(result.facts['q16.ios']).toBe(false);
  expect(()=>deriveContext(survey,['mobile'],{q16:{state:'known',value:['windows']}},[])).toThrow();
 });
 it('rejects answer types inconsistent with the question and preserves the draft',()=>{
  const survey=validateQuestionnaire(load('survey-1.json'));
  const answers:Answers={q02:{state:'known',value:'yes'}};
  expect(()=>deriveContext(survey,['api'],answers,[])).toThrow();
  expect(answers.q02).toEqual({state:'known',value:'yes'});
 });
});
describe('content integrity',()=>{
 it('can select separate mobile, API and infrastructure controls without duplicates',()=>{
  const survey=validateQuestionnaire(load('survey-1.json'));
  const catalog=validateCatalog(load('demo-1.json'),survey);
  expect(catalog.controls.map(c=>c.id)).toContain('DEMO-007');
  expect(catalog.controls.map(c=>c.id)).toContain('DEMO-008');
  expect(catalog.controls.map(c=>c.id)).toContain('DEMO-009');
 });
 it('rejects duplicate question IDs and invalid facts',()=>{
  const input=load('survey-1.json');
  input.questions.push({...input.questions[0]});
  expect(()=>validateQuestionnaire(input)).toThrow();
  const catalog=load('demo-1.json');
  catalog.controls[0].rule={op:'fact',key:'missing.fact'};
  expect(()=>validateCatalog(catalog,validateQuestionnaire(load('survey-1.json')))).toThrow();
 });
 it('rejects cyclical visibility dependencies',()=>{
  const survey:Questionnaire={version:'test',questions:[
   {id:'a',section:'x',label:'A',kind:'boolean',required:true,visibleWhen:{op:'fact',key:'b'}},
   {id:'b',section:'x',label:'B',kind:'boolean',required:true,visibleWhen:{op:'fact',key:'a'}},
  ]};
  expect(()=>validateQuestionnaire(survey)).toThrow(/ciclo/i);
 });
 it('rejects empty rule groups, unsupported operators and excessive depth',()=>{
  const survey=validateQuestionnaire(load('survey-1.json'));
  for (const rule of [{op:'all',args:[]},{op:'execute',code:'evil'}]) {
   const input=load('demo-1.json');input.controls[0].rule=rule;
   expect(()=>validateCatalog(input,survey)).toThrow();
  }
  let rule:unknown={op:'fact',key:'q02'};
  for(let i=0;i<9;i++) rule={op:'not',arg:rule};
  const input=load('demo-1.json');input.controls[0].rule=rule;
  expect(()=>validateCatalog(input,survey)).toThrow();
 });
});
