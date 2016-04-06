var degreesToRadians = function (deg) {
	return (deg / 180) * Math.PI;
};

var radiansToDegrees = function (rad) {
	return (rad / Math.PI) * 180;
};

function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

var epsilon = 0.000001;

// Argument must be array or another vector
// Calls a function based on the constructor argument
// Either way, it copies the values from the argument, it does not work by reference
// Return: always true
// Throws: "Invalid constructor argument."
var vector = function (av, name) {
	if (av instanceof Array) {
		return this._arrayConstructor(av, name);
	} else if (av instanceof vector) {
		return this._vectorConstructor(av, name);
	} else {
		throw "Invalid constructor argument.";
	}
};

// The intrinsic array object that contains the data is called indices
vector.prototype._arrayConstructor = function (arr, name) {
	this.indices = clone(arr);
	return this._generalConstructor(name);
};

vector.prototype._vectorConstructor = function (vec, name) {
	this.indices = clone(vec.indices);
	return this._generalConstructor(name);
};

// Right now this doesn't do anything
// I'll likely add more constructor logic later
vector.prototype._generalConstructor = function (name) {
	if (name) {
		this.name = name;
		window[name] = this;
	}
	return true;
};

// Sets the internal name of the vector an adds it to the window
vector.prototype.setName = function (name) {
	this.name = name;
	window[name] = this;
};

// Retrieves either the value at the indice specified or
// if j is not undefined, a new vector between the two indices inclusive
// Return: number, string or array
// Throws: none
vector.prototype.get = function (i, j) {
	if (j !== undefined) {
		return this._getRange(i, j);
	} else {
		return this._getIndice(i);
	}
}

// Simply retrieves the item at the indice
vector.prototype._getIndice = function (i) {
	return this.indices[i];
};

// Attempts to retrieve the range
// Will return any valid values within the range without throwing exceptions
vector.prototype._getRange = function (i, j) {
	var newVector = [];
	for (var k = i; (k < this.indices.length) && (k <= j); k ++) {
		newVector.push(this.indices[k]);
	}
	return new vector(newVector);
};

// Sets the value at the indice or, sets the values of the range specified by i -> j
vector.prototype.set = function (i, j, k) {
	if (k !== undefined) {
		this._setRange(i, j, k);
	} else {
		this._setIndice(i, j);
	}
};

vector.prototype._setIndice = function (i, j) {
	this.indices[i] = j;
};

vector.prototype._setRange = function (i, j, k) {
	var newVector = [];
	for (var u = i, v = 0; (u < this.indices.length) && (u < k.length) && (u <= j); u ++, v ++) {
		this.indices[u] = k[v];
	}
};

// Calls cb on each element in the vector,
// passing it the element value, the indice and the base array.
vector.prototype.each = function (cb) {
	var f = cb.bind(this);
	for (var i in this.indices) {
		f(this.indices[i], i, this.indices);
	}
};

// Returns true if this is a zero vector
// false otherwise
vector.prototype.isZero = function () {
	for (var i in this.indices) {
		if (this.indices[i] != 0) return false;
	}
	return true;
};

// Returns true if there are any non numeric values in the array
vector.prototype.containsNaN = function () {
	for (var i in this.indices) {
		if (isNaN(this.indices[i])) return true;
	}
	return false;
};

// Computes the sum of the squares of the elements in the vector
vector.prototype.sumSquared = function () {
	if (this.containsNaN()) {
		return this._sumSquaredExpr();
	} else {
		return this._sumSquaredVal();
	}
};

vector.prototype._sumSquaredExpr = function () {
	var expr = [];
	var sum = 0;
	this.each(function (e, i, a) {
		if (isNaN(e)) {
			expr.push("Math.pow(" + e + ", 2)");
		} else {
			sum += Math.pow(e, 2);
		}
	});
	return expr.join(" + ") + " + " + sum;
};

vector.prototype._sumSquaredVal = function () {
	var sum = 0;
	this.each(function (e, i, a) {
		sum += Math.pow(e, 2);
	});
	return sum;
};

