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
		var name = window.prompt("What should this matrix be named?");
		new matrix(rows, undefined, name);
	});
});