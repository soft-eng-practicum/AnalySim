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
    type: 'bar',
    name: yColumn,
    marker: {
      color: getRandomColor()
    },
  }
})
)}

function _barPlot(xColumn,DOM,Plotly,traces)
{
  let layout = {
  xaxis: {
    title: xColumn,
    showgrid: false,
    zeroline: false
  },
    width: window.innerWidth,
    height: 1000,
    barmode: 'group'
};
  var config = {responsive: true}
  const div = DOM.element('div');
  div.style.overflow="auto";
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
  main.variable(observer("barPlot")).define("barPlot", ["xColumn","DOM","Plotly","traces"], _barPlot);
  return main;
}
