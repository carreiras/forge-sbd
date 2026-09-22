import { emitKeypressEvents } from 'node:readline';
import type { Key } from 'node:readline';
import { AdminSetupError } from './admin-setup.error.js';

export function promptLine(label: string, hidden: boolean, input: NodeJS.ReadStream = process.stdin, output: NodeJS.WritableStream = process.stdout): Promise<string> {
  if (!input.isTTY || typeof input.setRawMode !== 'function') {
    return Promise.reject(new AdminSetupError('Execute o bootstrap em um terminal interativo.'));
  }
  emitKeypressEvents(input);
  const wasRaw = input.isRaw;
  input.setRawMode(true);
  input.resume();
  output.write(label);
  return new Promise((resolve, reject) => {
    let value = '';
    const finish = (error?: Error) => {
      input.removeListener('keypress', onKey);
      input.removeListener('end', onEnd);
      input.removeListener('error', onError);
      input.setRawMode(wasRaw);
      input.pause();
      output.write('\n');
      if (error) reject(error); else resolve(value);
    };
    const onEnd = () => finish(new AdminSetupError('Entrada encerrada; operação cancelada.'));
    const onError = () => finish(new AdminSetupError('Falha de leitura; operação cancelada.'));
    const onKey = (text: string | undefined, key: Key = {}) => {
      if (key.ctrl && (key.name === 'c' || key.name === 'd')) {
        finish(new AdminSetupError('Operação cancelada.'));
      } else if (key.name === 'return' || key.name === 'enter') {
        finish();
      } else if (key.name === 'backspace') {
        if (value) {
          value = Array.from(value).slice(0, -1).join('');
          if (!hidden) output.write('\b \b');
        }
      } else if (text && !key.ctrl && !key.meta && !/[\x00-\x1f\x7f]/.test(text)) {
        if (value.length + text.length > 1024) {
          finish(new AdminSetupError('Entrada excede o limite permitido.'));
          return;
        }
        value += text;
        if (!hidden) output.write(text);
      }
    };
    input.on('keypress', onKey);
    input.once('end', onEnd);
    input.once('error', onError);
  });
}

export async function promptAdminCredentials(input: NodeJS.ReadStream = process.stdin, output: NodeJS.WritableStream = process.stdout) {
  const email = await promptLine('Email: ', false, input, output);
  const password = await promptLine('Senha (12–128 caracteres, sem eco): ', true, input, output);
  const confirmation = await promptLine('Confirme a senha: ', true, input, output);
  if (password !== confirmation) throw new AdminSetupError('As senhas não conferem. Nenhuma alteração realizada.');
  return { email, password };
}
