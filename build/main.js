(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var svg = require("./svg");
var Neuron = require("./Neuron");

var Layer = function(neuralNet) {
	this.neuralNet = neuralNet;
	this.neurons = [];
	this.svgElement = svg.createElement("g");
}

var p = Layer.prototype;

p.redraw = function() {
	for (var i = 0; i < this.neurons.length; i++) {
		var neuron = this.neurons[i];
		neuron.redraw();
	}
}

p.addNeuron = function(bias) {
	if (bias == null) bias = 0.5;
	var neuron = new Neuron(this, bias);
	this.neurons.push(neuron);
	this.svgElement.appendChild(neuron.svgElement);
}

p.getNeuronAt = function(i) {
	return this.neurons[i];
}

p.getNeuronCount = function() {
	return this.neurons.length;
}

p.getIndex = function() {
	return this.neuralNet.layers.indexOf(this);
}

module.exports = Layer;

},{"./Neuron":4,"./svg":8}],2:[function(require,module,exports){
var svg = require("./svg");

var Link = function(net, n0, nf, weight) {
	this.net = net;
	this.n0 = n0;
	this.nf = nf;
	
	if (this.n0.layer.getIndex() + 1 != this.nf.layer.getIndex()) {
		throw "Cannot connect neurons from non-consecutive layers";
	}
	
	if (weight == null) this.weight = 1;
	else this.weight = weight;
	this.dw = 0;

	this.svgElement = svg.createElement("path");
	this.redraw();
}

var p = Link.prototype;

p.redraw = function() {
	var path = this.svgElement;
	var p0 = this.n0.getPosition();
	var pf = this.nf.getPosition();
	path.setAttribute(
		"d",
		"M" + p0.x + " " + p0.y + " " +
		"L" + pf.x + " " + pf.y)
	;
	path.setAttribute("stroke", "black");
	path.setAttribute("stroke-width", 2);
}

p.setParameters = function(params) {
	this.weight = params.weight;
}

p.getParameters = function() {
	return {
		weight: this.weight
	};
}

module.exports = Link;

},{"./svg":8}],3:[function(require,module,exports){
var svg = require("./svg");
var Neuron = require("./Neuron");
var Link = require("./Link");
var Spike = require("./Spike");
var Layer = require("./Layer");

var NeuralNet = function() {
	this.links = [];
	this.spikes = [];
	this.layers = [];
	this.input = [];
	this.output = [];

	this.svgElement = svg.createElement("g");
}

var p = NeuralNet.prototype;

p.addLayer = function(neuronCount) {
	if (neuronCount == null) neuronCount = 0;	
	
	var layer = new Layer(this);
	this.layers.push(layer);
	this.svgElement.appendChild(layer.svgElement);
	
	for (var i = 0; i < neuronCount; i++) {
		layer.addNeuron();
	}
	
	return layer;
}

p.addFullyConnectedLayer = function(neuronCount) {
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
}

p.addLink = function(n0, nf, weight) {
	var link = new Link(this, n0, nf, weight);
	n0.links.push(link);
	nf.backLinks.push(link);
	var spike = new Spike(link);
	link.spike = spike;
	this.links.push(link);
	this.spikes.push(spike);

	this.svgElement.appendChild(link.svgElement);

	return link;
}

p.redraw = function() {
	for (var i = 0; i < this.layers.length; i++) {
		var layer = this.layers[i];
		layer.redraw();
	}
}

p.reset = function(input) {
	for (var i = 0; i < this.layers.length; i++) {
		var layer = this.layers[i];
		layer.reset();
	}
}

p.randomizeWeights = function() {
	for (var i = 0; i < this.links.length; i++) {
		var link = this.links[i];
		var weight = 2 + Math.random() * 4;
		if (Math.random() <= 0.5) weight *= -1;
		link.weight = weight;
	}
	for (var i = 0; i < this.neurons.length; i++) {
		var neuron = this.neurons[i];
		var bias = 1.5 - Math.random() * 3;
		neuron.bias = bias;
	}
}

p.setParameters = function(parameters) {
	for (var i = 0; i < parameters.neurons.length; i++) {
		this.neurons[i].setParameters(parameters.neurons[i]);
	}
	for (var i = 0; i < parameters.links.length; i++) {
		this.links[i].setParameters(parameters.links[i]);
	}
}

p.getParameters = function() {
	var paramNeurons = [];
	for (var i = 0; i < this.neurons.length; i++) {
		paramNeurons.push(this.neurons[i].getParameters());
	}
	var paramLinks = [];
	for (var i = 0; i < this.links.length; i++) {
		paramLinks.push(this.links[i].getParameters());
	}
	return {
		neurons: paramNeurons,
		links: paramLinks
	};
}

p.computeOutput = function(input) {
	var spikingNeurons = [];

	for (var i = 0; i < this.input.length; i++) {
		var neuron = this.input[i];
		neuron.activation = input[i];
		for (var j = 0; j < neuron.links.length; j++) {
			var nf = neuron.links[j].nf;
			if (spikingNeurons.indexOf(nf) == -1) {
				spikingNeurons.push(nf);
			}
		}
	}

	while (spikingNeurons.length > 0) {
		var newSpikingNeurons = [];
		for (var i = 0; i < spikingNeurons.length; i++) {
			var neuron = spikingNeurons[i];
			neuron.update();
			for (var j = 0; j < neuron.links.length; j++) {
				var nf = neuron.links[j].nf;
				if (newSpikingNeurons.indexOf(nf) == -1){
					newSpikingNeurons.push(nf);
				}
			}
		}
		spikingNeurons = newSpikingNeurons;
	}

	var output = [];
	for (var i = 0; i< this.output.length; i++) {
		output.push(this.output[i].activation);
	}

	return output;
}

p.train = function(trainingSet, learningRate, regularization) {
	var dataLoss = 0;
	var regularizationLoss = 0;

	for (var k = trainingSet.length - 1; k >= 0; k--) {
		var sample = trainingSet[k];
		var output = this.computeOutput(sample.x);
		var d = sample.y - output[0];
		// data loss = 0.5 * d^2
		dataLoss += 0.5 * d * d;
		var neuron = this.output[0];
		neuron.da = -d; // a = output[0]
		neuron.dz = neuron.da * Neuron.sigmoid(neuron.preactivation) * (1 - Neuron.sigmoid(neuron.preactivation));

		neuron.db = 1 * neuron.dz;
		for (var l = 0; l < neuron.backLinks.length; l++) {
			var link = neuron.backLinks[l];
			link.dw = link.n0.activation * neuron.dz;
			// regularization loss = 0.5 * regularization * w^2
			link.dw += regularization * link.weight;
			regularizationLoss += regularization * link.weight * link.weight;
		}

		var backNeurons = [];
		for (var i = 0; i < neuron.backLinks.length; i++) {
			var n0 = neuron.backLinks[i].n0;
			if (backNeurons.indexOf(n0) == -1) backNeurons.push(n0);
		}

		while (backNeurons.length > 0) {
			var newBackNeurons = [];

			for (var i = 0; i < backNeurons.length; i++) {
				var neuron = backNeurons[i];

				neuron.da = 0;
				for (var l = 0; l < neuron.links.length; l++) {
					var link = neuron.links[l];
					neuron.da += link.weight * link.dw;
				}

				neuron.dz = neuron.da * Neuron.sigmoid(neuron.preactivation) * (1 - Neuron.sigmoid(neuron.preactivation));;
				neuron.db = 1 * neuron.dz;
				for (var l = 0; l < neuron.backLinks.length; l++) {
					var link = neuron.backLinks[l];
					var n0 = link.n0;
					link.dw = link.n0.activation * neuron.dz;
					// regularization loss = 0.5 * regularization * w^2
					link.dw += regularization * link.weight;
					regularizationLoss += regularization * link.weight * link.weight;

					if (newBackNeurons.indexOf(n0) == -1) newBackNeurons.push(n0);
				}
			}

			backNeurons = newBackNeurons;
		}

		// at this point we have computed the gradient,
		// we have to update the weights and biases
		for (var i = 0; i < this.links.length; i++) {
			var link = this.links[i];
			link.weight -= learningRate * link.dw;
		}

		for (var i = 0; i < this.neurons.length; i++) {
			var neuron = this.neurons[i];
			neuron.bias -= learningRate * neuron.db;
		}

		for (var i = 0; i < this.input.length; i++) {
			// input neurons have always 0 bias
			var neuron = this.input[i];
			neuron.bias = 0;
		}

		this.reset();
	}

	return {
		dataLoss: dataLoss,
		regularizationLoss: regularizationLoss
	};
}

module.exports = NeuralNet;

},{"./Layer":1,"./Link":2,"./Neuron":4,"./Spike":5,"./svg":8}],4:[function(require,module,exports){
var svg = require("./svg");
var Vector2 = require("./Vector2");

var Neuron = function(layer, bias) {
	this.layer = layer;
	this.links = [];
	this.backLinks = [];
	this.bias = bias;
	this.preactivation = 0;
	this.activation = Neuron.sigmoid(this.bias);
	this.error = 0;
	this.da = 0; // d activation
	this.dz = 0; // d preactivation
	this.db = 0; // d bias

	var svgElement = this.svgElement = svg.createElement("circle");
	svgElement.setAttribute("r", 10);
}

var p = Neuron.prototype;

Neuron.sigmoid = function(x) {
	return 1 / (1 + Math.exp(-x));
}

p.redraw = function() {
	var circle = this.svgElement;
	var position = this.getPosition();
	circle.setAttribute("cx", position.x);
	circle.setAttribute("cy", position.y);
}

p.getIndex = function() {
	return this.layer.neurons.indexOf(this);
}

p.getPosition = function() {
	var neuronCount = this.layer.neurons.length;
	var cy = 120;
	
	var x = this.layer.getIndex() * 50;
	
	var y;
	if (neuronCount == 0) {
		y = cy;
	} else {
		y = cy + (this.getIndex() - neuronCount / 2) * 40;
	}
	
	return new Vector2(x, y);
}

p.update = function() {
	this.preactivation = 0;
	this.preactivation += this.bias;
	for (var i = 0; i < this.backLinks.length; i++) {
		var link = this.backLinks[i];
		this.preactivation += link.weight * link.n0.activation;
	}
	this.activation = Neuron.sigmoid(this.preactivation);
}

p.reset = function() {
	this.preactivation = 0;
	this.activation = Neuron.sigmoid(this.bias);
}

p.setParameters = function(params) {
	this.bias = params.bias;
}

p.getParameters = function() {
	return {
		bias: this.bias
	};
}

module.exports = Neuron;

},{"./Vector2":6,"./svg":8}],5:[function(require,module,exports){
var Vector2 = require("./Vector2");

var Spike;

Spike = function(link) {
	this.link = link;
	this.pos = new Vector2(0, 0);
	this.radius = 0;
}

var p = Spike.prototype;

p.getMagnitude = function() {
	return this.link.n0.activation * this.link.weight;
}

module.exports = Spike;

},{"./Vector2":6}],6:[function(require,module,exports){
var Vector2;

Vector2 = function(x, y) {
	this.x = x;
	this.y = y;
}

var p = Vector2.prototype;

p.add = function(v) {
	return new Vector2(this.x + v.x, this.y + v.y);
}

p.subtract = function(v) {
	return new Vector2(this.x - v.x, this.y - v.y);
}

p.magnitude = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y);
}

