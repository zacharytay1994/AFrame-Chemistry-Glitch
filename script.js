const AFRAME = window.AFRAME;
const THREE = window.THREE;

// ====================================================================================================================================
// cursor color change on click
AFRAME.registerComponent('cursor-listener', {
  init: function () {
    var lastIndex = -1;
    var COLORS = ['red', 'green', 'blue'];
    this.el.addEventListener('mousedown', function (evt) {
      lastIndex = (lastIndex + 1) % COLORS.length;
      this.setAttribute('material', 'color', COLORS[lastIndex]);
    });
  }
});

// ====================================================================================================================================
// teleportation code
AFRAME.registerComponent('cursor-teleport', {
  // schema: {
  //   double_click_timer: {type: 'number', default: 0.2}
  // },
  init: function() {
    this.el.addEventListener('mousedown', function(evt) {
      if (evt.detail.intersectedEl.id == "floor" && this.getAttribute('cursor-teleport').double_click_timer > 0.0) {
        var intersection_point = evt.detail.intersection.point;
        intersection_point.y += 1.6;
        this.setAttribute('position', intersection_point);
      }
      this.setAttribute('cursor-teleport', 'double_click_timer', 0.2);
    });
  },
  tick: function(time, timeDelta) {
    // process double click timer
    if (this.data.double_click_timer > 0.0) {
      this.el.setAttribute('cursor-teleport', 'double_click_timer', this.data.double_click_timer - timeDelta/1000.0);
    }
  }
});

// ====================================================================================================================================
// grab and move object code
AFRAME.registerComponent('grab-and-move', {
  schema: {
    grabbed: {type: 'boolean', default: false},
    distance_away: {type: 'number', default: 0},
    double_click_timer: {type: 'number', default: 0.2}
  },
  init: function() {
    // pre-initialized variables
    this.camera_direction = new THREE.Vector3();
    this.camera_offset = new THREE.Vector3();
    
    this.el.addEventListener('mousedown', function(evt) {
      console.log(this.getAttribute('grab-and-move').double_click_timer);
      if (this.getAttribute('grab-and-move').double_click_timer > 0.0) {
        this.setAttribute('grab-and-move', 'grabbed', true);
        // calculate distance away from camera and set
        var camera = document.getElementById("camera");
        var camera_position = camera.object3D.position;
        var target_position = this.object3D.position;
        this.setAttribute('grab-and-move', 'distance_away', target_position.distanceTo(camera_position));
      }
      this.setAttribute('grab-and-move', 'double_click_timer', 0.2);
    });
    this.el.addEventListener('mouseup', function(evt) {
      this.setAttribute('grab-and-move', 'grabbed', false);
    });
  },
  tick: function(time, timeDelta) {
    if (this.data.grabbed) {
      // set position based on camera rotation and distance away
      var camera = document.getElementById("camera");
      
      camera.object3D.getWorldDirection(this.camera_direction);
      this.camera_direction.normalize();
      this.camera_direction.setLength(this.data.distance_away);
      
      var camera_position = camera.object3D.position;
      this.camera_offset.copy(camera_position).sub(this.camera_direction);
      
      this.el.setAttribute('position', {
        x: this.camera_offset.x,
        y: this.camera_offset.y,
        z: this.camera_offset.z
      });
    }
      
    // process double click timer
    if (this.data.double_click_timer > 0.0) {
      this.el.setAttribute('grab-and-move', 'double_click_timer', this.data.double_click_timer - timeDelta/1000.0);
    }
  }
});

