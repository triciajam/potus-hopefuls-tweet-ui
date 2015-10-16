
gop = [ "bush","carson","christie","cruz","fiorina","graham","huckabee","jindal","pataki","paul","perry","rubio","santorum","trump","walker","kasich" ];
dem = [ "chafee","clinton","omalley","sanders","webb" ];

allCands = gop.concat(dem);
//allCands.push(gop);
//allCands.push(dem);
console.log(allCands);
colors = d3.scale.ordinal()
    .domain(allCands)  
    .range(d3.scale.category20().range().slice(0,allCands.length));
console.log(colors);
console.log(colors.domain());
console.log(colors.range());

queue()
    .defer(d3.json, "/twit-candi/ag")
//  .defer(d3.json, "/twit-candi/tw")
//  .defer(d3.json, "static/geojson/us-states.json")
    .await(function(d) { 
      console.log(d); 
      })
    .await(makeGraphs);
    //.await(test);

function test(error, tweetsJson) {
    console.log(tweetsJson);
    
    var tweets = tweetsJson;
	  //var tformat = d3.time.format("%a %b %d %H:%M:%S %Z %Y");
	  
	  tweets.forEach(function(d) {
  		var year = d["_id"]["year"];
  		var month = d["_id"]["month"];
  		var day = d["_id"]["day"];
  		var hour = d["_id"]["hour"];
  
      d["dateByHour"] = new Date(year,month,day, hour);
      d.tc_cand = d._id.tc_cand;
      
      if (gop.indexOf(d._id.tc_cand) != -1) {
        d["party"] = "Republican";
      } else if (dem.indexOf(d._id.tc_cand) != -1) {
        d["party"] = "Democrat";
      } else {
        d["party"] = "NA";
      } 
 
	});
	
  console.log(tweets);
}
    
