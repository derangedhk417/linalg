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