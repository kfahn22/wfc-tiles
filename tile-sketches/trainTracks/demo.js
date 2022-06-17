// These sketches generate tiles and then runs the wave function collapse algorithm.
// The wfc algorithm code is based on the Wave Function Collapse challenge by Dan Shiffman
// https://www.youtube.com/watch?v=QvoTSl60Y88
// The idea for storing the tiles in local storage is based on the th Local Storage tutorial by Dan Shiffman
// https://www.youtube.com/watch?v=_SRS8b4LcZ8

new p5(fb => {

    // a shader variable
    let train0;

    // Declare variables
    let radio1;

    let button0;
    let c1;
    let graphics;

    fb.preload = () => {
        let bkcol = fb.getItem('backgroundcolor');
        if (bkcol !== null) {
            bc = bkcol;
        }
        // load the the shader
        train0 = fb.loadShader('trainTracks/train.vert', 'trainTracks/smallTrack.frag');
    }

    fb.setup = () => {
        fb.pixelDensity(1);
        fb.noStroke();



        let div0 = fb.createDiv();
        div0.position(10, 450);
        div0.style('max-width', '100px');
        div0.style('align-content', 'center');

        c1 = fb.createCanvas(100, 100, fb.WEBGL);
        c1.parent(div0);
        fb.pixelDensity(1);
        // shaders require WEBGL mode to work
        graphics = fb.createGraphics(100, 100, fb.WEBGL);

        button0 = fb.createButton('SAVE TILE A');
        button0.parent(div0);
        button0.mousePressed(fb.saveTile0);

        let div1 = fb.createDiv();
        div1.style('font-size', '16px');
        div1.position(350, 175);
        rad1label = fb.createP('Background');
        rad1label.parent(div1);
        rad1label.style("color", "#555555");
        radio1 = fb.createRadio();
        radio1.style('width', '75px');
        radio1.style("color", "#555555");
        radio1.parent(div1);
        radio1.option('0.0', 'white<br>');
        radio1.option('1.0', 'black<br>');
        radio1.option('2.0', 'grey<br>');
        radio1.option('3.0', 'red<br>');
        radio1.option('4.0', 'orange<br>');
        radio1.option('5.0', 'yellow<br>');
        radio1.option('6.0', 'green<br>');
        radio1.option('7.0', 'blue<br>');
        radio1.option('8.0', 'violet<br>');
        radio1.selected('2.0', 'grey<br>');
        radio1.attribute('name', 'div1');
    }

    fb.draw = () => {
        bc = radio1.value();
        train0.setUniform('u_resolution', [fb.width, fb.height]);
        train0.setUniform('bkcolor', bc);
        train0.setUniform('trackcolor', 1.0);
        train0.setUniform('circlecolor', 3.0);
        train0.setUniform('tileChoice', 0.0);
        fb.shader(train0);
        fb.rect(0, 0, fb.width, fb.height);
        fb.saveCol();
    }

    fb.saveCol = () => {
        bc = radio1.value();
        fb.storeItem("backgroundcolor", bc);
    }

    fb.saveTile0 = () => {
        fb.storeItem("img0", c1.elt.toDataURL());
    }

});

