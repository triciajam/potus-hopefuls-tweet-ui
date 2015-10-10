
gop = [ "bush","carson","christie","cruz","fiorina","graham","huckabee","jindal","pataki","paul","perry","rubio","santorum","trump","walker","kasich" ];
dem = [ "chafee","clinton","omalley","sanders","webb" ];

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
		var year = d["fulldate"].getFullYear();
    var month = d["fulldate"].getMonth();
    var day = d["fulldate"].getDate();
    var hour = d["fulldate"].getHours();
    var minute = d["fulldate"].getMinutes();
    var dateByDay = new Date(year,month,day);
    var dateByHour = new Date(year,month,day, hour);
    var dateByMinute = new Date(year,month,day,hour, minute);
    
    d["dateByDay"] = dateByDay;
    d["dateByHour"] = dateByHour;
    d["dateByMinute"] = dateByMinute;
    
    if (gop.indexOf(d["tc_cand"]) != -1) {
      d["party"] = "Republican";
    } else if (dem.indexOf(d["tc_cand"]) != -1) {
      d["party"] = "Democrat";
    } else {
      d["party"] = "NA";
    } 

	});
	
  //console.log(tweets);
	
	// filter
	var mentions = tweets.filter(function(d) { return d["tc_cat"] == "mentions" ? true : false; });
  // var hashtags = 
  // add party
   
    
	//Create a Crossfilter instance
	var ndx = crossfilter(mentions);

  //console.log(ndx);

	//Define Dimensions
	var dateDim = ndx.dimension(function(d) { return d["fulldate"]; }); 
	//var dateByDayDim = ndx.dimension(function(d) { return d["dateByDay"]; }); 
	//var dateByHourDim = ndx.dimension(function(d) { return d["dateByHour"]; }); 
	var dateByMinuteDim = ndx.dimension(function(d) { return d["dateByMinute"]; }); 
	var candDim = ndx.dimension(function(d) { return d["tc_cand"]; });
	var partyDim = ndx.dimension(function(d) { return d["party"]; });
	//var catDim = ndx.dimension(function(d) { return d["tc_cat"]; });
	//var stateDim = ndx.dimension(function(d) { return d["school_state"]; });
	//var totalDonationsDim  = ndx.dimension(function(d) { return d["total_donations"]; });

  //console.log(dateDim.groupAll());

	//Calculate metrics
	//var numTweetsByDate = dateDim.group();
	var numTweetsByCand = candDim.group();
	var numTweetsByParty = partyDim.group();
	var numTweetsByDateByMin = dateByMinuteDim.group();
	
	dateByMinuteCandDimension = ndx.dimension(function(d) {return [d.tc_cand, d.dateByMinute]; });
  dateByMinuteCandGroup = dateByMinuteCandDimension.group().reduceCount();
	
	console.log(dateByMinuteCandGroup.all());
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
	var partyChart = dc.pieChart("#party-chart");
	var timeCandChart = dc.seriesChart("#cand-series-chart");
	
	//var resourceTypeChart = dc.rowChart("#resource-type-row-chart");
	//var povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
	//var usChart = dc.geoChoroplethChart("#us-chart");
	//var numberProjectsND = dc.numberDisplay("#number-projects-nd");
	//var totalDonationsND = dc.numberDisplay("#total-donations-nd");

	timeChart
		.width(720)
		.height(100)
		.margins({top: 0, right: 15, bottom: 35, left: 37})
		.dimension(dateByMinuteDim)
		.group(numTweetsByDateByMin)
		//.dimension(candDim)
		//.group(numTweetsByCand)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
    .turnOnControls(true)
		.xAxisLabel("Time")
		.yAxisLabel("")
		.yAxis().ticks(2);

  timeCandChart
    .width(720)
    .height(250)
    .margins({top: 10, right: 15, bottom: 20, left: 37})
    .chart(function(c) { return dc.lineChart(c); })
		.x(d3.time.scale().domain([minDate, maxDate]))
    .brushOn(false)
    .yAxisLabel("Tweets Each Minute")
    .xAxisLabel("")
    //.clipPadding(10)
    .elasticY(true)//
    .dimension(dateByMinuteDim) // had to have same dimension as its range chart
    //.dimension(dateByMinuteCandDimension)
    .group(dateByMinuteCandGroup)
    .mouseZoomable(true)
    .rangeChart(timeChart)
    .ordinalColors(d3.scale.category20().range())
    .seriesAccessor(function(d) {return d.key[0];})
    .keyAccessor(function(d) {return d.key[1];})
    .valueAccessor(function(d) {return +d.value;})
    //.xAxis().tickFormat(function(d) { return d3.time.format("%Y-%m-%d"); });
    // horizontal legend four items across: 4x70=280
    .legend(dc.legend().x(300).y(20).itemHeight(13).gap(5).horizontal(1).legendWidth(420).itemWidth(70));
  //chart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+299500);});
  //chart.margins().left += 40;
  
    candChart  
        .width(220)
        .height(220)
        .radius(100)
        .dimension(candDim)
        .group(numTweetsByCand)
        .ordinalColors(d3.scale.category20().range())
        .innerRadius(40)
        .turnOnControls(true);
   
   partyChart  
        .width(220)
        .height(220)
        .radius(100)
        .innerRadius(40)
        .dimension(partyDim)
        .group(numTweetsByParty)
        .turnOnControls(true);

        
  var all = ndx.groupAll();

  dc.dataCount("#dc-data-count")
   .dimension(ndx)
   .group(all);        
        
  /*
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
    //dc.renderAll("main");
    //dc.renderAll("updategroup");
    
  
};