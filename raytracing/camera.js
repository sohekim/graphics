class PinholeCamera {
	constructor(eye, target, up, fov, aspect) {
		this.eye = eye.clone();
		this.target = target.clone();
		this.up = up.clone();
		this.fov = fov;
		this.aspect = aspect;

		let dist = 1.0;
		let top = dist * Math.tan(fov*Math.PI/360);
		let bottom = -top;
		let right = aspect * top;
		let left = -right;

		// build camera coordinate system
		let W = eye.clone();
		W.sub(target);
		W.normalize();
		let V = new THREE.Vector3();
		let U = new THREE.Vector3();
		U.crossVectors(up, W);
		U.normalize();
		V.crossVectors(W, U);

		this.corner = eye.clone();
		this.corner.addScaledVector(U, left);
		this.corner.addScaledVector(V, bottom);
		this.corner.addScaledVector(W, -dist);
		this.across = U.clone();
		this.across.multiplyScalar(2*right);
		this.up = V.clone();
		this.up.multiplyScalar(2*top);
	}
	
	/* getCameraRay takes a normalized pixel coordiate (x,y)
	 * and returns a ray that originates from the eye
	 * and goes towards that pixel coordinate (x,y).
	 */
	getCameraRay(x, y) {
		let direction = this.corner.clone();
		direction.addScaledVector(this.across, x);
		direction.addScaledVector(this.up, y);
		direction.sub(this.eye);
		direction.normalize();
		return new Ray(this.eye, direction);
	}
}

/* ========================================
 * You can define additional Camera classes,
 * as long as each implements getCameraRay function.
 * ======================================== */
