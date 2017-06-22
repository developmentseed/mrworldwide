🌍 `mrworldwide` is a command line tool that queries the [AWS OSM public datasets](https://aws.amazon.com/public-datasets/osm/).

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

## Built With
Under the hood, `mrworldwide` uses Amazon Athena and Hive queries to query the data.

## License
MIT - See [LICENSE.md](LICENSE.md)

## Acknowledgments

This tool wouldn't be possible without [@mojodna](http://github.com/mojodna) laying the groundwork with [transcoding OSM to ORC](https://github.com/mojodna/osm-pds-pipelines) and making it [queryable with Athena](https://aws.amazon.com/blogs/big-data/querying-openstreetmap-with-amazon-athena/).
