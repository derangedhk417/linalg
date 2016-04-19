aMatrix.prototype.REF = function () {
	//debugger;
	// These variables hold the row and column that we are basing our Gauss elimination on
	var baseRow    = 0;
	var baseColumn = 0;
	// Start with an infinite loop because the number of iterations is not based strictly on matrix dimensions
	while (true) {
		var currentRow = baseRow + 1;
		while (currentRow < this.leftMatrix.m) { // Iterate over every row under the base row
			// Get the sub vector from the top row
			var top = this.get(baseRow, undefined).get(baseColumn, this.leftMatrix.n + this.augMatrix.n - 1);
			var bottom = this.get(currentRow, undefined).get(baseColumn, this.leftMatrix.n + this.augMatrix.n - 1);

			var eliminated = this.gaussEliminate(
					top,
					bottom
					);
				
			var write = this.get(currentRow, undefined);
			write.set(baseColumn, this.leftMatrix.n + this.augMatrix.n - 1, eliminated.indices);
			this.set(
				currentRow, 
				undefined, 
				write
				);
			currentRow ++;
		}
		
		var leftmost = 1000;
		// The column with the leftmost non-zero value will tell us which column is the next base column
		for (var i = baseRow + 1; i < this.leftMatrix.m; i ++) {
			if (this.get(i, undefined).firstNonZero() < leftmost) {
				leftmost = this.get(i, undefined).firstNonZero();
			}
		}
		baseColumn = leftmost;

		// Here we need to decide if it is necessary to go to the next row

		if (baseRow == this.leftMatrix.m - 2) {
			break; // We are at the bottom
		}

		var foundNonZero = false;
		// Check to see if the next rows are all zero in the non-augmented part
		for (var i = baseRow + 1; i < this.leftMatrix.m; i ++) {
			if (!this.leftMatrix.get(i).isZero()) {
				foundNonZero = true;
			}
		}
		if (!foundNonZero) {
			break; // All subsequent rows in the left matrix are zero vectors
		}
		

		// Here we need to sort so that the vectors with the leftmost non-zeros are at the top
		// First we start a loop
		while (true) {
			// We iterate over each row vector under the base row vector
			for (var i = baseRow + 1; i < this.leftMatrix.m; i ++) {
				// We iterate over each row under the current row vector
				for (var j = i + 1; j < this.leftMatrix.m; j ++) {
					// We see if the row under this row has an earlier non zero
					if (this.leftMatrix.get(j).firstNonZero() < this.leftMatrix.get(i).firstNonZero()) {
						this.swap(i, j); // If the non-zero is earlier, we swap
					}
				}
			}

			var sorted = true;
			// We see if the set is sorted, if not, we keep going
			for (var i = baseRow + 1; i < this.leftMatrix.m - 1; i ++) {
				if (this.leftMatrix.get(i).firstNonZero() > this.leftMatrix.get(i + 1).firstNonZero()) {
					sorted = false;
				}
			}
			if (sorted) {
				break;
			}
		}

		baseRow ++;
		if (baseColumn >= this.leftMatrix.n) {
			break; // We have reached the last column
		}
	}


	// By this point all of the pivots should be isolated
	// Now we need to move upwards from each pivot in order to get zeros above all of the pivots

	
	var baseRow    = 0;
	var baseColumn = 0;

	// Find the base column and base row to start at

	// Find base row
	for (var i = this.leftMatrix.m - 1; i > 0; i --) {
		if (!this.leftMatrix.get(i).isZero()) {
			baseRow = i;
			break;
		}
	}

	// Base column should be the first non zero column in the row
	baseColumn = this.leftMatrix.get(baseRow).firstNonZero();

	// Iterate over the rows backwards until and including the second row
	while (baseRow > 0) {
		// Iterate upwards from the current pivot
		var currentRow = baseRow - 1;
		while (currentRow >= 0) {
			// Get the sub vector from the top row
			var top = this.get(currentRow, undefined).get(baseColumn, this.leftMatrix.n + this.augMatrix.n - 1);
			var bottom = this.get(baseRow, undefined).get(baseColumn, this.leftMatrix.n + this.augMatrix.n - 1);

			var eliminated = this.gaussEliminate(
					bottom,
					top
					);
				
			var write = this.get(currentRow, undefined);
			write.set(baseColumn, this.leftMatrix.n + this.augMatrix.n - 1, eliminated.indices);
			this.set(
				currentRow, 
				undefined, 
				write
				);

			currentRow --;
		}
		// By this point all cells above and to the right of this pivot should be set properly
		
		// Find the next row up with an earlier non-zero cell
		for (var i = baseRow - 1; i >= 0; i --) {
			if (this.leftMatrix.get(i).firstNonZero() < baseColumn) {
				baseRow = i;
				break;
			}
		}

		// Now we need to set the next base column
		baseColumn = this.leftMatrix.get(baseRow).firstNonZero();
	}
	// By this point the matrix should be in full REF
	this.inREF = true;
};

