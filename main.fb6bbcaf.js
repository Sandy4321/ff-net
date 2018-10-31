// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"js/svg.js":[function(require,module,exports) {
var svg = {};

svg.createElement = function (element) {
  return document.createElementNS("http://www.w3.org/2000/svg", element);
};

module.exports = svg;
},{}],"js/math.js":[function(require,module,exports) {
var math = {};

math.roundToString = function (n, decimalDigits) {
  var factor = 1;

  for (var i = 0; i < decimalDigits; i++) {
    factor *= 10;
  }

  var str = (Math.round(n * factor) / factor).toString();
  if (decimalDigits == 0) return str;
  var dotPosition = str.indexOf(".");

  if (dotPosition === -1) {
    dotPosition = str.length;
    str += ".0";
  }

  for (var i = str.length - dotPosition - 1; i < decimalDigits; i++) {
    str += "0";
  }

  return str;
};

math.sigmoid = function (n) {
  return 1 / (1 + Math.exp(-n));
};

math.dSigmoid = function (n) {
  return math.sigmoid(n) * (1 - math.sigmoid(n));
};

module.exports = math;
},{}],"js/Color.js":[function(require,module,exports) {
// r, g, b, a are numbers between 0 and 1
var Color = function Color(r, g, b, a) {
  if (a == null) a = 1;
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};

Color.WHITE = new Color(1, 1, 1);
Color.BLACK = new Color(0, 0, 0);
Color.RED = new Color(226 / 255, 86 / 255, 86 / 255);
Color.BLUE = new Color(135 / 255, 173 / 255, 236 / 255);
Color.LIGHT_BLUE = new Color(186 / 255, 224 / 255, 251 / 255);
Color.LIGHT_RED = new Color(252 / 255, 163 / 255, 163 / 255);
var p = Color.prototype; // t = 1 means replace this with color c

p.blend = function (c, t) {
  if (Math.abs(t) > 1) throw "t must be a number between -1 and 1";
  var source, target;

  if (t >= 0) {
    source = this;
    target = c;
  } else {
    source = c;
    target = this;
  }

  return new Color(source.r * (1 - t) + target.r * t, source.g * (1 - t) + target.g * t, source.b * (1 - t) + target.b * t);
};

p.toString = function () {
  return "rgba(" + Math.floor(255 * this.r) + ", " + Math.floor(255 * this.g) + ", " + Math.floor(255 * this.b) + ", " + this.a + ")";
};

module.exports = Color;
},{}],"js/Neuron.js":[function(require,module,exports) {
var svg = require("./svg");

var math = require("./math");

var Color = require("./Color");

var radius = 12;
var strokeWidth = 2;

var Neuron = function Neuron(layer, bias) {
  this.layer = layer;
  this.links = [];
  this.backLinks = [];
  this.bias = bias;
  this.preActivation = 0;
  this.activation = math.sigmoid(this.bias);
  this.dActivation = 0;
  this.dPreActivation = 0;
  this.dBias = 0;
  this.isInput = false;
  this.isOutput = false;
  var svgElement = this.svgElement = svg.createElement("circle");
  svgElement.setAttribute("r", radius);
};

var p = Neuron.prototype;

p.redraw = function () {
  var circle = this.svgElement;
  var position = this.getPosition();
  circle.setAttribute("cx", position.x);
  circle.setAttribute("cy", position.y);
  var maxVisibleBias = 3;
  var bias = this.bias;
  var tFillColor;
  if (bias < -maxVisibleBias) bias = -maxVisibleBias;else if (bias > maxVisibleBias) bias = maxVisibleBias;
  tFillColor = (bias / maxVisibleBias + 1) * 0.5;
  var fillColor = Color.RED.blend(Color.BLUE, tFillColor);
  var strokeColor = fillColor.blend(Color.BLACK, 0.3);
  circle.setAttribute("fill", fillColor.toString());
  circle.setAttribute("stroke", strokeColor.toString());
  circle.setAttribute("stroke-width", strokeWidth);
};

p.getIndex = function () {
  return this.layer.neurons.indexOf(this);
};

p.getPosition = function () {
  var neuralNet = this.layer.neuralNet;
  var neuronCount = this.layer.neurons.length;
  var layerCount = neuralNet.layers.length;
  var maxNeuronCountPerLayer = 5;
  var container = neuralNet.svgElement.parentNode;
  if (container == null) return {
    x: 0,
    y: 0
  };
  var containerRect = container.getBoundingClientRect();
  var width = containerRect.width;
  var height = containerRect.height;
  var cy = height / 2;
  var cx = width / 2;
  var dx = (width - (radius + strokeWidth) * 2) / (layerCount - 1);
  var dy = (height - (radius + strokeWidth) * 2) / (maxNeuronCountPerLayer - 1);
  var x = cx + (this.layer.getIndex() - (layerCount - 1) / 2) * dx;
  var y;

  if (neuronCount == 0) {
    y = cy;
  } else {
    y = cy + (this.getIndex() - (neuronCount - 1) / 2) * dy;
  }

  return {
    x: x,
    y: y
  };
};

p.forward = function () {
  this.preActivation = 0;
  this.preActivation += this.bias;

  for (var i = 0; i < this.backLinks.length; i++) {
    var link = this.backLinks[i];
    this.preActivation += link.weight * link.n0.activation;
  }

  this.activation = math.sigmoid(this.preActivation);
};

p.backward = function (regularization) {
  var regularizationError = 0;

  for (var i = 0; i < this.links.length; i++) {
    var link = this.links[i];
    this.dActivation += link.weight * link.dWeight;
  }

  this.dPreActivation = this.dActivation * math.dSigmoid(this.preActivation);
  this.dBias = this.dPreActivation;

  for (var i = 0; i < this.backLinks.length; i++) {
    var link = this.backLinks[i];
    regularizationError += link.backward(regularization);
  }

  return regularizationError;
};

p.applyGradient = function (learningRate) {
  this.bias -= learningRate * this.dBias;
};

p.reset = function () {
  this.preActivation = 0;
  this.activation = math.sigmoid(this.bias);
  this.dActivation = 0;
  this.dPreActivation = 0;
  this.dBias = 0;
};

Neuron.newFromData = function (layer, data) {
  layer.addNeuron(data.bias);
};

p.toData = function () {
  var data = {};
  data.bias = this.bias;
  return data;
};

module.exports = Neuron;
},{"./svg":"js/svg.js","./math":"js/math.js","./Color":"js/Color.js"}],"js/Link.js":[function(require,module,exports) {
var svg = require("./svg");

var Color = require("./Color");

var Link = function Link(neuralNet, n0, nf, weight) {
  this.neuralNet = neuralNet;
  this.n0 = n0;
  this.nf = nf;

  if (this.n0.layer.getIndex() + 1 != this.nf.layer.getIndex()) {
    throw "Cannot connect neurons from non-consecutive layers";
  }

  if (weight == null) this.weight = 1;else this.weight = weight;
  this.dWeight = 0;
  this.svgElement = svg.createElement("path");
  this.redraw();
};

var p = Link.prototype;

p.redraw = function () {
  var path = this.svgElement;
  var p0 = this.n0.getPosition();
  var pf = this.nf.getPosition();
  path.setAttribute("d", "M" + p0.x + " " + p0.y + " " + "L" + pf.x + " " + pf.y);
  var maxVisibleWeight = 5;
  var width = 9 * Math.min(1, Math.abs(this.weight) / maxVisibleWeight);
  path.setAttribute("stroke-width", width);
  var color;
  if (this.weight < 0) color = Color.RED;else color = Color.BLUE;
  path.setAttribute("stroke-opacity", 0.4);
  path.setAttribute("stroke", color);
};

p.backward = function (regularization) {
  var regularizationError = 0;
  this.dWeight = this.n0.activation * this.nf.dPreActivation; // regularization error = 0.5 * regularization * weight^2

  this.dWeight += regularization * this.weight;
  regularizationError += 0.5 * regularization * this.weight * this.weight;
  return regularizationError;
};

p.applyGradient = function (learningRate) {
  this.weight -= learningRate * this.dWeight;
};

Link.newFromData = function (neuralNet, data) {
  var weight = data.weight;
  var n0 = neuralNet.layers[data.n0[0]].neurons[data.n0[1]];
  var nf = neuralNet.layers[data.nf[0]].neurons[data.nf[1]];
  var link = neuralNet.addLink(n0, nf, weight);
  return link;
};

p.toData = function () {
  var data = {};
  data.n0 = [this.n0.layer.getIndex(), this.n0.getIndex()];
  data.nf = [this.nf.layer.getIndex(), this.nf.getIndex()];
  data.weight = this.weight;
  return data;
};

module.exports = Link;
},{"./svg":"js/svg.js","./Color":"js/Color.js"}],"js/Layer.js":[function(require,module,exports) {
var svg = require("./svg");

var Neuron = require("./Neuron");

var Layer = function Layer(neuralNet) {
  this.neuralNet = neuralNet;
  this.neurons = [];
};

var p = Layer.prototype;

p.redraw = function () {
  for (var i = 0; i < this.neurons.length; i++) {
    var neuron = this.neurons[i];
    neuron.redraw();
  }
};

p.reset = function () {
  for (var i = 0; i < this.neurons.length; i++) {
    var neuron = this.neurons[i];
    neuron.reset();
  }
};

p.addNeuron = function (bias) {
  if (bias == null) bias = 0.5;
  var neuron = new Neuron(this, bias);
  this.neurons.push(neuron);
  this.neuralNet.neurons.push(neuron);
  this.neuralNet.svgNeurons.appendChild(neuron.svgElement);
  return neuron;
};

p.getNeuronAt = function (i) {
  return this.neurons[i];
};

p.getNeuronCount = function () {
  return this.neurons.length;
};

p.getIndex = function () {
  return this.neuralNet.layers.indexOf(this);
};

Layer.newFromData = function (neuralNet, data) {
  var layer = neuralNet.addLayer();

  for (var i = 0; i < data.neurons.length; i++) {
    var neuronData = data.neurons[i];
    Neuron.newFromData(layer, data);
  }

  return layer;
};

p.toData = function () {
  var data = {};
  data.neurons = [];

  for (var i = 0; i < this.neurons.length; i++) {
    var neuron = this.neurons[i];
    data.neurons.push(neuron.toData());
  }

  return data;
};

module.exports = Layer;
},{"./svg":"js/svg.js","./Neuron":"js/Neuron.js"}],"js/NeuralNet.js":[function(require,module,exports) {
var svg = require("./svg");

var Neuron = require("./Neuron");

var Link = require("./Link");

var Layer = require("./Layer");

var NeuralNet = function NeuralNet() {
  this.neurons = [];
  this.links = [];
  this.layers = [];
  this.svgElement = svg.createElement("g");
  this.svgLinks = svg.createElement("g");
  this.svgElement.appendChild(this.svgLinks);
  this.svgNeurons = svg.createElement("g");
  this.svgElement.appendChild(this.svgNeurons);
};

var p = NeuralNet.prototype;

p.addLayer = function (neuronCount) {
  if (neuronCount == null) neuronCount = 0;
  var layer = new Layer(this);
  this.layers.push(layer);

  for (var i = 0; i < neuronCount; i++) {
    var neuron = layer.addNeuron();
  }

  return layer;
};

p.addFullyConnectedLayer = function (neuronCount) {
  var l0 = this.layers[this.layers.length - 1];
  this.addLayer(neuronCount);
  var lf = this.layers[this.layers.length - 1];

  for (var i = 0; i < l0.neurons.length; i++) {
    var n0 = l0.neurons[i];

    for (var j = 0; j < lf.neurons.length; j++) {
      var nf = lf.neurons[j];
      this.addLink(n0, nf);
    }
  }
};

p.addLink = function (n0, nf, weight) {
  var link = new Link(this, n0, nf, weight);
  n0.links.push(link);
  nf.backLinks.push(link);
  this.links.push(link);
  this.svgLinks.appendChild(link.svgElement);
  return link;
};

p.redraw = function () {
  for (var i = 0; i < this.layers.length; i++) {
    var layer = this.layers[i];
    layer.redraw();
  }

  for (var i = 0; i < this.links.length; i++) {
    var link = this.links[i];
    link.redraw();
  }
};

p.reset = function (input) {
  for (var i = 0; i < this.layers.length; i++) {
    var layer = this.layers[i];
    layer.reset();
  }
};

p.randomizeParameters = function () {
  for (var i = 0; i < this.links.length; i++) {
    var link = this.links[i];
    var weight = 2 + Math.random() * 4;
    if (Math.random() <= 0.5) weight *= -1;
    link.weight = weight;
  }

  for (var i = 0; i < this.neurons.length; i++) {
    var neuron = this.neurons[i];
    var bias = 1 + Math.random() * 2;
    if (Math.random() <= 0.5) bias *= -1;
    neuron.bias = bias;
  }
};

p.forward = function (input) {
  for (var i = 1; i < this.layers.length; i++) {
    var layer = this.layers[i];

    for (var j = 0; j < layer.neurons.length; j++) {
      var neuron = layer.neurons[j];
      neuron.forward();
    }
  }
};

p.backward = function (learningRate, regularization) {
  regularizationError = 0;

  for (var i = this.layers.length - 1; i >= 0; i--) {
    var layer = this.layers[i];

    for (var j = 0; j < layer.neurons.length; j++) {
      var neuron = layer.neurons[j];
      regularizationError += neuron.backward(regularization);
    }
  }

  this.applyGradient(learningRate);
  return regularizationError;
};

p.applyGradient = function (learningRate) {
  for (var i = 0; i < this.links.length; i++) {
    var link = this.links[i];
    link.applyGradient(learningRate);
  }

  for (var i = 1; i < this.layers.length; i++) {
    var layer = this.layers[i];

    for (var j = 0; j < layer.neurons.length; j++) {
      var neuron = layer.neurons[j];
      neuron.applyGradient(learningRate);
    }
  }
};

NeuralNet.newFromData = function (data) {
  var neuralNet = new NeuralNet();

  for (var i = 0; i < data.layers.length; i++) {
    var layerData = data.layers[i];
    Layer.newFromData(neuralNet, layerData);
  }

  for (var i = 0; i < data.links.length; i++) {
    var linkData = data.links[i];
    Link.newFromData(neuralNet, linkData);
  }

  return neuralNet;
};

p.toData = function () {
  var data = {};
  data.layers = [];

  for (var i = 0; i < this.layers.length; i++) {
    var layer = this.layers[i];
    data.layers.push(layer.toData());
  }

  data.links = [];

  for (var i = 0; i < this.links.length; i++) {
    var link = this.links[i];
    data.links.push(link.toData());
  }

  return data;
};

module.exports = NeuralNet;
},{"./svg":"js/svg.js","./Neuron":"js/Neuron.js","./Link":"js/Link.js","./Layer":"js/Layer.js"}],"js/DataPoint.js":[function(require,module,exports) {
var Color = require("./Color");

var DataPoint = function DataPoint(canvas, x, y, label) {
  this.canvas = canvas;
  this.x = x;
  this.y = y;
  this.label = label;
  this.radius = 5;
};

var p = DataPoint.prototype;

p.redraw = function () {
  var ctx = this.canvas.ctx;
  var width = this.canvas.domElement.width;
  var height = this.canvas.domElement.height;
  var fillColor;
  if (this.label == 0) fillColor = Color.RED;else fillColor = Color.BLUE;
  var strokeColor = fillColor.blend(Color.BLACK, 0.6);
  ctx.beginPath();
  ctx.fillStyle = fillColor.toString();
  ctx.strokeStyle = strokeColor.toString();
  ctx.arc(this.x * width, this.y * height, this.radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
};

module.exports = DataPoint;
},{"./Color":"js/Color.js"}],"js/DataCanvas.js":[function(require,module,exports) {
var Color = require("./Color");

var DataPoint = require("./DataPoint");

var DataCanvas = function DataCanvas() {
  this.dataPoints = [];
  var canvas = this.domElement = document.createElement("canvas");
  canvas.width = 250;
  canvas.height = 250;
  this.ctx = canvas.getContext("2d");
  this.width = 50;
  this.height = 50;
  this.pixelColors = [];

  for (var i = 0; i < this.width; i++) {
    this.pixelColors.push([]);

    for (var j = 0; j < this.height; j++) {
      this.pixelColors[i].push(0);
    }
  }

  this.setUpDragBehavior();
};

var p = DataCanvas.prototype;

p.addDataPoint = function (x, y, label) {
  this.dataPoints.push(new DataPoint(this, x, y, label));
};

p.redraw = function (classify) {
  var ctx = this.ctx;
  var canvas = this.domElement;
  var canvasWidth = canvas.width;
  var canvasHeight = canvas.height;
  var width = this.width;
  var height = this.height;

  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      var label = classify(i / width, j / height);
      var color = Color.LIGHT_RED.blend(Color.LIGHT_BLUE, label);
      this.pixelColors[i][j] = color;
    }
  }

  var fWidth = canvasWidth / width;
  var fHeight = canvasHeight / height;
  var canvasImageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  for (var i = 0; i < canvasImageData.data.length / 4; i++) {
    var y = Math.floor(i / canvasWidth);
    var x = i % canvasWidth;
    var ii = Math.floor(x / fWidth);
    var jj = Math.floor(y / fHeight);
    var color = this.pixelColors[ii][jj];
    canvasImageData.data[4 * i] = Math.round(color.r * 255);
    canvasImageData.data[4 * i + 1] = Math.round(color.g * 255);
    canvasImageData.data[4 * i + 2] = Math.round(color.b * 255);
    canvasImageData.data[4 * i + 3] = 255;
  }

  ctx.putImageData(canvasImageData, 0, 0);

  for (var i = 0; i < this.dataPoints.length; i++) {
    var dataPoint = this.dataPoints[i];
    dataPoint.redraw();
  }
};

p.computeCursor = function (event) {
  var rect = this.domElement.getBoundingClientRect();
  var clientX, clientY;

  if (event.touches == null) {
    clientX = event.clientX;
    clientY = event.clientY;
  } else {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  }

  var left = clientX - rect.left;
  var top = clientY - rect.top;
  var cursor = {
    x: left,
    y: top
  };
  event.cursor = cursor;
};

p.setUpDragBehavior = function () {
  var canvas = this.domElement;
  this.dragState = null;
  this.handleDragBegin = this.handleDragBegin.bind(this);
  canvas.addEventListener("touchstart", this.handleDragBegin);
  canvas.addEventListener("mousedown", this.handleDragBegin);
  this.handleDragProgress = this.handleDragProgress.bind(this);
  window.addEventListener("mousemove", this.handleDragProgress);
  window.addEventListener("touchmove", this.handleDragProgress);
  this.handleDragEnd = this.handleDragEnd.bind(this);
  window.addEventListener("mouseup", this.handleDragEnd);
  window.addEventListener("touchend", this.handleDragEnd);
  window.addEventListener("touchcancel", this.handleDragEnd);
};

p.handleDragBegin = function (event) {
  event.preventDefault();
  this.computeCursor(event);

  for (var i = 0; i < this.dataPoints.length; i++) {
    var dataPoint = this.dataPoints[i];
    var dx = event.cursor.x - dataPoint.x * this.domElement.width;
    var dy = event.cursor.y - dataPoint.y * this.domElement.height;
    var r = dataPoint.radius;

    if (dx * dx + dy * dy <= r * r) {
      this.dragState = {
        dataPoint: dataPoint,
        offset: {
          x: dx,
          y: dy
        }
      };
      break;
    }
  }
};

p.handleDragProgress = function (event) {
  if (this.dragState == null) return;
  this.computeCursor(event);
  event.preventDefault();
  var dataPoint = this.dragState.dataPoint;
  var offset = this.dragState.offset;
  dataPoint.x = (event.cursor.x - offset.x) / this.domElement.width;
  dataPoint.y = (event.cursor.y - offset.y) / this.domElement.height;
  if (dataPoint.x < 0) dataPoint.x = 0;else if (dataPoint.x > 1) dataPoint.x = 1;
  if (dataPoint.y < 0) dataPoint.y = 0;else if (dataPoint.y > 1) dataPoint.y = 1;
};

p.handleDragEnd = function (event) {
  if (this.dragState == null) return;
  var dataPoint = this.dragState.dataPoint;
  this.dragState = null;
};

DataCanvas.newFromData = function (data) {
  var dataCanvas = new DataCanvas();

  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    dataCanvas.addDataPoint(item.x, item.y, item.label);
  }

  return dataCanvas;
};

