# Three.js Layer for the Google Maps API

Google Maps API layer that uses [Three.js](http://mrdoob.github.com/three.js/) to for super fast animation.

### Usage

```js
new ThreejsLayer(options, completeCallback);
```

### Example


```js
new ThreejsLayer({ map: map }, function(layer){
  
  var geometry = new THREE.Geometry(),
    location = new google.maps.LatLng(lat, lng),
    vertex = layer.fromLatLngToVertex(location);

  geometry.vertices.push( vertex );

  var particles = new THREE.ParticleSystem(geometry, material);
  layer.add(particles);
});

```

### About

Based on the excellent [CanvasLayer](https://google-maps-utility-library-v3.googlecode.com/svn/trunk/canvaslayer/docs/reference.html) by [@brendankenny](https://github.com/brendankenny)

Developed by [Martin Kleppe](https://plus.google.com/103747379090421872359/) at [Ubilabs](http://www.ubilabs.net). 

Released under the [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).

[![Analytics](https://ga-beacon.appspot.com/UA-57649-14/google-maps-api-threejs-layer)](https://github.com/igrigorik/ga-beacon)
