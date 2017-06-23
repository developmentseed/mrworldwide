let async = require('async');
let AWS = require('aws-sdk');
let athena = new AWS.Athena();

function client(opts) {
  if (!(this instanceof client)) return new client(opts);
  this.athena = new AWS.Athena({
    accessKeyId: opts.credentials.accessKeyId,
    secretAccessKey: opts.credentials.secretAccessKey,
    region: opts.region
  });
  this.outputBucket = opts.outputBucket;
}
/**
 * Submit a query
 * @param {string} queryString - SQL statement
 * @param {submitQueryCallback} callback 
 *
 */
client.prototype.submitQuery = function (queryString, callback) {
  let athena = this.athena;
  let QueryParams = {
    QueryString: queryString,
    ResultConfiguration: {
      OutputLocation: this.outputBucket 
    }
  }

  async.waterfall([
    // Start the query and get a queryId
    cb => athena.startQueryExecution(QueryParams, function (err, data) {
      if (err) cb(err);
      else {
        cb(null, data);
      }
    }),

    // Wait on the process
    (queryParams, cb) => {
      let isQueryStillRunning = true;
      async.whilst(
        // Test if query completed
        () => isQueryStillRunning,

        // Check query status
        innerCb => athena.getQueryExecution(queryParams, function (err, data) {
          if (err) innerCb(err)
          else {
            let status = data.QueryExecution.Status;
            let state = status.State
            if (state === "SUCCEEDED" || state === "FAILED" || state === "CANCELLED") {
              isQueryStillRunning = false;
            };

            // Wait 3 seconds
            setTimeout(() => innerCb(null, status), 3000)
          }

        }),

        // Return status
        (err, status) => {
          if (err) cb(err)
          else cb(null, {
            queryId: queryParams.QueryExecutionId,
            status
          })
        }
      )
    }],
    function (err, result) {
      if (err) callback(err)
      else {
        if (result.status.State === "FAILED" || result.status.State === "CANCELLED") {
          callback(new Error(result.status.StateChangeReason));
        }
        if (result.status.State === "SUCCEEDED") {
          callback(null, result.queryId)
        }
      }
    }
  )
}

/**
 * Get results from a submitted query
 * @param {string} queryId - Id of query
 * @param {getQueryResultCallback} callback
 */
client.prototype.getQueryResults = function (queryId, callback) {
  this.athena.getQueryResults({
    QueryExecutionId: queryId
  }, function (err, data) {
    // TODO process pagination
    if (err) callback(err)
    else {
      let mappedRows = data.ResultSet.Rows.map((row) => {
        return row.Data.map(rowItem => rowItem.VarCharValue)
      })
      callback(null, mappedRows);
    }
  });
}

/**
 * submitQueryCallback
 *
 * @callback submitQueryCallback
 * @param {Object} error 
 * @param {Object} queryState - Query State
 * @param {Object} queryStatus.status - Query Status
 * @param {string} queryStatus.status.State - SUCCEEDED/FAILED/CANCELLED
 * @param {string} queryStatus.status.StateChangeReason - error message if any
 * @param {string} queryId - Id of submitted Query
 *
 */

/**
 * getQueryResultCallback
 *
 * @callback getQueryResultCallback
 * @param {Object} error 
 * @param {Object} data - Query Results
 *
 */

module.exports = client;
