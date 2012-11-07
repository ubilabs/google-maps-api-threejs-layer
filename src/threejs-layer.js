
var camera, scene, renderer, particles, geometry;

function initThree(){


  if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


  var material, parameters, i, h;

  var width = 1024, height = 768;

  init();
  animate();

  function init() {

    camera = new THREE.OrthographicCamera(
      width / -2,   // Left
      width / 2,    // Right
      height / 2,   // Top
      height / -2,
      -3000,        // Near clipping plane
      3000
    );

    camera.position.z = 1500;

    scene = new THREE.Scene();

    geometry = new THREE.Geometry();

    var projection = map.getProjection();

    for ( i = 0; i < photos.length; i ++ ) {

      var photo = photos[i],
        vertex = new THREE.Vector3(),
        location = new google.maps.LatLng(photo[0], photo[1]),

        point = projection.fromLatLngToPoint(location);

      vertex.x = point.x;
      vertex.y = -point.y;
      vertex.z = -100;

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

    scene.add( particles );

    renderer = new THREE.WebGLRenderer({
      clearColor: 0x000000,
      clearAlpha: 0
    });

    renderer.setSize( 1024, 768 );

    canvasLayer.getPanes().overlayLayer.appendChild( renderer.domElement );
    canvasLayer.canvas = renderer.domElement;

  }

  function animate() {
    requestAnimationFrame( animate );
    render();
  }

  function render() {
    renderer.render( scene, camera );
  }

  function generateSprite() {

    var canvas = document.createElement( 'canvas' );

    canvas.width = 20;
    canvas.height = 20;

    var context = canvas.getContext( '2d' );
    var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
    gradient.addColorStop( 1.0, 'rgba(255,255,255,0)' );
    gradient.addColorStop( 0.0, 'rgba(255,255,255,1)' );

    context.fillStyle = gradient;
    context.fillRect( 0, 0, canvas.width, canvas.height );

    return canvas;

  }
}