queue()
    .defer(d3.json, "/twit-candi/tw")
//  .defer(d3.json, "static/geojson/us-states.json")
    .await(function(d) { 
      console.log(d); 
      })
    .await(makeGraphs);

function makeGraphs(error, tweetsJson) {
	
	//console.log(tweetsJson);
	
	
	var tweets = tweetsJson;
  //console.log(tweets);

	// console.log(tweets);
	//Clean projectsJson data
	//var donorschooseProjects = projectsJson;
	// Thu Oct 01 04:12:18 +0000 2015
	var tformat = d3.time.format("%a %b %d %H:%M:%S %Z %Y");
	tweets.forEach(function(d) {
		d["fulldate"] = tformat.parse(d["created_at"]);
		//var year = d["fulldate"].getFullYear();
    //var month = d["fulldate"].getMonth();
    //var day = d["fulldate"].getDate();
    //var dateOnly = new Date(year,month,day);
		//console.log(dateOnly);
		//d["date"] = dateOnly;
		//d["created_at"].setDate(1);
		// this just makes it a number
		//d["total_donations"] = +d["total_donations"];
	});
	
  //console.log(tweets);
	
	// filter
	// var mentions = 
  // var hashtags = 
  // add party
   
    
	//Create a Crossfilter instance
	var ndx = crossfilter(tweets);

  //console.log(ndx);

	//Define Dimensions
	var dateDim = ndx.dimension(function(d) { return d["fulldate"]; }); 
	var candDim = ndx.dimension(function(d) { return d["tc_cand"]; });
	//var catDim = ndx.dimension(function(d) { return d["tc_cat"]; });
	//var stateDim = ndx.dimension(function(d) { return d["school_state"]; });
	//var totalDonationsDim  = ndx.dimension(function(d) { return d["total_donations"]; });

  //console.log(dateDim.groupAll());

	//Calculate metrics
	var numTweetsByDate = dateDim.group();
	var numTweetsByCand = candDim.group();
	console.log(numTweetsByDate.all());
	console.log(numTweetsByCand.all());
	
	/*
	var numTweetsByDateCand = dateDim.group().reduce(
  //    function (p, v) {
            console.log(p);
            console.log(v);
            return p;
        },
        function (p, v) {
            return p;
        },
  function reduceInitial() {
    return 0;
  }        
  );	  
	  
	*/
	
	
	//console.log(numTweetsByDate.all());
	//console.log(numTweetsByCand.all());
	  
	
	//var totalDonationsByState = stateDim.group().reduceSum(function(d) {
	//	return d["total_donations"];
	//});

  /*
	var all = ndx.groupAll();
	var totalTweets = ndx.groupAll().reduceSum(function(d) {return d["total_donations"];});

	var max_state = totalDonationsByState.top(1)[0].value;
  */
	//Define values (to be used in charts)
	var minDate = dateDim.bottom(1)[0]["fulldate"];
	var maxDate = dateDim.top(1)[0]["fulldate"];
  
  //console.log(minDate);
  //console.log(maxDate);
  
  
  //Charts
	var timeChart = dc.barChart("#time-chart");
	var candChart = dc.pieChart("#cand-chart");
	
	
	//var resourceTypeChart = dc.rowChart("#resource-type-row-chart");
	//var povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
	//var usChart = dc.geoChoroplethChart("#us-chart");
	//var numberProjectsND = dc.numberDisplay("#number-projects-nd");
	//var totalDonationsND = dc.numberDisplay("#total-donations-nd");

	timeChart
		.width(600)
		.height(160)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(dateDim)
		.group(numTweetsByDate)
		//.dimension(candDim)
		//.group(numTweetsByCand)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
    .turnOnControls(true)
		.xAxisLabel("Day")
		.yAxis().ticks(4);
		
    candChart  
        .width(300)
        .height(300)
        .radius(140)
        .dimension(candDim)
        .group(numTweetsByCand)
        .innerRadius(30)
        .turnOnControls(true);
  
  var datatable   = dc.dataTable("#cand-table");
    datatable
    .dimension(dateDim)
    .group(function(d) {return d.tc_cand;});
  
  /*
  
	numberProjectsND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	totalDonationsND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(totalDonations)
		.formatNumber(d3.format(".3s"));


	resourceTypeChart
        .width(300)
        .height(250)
        .dimension(resourceTypeDim)
        .group(numProjectsByResourceType)
        .xAxis().ticks(4);

	povertyLevelChart
		.width(300)
		.height(250)
        .dimension(povertyLevelDim)
        .group(numProjectsByPovertyLevel)
        .xAxis().ticks(4);


	usChart.width(1000)
		.height(330)
		.dimension(stateDim)
		.group(totalDonationsByState)
		.colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
		.colorDomain([0, max_state])
		.overlayGeoJson(statesJson["features"], "state", function (d) {
			return d.properties.name;
		})
		.projection(d3.geo.albersUsa()
    				.scale(600)
    				.translate([340, 150]))
		.title(function (p) {
			return "State: " + p["key"]
					+ "\n"
					+ "Total Donations: " + Math.round(p["value"]) + " $";
		})

    */
    dc.renderAll();
  
};