// Computes the magnitude or length of the vector
vector.prototype.magnitude = function () {
	if (this.containsNaN()) {
		return this._magnitudeExpr();
	} else {
		return this._magnitudeVal();
	}
};

vector.prototype._magnitudeExpr = function () {
	return "Math.sqrt(" + this.sumSquared() + ")";
};

vector.prototype._magnitudeVal = function () {
	return Math.sqrt(this.sumSquared());
};


// Creates a unit vector from the vector
vector.prototype.unitVector = function () {
	if (this.containsNaN()) {
		return this._unitVectorExpr();
	} else {
		return this._unitVectorVal();
	}
};

vector.prototype._unitVectorExpr = function () {
	var newVector = [];
	var mag = this.magnitude();
	this.each(function (e, i, a) {
		if (isNaN(e) || isNaN(mag)) {
			newVector.push("" + e + " / " + mag);
		} else {
			newVector.push(e / mag);
		}
	});
	return new vector(newVector);
};

vector.prototype._unitVectorVal = function () {
	var newVector = [];
	var mag = this.magnitude();
	this.each(function (e, i, a) {
		newVector.push(e / mag);
	});
	return new vector(newVector);
};

// Attempts to evaluate any elements in the vector that are expressions
vector.prototype.evaluate = function () {
	var output = new vector(this);
	this.each(function (e, i, a) {
		try {
			output.set(i, eval(e));
		} catch (e) {
			console.warn("eval(" + this.name + ".get(" + i + ")) threw an exception.");
		}
	});
	return output;
};

// Returns the dimensions of the vector
vector.prototype.n = function () {
	return this.indices.length;
};

// Computes the dot product between this and the specified vector
vector.prototype.dot = function (vec) {
	var that;
	if (vec instanceof vector) {
		that = vec;
	} else {
		that = new vector(vec);
	}

	if (this.n() == that.n()) {
		var sum = 0;
		var exprs = [];
		this.each(function (e, i, a) {
			if (isNaN(e) || isNaN(that.get(i))) {
				exprs.push("" + e + " * " + that.get(i));
			} else {
				sum += e * that.get(i);
			}
		});
		if (exprs.length > 0) {
			return "" + sum + " + " + exprs.join(" + ");
		} else {
			return sum;
		}
	} else {
		throw "Vectors are not of equal length.";
	}
};

// Determines whether or not one vector is orthogonal to another
vector.prototype.orthogonol = function (vec) {
	var that;
	if (vec instanceof vector) {
		that = vec;
	} else {
		that = new vector(vec);
	}
	if (this.containsNaN() || that.containsNaN()) {
		return "" + this.dot(that) + " < epsilon";
	} else {
		return this.dot(vec) < epsilon;
	}
};

// Returns the vector multiplied by n
vector.prototype.mult = function (n) {
	var newVector = [];
	this.each(function (e, i, a) {
		if (isNaN(e)) {
			newVector.push("" + e + " * " + n);
		} else {
			newVector.push(e * n);
		}
	});
	return new vector(newVector);
};

// vector.prototype.cross = function (vec) {
// 	var other;
// 	if (vec instanceof vector) {
// 		other = vec;
// 	} else {
// 		other = new vector(vec);
// 	}

// 	if (other.n == 3 && 3 == this.n) {
// 		return new vector([
// 			this.v(2) * other.v(3) - this.v(3) * other.v(2),
// 			this.v(3) * other.v(1) - this.v(1) * other.v(3),
// 			this.v(1) * other.v(2) - this.v(2) * other.v(1)
// 			]);
// 	} else {
// 		throw ("cross product not valid for any vector that is not in R^3");
// 	}
// }

// vector.prototype.angle = function (vec) {
// 	var v;
// 	if (vec instanceof vector) {
// 		v = vec;
// 	} else {
// 		v = new vector(vec);
// 	}

// 	var u = this;
// 	if (u.n == 2 && 2 == v.n) {
// 		return Math.acos(
// 			u.dot(v)
// 			/
// 			(u.magnitude() * v.magnitude())
// 		);
// 	} else {
// 		throw ("angle not valid for any vector that is not in R^2");
// 	}
// };