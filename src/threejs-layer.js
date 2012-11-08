var particles, geometry;
  var material, parameters, i, h;

function ThreejsLayer(options){
  this.initialize(options || {});
}

function bind(func, thisArg) {
  return function() { func.apply(thisArg); };
}

ThreejsLayer.prototype.update = function() {

  var projection = this.map.getProjection(),
    zoom, scale, offset;

  if (!projection){ return; }

  zoom = this.map.getZoom();
  scale = Math.pow(2, zoom);
  offset = projection.fromLatLngToPoint(this.layer.getTopLeft());

  this.camera.position.x = offset.x / 256 ;
  this.camera.position.y = offset.y / 256;

  this.camera.scale.x = this.layer.canvas.width / 256 / scale;
  this.camera.scale.y = this.layer.canvas.height / 256 / scale;
};

ThreejsLayer.prototype.render = function() {
  this.renderer.render( this.scene, this.camera );
};

ThreejsLayer.prototype.animate = function() {
  requestAnimationFrame( bind(this.animate, this) );
  this.render();
};

ThreejsLayer.prototype.initialize = function(options){

  this.map = options.map;

  this.layer = new CanvasLayer({
    map: this.map,
    animate: false,
    resizeHandler: bind(this.finalize, this),
    updateHandler: bind(this.update, this)
  });

  this.camera = new THREE.OrthographicCamera(0, 1, 0, 1, -3000, 3000);
  this.camera.position.z = 1000;

  this.scene = new THREE.Scene();

  this.renderer = new THREE.WebGLRenderer({
    clearColor: 0x000000,
    clearAlpha: 0
  });

  this.resize();

  google.maps.event.addListener(this.map, 'bounds_changed', bind(this.resize, this));
};

ThreejsLayer.prototype.resize = function(){

  var div = this.map.getDiv(),
    width = div.clientWidth,
    height = div.clientHeight;

  if (width == this.width && height == this.height){ return; }

  this.width = width;
  this.height = height;

  this.renderer.setSize(width, height);
  this.update();
};

ThreejsLayer.prototype.finalize = function() {

  var projection = this.map.getProjection();

  var geometry = new THREE.Geometry();

  for ( i = 0; i < photos.length; i ++ ) {

    var photo = photos[i],
      vertex = new THREE.Vector3(),
      location = new google.maps.LatLng(photo[0], photo[1]),
      point = projection.fromLatLngToPoint(location);

    vertex.x = point.x / 256;
    vertex.y = point.y / 256;
    vertex.z = 0;

    geometry.vertices.push( vertex );
  }

  var texture = new THREE.Texture( generateSprite() );
  texture.needsUpdate = true;

  material = new THREE.ParticleBasicMaterial({
    size: 20,
    map: texture,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true
  });

  particles = new THREE.ParticleSystem( geometry, material );

  this.scene.add( particles );

  this.layer.getPanes().overlayLayer.appendChild( this.renderer.domElement );
  this.canvas = this.renderer.domElement;
  this.layer.canvas = this.canvas;

  this.resize();
  this.animate();
};