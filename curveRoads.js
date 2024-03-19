class Road{
    name = 'ROAD ' + Math.floor(Math.random() * 100) + 1;
    start_x = 0;
    start_y = 0; 
    end_x = 0; 
    end_y = 0; 
    horizontal = true;
    x_offset = 0;
    y_offset = 0; 
    cars = [];
    intersections = [];
    lanes = [];
    max_speed = 3; 
    num_lanes = 1;
    update_a = [];
    reset_a = [];
    change_a = [];
    road_points = [];

    constructor( r_point, hor, num_lanes, draw_size){
        this.start_x = r_point[0].x; 
        this.start_y = r_point[0].y; 
        let last = r_point.length - 1; 
        this.end_x = r_point[last].x; 
        this.end_y = r_point[last].y; 
        this.road_points = r_point;
        this.horizontal = hor;
        this.num_lanes = num_lanes; 
        
        let lane_off_x = 0; 
        let lane_off_y = 0;
        // this.y_offset = draw_size; 
        // lane_off_y = Math.floor(draw_size/2); 
        this.x_offset = draw_size;
        lane_off_x = Math.floor(draw_size/2);

        // if(hor){
        //     this.y_offset = draw_size; 
        //     lane_off_y = Math.floor(draw_size/2); 
        // } else {
        //     this.x_offset = draw_size;
        //     lane_off_x = Math.floor(draw_size/2); 
        // } 

        let slope_x = r_point[1].x - r_point[0].x;
        let slope_y = r_point[1].y - r_point[0].y;
        // console.log(" slope " + this.x + " y " + this.y);
        let m = ( slope_y / slope_x);
        let per_m = -1/m;


        for (let i = 0; i < num_lanes; i++) {


            let laneOffXA = lane_off_x + (i * this.x_offset);
            let laneOffYA = lane_off_y + (i * this.y_offset);

            //build new point list for each point using offsets 
            // pass list to lane 
            let lane1P = [r_point.length];
            let lane2P = [r_point.length];
            let l = last;
            let m = 0;
            //build both lanes at the same time reversing postion in list for opisite lane 
            r_point.forEach(p => {
                lane1P[m] = new road_point(p.x - laneOffXA, p.y + laneOffYA);
                lane2P[l] = new road_point(p.x + laneOffXA, p.y - laneOffYA);
                m++;
                l--;
            });

            console.log(" lane points ");
            console.log(lane1P);
            console.log(lane2P);
            let lane1 = new lane(lane1P, this.horizontal, "#B2BEB5");
            let lane2 = new lane(lane2P, this.horizontal, "#36454F");
            this.lanes.push(lane1);
            this.lanes.push(lane2);
        }
    }

    accept_car( car, reset ){
        this.cars.push(car);
        if( reset ){
            this.set_pos( car );
        }
    }

    remove_car( car ){
        let i = this.cars.indexOf(car);
        if( i > -1){
            this.cars.splice(i, 1);
        }
    }

    print_car_array(car){
        let i = this.cars.indexOf(car);
        return i;
    }

    accept_car_lane(car, start_p){
        this.lanes.forEach(lane => {
            if(lane.startP.x == start_p.x && lane.startP.y == start_p.y){
                this.cars.push(car);
                lane.add_car(car);
                car.get_lane(lane);
                car.get_road( this );
                //change end point use road intersection to find other roads 
                car.set_points(lane.startP.x, lane.startP.y, lane.endP.x, lane.endP.y );
            }
        });
    }

    get_given_end( start_p ){
        let temp = null;
        this.lanes.forEach(lane => {
            if(lane.startP.x == start_p.x && lane.startP.y == start_p.y){
                temp = lane.endP;
            }
        });
        return temp;
    }

    accept_inter(intersection){
        this.intersections.push(intersection);
    }

    get dir_update(){
        if(this.horizontal){
            this.intersections[0].check_bounds(0);
            return [1,0];
        } else {
            return [0,1];
        }
    } 

    get_start_p(){
        let lane_s = [];
        this.lanes.forEach(lane => {
            lane_s.push(lane.startP);
        });
        return lane_s;
    }

    get_end_p(){
        let lane_s = [];
        this.lanes.forEach(lane => {
            lane_s.push(lane.endP);
        });
        return lane_s;
    }

    has_start_p(start_p){
        let present = false;
        this.lanes.forEach(lane => {
            if(lane.startP.x == start_p.x && lane.startP.y == start_p.y){
                present = true; 
            }
        });
        return present;
    }

    check_lane_start(start_p){
        let occ = false;
        this.lanes.forEach(lane => {
            if(lane.startP.x == start_p.x && lane.startP.y == start_p.y){
                if(lane.car_in_start()){
                    occ = true; 
                }
            }
        });
        return occ; 
    }

    set_pos(car){
        car.reset()
    }

    get_distance(x1, y1, x2, y2){
        let a = x1 - x2; 
        let b = y1 - y2;

        return Math.abs(Math.sqrt( a*a + b*b));
    }
    
    check_car(i, val, car, endPoint){


        let move = true; 
        let checkInter = false;

        let moveXY = car.get_speed(val[0], val[1], this.max_speed);
        let x = moveXY[0]; 
        let y = moveXY[1];

        if(car.in_end()){
            this.reset_a.push([this.print_car_array(car),0]);
            move = false;
        } else if(car.check_end(endPoint.x, endPoint.y)){
            this.reset_a.push([this.print_car_array(car),0]);
            move = false;         
        } else if( x > WIDTH || y > HEIGHT || x < 0 || y < 0   ){
            if(this.get_distance(x, y, car.startP.x, car.startP.y) > 25){
                this.reset_a.push([this.print_car_array(car),0]);
                move = false;   
            }
        } 

        if(move){
            //check lane size
            x = x + (val[0] * 25)
            y = y + (val[1] * 25)
            let chX = x;
            let chY = y;

            for (let l = 0; l < this.intersections.length; l++) {
                chX = x + ( val[0] * ( this.intersections[l].offest  + car.radius));
                chY = y + ( val[1] * ( this.intersections[l].offest  + car.radius));
                // console.log(" build val x" + ( this.intersections[l].offest * this.intersections[l].road_lanes_x + car.radius) );
                // console.log(" build val y" + ( this.intersections[l].offest * this.intersections[l].road_lanes_y + car.radius) );
                // console.log(" current x " + x + " y " + y);
                // console.log(" change x " + chX +" y " + chY);
                //update to match boths as it being true twice 
                if(this.intersections[l].check_in_bounds(chX, chY)){
                    checkInter = true;
                }

                if(checkInter){
                    if( val[0] > 0 || val[1] > 0){
                        if( !this.intersections[l].check_lanes(val[2]) ){
                            move = false; 
                        }
                    } else {
                        if( !this.intersections[l].check_lanes(val[3]) ){
                            move = false; 
                        }
                    }
                    //check if intersection roads has end point 
                    if( move && car.need_change){

                        if( this.intersections[l].check_ends(car.endP, car, x, y) ){
                            this.update_a.push([this.print_car_array(car),l]);
                        } else {
                            let best_c = this.intersections[l].check_car_lane( car, x, y);
                            this.change_a.push([this.print_car_array(car), l, best_c]);
                        }
                    }
                }
                checkInter = false;
            }

            let testX = car.x + val[0];
            let testY = car.y + val[1]
            car.present_lane.cars.forEach(lane_car => {
                if( car.name != lane_car.name ){
                    if( car.x == lane_car.x ){
                        if( val[1] > 0 ){
                            for( let i = testY; i <= y; i++){
                                if(i == lane_car.y){
                                    move = false; 
                                    car.update_blocked(true);
                                    i = y + 1;
                                }
                            }
                        } else {
                            for( let i = testY; i >= y; i--){
                                if(i == lane_car.y){
                                    move = false; 
                                    car.update_blocked(true);
                                    i = y - 1;
                                }
                            }
                        }
                    } else if( car.y == lane_car.y ){
                        if( val[0] > 0 ){
                            for( let i = testX; i <= x; i++){
                                if( i == lane_car.x){
                                    move = false; 
                                    car.update_blocked(true);
                                    i = x + 1;
                                }
                            }
                        } else {
                            for( let i = testX; i >= x; i--){
                                if( i == lane_car.x){
                                    move = false; 
                                    car.update_blocked(true);
                                    i = x - 1;
                                }
                            }
                        }
                    }
                }
            });
        }

        if(move){
            car.update_dir(val[0], val[1], this.max_speed);
        }
    }

    check_cars_end(){
        this.lanes.forEach(lane => {
            let lane_c = lane.cars;
            lane.cars.forEach(car =>{
                if(lane.endP.x != car.endP.x || lane.endP.y != car.endP.y ){
                    car.need_change = true; 
                }
                lane_c.forEach(l_car => {
                    if( l_car.name != car.name && car.x == l_car.x && car.y == l_car.y) {
                        car.add_delay();
                    }
                });
            })
        })
    }

    draw( graphics ){
        // graphics.lineStyle(5, '#B2BEB5');
        //.lineStyle(2, 0xfeeb77, 1);
        //#B2BEB5
        //#36454F
        //#FFED0B YELLOW

        //road_points

        for (let l = 0; l < this.lanes.length; l++) {
            graphics.lineStyle(0); 
            graphics.beginFill(this.lanes[l].color, 1);
            graphics.drawCircle(this.lanes[l].lane_points[0].x, this.lanes[l].lane_points[0].y, 5);
            graphics.endFill();

            let len = this.lanes[l].lane_points.length - 1;
            graphics.lineStyle(0); 
            graphics.beginFill(this.lanes[l].color, 1);
            graphics.drawCircle(this.lanes[l].lane_points[len].x, this.lanes[l].lane_points[len].y, 5);
            graphics.endFill();

            graphics.lineStyle(10, this.lanes[l].color);
            graphics.moveTo(this.lanes[l].lane_points[0].x, this.lanes[l].lane_points[0].y);
            for (let i = 1; i < this.lanes[l].lane_points.length; i++) {
                graphics.lineTo(this.lanes[l].lane_points[i].x, this.lanes[l].lane_points[i].y);
            }


        } 

        graphics.lineStyle(2, "#FFED0B");
        graphics.moveTo(this.road_points[0].x, this.road_points[0].y);
        for (let i = 1; i < this.road_points.length; i++) {
            graphics.lineTo(this.road_points[i].x, this.road_points[i].y);
        }

        // for (let i = 0; i < this.road_points.length - 1; i++) {

        //     let startOffX = this.road_points[i].x - (this.x_offset  * (this.lanes.length/2));
        //     let startOffY = this.road_points[i].y - (this.y_offset  * (this.lanes.length/2));
        //     let endOffX = this.road_points[i + 1].x - (this.x_offset  * (this.lanes.length/2));
        //     let endOffY = this.road_points[i + 1].y - (this.y_offset  * (this.lanes.length/2));

        //     for (let l = 0; l < this.lanes.length; l++) {
        //         //.color
        //         graphics.lineStyle(10, this.lanes[l].color);

        //         graphics.moveTo(startOffX, startOffY);
        //         graphics.lineTo(endOffX, endOffY);
                
        //         startOffX = startOffX + this.x_offset; 
        //         startOffY = startOffY + this.y_offset;
        //         endOffX = endOffX + this.x_offset; 
        //         endOffY = endOffY + this.y_offset;
        //     }
        // }

    }

    draw_cars( graphics, running ){
        if( running ){
            let i = 0;
            this.lanes.forEach(lane => {
                if( lane.startP.cars.length > 0 ){
                    if(!lane.car_in_start()){
                        lane.release();
                    }
                }
                lane.cars.forEach(car =>{
                    car.draw(graphics);
                    car.draw_end(graphics);
                    let val = lane.get_dir(car);
                    this.check_car(i, val, car, lane.endP);
                    i++;
                });
            });
            let car_r = [];
            if(this.update_a.length > 0){
                for (let i = 0; i < this.update_a.length; i++) {
                    //remove car from lane
                    this.cars[this.update_a[i][0]].present_lane.remove_car(this.cars[this.update_a[i][0]]);
                    //move car to lane 
                    this.intersections[this.update_a[i][1]].switch_car_lane_goal(this.cars[this.update_a[i][0]]);
                    car_r.push(this.cars[this.update_a[i][0]]);
                }
                this.update_a.length = 0;
            }

            if(this.change_a.length > 0){
                 //console.log("       leng change_a " + this.change_a.length);
                for (let i = 0; i < this.change_a.length; i++) {
                    //console.log(this.change_a[i]);
                    // //remove car from lane
                    this.cars[this.change_a[i][0]].present_lane.remove_car(this.cars[this.change_a[i][0]]);
                    //move car to lane 
                    this.intersections[this.change_a[i][1]].switch_car_lane(this.cars[this.change_a[i][0]], 
                        this.change_a[i][2]);

                    car_r.push(this.cars[this.change_a[i][0]]);
                }

                this.change_a.length = 0;
            }

            if(this.reset_a.length > 0){
                
                for (let i = 0; i < this.reset_a.length; i++) {
                    //console.log(this.reset_a[i]);
                    if( this.cars[this.reset_a[i][0]].present_lane != this.cars[this.reset_a[i][0]].startLane){
                        //remove and put car back in starting lane
                        this.cars[this.reset_a[i][0]].present_lane.remove_car(this.cars[this.reset_a[i][0]]);

                        this.cars[this.reset_a[i][0]].startLane.add_car( this.cars[this.reset_a[i][0]] );
                        this.cars[this.reset_a[i][0]].startLane.update_car_pos( this.cars[this.reset_a[i][0]] );
                        this.cars[this.reset_a[i][0]].get_lane( this.cars[this.reset_a[i][0]].startLane );

                        this.cars[this.reset_a[i][0]].startRoad.accept_car( this.cars[this.reset_a[i][0]], true );
                        this.cars[this.reset_a[i][0]].at_end();

                        car_r.push(this.cars[this.reset_a[i][0]]);
                    } else {
                        this.set_pos(this.cars[this.reset_a[i][0]]);
                    }
                }
                this.reset_a.length = 0;
            }

            if(car_r.length){
                car_r.forEach(car => {
                    this.remove_car( car );
                });
                car_r.length = 0;
            }

        }
    }

    status(){
        console.log( " road ");
        console.log( " startx " + this.start_x + " start y " + this.start_y);
        this.intersections.forEach(inter => {
            inter.status();
        });
        this.lanes.forEach( lane => {
            lane.status();
        });
    }
}

