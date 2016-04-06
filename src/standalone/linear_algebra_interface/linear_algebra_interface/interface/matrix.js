// Creates a matrix and optionally names it.
// If the name is specified, it will also generate a display for it
var matrix = function (vecs, name) {
	this.m = vecs.length;
	if (vecs[0] instanceof vector) {
		this.indices = clone(vecs);
	} else {
		this.indices = clone(vecs);
		for (var i in this.indices) {
			this.indices[i] = new vector(this.indices[i]);
		}
	}

	this.n = this.indices[0].n();

	if (name) {
		this.setName(name);
	}
};

// Creates an interface element for the matrix
matrix.prototype.show = function () {
	this.display = document.createElement("div");
	this.display.classList.add("item");

	this.display.appendChild(document.createElement("div"));
	this.display.childNodes[0].classList.add("item-detail");
	this.display.childNodes[0].innerHTML = "<span class=\"item-title\">Matrix " + this.name + "</span>\
											<span class=\"item-info\">" + this.m + " x " + this.n + " matrix</span>";
	this.display.appendChild(document.createElement("div"));
	this.display.childNodes[1].classList.add("item-data");
	this.display.childNodes[1].appendChild(document.createElement("div"));
	this.display.childNodes[1].childNodes[0].classList.add("matrix");
	var matrixDisplay = this.display.childNodes[1].childNodes[0];
	matrixDisplay.parentMatrix = this;

	var handleChange = function (e) {
		if (!isNaN(this.value)) {
			this.matrixParent.set(this.i, this.j, parseFloat(this.value));
		} else {
			this.matrixParent.set(this.i, this.j, this.value);
		}
	};

	for (var i = 0; i < this.m; i ++) {
		matrixDisplay.appendChild(document.createElement("div"));
		var row = matrixDisplay.childNodes[i];
		row.classList.add("row");
		for (var j = 0; j < this.n; j ++) {
			row.appendChild(document.createElement("div"));
			var cell = row.childNodes[j];
			cell.classList.add("element");
			cell.appendChild(document.createElement("input"));
			var input = cell.firstChild;
			input.setAttribute("type", "text");
			input.classList.add("matrix-element");
			input.value = this.get(i, j);
			input.i = i;
			input.j = j;
			input.matrixParent = this;
			input.addEventListener("keyup", handleChange);
		}
	}
	document.querySelector("#content").appendChild(this.display);
};

// Gets either the specific cell, the specified row or the specified column
matrix.prototype.get = function (i, j) {
	if (i != undefined && j != undefined) {
		return this._getIndice(i, j);
	} else if (i != undefined) {
		return this._getRow(i);
	} else if (j != undefined) {
		return this._getColumn(j);
	} else {
		throw "No arguments specified.";
	}
};

matrix.prototype._getIndice = function (i, j) {
	return this.indices[i].indices[j];
};

matrix.prototype._getRow = function (i) {
	return new vector(this.indices[i]);
};

matrix.prototype._getColumn = function (j) {
	var newVector = [];
	for (var i = 0; i < this.m; i ++) {
		newVector.push(this.indices[i].indices[j]);
	}
	return new vector(newVector);
};

matrix.prototype.setName = function (name) {
	this.name = name;
	window[name] = this;
	if (!this.display) {
		this.show();
	}
	this.display.querySelector(".item-title").innerHTML = "Matrix " + this.name;
};

// Returns the part of the interface that holds the value of the spcified cell
matrix.prototype.getInput = function (i, j) {
	return this.display.childNodes[1].childNodes[0].childNodes[i].childNodes[j].firstChild;
};

matrix.prototype.destroy = function () {
	this.display.parentElement.removeChild(this.display);
	this.display = null;
}

// Sets the value of the specific indice, row or column specified
matrix.prototype.set = function (i, j, k) {
	if (i != undefined && j != undefined) {
		return this._setIndice(i, j, k);
	} else if (i != undefined) {
		return this._setRow(i, k);
	} else if (j != undefined) {
		return this._setColumn(j, k);
	} else {
		throw "No arguments specified.";
	}
};

matrix.prototype._setIndice = function (i, j, k) {
	this.indices[i].indices[j] = k;
	this.getInput(i, j).value = k.toString();
};

matrix.prototype._setRow = function (i, k) {
	var that;
	if (k instanceof Array) {
		that = new vector(k);
	} else if (k instanceof vector) {
		that = k;
	} else {
		throw "Specified value is not a vector.";
	}

	this.indices[i] = clone(k);
	for (var u = 0; u < this.n; u ++) {
		this.getInput(u).value = that.indices[u].toString();
	}
};

matrix.prototype._setColumn = function (j, k) {
	var that;
	if (k instanceof Array) {
		that = new vector(k);
	} else if (k instanceof vector) {
		that = k;
	} else {
		throw "Specified value is not a vector.";
	}

	for (var i = 0; i < this.m; i ++) {
		this.indices[i].indices[j] = that.indices[i];
		this.getInput(i, j).value = that.indices[i].toString();
	}
};


// Converts a matrices data into an excel readable format and selects it to allow the user to copy it
matrix.prototype.export = function () {
	var data = "";
	for (var i = 0; i < this.m; i ++) {
		if (i != this.intrinsic.length - 1) {
			data += this.get(i).indices.join("\t") + "\n";
		} else {
			data += this.get(i).indices.join("\t");
		}
	}

	window.prompt("Hit Ctrl-c", data);
};

// Creates the transposition of the matrix
matrix.prototype.transpose = function (name) {
	var newMatrix = [];
	for (var i = 0; i < this.m; i ++) {
		var tmp = [];
		for (var j = 0; j < this.n; j ++) {
			tmp.push(this.get(i, j));
		}
		newMatrix.push(tmp);
	}
	return new matrix(newMatrix, name);
};

// matrix.prototype.mmult = function (that) {
// 	var outMatrix = new matrix(this.m, that.n);
// 	if (this.n == that.m) {
// 		for (var i = 0; i < that.n; i ++) {
// 			var thatColumn = that.getColumn(i);
// 			for (var j = 0; j < this.m; j ++) {
// 				var thisRow = this.getRow(j);
// 				outMatrix.setValue(i, j, thatColumn.dot(thisRow));
// 			}
// 		}
// 		return outMatrix;
// 	} else {
// 		throw "Matrices must have valid corresponding dimensions";
// 	}
// };

// matrix.prototype.augment = function (mat) {
	
// };