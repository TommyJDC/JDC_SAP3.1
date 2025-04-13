import { createRequestHandler } from '@remix-run/netlify';
import * as build from './build';

export const handler = createRequestHandler({ build });
