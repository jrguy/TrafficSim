class coords{
    map_min = new point(0, 0);
    map_max = new point(0,0);
    height = 0;
    width = 0;
    cord_min;
    cord_max;
    scaleF = 100000;


    constructor(bounds){
        let min_y = bounds[0];
        let min_x = bounds[1];
        let max_y = bounds[2];
        let max_x = bounds[3];
        this.cord_min = new point(min_x, min_y);
        this.cord_max = new point(max_x, max_y);
        min_y = min_y * this.scaleF;
        min_x = min_x * this.scaleF; 
        max_y = max_y * this.scaleF;
        max_x = max_x * this.scaleF; 
        this.height = max_y - min_y; 
        this.width = max_x - min_x;
        console.log(" w " + this.width + " h " + this.height);
        
    }

    get_height(){
        return this.height;
    }

    get_width(){
        return this.width; 
    }

    get_map(givenXC, givenYC){
        let testX = givenXC * this.scaleF; 
        let testY = givenYC * this.scaleF;
        testX = testX - (this.cord_min.x * this.scaleF );
        testY = (this.cord_max.y * this.scaleF ) - testY;
        //testX = this.cord_min.x + testX;

        return new point(Math.floor(testX), Math.floor(testY));
    }

}

class point{
    x = 0; 
    y = 0;

    constructor(given_x, given_y){
        this.x = given_x; 
        this.y = given_y; 
    }

    update(gX, gY){
        this.x = gX;
        this.y = gY;
    }
}