let async = require('async');
let AWS = require('aws-sdk');
let athena = new AWS.Athena();

/* Submit a query */
function submitQuery (params, callback) {
  let queryName = params.queryName;
  let QueryParams = {
    QueryString: params.queryString,
    ResultConfiguration: {
      OutputLocation: process.env.AWS_OUTPUT_BUCKET || params.outputBucket
    }
  }

  async.waterfall([
    // Start the query and get a queryId
    cb => athena.startQueryExecution(QueryParams, function (err, data) {
      if (err) cb(err);
      else {
        console.log(`Successfully submitted ${queryName}`)
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
            console.log(`${queryName}: ${status.State}`)
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



module.exports.submitQuery = submitQuery
