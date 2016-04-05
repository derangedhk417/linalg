document.addEventListener("DOMContentLoaded", function (e) {
	document.querySelector("#content").addEventListener("paste", function (e) {
		var name = window.prompt("What should this matrix be named?");
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
				if (!isNaN(rows[i][j])) {
					rows[i][j] = parseFloat(rows[i][j]);
				} else {
					rows[i][j] = name + " (" + (parseInt(i) + 1) + ", " + (parseInt(j) + 1) + ")";
				}
			}
		}
		
		new matrix(rows, undefined, name);
	});
});