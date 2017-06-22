require('dotenv').config();

let fs = require('fs');
let tmpl = require('maxstache');
let path = require('path');
let async = require('async');

let query = require('./lib/query')
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

let testString = fs.readFileSync(path.join(__dirname, 'sql', 'queries', 'test.sql')).toString();

submitQuery({
  queryName: 'test',
  queryString: tmpl(testString, {DATABASE: process.env.ATHENA_PREFIX}),
}, function (err, queryId) {
  if (err) console.log(err);
  else {
    getResults(queryId, function (err, rows) {
      if (err) console.log(err);
      else rows.forEach((row) => console.log(row.join(', ')));
    });
  }
})
