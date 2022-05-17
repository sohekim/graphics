/* Intersection structure:
 * t:        ray parameter (float), i.e. distance of intersection point to ray's origin
 * position: position (THREE.Vector3) of intersection point
 * normal:   normal (THREE.Vector3) of intersection point
 * material: material of the intersection object
 */
class Intersection {
  constructor() {
    this.t = 0;
    this.position = new THREE.Vector3();
    this.normal = new THREE.Vector3();
    this.material = null;
  }
  set(isect) {
    this.t = isect.t;
    this.position = isect.position;
    this.normal = isect.normal;
    this.material = isect.material;
  }
}

/* Plane shape
 * P0: a point (THREE.Vector3) that the plane passes through
 * n:  plane's normal (THREE.Vector3)
 */
class Plane {
  constructor(P0, n, material) {
    this.P0 = P0.clone();
    this.n = n.clone();
    this.n.normalize();
    this.material = material;
  }
  // Given ray and range [tmin,tmax], return intersection point.
  // Return null if no intersection.
  intersect(ray, tmin, tmax) {
    let temp = this.P0.clone();
    temp.sub(ray.o); // (P0-O)

    let denom = ray.d.dot(this.n); // d.n
    if (denom == 0) {
      return null;
    }

    let t = temp.dot(this.n) / denom; // (P0-O).n / d.n

    if (t < tmin || t > tmax) return null; // check range

    let isect = new Intersection(); // create intersection structure
    isect.t = t;
    isect.position = ray.pointAt(t);
    isect.normal = this.n;
    isect.material = this.material;
    return isect;
  }
}

/* Sphere shape
 * C: center of sphere (type THREE.Vector3)
 * r: radius
 */
class Sphere {
  constructor(C, r, material) {
    this.C = C.clone();
    this.r = r;
    this.r2 = r * r;
    this.material = material;
  }
  intersect(ray, tmin, tmax) {
    let tempO = ray.o.clone();
    tempO.sub(this.C);
    let B = tempO.multiplyScalar(2).dot(ray.d);
    tempO = ray.o.clone();
    let C = tempO.distanceToSquared(this.C) - this.r2;

    let determ = B * B - 4 * C;
    if (determ < 0) return null;

    let t1 = (-1 * B - Math.sqrt(determ)) / 2;
    let t2 = (-1 * B + Math.sqrt(determ)) / 2;

    if (t1 < 0 || t1 < tmin || t1 > tmax) t1 = null;
    if (t2 < 0 || t2 < tmin || t2 > tmax) t2 = null;

    if (t1 == null && t2 == null) return null;
    let T;
    if (t1 == null) T = t2;
    else if (t2 == null) T = t1;
    
    else if (
      ray.pointAt(t1).distanceTo(ray.o) < ray.pointAt(t2).distanceTo(ray.o)
    )
      T = t1;
    else T = t2;

    let isect = new Intersection();
    isect.t = T;
    isect.position = ray.pointAt(T);
    let tempPosition = ray.pointAt(T).clone();
    isect.normal = tempPosition.sub(this.C).normalize();
    isect.material = this.material;

    return isect;
  }
}

class Triangle {
  /* P0, P1, P2: three vertices (type THREE.Vector3) that define the triangle
   * n0, n1, n2: normal (type THREE.Vector3) of each vertex */
  constructor(P0, P1, P2, material, n0, n1, n2) {
    this.P0 = P0.clone();
    this.P1 = P1.clone();
    this.P2 = P2.clone();
    this.material = material;
    if (n0) this.n0 = n0.clone();
    if (n1) this.n1 = n1.clone();
    if (n2) this.n2 = n2.clone();

    // below you may pre-compute any variables that are needed for intersect function
    // such as the triangle normal etc.
    // ===YOUR CODE STARTS HERE===

    // ---YOUR CODE ENDS HERE---
  }

  intersect(ray, tmin, tmax) {
    let O = ray.o.clone();
    let D = ray.d.clone();
    let P2Clone = this.P2.clone();
    let P2_P0 = P2Clone.sub(this.P0);
    P2Clone = this.P2.clone();
    let P2_P1 = P2Clone.sub(this.P1);
    P2Clone = this.P2.clone();
    let P2_O = P2Clone.sub(O);

    let divisor = new THREE.Matrix3();
    divisor.set(
      D.x,
      D.y,
      D.z,
      P2_P0.x,
      P2_P0.y,
      P2_P0.z,
      P2_P1.x,
      P2_P1.y,
      P2_P1.z
    );
    let divisorDeterm = divisor.determinant();

    let tDivident = new THREE.Matrix3();
    tDivident.set(
      P2_O.x,
      P2_O.y,
      P2_O.z,
      P2_P0.x,
      P2_P0.y,
      P2_P0.z,
      P2_P1.x,
      P2_P1.y,
      P2_P1.z
    );
    let tDeterm = tDivident.determinant();

    let aDivident = new THREE.Matrix3();
    aDivident.set(
      D.x,
      D.y,
      D.z,
      P2_O.x,
      P2_O.y,
      P2_O.z,
      P2_P1.x,
      P2_P1.y,
      P2_P1.z
    );
    let aDeterm = aDivident.determinant();

    let bDivident = new THREE.Matrix3();
    bDivident.set(
      D.x,
      D.y,
      D.z,
      P2_P0.x,
      P2_P0.y,
      P2_P0.z,
      P2_O.x,
      P2_O.y,
      P2_O.z
    );
    let bDeterm = bDivident.determinant();

    let t = tDeterm / divisorDeterm;
    let a = aDeterm / divisorDeterm;
    let b = bDeterm / divisorDeterm;

    if (a < 0 || b < 0 || t < 0 || a + b > 1) return null;

    if (t < tmin || t > tmax) return null;

    let isect = new Intersection();
    isect.t = t;
    isect.position = ray.pointAt(t);

    let normal;
    if (
      this.n0 !== undefined &&
      this.n1 !== undefined &&
      this.n2 !== undefined
    ) {
      normal = new THREE.Vector3();
      let n0Clone = this.n0.clone();
      let n1Clone = this.n1.clone();
      let n02Clone = this.n2.clone();

      normal.addVectors(n0Clone.multiplyScalar(a), n1Clone.multiplyScalar(b));
      normal.add(n02Clone.multiplyScalar(1 - a - b));
    } else {
      normal = P2_P0.clone();
      normal.cross(P2_P1).normalize();
    }
    isect.normal = normal;
    isect.material = this.material;

    return isect;
  }
}

function shapeLoadOBJ(objstring, material, smoothnormal) {
  loadOBJFromString(
    objstring,
    function (mesh) {
      // callback function for non-blocking load
      if (smoothnormal) mesh.computeVertexNormals();
      for (let i = 0; i < mesh.faces.length; i++) {
        let p0 = mesh.vertices[mesh.faces[i].a];
        let p1 = mesh.vertices[mesh.faces[i].b];
        let p2 = mesh.vertices[mesh.faces[i].c];
        if (smoothnormal) {
          let n0 = mesh.faces[i].vertexNormals[0];
          let n1 = mesh.faces[i].vertexNormals[1];
          let n2 = mesh.faces[i].vertexNormals[2];
          shapes.push(new Triangle(p0, p1, p2, material, n0, n1, n2));
        } else {
          shapes.push(new Triangle(p0, p1, p2, material));
        }
      }
    },
    function () {},
    function () {}
  );
}

/* ========================================
 * You can define additional Shape classes,
 * as long as each implements intersect function.
 * ======================================== */
