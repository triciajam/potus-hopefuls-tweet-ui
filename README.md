# twit-candi-ui

Work in progress.  User interface for twit-candi-2016 tweet ["ingestor"](https://github.com/triciajam/twit-candi-2016).
Goal is to create a visualization for exploring how 2016 Presidential candidates are mentioned on twitter, 
and ultimately to relate that to other variables, particularly public opinion polls. 

Tweets that have been collected are retrieved from Amazon S3 at some interval (currently hourly), stored locally in a MongoDB, 
and displayed using Crossfilter.js.  Visualization code is in static/js/graphs.js.

Visualization is currently only running on local machine; hoping to be live using AWS shortly.   
