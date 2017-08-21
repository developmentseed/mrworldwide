#!/usr/bin/env node
let meow = require('meow');
let chalk = require('chalk');
let getStdin = require('get-stdin');
let Table = require('cli-table');
let ora = require('ora');

let usage = `
Usage
  $ worldwide query <sql>
  $ echo <sql> | worldwide query

Examples
  $ worldwide query "SELECT count(*) from osm.changesets"
`;

let cli = meow(usage);

if (cli.input[0] === 'query') {
  if (process.stdin.isTTY) {
    let sql = cli.input[1];
    run(sql);
  } else {
    getStdin().then(data => run(data));
  }
}

if (cli.input.length < 1) {
  cli.showHelp(1);
}

function runQuery(queryName, argv, callback) {
  let worldwide = require('../')({});
  let spinner = ora({});
  spinner.text = 'Running query';
  spinner.start();

  worldwide[queryName](...argv, function (err, queryId) {
    if (err) {
      spinner.fail(err);
      callback(err);
    }
    else {
      spinner.text = 'Reading output';
      worldwide.getResults(queryId, function (err, rows) {
        if (err) {
          spinner.fail(err);
        }
        else {
          spinner.succeed();
          callback(null, rows);
        }
      })
    }
  })
}

function run (sql) {
  if (!sql) {
    console.log("Input required");
    cli.showHelp(1)
  }

  runQuery("raw", [sql], function (err, results) {
    if (!err) {
      let table = new Table({
        head: results.shift()
      });
      results.forEach(row => table.push(row));
      console.log(table.toString());
    }
  });
}