function reduce(numerator,denominator){
    var gcd = function gcd(a,b){
      return b ? gcd(b, a%b) : a;
    };
    gcd = gcd(numerator,denominator);
    return [numerator/gcd, denominator/gcd];
  }

class lane{
    startP; 
    endP;
    lane_points = [];
    cars = [];
    x = 0; 
    y = 0; 
    dir1 = 0;
    dir2 = 0;
    hor = false;
    adjust_d = [];
    color;
 
    constructor( points, hor, color){

        this.startP = points[0];
        this.endP = points[points.length - 1]; 
        this.lane_points = points;
        this.hor = hor; 
        this.color = color;
        //allow for both checks to get diagonal slopes

        for (let i = 0; i < points.length - 1; i++) {
            this.x = points[i + 1].x - points[i].x;
            this.y = points[i + 1].y - points[i].y;
            // console.log(" slope " + this.x + " y " + this.y);
            let m = ( this.y / this.x);
            // console.log(" slope is " + ( this.y / this.x));
            this.x = this.x < 0 ? -1 : 1; 
            this.y = this.y < 0 ? -1 : 1; 
            // console.log(" pow " + this.x + " y " + this.y);
    
            if( m < 1){
                this.x = this.x / Math.abs(m);
                this.y = this.y;
            } else {
                this.x = this.x;
                this.y = this.y * Math.abs(m);
            }
    
            // console.log(" final slope " + this.x + " y " + this.y);
            this.adjust_d.push([this.x, this.y]);
            
        }

        // console.log(this.adjust_d);


        if(this.startP.x < this.endP.x){
            // this.x = 1;
            this.dir1 = 0;
            this.dir2 = 1;
        } else {
            // this.x = -1;
            this.dir1 = 0;
            this.dir2 = 1;
        }
        if( this.startP.y < this.endP.y){
            // this.y = 1;
            this.dir1 = 2; 
            this.dir2 = 3;
        } else {
            // this.y = -1;
            this.dir1 = 2;
            this.dir2 = 3;  
        }
    }

