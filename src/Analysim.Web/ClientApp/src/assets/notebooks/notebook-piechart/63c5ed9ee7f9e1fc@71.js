function _data(){return(
[]
)}

function _Plotly(require){return(
require("https://cdn.plot.ly/plotly-latest.min.js")
)}

function _xColumn(){return(
""
)}

function _xValues(data,xColumn){return(
data.map(rec=>rec[xColumn])
)}

function _countFrequencies(){return(
function countFrequencies(arr) {
    let frequencyDict = {};
    
    // Count the frequency of each item in the array
    for (let item of arr) {
        if (frequencyDict[item]) {
            frequencyDict[item]++;
        } else {
            frequencyDict[item] = 1;
        }
    }
    
    // Create a new array that contains the frequency of each item
    let result = [];
    let keys = Object.keys(frequencyDict);
    for (let item of keys) {
        result.push(frequencyDict[item]);
    }

    return [result,keys];
}
)}

function _result(countFrequencies,xValues){return(
countFrequencies(xValues)
)}

function _pieChartdata(result){return(
[{
  values: result[0],
  labels: result[1],
  type: 'pie'
}]
)}

function _pieChartPlot(DOM,Plotly,pieChartdata)
{
  let layout = {
  width: window.innerWidth
  };
  let config = {responsive: true}
  const div = DOM.element('div');
  Plotly.newPlot(div, pieChartdata, layout,config);
  return div;
}


export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer("data")).define("data", _data);
  main.variable(observer("Plotly")).define("Plotly", ["require"], _Plotly);
  main.variable(observer("xColumn")).define("xColumn", _xColumn);
  main.variable(observer("xValues")).define("xValues", ["data","xColumn"], _xValues);
  main.variable(observer("countFrequencies")).define("countFrequencies", _countFrequencies);
  main.variable(observer("result")).define("result", ["countFrequencies","xValues"], _result);
  main.variable(observer("pieChartdata")).define("pieChartdata", ["result"], _pieChartdata);
  main.variable(observer("pieChartPlot")).define("pieChartPlot", ["DOM","Plotly","pieChartdata"], _pieChartPlot);
  return main;
}
