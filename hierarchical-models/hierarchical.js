/* CMPSCI 373 Homework 5: Hierarchical Scene */

const width = 800,
    height = 600;
const fov = 60;
const cameraz = 5;
const aspect = width / height;
const smoothShading = true;
let animation_speed = 1.0;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(fov, aspect, 1, 1000);
camera.position.set(0, 1, cameraz);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setClearColor(0x202020);
window.onload = function(e) {
    document.getElementById('window').appendChild(renderer.domElement);
}
let orbit = new THREE.OrbitControls(camera, renderer.domElement); // create mouse control

let light0 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
light0.position.set(camera.position.x, camera.position.y, camera.position.z); // this light is at the camera
scene.add(light0);

let light1 = new THREE.DirectionalLight(0x800D0D, 1.0); // red light
light1.position.set(-1, 1, 0);
scene.add(light1);

let light2 = new THREE.DirectionalLight(0x0D0D80, 1.0); // blue light
light2.position.set(1, 1, 0);
scene.add(light2);

let amblight = new THREE.AmbientLight(0x202020); // ambient light
scene.add(amblight);

let material = new THREE.MeshPhongMaterial({ color: 0x8f8b86, specular: 0x101010, shininess: 50, side: THREE.FrontSide });
let treeMaterial1 = new THREE.MeshPhongMaterial({ color: 0x315735, specular: 0x101010, shininess: 20, side: THREE.FrontSide });
let treeMaterial2 = new THREE.MeshPhongMaterial({ color: 0x2f5432, specular: 0x101010, shininess: 20, side: THREE.FrontSide });
let treeMaterial3 = new THREE.MeshPhongMaterial({ color: 0x4c7850, specular: 0x101010, shininess: 20, side: THREE.FrontSide });
let treeMaterial4 = new THREE.MeshPhongMaterial({ color: 0x437d48, specular: 0x101010, shininess: 20, side: THREE.FrontSide });
let materialBunny = new THREE.MeshPhongMaterial({ color: 0xdbcfa7, specular: 0x101010, shininess: 30, side: THREE.FrontSide });
let materialBird1 = new THREE.MeshPhongMaterial({ color: 0x4053c2, specular: 0x101010, shininess: 50, side: THREE.FrontSide });
let materialBird2 = new THREE.MeshPhongMaterial({ color: 0xff8ae6, specular: 0x101010, shininess: 60, side: THREE.FrontSide });

let models = []; // array that stores all models
let numModelsLoaded = 0;
let numModelsExpected = 0;

// load models
loadModel(female_model, material, 'female');
loadModel(tree_aspen_model, treeMaterial1, 'tree');
loadModel(tree_aspen_model, treeMaterial2, 'tree2');
loadModel(tree_aspen_model, treeMaterial3, 'tree3');
loadModel(tree_aspen_model, treeMaterial4, 'tree4');
loadModel(bunny_model, materialBunny, 'bunny');
loadModel(bird_model, materialBird1, 'bird');
loadModel(bird_model, materialBird2, 'bird2');

// 'label' is a unique name for the model for accessing it later
function loadModel(objstring, material, label) {
    numModelsExpected++;
    loadOBJFromString(objstring, function(mesh) { // callback function for non-blocking load
        mesh.computeFaceNormals();
        if (smoothShading) mesh.computeVertexNormals();
        models[label] = new THREE.Mesh(mesh, material);
        numModelsLoaded++;
    }, function() {}, function() {});
}

let initialized = false;

function animate() {
    requestAnimationFrame(animate);
    if (numModelsLoaded == numModelsExpected) { // all models have been loaded
        if (!initialized) {
            initialized = true;

            // construct the scene by adding models
            scene.add(models['female']);

            let second_group = new THREE.Group();
            models['female'].add(second_group);
            models['tree'].scale.x = models['tree'].scale.y = models['tree'].scale.z = 1.7;
            models['tree'].position.x = 1.5;
            models['tree'].position.y = 0.6;
            second_group.add(models['tree']);

            models['tree2'].position.x = -1;
            second_group.add(models['tree2']);

            models['tree3'].position.z = -1;
            models['tree3'].scale.x = models['tree3'].scale.y = models['tree3'].scale.z = 1.3;
            second_group.add(models['tree3']);

            models['tree4'].position.z = 0.5;
            models['tree4'].position.x = -1;
            models['tree4'].position.y = -0.3;
            models['tree4'].scale.x = models['tree4'].scale.y = models['tree4'].scale.z = 0.7;
            second_group.add(models['tree4']);

            let third_group = new THREE.Group();
            models['tree'].add(third_group);
            models['bunny'].scale.x = models['bunny'].scale.y = models['bunny'].scale.z = 0.2;
            models['bunny'].position.y = -0.7;
            models['bunny'].position.x = -0.3;
            third_group.add(models['bunny']);

            let fourth_group = new THREE.Group();
            models['bunny'].add(fourth_group);
            models['bird'].scale.x = models['bird'].scale.y = models['bird'].scale.z = 0.4;
            models['bird'].position.y = 1;
            models['bird'].position.x = 0.5;
            fourth_group.add(models['bird']);

            models['bird2'].scale.x = models['bird2'].scale.y = models['bird2'].scale.z = 0.3;
            models['bird2'].position.y = 1;
            models['bird2'].position.x = -0.5;
            fourth_group.add(models['bird2']);
        }

        // animate the scene
        models['female'].rotation.y += 0.01 * animation_speed;
        models['tree'].rotation.y -= 0.02 * animation_speed;
        models['tree2'].rotation.y += 0.01 * animation_speed;
        models['tree3'].rotation.y += 0.005 * animation_speed;
        models['tree4'].rotation.y -= 0.03 * animation_speed;

        models['bunny'].rotation.y += 0.03 * animation_speed;
        models['bird'].rotation.y += 0.05 * animation_speed;
        models['bird2'].rotation.y += 0.07 * animation_speed;
    }
    light0.position.set(camera.position.x, camera.position.y, camera.position.z); // light0 always follows camera position
    renderer.render(scene, camera);
}

animate();

function onKeyDown(event) {
    switch (event.key) {
        case 'w':
        case 'W':
            material.wireframe = !material.wireframe;
            break;
        case '=':
        case '+':
            animation_speed += 0.05;
            document.getElementById('msg').innerHTML = 'animation_speed = ' + animation_speed.toFixed(2);
            break;
        case '-':
        case '_':
            if (animation_speed > 0) animation_speed -= 0.05;
            document.getElementById('msg').innerHTML = 'animation_speed = ' + animation_speed.toFixed(2);
            break;
        case 'r':
        case 'R':
            orbit.reset();
            break;
    }
}

window.addEventListener('keydown', onKeyDown, false); // as key control if you need