/* CMPSCI 373 Homework 4: Subdivision Surfaces */

const panelSize = 600;
const fov = 35;
const aspect = 1;
let scene,
    renderer,
    camera,
    material,
    orbit,
    light,
    surface = null;
let nsubdiv = 0;

let coarseMesh = null; // the original input triangle mesh
let currMesh = null; // current triangle mesh

let flatShading = true;
let wireFrame = false;

let objStrings = [
    box_obj,
    ico_obj,
    torus_obj,
    twist_obj,
    combo_obj,
    pawn_obj,
    bunny_obj,
    head_obj,
    hand_obj,
    klein_obj,
];

let objNames = [
    "box",
    "ico",
    "torus",
    "twist",
    "combo",
    "pawn",
    "bunny",
    "head",
    "hand",
    "klein",
];

function id(s) {
    return document.getElementById(s);
}

function message(s) {
    id("msg").innerHTML = s;
}

function subdivide() {
    let currVerts = currMesh.vertices;
    let currFaces = currMesh.faces;
    let newVerts = [];
    let newFaces = [];
    /* You can access the current mesh data through
     * currVerts and currFaces arrays.
     * Compute one round of Loop's subdivision and
     * output to newVerts and newFaces arrays.
     */
    // ===YOUR CODE STARTS HERE===

    // 0. cloning newVerts into currVerts
    for (let v of currVerts) newVerts.push(v.clone());

    // 1. vertex adjacency data structure
    let vertexAdj = [];
    for (let i = 0; i < currVerts.length; i++) vertexAdj.push(new Set());

    // 2.edge data structure
    let edges = [];

    for (let face of currFaces) {
        vertexAdj[face.a].add(face.b);
        vertexAdj[face.a].add(face.c);

        vertexAdj[face.b].add(face.a);
        vertexAdj[face.b].add(face.c);

        vertexAdj[face.c].add(face.a);
        vertexAdj[face.c].add(face.b);

        // face.a - face.b
        let ab = face.a < face.b ? face.a + "-" + face.b : face.b + "-" + face.a;
        if (edges[ab] == undefined) {
            edges[ab] = { v0: face.a, v1: face.b, n0: face.c };
        } else {
            edges[ab]["n1"] = face.c;
        }

        // face.b - face.c
        let bc = face.b < face.c ? face.b + "-" + face.c : face.c + "-" + face.b;
        if (edges[bc] == undefined) {
            edges[bc] = { v0: face.b, v1: face.c, n0: face.a };
        } else {
            edges[bc]["n1"] = face.a;
        }

        // face.c - face.a
        let ca = face.c < face.a ? face.c + "-" + face.a : face.a + "-" + face.c;
        if (edges[ca] == undefined) {
            edges[ca] = { v0: face.c, v1: face.a, n0: face.b };
        } else {
            edges[ca]["n1"] = face.b;
        }
    }

    // 3. insert new vertex
    // add to newVerts & add index to each edge
    for (let e in edges) {
        let edge = edges[e];
        let newVertex = new THREE.Vector3()
            .addScaledVector(currVerts[edge.v0], 3 / 8)
            .addScaledVector(currVerts[edge.v1], 3 / 8)
            .addScaledVector(currVerts[edge.n0], 1 / 8)
            .addScaledVector(currVerts[edge.n1], 1 / 8);

        newVerts.push(newVertex);
        edge["index"] = newVerts.indexOf(newVertex);
    }

    // 4. update old vertex in newVerts
    for (let i = 0; i < vertexAdj.length; i++) {
        let v = vertexAdj[i];
        let weight =
            (1 / v.size) *
            (5 / 8 -
                (3 / 8 + (1 / 4) * Math.cos((2 * Math.PI) / v.size)) *
                (3 / 8 + (1 / 4) * Math.cos((2 * Math.PI) / v.size)));

        let updatedVertex = new THREE.Vector3().addScaledVector(
            currVerts[i],
            1 - v.size * weight
        );

        for (let neighbor of vertexAdj[i]) {
            updatedVertex.addScaledVector(currVerts[neighbor], weight);
        }
        newVerts[i] = updatedVertex;
    }

    // 5. create triangle
    for (let face of currFaces) {
        let ab = face.a < face.b ? face.a + "-" + face.b : face.b + "-" + face.a;
        let bc = face.b < face.c ? face.b + "-" + face.c : face.c + "-" + face.b;
        let ca = face.c < face.a ? face.c + "-" + face.a : face.a + "-" + face.c;

        let face1 = new THREE.Face3(face.a, edges[ab]["index"], edges[ca]["index"]);
        let face2 = new THREE.Face3(edges[ab]["index"], face.b, edges[bc]["index"]);
        let face3 = new THREE.Face3(edges[ca]["index"], edges[bc]["index"], face.c);
        let face4 = new THREE.Face3(
            edges[ab]["index"],
            edges[bc]["index"],
            edges[ca]["index"]
        );

        newFaces.push(...[face1, face2, face3, face4]);
    }

    // ---YOUR CODE ENDS HERE---
    /* Overwrite current mesh with newVerts and newFaces */
    currMesh.vertices = newVerts;
    currMesh.faces = newFaces;
    /* Update mesh drawing */
    updateSurfaces();
}