    find_slope(start, end, step){
        let m = (end.y - start.y) / ( end.x - start.x);

    }

    add_car( car ){
        this.startP.cars.push(car);
    }

    release(){
        let car = this.startP.cars.shift();
        this.cars.push(car);
        let last = this.cars.length - 1;
        if(this.endP.x != this.cars[last].endP.x || this.endP.y != this.cars[last].endP.y ){
            this.cars[last].need_change = true; 
        }
    }

    reset(car){
        let i = this.cars.indexOf(car);
        if( i > -1){
            this.cars.splice(i, 1);
        }
        if(this.startP.cars.indexOf(car) == -1){
            this.startP.cars.push(car);
        }
    }

    update_car_pos( car ){
        if( this.hor){
            car.y = this.startP.y;
        } else {
            car.x = this.startP.x;
        }
    }

    remove_car(car){
        let i = this.cars.indexOf(car);
        if( i > -1){
            this.cars.splice(i, 1);
        }
    }

    car_in_start(){
        let cars_present = false; 
        this.cars.forEach(lane_car => {
            let offset = lane_car.radius + 5;
            if( this.startP.x == lane_car.x ){
                if( (this.startP.y - offset) <= lane_car.y && lane_car.y <= (this.startP.y + offset) ) {
                    cars_present = true; 
                }
            } else if( this.startP.y == lane_car.y ){
                if( (this.startP.x - offset) <= lane_car.x && lane_car.x <= (this.startP.x + offset) ) {
                    cars_present = true; 
                }
            }
        });
        return cars_present;
    }

