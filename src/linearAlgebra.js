window.data = {};

var guid = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

var degreesToRadians = function (deg) {
	return (deg / 180) * Math.PI;
};

var radiansToDegrees = function (rad) {
	return (rad / Math.PI) * 180;
};

var vector = function (arr, name) {
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
	if (name) {
		window.data[name] = this;
	}
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

vector.prototype.scalarMult = function (n) {
	var arr = this.intrinsic;
	for (i in arr) {
		arr[i] *= n;
	}
	return new vector(arr);
};

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
		window.data[name] = this;
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

document.addEventListener("DOMContentLoaded", function (e) {
	document.querySelector("#content").addEventListener("paste", function (e) {
		var pasteData = e.clipboardData.getData('text/plain');
		var rows = pasteData.split("\n");
		if (rows[rows.length - 1].length == 0) {
			rows.pop();
		}
		for (i in rows) {
			rows[i] = rows[i].split("\t");
		}
		
		for (i in rows) {
			for (j in rows[i]) {
				try {
					rows[i][j] = parseFloat(rows[i][j]);
				} catch (e) {
					rows[i][j] = rows[i][j];
				}
			}
		}
		var name = guid();
		new matrix(rows, undefined, name);
		console.log(name);
	});
});