# TODO 🚧

## 1. Setup

### 1.1. Basic Scene

To create a scene with AFrame, include the library and add a-scene tag.

```html
<html>
  <head>
    <!-- Include AFrame library -->
    <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
  </head>
  <body>
    <a-scene>
      <!-- Scene logic here -->
    </a-scene>
  </body>
</html>
```

### 1.2. Skybox

A: Load an equirectangular image to be used as the background as an a-assets as such.

- Either by direct path or url.

B: Use the img loaded in the a-sky component.

```html
...
<a-scene>
  <a-assets>
    <!-- Load image asset -->
    <img
      id="lab"
      src="https://cdn.glitch.global/3e303cbd-aded-4458-9dbd-58742f67fa57/room.jpeg?v=1678694777605"
    />
  </a-assets>
  <!-- Use asset for skybox -->
  <a-sky src="#lab"></a-sky>
</a-scene>
...
```

### 1.3. Add A Floor

The floor can be a plane used for movement/teleportation.

A: Load the floor texture.

```html
<a-assets>
  <img
    id="floor_texture"
    src="https://cdn.glitch.global/3e303cbd-aded-4458-9dbd-58742f67fa57/floor_texture.jpg?v=1678700251839"
  />
</a-assets>
```

B: Create the plane with the floor texture.

```html
<a-plane
  src="#floor_texture"
  repeat="10 10"
  rotation="-90 0 0"
  width="100"
  height="100"
>
</a-plane>
```

### 1.4. Add A Camera

Add a camera to the scene. 1.6 on the y is the same as 1.6m in a VR environment.

```html
<a-scene>
  ...
  <a-entity
    camera="active: true"
    position="0 1.6 0"
    wasd-controls
    look-controls
  >
  </a-entity>
  ...
</a-scene>
```

### 1.5. Add Interaction Cursor

Add a cursor to the center of the screen to interact with objects through gaze. Add it as a child of the previously created camera by putting the code within the camera tags.

```html
<a-scene>
  ...
  <a-entity camera="active: true" ...>
    <!-- Cursor parented to the camera -->
    <a-entity
      cursor="fuse: true; fuseTimeout: 500"
      position="0 0 -0.1"
      scale="0.05 0.05 0.05"
      geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
      material="color: green; shader: flat"
    >
    </a-entity>
  </a-entity>
  ...
</a-scene>
```

## 2. B1: Virtual Table and Atoms

See a virtual table with dynamically generated 3D atoms (e.g., Hydrogen, Oxygen, Carbon, etc.) that correspond to the atoms you have used in the recorded video from A2. The virtual table with the atoms should be situated in one of the following (choose only one option):

- B1-1. A 3D virtual environment (VE) suitable for VR with a consistent theme (e.g., a classroom).
- B1-2. A live video feed (via a camera) of the real world suitable for an AR experience.

### 2.1. Loading A Table Model

A: Load a gltf-model asset.

- Either by direct path or url.

B: Use the loaded asset as a src of an a-entity component.

```html
<a-assets>
  <!-- Load model asset -->
  <a-asset-item id="table"
                src="https://cdn.glitch.global/3e303cbd-aded-4458-9dbd-58742f67fa57/table.glb?v=1678695468656"></a-asset-item>
</a-assets>
  <!-- Use loaded asset as gltf-model -->
  <a-entity gltf-model="#table"
            position="0 0.5 0"></a-entity>
</a-scene>
```

### 2.2. Loading Atoms

Create an atom as a sphere geometry.

```html
<a-scene>
  <a-entity geometry="primitive: sphere; radius: 1" position="0 2 0"></a-entity>
</a-scene>
```

## 3. B2: Interacting With Atoms (Translation)

Use a grab interaction to pick up atom and molecule objects to translate them in the environment.
A: Create a component called grab-and-move, that stores logic for grabbing and moving an entity.

