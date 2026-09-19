//Morgan Lincicum
//CPSC444
//Lab 4

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

let gameOver = false;
let lastTime = 0;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 0.1, 15);
camera.lookAt(0, 0.1, 0);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scoreMessage = document.createElement("div");
scoreMessage.style.position = "fixed";
scoreMessage.style.top = "24px";
scoreMessage.style.left = "24px";
scoreMessage.style.fontFamily = "sans-serif";
scoreMessage.style.fontSize = "24px";
scoreMessage.style.fontWeight = "bold";
scoreMessage.style.color = "#ffffff";
scoreMessage.style.textShadow = "2px 2px 4px #000000";
scoreMessage.style.zIndex = "1";
document.body.appendChild(scoreMessage);

let score = 0;
updateScoreMessage(score);

// Ground Plane
const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x44aa44
});

const plane = new THREE.Mesh(
    planeGeometry,
    planeMaterial
);

plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Lights
const ambientLight = new THREE.AmbientLight(
    0xffffff,
    0.6
);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    1
);

directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Player Cube
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshStandardMaterial({
    color: 0x0000ff
});

const player = new THREE.Mesh(
    cubeGeometry,
    cubeMaterial
);

player.position.y = 0.5;
scene.add(player);

const obstacles = [];
let lastSpawn = 0;

//spawn function
function spawnObstacle(){
    //create obstacle
    let cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({color: 0xff0000})
    )
    //set random x position
    let ranX = (Math.random() -0.5) * 30;
    cube.position.set(ranX, 10, 0);
    obstacles.push(cube);
    scene.add(cube);
}
spawnObstacle();

// Keyboard State Object
const keys = {};

// Key Down
window.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;
});

// Key Up
window.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
});

// Movement Speed
const speed = 0.1;
const playerBounds = new THREE.Box3();
const objectBounds = new THREE.Box3();
const gameStartTime = performance.now();
const gameDuration = 20;


function updateScoreMessage(score) {
        scoreMessage.textContent = `Score: ${score}`;
}

function handleCollisions() {
    playerBounds.setFromObject(player);

    obstacles.forEach((object) => {

        objectBounds.setFromObject(object);
        const objectIsColliding = playerBounds.intersectsBox(objectBounds);

        if (objectIsColliding) {
            gameOver = true;
            scoreMessage.style.top = "50%";
            scoreMessage.style.right = "auto";
            scoreMessage.style.left = "50%";
            scoreMessage.style.transform = "translate(-50%, -50%)";
            scoreMessage.style.width = "100%";
            scoreMessage.style.textAlign = "center";
            scoreMessage.style.fontSize = "15vw";
            scoreMessage.style.color = "#ff3333";
            scoreMessage.textContent = "GAME OVER";
        } 
    });
}

// Animation Loop
function animate() {
    if (!gameOver) {

        requestAnimationFrame(animate);

        const currentTime = performance.now();
        //give +1 score every second
        if(currentTime - lastTime > 1000) {
            score++;
            updateScoreMessage(score);
            lastTime = currentTime;
        }
        //spawn obstacles with increasing speed as score increases
        if(currentTime - lastSpawn > 1000 - Math.min(800, score*10)) {
            spawnObstacle();
            lastSpawn = currentTime;
        }


        obstacles.forEach((object)=>
        {
            //obstacle speed gets faster as score increases
            object.position.y-= Math.random() * (0.1) + 0.05 + (0.0025 * score);
            if(object.position.y < -2) {
                scene.remove(object);
                let i = obstacles.indexOf(object);
                obstacles.splice(i, 1);
            }
        }
        );


        // WASD Controls
        if (keys["s"]) {
            player.position.z += speed;
        }

        if (keys["d"]) {
            player.position.x += speed;
        }

        // Arrow Key Controls
        if (keys["arrowleft"]) {
            player.position.x -= speed;
        }

        if (keys["arrowright"]) {
            player.position.x += speed;
        }

        handleCollisions();

        renderer.render(scene, camera);
    }
}

animate();

// Handle Window Resize
window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

});