// atom-spawner
AFRAME.registerComponent("atom-spawner", {
  schema: {
    name: {type: "string", default: ""},
    fullName: {type: "string", default: ""},
    positionOffset: {type: "vec3", default: {x: 0, y: 0, z: 0}},
    color: {type: "color", default: "#FF0000"},
    radius: {type: "number", default: 1}
  },
  init: function() {
    this.el.addEventListener("hit", function(evt) {
      if (evt.detail.hit_by.components.hasOwnProperty("my-grabber") &&
          evt.detail.hit_by.getAttribute("visible") && 
          evt.detail.hit_by.object3D.children.length < 2) {
        console.log("created");
        
        var component = this.getAttribute("atom-spawner");
        
        // create atom
        var el = document.createElement('a-sphere');
        var spawnerPosition = new THREE.Vector3();
        var positionOffset = this.getAttribute("atom-spawner").positionOffset;
        spawnerPosition.copy(evt.detail.hit_by.object3D.getWorldPosition()).add(positionOffset);
        el.setAttribute("position", spawnerPosition);
        el.setAttribute("color", this.getAttribute("atom-spawner").color);
        el.setAttribute("radius", this.getAttribute("atom-spawner").radius);

        // atoms need a sphere-collider and a my-grabbable
        el.setAttribute("sphere-collider", "");
        el.setAttribute("my-grabbable", "");
        el.setAttribute("atom-molecule", "atom", this.getAttribute("atom-spawner").fullName);
        
        // add name tag to it
        var txt = document.createElement('a-troika-text');
        txt.setAttribute("value", component.name);
        txt.setAttribute("position", {x: 0, y: 0, z: component.radius+0.01});
        txt.setAttribute("align", "center");
        txt.setAttribute("scale", {x: 0.2, y: 0.2, z: 0.2});
        el.appendChild(txt);
        
        document.querySelector('a-scene').appendChild(el);
      }
    });
  }
});

// molecule functions
// function createH2(position) {
//   var molecule = document.createElement("a-entity");
//   molecule.setAttribute("position", position);
  
//   // attach 2 hydrogen
//   var hydrogen1 = document.createElement("a-sphere")
// }

