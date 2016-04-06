// Creates an augmented matrix and optionally names it.
// If the name is specified, it will also generate a display for it
var aMatrix = function (mat, aug_mat, name) {
	this.leftMatrix = new matrix(mat);
	this.augMatrix = new matrix(aug_mat);

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
				this.matrixParent.set(this.i, this.j, this.value);
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
	window[name] = this;
	if (!this.display) {
		this.show();
	}
	this.display.querySelector(".item-title").innerHTML = "Matrix " + this.name;
};