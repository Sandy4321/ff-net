var Link;
(function () {
Link = function(n0, nf, weight) {
	this.init(n0, nf, weight);
}

var p = Link.prototype;
p.n0 = null;
p.nf = null;
p.weight = 0;
p.dw = 0;

p.init = function(n0, nf, weight) {
	this.n0 = n0;
	this.nf = nf;
	this.weight = weight;
	this.dw = 0;
}

})();
