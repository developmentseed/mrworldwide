let async = require('async')
let fs = require('fs');
let tmpl = require('maxstache');
let path = require('path');

let query = require('./query')
let submitQuery = query.submitQuery;
let getResults = query.getQueryResults;

/* Setup tables for planet querying */
function setup () {
  let setupStatements = fs.readdirSync(path.join(__dirname, 'sql', 'setup'))
    .map(function (filename) {
      let template =  fs
        .readFileSync(path.join(__dirname, 'sql', 'setup', filename))
        .toString();

      return {
        queryString: tmpl(template, {DATABASE: process.env.ATHENA_PREFIX}),
        queryName: path.basename(filename, '.sql')
      }
    })

  setupStatements.unshift({
    queryName: 'setup_database',
    queryString: `CREATE DATABASE IF NOT EXISTS ${process.env.ATHENA_PREFIX}`
  });

  async.mapSeries(setupStatements, submitQuery, function (err, results) {
    if (err) console.log(err);
    else console.log("Setup complete");
  })
}

/* Check if setup was run */
function checkSetup(callback) {
  submitQuery({
    queryName: 'check_setup',
    queryString: `SHOW TABLES in ${process.env.ATHENA_PREFIX}`,
  }, function (err, queryId) {
    if (err) console.log(err);
    else {
      getResults(queryId, function (err, rows) {
        if (err) callback(err);
        else callback(null, (rows.length === 3))
      });
    }
  })
}

module.exports = {
  setup,
  checkSetup
}
