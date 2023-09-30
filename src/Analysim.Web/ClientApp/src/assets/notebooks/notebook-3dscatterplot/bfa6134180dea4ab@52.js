function _data(){return(
[]
)}

function _Plotly(require){return(
require("https://cdn.plot.ly/plotly-latest.min.js")
)}

function _xColumn(){return(
""
)}

function _yColumn(){return(
""
)}

function _zColumn(){return(
""
)}

function _xValues(data,xColumn){return(
data.map(rec=>rec[xColumn])
)}

function _yValues(data,yColumn){return(
data.map(rec=>rec[yColumn])
)}

function _zValues(data,zColumn){return(
data.map(rec=>rec[zColumn])
)}

function _unpack(){return(
function unpack(rows, key) {
	return rows.map(function(row)
	{ return row[key]; });}
)}

function _threeDScatterdata(unpack,data,xColumn,yColumn,zColumn){return(
[{
  x: unpack(data, xColumn),
  y: unpack(data, yColumn),
  z: unpack(data, zColumn),
  mode: 'markers',
  type: 'scatter3d'
}]
)}

function _threeDScatterPlot(xColumn,yColumn,zColumn,DOM,Plotly,threeDScatterdata)
{
  let layout = {
  width: window.innerWidth,
	scene: {
		xaxis:{title: xColumn},
		yaxis:{title: yColumn},
		zaxis:{title: zColumn},
		},
  };
  let config = {responsive: true}
  const div = DOM.element('div');
  Plotly.newPlot(div, threeDScatterdata, layout,config);
  return div;
}


export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer("data")).define("data", _data);
  main.variable(observer("Plotly")).define("Plotly", ["require"], _Plotly);
  main.variable(observer("xColumn")).define("xColumn", _xColumn);
  main.variable(observer("yColumn")).define("yColumn", _yColumn);
  main.variable(observer("zColumn")).define("zColumn", _zColumn);
  main.variable(observer("xValues")).define("xValues", ["data","xColumn"], _xValues);
  main.variable(observer("yValues")).define("yValues", ["data","yColumn"], _yValues);
  main.variable(observer("zValues")).define("zValues", ["data","zColumn"], _zValues);
  main.variable(observer("unpack")).define("unpack", _unpack);
  main.variable(observer("threeDScatterdata")).define("threeDScatterdata", ["unpack","data","xColumn","yColumn","zColumn"], _threeDScatterdata);
  main.variable(observer("threeDScatterPlot")).define("threeDScatterPlot", ["xColumn","yColumn","zColumn","DOM","Plotly","threeDScatterdata"], _threeDScatterPlot);
  return main;
}