    car_in_lane( carP, x, y ){
        let inX = false; 
        let inY = false; 
        
        if(this.hor){
            if(this.startP.x < this.endP.x){
                if((this.startP.x <= x && x <= this.endP.x)){
                    inX = true;
                }
            } else {
                if((this.endP.x <= x && x <= this.startP.x)){
                    inX = true;
                }
            }

            if(((this.startP.y - 10) <= y && y <= (this.endP.y + 10))){
                inY = true;
            }
        } else {
            if( this.startP.y < this.endP.y){
                if((this.startP.y <= y && y <= this.endP.y)){
                    inY = true;
                }
            } else {
                if((this.endP.y <= y && y <= this.startP.y)){
                    inY = true;
                }
            }

            if(((this.startP.x - 10) <= x && x <= (this.endP.x + 10))){
                inX = true;
            }
        }

        return inX && inY;
    }

    get_dir( car){
        //this.adjust_d
        //[this.x, this.y, this.dir1, this.dir2]
        // console.log(" direction ");
        // console.log(this.adjust_d[car_p]);
        if(this.lane_points[car.lane_p+1].x - 5 <= car.x && car.x <= this.lane_points[car.lane_p+1].x + 5 
            && this.lane_points[car.lane_p+1].y - 5 <= car.y && car.y <= this.lane_points[car.lane_p+1].y + 5 ){
            // console.log("chaning lane point");
            car.lane_p = car.lane_p + 1;
            // console.log(" this.lane_points.length " + this.lane_points.length);
            if( this.lane_points.length - 1 == car.lane_p){
                car.lane_p = car.lane_p - 1;
            }
            // console.log("       NOWow " + car.lane_p);

        }
        // console.log(" adjust array ");
        // console.log(this.adjust_d);
        // console.log(this.adjust_d[car.lane_p]);
        // console.log(" adjust array close ");
        return [this.adjust_d[car.lane_p][0], this.adjust_d[car.lane_p][1], this.dir1, this.dir2];
    }

    status(){
        console.log("   lane ");
        console.log("   dirx " + this.x + " diry " + this.y);
        this.cars.forEach(car => {
            car.status();
        });
    }
}

class road_point{
    x = 0; 
    y = 0;
    cars = [];

    constructor(given_x, given_y){
        this.x = given_x; 
        this.y = given_y; 
    }
}