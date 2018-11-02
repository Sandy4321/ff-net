parcelRequire=function(e,r,n,t){var i="function"==typeof parcelRequire&&parcelRequire,o="function"==typeof require&&require;function u(n,t){if(!r[n]){if(!e[n]){var f="function"==typeof parcelRequire&&parcelRequire;if(!t&&f)return f(n,!0);if(i)return i(n,!0);if(o&&"string"==typeof n)return o(n);var c=new Error("Cannot find module '"+n+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[n][1][r]||r},p.cache={};var l=r[n]=new u.Module(n);e[n][0].call(l.exports,p,l,l.exports,this)}return r[n].exports;function p(e){return u(p.resolve(e))}}u.isParcelRequire=!0,u.Module=function(e){this.id=e,this.bundle=u,this.exports={}},u.modules=e,u.cache=r,u.parent=i,u.register=function(r,n){e[r]=[function(e,r){r.exports=n},{}]};for(var f=0;f<n.length;f++)u(n[f]);if(n.length){var c=u(n[n.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=c:"function"==typeof define&&define.amd?define(function(){return c}):t&&(this[t]=c)}return u}({"syvK":[function(require,module,exports) {
var e={createElement:function(e){return document.createElementNS("http://www.w3.org/2000/svg",e)}};module.exports=e;
},{}],"xdyW":[function(require,module,exports) {
var r={roundToString:function(r,n){for(var i=1,o=0;o<n;o++)i*=10;var t=(Math.round(r*i)/i).toString();if(0==n)return t;var e=t.indexOf(".");-1===e&&(e=t.length,t+=".0");for(o=t.length-e-1;o<n;o++)t+="0";return t},sigmoid:function(r){return 1/(1+Math.exp(-r))},dSigmoid:function(n){return r.sigmoid(n)*(1-r.sigmoid(n))}};module.exports=r;
},{}],"snLP":[function(require,module,exports) {
var t=function(t,n,r,e){null==e&&(e=1),this.r=t,this.g=n,this.b=r,this.a=e};t.WHITE=new t(1,1,1),t.BLACK=new t(0,0,0),t.RED=new t(226/255,86/255,86/255),t.BLUE=new t(135/255,173/255,236/255),t.LIGHT_BLUE=new t(186/255,224/255,251/255),t.LIGHT_RED=new t(252/255,163/255,163/255);var n=t.prototype;n.blend=function(n,r){if(Math.abs(r)>1)throw"t must be a number between -1 and 1";var e,h;return r>=0?(e=this,h=n):(e=n,h=this),new t(e.r*(1-r)+h.r*r,e.g*(1-r)+h.g*r,e.b*(1-r)+h.b*r)},n.toString=function(){return"rgba("+Math.floor(255*this.r)+", "+Math.floor(255*this.g)+", "+Math.floor(255*this.b)+", "+this.a+")"},module.exports=t;
},{}],"6klw":[function(require,module,exports) {
var t=require("./svg"),i=require("./math"),s=require("./Color"),e=12,n=2,r=function(s,n){this.layer=s,this.links=[],this.backLinks=[],this.bias=n,this.preActivation=0,this.activation=i.sigmoid(this.bias),this.dActivation=0,this.dPreActivation=0,this.dBias=0,this.isInput=!1,this.isOutput=!1,(this.svgElement=t.createElement("circle")).setAttribute("r",e)},a=r.prototype;a.redraw=function(){var t=this.svgElement,i=this.getPosition();t.setAttribute("cx",i.x),t.setAttribute("cy",i.y);var e,r=this.bias;r<-3?r=-3:r>3&&(r=3),e=.5*(r/3+1);var a=s.RED.blend(s.BLUE,e),h=a.blend(s.BLACK,.3);t.setAttribute("fill",a.toString()),t.setAttribute("stroke",h.toString()),t.setAttribute("stroke-width",n)},a.getIndex=function(){return this.layer.neurons.indexOf(this)},a.getPosition=function(){var t=this.layer.neuralNet,i=this.layer.neurons.length,s=t.layers.length,r=t.svgElement.parentNode;if(null==r)return{x:0,y:0};var a=r.getBoundingClientRect(),h=a.width,o=a.height,c=o/2,d=(h-2*(e+n))/(s-1),u=(o-2*(e+n))/4;return{x:h/2+(this.layer.getIndex()-(s-1)/2)*d,y:0==i?c:c+(this.getIndex()-(i-1)/2)*u}},a.forward=function(){this.preActivation=0,this.preActivation+=this.bias;for(var t=0;t<this.backLinks.length;t++){var s=this.backLinks[t];this.preActivation+=s.weight*s.n0.activation}this.activation=i.sigmoid(this.preActivation)},a.backward=function(t){for(var s=0,e=0;e<this.links.length;e++){var n=this.links[e];this.dActivation+=n.weight*n.dWeight}this.dPreActivation=this.dActivation*i.dSigmoid(this.preActivation),this.dBias=this.dPreActivation;for(e=0;e<this.backLinks.length;e++){s+=(n=this.backLinks[e]).backward(t)}return s},a.applyGradient=function(t){this.bias-=t*this.dBias},a.reset=function(){this.preActivation=0,this.activation=i.sigmoid(this.bias),this.dActivation=0,this.dPreActivation=0,this.dBias=0},r.newFromData=function(t,i){t.addNeuron(i.bias)},a.toData=function(){var t={};return t.bias=this.bias,t},module.exports=r;
},{"./svg":"syvK","./math":"xdyW","./Color":"snLP"}],"XgDy":[function(require,module,exports) {
var t=require("./svg"),e=require("./Color"),i=function(e,i,n,s){if(this.neuralNet=e,this.n0=i,this.nf=n,this.n0.layer.getIndex()+1!=this.nf.layer.getIndex())throw"Cannot connect neurons from non-consecutive layers";this.weight=null==s?1:s,this.dWeight=0,this.svgElement=t.createElement("path"),this.redraw()},n=i.prototype;n.redraw=function(){var t=this.svgElement,i=this.n0.getPosition(),n=this.nf.getPosition();t.setAttribute("d","M"+i.x+" "+i.y+" L"+n.x+" "+n.y);var s,r=9*Math.min(1,Math.abs(this.weight)/5);t.setAttribute("stroke-width",r),s=this.weight<0?e.RED:e.BLUE,t.setAttribute("stroke-opacity",.4),t.setAttribute("stroke",s)},n.backward=function(t){var e=0;return this.dWeight=this.n0.activation*this.nf.dPreActivation,this.dWeight+=t*this.weight,e+=.5*t*this.weight*this.weight},n.applyGradient=function(t){this.weight-=t*this.dWeight},i.newFromData=function(t,e){var i=e.weight,n=t.layers[e.n0[0]].neurons[e.n0[1]],s=t.layers[e.nf[0]].neurons[e.nf[1]];return t.addLink(n,s,i)},n.toData=function(){var t={};return t.n0=[this.n0.layer.getIndex(),this.n0.getIndex()],t.nf=[this.nf.layer.getIndex(),this.nf.getIndex()],t.weight=this.weight,t},module.exports=i;
},{"./svg":"syvK","./Color":"snLP"}],"uZYY":[function(require,module,exports) {
var n=require("./svg"),e=require("./Neuron"),r=function(n){this.neuralNet=n,this.neurons=[]},t=r.prototype;t.redraw=function(){for(var n=0;n<this.neurons.length;n++){this.neurons[n].redraw()}},t.reset=function(){for(var n=0;n<this.neurons.length;n++){this.neurons[n].reset()}},t.addNeuron=function(n){null==n&&(n=.5);var r=new e(this,n);return this.neurons.push(r),this.neuralNet.neurons.push(r),this.neuralNet.svgNeurons.appendChild(r.svgElement),r},t.getNeuronAt=function(n){return this.neurons[n]},t.getNeuronCount=function(){return this.neurons.length},t.getIndex=function(){return this.neuralNet.layers.indexOf(this)},r.newFromData=function(n,r){for(var t=n.addLayer(),u=0;u<r.neurons.length;u++){r.neurons[u];e.newFromData(t,r)}return t},t.toData=function(){for(var n={neurons:[]},e=0;e<this.neurons.length;e++){var r=this.neurons[e];n.neurons.push(r.toData())}return n},module.exports=r;
},{"./svg":"syvK","./Neuron":"6klw"}],"7ZAw":[function(require,module,exports) {
var r=require("./svg"),n=require("./Neuron"),e=require("./Link"),s=require("./Layer"),t=function(){this.neurons=[],this.links=[],this.layers=[],this.svgElement=r.createElement("g"),this.svgLinks=r.createElement("g"),this.svgElement.appendChild(this.svgLinks),this.svgNeurons=r.createElement("g"),this.svgElement.appendChild(this.svgNeurons)},a=t.prototype;a.addLayer=function(r){null==r&&(r=0);var n=new s(this);this.layers.push(n);for(var e=0;e<r;e++)n.addNeuron();return n},a.addFullyConnectedLayer=function(r){var n=this.layers[this.layers.length-1];this.addLayer(r);for(var e=this.layers[this.layers.length-1],s=0;s<n.neurons.length;s++)for(var t=n.neurons[s],a=0;a<e.neurons.length;a++){var i=e.neurons[a];this.addLink(t,i)}},a.addLink=function(r,n,s){var t=new e(this,r,n,s);return r.links.push(t),n.backLinks.push(t),this.links.push(t),this.svgLinks.appendChild(t.svgElement),t},a.redraw=function(){for(var r=0;r<this.layers.length;r++){this.layers[r].redraw()}for(r=0;r<this.links.length;r++){this.links[r].redraw()}},a.reset=function(r){for(var n=0;n<this.layers.length;n++){this.layers[n].reset()}},a.randomizeParameters=function(){for(var r=0;r<this.links.length;r++){var n=this.links[r],e=2+4*Math.random();Math.random()<=.5&&(e*=-1),n.weight=e}for(r=0;r<this.neurons.length;r++){var s=this.neurons[r],t=1+2*Math.random();Math.random()<=.5&&(t*=-1),s.bias=t}},a.forward=function(r){for(var n=1;n<this.layers.length;n++)for(var e=this.layers[n],s=0;s<e.neurons.length;s++){e.neurons[s].forward()}},a.backward=function(r,n){regularizationError=0;for(var e=this.layers.length-1;e>=0;e--)for(var s=this.layers[e],t=0;t<s.neurons.length;t++){var a=s.neurons[t];regularizationError+=a.backward(n)}return this.applyGradient(r),regularizationError},a.applyGradient=function(r){for(var n=0;n<this.links.length;n++){this.links[n].applyGradient(r)}for(n=1;n<this.layers.length;n++)for(var e=this.layers[n],s=0;s<e.neurons.length;s++){e.neurons[s].applyGradient(r)}},t.newFromData=function(r){for(var n=new t,a=0;a<r.layers.length;a++){var i=r.layers[a];s.newFromData(n,i)}for(a=0;a<r.links.length;a++){var l=r.links[a];e.newFromData(n,l)}return n},a.toData=function(){for(var r={layers:[]},n=0;n<this.layers.length;n++){var e=this.layers[n];r.layers.push(e.toData())}r.links=[];for(n=0;n<this.links.length;n++){var s=this.links[n];r.links.push(s.toData())}return r},module.exports=t;
},{"./svg":"syvK","./Neuron":"6klw","./Link":"XgDy","./Layer":"uZYY"}],"mFEn":[function(require,module,exports) {
var t=require("./Color"),i=function(t,i,s,e){this.canvas=t,this.x=i,this.y=s,this.label=e,this.radius=5},s=i.prototype;s.redraw=function(){var i,s=this.canvas.ctx,e=this.canvas.domElement.width,a=this.canvas.domElement.height,h=(i=0==this.label?t.RED:t.BLUE).blend(t.BLACK,.6);s.beginPath(),s.fillStyle=i.toString(),s.strokeStyle=h.toString(),s.arc(this.x*e,this.y*a,this.radius,0,2*Math.PI),s.fill(),s.stroke()},module.exports=i;
},{"./Color":"snLP"}],"Uoid":[function(require,module,exports) {
var t=require("./Color"),e=require("./DataPoint"),a=function(){this.dataPoints=[];var t=this.domElement=document.createElement("canvas");t.width=250,t.height=250,this.ctx=t.getContext("2d"),this.width=50,this.height=50,this.pixelColors=[];for(var e=0;e<this.width;e++){this.pixelColors.push([]);for(var a=0;a<this.height;a++)this.pixelColors[e].push(0)}this.setUpDragBehavior()},i=a.prototype;i.addDataPoint=function(t,a,i){this.dataPoints.push(new e(this,t,a,i))},i.redraw=function(e){for(var a=this.ctx,i=this.domElement,n=i.width,r=i.height,h=this.width,s=this.height,o=0;o<h;o++)for(var d=0;d<s;d++){var l=e(o/h,d/s),g=t.LIGHT_RED.blend(t.LIGHT_BLUE,l);this.pixelColors[o][d]=g}var u=n/h,c=r/s,v=a.getImageData(0,0,n,r);a.clearRect(0,0,n,r);for(o=0;o<v.data.length/4;o++){var f=Math.floor(o/n),m=o%n,D=Math.floor(m/u),E=Math.floor(f/c);g=this.pixelColors[D][E];v.data[4*o]=Math.round(255*g.r),v.data[4*o+1]=Math.round(255*g.g),v.data[4*o+2]=Math.round(255*g.b),v.data[4*o+3]=255}a.putImageData(v,0,0);for(o=0;o<this.dataPoints.length;o++){this.dataPoints[o].redraw()}},i.computeCursor=function(t){var e,a,i=this.domElement.getBoundingClientRect();null==t.touches?(e=t.clientX,a=t.clientY):(e=t.touches[0].clientX,a=t.touches[0].clientY);var n={x:e-i.left,y:a-i.top};t.cursor=n},i.setUpDragBehavior=function(){var t=this.domElement;this.dragState=null,this.handleDragBegin=this.handleDragBegin.bind(this),t.addEventListener("touchstart",this.handleDragBegin),t.addEventListener("mousedown",this.handleDragBegin),this.handleDragProgress=this.handleDragProgress.bind(this),window.addEventListener("mousemove",this.handleDragProgress),window.addEventListener("touchmove",this.handleDragProgress),this.handleDragEnd=this.handleDragEnd.bind(this),window.addEventListener("mouseup",this.handleDragEnd),window.addEventListener("touchend",this.handleDragEnd),window.addEventListener("touchcancel",this.handleDragEnd)},i.handleDragBegin=function(t){t.preventDefault(),this.computeCursor(t);for(var e=0;e<this.dataPoints.length;e++){var a=this.dataPoints[e],i=t.cursor.x-a.x*this.domElement.width,n=t.cursor.y-a.y*this.domElement.height,r=a.radius;if(i*i+n*n<=r*r){this.dragState={dataPoint:a,offset:{x:i,y:n}};break}}},i.handleDragProgress=function(t){if(null!=this.dragState){this.computeCursor(t),t.preventDefault();var e=this.dragState.dataPoint,a=this.dragState.offset;e.x=(t.cursor.x-a.x)/this.domElement.width,e.y=(t.cursor.y-a.y)/this.domElement.height,e.x<0?e.x=0:e.x>1&&(e.x=1),e.y<0?e.y=0:e.y>1&&(e.y=1)}},i.handleDragEnd=function(t){if(null!=this.dragState){this.dragState.dataPoint;this.dragState=null}},a.newFromData=function(t){for(var e=new a,i=0;i<t.length;i++){var n=t[i];e.addDataPoint(n.x,n.y,n.label)}return e},i.toData=function(){for(var t=[],e=0;e<this.dataPoints.length;e++){var a=this.dataPoints[e];t.push({x:a.x,y:a.y,label:a.label})}return t},module.exports=a;
},{"./Color":"snLP","./DataPoint":"mFEn"}],"OYXG":[function(require,module,exports) {
var t=4,r=function(){var r=this.domElement=document.createElement("canvas");r.id="error-canvas",this.ctx=r.getContext("2d"),this.maxDataLength=r.width,this.data=[],this.topError=t},a=r.prototype;a.getMaxTotalError=function(){for(var t=0,r=0;r<this.data.length;r++){var a=this.data[r].totalError;a>t&&(t=a)}return t},a.update=function(r,a){this.data.length==this.maxDataLength&&this.data.shift();var o=r+a;this.data.push({dataError:r,regularizationError:a,totalError:o});var e=this.getMaxTotalError();this.topError=e>t?e:t,this.redraw()},a.redraw=function(){var t=this.ctx,r=this.domElement.width,a=this.domElement.height;t.clearRect(0,0,r,a);for(var o=1;o<this.data.length;o++){var e=this.data[o].totalError,h=o/(this.maxDataLength-1)*r,i=a*(1-e/this.topError);t.beginPath(),t.strokeStyle="rgb(255, 221, 78)",t.moveTo(h,a),t.lineTo(h,i),t.stroke()}},module.exports=r;
},{}],"xtFg":[function(require,module,exports) {
var e=require("./math"),t=require("./ErrorPlot"),r=function(e,r){var l;(this.domElement=document.createElement("div")).className="control-panel",this.rows=[],this.rowsByLabel={},l=this.addRow("full");var n=document.createElement("div");n.innerHTML="randomize network parameters",n.className="btn",l.cells[0].appendChild(n),n.addEventListener("click",function(){e.randomizeParameters()}),(l=this.addRow("slider","learning rate")).control.min=1,l.control.max=80,l.control.value=Math.round(100*r.learningRate),l.control.addEventListener("change",function(){r.learningRate=this.value/100}.bind(l.control)),(l=this.addRow("slider","regularization")).control.min=0,l.control.max=100,l.control.value=Math.round(1e6*r.regularization),l.control.addEventListener("change",function(){r.regularization=this.value/1e6}.bind(l.control)),(l=this.addRow("text","error")).control.className="formatted-number",l=this.addRow("full");var o=this.errorPlot=new t;l.cells[0].appendChild(o.domElement)},l=r.prototype;l.addCell=function(e){return cell=document.createElement("div"),cell.className="control-cell",e.appendChild(cell),e.cells.push(cell),cell},l.addRow=function(e,t){var r,l=document.createElement("div");if(l.cells=[],l.className="control-row",this.domElement.appendChild(l),this.rows.push(l),this.rowsByLabel[t]=l,"full"==e)(r=document.createElement("div")).className="control-cell-full",l.appendChild(r),l.cells.push(r);else{var n;switch((r=this.addCell(l)).innerHTML=t,r=this.addCell(l),e){case"slider":(n=document.createElement("input")).type="range";break;case"text":n=r}n!=r&&null!=n&&r.appendChild(n),l.control=n}return l},l.update=function(t){this.rowsByLabel.error.control.innerHTML=e.roundToString(t.totalError,10),this.errorPlot.update(t.dataError,t.regularizationError)},module.exports=r;
},{"./math":"xdyW","./ErrorPlot":"OYXG"}],"QHdL":[function(require,module,exports) {
module.exports={dataPoints:[{x:.08,y:.24,label:1},{x:.2,y:.27,label:1},{x:.05,y:.3,label:1},{x:.1,y:.1,label:1},{x:.4,y:.4,label:0},{x:.6,y:.4,label:0},{x:.65,y:.7,label:0},{x:.7,y:.3,label:0},{x:.35,y:.65,label:0},{x:.3,y:.5,label:0},{x:.7,y:.5,label:0},{x:.75,y:.55,label:0},{x:.7,y:.6,label:0},{x:.65,y:.34,label:0},{x:.8,y:.65,label:0},{x:.5,y:.7,label:0},{x:.5,y:.66,label:0},{x:.56,y:.66,label:0},{x:.46,y:.36,label:0},{x:.46,y:.26,label:0},{x:.36,y:.26,label:0},{x:.26,y:.36,label:0},{x:.56,y:.28,label:0},{x:.33,y:.54,label:0},{x:.23,y:.52,label:0},{x:.26,y:.16,label:1},{x:.06,y:.46,label:1},{x:.13,y:.66,label:1},{x:.2,y:.8,label:1},{x:.5,y:.5,label:1},{x:.45,y:.5,label:1},{x:.5,y:.45,label:1},{x:.45,y:.45,label:1},{x:.55,y:.55,label:1},{x:.5,y:.55,label:1},{x:.5,y:.2,label:1},{x:.4,y:.1,label:1},{x:.6,y:.1,label:1},{x:.75,y:.15,label:1},{x:.88,y:.22,label:1},{x:.9,y:.35,label:1},{x:.9,y:.49,label:1},{x:.88,y:.62,label:1},{x:.9,y:.9,label:1},{x:.9,y:.8,label:1},{x:.75,y:.85,label:1},{x:.55,y:.92,label:1},{x:.6,y:.95,label:1},{x:.06,y:.57,label:1},{x:.09,y:.8,label:1},{x:.4,y:.9,label:1}],neuralNet:{layers:[{neurons:[{bias:.5},{bias:.5}]},{neurons:[{bias:.5},{bias:.5},{bias:.5},{bias:.5},{bias:.5}]},{neurons:[{bias:.5},{bias:.5},{bias:.5},{bias:.5},{bias:.5}]},{neurons:[{bias:.5},{bias:.5}]},{neurons:[{bias:.5}]}],links:[{n0:[0,0],nf:[1,0],weight:2.2559318523672673},{n0:[0,0],nf:[1,1],weight:3.7705902078344162},{n0:[0,0],nf:[1,2],weight:-5.673868837964195},{n0:[0,0],nf:[1,3],weight:-2.552116396138559},{n0:[0,0],nf:[1,4],weight:-4.765897189158554},{n0:[0,1],nf:[1,0],weight:2.522847383501193},{n0:[0,1],nf:[1,1],weight:-2.9902303588384505},{n0:[0,1],nf:[1,2],weight:2.749623598598969},{n0:[0,1],nf:[1,3],weight:-2.0657459601688077},{n0:[0,1],nf:[1,4],weight:2.311040191441733},{n0:[1,0],nf:[2,0],weight:-2.8083933750840506},{n0:[1,0],nf:[2,1],weight:2.368208438212055},{n0:[1,0],nf:[2,2],weight:2.792010178964303},{n0:[1,0],nf:[2,3],weight:2.1204797088106764},{n0:[1,0],nf:[2,4],weight:3.0855603411983634},{n0:[1,1],nf:[2,0],weight:-2.1619760012233913},{n0:[1,1],nf:[2,1],weight:2.7735676578848043},{n0:[1,1],nf:[2,2],weight:-4.795321974592097},{n0:[1,1],nf:[2,3],weight:-3.1618858651724424},{n0:[1,1],nf:[2,4],weight:2.642537468325151},{n0:[1,2],nf:[2,0],weight:5.111269168104936},{n0:[1,2],nf:[2,1],weight:1.8060793114773712},{n0:[1,2],nf:[2,2],weight:1.2874475479043777},{n0:[1,2],nf:[2,3],weight:3.715659708889894},{n0:[1,2],nf:[2,4],weight:-5.479057778095251},{n0:[1,3],nf:[2,0],weight:4.279970838297447},{n0:[1,3],nf:[2,1],weight:-3.8573191202934085},{n0:[1,3],nf:[2,2],weight:-4.346636276004062},{n0:[1,3],nf:[2,3],weight:1.8026421918582567},{n0:[1,3],nf:[2,4],weight:3.9687935202147346},{n0:[1,4],nf:[2,0],weight:-3.5216391228147197},{n0:[1,4],nf:[2,1],weight:4.599458665307638},{n0:[1,4],nf:[2,2],weight:-4.752572287153145},{n0:[1,4],nf:[2,3],weight:-3.810827524569661},{n0:[1,4],nf:[2,4],weight:3.0650028924296953},{n0:[2,0],nf:[3,0],weight:-4.300364295192499},{n0:[2,0],nf:[3,1],weight:-2.9036061692080217},{n0:[2,1],nf:[3,0],weight:4.132576329093505},{n0:[2,1],nf:[3,1],weight:-3.817976850598705},{n0:[2,2],nf:[3,0],weight:4.606542085589321},{n0:[2,2],nf:[3,1],weight:2.8220313920923323},{n0:[2,3],nf:[3,0],weight:2.3423002019828885},{n0:[2,3],nf:[3,1],weight:2.098573708791525},{n0:[2,4],nf:[3,0],weight:4.4760505444141625},{n0:[2,4],nf:[3,1],weight:3.95752484391276},{n0:[3,0],nf:[4,0],weight:-.7265226578414495},{n0:[3,1],nf:[4,0],weight:-4.316679309853457}]}};
},{}],"d6sW":[function(require,module,exports) {
var a=require("./NeuralNet"),e=require("./DataCanvas"),n=require("./ControlPanel"),t=require("./svg");function r(){var r=require("./data");controllableParameters={learningRate:.2,regularization:9e-6};var o,i=document.createElement("div");i.className="content-container",document.body.appendChild(i),o=document.createElement("div"),i.appendChild(o),o.className="content-container-row";var d=t.createElement("svg");d.className="content-container-cell",d.id="neural-net",o.appendChild(d),neuralNet=a.newFromData(r.neuralNet),d.appendChild(neuralNet.svgElement),dataCanvas=e.newFromData(r.dataPoints),dataCanvas.domElement.className+=" content-container-cell",dataCanvas.domElement.id="data-canvas",o.appendChild(dataCanvas.domElement),o=document.createElement("div"),i.appendChild(o),o.className="content-container-row",controlPanel=new n(neuralNet,controllableParameters),controlPanel.domElement.className+=" content-container-cell",o.appendChild(controlPanel.domElement),l()}function l(){for(var a=0;a<10;a++)for(var e,n=0,t=0;t<dataCanvas.dataPoints.length;t++){neuralNet.reset();var r=dataCanvas.dataPoints[t];neuralNet.layers[0].neurons[0].activation=r.x,neuralNet.layers[0].neurons[1].activation=r.y,neuralNet.forward();var o=neuralNet.layers[neuralNet.layers.length-1].neurons[0],i=o.activation,d=r.label-i;n+=.5*d*d,o.dActivation=-d,e=neuralNet.backward(controllableParameters.learningRate,controllableParameters.regularization)}neuralNet.redraw(),dataCanvas.redraw(function(a,e){return neuralNet.layers[0].neurons[0].activation=a,neuralNet.layers[0].neurons[1].activation=e,neuralNet.forward(),neuralNet.layers[neuralNet.layers.length-1].neurons[0].activation}),controlPanel.update({totalError:n+e,dataError:n,regularizationError:e}),requestAnimationFrame(l)}function o(){return{dataPoints:dataCanvas.toData(),neuralNet:neuralNet.toData()}}window.neuralNet,window.dataCanvas,window.controllableParameters,window.controlPanel,window.getData=o,r();
},{"./NeuralNet":"7ZAw","./DataCanvas":"Uoid","./ControlPanel":"xtFg","./svg":"syvK","./data":"QHdL"}]},{},["d6sW"], null)
//# sourceMappingURL=main.0fb4c836.map