var cLightBlue = d3.rgb(186, 224, 251);
var cLightRed = d3.rgb(252, 163, 163);

var cRed = d3.rgb(226, 86, 86);
var cBlue = d3.rgb(135, 173, 236);

function colorBlend(a, b, t) {
	return d3.rgb(
		a.r * t + b.r * (1 - t),
		a.g * t + b.g * (1 - t),
		a.b * t + b.b * (1 - t)
	);
}

function roundDigits(n, decimalDigits) {
	var factor = 1;
	for (var i = 0; i < decimalDigits; i++) factor*= 10;
	return Math.round(n * factor) / factor;
}

function init() {
	var trainingSet = [
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

	var svgWidth = 340;
	var svgHeight = 250;
	var canvasWidth = 250;
	var canvasHeight = 250;
	var canvasWidthMini = 50;
	var canvasHeightMini = 50;
	var neuronRadius = 12;
	var maxSpikeRadius = 7;
	var preactivationTop = 10;
	var minOutputPaint = 0.5 - 0.5;
	var maxOutputPaint = 0.5 + 0.5;

	var fWidth = canvasWidth / canvasWidthMini;
	var fHeight = canvasHeight / canvasHeightMini;

	var learningRate = 0.3;
	var regularization = 0.00001;

	var fWidth = canvasWidth / canvasWidthMini;
	var fHeight = canvasHeight / canvasHeightMini;

	var neuralNet = new NeuralNet();

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
			var bias;
			if (i == 0) bias = 0;
			else bias = 1.5 - Math.random() * 3;

			var neuron = neuralNet.addNeuron(pos, bias);

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

	var mainDiv = d3.select('body')
	.append('div')
	.style('text-align', 'center');

	var svg = mainDiv
	.append('svg')
	.attr('width', svgWidth)
	.attr('height', svgHeight)
	.style('vertical-align', 'middle');

	var divCanvas = mainDiv
	.append('div')
	.style('position', 'relative')
	.style('display', 'inline-block')
	.style('vertical-align', 'middle');

	var canvas = divCanvas.append('canvas')
	.attr('width', canvasWidth)
	.attr('height', canvasHeight);

	var ctx = canvas.node().getContext('2d');

	var canvasSvg = divCanvas.append('svg')
	.attr('width', canvasWidth)
	.attr('height', canvasHeight)
	.style('position', 'absolute')
	.style('left', '0px')
	.style('top', '0px')
	.style('z-index', '2');

	var miniCanvasData = [];
	for (var i = 0; i < canvasWidthMini; i++) {
		miniCanvasData.push([]);
		for (var j = 0; j < canvasHeightMini; j++) {
			miniCanvasData[i].push(0);
		}
	}

	var divControls = mainDiv
	.append('div')
	.style('text-align', 'left')
	.style('width', '180px')
	.style('display', 'inline-block')
	.style('vertical-align', 'middle')
	.style('padding-left', '25px');

	var btnRandomizeWeights = divControls
	.append('button')
	.html('Randomize weights')
	.style('text-align', 'center')
	.on('click', randomizeWeights);

	var $btnRandomizeWeights = $(btnRandomizeWeights[0]);
	$btnRandomizeWeights.button();

	divControls.append('div')
	.html('<b>Learning rate</b>');

	var txtLearningRate = divControls
	.append('span')
	.text(learningRate);

	var sldLearningRate = divControls
	.append('div');

	sldLearningRate.call(d3.slider()
		.axis(d3.svg.axis().ticks(6))
		.min(0)
		.max(1)
		.step(0.01)
		.value(learningRate)
		.on('slide', function(event, value) {
			learningRate = value;
			txtLearningRate.text(roundDigits(learningRate, 2).toString());
		})
	)
	.style('margin-left', '0px')
	.style('margin-top', '2px')
	.style('margin-bottom', '17px');
	
	divControls.append('div')
	.html('<b>Regularization</b><br>');

	var txtRegularization = divControls
	.append('span')
	.text(regularization);

	var sldRegularization = divControls
	.append('div');

	sldRegularization.call(d3.slider()
		.axis(d3.svg.axis().ticks(3))
		.min(0)
		.max(0.0001)
		.step(0.0000001)
		.value(regularization)
		.on('slide', function(event, value) {
			regularization = value;
			txtRegularization.text(roundDigits(regularization, 5).toString());
		})
	)
	.style('margin-left', '0px')
	.style('margin-top', '2px')
	.style('margin-bottom', '17px');

	var divInfo = divControls
	.append('div');

	var d3Link = svg.append('svg:g').selectAll('path');
	var d3Spike = svg.append('svg:g').selectAll('g');
	var d3Neuron = svg.append('svg:g').selectAll('g');
	var d3Sample = canvasSvg.append('svg:g').selectAll('g');

	var t = 0;
	var propagationT = 200;

	restart();

	var firstPass = true;
	var firingNeurons = [];

	/*
	firingNeurons = neuralNet.input;
	neuralNet.neurons[0].activation = 0.8;
	neuralNet.neurons[1].activation = 0.8;
	*/

	neuralNet.reset();
	setInterval(update, 1 / 30);

	function update() {
		var trainInfo = neuralNet.train(trainingSet, learningRate, regularization);
		updateCanvas();

		var totalLoss = trainInfo.dataLoss + trainInfo.regularizationLoss;
		var decimalDigits = 5;

		divInfo.html(
		'<b>Data loss:</b><br>' +
		roundDigits(trainInfo.dataLoss, decimalDigits) + '<br>' +
		'<b>Regularization loss:</b><br>' +
		roundDigits(trainInfo.regularizationLoss, decimalDigits) + '<br>' +
		'<b>Total loss:</b><br>' +
		roundDigits(totalLoss, decimalDigits) + '<br>');

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
		d3Link.attr('d', function(d) {
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
			return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
		});

		d3Neuron.attr('transform', function(d) {
			return 'translate(' + d.pos.x + ',' + d.pos.y + ')';
		})
		.selectAll('circle').style('fill', function(d) {
			var v = Math.abs(d.activation);
			return colorBlend(cBlue, cRed, v);
		});

		d3Link
		.style('stroke-width', function(d) {
			return maxSpikeRadius * 2 * Math.min(1, Math.abs(d.weight) / preactivationTop);
		});

		d3Spike.attr('transform', function(d) {
			return 'translate(' + d.pos.x + ',' + d.pos.y + ')';
		});
		d3Spike.selectAll('circle').attr('r', function(d) { return d.radius; });
	}

	function randomizeWeights() {
		neuralNet.randomizeWeights();
	}

	function restart() {
		var g;

		d3Link = d3Link.data(neuralNet.links);

		d3Link.enter().append('svg:path')
		.attr('class', 'link')
		.style('stroke-width', function(d) {
			return 1; // maxSpikeRadius * 2 * Math.min(1, Math.abs(d.weight) / preactivationTop);
		})
		.style('stroke', function(d) {
			if (d.weight > 0) {
				return cBlue;
			} else {
				return cRed;
			}
		})
		.style('stroke-opacity', function(d) { return 0.4; });

		d3Link.exit().remove();

		d3Neuron = d3Neuron.data(neuralNet.neurons);
		g = d3Neuron.enter().append('svg:g');

		g.append('svg:circle')
		.attr('class', 'neuron')
		.attr('r', neuronRadius)
		.style('stroke', function(d) { return d3.rgb(0, 0, 0); });

		d3Neuron.exit().remove();

		d3Spike = d3Spike.data(neuralNet.spikes);
		g = d3Spike.enter().append('svg:g');

		g.append('svg:circle')
		.attr('class', 'spike')
		.attr('fill', function(d) {
			if (d.link.weight > 0) {
				return cBlue;
			} else {
				return cRed;
			}
		});

		d3Spike.exit().remove();

		d3Sample = d3Sample.data(trainingSet);
		g = d3Sample.enter().append('svg:g');

		g.append('svg:circle')
		.attr('class', 'sample')
		.attr('r', 3)
		.style('stroke', function(d) { return d3.rgb(0, 0, 0) })
		.style('fill', function(d) {
			if (d.y == 1) return cBlue;
			else return cRed;
		});

		d3Sample.attr('transform', function(d) {
			return 'translate(' + d.x[0] * canvasWidth + ',' + d.x[1] * canvasHeight + ')';
		});

		d3Sample.exit().remove();

		updateCanvas();

	}

	function updateCanvas() {
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

}