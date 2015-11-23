
// ****************************************************************************
// Visualization
// ****************************************************************************

// ****************************************************************************
// Constants

// lookup arrays
gop = [ "bush","carson","christie","cruz","fiorina","graham","huckabee","jindal","pataki","paul","perry","rubio","santorum","trump","walker","kasich" ];
dem = [ "chafee","clinton","omalley","sanders","webb" ];
allCands = gop.concat(dem);
//console.log(allCands);

// setup colors, one for each candidate and consistent across graphs
colors = d3.scale.ordinal()
    .domain(allCands)  
    .range(d3.scale.category20().range().slice(0,allCands.length));
//console.log(colors.domain());
//console.log(colors.range());

// ****************************************************************************
// Load the Data

// wait for data sets to load
// call the function that makes the graphs
queue()
    .defer(d3.json, "/twit-candi/tags")
    .await(function(d) { 
      console.log(d); 
      })
    .await(makeGraphs);
    //.await(test);

// ****************************************************************************
// Graphs

function makeGraphs(error, tagsJson) {
	
    console.log(tagsJson);
	
    var tweets = tagsJson;
	  var tformat = d3.time.format("%a %b %d %I %p");

    // ****************************************************************************
    // Set up the data
	  
	  tweets.forEach(function(d) {
	    
	    // create a date by hour
  		var year = d["_id"]["year"];
  		var month = d["_id"]["month"] -1 ; // Javascript indexes month by zero
  		var day = d["_id"]["day"];
  		var hour = d["_id"]["hour"];
      d["time"] = Date.UTC(year,month,day, hour);
      d.tc_cand = d._id.tc_cand;
      
      // parties
      if (gop.indexOf(d._id.tc_cand) != -1) {
        d["party"] = "Republican";
      } else if (dem.indexOf(d._id.tc_cand) != -1) {
        d["party"] = "Democrat";
      } else {
        d["party"] = "NA";
      } 
      
      // make all the hastags for a given hour into one flat array
      // (it comes from mongo as an array of arrays)
      d.tagsflat = [].concat.apply([], d.tags);
 
	  });

    // ****************************************************************************
    // Create a Crossfilter instance
  	
  	var ndx = crossfilter(tweets);
  
  	// Define Dimensions
  	var candDim = ndx.dimension(function(d) { return d["tc_cand"]; });
  	var timeDim = ndx.dimension(function(d) { return d["time"]; }); 
  	var candTimeDim = ndx.dimension(function(d) {return [d.tc_cand, d.time]; });
  
  	// Calculate group sums
  	var numTweetsByCand = candDim.group().reduceSum(function(d) { return d.count; });
  	var numTweetsByTime = timeDim.group().reduceSum(function(d) { return d.count; });
  	var numTweetsByCandTime = candTimeDim.group().reduceSum(function(d) { return d.count; });
  	
  	//console.log(numTweetsByTime.all());
  	//console.log(numTweetsByCand.all());
  	//console.log(numTweetsByCandTime.all());
  	
  	// min max dates to be used in charts
  	var minDate = timeDim.bottom(1)[0]["time"];
  	var maxDate = timeDim.top(1)[0]["time"];
    
    var timeGroup = timeDim.group();

    // ****************************************************************************
    // Draw Charts
  	
  	var timeChart = dc.barChart("#time-chart");
  	var candChart = dc.rowChart("#cand-chart");
  	var timeCandChart = dc.seriesChart("#cand-series-chart");
  	
  	// Shows total tweets (all candidates) over time.  
  	// Can filter time using selction handles.
  	
  	timeChart
  		.width(1000)
  		.height(100)
  		.margins({top: 0, right: 10, bottom: 35, left: 22})
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
  		.yAxis().ticks(0);

    // Shows tweets over time broken down by candidate
    // mouse over candidate name to highlight line
  	  
    timeCandChart
      .width(1000)
      .height(350)
      .margins({top: 10, right: 10, bottom: 20, left: 22})
      .chart(function(c) { return dc.lineChart(c); })
  		.x(d3.time.scale().domain([minDate, maxDate]))
      .brushOn(false)
      .yAxisLabel("")
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
      //.legend(dc.legend().x(150).y(20).itemHeight(13).gap(5).horizontal(1).legendWidth(500).itemWidth(70));
      .legend(dc.legend().x(50).y(20).itemHeight(13).gap(5).horizontal(1).legendWidth(900).itemWidth(70));
      //timeCandChart.yAxis().ticks(d3.time.hour(3));
      //chart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+299500);});
      //chart.margins().left += 40;


      // Shows totals for each candidate during the selected time period
    
      candChart  
          .width(170)
          .height(450)
          .margins({top: 5, right: 5, bottom: 20, left: 3})
          .dimension(candDim)
          .group(numTweetsByCand)
          .gap(2)
          .ordering(function(d) { return -d.value; })
          //.ordinalColors(d3.scale.category20().range())
          .colors(colors)
          .turnOnControls(true)
          .xAxis().ticks(4);
  

      var minsCount = dc.dataCount('#mins-count');
      minsCount.group({ value: function() {
          return timeGroup.all().filter(function(kv) { return kv.value>0; }).length;
      } } );    
      minsCount.dimension(timeGroup);

  
      // Shows total number of tweets currently selected by filter.
      
      var allCounts = ndx.groupAll().reduceSum(function(d) { return d.count; });
      var numberDisplay = dc.numberDisplay('#number-chart');
      numberDisplay
          .group(allCounts)
          .formatNumber(d3.format(",g"))
          //.html({
          //  one:"<span style=\"color:steelblue; font-size: 26px;\">%number</span> Tweet Selected",
          //  some:"<span style=\"color:steelblue; font-size: 26px;\">%number</span> Tweets Selected",
          //  none:"<span style=\"color:steelblue; font-size: 26px;\">No</span> Tweets"
          //})
          .valueAccessor( function(d) { return d; });
  
  
      // Show totals for each hashtag used
      // this can be filtered by candidate and time
      // Crossfilter does not naturally deal with a property that is an array
      // so I need 
      // 1) three custom reduce functions, using a map
      // 2) override all() function
      // 3) override top() function -- because we only want to show top 20
      
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
          .height(500)
          .margins({top: 5, right: 5, bottom: 20, left: 5})
          .renderLabel(true)
          .dimension(tagsDim)
          .group(tagsGroup)
          .turnOnControls(false)
          .elasticX(true)
          .cap(30)
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

      dc.renderAll();
      //dc.renderAll("owngroup");
      //dc.renderAll("updategroup");
    
  
}

// ****************************************************************************
// Used for Testing Only

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
  
