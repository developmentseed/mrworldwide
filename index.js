require('dotenv').config();

function worldwide(opts) {
  if (!(this instanceof worldwide)) return new worldwide(opts);
  let outputBucket = opts.outputBucket || process.env.AWS_OUTPUT_BUCKET || 's3://mrww_athena_output';

  this._query = require('little-owl')({
    accessKeyId: opts.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: opts.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
    region: opts.region || process.env.AWS_REGION || 'us-east-1',
    outputBucket
  });
}

worldwide.prototype.getResults = function () {
  return this._query.getQueryResults.apply(this._query, arguments);
}

worldwide.prototype.raw = function () {
  return this._query.submitQuery.apply(this._query, arguments);
}

module.exports = worldwide;
