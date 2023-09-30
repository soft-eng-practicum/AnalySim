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

function _yColumns(){return(
[]
)}

function _getRandomColor(){return(
() =>{
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
)}

function _traces(yColumns,xValues,data,getRandomColor){return(
yColumns.map(yColumn=>{
  return {
    x: xValues,
    y: data.map(rec=>rec[yColumn]),
    mode: 'markers',
    name: yColumn,
    line: {
    color: getRandomColor(),
    width: 3
    },
    type: 'scatter'
  }
})
)}

function _scatterPlot(xColumn,DOM,Plotly,traces)
{
  let layout = {
  xaxis: {
    title: xColumn,
    showgrid: false,
    zeroline: false
  },
    width: window.innerWidth,
};
  var config = {responsive: true}
  const div = DOM.element('div');
  Plotly.newPlot(div, traces, layout,config);
  return div;
}


export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer("data")).define("data", _data);
  main.variable(observer("Plotly")).define("Plotly", ["require"], _Plotly);
  main.variable(observer("xColumn")).define("xColumn", _xColumn);
  main.variable(observer("xValues")).define("xValues", ["data","xColumn"], _xValues);
  main.variable(observer("yColumns")).define("yColumns", _yColumns);
  main.variable(observer("getRandomColor")).define("getRandomColor", _getRandomColor);
  main.variable(observer("traces")).define("traces", ["yColumns","xValues","data","getRandomColor"], _traces);
  main.variable(observer("scatterPlot")).define("scatterPlot", ["xColumn","DOM","Plotly","traces"], _scatterPlot);
  return main;
}