p.times = function(n) {
	return new Vector2(this.x * n, this.y * n);
}

p.normalize = function() {
	var magnitude = this.magnitude();
	return this.times(1 / magnitude);
}

p.dot = function(v) {
	return this.x * v.x + this.y * v.y;
}

p.crossZ = function(v) {
	return - v.x * this.y + this.x * v.y;
}

p.equals = function(v) {
	return v.x == this.x && v.y == this.y;
}

p.toString = function() {
	return "(x: " + this.x + ", y: " + this.y + ")";
}

module.exports = Vector2;

},{}],7:[function(require,module,exports){
var NeuralNet = require("./NeuralNet");
var Vector2 = require("./Vector2");

var cLightBlue = d3.rgb(186, 224, 251);
var cLightRed = d3.rgb(252, 163, 163);

var cRed = d3.rgb(226, 86, 86);
var cBlue = d3.rgb(135, 173, 236);

colorBlend = function(a, b, t) {
	return d3.rgb(
		a.r * t + b.r * (1 - t),
		a.g * t + b.g * (1 - t),
		a.b * t + b.b * (1 - t)
	);
}

roundDigits = function(n, decimalDigits) {
	var factor = 1;
	for (var i = 0; i < decimalDigits; i++) factor*= 10;
	return Math.round(n * factor) / factor;
}

var svg = require("./svg");

function init() {
	var svgContainer = svg.createElement("svg");
	svgContainer.style.height = "400px";
	document.body.appendChild(svgContainer);

	var neuralNet = new NeuralNet();
	svgContainer.appendChild(neuralNet.svgElement);

	neuralNet.addLayer(2);
	neuralNet.addFullyConnectedLayer(5);
	neuralNet.addFullyConnectedLayer(5);
	neuralNet.addFullyConnectedLayer(2);
	neuralNet.addFullyConnectedLayer(1);
	
	neuralNet.redraw();

	return;

	trainingSet = [
		{x: [0.08, 0.24], y: 1},
		{x: [0.2, 0.27], y: 1},
		{x: [0.05, 0.30], y: 1},
		{x: [0.1, 0.1], y: 1},

		{x: [0.4, 0.4], y: 0},
		{x: [0.6, 0.4], y: 0},
		{x: [0.65, 0.7], y: 0},
		{x: [0.7, 0.3], y: 0},
		{x: [0.35, 0.65], y: 0},

		{x: [0.3, 0.5], y: 0},
		{x: [0.7, 0.5], y: 0},
		{x: [0.75, 0.55], y: 0},
		{x: [0.7, 0.6], y: 0},
		{x: [0.65, 0.34], y: 0},
		{x: [0.8, 0.65], y: 0},
		{x: [0.5, 0.7], y: 0},
		{x: [0.5, 0.66], y: 0},
		{x: [0.56, 0.66], y: 0},
		{x: [0.46, 0.36], y: 0},
		{x: [0.46, 0.26], y: 0},
		{x: [0.36, 0.26], y: 0},
		{x: [0.26, 0.36], y: 0},
		{x: [0.56, 0.28], y: 0},
		{x: [0.33, 0.54], y: 0},
		{x: [0.23, 0.52], y: 0},

		{x: [0.26, 0.16], y: 1},
		{x: [0.06, 0.46], y: 1},
		{x: [0.13, 0.66], y: 1},

		{x: [0.2, 0.8], y: 1},

		{x: [0.5, 0.5], y: 1},
		{x: [0.45, 0.5], y: 1},
		{x: [0.5, 0.45], y: 1},
		{x: [0.45, 0.45], y: 1},
		{x: [0.55, 0.55], y: 1},
		{x: [0.5, 0.55], y: 1},

		{x: [0.2, 0.8], y: 1},

		{x: [0.5, 0.2], y: 1},
		{x: [0.4, 0.1], y: 1},
		{x: [0.6, 0.1], y: 1},
		{x: [0.75, 0.15], y: 1},
		{x: [0.75, 0.15], y: 1},

		{x: [0.88, 0.22], y: 1},
		{x: [0.9, 0.35], y: 1},
		{x: [0.90, 0.49], y: 1},
		{x: [0.88, 0.62], y: 1},

		{x: [0.9, 0.9], y: 1},
		{x: [0.9, 0.8], y: 1},
		{x: [0.75, 0.85], y: 1},
		{x: [0.55, 0.92], y: 1},
		{x: [0.6, 0.95], y: 1},

		{x: [0.06, 0.57], y: 1},
		{x: [0.09, 0.8], y: 1},
		{x: [0.4, 0.9], y: 1},
	];

	svgWidth = 340;
	svgHeight = 250;
	canvasWidth = 250;
	canvasHeight = 250;
	canvasWidthMini = 50;
	canvasHeightMini = 50;
	neuronRadius = 12;
	maxSpikeRadius = 7;
	preactivationTop = 10;
	minOutputPaint = 0.5 - 0.5;
	maxOutputPaint = 0.5 + 0.5;

	fWidth = canvasWidth / canvasWidthMini;
	fHeight = canvasHeight / canvasHeightMini;

	learningRate = 0.3;
	regularization = 0.00001;

	neuralNet = new NeuralNet();

	var neuronsPerLayer = [2, 5, 5, 2, 1];

	var dy = 50;
	var x = 20;
	var dx = 70;

	var layers = [];

	for (var i = 0; i < neuronsPerLayer.length; i++) {
		layers.push([]);
		for (var j = 0; j < neuronsPerLayer[i]; j++) {
			var y = svgHeight / 2 + (j - (neuronsPerLayer[i] - 1) / 2) * dy;
			var pos = new Vector2(x, y);

			var neuron = neuralNet.addNeuron(pos, 0);

			layers[i].push(neuron);

			if (i == 0) neuralNet.input.push(neuron);
			else
			if (i == neuronsPerLayer.length - 1) neuralNet.output.push(neuron);
		}
		x += dx;
	}

	for (var i = 0; i < layers.length; i++) {
		var layer = layers[i];
		for (var j = 0; j < layer.length; j++) {
			var n0 = layer[j];
			if (i < layers.length - 1) {
				var nextLayer = layers[i + 1];
				for (var k = 0; k < nextLayer.length; k++) {
					var nf = nextLayer[k];
					var weight = 2 + Math.random() * 4;
					if (Math.random() <= 0.5) weight *= -1;
					neuralNet.addLink(n0, nf, weight);
				}
			}
		}
	}

	var initialParameters = {
		"neurons":[
			{"bias": 0}, {"bias": 0}, {"bias": 0.14926214704417798}, {"bias": -1.5760565067172967},
			{"bias": -0.0070790515773630994}, {"bias": -0.9610370821643252}, {"bias": -0.4631415695352903},
			{"bias": -0.4930638653997511}, {"bias": -1.2292654208180753}, {"bias": 1.233787276253548},
			{"bias": -2.054973071108484}, {"bias": -1.3979682183549529}, {"bias": 0.6288132165377796},
			{"bias": -0.9965512697250088}, {"bias": 3.500734405313219}],
		"links":[
			{"weight": 2.2559318523672673}, {"weight": 3.7705902078344162}, {"weight": -5.673868837964195},
			{"weight": -2.552116396138559}, {"weight": -4.765897189158554}, {"weight": 2.522847383501193},
			{"weight": -2.9902303588384505}, {"weight": 2.749623598598969}, {"weight": -2.0657459601688077},
			{"weight": 2.311040191441733}, {"weight": -2.8083933750840506}, {"weight": 2.368208438212055},
			{"weight": 2.792010178964303}, {"weight": 2.1204797088106764}, {"weight": 3.0855603411983634},
			{"weight": -2.1619760012233913}, {"weight": 2.7735676578848043}, {"weight": -4.795321974592097},
			{"weight": -3.1618858651724424}, {"weight": 2.642537468325151}, {"weight": 5.111269168104936},
			{"weight": 1.8060793114773712}, {"weight": 1.2874475479043777}, {"weight": 3.715659708889894},
			{"weight": -5.479057778095251}, {"weight": 4.279970838297447}, {"weight": -3.8573191202934085},
			{"weight": -4.346636276004062}, {"weight": 1.8026421918582567}, {"weight": 3.9687935202147346},
			{"weight": -3.5216391228147197}, {"weight": 4.599458665307638}, {"weight": -4.752572287153145},
			{"weight": -3.810827524569661}, {"weight": 3.0650028924296953}, {"weight": -4.300364295192499},
			{"weight": -2.9036061692080217}, {"weight": 4.132576329093505}, {"weight": -3.817976850598705},
			{"weight": 4.606542085589321}, {"weight": 2.8220313920923323}, {"weight": 2.3423002019828885},
			{"weight": 2.098573708791525}, {"weight": 4.4760505444141625}, {"weight": 3.95752484391276},
			{"weight": -0.7265226578414495}, {"weight": -4.316679309853457}]
	};
	neuralNet.setParameters(initialParameters);

	var mainDiv = d3.select("body")
	.append("div")
	.style("text-align", "center");

	/*
	var svg = mainDiv
	.append("svg")
	.attr("width", svgWidth)
	.attr("height", svgHeight)
	.style("vertical-align", "middle");
	*/

	var divCanvas = mainDiv
	.append("div")
	.style("position", "relative")
	.style("display", "inline-block")
	.style("vertical-align", "middle");

	var canvas = divCanvas.append("canvas")
	.attr("width", canvasWidth)
	.attr("height", canvasHeight);

	ctx = canvas.node().getContext("2d");

	var canvasSvg = divCanvas.append("svg")
	.attr("width", canvasWidth)
	.attr("height", canvasHeight)
	.style("position", "absolute")
	.style("left", "0px")
	.style("top", "0px")
	.style("z-index", "2");

	miniCanvasData = [];
	for (var i = 0; i < canvasWidthMini; i++) {
		miniCanvasData.push([]);
		for (var j = 0; j < canvasHeightMini; j++) {
			miniCanvasData[i].push(0);
		}
	}

	var divControls = mainDiv
	.append("div")
	.style("text-align", "left")
	.style("width", "180px")
	.style("display", "inline-block")
	.style("vertical-align", "middle")
	.style("padding-left", "25px");

	var btnRandomizeWeights = divControls
	.append("button")
	.html("Randomize weights")
	.style("text-align", "center")
	.on("click", randomizeWeights);

	// var $btnRandomizeWeights = $(btnRandomizeWeights[0]);
	// $btnRandomizeWeights.button();

	divControls.append("div")
	.html("<b>Learning rate</b>");

	var txtLearningRate = divControls
	.append("span")
	.text(learningRate);

	var sldLearningRate = divControls
	.append("div");

	sldLearningRate.call(d3.slider()
		.axis(d3.svg.axis().ticks(6))
		.min(0)
		.max(1)
		.step(0.01)
		.value(learningRate)
		.on("slide", function(event, value) {
			learningRate = value;
			txtLearningRate.text(roundDigits(learningRate, 2).toString());
		})
	)
	.style("margin-left", "0px")
	.style("margin-top", "2px")
	.style("margin-bottom", "17px");

	divControls.append("div")
	.html("<b>Regularization</b><br>");

	var txtRegularization = divControls
	.append("span")
	.text(regularization);

	var sldRegularization = divControls
	.append("div");

	sldRegularization.call(d3.slider()
		.axis(d3.svg.axis().ticks(3))
		.min(0)
		.max(0.0001)
		.step(0.0000001)
		.value(regularization)
		.on("slide", function(event, value) {
			regularization = value;
			txtRegularization.text(roundDigits(regularization, 5).toString());
		})
	)
	.style("margin-left", "0px")
	.style("margin-top", "2px")
	.style("margin-bottom", "17px");

	divInfo = divControls.append("div");

	d3Link = svg.append("svg:g").selectAll("path");
	d3Spike = svg.append("svg:g").selectAll("g");
	d3Neuron = svg.append("svg:g").selectAll("g");
	d3Sample = canvasSvg.append("svg:g").selectAll("g");

	t = 0;
	propagationT = 200;

	restart();

	firstPass = true;
	firingNeurons = [];

	/*
	firingNeurons = neuralNet.input;
	neuralNet.neurons[0].activation = 0.8;
	neuralNet.neurons[1].activation = 0.8;
	*/

	neuralNet.reset();
	setInterval(update, 1 / 30);
}

update = function() {
	var trainInfo = neuralNet.train(trainingSet, learningRate, regularization);
	updateCanvas();

	var totalLoss = trainInfo.dataLoss + trainInfo.regularizationLoss;
	var decimalDigits = 5;

	divInfo.html(
	"<b>Data loss:</b><br>" +
	roundDigits(trainInfo.dataLoss, decimalDigits) + "<br>" +
	"<b>Regularization loss:</b><br>" +
	roundDigits(trainInfo.regularizationLoss, decimalDigits) + "<br>" +
	"<b>Total loss:</b><br>" +
	roundDigits(totalLoss, decimalDigits) + "<br>");

	if (t >= propagationT) {
		t = propagationT;
		var newFiringNeurons = [];
		for (var i = 0; i < firingNeurons.length; i++) {
			var neuron = firingNeurons[i];
			for (var j = 0; j < neuron.links.length; j++) {
				var link = neuron.links[j];
				if (newFiringNeurons.indexOf(link.nf) == -1) {
					newFiringNeurons.push(link.nf);
				}
			}
		}
		firingNeurons = newFiringNeurons;
		t = 0;
	} else
	if (t == 0) {
		if (firstPass) {
			firstPass = false;
		} else {
			for (var i = 0; i < firingNeurons.length; i++) {
				var neuron = firingNeurons[i];
				neuron.update();
			}
		}

		for (var i = 0; i < firingNeurons.length; i++) {
			var neuron = firingNeurons[i];
			for (var j = 0; j < firingNeurons[i].links.length; j++) {
				var spike = neuron.links[j].spike;
				spike.radius = maxSpikeRadius * Math.min(1, Math.abs(spike.getMagnitude()) / preactivationTop);
			}
		}

		t++;
	} else {
		t++;
	}

	for (var i = 0; i < firingNeurons.length; i++) {
		for (var j = 0; j < firingNeurons[i].links.length; j++) {
			var spike = firingNeurons[i].links[j].spike;
			var link = spike.link;

			var v = link.nf.pos.subtract(link.n0.pos).normalize();
			var p0 = link.n0.pos.add(v.times(neuronRadius - spike.radius));
			var pf = link.nf.pos.subtract(v.times(neuronRadius - spike.radius));
			v = pf.subtract(p0);
			spike.pos = p0.add(v.times(t / propagationT));
		}
	}

	// draw directed edges with proper padding from node centers
	d3Link.attr("d", function(d) {
		var deltaX = d.nf.pos.x - d.n0.pos.x,
			deltaY = d.nf.pos.y - d.n0.pos.y,
			dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
			normX = deltaX / dist,
			normY = deltaY / dist,
			sourcePadding = d.left ? neuronRadius - 5 : neuronRadius,
			targetPadding = d.right ? neuronRadius - 5: neuronRadius,
			sourceX = d.n0.pos.x + (sourcePadding * normX),
			sourceY = d.n0.pos.y + (sourcePadding * normY),
			targetX = d.nf.pos.x - (targetPadding * normX),
			targetY = d.nf.pos.y - (targetPadding * normY);
		return "M" + sourceX + "," + sourceY + "L" + targetX + "," + targetY;
	});

	d3Neuron.attr("transform", function(d) {
		return "translate(" + d.pos.x + "," + d.pos.y + ")";
	})
	.selectAll("circle").style("fill", function(d) {
		var v = Math.abs(d.activation);
		return colorBlend(cBlue, cRed, v);
	});

	d3Link
	.style("stroke-width", function(d) {
		return maxSpikeRadius * 2 * Math.min(1, Math.abs(d.weight) / preactivationTop);
	});

	d3Spike.attr("transform", function(d) {
		return "translate(" + d.pos.x + "," + d.pos.y + ")";
	});
	d3Spike.selectAll("circle").attr("r", function(d) { return d.radius; });
}

randomizeWeights = function() {
	neuralNet.randomizeWeights();
	// bias of 2 inputs must be 0
	neuralNet.neurons[0].bias = 0;
	neuralNet.neurons[1].bias = 0;
}

restart = function() {
	var g;

	d3Link = d3Link.data(neuralNet.links);

	d3Link.enter().append("svg:path")
	.attr("class", "link")
	.style("stroke-width", function(d) {
		return 1; // maxSpikeRadius * 2 * Math.min(1, Math.abs(d.weight) / preactivationTop);
	})
	.style("stroke", function(d) {
		if (d.weight > 0) {
			return cBlue;
		} else {
			return cRed;
		}
	})
	.style("stroke-opacity", function(d) { return 0.4; });

	d3Link.exit().remove();

	d3Neuron = d3Neuron.data(neuralNet.neurons);
	g = d3Neuron.enter().append("svg:g");

	g.append("svg:circle")
	.attr("class", "neuron")
	.attr("r", neuronRadius)
	.style("stroke", function(d) { return d3.rgb(0, 0, 0); });

	d3Neuron.exit().remove();

	d3Spike = d3Spike.data(neuralNet.spikes);
	g = d3Spike.enter().append("svg:g");

	g.append("svg:circle")
	.attr("class", "spike")
	.attr("fill", function(d) {
		if (d.link.weight > 0) {
			return cBlue;
		} else {
			return cRed;
		}
	});

	d3Spike.exit().remove();

	d3Sample = d3Sample.data(trainingSet);
	g = d3Sample.enter().append("svg:g");

	g.append("svg:circle")
	.attr("class", "sample")
	.attr("r", 3)
	.style("stroke", function(d) { return d3.rgb(0, 0, 0) })
	.style("fill", function(d) {
		if (d.y == 1) return cBlue;
		else return cRed;
	});

	d3Sample.attr("transform", function(d) {
		return "translate(" + d.x[0] * canvasWidth + "," + d.x[1] * canvasHeight + ")";
	});

	d3Sample.exit().remove();

	updateCanvas();

}

updateCanvas = function() {
	var d;
	for (var i = 0; i < canvasWidthMini; i++) {
		for (var j = 0; j < canvasHeightMini; j++) {
			var output = neuralNet.computeOutput([i / canvasWidthMini, j / canvasHeightMini]);
			var v = output[0];
			if (v > maxOutputPaint) d = cLightBlue;
			else if (v < minOutputPaint) d = cLightRed;
			else {
				v = (v - minOutputPaint) / (maxOutputPaint - minOutputPaint);
				d = colorBlend(cLightBlue, cLightRed, v);
			}

			miniCanvasData[i][j] = d;
		}
	}

	var imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	var imgDataLen = imgData.data.length;
	for (var i = 0; i < imgDataLen / 4; i++) {
		var y = Math.floor(i / canvasWidth);
		var x = i % canvasWidth;
		var d = miniCanvasData[Math.floor(x / fWidth)][Math.floor(y / fHeight)];
		imgData.data[4 * i] = d.r;
		imgData.data[4 * i + 1] = d.g;
		imgData.data[4 * i + 2] = d.b;
		imgData.data[4 * i + 3] = 255;
	}
	ctx.putImageData(imgData, 0, 0);

	neuralNet.reset();
}

init();

},{"./NeuralNet":3,"./Vector2":6,"./svg":8}],8:[function(require,module,exports){
var svg = {};

svg.createElement = function(element) {
	return document.createElementNS("http://www.w3.org/2000/svg", element);
}

module.exports = svg;

},{}]},{},[7]);
