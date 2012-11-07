
function initThree(){


  if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


  var container, stats;
  var camera, scene, renderer, particles, geometry, material, parameters, i, h;

  var width = 1024, height = 768;

  init();
  animate();

  function init() {

    container = document.createElement( 'div' );
    container.className = "webgl";
    document.body.appendChild( container );

    camera = new THREE.OrthographicCamera(
      width / -2,   // Left
      width / 2,    // Right
      height / 2,   // Top
      height / -2,
      -3000,            // Near clipping plane
      3000
    );

    camera.position.z = 1500;

    scene = new THREE.Scene();

    geometry = new THREE.Geometry();

    for ( i = 0; i < 60000; i ++ ) {

      var vertex = new THREE.Vector3();

      vertex.x = Math.random() * width - width/2;
      vertex.y = Math.random() * height - height/2;
      vertex.z = Math.random() * width - width/2;

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
    container.appendChild( renderer.domElement );
  }

  function animate() {
    requestAnimationFrame( animate );
    render();
  }

  function render() {
    var time = Date.now() * 0.00005;
    for ( i = 0; i < scene.children.length; i ++ ) {

      var object = scene.children[ i ];

      if ( object instanceof THREE.ParticleSystem ) {
        object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );
      }
    }

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