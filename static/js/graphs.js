
gop = [ "bush","carson","christie","cruz","fiorina","graham","huckabee","jindal","pataki","paul","perry","rubio","santorum","trump","walker","kasich" ];
dem = [ "chafee","clinton","omalley","sanders","webb" ];

allCands = gop.concat(dem);
//allCands.push(gop);
//allCands.push(dem);
console.log(allCands);
colors = d3.scale.ordinal()
    .domain(allCands)  
    .range(d3.scale.category20().range().slice(0,allCands.length));
//console.log(colors.domain());
//console.log(colors.range());

queue()
    //.defer(d3.json, "/twit-candi/ag")
    .defer(d3.json, "/twit-candi/tags")
//  .defer(d3.json, "/twit-candi/tw")
//  .defer(d3.json, "static/geojson/us-states.json")
    .await(function(d) { 
      console.log(d); 
      })
    .await(makeGraphs);
    //.await(test);

function test(error, tagsJson) {
    //console.log(tweetsJson);
    console.log(tagsJson);
    
    //var tweets = tweetsJson;
    var tweets = tagsJson;
	  //var tformat = d3.time.format("%a %b %d %H:%M:%S %Z %Y");
	  
	  tweets.forEach(function(d) {
  		var year = d["_id"]["year"];
  		var month = d["_id"]["month"] - 1;
  		var day = d["_id"]["day"];
  		var hour = d["_id"]["hour"];
  
      d["time"] = Date.UTC(year,month,day, hour);
      d.tc_cand = d._id.tc_cand;
      
      if (gop.indexOf(d._id.tc_cand) != -1) {
        d["party"] = "Republican";
      } else if (dem.indexOf(d._id.tc_cand) != -1) {
        d["party"] = "Democrat";
      } else {
        d["party"] = "NA";
      } 
      d.tagsflat = [].concat.apply([], d.tags);
 
	});
	
  console.log(tweets);
}
    
