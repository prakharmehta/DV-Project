var svg = d3.select('svg');
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');
let fileNameArray = []; // the filenames to load data from
let jsonDataArray = []; // the raw data as loaded from the json files

//adds files to the fileNameArray, eventually this will come from user input
fileNameArray.push('../../python_scripts/billboard.json');
fileNameArray.push('../radialplot/radiohead.json')
fileNameArray.push('../radialplot/slotmachine.json')
fileNameArray.push('../radialplot/radiohead.json')

// sets colors for the histogram rectangles
var colors = ['#F36293', '#81D0EF','#FCA981', '#6988F2'];
var dimensions = ["energy", "danceability", "acousticness", "liveness", "valence", "speechiness", "instrumentalness"]; // Edit this for more histograms

var x = d3.scaleLinear()
  .domain([0, 1])
  .range([52, 300]);

////////////////////////////// LOAD JSON DATA FROM FILES ///////////////////////////////

// d3 loading of json files linked to get data and put in jsonData array
d3.json(fileNameArray[0]).then(function (data) {

  // Data source 1 load completed

  console.log(data);
  jsonDataArray.push(data);
  if (fileNameArray[1]){
    return d3.json(fileNameArray[1]);
  } else {
    return null;
  }

}).then(function (data) {

  // Data source 2 load completed

  jsonDataArray.push(data);
  //stuff
 if (fileNameArray[2]){
    return d3.json(fileNameArray[2]);
  } else {
    return null;
  }

}).then(function (data) {

  // Data source 3 load completed

  jsonDataArray.push(data);
  //stuff
 if (fileNameArray[3]){
    return d3.json(fileNameArray[3]);
  } else {
    return null;
  }

}).then(function (data){

  // Data source 4 load completed

  jsonDataArray.push(data);


  ////////////////////////////// PROCESS DATA INTO STACKED HISTOGRAM FORMAT AND PLOT ///////////////////////////////

  let histogramsDatasets = []; // has length = to the length of dimensions, each entry is a dataset for one histogram

  // for each dimension (e.g. energy) create stacked histogram data and draw a histogram
  for(let i = 0; i < dimensions.length; i++) {
    drawHistogram(stackData(dimensions[i]), i);
  }

});

// Generates the data for one histogram by stacking the json data of all the files for a single dimension (e.g. energy)
function stackData(dimension) {

  let processedArray = [];

  // set the parameters for the histogram
  var histogram = d3.histogram()
      .value((d) => d[dimension])   // I need to give the vector of value
      .domain(x.domain())  // then the domain of the graphic
      .thresholds(x.ticks(20)); // then the numbers of bins

  // creates bins histogram array that we will use to fill our processedArray with correct format
  data = jsonDataArray[0];
  var bins = histogram(data);


  // put correct format from bins into processedArray
  // creates structure of for example
  // bin: 0, json0: 4, json1: 7
  // bin:1, json0: 0, json1: 2
  // etc
  // bin is then followed with counts for each json below
  for (i = 0; i < 21; i++) {
    processedArray.push({"bin": bins[i]['x0']})
  }

  // here is where bins are updated from json data
  for(let i = 0; i < jsonDataArray.length; i++) {

    if (jsonDataArray[i] != null) {

      data = jsonDataArray[i];
      var bins = histogram(data);

      for(let j = 0; j < bins.length; j++) {
        processedArray[j]["json" + i] = bins[j].length;
      }
    }
  }

  //stacks json groups for proper cumulative count formatting
  var keys = Object.keys(processedArray[0]).slice(1, processedArray[0].length); // [json0, json1, ... , jsonN]
  var stack = d3.stack().keys(keys);
  return stack(processedArray);
}

/* Accepts the stacked data representing a single histogram (as generated by stackData()) and draws it to the screen
  The parameter i specify that this histogram is the histogram of the dimension at dimensions[i]
*/
function drawHistogram(stackedData, i) {

  //obtains max count from last json data group max
  let yMax = d3.max(stackedData[stackedData.length - 1], (d) => d[1]);

  console.log(i*400);
  console.log(i*400 + 50);

  let range = [i*100 + 50, i*100 + 10];
  let domain = [0, yMax];

  console.log(range);

  let y = d3.scaleLinear()
  .domain(domain)
  .range(range);

  let xAxis = (g) => g
  .attr("transform", 'translate(0,' + (range[0]+1) + ')')
  .call(d3.axisBottom(x));

  let yAxis = (g) => g
  .attr("transform", 'translate(50,0)')
  .call(d3.axisLeft(y)
      .ticks(2));

  //adds to histogram to svg
  svg.append("g")
      .selectAll("g")
      .data(stackedData)
      .join("g")
        .attr("fill", function(d, i) { return colors[i]; })
        // .style('stroke', function(d, i) { return colors[i]; })
      .selectAll("rect")
      .data(d => d)
      .join("rect")
        .attr("x", (d, i) => x(d.data.bin))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", 10);

    // .style("opacity", .2)

  // Create axis and their labels

  svg.append("g")
    .call(xAxis)
  svg.append("g")
      .call(yAxis)

  let xLabel = dimensions[i].charAt(0).toUpperCase() +  dimensions[i].slice(1);
  svg.append('text')
      .attr('class', 'x_label')
      .attr('transform', 'translate(150,' + parseInt(range[0]+35) + ')')
      .text(xLabel);
      console.log(parseInt((range[0] - range[1])/2)+range[1]);
  svg.append('text')
      .attr('class', 'y_label')
      .attr("transform","translate(20," + (parseInt((range[0] - range[1])/2)+range[1]+22) + ")rotate(270)")
      .text('Count');
}