```javascript
const THREE = window.THREE;

AFRAME.registerComponent("grab-and-move", {
  // component variabes
  schema: {
    grabbed: { type: "boolean", default: false },
    distance_away: { type: "number", default: 0 },
  },

  // init function only called once at the start of the scene
  init: function () {
    // pre-initialized variables that we want to use locally
    this.camera_direction = new THREE.Vector3();
    this.camera_offset = new THREE.Vector3();

    // mouse down callback
    this.el.addEventListener("mousedown", function (evt) {
      // set grabbed attribute of component to true
      this.setAttribute("grab-and-move", "grabbed", true);

      // calculate distance away from camera and set
      var camera = document.getElementById("camera");
      var camera_position = camera.object3D.position;
      var target_position = this.object3D.position;
      this.setAttribute(
        "grab-and-move",
        "distance_away",
        target_position.distanceTo(camera_position)
      );
    });

    // mouse up callback
    this.el.addEventListener("mouseup", function (evt) {
      // set grabbed attribute of component to false
      this.setAttribute("grab-and-move", "grabbed", false);
    });
  },

  // tick function called every frame
  tick: function (time, timeDelta) {
    if (this.data.grabbed) {
      // set position based on camera rotation and distance away
      var camera = document.getElementById("camera");

      camera.object3D.getWorldDirection(this.camera_direction);
      this.camera_direction.normalize();
      this.camera_direction.setLength(this.data.distance_away);

      var camera_position = camera.object3D.position;
      this.camera_offset.copy(camera_position).sub(this.camera_direction);

      this.el.setAttribute("position", {
        x: this.camera_offset.x,
        y: this.camera_offset.y,
        z: this.camera_offset.z,
      });
    }
  },
});
```

B: Attach newly created component `grab-and-move` to the atom entity.

```html
...
<!-- create atom as a sphere -->
<a-entity
  geometry="primitive: sphere; radius: 0.1"
  position="0 1.5 -1"
  material="color: red"
  shadow="cast: true; receive: true"
  cursor-listener
  grab-and-move
>
</a-entity>
...
```

## 4. B3: Joining Atoms

Use an attach interaction to join two atom objects with a bond to eventually construct a molecule. The atom objects can already have bonds with other atoms as part of a molecule. There should be a clear visual indication of bonds between atoms.

## ← B4:

Use a rotate interaction to rotate molecules.

## ← B5:

Use a pinch interaction to scale molecules.

## 7. B6: Teleportation/Movement

Able to virtually navigate the virtual environment with a locomotion method of your choice.

- For B1-1 in VR, it may be teleportation, or real walking using HMD sensors.
- For B2-2 in AR, it may be real walking with the virtual objects anchored in place.

A: Create a component function called cursor-teleport (can be any name) in the script.js file.

```javascript
const AFRAME = window.AFRAME;

AFRAME.registerComponent("cursor-teleport", {
  init: function () {
    this.el.addEventListener("mousedown", function (evt) {
      if (evt.detail.intersectedEl.id == "floor") {
        var intersection_point = evt.detail.intersection.point;
        intersection_point.y += 1.6;
        this.setAttribute("position", intersection_point);
      }
    });
  },
});
```

B: Include the script.js to your index.html to be able to use it.

```html
<head>
  ...
  <script src="script.js"></script>
  ...
</head>
```

C: Add the component to the previously created camera object as such.

```html
<!-- Define Camera -->
...
<a-entity
  camera="active: true"
  position="0 1.6 0"
  wasd-controls
  look-controls
  cursor-teleport
>
  ...
</a-entity>
```

D: Double-Click to teleport. To only teleport when double clicked, add the following code to the component `cursor-teleport`.

```javascript
// teleportation code
AFRAME.registerComponent("cursor-teleport", {
  schema: {
    // a timer to when we consider a double click
    double_click_timer: { type: "number", default: 0.2 },
  },
  init: function () {
    this.el.addEventListener("mousedown", function (evt) {
      // only consider when double_click_timer is > 0.0, i.e. within the click time
      if (
        evt.detail.intersectedEl.id == "floor" &&
        this.getAttribute("cursor-teleport").double_click_timer > 0.0
      ) {
        var intersection_point = evt.detail.intersection.point;
        intersection_point.y += 1.6;
        this.setAttribute("position", intersection_point);
      }
      // setting the timer
      this.setAttribute("cursor-teleport", "double_click_timer", 0.2);
    });
  },
  tick: function (time, timeDelta) {
    // process double click timer
    if (this.data.double_click_timer > 0.0) {
      this.el.setAttribute(
        "cursor-teleport",
        "double_click_timer",
        this.data.double_click_timer - timeDelta / 1000.0
      );
    }
  },
});
```
