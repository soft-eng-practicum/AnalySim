function _1(md){return(
md`### Untitled`
)}

function _2(md){return(
md`# Heading
`
)}

function _params(location){return(
new URL(location).searchParams
)}

function _4(params){return(
params.get("dataset")
)}

function _csv_parsed(params){return(
params.get("dataset")
)}

function _parseCSV(){return(
function parseCSV(data) {
    const lines = data.split("\n");
    return lines.map(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
            return [];
        }
        return trimmedLine.split(",").map(cell => cell.trim());
    });
}
)}

function _fetchAndParseCSV(parseCSV){return(
async function fetchAndParseCSV(url) {
    try {
        const response = await fetch(url);
        const data = await response.text();
        return parseCSV(data);
    } catch (error) {
        console.error("There was an error fetching or parsing the CSV:", error);
    }
}
)}

function _data(d3,params){return(
d3.csv(params.get("dataset"))
)}

function _data1(__query,data,invalidation){return(
__query(data,{from:{table:"data"},sort:[{column:"value",direction:"desc"}],slice:{to:null,from:null},filter:[],select:{columns:null}},invalidation,"data")
)}

function _data2(__query,data,invalidation){return(
__query(data,{from:{table:"data"},sort:[{column:"value",direction:"desc"}],slice:{to:null,from:null},filter:[],select:{columns:null}},invalidation,"data")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer("params")).define("params", ["location"], _params);
  main.variable(observer()).define(["params"], _4);
  main.variable(observer("csv_parsed")).define("csv_parsed", ["params"], _csv_parsed);
  main.variable(observer("parseCSV")).define("parseCSV", _parseCSV);
  main.variable(observer("fetchAndParseCSV")).define("fetchAndParseCSV", ["parseCSV"], _fetchAndParseCSV);
  main.variable(observer("data")).define("data", ["d3","params"], _data);
  main.variable(observer("data1")).define("data1", ["__query","data","invalidation"], _data1);
  main.variable(observer("data2")).define("data2", ["__query","data","invalidation"], _data2);
  return main;
}