window.onload = function(e) {
    // create scene, camera, renderer and orbit controls
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
    camera.position.set(-1, 1, 3);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(panelSize, panelSize);
    renderer.setClearColor(0x202020);
    id("surface").appendChild(renderer.domElement); // bind renderer to HTML div element
    orbit = new THREE.OrbitControls(camera, renderer.domElement);

    light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(camera.position.x, camera.position.y, camera.position.z); // right light
    scene.add(light);

    let amblight = new THREE.AmbientLight(0x202020); // ambient light
    scene.add(amblight);

    // create materials
    material = new THREE.MeshPhongMaterial({
        color: 0xcc8033,
        specular: 0x101010,
        shininess: 50,
    });

    // create current mesh object
    currMesh = new THREE.Geometry();

    // load first object
    loadOBJ(objStrings[0]);
};

function updateSurfaces() {
    currMesh.verticesNeedUpdate = true;
    currMesh.elementsNeedUpdate = true;
    currMesh.computeFaceNormals(); // compute face normals
    if (!flatShading) currMesh.computeVertexNormals();
    // if smooth shading
    else currMesh.computeFlatVertexNormals(); // if flat shading

    if (surface != null) {
        scene.remove(surface); // remove old surface from scene
        surface.geometry.dispose();
        surface = null;
    }
    material.wireframe = wireFrame;
    surface = new THREE.Mesh(currMesh, material); // attach material to mesh
    scene.add(surface);
}

function loadOBJ(objstring) {
    loadOBJFromString(
        objstring,
        function(mesh) {
            coarseMesh = mesh;
            currMesh.vertices = mesh.vertices;
            currMesh.faces = mesh.faces;
            updateSurfaces();
            nsubdiv = 0;
        },
        function() {},
        function() {}
    );
}

function onKeyDown(event) {
    // Key Press callback function
    switch (event.key) {
        case "w":
        case "W":
            wireFrame = !wireFrame;
            message(wireFrame ? "wireframe rendering" : "solid rendering");
            updateSurfaces();
            break;
        case "f":
        case "F":
            flatShading = !flatShading;
            message(flatShading ? "flat shading" : "smooth shading");
            updateSurfaces();
            break;
        case "s":
        case "S":
        case " ":
            if (nsubdiv >= 5) {
                message("# subdivisions at maximum");
                break;
            }
            subdivide();
            nsubdiv++;
            updateSurfaces();
            message("# subdivisions = " + nsubdiv);
            break;
        case "e":
        case "E":
            currMesh.vertices = coarseMesh.vertices;
            currMesh.faces = coarseMesh.faces;
            nsubdiv = 0;
            updateSurfaces();
            message("# subdivisions = " + nsubdiv);
            break;
        case "r":
        case "R":
            orbit.reset();
            break;
    }
    if (event.key >= "0" && event.key <= "9") {
        let index = 9;
        if (event.key > "0") index = event.key - "1";
        if (index < objStrings.length) {
            loadOBJ(objStrings[index]);
            message("loaded mesh " + objNames[index]);
        }
    }
}

window.addEventListener("keydown", onKeyDown, false);

function animate() {
    requestAnimationFrame(animate);
    //if(orbit) orbit.update();
    if (scene && camera) {
        light.position.set(camera.position.x, camera.position.y, camera.position.z);
        renderer.render(scene, camera);
    }
}

animate();