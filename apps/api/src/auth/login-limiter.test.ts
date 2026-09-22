import { describe, expect, it, vi } from 'vitest';
import { LoginLimiter } from './login-limiter.js';

 describe('limitação de login', () => {
  it('reserva tentativas concorrentes e não deixa a sexta ultrapassar o limite', () => {
    const limiter = new LoginLimiter();
    const finish = Array.from({ length: 5 }, () => limiter.begin('127.0.0.1', 'admin@example.test'));
    expect(() => limiter.begin('127.0.0.1', 'admin@example.test')).toThrow();
    finish.forEach(done => done(false));
    expect(() => limiter.begin('127.0.0.1', 'admin@example.test')).toThrow();
    expect(() => limiter.begin('127.0.0.2', 'admin@example.test')).not.toThrow();
  });
  it('limita a memória sem expulsar bloqueios ativos e remove entradas expiradas', () => {
    const clock = vi.spyOn(Date, 'now').mockReturnValue(1_000);
    try {
      const limiter = new LoginLimiter();
      for (let i = 0; i < 10_000; i++) limiter.begin('127.0.0.1', `user${i}@example.test`)(false);
      expect(() => limiter.begin('127.0.0.1', 'extra@example.test')).toThrow();
      clock.mockReturnValue(901_000);
      expect(() => limiter.begin('127.0.0.1', 'extra@example.test')).not.toThrow();
    } finally { clock.mockRestore(); }
  });
});
