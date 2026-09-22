import { PassThrough } from 'node:stream';
import { expect, it } from 'vitest';
import { promptLine, promptAdminCredentials } from './terminal-prompt.js';

function terminal() {
  const input = Object.assign(new PassThrough(), { isTTY: true, isRaw: false, setRawMode(value: boolean) { this.isRaw = value; return this; } });
  const output = new PassThrough();
  let printed = '';
  output.on('data', data => { printed += data.toString(); });
  return { input: input as unknown as NodeJS.ReadStream, output, printed: () => printed };
}
const tick = () => new Promise<void>(resolve => setImmediate(resolve));

it('lê senha sem eco, aceita backspace e restaura o terminal', async () => {
  const tty = terminal();
  const result = promptLine('Senha: ', true, tty.input, tty.output);
  tty.input.emit('keypress', 'segredoX', {});
  tty.input.emit('keypress', undefined, { name: 'backspace' });
  tty.input.emit('keypress', '\r', { name: 'return' });
  expect(await result).toBe('segredo');
  expect(tty.printed()).toBe('Senha: \n');
  expect(tty.input.isRaw).toBe(false);
  expect(tty.input.listenerCount('keypress')).toBe(0);
});

it('cancela por Ctrl+C sem imprimir a senha e restaura o terminal', async () => {
  const tty = terminal();
  const result = promptLine('Senha: ', true, tty.input, tty.output);
  tty.input.emit('keypress', 'segredo', {});
  tty.input.emit('keypress', '\x03', { ctrl: true, name: 'c' });
  await expect(result).rejects.toThrow('cancelada');
  expect(tty.printed()).not.toContain('segredo');
  expect(tty.input.isRaw).toBe(false);
});

it('recusa confirmação de senha divergente', async () => {
  const tty = terminal();
  const result = promptAdminCredentials(tty.input, tty.output);
  tty.input.emit('keypress', 'admin@example.test', {});
  tty.input.emit('keypress', '\r', { name: 'return' });
  await tick();
  tty.input.emit('keypress', 'Senha ficticia 123!', {});
  tty.input.emit('keypress', '\r', { name: 'return' });
  await tick();
  tty.input.emit('keypress', 'Outra senha 123!', {});
  tty.input.emit('keypress', '\r', { name: 'return' });
  await expect(result).rejects.toThrow('não conferem');
  expect(tty.printed()).not.toContain('Senha ficticia 123!');
  expect(tty.printed()).not.toContain('Outra senha 123!');
});
