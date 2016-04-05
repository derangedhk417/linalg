var degreesToRadians = function (deg) {
	return (deg / 180) * Math.PI;
};

var radiansToDegrees = function (rad) {
	return (rad / Math.PI) * 180;
};

var vector = function (arr) {
	if (arr) {
		if (arr instanceof Array) {
			this.intrinsic = arr;
		} else {
			throw ("invalid constructor argument!");
		}
	} else {
		throw ("no constructor argument!");
	}

	this.n = this.intrinsic.length;
};

vector.prototype.sumSquared = function() {
	var sum = 0;
	for (i in this.intrinsic) {
		sum += Math.pow(this.intrinsic[i], 2);
	}
	return sum;
};

vector.prototype.magnitude = function () {
	return Math.sqrt(this.sumSquared());
};

vector.prototype.unit = function () {
	var newVector = [];
	var mag = this.magnitude();
	for (i in this.intrinsic) {
		newVector.push(this.intrinsic[i] / mag);
	}
	return new vector(newVector);
};

vector.prototype.v = function (i) {
	return this.intrinsic[i - 1];
}

vector.prototype.dot = function (vec) {
	var other;
	if (vec instanceof vector) {
		other = vec;
	} else {
		other = new vector(vec);
	}

	if (other.n == this.n) {
		var products = [];
		for (i in this.intrinsic) {
			products.push(this.intrinsic[i] * other.intrinsic[i]);
		}
		return products.reduce(function (last, current) {
			return last + current;
		});
	} else {
		throw ("vectors have different dimensions!");
	}
};

vector.prototype.cross = function (vec) {
	var other;
	if (vec instanceof vector) {
		other = vec;
	} else {
		other = new vector(vec);
	}

	if (other.n == 3 && 3 == this.n) {
		return new vector([
			this.v(2) * other.v(3) - this.v(3) * other.v(2),
			this.v(3) * other.v(1) - this.v(1) * other.v(3),
			this.v(1) * other.v(2) - this.v(2) * other.v(1)
			]);
	} else {
		throw ("cross product not valid for any vector that is not in R^3");
	}
}

vector.prototype.angle = function (vec) {
	var v;
	if (vec instanceof vector) {
		v = vec;
	} else {
		v = new vector(vec);
	}

	var u = this;
	if (u.n == 2 && 2 == v.n) {
		return Math.acos(
			u.dot(v)
			/
			(u.magnitude() * v.magnitude())
		);
	} else {
		throw ("angle not valid for any vector that is not in R^2");
	}
};

var matrix = function (vals, n) {
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
	var handlePaste = function (e) {
		//setTimeout(function () {
			var pasteData = e.clipboardData.getData('text/plain');
			var rows = pasteData.split("\n");
			if (rows[rows.length - 1].length == 0) {
				rows.pop();
			}
			for (i in rows) {
				rows[i] = rows[i].split("\t");
			}
			if (rows.length != this.parentMatrix.m) {
				throw "Invalid size";
			}
			if (rows[0].length != this.parentMatrix.n) {
				throw "Invalid size";
			}

			for (i in rows) {
				for (j in rows[i]) {
					try {
						this.parentMatrix.setValue(i, j, parseFloat(rows[i][j]));
					} catch (e) {
						this.parentMatrix.setValue(i, j, 0);
					}
				}
			}
			setTimeout(function () {
				this.parentMatrix.setValue(0, 0, parseFloat(rows[0][0]));
			}.bind(this), 400);
		//}, 300);
	};


	matrixDisplay.addEventListener("paste", handlePaste);

	

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

matrix.prototype.transpose = function () {
	var out = new matrix(this.n, this.m);
	for (var i = 0; i < this.m; i ++) {
		for (var j = 0; j < this.n; j ++) {
			out.setValue(j, i, this.getValue(i, j));
		}
	}
	return out;
};