var matrix = function (vals, n, name) {
	if (vals) {
		// See if argument is array
		if (vals instanceof Array) {
			// Set m value
			this.m = vals.length;
			// Check array validity
			if (this.m < 1) {
				throw ("array of length zero given!");
			} else {
				// Set n value
				this.n = vals[0].length;
				for (i in vals) {
					// Make sure that array has valid length fro each row
					if (vals[i].length != this.n) {
						throw ("not all rows have equal length!");
					}
				}
			}
		} else if (typeof vals == "number") {
			// If m and n where specified, set them
			if (typeof n == "number") {
				this.m = vals;
				this.n = n;
			} else {
				throw ("invalid constructor value specified");
			}
		} else {
			throw ("invalid constructor value specified");
		}
	} else {
		throw ("no constructor value specified");
	}

	this.intrinsic = [];
	// create instrinsic data
	if (vals instanceof Array) {
		// If we have an array, fill in the data
		for (i in vals) {
			this.intrinsic.push(new vector(vals[i]));
		}
	} else {
		// If we don't have an array, create zero vectors
		for (var i = 0; i < this.m; i ++) {
			this.intrinsic.push(new vector(new Array(this.n)));
			this.intrinsic[i].intrinsic.fill(0);
		}
	}

	this.display = document.createElement("div");
	this.display.classList.add("item");


	this.display.appendChild(document.createElement("div"));
	this.display.childNodes[0].classList.add("item-detail");
	this.display.childNodes[0].innerHTML = "<span class=\"item-title\">Matrix ?</span>\
											<span class=\"item-info\">" + this.m + " x " + this.n + " matrix</span>";
	this.display.appendChild(document.createElement("div"));
	this.display.childNodes[1].classList.add("item-data");
	this.display.childNodes[1].appendChild(document.createElement("div"));
	this.display.childNodes[1].childNodes[0].classList.add("matrix");
	var matrixDisplay = this.display.childNodes[1].childNodes[0];
	matrixDisplay.parentMatrix = this;

	var handleChange = function (e) {
		try {
			this.matrixParent.intrinsic[this.i].intrinsic[this.j] = parseFloat(this.value);
		} catch (e) {
			this.matrixParent.intrinsic[this.i].intrinsic[this.j] = this.value.toString();
		}	
	};

	for (i in this.intrinsic) {
		matrixDisplay.appendChild(document.createElement("div"));
		var row = matrixDisplay.childNodes[i];
		row.classList.add("row");
		for (var j = 0; j < this.intrinsic[i].intrinsic.length; j ++) {
			row.appendChild(document.createElement("div"));
			var cell = row.childNodes[j];
			cell.classList.add("element");
			cell.appendChild(document.createElement("input"));
			var input = cell.firstChild;
			input.setAttribute("type", "text");
			input.classList.add("matrix-element");
			input.value = this.intrinsic[i].intrinsic[j];
			input.i = i;
			input.j = j;
			input.matrixParent = this;
			input.addEventListener("keyup", handleChange);
		}
	}
	document.querySelector("#content").appendChild(this.display);
	if (name) {
		window[name] = this;
		this.setName(name);
	}
}

matrix.prototype.setName = function (name) {
	this.name = name;
	this.display.querySelector(".item-title").innerHTML = "Matrix " + name;
}

matrix.prototype.destroy = function () {
	this.display.parentElement.removeChild(this.display);
	this.display = null;
};

matrix.prototype.setValue = function (m, n, v) {
	this.intrinsic[m].intrinsic[n] = v;
	this.display.childNodes[1].childNodes[0].childNodes[m].childNodes[n].firstChild.value = v.toString();
};

matrix.prototype.getValue = function (m, n) {
	return this.intrinsic[m].intrinsic[n];
}

matrix.prototype.export = function () {
	var data = "";
	for (i in this.intrinsic) {
		if (i != this.intrinsic.length - 1) {
			data += this.intrinsic[i].intrinsic.join("\t") + "\n";
		} else {
			data += this.intrinsic[i].intrinsic.join("\t");
		}
	}
	window.prompt("Hit Crtl-c", data);
};

matrix.prototype.transpose = function (name) {
	var out = new matrix(this.n, this.m, name);
	for (var i = 0; i < this.m; i ++) {
		for (var j = 0; j < this.n; j ++) {
			out.setValue(j, i, this.getValue(i, j));
		}
	}
	return out;
};

matrix.prototype.getColumn = function (n) {
	var out = [];
	for (i in this.intrinsic) {
		out.push(this.intrinsic[i].intrinsic[n]);
	}
	return new vector(out);
};

matrix.prototype.getRow = function (m) {
	return this.intrinsic[m];
};

matrix.prototype.mmult = function (that) {
	var outMatrix = new matrix(this.m, that.n);
	if (this.n == that.m) {
		for (var i = 0; i < that.n; i ++) {
			var thatColumn = that.getColumn(i);
			for (var j = 0; j < this.m; j ++) {
				var thisRow = this.getRow(j);
				outMatrix.setValue(i, j, thatColumn.dot(thisRow));
			}
		}
		return outMatrix;
	} else {
		throw "Matrices must have valid corresponding dimensions";
	}
};

matrix.prototype.augment = function (mat) {
	
};