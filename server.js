const Bundler = require('parcel-bundler');
const Path = require('path');
const express = require('express');
const app = express();
const ParseServer = require('parse-server').ParseServer;
const helmet = require('helmet');

app.use(helmet());

const api = new ParseServer({
  databaseURI: process.env.DATABASE_URI,
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY,
  serverURL: process.env.SERVER_URL
});
app.use('/api', api);

const entryFiles = Path.join(__dirname, "./index.html");
const options = {
  outDir: "./dist",
  outFile: "index.html",
  target: "browser"
};
const bundler = new Bundler(entryFiles, options);
app.use(bundler.middleware());

app.listen(process.env.PORT || 1234);