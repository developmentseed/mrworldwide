🌍 `mrworldwide` is a command line tool that queries the OSM Planet files stored on AWS Athena. More information 

## Development

### Requirements
- Node 7+

### Environment variables

The tool requires the following environment variables to be set:

- `ATHENA_PREFIX`: A namespace for the database and database tables.
- `AWS_REGION`: Region where the S3 bucket and Athena queries will run
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_OUTPUT_BUCKET`: Bucket where query results are stored
