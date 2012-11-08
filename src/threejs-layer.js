function ThreejsLayer(options, callback){
  this.bindAll();
  this.callback = callback;
  this.initialize(options || {});
}

ThreejsLayer.prototype.bindAll = function(){
  var instance = this;

  function bind(name) {
    var method = instance[name];
    if (typeof method != "function"){ return; }
    instance[name] = function() { return method.apply(instance, arguments); };
  }

  for (var all in instance){ bind(all); }
};

ThreejsLayer.prototype.initialize = function(options){

  this.map = options.map;

  this.layer = new CanvasLayer({
    map: this.map,
    animate: false,
    callback: this.finalize
  });

  this.canvas = this.layer.canvas;

  this.camera = new THREE.OrthographicCamera(0, 1, 0, 1, -3000, 3000);
  this.camera.position.z = 1000;

  this.scene = new THREE.Scene();

  this.renderer = new THREE.WebGLRenderer({
    clearColor: 0x000000,
    clearAlpha: 0
  });

  this.resize();

  google.maps.event.addListener(this.map, 'bounds_changed', this.update);
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

ThreejsLayer.prototype.update = function() {

  var projection = this.map.getProjection(),
    zoom, scale, offset, bounds, topLeft;

  if (!projection){ return; }

  bounds = this.map.getBounds();

  topLeft = new google.maps.LatLng(
    bounds.getNorthEast().lat(),
    bounds.getSouthWest().lng()
  );

  zoom = this.map.getZoom();
  scale = Math.pow(2, zoom);
  offset = projection.fromLatLngToPoint(topLeft);

  this.resize();

  this.camera.position.x = offset.x / 256 ;
  this.camera.position.y = offset.y / 256;

  this.camera.scale.x = this.width / 256 / scale;
  this.camera.scale.y = this.height / 256 / scale;

  this.render();
};

ThreejsLayer.prototype.render = function() {
  this.renderer.render( this.scene, this.camera );
};

ThreejsLayer.prototype.add = function(geometry){
  this.scene.add(geometry);
};

ThreejsLayer.prototype.fromLatLngToVertex = function(latLng) {
  var projection = this.map.getProjection(),
    point = projection.fromLatLngToPoint(latLng),
    vertex = new THREE.Vector3();

  vertex.x = point.x / 256;
  vertex.y = point.y / 256;
  vertex.z = 0;

  return vertex;
};

ThreejsLayer.prototype.finalize = function() {

  this.layer.getPanes().overlayLayer.appendChild( this.renderer.domElement );
  this.canvas = this.renderer.domElement;
  this.layer.canvas = this.canvas;

  if (this.callback){
    this.callback(this);
  }

  this.update();
};