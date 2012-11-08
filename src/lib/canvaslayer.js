function CanvasLayer(options) {

  this.firstRun = true;

  var canvas = document.createElement('canvas');

  canvas.style.position = 'absolute';
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.pointerEvents = 'none';

  this.canvas = canvas;

  function bind(context, func) {
    return function() { func.apply(context); };
  }

  this.draw = bind(this, this.draw);

  this.finalize = options.callback;

  if (options.map !== undefined) {
    this.setMap(options.map);
  }
}

CanvasLayer.prototype = new google.maps.OverlayView();

CanvasLayer.CSS_TRANSFORM_ = (function() {
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

CanvasLayer.prototype.onAdd = function() {

  this.map = this.getMap();

  this.getPanes().overlayLayer.appendChild(this.canvas);

  this.changeHandler = google.maps.event.addListener(
    this.map,
    'bounds_changed',
    this.draw
  );

  this.draw();
};

CanvasLayer.prototype.onRemove = function() {

  if (!this.map) { return; }

  this.map = null;

  this.canvas.parentElement.removeChild(this.canvas);

  if (this.changeHandler) {
    google.maps.event.removeListener(this.changeHandler);
    this.changeHandler = null;
  }
};

CanvasLayer.prototype.draw = function() {

  if (!this.map) { return; }

  var bounds = this.map.getBounds();

  var topLeft = new google.maps.LatLng(
    bounds.getNorthEast().lat(),
    bounds.getSouthWest().lng()
  );

  var projection = this.getProjection();
  var point = projection.fromLatLngToDivPixel(topLeft);

  this.canvas.style[CanvasLayer.CSS_TRANSFORM_] = 'translate(' +
      Math.round(point.x) + 'px,' +
      Math.round(point.y) + 'px)';

  if (this.firstRun) {
    this.firstRun = false;
    this.finalize();
  }
};