new p5(sb => {
    // a shader variable
    let train1;

    // Radio button for color choices
    let radio2;
    let button1;
    let c2;
    let graphics2;

    sb.preload = () => {
        // preload background color
        let bkcol = sb.getItem('backgroundcolor');
        if (bkcol !== null) {
            bc = bkcol;
       }
        // load the the shader
        train1 = sb.loadShader('train_track_generator/train.vert', 'train_track_generator/smallTrack.frag');
    }

    sb.setup = () => {
        sb.pixelDensity(1);
        sb.noStroke();
        // shaders require WEBGL mode to work

        let div2 = sb.createDiv();
        div2.position(200, 450);
        div2.style('max-width', '100px');
        c2 = sb.createCanvas(100, 100, sb.WEBGL);
        c2.parent(div2);
        sb.pixelDensity(1);
        graphics2 = sb.createGraphics(100, 100, sb.WEBGL);

        button1 = sb.createButton('SAVE TILE B');
        button1.mousePressed(sb.saveTile0);
        button1.parent(div2);

        let div3 = sb.createDiv();
        div3.style('font-size', '16px');
        div3.position(450, 175);
        rad2label = sb.createP('Circle Color');
        rad2label.parent(div3);
        rad2label.style("color", "#555555");
        radio2 = sb.createRadio();
        radio2.style('width', '75px');
        radio2.style("color", "#555555");
        radio2.parent(div3);
        radio2.option('0.0', 'white<br>');
        radio2.option('1.0', 'black<br>');
        radio2.option('2.0', 'grey<br>');
        radio2.option('3.0', 'red<br>');
        radio2.option('4.0', 'orange<br>');
        radio2.option('5.0', 'yellow<br>');
        radio2.option('6.0', 'green<br>');
        radio2.option('7.0', 'blue<br>');
        radio2.option('8.0', 'violet<br>');
        radio2.selected('3.0', 'red<br>');
        radio2.attribute('name', 'tile2');
    }

    sb.draw = () => {
        cc = radio2.value();
        train1.setUniform('u_resolution', [sb.width, sb.height]);
        train1.setUniform('trackcolor', 1.0);
        train1.setUniform('bkcolor', bc);
        train1.setUniform('circlecolor', cc);
        train1.setUniform('tileChoice', 1.0);
        sb.shader(train1);
        sb.rect(0, 0, sb.width, sb.height);
        sb.saveCol();
    }

    sb.saveCol = () => {
        cc = radio2.value();
        sb.storeItem("circlecolor", cc);
    }

    sb.saveTile0 = () => {
        sb.storeItem("img0", c2.elt.toDataURL());
    }
});

new p5(tb => {

    // a shader variable
    let train2;

    // Declare variables
    let radio3;
    let button2;
    let c3;
    let graphics2;

    tb.preload = () => {
        // preload background color
        let bkcol = tb.getItem('backgroundcolor');
        if (bkcol !== null) {
            bc = bkcol;
         }

        // load the the shader
        train2 = tb.loadShader('train_track_generator/train.vert', 'train_track_generator/smallTrack.frag');
    }

    tb.setup = () => {
        tb.pixelDensity(1);
        tb.noStroke();

        let div4 = tb.createDiv();
        div4.position(400, 450);
        div4.style('max-width', '100px');
        c3 = tb.createCanvas(100, 100, tb.WEBGL);
        c3.parent(div4);
        tb.pixelDensity(1);
        // shaders require WEBGL mode to work
        graphics2 = tb.createGraphics(100, 100, tb.WEBGL);

        button2 = tb.createButton('SAVE TILE C');
        button2.parent(div4);
        button2.mousePressed(tb.saveTile1);


        let div5 = tb.createDiv();
        div5.style('font-size', '16px');
        div5.position(560, 175);
        rad3label = tb.createP('Track Color');
        rad3label.parent(div5);
        rad3label.style("color", "#555555");
        radio3 = tb.createRadio();
        radio3.style('width', '75px');
        radio3.style("color", "#555555");
        radio3.parent(div5);
        radio3.option('0.0', 'white<br>');
        radio3.option('1.0', 'black<br>');
        radio3.option('2.0', 'grey<br>');
        radio3.option('3.0', 'red<br>');
        radio3.option('4.0', 'orange<br>');
        radio3.option('5.0', 'yellow<br>');
        radio3.option('6.0', 'green<br>');
        radio3.option('7.0', 'blue<br>');
        radio3.option('8.0', 'violet<br>');
        radio3.selected('1.0', 'black<br>');
        radio3.attribute('name', 'tile3');
    }

    tb.draw = () => {
        tc = radio3.value();
        train2.setUniform('u_resolution', [tb.width, tb.height]);
        train2.setUniform('trackcolor', tc);
        train2.setUniform('bkcolor', bc);
        train2.setUniform('circlecolor', 3.0);
        train2.setUniform('tileChoice', 2.0);
        tb.shader(train2);
        tb.rect(0, 0, tb.width, tb.height);
        tb.saveCol();
    }

    tb.saveCol = () => {
        tc = radio3.value();
        tb.storeItem("trackcolor", tc);
    }

    tb.saveTile1 = () => {
        tb.storeItem("img1", c3.elt.toDataURL());
    }

});

