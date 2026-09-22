import { config } from 'dotenv';

// npm workspaces execute from apps/api; compiled code runs from dist.
config({ path: new URL('../../../.env', import.meta.url), quiet: true });