// atom-molecule
AFRAME.registerComponent("atom-molecule", {
  schema: {
    atom: {type: "string", default: ""},
    spawned: {type: "boolean", default: false}
  },
  init: function() {
    this.el.addEventListener("hit", function(evt){
      // check if both are atom-molecule(s)
      // console.log("start");
      // console.log(this.components.hasOwnProperty("atom-molecule"));
      // console.log(evt.detail.hit_by.components.hasOwnProperty("atom-molecule"));
      if (this.components.hasOwnProperty("atom-molecule") && evt.detail.hit_by.components.hasOwnProperty("atom-molecule")) {
        // check if either have not spawned the combined molecule
        var am1 = this.getAttribute("atom-molecule");
        var am2 = evt.detail.hit_by.getAttribute("atom-molecule");
        // console.log("touching");
        // console.log(am1.atom);
        // console.log(am2.atom);
        // console.log(am1.spawned);
        // console.log(am2.spawned);
        if (am1.atom == "h" && am2.atom == "h") {
          
          this.setAttribute("my-grabbable", "grabbable", false);
          // spawn new molecule
          if (!this.getAttribute("my-grabbable").grabbable && !evt.detail.hit_by.getAttribute("my-grabbable").grabbable &&
              !am1.spawned && !am2.spawned) {
            // create h2 molecule
            console.log("creating h2 molecule");
            
            // create new molecule parent
            var molecule = document.createElement("a-sphere");
            molecule.setAttribute("position", this.object3D.getWorldPosition());
            molecule.setAttribute("color", "#00FF00")
            molecule.setAttribute("opacity", 0.2);
            molecule.setAttribute("radius", 0.1);
            molecule.setAttribute("animation__opacity", {"property": "opacity", "from": 1, "to": 0.2});
            molecule.setAttribute("animation__scale", {"property": "scale", "from": {x:0,y:0,z:0}, "to":{x:1,y:1,z:1}});
            molecule.setAttribute("sphere-collider", "");
            molecule.setAttribute("my-grabbable", "");
            molecule.setAttribute("atom-molecule", "atom", "h2o")
            document.querySelector('a-scene').appendChild(molecule);
            
            var txt = document.createElement('a-troika-text');
            txt.setAttribute("value", 'Hydrogen Gas (H2)\n(Molecule : Stable)');
            txt.setAttribute("position", {x: 0, y: 0.1+0.1, z: 0});
            txt.setAttribute("align", "center");
            txt.setAttribute("scale", {x: 0.2, y: 0.2, z: 0.2});
            molecule.appendChild(txt);
            
            // create 2 hydrogen atoms to it
            var hydrogen1 = document.createElement("a-sphere");
            hydrogen1.setAttribute("position", "-0.025 0 0");
            hydrogen1.setAttribute("radius", 0.05);
            hydrogen1.setAttribute("color", "#FF0000")
            
            var txt1 = document.createElement('a-troika-text');
            txt1.setAttribute("value", 'H');
            txt1.setAttribute("position", {x: 0, y: 0, z: 0.05+0.01});
            txt1.setAttribute("align", "center");
            txt1.setAttribute("scale", {x: 0.2, y: 0.2, z: 0.2});
            hydrogen1.appendChild(txt1);
            
            molecule.appendChild(hydrogen1);
            
            var hydrogen2 = document.createElement("a-sphere");
            hydrogen2.setAttribute("position", "0.025 0 0");
            hydrogen2.setAttribute("radius", 0.05);
            hydrogen2.setAttribute("color", "#FF0000")
            
            var txt2 = document.createElement('a-troika-text');
            txt2.setAttribute("value", 'H');
            txt2.setAttribute("position", {x: 0, y: 0, z: 0.05+0.01});
            txt2.setAttribute("align", "center");
            txt2.setAttribute("scale", {x: 0.2, y: 0.2, z: 0.2});
            hydrogen2.appendChild(txt2);
            
            molecule.appendChild(hydrogen2);
            
            // set as spawned
            this.setAttribute("atom-molecule", "spawned", true);
            
            // remove from scene
            this.parentNode.removeChild(this);
            evt.detail.hit_by.parentNode.removeChild(evt.detail.hit_by);
          }
        }
        else if (am1.atom == "h2o" && am2.atom == "o" || am1.atom == "o" && am2.atom == "h2o") {
          this.setAttribute("my-grabbable", "grabbable", false);
          console.log("o and h2o collide");
          // spawn new molecule
          console.log(this.getAttribute("my-grabbable").grabbable);
          console.log(evt.detail.hit_by.getAttribute("my-grabbable").grabbable);
          console.log(am1.spawned);
          console.log(am2.spawned);
          if (!this.getAttribute("my-grabbable").grabbable && !evt.detail.hit_by.getAttribute("my-grabbable").grabbable &&
              !am1.spawned && !am2.spawned) {
            // create h2 molecule
            console.log("creating h2o molecule");
            
            // create new molecule parent
            var molecule = document.createElement("a-sphere");
            molecule.setAttribute("position", this.object3D.getWorldPosition());
            molecule.setAttribute("color", "#00FF00");
            molecule.setAttribute("opacity", 0.2);
            molecule.setAttribute("radius", 0.15);
            molecule.setAttribute("animation__opacity", {"property": "opacity", "from": 1, "to": 0.2});
            molecule.setAttribute("animation__scale", {"property": "scale", "from": {x:0,y:0,z:0}, "to":{x:1,y:1,z:1}});
            molecule.setAttribute("sphere-collider", "");
            molecule.setAttribute("my-grabbable", "");
            molecule.setAttribute("atom-molecule", "atom", "h2o")
            document.querySelector('a-scene').appendChild(molecule);
            
            var txt = document.createElement('a-troika-text');
            txt.setAttribute("value", 'Water (H2O)\n(Molecule : Stable)');
            txt.setAttribute("position", {x: 0, y: 0.15+0.1, z: 0});
            txt.setAttribute("align", "center");
            txt.setAttribute("scale", {x: 0.2, y: 0.2, z: 0.2});
            molecule.appendChild(txt);
            
            // create 2 hydrogen atoms to it
            var hydrogen1 = document.createElement("a-sphere");
            hydrogen1.setAttribute("position", "-0.05 -0.025 0");
            hydrogen1.setAttribute("radius", 0.05);
            hydrogen1.setAttribute("color", "#FF0000")
            
            var txt1 = document.createElement('a-troika-text');
            txt1.setAttribute("value", 'H');
            txt1.setAttribute("position", {x: -0.05, y: -0.025, z: 0.05+0.01});
            txt1.setAttribute("align", "center");
            txt1.setAttribute("scale", {x: 0.2, y: 0.2, z: 0.2});
            hydrogen1.appendChild(txt1);
            
            molecule.appendChild(hydrogen1);
            
            var hydrogen2 = document.createElement("a-sphere");
            hydrogen2.setAttribute("position", "0.05 -0.025 0");
            hydrogen2.setAttribute("radius", 0.05);
            hydrogen2.setAttribute("color", "#FF0000")
            
            var txt2 = document.createElement('a-troika-text');
            txt2.setAttribute("value", 'H');
            txt2.setAttribute("position", {x: 0.05, y: -0.025, z: 0.05+0.01});
            txt2.setAttribute("align", "center");
            txt2.setAttribute("scale", {x: 0.2, y: 0.2, z: 0.2});
            hydrogen2.appendChild(txt2);
            
            molecule.appendChild(hydrogen2);
            
            // create 1 oxygen
            var oxygen = document.createElement("a-sphere");
            oxygen.setAttribute("position", "0 0.04455 0");
            oxygen.setAttribute("radius", 0.0891);
            oxygen.setAttribute("color", "#89CFF0")
            
            var txt3 = document.createElement('a-troika-text');
            txt3.setAttribute("value", 'O');
            txt3.setAttribute("position", {x: 0, y: -0.025, z: 0.0891+0.01});
            txt3.setAttribute("align", "center");
            txt3.setAttribute("scale", {x: 0.2, y: 0.2, z: 0.2});
            oxygen.appendChild(txt3);
            
            molecule.appendChild(oxygen);
            
            // set as spawned
            this.setAttribute("atom-molecule", "spawned", true);
            
            // remove from scene
            this.parentNode.removeChild(this);
            evt.detail.hit_by.parentNode.removeChild(evt.detail.hit_by);
          }
        }
      }
    });
  }
});

