// Creates an augmented matrix and optionally names it.
// If the name is specified, it will also generate a display for it
var aMatrix = function (mat, aug_mat, name) {
	this.leftMatrix = new matrix(mat);
	this.augMatrix = new matrix(aug_mat);
	this.inREF = false;
	this.inRREF = false;
	if (name) {
		this.setName(name);
	}
};

// Creates an interface element for the matrix
aMatrix.prototype.show = function () {
	this.display = document.createElement("div");
	this.display.classList.add("item");

	this.display.appendChild(document.createElement("div"));
	this.display.childNodes[0].classList.add("item-detail");
	this.display.childNodes[0].innerHTML = "<span class=\"item-title\">Augmented Matrix " + this.name + "</span>\
											<span class=\"item-info\"></span>";
	this.display.appendChild(document.createElement("div"));
	this.display.childNodes[1].classList.add("item-data");
	this.display.childNodes[1].appendChild(document.createElement("div"));
	this.display.childNodes[1].childNodes[0].classList.add("matrix");
	this.leftMatrix.display = this.display;
	this.augMatrix.display = this.display;
	this.augMatrix.j_offset = this.leftMatrix.n;
	var matrixDisplay = this.display.childNodes[1].childNodes[0];
	matrixDisplay.parentMatrix = this;

	var handleChange = function (e) {
		if (this.value.length > 0) {
			if (!isNaN(this.value)) {
				this.matrixParent.set(this.i, this.j, parseFloat(this.value));
			} else {
				this.matrixParent.set(this.i, this.j, this.matrixParent.name + ".get(" + (parseInt(this.i)) + ", " + (parseInt(this.j)) + ")");
			}
		}
	};
	
	// Create the left part of the matrix
	for (var i = 0; i < this.leftMatrix.m; i ++) {
		matrixDisplay.appendChild(document.createElement("div"));
		var row = matrixDisplay.childNodes[i];
		row.classList.add("row");
		for (var j = 0; j < this.leftMatrix.n; j ++) {
			row.appendChild(document.createElement("div"));
			var cell = row.childNodes[j];
			cell.classList.add("element");
			cell.appendChild(document.createElement("input"));
			var input = cell.firstChild;
			input.setAttribute("type", "text");
			input.classList.add("matrix-element");
			input.value = this.leftMatrix.get(i, j);
			input.i = i;
			input.j = j;
			input.matrixParent = this.leftMatrix;
			input.addEventListener("blur", handleChange);
		}
	}

	// Create the right part of the matrix
	for (var i = 0; i < this.augMatrix.m; i ++) {
		var row = matrixDisplay.childNodes[i];
		for (var j = 0; j < this.augMatrix.n; j ++) {
			row.appendChild(document.createElement("div"));
			var cell = row.childNodes[j + this.leftMatrix.n];
			cell.classList.add("element");
			cell.appendChild(document.createElement("input"));
			cell.style.backgroundColor = "#FFBF59";
			var input = cell.firstChild;
			input.setAttribute("type", "text");
			input.classList.add("matrix-element");
			input.value = this.augMatrix.get(i, j);
			input.i = i;
			input.j = j;
			input.matrixParent = this.augMatrix;
			input.addEventListener("blur", handleChange);
		}
	}

	document.querySelector("#content").appendChild(this.display);
};

aMatrix.prototype.setName = function (name) {
	this.name = name;
	this.leftMatrix.name = name + ".leftMatrix";
	this.augMatrix.name = name + ".augMatrix";
	window[name] = this;
	if (!this.display) {
		this.show();
	}
	this.display.querySelector(".item-title").innerHTML = "Matrix " + this.name;
};

// Gets either the specific cell, the specified row or the specified column
aMatrix.prototype.get = function (i, j) {
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

aMatrix.prototype._getIndice = function (i, j) {
	if (j < this.leftMatrix.n) {
		return this.leftMatrix.get(i, j);
	} else {
		return this.augMatrix.get(i, j - this.leftMatrix.n);
	}
};

aMatrix.prototype._getRow = function (i) {
	return this.leftMatrix.get(i).append(this.augMatrix.get(i));
};

aMatrix.prototype._getColumn = function (j) {
	if (j < this.leftMatrix.n) {
		var newVector = [];
		for (var i = 0; i < this.leftMatrix.m; i ++) {
			newVector.push(this.leftMatrix.get(i, j));
		}
		return new vector(newVector);
	} else {
		var newVector = [];
		for (var i = 0; i < this.leftMatrix.m; i ++) {
			newVector.push(this.augMatrix.get(i, j - this.leftMatrix.n));
		}
		return new vector(newVector);
	}
	
};

// Sets the value of the specific indice, row or column specified
aMatrix.prototype.set = function (i, j, k) {
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

aMatrix.prototype._setIndice = function (i, j, k) {
	if (j < this.leftMatrix.n) {
		this.leftMatrix.set(i, j, k);
	} else {
		this.augMatrix.set(i, j - this.leftMatrix.n, k);
	}
};

aMatrix.prototype._setRow = function (i, k) {
	var that = new vector(k);
	var left = [];
	var right = [];
	for (var u = 0; u < this.leftMatrix.n; u ++) {
		left.push(k.get(u));
	}
	for (var u = 0; u < this.augMatrix.n; u ++) {
		right.push(k.get(u + this.leftMatrix.n));
	}
	this.leftMatrix.set(i, undefined, left);
	this.augMatrix.set(i, undefined, right);
};

aMatrix.prototype._setColumn = function (j, k) {
	if (j < this.leftMatrix.n) {
		this.leftMatrix.set(undefined, j, k);
	} else {
		this.augMatrix.set(undefined, j, k);
	}
};

aMatrix.prototype.swap = function (i, j) {
	this.leftMatrix.swap(i, j);
	this.augMatrix.swap(i, j);
};