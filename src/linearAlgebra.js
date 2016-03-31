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

var matrix = function (vals) {
	if (vals) {
		if (vals instanceof Array) {
			this.m = vals.length;
			if (this.m < 1) {
				throw ("array of length zero given!");
			} else {
				this.n = vals[0].length;
				for (i in vals) {
					if (vals[i].length != this.n) {
						throw ("not all rows have equal length!");
					}
				}
			}
		} else {
			throw ("invalid constructor value specified");
		}
	} else {
		throw ("no constructor value specified");
	}
}
