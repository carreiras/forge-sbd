const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

export function validateTestDatabaseUrl(value: string | undefined, primary: string | undefined): string {
  const message = 'TEST_DATABASE_URL deve apontar para um banco local dedicado com sufixo _test, sem parâmetros e distinto de DATABASE_URL.';
  try {
    if (!value) throw new Error();
    const url = new URL(value);
    const name = decodeURIComponent(url.pathname.slice(1));
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || !localHosts.has(url.hostname)
      || !/^[a-zA-Z0-9_]+_test$/.test(name) || url.search || url.hash) throw new Error();
    if (primary) {
      const main = new URL(primary);
      const sameHost = main.hostname === url.hostname || localHosts.has(main.hostname);
      if (sameHost && (main.port || '5432') === (url.port || '5432')
        && decodeURIComponent(main.pathname.slice(1)) === name) throw new Error();
    }
    return value;
  } catch { throw new Error(message); }
}
