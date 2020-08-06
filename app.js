//declare scene
const scene = new THREE.Scene();

//declare PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )
const camera = new THREE.PerspectiveCamera(
  80,
  window.innerWidth / window.innerHeight,
  1,
  1100
);
let radius = 70;
let spriteX = 7;
let tooltip = document.getElementById('tooltip');
let spriteActive = false;
//////////controls variables

let isUserInteracting = false,
  onMouseDownMouseX = 0,
  onMouseDownMouseY = 0,
  lon = 0,
  onMouseDownLon = 0,
  lat = 0,
  onMouseDownLat = 0,
  phi = 0,
  theta = 0,
  rotationSpeed = 0.7;

camera.target = new THREE.Vector3(0, 0, 0);
/////////

//declare renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//declare geometry
const geometry = new THREE.SphereGeometry(radius, 70, 70);
//inverts geometry faces point in
geometry.scale(-1, 1, 1);
//declare texture
const texture = new THREE.TextureLoader().load("panoramas/la-fontana.jpg");
//declare material
// using color pass { color: 0x0000ff }
const material = new THREE.MeshBasicMaterial({
  //  color: 0x0000ff,
  map: texture,
  //  side: THREE.DoubleSide
});

//declare mesh and pass it to scene
const sphere = new THREE.Mesh(geometry, material);
sphere.name = "panoViewer";
scene.add(sphere);

// declare manually Sprite for info, images or moving
// const spriteTexture = new THREE.TextureLoader().load('images/info_white.png');
// const spriteMaterial = new THREE.SpriteMaterial({
//     // color: 0x0000ff,
//     map: spriteTexture
// });
// const sprite = new THREE.Sprite( spriteMaterial );
// sprite.name= "infoSprite";
// const position = new THREE.Vector3(spriteX,-3,-3)
// sprite.position.copy(position);
// scene.add(sprite);

///get coordinates manually and add a sprite
function addSprite(position, image, name) {
  let spriteTexture = new THREE.TextureLoader().load(image);
  let spriteMaterial = new THREE.SpriteMaterial({
    map: spriteTexture,
  });
  let sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.copy(position.clone().normalize().multiplyScalar(spriteX));
  sprite.scale.multiplyScalar(0.5);
  sprite.name = name;
  scene.add(sprite);
}
//add sprite using function
addSprite(
  new THREE.Vector3(30, -14, -14),
  "images/info_white.png",
  "infoSprite"
);

//generate animation frame loop
function animate() {
  requestAnimationFrame(animate);

  update();
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
const rayCaster = new THREE.Raycaster();

function onClick(event) {
  //create a vector 2 and pass
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  let clickPosition = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  rayCaster.setFromCamera(clickPosition, camera);
  let intersect = rayCaster.intersectObject(scene, true);
  intersect.forEach((element) => {
    if (element.object.type === "Sprite") {
      console.log(element.object.name);
    }
  });
  // let intersect = rayCaster.intersectObject(sphere);

  // if(intersect.length > 0){
  //     addSprite(intersect[0].point,'images/info_white.png')
  // }
  // console.log(intersect[0].point)
}

//listen to resize
window.addEventListener("resize", onResize, false);
//listen to click
document.addEventListener("click", onClick, false);

//////////Orbit Controls
function onPointerStart(event) {
  isUserInteracting = true;

  var clientX = event.clientX || event.touches[0].clientX;
  var clientY = event.clientY || event.touches[0].clientY;

  onMouseDownMouseX = clientX;
  onMouseDownMouseY = clientY;

  onMouseDownLon = lon;
  onMouseDownLat = lat;
}

function onPointerMove(event) {
  //hover on sprite
  let pointerPosition = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  rayCaster.setFromCamera(pointerPosition, camera);
  let foundSprite= false;
  let intersect = rayCaster.intersectObject(scene, true);
  intersect.forEach((element) => {
    if (element.object.type === "Sprite") {
      let p = element.object.position.clone().project(camera)
      tooltip.style.top = (-1 * p.y + 1) * window.innerHeight/2 + 'px';
      tooltip.style.left = ( p.x + 1) * window.innerWidth/2 + 'px';
      tooltip.classList.add("active")
      tooltip.innerHTML = element.object.name;
      foundSprite = true;
      spriteActive = true;
    }
  });
  if(foundSprite === false && spriteActive){
    tooltip.classList.remove("active")
  }
  //move panoView
  if (isUserInteracting === true) {
    let clientX = event.clientX || event.touches[0].clientX;
    let clientY = event.clientY || event.touches[0].clientY;
    lon = (onMouseDownMouseX - clientX) * 0.1 + onMouseDownLon;
    lat = (clientY - onMouseDownMouseY) * 0.1 + onMouseDownLat;
  }
}

function onPointerUp() {
  isUserInteracting = false;
}

// disable zoom in or out
let enableZoom = false;
function onDocumentMouseWheel(event) {
  if (enableZoom === true) {
    var fov = camera.fov + event.deltaY * 0.05;

    camera.fov = THREE.MathUtils.clamp(fov, 10, 75);

    camera.updateProjectionMatrix();
  }
}
document.addEventListener("wheel", onDocumentMouseWheel, false);

function onKeyDown(event) {
  isUserInteracting = true;

  let key = event.key;
  key === "ArrowLeft" || key === "a" || key === "A"
    ? (lon -= rotationSpeed)
    : key === "ArrowRight" || key === "d" || key === "D"
    ? (lon += rotationSpeed)
    : key === "ArrowUp" || key === "w" || key === "W"
    ? (lat += rotationSpeed)
    : key === "ArrowDown" || key === "s" || key === "S"
    ? (lat -= rotationSpeed)
    : (isUserInteracting = false);
}
function onKeyUp(event) {
  isUserInteracting = false;
}
document.addEventListener("keydown", onKeyDown, false);
document.addEventListener("keyup", onKeyUp, false);

document.addEventListener("mousedown", onPointerStart, false);
document.addEventListener("mousemove", onPointerMove, false);
document.addEventListener("mouseup", onPointerUp, false);

document.addEventListener("touchstart", onPointerStart, false);
document.addEventListener("touchmove", onPointerMove, false);
document.addEventListener("touchend", onPointerUp, false);

document.addEventListener(
  "dragover",
  function (event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  },
  false
);

document.addEventListener(
  "dragenter",
  function () {
    document.body.style.opacity = 0.5;
  },
  false
);

document.addEventListener(
  "dragleave",
  function () {
    document.body.style.opacity = 1;
  },
  false
);

document.addEventListener(
  "drop",
  function (event) {
    event.preventDefault();

    var reader = new FileReader();
    reader.addEventListener(
      "load",
      function (event) {
        material.map.image.src = event.target.result;
        material.map.needsUpdate = true;
      },
      false
    );
    reader.readAsDataURL(event.dataTransfer.files[0]);

    document.body.style.opacity = 1;
  },
  false
);

function update() {
  if (isUserInteracting === false) {
    //comment to stop autorotation
    // lon += rotationSpeed;
  }

  lat = Math.max(-85, Math.min(85, lat));
  phi = THREE.MathUtils.degToRad(90 - lat);
  theta = THREE.MathUtils.degToRad(lon);

  camera.target.x = radius * Math.sin(phi) * Math.cos(theta);
  camera.target.y = radius * Math.cos(phi);
  camera.target.z = radius * Math.sin(phi) * Math.sin(theta);

  camera.lookAt(camera.target);

  /*
    // distortion
    camera.position.copy( camera.target ).negate();
    */
}

//////////

animate();
