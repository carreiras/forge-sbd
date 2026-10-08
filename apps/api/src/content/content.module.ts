import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Global, Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';
import { validateQuestionnaire } from '@forge-sbd/rules';
import type { Questionnaire } from '@forge-sbd/contracts';
import type { ApiConfig } from '../config.js';

export const QUESTIONNAIRE = Symbol('QUESTIONNAIRE');
export const questionnaireVersion = 'survey-1';

export async function loadQuestionnaire(contentDirectory: string): Promise<Questionnaire> {
  const survey = validateQuestionnaire(JSON.parse(await readFile(join(contentDirectory, `${questionnaireVersion}.json`), 'utf8')));
  if (survey.version !== questionnaireVersion) throw new Error(`Questionário deve ter a versão ${questionnaireVersion}.`);
  return survey;
}

@Global()
@Module({})
export class ContentModule {
  static register(config: ApiConfig): DynamicModule {
    return {
      module: ContentModule,
      providers: [{ provide: QUESTIONNAIRE, useFactory: () => loadQuestionnaire(config.contentDirectory) }],
      exports: [QUESTIONNAIRE],
    };
  }
}
