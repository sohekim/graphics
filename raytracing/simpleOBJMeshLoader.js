/* Minimalist OBJ loader, returns three.js Geometry */

function loadOBJFromFile(url, onLoad, onProgress, onError) {
	let loader = new THREE.FileLoader(THREE.DefaultLoadingManager);
	new THREE.FileLoader().load(url,
		function(text) {
			onLoad(parseOBJAsMesh(text));
		},
		onProgress, onError
	);
}

function loadOBJFromString(text, onLoad) {
	onLoad(parseOBJAsMesh(text));
}

function parseOBJAsMesh(text) {
	if(text.indexOf('\r\n')!==-1)	{ text = text.replace(/\r\n/g, '\n'); }
	if(text.indexOf('\\\n')!==-1) { text = text.replace(/\\\n/g, '' ); }
	let lines = text.split( '\n' );
	let line = '', lineFirstChar = '';
	let lineLength = 0;
	let result = [];
	let trimLeft = (typeof ''.trimLeft === 'function');
	let mesh = new THREE.Geometry();
	for(let i=0, l=lines.length; i<l; i++) {
		line = lines[i];
		line = trimLeft ? line.trimLeft() : line.trim();
		lineLength = line.length;
		if(lineLength === 0) continue;
		lineFirstChar = line.charAt(0);
		if(lineFirstChar === '#') continue;
		if(lineFirstChar === 'v') {
			let data = line.split( /\s+/ );
			switch(data[0]) {
			case 'v':
				// create vertices
				mesh.vertices.push(new THREE.Vector3(parseFloat(data[1]),parseFloat(data[2]),parseFloat(data[3])));
				break;
			default:
				// ignore all other vertex attributes
			}
		} else if(lineFirstChar === 'f') {
			let lineData = line.substr( 1 ).trim();
			let vertexData = lineData.split( /\s+/ );
			let faceVertices = [];
			for(let j=0, jl=vertexData.length; j<jl; j++) {
				let vertex = vertexData[j];
				if(vertex.length>0) {
					var vertexParts = vertex.split( '/' );
					faceVertices.push(vertexParts);
				}
			}
			// tessellate into triangles
			let v1 = faceVertices[0];
			for (let j=1, jl=faceVertices.length-1; j<jl; j++ ) {
				var v2 = faceVertices[j];
				var v3 = faceVertices[j+1];
				// create face
				mesh.faces.push(new THREE.Face3(parseInt(v1[0], 10)-1, parseInt(v2[0], 10)-1, parseInt(v3[0], 10)-1));
			}			
		}
	}
	mesh.normalize();
	return mesh;
}

