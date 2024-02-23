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
    update_a = [];
    reset_a = [];
    change_a = [];

    constructor( start_point, end_point, hor, num_lanes){
        this.start_x = start_point.x; 
        this.start_y = start_point.y; 
        this.end_x = end_point.x; 
        this.end_y = end_point.y; 
        this.horizontal = hor;
        let lane_off_x = 0; 
        let lane_off_y = 0;
        if(hor){
            this.y_offset = 20; 
            lane_off_y = 10; 
        } else {
            this.x_offset = 20;
            lane_off_x = 10; 
        } 
        for (let i = 0; i < num_lanes; i++) {
            let laneOffXA = lane_off_x + (i * this.x_offset);
            let laneOffYA = lane_off_y + (i * this.y_offset);
            let s1 = new road_point(start_point.x - laneOffXA, start_point.y + laneOffYA);
            let s2 = new road_point(end_point.x + laneOffXA, end_point.y - laneOffYA);
            let e1 = new road_point(end_point.x - laneOffXA, end_point.y + laneOffYA);
            let e2 = new road_point(start_point.x + laneOffXA, start_point.y - laneOffYA);
            let lane1 = new lane(s1, e1, this.horizontal);
            let lane2 = new lane(s2, e2, this.horizontal);
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
        // if( i > -1){
        //     console.log(" CHECK in road remove car " + this.cars[i].name);;
        // }
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

    set_pos(car){
        car.reset()
    }

    get_distance(x1, y1, x2, y2){
        let a = x1 - x2; 
        let b = y1 - y2;

        return Math.abs(Math.sqrt( a*a + b*b));
    }
    
    check_car(i, val, car){


        let move = true; 
        let checkInter = false;

        let x = car.x + val[0]; 
        let y = car.y + val[1];

        if(car.in_end()){
            this.reset_a.push([this.print_car_array(car),0]);
            move = false;
        } else if( x > 640 || y > 360 || x < 0 || y < 0   ){
            if(this.get_distance(x, y, car.startP.x, car.startP.y) > 25){
                this.reset_a.push([this.print_car_array(car),0]);
                move = false;   
            }
        } 

        if(move){
            //check lane size
            x = x + (val[0] * 25)
            y = y + (val[1] * 25)

            for (let l = 0; l < this.intersections.length; l++) {
                //update to match boths as it being true twice 
                if(this.intersections[l].check_in_bounds(x, y)){
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
                        console.log(" in move and need change ");
                        console.log(" at intersection " + l );

                        if( this.intersections[l].check_ends(car.endP, car, x, y) ){
                            this.update_a.push([i,l]);
                        } else {
                            console.log(" doing best change");
                            let best_c = this.intersections[l].check_car_lane( car, x, y);
                            this.change_a.push([i, l, best_c]);
                        }
                    }
                }
                checkInter = false;
            }

            car.present_lane.cars.forEach(lane_car => {
                let offset = lane_car.radius/2;
                if( car.name != lane_car.name ){
                    if( car.x == lane_car.x ){
                        if( (lane_car.y - offset) <= y && y <= (lane_car.y + offset) ) {
                            //console.log(" stoping due to car ");
                            move = false; 
                            car.update_blocked(true);
                        }
                    } else if( car.y == lane_car.y ){
                        if( (lane_car.x - offset) <= x && x <= (lane_car.x + offset) ) {
                            //console.log(" stoping due to car ");
                            move = false; 
                            car.update_blocked(true);
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
        //console.log(this.lanes.length + " lanes");
        graphics.lineStyle(1, '#000000');

        let startOffX = this.start_x - (this.x_offset  * (this.lanes.length/2));
        let startOffY = this.start_y - (this.y_offset  * (this.lanes.length/2));
        let endOffX = this.end_x - (this.x_offset  * (this.lanes.length/2));
        let endOffY = this.end_y - (this.y_offset  * (this.lanes.length/2));
        for (let i = 0; i <= this.lanes.length; i++) {
            
            graphics.moveTo(startOffX, startOffY);
            graphics.lineTo(endOffX, endOffY);
            
            startOffX = startOffX + this.x_offset; 
            startOffY = startOffY + this.y_offset;
            endOffX = endOffX + this.x_offset; 
            endOffY = endOffY + this.y_offset;
        }
    }

    draw_cars( graphics, running ){
        if( running ){
            let i = 0;
            this.lanes.forEach(lane => {
                lane.cars.forEach(car =>{
                    car.draw(graphics);
                    car.draw_end(graphics);
                    let val = lane.get_dir();
                    this.check_car(i, val, car);
                    i++;
                });
            });
            let car_r = [];
            if(this.update_a.length > 0){
                // console.log("       leng update_a " + this.update_a.length);
                for (let i = 0; i < this.update_a.length; i++) {
                    //remove car from lane
                    // console.log(" doing update with array ");
                    console.log(this.update_a[i]);
                    this.cars[this.update_a[i][0]].present_lane.remove_car(this.cars[this.update_a[i][0]]);
                    // console.log(" done removing car from lane ");
                    //move car to lane 
                    // console.log(" intersection array ");
                    console.log(this.intersections);
                    this.intersections[this.update_a[i][1]].switch_car_lane_goal(this.cars[this.update_a[i][0]]);
                    // console.log(" done changin car in lane ");
                    car_r.push(this.cars[this.update_a[i][0]]);
                }

                // for (let i = 0; i < this.update_a.length; i++) {
                //     this.remove_car( this.cars[this.update_a[i][0]] );
                // }

                this.update_a.length = 0;
            }

            if(this.change_a.length > 0){
                 console.log("       leng change_a " + this.change_a.length);
                //console.log(" roads car bleow ");
                //console.log(this.cars)
                for (let i = 0; i < this.change_a.length; i++) {
                    // console.log(this.change_a[i]);
                    // //remove car from lane
                    // console.log(" car id " + this.change_a[i][0]);
                    // console.log(" car " + this.cars[this.change_a[i][0]]);
                    // console.log(" lane " + this.cars[this.change_a[i][0]].present_lane);
                    this.cars[this.change_a[i][0]].present_lane.remove_car(this.cars[this.change_a[i][0]]);
                    //move car to lane 
                    this.intersections[this.change_a[i][1]].switch_car_lane(this.cars[this.change_a[i][0]], 
                        this.change_a[i][2]);

                    //this.remove_car( this.cars[this.change_a[i][0]] );
                    car_r.push(this.cars[this.change_a[i][0]]);
                }

                this.change_a.length = 0;
            }

            if(this.reset_a.length > 0){
                
                for (let i = 0; i < this.reset_a.length; i++) {
                    console.log(this.reset_a[i]);
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

class lane{
    startP; 
    endP;
    cars = [];
    x = 0; 
    y = 0; 
    dir1 = 0;
    dir2 = 0;
    hor = false;

    
    constructor( start, end, hor){
        this.startP = start;
        this.endP = end; 
        this.hor = hor; 
        //allow for both checks to get diagonal slopes
        if(hor){
            if(this.startP.x < this.endP.x){
                this.x = 1;
                this.dir1 = 0;
                this.dir2 = 1;
            } else {
                this.x = -1;
                this.dir1 = 0;
                this.dir2 = 1;
            }
        } else {
            if( this.startP.y < this.endP.y){
                this.y = 1;
                this.dir1 = 2; 
                this.dir2 = 3;
            } else {
                this.y = -1;
                this.dir1 = 2;
                this.dir2 = 3;  
            }
        }
    }

    add_car( car ){
        this.cars.push(car);
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

    car_in_lane( carP, x, y ){
        let inX = false; 
        let inY = false; 

        // console.log(" hor line " + this.hor);
        // console.log(" car " + carP.x + " y " + carP.y);
        // console.log(" adjusted " + x + " y " + y);
        // console.log(" lane start " + this.startP.x + " " + this.startP.y);
        // console.log(" lane end " + this.endP.x + " " + this.endP.y);
        
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
        // console.log(" find if in lane " + inX + " " + inY);

        return inX && inY;
    }

    get_dir(){
        return [this.x, this.y, this.dir1, this.dir2];
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
    constructor(given_x, given_y){
        this.x = given_x; 
        this.y = given_y; 
    }
}