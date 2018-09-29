const PubSub = require('../helpers/pub_sub');
const THREE = require('three');
const OrbitControls = require('three-orbitcontrols');


const ElevationView = function(container, zScale){

    this.container = container;

    this.width = container.clientWidth;
    this.height = container.clientHeight;

    this.elevations = null;
    this.zoomLevel = null;

    this.camera = null;
    this.controls = null;
    this.scene = null;
    this.renderer = null;

    this.mesh = null;
    this.texture = null;

    this.worldWidth = 32;
    this.worldDepth = 32;

    this.zScale = zScale;
    this.maxHeight = 1000;


};

ElevationView.prototype.bindEvents = function(){

    PubSub.subscribe('BingApi:elevations-available', (event) => {

        this.elevations = event.detail.elevations;
        this.zoomLevel = event.detail.zoomLevel;

        this.calcMaxHeight();

        this.buildView();

    });

    PubSub.subscribe('ZControl:value-changed', (event) => {
        this.zScale = event.detail;
        if (this.scene){
            this.buildView();
        }

    });

    PubSub.subscribe('Location:z-scale-set', (event) => {
       this.zScale = event.detail;
    });
};

ElevationView.prototype.getCoords = function(){

    const t = this.controls.target;
    const c = this.camera.position;

    const msg = `Ctrl tar: ${t.x}, ${t.y}, ${t.z} | Cam pos: ${c.x}, ${c.y}, ${c.z}`;

    return msg;

};

ElevationView.prototype.calcMaxHeight = function(){

    this.maxHeight =  Math.max(...this.elevations);

};

ElevationView.prototype.generateHeights = function(width, height){

    let data = this.elevations;
    return data;

};

ElevationView.prototype.reverseWindingOrder = function(obj3D){

    if (obj3D.type === "Mesh") {

        let geometry = obj3D.geometry;

        for (let i = 0, l = geometry.faces.length; i < l; i++) {

            let face = geometry.faces[i];
            let temp = face.a;
            face.a = face.c;
            face.c = temp;

        }

        let faceVertexUvs = geometry.faceVertexUvs[0];
        for (let i = 0, l = faceVertexUvs.length; i < l; i++) {

            let vector2 = faceVertexUvs[i][0];
            faceVertexUvs[i][0] = faceVertexUvs[i][2];
            faceVertexUvs[i][2] = vector2;
        }

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

    }

    if (obj3D.children) {

        for (let j = 0, jl = obj3D.children.length; j < jl; j++) {

            this.reverseWindingOrder(obj3D.children[j]);
        }
    }

};


ElevationView.prototype.generateTexture = function(data, width, height){
    // bake lighting into texture
    var canvas, canvasScaled, context, image, imageData, vector3, sun, shade;

    vector3 = new THREE.Vector3( 0, 0, 0 );

    sun = new THREE.Vector3( 1, 1, 1 );
    sun.normalize();

    canvas = document.createElement( 'canvas' );

    canvas.width = this.width;
    canvas.height = this.height;
    context = canvas.getContext( '2d' );

    context.fillStyle = '#fff';
    context.fillRect( 0, 0, width, height );

    image = context.getImageData( 0, 0, canvas.width, canvas.height );
    imageData = image.data;

    for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {
        vector3.x = data[ j - 2 ] - data[ j + 2 ];
        vector3.y = 2;
        vector3.z = data[ j - this.width * 2 ] - data[ j + this.width * 2 ];
        vector3.normalize();
        shade = vector3.dot( sun );
        imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
    }

    context.putImageData( image, 0, 0 );

    // Scaled 4x
    canvasScaled = document.createElement( 'canvas' );
    canvasScaled.width = this.width * 4;
    canvasScaled.height = this.height * 4;
    context = canvasScaled.getContext( '2d' );
    context.scale( 4, 4 );
    context.drawImage( canvas, 0, 0 );
    image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
    imageData = image.data;
    for (let i = 0, l = imageData.length; i < l; i += 4 ) {
        let v = ~ ~ ( Math.random() * 5 );
        imageData[ i ] += v;
        imageData[ i + 1 ] += v;
        imageData[ i + 2 ] += v;
    }
    context.putImageData( image, 0, 0 );
    return canvasScaled;
};

ElevationView.prototype.buildView = function(){

    const zScale = this.zScale;


    this.camera = new THREE.PerspectiveCamera( 60, this.width / this.height, 1, 20000 );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xbfd1e5 );


    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( this.width, this.height );


    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.minDistance = 1000;
    this.controls.maxDistance = 20000;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;
    this.controls.enableRotate = true;
    this.controls.enablePan = true;

    let data = this.generateHeights(this.worldWidth, this.worldDepth);

    let geometry = new THREE.PlaneGeometry(  7500, 7500, this.worldWidth - 1, this.worldDepth - 1);


    this.controls.target.y = (this.maxHeight * zScale);

    this.camera.position.x = 0;
    this.camera.position.y = this.controls.target.y + 4000 ;
    this.camera.position.z = -6000;

    this.controls.update();

    for (let i = 0, l = geometry.vertices.length; i < l; i++) {
        geometry.vertices[i].z = data[i] * zScale;
    }


    for ( let i = 0; i < geometry.faces.length; i ++ ) {

        let face = geometry.faces[ i ];
        let temp = face.a;
        face.a = face.c;
        face.c = temp;

    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    let faceVertexUvs = geometry.faceVertexUvs[ 0 ];
    for ( let i = 0; i < faceVertexUvs.length; i ++ ) {

        let temp = faceVertexUvs[ i ][ 0 ];
        faceVertexUvs[ i ][ 0 ] = faceVertexUvs[ i ][ 2 ];
        faceVertexUvs[ i ][ 2 ] = temp;

    }

    geometry.rotateX( - Math.PI / 2 );


    let phong = new THREE.MeshPhongMaterial( {
        color: 0x3e703b,
        specular: 0x050505,
        shininess: 100
    } ) ;

    this.mesh = new THREE.Mesh( geometry, phong );

    this.mesh.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
    this.reverseWindingOrder(this.mesh);


    this.scene.add( this.mesh );

    let directionalLight = new THREE.DirectionalLight( 0xffffff, 0.75 );
    directionalLight.position.set(0.25, 0.5, 0);

    this.scene.add( directionalLight );

    this.container.innerHTML = "";

    this.container.appendChild(this.renderer.domElement);

    this.controls.addEventListener('change', ()=> {

        this.renderer.render(this.scene, this.camera);
    });


    this.renderer.render(this.scene, this.camera);


};



module.exports = ElevationView;