// // Import TFJS runtime with side effects.
// import '@tensorflow/tfjs-backend-webgl';
// import * as poseDetection from '@tensorflow-models/pose-detection';
// // import 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl';
// // import * as poseDetection from 'https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection';

/* 
=============
Params
=============
*/

let capture;
let font;

let detector;
let poses;

let angle = 0.0;

/* 
=============
Function
=============
*/

function preload() {
    font = loadFont('./assets/NotoSans-Regular.ttf');
}

function setup() {
    console.log("setup...");
    createCanvas(windowWidth,windowHeight,WEBGL);

    textFont(font);

    setupCamera();

    // // For video file
    // capture = createVideo("./video.mp4");
    // capture.elt.muted = true;
    // capture.loop();
    // initModel();

    background(255);
    text("Wait for setup...", 20, 20);
}

function setupCamera(id = ""){
    if(id == ""){
        capture = createCapture(VIDEO, captureLoaded);
    }else{
        let option = {
            video: {
                deviceId: id,
                // width: imageSize.width,
                // height: imageSize.height
            },
            audio: true
        };
        capture = createCapture(option, captureLoaded);
    }
    capture.hide();
}

function captureLoaded(){
    console.log("capture loaded...");
    initModel();
}

async function initModel(){
    const _model = poseDetection.SupportedModels.BlazePose;
    console.log("model:", _model);
    const detectorConfig = {
        runtime: 'tfjs', // 'mediapipe', 'tfjs'
        modelType: 'full' // 'lite', 'full', 'heavy'
    };
    detector = await poseDetection.createDetector(_model, detectorConfig);
}

async function getPose(){
    poses = await detector.estimatePoses(capture.elt);
}

function draw() {
    //rectMode(CENTER);

    drawBackground({});

    if(detector){
        getPose();
    }
    
    drawPoseInfo();
}

function drawBackground({forWEBGL = true}) {
    // For capture
    push();
    if(forWEBGL){
        translate(windowWidth/2.0, -windowHeight/2.0);
        
    }else{
        translate(windowWidth, 0); 
    }
    scale(-1, 1);
    //tint(255, 128); // Sets the fill value for displaying images
    image(capture, 0, 0, windowWidth, windowHeight);
    pop();

    // For keypoints3D
    push();
    if(forWEBGL){
        translate(windowWidth/2.0, -windowHeight/2.0);
        
    }else{
        translate(windowWidth, 0); 
    }
    noStroke();
    fill(0, 0, 0, 50);
    let size = windowHeight/4.0;
    rect(-windowWidth, 0, size, size);
    pop();
}

function drawPoseInfo() {
    if(poses && poses.length > 0){
        // console.log(poses);
        angle+=0.01;
        for(var i=0; i<poses.length; i++){
            for(var j=0; j<poses[i].keypoints3D.length; j++){
                if(poses[i].keypoints3D[j].score > 0.5){
                    let posX = -windowWidth/2.0 + (windowWidth - poses[i].keypoints[j].x*(windowWidth/capture.width));
                    let posY = -windowHeight/2.0 + (poses[i].keypoints[j].y*(windowHeight/capture.height));

                    // Draw circle at keypoint position
                    noStroke();
                    fill(255, 0, 0, 128);
                    circle(posX, posY, 10);

                    // Draw keypoint name
                    push();
                    translate(posX, posY);
                    rotateZ(-PI/4.0);
                    fill(255);
                    text(String(j+1)+": "+poses[i].keypoints[j].name, 10, 0);
                    pop();

                    let posX3D = 1.0-(poses[i].keypoints3D[j].x+1.0)/2.0;
                    let posY3D = (poses[i].keypoints3D[j].y+1.0)/2.0;
                    let posZ3D = (poses[i].keypoints3D[j].z+1.0)/2.0;
                    // if(poses[i].keypoints3D[j].name == "nose"){
                    //     text(String(Math.round(posX3D*100))+", "+String(Math.round(posY3D*100))+", "+String(Math.round(posZ3D*100)), 0, 0);
                    // }

                    // Draw box at keypoint3D position
                    push();

                    // Rotate to see the depth
                    let tx = -windowWidth/2.0+windowHeight/8.0;
                    let ty = -windowHeight/2.0+windowHeight/8.0;
                    let tz = windowHeight/32.0;           
                    translate(tx, ty, tz);
                    rotateY(angle);
                    translate(-tx, -ty, -tz);

                    // Set plane instead of ground
                    translate(tx, ty, tz);
                    translate(0, windowHeight/8.0, 0);
                    rotateX(PI/2.0);
                    fill(255, 0, 0, 15);
                    plane(50, 50);
                    rotateX(-PI/2.0);
                    translate(0, -windowHeight/8.0, 0);
                    translate(-tx, -ty, -tz);

                    // Draw box
                    translate(-windowWidth/2.0, -windowHeight/2.0);       
                    translate(posX3D*windowHeight/4.0, posY3D*windowHeight/4.0, posZ3D*windowHeight/16.0);
                    normalMaterial();
                    box(5);

                    pop();
                }
            }
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function keyTyped() {
    switch (key) {
        case 'f':
            let fs = fullscreen();
            fullscreen(!fs);
            break;
        default:
            break;
    }
}