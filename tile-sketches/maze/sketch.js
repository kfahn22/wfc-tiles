// These sketches generate tiles and then runs the wave function collapse algorithm.
// The code is based on the Wave Function Collapse challenge by Dan Shiffman and 
// Local Storage by Dan Shiffman
// The tile generation code uses shaders and is my own but incorporates SDF functions // from Inigo Quilez
// Attempt to add track choice efficiently


let mazeShader;

preload = () => {
    // load the the shader
    mazeShader = loadShader('maze/maze.vert', 'maze/maze.frag');
}

setup = () => {
    pixelDensity(1);
    // shaders require WEBGL mode to work
    createCanvas(500, 500, WEBGL);
    noStroke();
}

draw = () => {
    background(0);
    mazeShader.setUniform('u_resolution', [width, height]);
    shader(mazeShader);
    rect(0, 0, width, height);

}
function mousePressed() {
    //saveFrames('uv', 'png', 1, 1);
    saveCanvas(`maze/maze_tiles/${i}.png`, 1, 1);
    }