function makeGraphs(error, tweetsJson) {
	
	//console.log(tweetsJson);
	
	
    var tweets = tweetsJson;
	  //var tformat = d3.time.format("%a %b %d %H:%M:%S %Z %Y");
	  
	  tweets.forEach(function(d) {
  		var year = d["_id"]["year"];
  		var month = d["_id"]["month"];
  		var day = d["_id"]["day"];
  		var hour = d["_id"]["hour"];
  
      d["dateByHour"] = new Date(year,month,day, hour);
      d.tc_cand = d._id.tc_cand;
      
      if (gop.indexOf(d._id.tc_cand) != -1) {
        d["party"] = "Republican";
      } else if (dem.indexOf(d._id.tc_cand) != -1) {
        d["party"] = "Democrat";
      } else {
        d["party"] = "NA";
      } 
 
	});

  console.log(tweets);
	
	// filter
	// var mentions = tweets.filter(function(d) { return d["tc_cat"] == "mentions" ? true : false; });
  // var hashtags = 
  // add party
   
    
	//Create a Crossfilter instance
	var ndx = crossfilter(tweets);

  //console.log(ndx);

	//Define Dimensions
	//var dateDim = ndx.dimension(function(d) { return d["fulldate"]; }); 
	var candDim = ndx.dimension(function(d) { return d["tc_cand"]; });
	//var dateByDayDim = ndx.dimension(function(d) { return d["dateByDay"]; }); 
	//var dateByHourDim = ndx.dimension(function(d) { return d["dateByHour"]; }); 
	//var dateByMinuteDim = ndx.dimension(function(d) { return d["dateByMinute"]; }); 
	//var dateByMinuteCandDimension = ndx.dimension(function(d) {return [d.tc_cand, d.dateByMinute]; });
	var dateByHourDim = ndx.dimension(function(d) { return d["dateByHour"]; }); 
	var dateByHourDimTwo = ndx.dimension(function(d) { return d["dateByHour"]; }); 
	var dateByHourCandDim = ndx.dimension(function(d) {return [d.tc_cand, d.dateByHour]; });


//	var partyDim = ndx.dimension(function(d) { return d["party"]; });
	//var catDim = ndx.dimension(function(d) { return d["tc_cat"]; });
	//var stateDim = ndx.dimension(function(d) { return d["school_state"]; });
	//var totalDonationsDim  = ndx.dimension(function(d) { return d["total_donations"]; });


  //console.log(dateDim.groupAll());

	//Calculate metrics
	//var numTweetsByDate = dateDim.group();
	var numTweetsByCand = candDim.group().reduceSum(function(d) { return d.count; });
	//var numTweetsByParty = partyDim.group();
	//var numTweetsByDateByMin = dateByMinuteDim.group();
	var numTweetsByHour = dateByHourDim.group().reduceSum(function(d) { return d.count; });
	var numTweetsByHourCand = dateByHourCandDim.group().reduceSum(function(d) { return d.count; });
	
	console.log(numTweetsByHour.all());
	console.log(numTweetsByCand.all());
	console.log(numTweetsByHourCand.all());
	
	//totalminutes = numTweetsByDateByMin.size();

	
  //var dateByMinuteCandGroup = dateByMinuteCandDimension.group().reduceCount();
	
	var sumHoursGroup = dateByHourDimTwo.groupAll().reduceCount();
	
	//console.log(dateByMinuteCandGroup.all());
	//console.log(numTweetsByDateByMin.all());
	  
	
	//var totalDonationsByState = stateDim.group().reduceSum(function(d) {
	//	return d["total_donations"];
	//});

  /*
	var all = ndx.groupAll();
	var totalTweets = ndx.groupAll().reduceSum(function(d) {return d["total_donations"];});

	var max_state = totalDonationsByState.top(1)[0].value;
  */
	//Define values (to be used in charts)
	var minDate = dateByHourDim.bottom(1)[0]["dateByHour"];
	var maxDate = dateByHourDim.top(1)[0]["dateByHour"];
  
  console.log(minDate);
  console.log(maxDate);
  
  
  //Charts
	var timeChart = dc.barChart("#time-chart");
	var candChart = dc.rowChart("#cand-chart");
//	var partyChart = dc.pieChart("#party-chart");
	var timeCandChart = dc.seriesChart("#cand-series-chart");
	
	//var resourceTypeChart = dc.rowChart("#resource-type-row-chart");
	//var povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
	//var usChart = dc.geoChoroplethChart("#us-chart");
	//var numberProjectsND = dc.numberDisplay("#number-projects-nd");
	//var totalDonationsND = dc.numberDisplay("#total-donations-nd");

	timeChart
		.width(1000)
		.height(100)
		.margins({top: 0, right: 10, bottom: 35, left: 37})
		.dimension(dateByHourDim)
		.group(numTweetsByHour)
		.transitionDuration(500)
		.colors(["black"])
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
    .turnOnControls(true)
		.xAxisLabel("Time")
		.yAxisLabel("")
		.yAxis().ticks(2);
		


  timeCandChart
    .width(1000)
    .height(250)
    .margins({top: 10, right: 10, bottom: 20, left: 37})
    .chart(function(c) { return dc.lineChart(c); })
		.x(d3.time.scale().domain([minDate, maxDate]))
    .brushOn(false)
    .yAxisLabel("Tweets in 12-min Interval")
    .xAxisLabel("")
    //.clipPadding(10)
    .elasticY(true)//
    .dimension(dateByHourDim) // had to have same dimension as its range chart
    //.dimension(dateByMinuteCandDimension)
    .group(numTweetsByHourCand)
    .mouseZoomable(true)
    .rangeChart(timeChart)
    .colors(colors)
    .title(function(d) { return d.key[0] + " : " + d.key[1] + " : " + d.value; })
    //.ordinalColors(d3.scale.category20().range())
    .seriesAccessor(function(d) {return d.key[0];})
    .keyAccessor(function(d) {return d.key[1];})
    .valueAccessor(function(d) {return +d.value;})
    //.xAxis().tickFormat(function(d) { return d3.time.format("%Y-%m-%d"); });
    // horizontal legend four items across: 4x70=280
    .legend(dc.legend().x(150).y(20).itemHeight(13).gap(5).horizontal(1).legendWidth(500).itemWidth(70));
    
    //timeCandChart.yAxis().ticks(d3.time.hour(3));
  //chart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+299500);});
  //chart.margins().left += 40;
  
    candChart  
        .width(260)
        .height(420)
        .margins({top: 5, right: 5, bottom: 5, left: 5})
        //.radius(100)
        .dimension(candDim)
        .group(numTweetsByCand)
        //.innerRadius(40)
        .gap(2)
        .ordering(function(d) { return -d.value; })
        //.ordinalColors(d3.scale.category20().range())
        .colors(colors)
        .turnOnControls(true);

/*   
   partyChart  
        .width(220)
        .height(220)
        .radius(100)
        .innerRadius(40)
        .dimension(partyDim)
        .group(numTweetsByParty)
        .turnOnControls(true);
*/
        
  var all = ndx.groupAll();

  dc.dataCount("#dc-data-count")
   .dimension(ndx)
   .group(all);        

  var numberDisplay = dc.numberDisplay('#number-chart');
  numberDisplay.group(sumHoursGroup)
  .formatNumber(d3.format(".g"))
  .valueAccessor( function(d) { return d; } );


	//d3.select("#total-mins").text(totalminutes);
		
        
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
    //dc.renderAll("owngroup");
    //dc.renderAll("updategroup");
    
  
};