function makeGraphs(error, tagsJson) {
	
	//console.log(tweetsJson);
    console.log(tagsJson);
	
	
    var tweets = tagsJson;
	  //var tweets = tweetsJson;
	  var tformat = d3.time.format("%a %b %d %I %p");
	  
	  tweets.forEach(function(d) {
  		var year = d["_id"]["year"];
  		var month = d["_id"]["month"] -1; // Javascript indexes month by zero
  		var day = d["_id"]["day"];
  		var hour = d["_id"]["hour"];
  
      d["time"] = Date.UTC(year,month,day, hour);
      d.tc_cand = d._id.tc_cand;
      
      if (gop.indexOf(d._id.tc_cand) != -1) {
        d["party"] = "Republican";
      } else if (dem.indexOf(d._id.tc_cand) != -1) {
        d["party"] = "Democrat";
      } else {
        d["party"] = "NA";
      } 
      d.tagsflat = [].concat.apply([], d.tags);
 
	});

  //console.log(tweets);
  //tweets = tweets.slice(1581,1590);
	//console.log(tweets);
  
	//Create a Crossfilter instance
	var ndx = crossfilter(tweets);

	// Define Dimensions
	var candDim = ndx.dimension(function(d) { return d["tc_cand"]; });
	var timeDim = ndx.dimension(function(d) { return d["time"]; }); 
	var candTimeDim = ndx.dimension(function(d) {return [d.tc_cand, d.time]; });


//	var partyDim = ndx.dimension(function(d) { return d["party"]; });
	//var catDim = ndx.dimension(function(d) { return d["tc_cat"]; });
	//var stateDim = ndx.dimension(function(d) { return d["school_state"]; });
	//var totalDonationsDim  = ndx.dimension(function(d) { return d["total_donations"]; });

	//Calculate metrics
	var numTweetsByCand = candDim.group().reduceSum(function(d) { return d.count; });
	var numTweetsByTime = timeDim.group().reduceSum(function(d) { return d.count; });
	var numTweetsByCandTime = candTimeDim.group().reduceSum(function(d) { return d.count; });
	
	//console.log(numTweetsByTime.all());
	//console.log(numTweetsByCand.all());
	//console.log(numTweetsByCandTime.all());
	
	//Define values (to be used in charts)
	var minDate = timeDim.bottom(1)[0]["time"];
	var maxDate = timeDim.top(1)[0]["time"];
  
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
		.width(770)
		.height(100)
		.margins({top: 0, right: 10, bottom: 35, left: 37})
		.dimension(timeDim)
		.group(numTweetsByTime)
		.transitionDuration(500)
		.colors(["black"])
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
    .turnOnControls(true)
		.xAxisLabel("Time")
		//.tickFormat(function(d) {return tformat; })
		.yAxisLabel("")
		.yAxis().ticks(2);

  timeCandChart
    .width(770)
    .height(250)
    .margins({top: 10, right: 10, bottom: 20, left: 37})
    .chart(function(c) { return dc.lineChart(c); })
		.x(d3.time.scale().domain([minDate, maxDate]))
    .brushOn(false)
    .yAxisLabel("Tweets in 12-min Interval")
    .xAxisLabel("")
    //.clipPadding(10)
    .elasticY(true)//
    .dimension(timeDim) // had to have same dimension as its range chart
    //.dimension(dateByMinuteCandDimension)
    .group(numTweetsByCandTime)
    .mouseZoomable(true)
    .rangeChart(timeChart)
    .colors(colors)
    .title(function(d) { return d.key[0] + " : " + tformat(new Date(d.key[1])) + " : " + d.value; })
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
        .width(170)
        .height(450)
        .margins({top: 5, right: 5, bottom: 20, left: 5})
        //.radius(100)
        .dimension(candDim)
        .group(numTweetsByCand)
        //.innerRadius(40)
        .gap(2)
        .ordering(function(d) { return -d.value; })
        //.ordinalColors(d3.scale.category20().range())
        .colors(colors)
        .turnOnControls(true)
        .xAxis().ticks(4);

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
        
  var allCounts = ndx.groupAll().reduceSum(function(d) { return d.count; });
  
  var numberDisplay = dc.numberDisplay('#number-chart');
  numberDisplay
      .group(allCounts)
      .formatNumber(d3.format(",g"))
      .html({
        one:"<span style=\"color:steelblue; font-size: 26px;\">%number</span> Tweet Selected",
        some:"<span style=\"color:steelblue; font-size: 26px;\">%number</span> Tweets Selected",
        none:"<span style=\"color:steelblue; font-size: 26px;\">No</span> Tweets"
      })
      .valueAccessor( function(d) { return d; });


function reduceAdd(p, v) {
  if (v.tagsflat[0] === "") return p;    // skip empty values
  v.tagsflat.forEach (function(val, idx) {
    if (val != "all" && val != "top") {
      p[val] = (p[val] || 0) + 1; //increment counts
    }  
  });
  return p;
}

function reduceRemove(p, v) {
  if (v.tagsflat[0] === "") return p;    // skip empty values
  v.tagsflat.forEach (function(val, idx) {
    if (val != "all" && val != "top") {
      p[val] = (p[val] || 0) - 1; //decrement counts
    }  
  });
  return p;
   
}

function reduceInitial() {
  return {};  
}

var tagsDim = ndx.dimension(function(d){ return d.tagsflat;});
var tagsGroup = tagsDim.groupAll().reduce(reduceAdd, reduceRemove, reduceInitial).value();
//console.log(tagsGroup);
// hack to make dc.js charts work
tagsGroup.all = function() {
  var newObject = [];
  for (var key in this) {
    if (this.hasOwnProperty(key) && key != "all" && key != "top") {
      newObject.push({
        key: key,
        value: this[key]
      });
    }
  }
  return newObject;
};

tagsGroup.top = function(count) {
    //console.log(this);
    var newObject = this.all();
    //console.log(newObject);
    newObject.sort(function(a, b){return b.value - a.value});
    //console.log(newObject.slice(0, count));
    return newObject.slice(0, count);
    //return null;
};

var tagchart = dc.rowChart("#tag-chart");
tagchart      
    .width(170)
    .height(450)
    .margins({top: 5, right: 5, bottom: 20, left: 5})
    .renderLabel(true)
    .dimension(tagsDim)
    .group(tagsGroup)
    .turnOnControls(false)
    .elasticX(true)
    .cap(25)
    .ordering(function(d) { return -d.value; })
    .xAxis().ticks(4);

tagchart.filterHandler (function (dimension, filters) {
       dimension.filter(null);   
        if (filters.length === 0)
            dimension.filter(null);
        else
            dimension.filterFunction(function (d) {
                for (var i=0; i < d.length; i++) {
                    if (filters.indexOf(d[i]) >= 0) return true;
                }
                return false;
            });
    return filters; 
});    

    //.filterHandler(function(dimension, filter){     
    //    dimension.filter(function(d) {return chart.filter() != null ? d.indexOf(chart.filter()) >= 0 : true;}); // perform filtering
    //    return filter; // return the actual filter value
    //   })
    //.xAxis().ticks(3);

/*
  # An attempt at counting minutes.  Almost there, not quite.

  var all2 = timeDim.groupAll().reduce(
          function (p, v) {
              ++p.n;
              p.tot += v.count;
              p.mins.set(v.time, 1);
              return p;
          },
          function (p, v) {
              --p.n;
              p.tot -= v.count;
              p.mins.remove(v.time);
              return p;
          },
          function () { return {n:0,tot:0, mins: d3.map()}; }
      );
  console.log(all2);

  var numberDisplay = dc.numberDisplay('#number-chart');
  numberDisplay
    .group(all2)
    .formatNumber(d3.format(",g"))
    .valueAccessor( function(d) { return d.mins.size(); });

*/
//  dc.dataCount("#dc-data-count")
//   .dimension(ndx)
//   .group(all);        


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