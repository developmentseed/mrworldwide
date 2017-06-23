#!/usr/bin/env node
let meow = require('meow');
let chalk = require('chalk');
let getStdin = require('get-stdin');

let worldwide = require('../')({})

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

function run (data) {
  if (!data) {
    console.log("Input required");
    cli.showHelp(1)
  }

  worldwide.runQuery(data);
}