// ====================================================================================================================================

// AR CONTROLS
// for marker to be used as button
AFRAME.registerComponent("marker-visible", {
  schema: {
    visible: {type: "boolean", default: false}
  },
  init: function() {
    this.el.addEventListener("markerFound", function(evt) {
      console.log("marker found");
      this.setAttribute("marker-visible", "visible", true);
    });
    this.el.addEventListener("markerLost", function(evt) {
      console.log("marker lost");
      this.setAttribute("marker-visible", "visible", false);
    });
  }
});

// makes the entity visible/invisible on marker detected
AFRAME.registerComponent("visible-on-marker-visible", {
  schema: {
    markerId: {type: "selector", default: null},
    onMarker: {type: "boolean", default: false}
  },
  tick: function() {
    if (this.data.markerId) {
      this.el.object3D.visible = this.data.markerId.getAttribute("marker-visible").visible == this.data.onMarker;
    }
  }
});

// grabber
AFRAME.registerComponent("my-grabber", {});

// grabs the entity, requires entity to also have sphere-collider component
AFRAME.registerComponent("my-grabbable", {
  schema: {
    grabber: {type: "selector", default: null},
    grabbable: {type: "boolean", default: true}
  },
  init: function() {
    this.el.addEventListener("hit", function(evt) {
      if (this.getAttribute("my-grabbable").grabbable &&
          evt.detail.hit_by.components.hasOwnProperty("my-grabber") && 
          evt.detail.hit_by.getAttribute("visible") && 
          evt.detail.hit_by.object3D.children.length < 2) {
        // reparent while maintaining world position with attach()
        this.setAttribute("my-grabbable", "grabber", evt.detail.hit_by);
        evt.detail.hit_by.object3D.attach(this.object3D);
      }
    });
  },
  tick: function() {
    if (this.data.grabber) {
      // console.log(this.data.grabber);
      var grabber = this.data.grabber;
      // if grabber is no longer visible, release the object
      if (!this.data.grabber.object3D.visible || !this.el.getAttribute("my-grabbable").grabbable) {
        const obj = this.el.object3D;
        var world_position = new THREE.Vector3();
        obj.getWorldPosition(world_position);
        var world_scale = new THREE.Vector3();
        obj.getWorldScale(world_scale);
        var world_rotation = new THREE.Quaternion();
        obj.getWorldQuaternion(world_rotation);
        grabber.object3D.remove(obj);
        this.el.setAttribute("my-grabbable", "grabber", null);
        this.el.sceneEl.object3D.add(obj);
        this.el.setAttribute("position", world_position);
        this.el.setAttribute("scale", world_scale);
        this.el.object3D.setRotationFromQuaternion(world_rotation);
      }
    }
  }
});