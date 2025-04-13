"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/google-buckets.js
var google_buckets_exports = {};
__export(google_buckets_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(google_buckets_exports);
var import_storage = require("@google-cloud/storage");
var handler = async (event, context) => {
  try {
    const storage = new import_storage.Storage();
    const [buckets] = await storage.getBuckets();
    const bucketNames = buckets.map((bucket) => bucket.name);
    return {
      statusCode: 200,
      body: JSON.stringify({ buckets: bucketNames })
    };
  } catch (error) {
    console.error("Erreur lors de la r\xE9cup\xE9ration des buckets:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erreur lors de la r\xE9cup\xE9ration des buckets" })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