aMatrix.prototype.RREF = function () {
	if (!this.inREF) {
		throw "Matrix is not yet in REF!";
	}

	// Iterate over each pivot column and divide its row by the pivot value
	var p = this.getPivots();

	for (var i = 0; i < p.length; i ++) {
		var row = this.get(p[i][0]);
		var res = row.mult(1.0 / (row.get(p[i][1])));
		this.set(p[i][0], undefined, res);
	}

	this.inRREF = true;
};


// Returns an array of ordered pairs representing the coordinates of the pivots of the augmented matrix
aMatrix.prototype.getPivots = function () {
	if (!this.inREF) {
		throw "Matrix is not yet in REF!";
	}

	var pivots = [];

	var lastColumn = 1000;
	// Iterate from bottom to top
	for (var i = this.leftMatrix.m - 1; i >= 0; i --) {
		if (!this.leftMatrix.get(i).isZero()) {
			if (this.leftMatrix.get(i).firstNonZero() < lastColumn) {
				pivots.push([i, this.leftMatrix.get(i).firstNonZero()]);
				lastColumn = this.leftMatrix.get(i).firstNonZero();
			}
		}
	}
	return pivots;
};

aMatrix.prototype.pivotCount = function () {
	return this.getPivots().length;
};

aMatrix.prototype.rank = function () {
	return this.pivotCount();
};

aMatrix.prototype.analyze = function () {
	if (!this.inRREF) {
		throw "Matix is not in RREF!";
	}

	// See if the system can be solved
	for (var i = 0; i < this.leftMatrix.m; i ++) {
		if (this.leftMatrix.get(i).isZero() && !this.augMatrix.get(i).isZero()) {
			console.log("  ::  No Solution, inconsistent");
			return "done";
		}
	}

	if (this.rank() == this.leftMatrix.n) {
		console.log("  ::  Exactly one solution, consistent, one-to-one :");
		console.log(this.get(undefined, this.leftMatrix.n).get(0, this.leftMatrix.n - 1));
	} else {
		console.log("  ::  Multiple solutions, consistent, many-to-one");
		console.log("      Call this.solve() to find solutions");
	}
};

aMatrix.prototype.hasSingleSolution = function () {
	if (!this.inRREF) {
		throw "Matix is not in RREF!";
	}

	// See if the system can be solved
	for (var i = 0; i < this.leftMatrix.m; i ++) {
		if (this.leftMatrix.get(i).isZero() && !this.augMatrix.get(i).isZero()) {
			return false;
		}
	}

	if (this.rank() == this.leftMatrix.n) {
		return true;
	} else {
		return false;
	}
};

aMatrix.prototype.hasMultipleSolutions = function () {
	if (!this.inRREF) {
		throw "Matix is not in RREF!";
	}

	// See if the system can be solved
	for (var i = 0; i < this.leftMatrix.m; i ++) {
		if (this.leftMatrix.get(i).isZero() && !this.augMatrix.get(i).isZero()) {
			return false;
		}
	}

	if (this.rank() == this.leftMatrix.n) {
		return false;
	} else {
		return true;
	}
};

aMatrix.prototype.isConsistent = function () {
	if (this.hasSingleSolution() || this.hasMultipleSolutions()) {
		return true;
	} else {
		return false;
	}
};

