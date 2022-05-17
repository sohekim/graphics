/* This Material class incorporates all material parameters:
 * ka: ambient reflectance (THREE.Color)
 * kd: diffuse reflectance (THREE.Color)
 * ks: specular reflectance(THREE.Color)
 * kr: mirror reflectance  (THREE.Color)
 * kt: transparency        (THREE.Color)
 * p:  specular shininess (power) (float)
 * ior: index of refraction (transparent material) (float)
 */
class Material {
	constructor() {
		this.ka = null;
		this.kd = null;
		this.ks = null;
		this.kr = null;
		this.kt = null;
		this.p = 0;
		this.ior = 0;
	}
}

function DiffuseMaterial(ka, kd) {
	let m = new Material();
	m.ka = ka.clone();
	m.kd = kd.clone();
	return m;	
}

function PhongMaterial(ka, kd, ks, p) {
	let m = new Material();
	m.ka = ka.clone();
	m.kd = kd.clone();
	m.ks = ks.clone();
	m.p = p;
	return m;
}

function MirrorMaterial(kr) {
	let m = new Material();
	m.kr = kr.clone();
	return m;
}

function GlassMaterial(kr, kt, ior) {
	let m = new Material();
	m.kr = kr.clone();
	m.kt = kt.clone();
	m.ior = ior;
	return m;
}