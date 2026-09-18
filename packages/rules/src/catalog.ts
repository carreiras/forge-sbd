import {z} from 'zod';
import {domains} from '@forge-sbd/contracts';
import type {Catalog,Question,Questionnaire,Rule} from '@forge-sbd/contracts';

const id=z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,119}$/);
const question=z.object({
 id,section:z.string().min(1).max(120),label:z.string().min(1).max(500),
 kind:z.enum(['boolean','single','multiple']),options:z.array(id).min(1).max(100).optional(),
 optionLabels:z.record(z.string(),z.string().max(200)).optional(),required:z.boolean(),
 visibleWhen:z.unknown().optional(),
}).strict();
const surveySchema=z.object({version:id,questions:z.array(question).min(1).max(1000)}).strict();
const control=z.object({
 id,version:z.string().min(1).max(120),title:z.string().min(1).max(500),purpose:z.string().min(1).max(2000),
 guidance:z.string().min(1).max(20000),acceptance:z.string().min(1).max(10000),
 phase:id,priority:z.enum(['high','medium','low']),domains:z.array(z.enum(domains)).max(7),
 origin:z.literal('demonstration'),rule:z.unknown().optional(),
}).strict();
const catalogSchema=z.object({version:id,rulesVersion:id,controls:z.array(control).min(1).max(1000)}).strict();

function unique(values:string[],label:string):void {
 if(new Set(values).size!==values.length) throw new Error('Identificadores duplicados: '+label);
}
export function factKeys(survey:Questionnaire):Set<string>{
 return new Set([...domains.map(d=>'domain.'+d),...survey.questions.flatMap(q=>
  q.kind==='boolean'?[q.id]:(q.options??[]).map(option=>q.id+'.'+option))]);
}
export function validateRule(input:unknown,keys:Set<string>):Rule{
 let nodes=0;
 function visit(value:unknown,depth:number):void {
  if(depth>8 || ++nodes>100) throw new Error('Regra excede o limite de complexidade.');
  if(!value || typeof value!=='object' || Array.isArray(value)) throw new Error('Regra inválida.');
  const node=value as Record<string,unknown>;
  const allowed=node.op==='fact'?['op','key']:node.op==='not'?['op','arg']:['op','args'];
  if(Object.keys(node).some(k=>!allowed.includes(k))) throw new Error('Campos inválidos na regra.');
  if(node.op==='fact'){
   if(typeof node.key!=='string'||!keys.has(node.key)) throw new Error('Fato inválido: '+String(node.key));
  } else if(node.op==='not') visit(node.arg,depth+1);
  else if(node.op==='all'||node.op==='any'){
   if(!Array.isArray(node.args)||node.args.length===0||node.args.length>20) throw new Error('Grupo inválido.');
   node.args.forEach(arg=>visit(arg,depth+1));
  } else throw new Error('Operador inválido.');
 }
 visit(input,1);
 return input as Rule;
}
export function ruleFacts(rule:Rule):string[]{
 if(rule.op==='fact') return [rule.key];
 if(rule.op==='not') return ruleFacts(rule.arg);
 return rule.args.flatMap(ruleFacts);
}
export function orderedQuestions(survey:Questionnaire):Question[]{
 const byId=new Map(survey.questions.map(q=>[q.id,q]));
 const done=new Set<string>(),visiting=new Set<string>(),result:Question[]=[];
 function visit(q:Question):void{
  if(done.has(q.id)) return;
  if(visiting.has(q.id)) throw new Error('Ciclo nas condições do questionário.');
  visiting.add(q.id);
  for(const key of q.visibleWhen?ruleFacts(q.visibleWhen):[]){
   if(key.startsWith('domain.')) continue;
   const dependency=byId.get(key.split('.')[0]!);
   if(dependency) visit(dependency);
  }
  visiting.delete(q.id);done.add(q.id);result.push(q);
 }
 survey.questions.forEach(visit);
 return result;
}
export function validateQuestionnaire(input:unknown):Questionnaire{
 const parsed=surveySchema.parse(input);
 const survey=parsed as unknown as Questionnaire;
 unique(survey.questions.map(q=>q.id),'perguntas');
 for(const q of survey.questions){
  if(q.kind!=='boolean'&&!q.options) throw new Error('Pergunta requer opções.');
  if(q.kind==='boolean'&&q.options) throw new Error('Pergunta booleana não aceita opções.');
  if(q.options) unique(q.options,q.id);
 }
 const keys=factKeys(survey);
 for(const q of survey.questions) if(q.visibleWhen!==undefined) validateRule(q.visibleWhen,keys);
 orderedQuestions(survey);
 return survey;
}
export function validateCatalog(input:unknown,survey:Questionnaire):Catalog{
 const catalog=catalogSchema.parse(input) as unknown as Catalog;
 unique(catalog.controls.map(c=>c.id),'controles');
 const keys=factKeys(survey);
 for(const c of catalog.controls){
  unique(c.domains,c.id);
  if(c.rule!==undefined) validateRule(c.rule,keys);
 }
 return catalog;
}
