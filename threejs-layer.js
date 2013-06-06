function ThreejsLayer(options, callback){
  this.bindAll();
  this.callback = callback;
  this.initialize(options || {});

  this.firstRun = true;

  if (options.map) {
    this.setMap(options.map);
  }
}

ThreejsLayer.prototype = new google.maps.OverlayView();

ThreejsLayer.CSS_TRANSFORM = (function() {
  var div = document.createElement('div');
  var props = [
    'transform',
    'WebkitTransform',
    'MozTransform',
    'OTransform',
    'msTransform'
  ];

  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    if (div.style[prop] !== undefined) {
      return prop;
    }
  }

  return props[0];
})();

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

  this.options = options;

  this.camera = new THREE.OrthographicCamera(0, 1, 0, 1, -3000, 3000);
  this.camera.position.z = 1000;

  this.scene = new THREE.Scene();

  this.renderer = new THREE.WebGLRenderer({
    clearColor: 0x000000,
    clearAlpha: 0
  });

  this.canvas = this.renderer.domElement;
};

ThreejsLayer.prototype.onAdd = function() {

  this.map = this.getMap();

  this.getPanes().overlayLayer.appendChild(this.canvas);

  this.changeHandler = google.maps.event.addListener(
    this.map,
    'bounds_changed',
    this.draw
  );

  this.draw();
};

ThreejsLayer.prototype.onRemove = function() {

  if (!this.map) { return; }

  this.map = null;

  this.canvas.parentElement.removeChild(this.canvas);

  if (this.changeHandler) {
    google.maps.event.removeListener(this.changeHandler);
    this.changeHandler = null;
  }
};

ThreejsLayer.prototype.draw = function() {

  if (!this.map) { return; }

  var bounds = this.map.getBounds();

  var topLeft = new google.maps.LatLng(
    bounds.getNorthEast().lat(),
    bounds.getSouthWest().lng()
  );

  var projection = this.getProjection();
  var point = projection.fromLatLngToDivPixel(topLeft);

  this.canvas.style[ThreejsLayer.CSS_TRANSFORM] = 'translate(' +
      Math.round(point.x) + 'px,' +
      Math.round(point.y) + 'px)';

  if (this.firstRun) {
    this.firstRun = false;
    
    if (this.callback){
      this.callback(this);
    }
  }

  this.update();
};

ThreejsLayer.prototype.resize = function(){

  if (!this.map){ return; }

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
  cancelAnimationFrame(this.animationFrame);
  this.animationFrame = requestAnimationFrame(this.deferredRender);
};

ThreejsLayer.prototype.deferredRender = function(){
  if (typeof this.options.render === false) {
    return;
  } else if (typeof this.options.render == "function"){
    this.options.render();
  } else {
    this.renderer.render( this.scene, this.camera );
  }
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