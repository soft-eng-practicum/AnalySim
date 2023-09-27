import { Component, OnInit, ElementRef, NgZone, OnDestroy, Input } from '@angular/core';
import Plotly from 'plotly.js-dist-min'

@Component({
  selector: 'app-three-dscatter-plot',
  templateUrl: './three-dscatter-plot.component.html',
  styleUrls: ['./three-dscatter-plot.component.scss']
})
export class ThreeDScatterPlotComponent implements OnInit {

  @Input() data : any;
  @Input() columnXName : string;
  @Input() columnYName : string;
  @Input() columnZName : string;
  @Input() columnDataTypes: any;

  constructor(private el: ElementRef, private zone: NgZone) { }

  ngOnInit(): void {
    console.log(this.data);
      this.drawPlot();
  }

  ngOnChanges(): void {
    console.log(this.data);
      this.drawPlot();
  }

  ngOnDestroy() {
    // Cleanup any resources used during component's life
  }

  drawPlot() {

      const unpack = (rows, key) => {
        return rows.map(row => row[key]);
      };
      const trace1 = {
        x: unpack(this.data, 'x'),
        y: unpack(this.data, 'y'),
        z: unpack(this.data, 'z'),
        mode: 'markers',
        marker: {
          size: 12,
          line: {
            color: 'rgba(217, 217, 217, 0.14)',
            width: 0.5
          },
          opacity: 0.8
        },
        type: 'scatter3d'
      };

      const data = [trace1];
      const layout = {
        margin: {
          l: 0,
          r: 0,
          b: 0,
          t: 0
        }
      };

      Plotly.newPlot('scatterplot', data, layout);
  }

}
