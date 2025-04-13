import { createRequestHandler } from "@remix-run/serve";
import * as build from "@remix-run/dev/server-build";
import express from 'express';

const app = express();

// Remix request handler
const requestHandler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
});

app.all("*", requestHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
