# potus-hopefuls-tweet-ui

Web application to visualize mentions of 2016 Presidential primary candidates on Twitter.  [Potus-hopefuls-tweet-collector](https://github.com/triciajam/potus-hopefuls-tweet-collector) collects the twitter mentions and stores them in Amazon S3; this retrieves and displays them.

This application has two parts.

Backend is MongoDB database that is updated hourly via cron scripts with new tweets from Amazon S3 storage.  MongoDB makes aggregating and filtering tweets much easier than using files in S3.

Front end is written with Python/Flask.  The visualization uses D3, dc.js, and Crossfilter.
