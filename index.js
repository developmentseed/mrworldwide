require('dotenv').config();

let ora = require('ora');
let Table = require('cli-table');

function worldwide(opts) {
  if (!(this instanceof worldwide)) return new worldwide(opts);
  let outputBucket = opts.outputBucket || process.env.AWS_OUTPUT_BUCKET || 's3://mrww_athena_output';

  this.query = require('./lib/query')({
    credentials: {
      accessKeyId: opts.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: opts.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
    },
    region: opts.region || process.env.AWS_REGION || 'us-east-1',
    outputBucket
  });
}

worldwide.prototype.runQuery = function (sql, callback) {
  let mrww = this;
  let spinner = ora('Running query').start();

  mrww.query.submitQuery(sql, function (err, queryId) {
    if (err) {
      spinner.fail(err);
    }
    else {
      spinner.text = 'Reading output';
      mrww.query.getQueryResults(queryId, function (err, rows) {
        if (err) {
          spinner.fail(err);
        }
        else {
          spinner.succeed();
          let table = new Table({
            head: rows.shift()
          })
          rows.forEach(row => table.push(row));
          console.log(table.toString());
        }
      })
    }
  })
}

module.exports = worldwide;
