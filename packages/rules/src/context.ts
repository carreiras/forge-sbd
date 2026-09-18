import {z} from 'zod';
import {domains} from '@forge-sbd/contracts';
import type {Answers,ContextResult,Domain,Facts,Question,Questionnaire} from '@forge-sbd/contracts';
import {evaluate} from './evaluate.js';
import {factKeys,orderedQuestions} from './catalog.js';

const answerSchema=z.discriminatedUnion('state',[
 z.object({state:z.literal('unknown')}).strict(),
 z.object({state:z.literal('known'),value:z.union([z.boolean(),z.string().max(120),
  z.array(z.string().max(120)).max(100)])}).strict(),
]);
export function deriveContext(survey:Questionnaire,selected:Domain[],input:Answers,needsConfirmationIds:string[]):ContextResult{
 z.array(z.enum(domains)).min(1).max(7).parse(selected);
 const answers=z.record(z.string(),answerSchema).parse(input);
 const byId=new Map(survey.questions.map(q=>[q.id,q]));
 for(const [key,answer] of Object.entries(answers)){
  const q=byId.get(key);
  if(!q) throw new Error('Resposta para pergunta inexistente: '+key);
  if(answer.state==='unknown') continue;
  const value=answer.value;
  if(q.kind==='boolean'&&typeof value!=='boolean') throw new Error('Resposta deve ser booleana: '+key);
  if(q.kind==='single'&&(typeof value!=='string'||!q.options?.includes(value))) throw new Error('Opção inválida: '+key);
  if(q.kind==='multiple'&&(!Array.isArray(value)||value.length===0||value.some(v=>!q.options?.includes(v))||
   new Set(value).size!==value.length)) throw new Error('Opções inválidas: '+key);
 }
 const facts:Facts=Object.fromEntries([...factKeys(survey)].map(k=>[k,'unknown']));
 domains.forEach(d=>{facts['domain.'+d]=selected.includes(d);});
 const result:ContextResult={facts,activeQuestionIds:[],unansweredIds:[],unknownIds:[],contradictions:[]};
 for(const q of orderedQuestions(survey)){
  const visibility=q.visibleWhen?evaluate(q.visibleWhen,facts).value:true;
  if(visibility===false) continue;
  result.activeQuestionIds.push(q.id);
  const answer=answers[q.id];
  if(!answer || needsConfirmationIds.includes(q.id)){
   if(q.required) result.unansweredIds.push(q.id);
   continue;
  }
  if(answer.state==='unknown'){
   result.unknownIds.push(q.id);continue;
  }
  // Conditional existence is not confirmed while the parent remains unknown.
  if(visibility==='unknown') continue;
  if(q.kind==='boolean') facts[q.id]=answer.value as boolean;
  else for(const option of q.options??[]){
   facts[q.id+'.'+option]=q.kind==='single'?answer.value===option:
    (answer.value as string[]).includes(option);
  }
 }
 // Keep display order from the catalog, independent of the dependency order.
 result.activeQuestionIds=survey.questions.filter(q=>result.activeQuestionIds.includes(q.id)).map(q=>q.id);
 return result;
}