aMatrix.prototype.specificSolution = function () {
	if (this.hasSingleSolution()) {
		return this.get(undefined, this.leftMatrix.n).get(0, this.leftMatrix.n - 1)
	} else if (this.hasMultipleSolutions()) {
		var outVector = [];
		for (var i = 0; i < this.leftMatrix.n; i ++) {
			outVector.push(0);
		}
		var pivots = this.getPivots();
		for (var i = 0; i < this.rank(); i ++) {
			var pm = pivots[i][0];
			var pn = pivots[i][1];
			outVector[pn] = this.augMatrix.get(pm, 0);
		}
		return new vector(outVector);
	} else {
		throw "Sysem is inconsistent";
	}
}

// The null space is the set of vectors that solve the equation Ax = 0
// It is also the set of values that when added to the specific solution produce other solutions
aMatrix.prototype.nullSpace = function () {
	if (!this.hasMultipleSolutions()) {
		throw "System has only a single solution. It does not make sense to generate null space.";
	}
	var nullBasis = [];
	var npnzc = this.nonPivotNonZeroColumns();
	var pivots = this.getPivots();
	for (var i = 0; i < npnzc.length; i ++) {
		var solution = [];
		var column = npnzc[i];
		for (var j = 0; j < this.leftMatrix.n; j ++) {
			solution.push(0); // Fill with zeros
		}
		// Iterate over the cells in the column
		for (var j = 0; j < this.leftMatrix.m; j ++) {
			if (!isZero(this.get(j, column))) {
				// If this cell is not zero, we need to incorporate it in the solution
				var pn; // n value for the pivot in this row
				// Get the pivot n value for this row
				for (var k = 0; k < pivots.length; k ++) {
					if (pivots[k][0] == j) {
						pn = pivots[k][1];
						break;
					}
				}
				solution[pn] = this.get(j, column);
				solution[column] = -1;
			}
		}
		nullBasis.push(new vector(solution));
	}
	return nullBasis;
};

aMatrix.prototype.nonPivotNonZeroColumns = function () {
	if (!this.inRREF) {
		throw "Matrix is not in RREF!";
	}
	var output = [];
	var pivots = this.getPivots();
	for (var i = 0; i < this.leftMatrix.n; i ++) {
		var c = this.leftMatrix.get(undefined, i);
		var foundPivot = false;
		for (var j = 0; j < pivots.length; j ++) {
			if (pivots[j][1] == i) {
				foundPivot = true;
			}
		}
		if (!foundPivot && !c.isZero()) {
			output.push(i);
		}
	}
	return output;
};

aMatrix.prototype.solve = function () {
	if (this.hasSingleSolution()) {
		console.log("Single specific solution: ");
		console.log(this.specificSolution());
	} else if (this.hasMultipleSolutions()) {
		console.log("Multiple solutions, specific solution is:");
		console.log(this.specificSolution());
		// Need to add null space here
		console.log("The set of solutions to this system is in the space derived by all possible sums of the specific solution and any number of values in the null space of this matrix.");
		console.log(this.nullSpace());
	} else {
		throw "System is inconsistent";
	}
};

// Returns an array of vectors representing the basis of the column space of the matrix
aMatrix.prototype.columnSpaceBasis = function () {
	if (!this.inRREF) {
		throw "Matrix is not in RREF!";
	}

	if (this.hasSingleSolution()) {
		// Get all of the pivot columns an return them
		var output = [];
		var pivots = this.getPivots();
		for (var i = 0; i < pivots.length; i ++) {
			output.push(new vector(this.get(undefined, pivots[i][1])));
		}
		return output;
	} else if (this.hasMultipleSolutions()) {
		// Get all of the pivot columns an return them
		var output = [];
		var pivots = this.getPivots();
		for (var i = 0; i < pivots.length; i ++) {
			output.push(new vector(this.get(undefined, pivots[i][1])));
		}
		return output;
	} else {
		throw "System is inconsistent";
	}
};


// Takes two vectors as arguments
aMatrix.prototype.gaussEliminate = function (top, bottom) {
	var coefficient;
	if (isNaN(bottom.get(0)) || isNaN(top.get(0))) {
		coefficient = "-" + bottom.get(0) + " / " + top.get(0);
	} else {
		coefficient = -bottom.get(0) / top.get(0);
	}
	var additive = top.mult(coefficient);
	return bottom.add(additive);
};