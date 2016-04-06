aMatrix.prototype.REF = function (name) {
	var outLeft = new matrix(this.leftMatrix);
	var outRight = new matrix(this.augMatrix);
	var currentRow = 0;
	while (true) {
		if (this.leftMatrix.m > currentRow + 1) {
			var rowVector = this.leftMatrix.get(currentRow);
			var rowVectorRight = this.augMatrix.get(currentRow);
			if (rowVector.isZero()) {
				this.leftMatrix.swap(currentRow, currentRow + 1);
				this.augMatrix.swap(currentRow, currentRow + 1);
				continue;
			} else {
				var currentColumn = rowVector.firstNonZero();

				var rowAdditive = 1;
				while (rowAdditive < this.leftMatrix.m) {
					var nextRowVector = this.leftMatrix.get(currentRow + 1);
					var nextRowVectorRight = this.augMatrix.get(currentRow + 1);
					var multiplier = -(nextRowVector.get(currentColumn)/ rowVector.get(currentColumn));
					var additive = (new vector(rowVector)).mult(multiplier);
					var additiveRight = (new vector(rowVectorRight)).mult(multiplier);
					var newVector = nextRowVector.add(additive);
					var newVectorRight = nextRowVectorRight.add(additiveRight);
					this.leftMatrix.set(currentRow + 1, undefined, newVector);
					this.augMatrix.set(currentRow + 1, undefined, newVectorRight);
				}
			}
		} else {
			return new aMatrix(outLeft, outRight, name);
		}
	}
};