p.toData = function () {
  var data = [];

  for (var i = 0; i < this.dataPoints.length; i++) {
    var dataPoint = this.dataPoints[i];
    data.push({
      x: dataPoint.x,
      y: dataPoint.y,
      label: dataPoint.label
    });
  }

  return data;
};

module.exports = DataCanvas;
},{"./Color":"js/Color.js","./DataPoint":"js/DataPoint.js"}],"js/ErrorPlot.js":[function(require,module,exports) {
var minTopError = 4;

var ErrorPlot = function ErrorPlot() {
  var canvas = this.domElement = document.createElement("canvas");
  canvas.id = "error-canvas";
  this.ctx = canvas.getContext("2d");
  this.maxDataLength = canvas.width;
  this.data = [];
  this.topError = minTopError;
};

var p = ErrorPlot.prototype;

p.getMaxTotalError = function () {
  var max = 0;

  for (var i = 0; i < this.data.length; i++) {
    var item = this.data[i];
    var totalError = item.totalError;
    if (totalError > max) max = totalError;
  }

  return max;
};

p.update = function (dataError, regularizationError) {
  if (this.data.length == this.maxDataLength) {
    this.data.shift();
  }

  var totalError = dataError + regularizationError;
  this.data.push({
    dataError: dataError,
    regularizationError: regularizationError,
    totalError: totalError
  });
  var maxTotalError = this.getMaxTotalError();
  if (maxTotalError > minTopError) this.topError = maxTotalError;else this.topError = minTopError;
  this.redraw();
};

p.redraw = function () {
  var ctx = this.ctx;
  var width = this.domElement.width;
  var height = this.domElement.height;
  ctx.clearRect(0, 0, width, height);

  for (var i = 1; i < this.data.length; i++) {
    var item = this.data[i];
    var totalError = item.totalError;
    var x = i / (this.maxDataLength - 1) * width;
    var y = height * (1 - totalError / this.topError);
    ctx.beginPath();
    ctx.strokeStyle = "rgb(255, 221, 78)";
    ctx.moveTo(x, height);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
};

module.exports = ErrorPlot;
},{}],"js/ControlPanel.js":[function(require,module,exports) {
var math = require("./math");

var ErrorPlot = require("./ErrorPlot");

var ControlPanel = function ControlPanel(neuralNet, controllableParameters) {
  var div = this.domElement = document.createElement("div");
  div.className = "control-panel";
  this.rows = [];
  this.rowsByLabel = {};
  var row;
  row = this.addRow("full");
  var btnRandomize = document.createElement("div");
  btnRandomize.innerHTML = "randomize network parameters";
  btnRandomize.className = "btn";
  row.cells[0].appendChild(btnRandomize);
  btnRandomize.addEventListener("click", function () {
    neuralNet.randomizeParameters();
  });
  row = this.addRow("slider", "learning rate");
  row.control.min = 1;
  row.control.max = 80;
  row.control.value = Math.round(controllableParameters.learningRate * 100);
  row.control.addEventListener("change", function () {
    controllableParameters.learningRate = this.value / 100;
  }.bind(row.control));
  row = this.addRow("slider", "regularization");
  row.control.min = 0;
  row.control.max = 100;
  row.control.value = Math.round(controllableParameters.regularization * 1000000);
  row.control.addEventListener("change", function () {
    controllableParameters.regularization = this.value / 1000000;
  }.bind(row.control));
  row = this.addRow("text", "error");
  row.control.className = "formatted-number";
  row = this.addRow("full");
  var errorPlot = this.errorPlot = new ErrorPlot();
  row.cells[0].appendChild(errorPlot.domElement);
};

var p = ControlPanel.prototype;

p.addCell = function (row) {
  cell = document.createElement("div");
  cell.className = "control-cell";
  row.appendChild(cell);
  row.cells.push(cell);
  return cell;
};

p.addRow = function (type, label) {
  var row = document.createElement("div");
  row.cells = [];
  row.className = "control-row";
  this.domElement.appendChild(row);
  this.rows.push(row);
  this.rowsByLabel[label] = row;
  var cell;

  if (type == "full") {
    cell = document.createElement("div");
    cell.className = "control-cell-full";
    row.appendChild(cell);
    row.cells.push(cell);
  } else {
    cell = this.addCell(row);
    cell.innerHTML = label;
    cell = this.addCell(row);
    var control;

    switch (type) {
      case "slider":
        control = document.createElement("input");
        control.type = "range";
        break;

      case "text":
        control = cell;
        break;
        break;
    }

    if (control != cell && control != null) cell.appendChild(control);
    row.control = control;
  }

  return row;
};

p.update = function (data) {
  this.rowsByLabel["error"].control.innerHTML = math.roundToString(data.totalError, 10);
  this.errorPlot.update(data.dataError, data.regularizationError);
};

module.exports = ControlPanel;
},{"./math":"js/math.js","./ErrorPlot":"js/ErrorPlot.js"}],"js/data.js":[function(require,module,exports) {
module.exports = {
  "dataPoints": [{
    "x": 0.08,
    "y": 0.24,
    "label": 1
  }, {
    "x": 0.2,
    "y": 0.27,
    "label": 1
  }, {
    "x": 0.05,
    "y": 0.3,
    "label": 1
  }, {
    "x": 0.1,
    "y": 0.1,
    "label": 1
  }, {
    "x": 0.4,
    "y": 0.4,
    "label": 0
  }, {
    "x": 0.6,
    "y": 0.4,
    "label": 0
  }, {
    "x": 0.65,
    "y": 0.7,
    "label": 0
  }, {
    "x": 0.7,
    "y": 0.3,
    "label": 0
  }, {
    "x": 0.35,
    "y": 0.65,
    "label": 0
  }, {
    "x": 0.3,
    "y": 0.5,
    "label": 0
  }, {
    "x": 0.7,
    "y": 0.5,
    "label": 0
  }, {
    "x": 0.75,
    "y": 0.55,
    "label": 0
  }, {
    "x": 0.7,
    "y": 0.6,
    "label": 0
  }, {
    "x": 0.65,
    "y": 0.34,
    "label": 0
  }, {
    "x": 0.8,
    "y": 0.65,
    "label": 0
  }, {
    "x": 0.5,
    "y": 0.7,
    "label": 0
  }, {
    "x": 0.5,
    "y": 0.66,
    "label": 0
  }, {
    "x": 0.56,
    "y": 0.66,
    "label": 0
  }, {
    "x": 0.46,
    "y": 0.36,
    "label": 0
  }, {
    "x": 0.46,
    "y": 0.26,
    "label": 0
  }, {
    "x": 0.36,
    "y": 0.26,
    "label": 0
  }, {
    "x": 0.26,
    "y": 0.36,
    "label": 0
  }, {
    "x": 0.56,
    "y": 0.28,
    "label": 0
  }, {
    "x": 0.33,
    "y": 0.54,
    "label": 0
  }, {
    "x": 0.23,
    "y": 0.52,
    "label": 0
  }, {
    "x": 0.26,
    "y": 0.16,
    "label": 1
  }, {
    "x": 0.06,
    "y": 0.46,
    "label": 1
  }, {
    "x": 0.13,
    "y": 0.66,
    "label": 1
  }, {
    "x": 0.2,
    "y": 0.8,
    "label": 1
  }, {
    "x": 0.5,
    "y": 0.5,
    "label": 1
  }, {
    "x": 0.45,
    "y": 0.5,
    "label": 1
  }, {
    "x": 0.5,
    "y": 0.45,
    "label": 1
  }, {
    "x": 0.45,
    "y": 0.45,
    "label": 1
  }, {
    "x": 0.55,
    "y": 0.55,
    "label": 1
  }, {
    "x": 0.5,
    "y": 0.55,
    "label": 1
  }, {
    "x": 0.5,
    "y": 0.2,
    "label": 1
  }, {
    "x": 0.4,
    "y": 0.1,
    "label": 1
  }, {
    "x": 0.6,
    "y": 0.1,
    "label": 1
  }, {
    "x": 0.75,
    "y": 0.15,
    "label": 1
  }, {
    "x": 0.88,
    "y": 0.22,
    "label": 1
  }, {
    "x": 0.9,
    "y": 0.35,
    "label": 1
  }, {
    "x": 0.9,
    "y": 0.49,
    "label": 1
  }, {
    "x": 0.88,
    "y": 0.62,
    "label": 1
  }, {
    "x": 0.9,
    "y": 0.9,
    "label": 1
  }, {
    "x": 0.9,
    "y": 0.8,
    "label": 1
  }, {
    "x": 0.75,
    "y": 0.85,
    "label": 1
  }, {
    "x": 0.55,
    "y": 0.92,
    "label": 1
  }, {
    "x": 0.6,
    "y": 0.95,
    "label": 1
  }, {
    "x": 0.06,
    "y": 0.57,
    "label": 1
  }, {
    "x": 0.09,
    "y": 0.8,
    "label": 1
  }, {
    "x": 0.4,
    "y": 0.9,
    "label": 1
  }],
  "neuralNet": {
    "layers": [{
      "neurons": [{
        "bias": 0.5
      }, {
        "bias": 0.5
      }]
    }, {
      "neurons": [{
        "bias": 0.5
      }, {
        "bias": 0.5
      }, {
        "bias": 0.5
      }, {
        "bias": 0.5
      }, {
        "bias": 0.5
      }]
    }, {
      "neurons": [{
        "bias": 0.5
      }, {
        "bias": 0.5
      }, {
        "bias": 0.5
      }, {
        "bias": 0.5
      }, {
        "bias": 0.5
      }]
    }, {
      "neurons": [{
        "bias": 0.5
      }, {
        "bias": 0.5
      }]
    }, {
      "neurons": [{
        "bias": 0.5
      }]
    }],
    "links": [{
      "n0": [0, 0],
      "nf": [1, 0],
      "weight": 2.2559318523672673
    }, {
      "n0": [0, 0],
      "nf": [1, 1],
      "weight": 3.7705902078344162
    }, {
      "n0": [0, 0],
      "nf": [1, 2],
      "weight": -5.673868837964195
    }, {
      "n0": [0, 0],
      "nf": [1, 3],
      "weight": -2.552116396138559
    }, {
      "n0": [0, 0],
      "nf": [1, 4],
      "weight": -4.765897189158554
    }, {
      "n0": [0, 1],
      "nf": [1, 0],
      "weight": 2.522847383501193
    }, {
      "n0": [0, 1],
      "nf": [1, 1],
      "weight": -2.9902303588384505
    }, {
      "n0": [0, 1],
      "nf": [1, 2],
      "weight": 2.749623598598969
    }, {
      "n0": [0, 1],
      "nf": [1, 3],
      "weight": -2.0657459601688077
    }, {
      "n0": [0, 1],
      "nf": [1, 4],
      "weight": 2.311040191441733
    }, {
      "n0": [1, 0],
      "nf": [2, 0],
      "weight": -2.8083933750840506
    }, {
      "n0": [1, 0],
      "nf": [2, 1],
      "weight": 2.368208438212055
    }, {
      "n0": [1, 0],
      "nf": [2, 2],
      "weight": 2.792010178964303
    }, {
      "n0": [1, 0],
      "nf": [2, 3],
      "weight": 2.1204797088106764
    }, {
      "n0": [1, 0],
      "nf": [2, 4],
      "weight": 3.0855603411983634
    }, {
      "n0": [1, 1],
      "nf": [2, 0],
      "weight": -2.1619760012233913
    }, {
      "n0": [1, 1],
      "nf": [2, 1],
      "weight": 2.7735676578848043
    }, {
      "n0": [1, 1],
      "nf": [2, 2],
      "weight": -4.795321974592097
    }, {
      "n0": [1, 1],
      "nf": [2, 3],
      "weight": -3.1618858651724424
    }, {
      "n0": [1, 1],
      "nf": [2, 4],
      "weight": 2.642537468325151
    }, {
      "n0": [1, 2],
      "nf": [2, 0],
      "weight": 5.111269168104936
    }, {
      "n0": [1, 2],
      "nf": [2, 1],
      "weight": 1.8060793114773712
    }, {
      "n0": [1, 2],
      "nf": [2, 2],
      "weight": 1.2874475479043777
    }, {
      "n0": [1, 2],
      "nf": [2, 3],
      "weight": 3.715659708889894
    }, {
      "n0": [1, 2],
      "nf": [2, 4],
      "weight": -5.479057778095251
    }, {
      "n0": [1, 3],
      "nf": [2, 0],
      "weight": 4.279970838297447
    }, {
      "n0": [1, 3],
      "nf": [2, 1],
      "weight": -3.8573191202934085
    }, {
      "n0": [1, 3],
      "nf": [2, 2],
      "weight": -4.346636276004062
    }, {
      "n0": [1, 3],
      "nf": [2, 3],
      "weight": 1.8026421918582567
    }, {
      "n0": [1, 3],
      "nf": [2, 4],
      "weight": 3.9687935202147346
    }, {
      "n0": [1, 4],
      "nf": [2, 0],
      "weight": -3.5216391228147197
    }, {
      "n0": [1, 4],
      "nf": [2, 1],
      "weight": 4.599458665307638
    }, {
      "n0": [1, 4],
      "nf": [2, 2],
      "weight": -4.752572287153145
    }, {
      "n0": [1, 4],
      "nf": [2, 3],
      "weight": -3.810827524569661
    }, {
      "n0": [1, 4],
      "nf": [2, 4],
      "weight": 3.0650028924296953
    }, {
      "n0": [2, 0],
      "nf": [3, 0],
      "weight": -4.300364295192499
    }, {
      "n0": [2, 0],
      "nf": [3, 1],
      "weight": -2.9036061692080217
    }, {
      "n0": [2, 1],
      "nf": [3, 0],
      "weight": 4.132576329093505
    }, {
      "n0": [2, 1],
      "nf": [3, 1],
      "weight": -3.817976850598705
    }, {
      "n0": [2, 2],
      "nf": [3, 0],
      "weight": 4.606542085589321
    }, {
      "n0": [2, 2],
      "nf": [3, 1],
      "weight": 2.8220313920923323
    }, {
      "n0": [2, 3],
      "nf": [3, 0],
      "weight": 2.3423002019828885
    }, {
      "n0": [2, 3],
      "nf": [3, 1],
      "weight": 2.098573708791525
    }, {
      "n0": [2, 4],
      "nf": [3, 0],
      "weight": 4.4760505444141625
    }, {
      "n0": [2, 4],
      "nf": [3, 1],
      "weight": 3.95752484391276
    }, {
      "n0": [3, 0],
      "nf": [4, 0],
      "weight": -0.7265226578414495
    }, {
      "n0": [3, 1],
      "nf": [4, 0],
      "weight": -4.316679309853457
    }]
  }
};
},{}],"js/main.js":[function(require,module,exports) {
var NeuralNet = require("./NeuralNet");

var DataCanvas = require("./DataCanvas");

var ControlPanel = require("./ControlPanel");

var svg = require("./svg");

window.neuralNet;
window.dataCanvas;
window.controllableParameters;
window.controlPanel;

function init() {
  var data = require("./data");

  controllableParameters = {
    learningRate: 0.2,
    regularization: 0.000009
  };
  var container = document.createElement("div");
  container.className = "content-container";
  document.body.appendChild(container);
  var row;
  row = document.createElement("div");
  container.appendChild(row);
  row.className = "content-container-row";
  var svgNeuralNet = svg.createElement("svg");
  svgNeuralNet.className = "content-container-cell";
  svgNeuralNet.id = "neural-net";
  row.appendChild(svgNeuralNet);
  neuralNet = NeuralNet.newFromData(data.neuralNet);
  svgNeuralNet.appendChild(neuralNet.svgElement);
  dataCanvas = DataCanvas.newFromData(data.dataPoints);
  dataCanvas.domElement.className += " content-container-cell";
  dataCanvas.domElement.id = "data-canvas";
  row.appendChild(dataCanvas.domElement);
  row = document.createElement("div");
  container.appendChild(row);
  row.className = "content-container-row";
  controlPanel = new ControlPanel(neuralNet, controllableParameters);
  controlPanel.domElement.className += " content-container-cell";
  row.appendChild(controlPanel.domElement);
  update();
}

function update() {
  for (var i = 0; i < 10; i++) {
    var dataError = 0;
    var regularizationError;

    for (var j = 0; j < dataCanvas.dataPoints.length; j++) {
      neuralNet.reset();
      var dataPoint = dataCanvas.dataPoints[j];
      neuralNet.layers[0].neurons[0].activation = dataPoint.x;
      neuralNet.layers[0].neurons[1].activation = dataPoint.y;
      neuralNet.forward();
      var neuron = neuralNet.layers[neuralNet.layers.length - 1].neurons[0];
      var output = neuron.activation;
      var d = dataPoint.label - output;
      dataError += 0.5 * d * d;
      neuron.dActivation = -d;
      regularizationError = neuralNet.backward(controllableParameters.learningRate, controllableParameters.regularization);
    }
  }

  neuralNet.redraw();
  dataCanvas.redraw(function (x, y) {
    neuralNet.layers[0].neurons[0].activation = x;
    neuralNet.layers[0].neurons[1].activation = y;
    neuralNet.forward();
    return neuralNet.layers[neuralNet.layers.length - 1].neurons[0].activation;
  });
  controlPanel.update({
    totalError: dataError + regularizationError,
    dataError: dataError,
    regularizationError: regularizationError
  });
  requestAnimationFrame(update);
}

function getData() {
  return {
    dataPoints: dataCanvas.toData(),
    neuralNet: neuralNet.toData()
  };
}

window.getData = getData;
init();
},{"./NeuralNet":"js/NeuralNet.js","./DataCanvas":"js/DataCanvas.js","./ControlPanel":"js/ControlPanel.js","./svg":"js/svg.js","./data":"js/data.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "54954" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/main.js"], null)
//# sourceMappingURL=/main.fb6bbcaf.map