new p5(wfc => {

    const imgData = [];
    const tiles = [];
    const tileImages = [];

    let grid = [];

    const DIM = 10;
    let graphics;
    let button;

    wfc.preload = () => {
        for (let i = 0; i < 2; i++) {
            imgData[i] = wfc.getItem(`img${i}`);
            if (imgData[i] !== null) {
                tileImages[i] = wfc.loadImage(imgData[i]);
            } else {
                const path = "small_tracks";
                tileImages[i] = wfc.loadImage(`${path}/${i}.png`);

            }

        }
    }

    wfc.clear = () => {
        wfc.clearStorage();
    }

    wfc.setup = () => {
        canvasDiv = wfc.createDiv();
        canvasDiv.position(10, 10);

        let para0 = wfc.createP('WFC with Local Storage');
        para0.style("font-size", "24px");
        para0.style("color", "#555555");
        para0.parent(canvasDiv);

        canvas = wfc.createCanvas(300, 300);
        canvas.parent(canvasDiv);


        let para1 = wfc.createP('Choose TWO tiles:  either A and C or B and C.');
        para1.style("font-size", "20px");
        para1.style("color", "#555555");
        para1.position(10, 390);
        let para2 = wfc.createP('Press refresh to rerun the WFC algorithm or clear the color choices.<br> Press clear storage to reset the tiles.');
        para2.style("font-size", "20px");
        para2.style("color", "#555555");
        para2.position(350, 50);
        button = wfc.createButton('CLEAR STORAGE');
        button.position(350, 150);
        button.mousePressed(wfc.clear);

        // Load and code the tiles
        tiles[0] = new Tile(tileImages[0], ["AAA", "AAA", "AAA", "AAA"]);
        tiles[1] = new Tile(tileImages[1], ["ABA", "ABA", "ABA", "AAA"]);

        for (let i = 0; i < 2; i++) {
            for (let j = 1; j < 4; j++) {
                tiles.push(tiles[i].rotate(j));
            }
        }
        // Generate the adjacency rules based on edges
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            tile.analyze(tiles);
        }

        wfc.startOver();
    }

    wfc.startOver = () => {
        // Create cell for each spot on the grid
        for (let i = 0; i < DIM * DIM; i++) {
            grid[i] = new Cell(tiles.length);
        }

    }

    wfc.checkValid = (arr, valid) => {
        //console.log(arr, valid);
        for (let i = arr.length - 1; i >= 0; i--) {
            // VALID: [BLANK, RIGHT]
            // ARR: [BLANK, UP, RIGHT, DOWN, LEFT]
            // result in removing UP, DOWN, LEFT
            let element = arr[i];
            // console.log(element, valid.includes(element));
            if (!valid.includes(element)) {
                arr.splice(i, 1);
            }
        }
        // console.log(arr);
        // console.log("----------");
    }

    wfc.mousePressed = () => {
        wfc.redraw();
    }

    wfc.draw = () => {
        wfc.background(0);

        const w = wfc.width / DIM;
        const h = wfc.height / DIM;
        for (let j = 0; j < DIM; j++) {
            for (let i = 0; i < DIM; i++) {
                let cell = grid[i + j * DIM];
                if (cell.collapsed) {
                    let index = cell.options[0];
                    wfc.image(tiles[index].img, i * w, j * h, w, h);
                } else {
                    wfc.fill(0);
                    wfc.stroke(255);
                    wfc.rect(i * w, j * h, w, h);
                }
            }
        }

        // Pick cell with least entropy
        let gridCopy = grid.slice();
        gridCopy = gridCopy.filter((a) => !a.collapsed);
        // console.table(grid);
        // console.table(gridCopy);

        if (gridCopy.length == 0) {
            return;
        }
        gridCopy.sort((a, b) => {
            return a.options.length - b.options.length;
        });

        let len = gridCopy[0].options.length;
        let stopIndex = 0;
        for (let i = 1; i < gridCopy.length; i++) {
            if (gridCopy[i].options.length > len) {
                stopIndex = i;
                break;
            }
        }

        if (stopIndex > 0) gridCopy.splice(stopIndex);
        const cell = wfc.random(gridCopy);
        cell.collapsed = true;
        const pick = wfc.random(cell.options);
        if (pick === undefined) {
            wfc.startOver();
            return;
        }
        cell.options = [pick];

        const nextGrid = [];
        for (let j = 0; j < DIM; j++) {
            for (let i = 0; i < DIM; i++) {
                let index = i + j * DIM;
                if (grid[index].collapsed) {
                    nextGrid[index] = grid[index];
                } else {
                    let options = new Array(tiles.length).fill(0).map((x, i) => i);
                    // Look up
                    if (j > 0) {
                        let up = grid[i + (j - 1) * DIM];
                        let validOptions = [];
                        for (let option of up.options) {
                            let valid = tiles[option].down;
                            validOptions = validOptions.concat(valid);
                        }
                        wfc.checkValid(options, validOptions);
                    }
                    // Look right
                    if (i < DIM - 1) {
                        let right = grid[i + 1 + j * DIM];
                        let validOptions = [];
                        for (let option of right.options) {
                            let valid = tiles[option].left;
                            validOptions = validOptions.concat(valid);
                        }
                        wfc.checkValid(options, validOptions);
                    }
                    // Look down
                    if (j < DIM - 1) {
                        let down = grid[i + (j + 1) * DIM];
                        let validOptions = [];
                        for (let option of down.options) {
                            let valid = tiles[option].up;
                            validOptions = validOptions.concat(valid);
                        }
                        wfc.checkValid(options, validOptions);
                    }
                    // Look left
                    if (i > 0) {
                        let left = grid[i - 1 + j * DIM];
                        let validOptions = [];
                        for (let option of left.options) {
                            let valid = tiles[option].right;
                            validOptions = validOptions.concat(valid);
                        }
                        wfc.checkValid(options, validOptions);
                    }

                    // I could immediately collapse if only one option left?
                    nextGrid[index] = new Cell(options);
                }
            }
        }

        grid = nextGrid;
    }

    wfc.reverseString = (s) => {
        let arr = s.split("");
        arr = arr.reverse();
        return arr.join("");
    }

    wfc.compareEdge = (a, b) => {
        return a == wfc.reverseString(b);
    }

    class Tile {
        constructor(img, edges) {
            this.img = img;
            this.edges = edges;
            this.up = [];
            this.right = [];
            this.down = [];
            this.left = [];
        }

        analyze(tiles) {
            for (let i = 0; i < tiles.length; i++) {
                let tile = tiles[i];
                // UP
                if (wfc.compareEdge(tile.edges[2], this.edges[0])) {
                    this.up.push(i);
                }
                // RIGHT
                if (wfc.compareEdge(tile.edges[3], this.edges[1])) {
                    this.right.push(i);
                }
                // DOWN
                if (wfc.compareEdge(tile.edges[0], this.edges[2])) {
                    this.down.push(i);
                }
                // LEFT
                if (wfc.compareEdge(tile.edges[1], this.edges[3])) {
                    this.left.push(i);
                }
            }
        }

        rotate(num) {
            const w = this.img.width;
            const h = this.img.height;
            const newImg = wfc.createGraphics(w, h);
            newImg.imageMode(wfc.CENTER);
            newImg.translate(w / 2, h / 2);
            newImg.rotate(wfc.HALF_PI * num);
            newImg.image(this.img, 0, 0);
            //console.log(newImg);
            const newEdges = [];
            const len = this.edges.length;
            for (let i = 0; i < len; i++) {
                newEdges[i] = this.edges[(i - num + len) % len];
            }
            return new Tile(newImg, newEdges);
        }
    }
});