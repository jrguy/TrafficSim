class Car{
    name = 'car ' + Math.floor(Math.random() * 100) + 1;
    x = 0;
    y = 0;
    radius = 0; 
    color = "0xDE3249";
    startP; 
    endP; 
    startLane; 
    gotFLane = false; 
    startRoad; 
    gotFRoad = false;
    trips_fin = 0; 
    time = 0; 
    trip_time = [];
    speed = 1;
    present_lane;
    present_road;
    blocked = false;
    need_change = false;
    at_stop = false; 
    stopped = false;
    wait = 0;
    lane_p = 0; 

    constructor( given_x, given_y, r){
        this.x = given_x;
        this.y = given_y; 
        this.radius = r;
        this.speed = Math.floor(Math.random() * 3) + 1;
        this.speed = 1;
    }

    set_points(s1x, s1y, e1x, e1y ){
        this.startP = new road_point(s1x, s1y); 
        this.endP = new road_point(e1x, e1y);  
        this.x = s1x; 
        this.y = s1y; 
    }

    set_end(endx, endy){
        this.endP = new road_point(endx, endy); 
    }

    at_end(){
        this.trips_fin = this.trips_fin + 1;
        this.trip_time.push(this.time);
        this.time = 0; 
    }

    reset(){
        this.present_lane.reset(this);
        this.x = this.startP.x; 
        this.y = this.startP.y;
        this.lane_p = 0;
        this.at_end();
    }

    in_end(){
        let val = false; 
        //console.log(" checking end " + this.endP.x + " end " + this.endP.y + " car " + this.x + " y " + this.y);
        if( this.endP.x - 5 <= this.x && this.x <= this.endP.x + 5 
            && this.endP.y - 5  <= this.y && this.y <= this.endP.y + 5  ) {
           val = true;
       }
       return val; 
    }

    set_stop(val){
        this.at_stop = val;
    }

    set_stopped(val){
        this.stopped = val;
    }

    check_end(x, y ){
        let val = false; 
        //console.log(" checking end " + x+ " end " + y + " car " + this.x + " y " + this.y);
        if( x - 5 <= this.x && this.x <= x + 5  && y - 5  <= this.y && this.y <= y + 5  ) {
           val = true;
       }
       return val; 
    }

    report(){
        console.log("trips finished  " + this.trips_fin);
        var total = 0; 
        let high = 0; 
        let low = 10000000;
        this.trip_time.forEach(time => {
            total = total + time;
            if(time > high){
                high = time;
            }
            if( time < low){
                low = time;
            }
        });
        console.log("average time " + (total/this.trips_fin));
        console.log("variace h " + high + " l " + low);
    }

    color( given_color){
        this.color = given_color;
    }

    set_pos(given_x, given_y){
        this.x = given_x; 
        this.y = given_y; 
    }

    set_x(given_x){
        this.x = given_x;
    }

    update_x(given_x){
        this.x = this.x + given_x;
    }

    update_blocked(bool){
        this.blocked = bool;
    }

    add_delay(){
        this.wait = this.wait + Math.floor(Math.random() * 16) + 1;
    }

    check_dir( pointList ){
        let max_dist = Math.pow(10, 1000);
        let choseI = -1;
        let i = 0;  
        pointList.forEach(rPoint => {
            let found_dist = this.find_dis(this.endP, rPoint);
            if(found_dist < max_dist){
                max_dist = found_dist;
                choseI = i;
            }
            i++;
        });
        return choseI;
    }

    check_dir_deval(pointList, alter){
        let max_dist = Math.pow(10, 1000);
        let choseI = -1;
        let i = 0;  
        pointList.forEach(rPoint => {
            let found_dist = this.find_dis(this.endP, rPoint);
            alter.forEach(vals => {
                if(vals[0] == i){
                    found_dist = found_dist + vals[1];
                }
            });
            if(found_dist < max_dist){
                max_dist = found_dist;
                choseI = i;
            }
            i++;
        });
        return choseI;
    }

    find_dis(p1, p2){
        let a = p1.x - p2.x; 
        let b = p1.y - p2.y;

        return Math.sqrt( a*a + b*b);
    }

    update_dir(given_x, given_y, top_speed){
        if(this.wait == 0) {
            // console.log(" top " + top_speed);
            // console.log( " full seped ");
            // console.log( (given_x * this.speed ) );
            // console.log(" limited ");
            // console.log((given_y * top_speed ));
            if( (given_x * this.speed ) <= top_speed && (given_y * this.speed ) <= top_speed  ) {
                this.x = this.x + (given_x * this.speed ); 
                this.y = this.y + (given_y * this.speed ); 
            } else {
                this.x = this.x + (given_x * top_speed ); 
                this.y = this.y + (given_y * top_speed ); 
            }
        } else {
            this.wait--; 
        }
    }

    get_speed(given_x, given_y, top_speed){
        let sX = 0;
        let sY = 0;
        if( (given_x * this.speed ) <= top_speed && (given_y * this.speed ) <= top_speed  ) {
            sX = this.x  + (given_x * this.speed ); 
            sY = this.y + (given_y * this.speed ); 
        } else {
            sX = this.x + (given_x * top_speed ); 
            sY = this.y + (given_y * top_speed ); 
        }
        return [sX, sY];
    }

    get_lane( lane ){
        if( !this.gotFLane){
            this.startLane = lane; 
            this.gotFLane = true; 
        } 
        this.present_lane = lane;

        let low_dis = 100;
        let index = -1;
        for (let i = 0; i < lane.lane_points.length - 1; i++) {
            let p1 = lane.lane_points[i];
            let p2 = lane.lane_points[i + 1];

            let product = (this.get_dist(p1, this) + this.get_dist(p2, this)) - this.get_dist(p1, p2);
            product = Math.abs(product);
            if(product < low_dis){
                index = i; 
                low_dis = product; 
                // console.log(" new ");
                // console.log(product);
            }
        }
        if( index > -1){
            // console.log(" final dis ");
            // console.log(low_dis);
            // console.log(" index is " + index);
            this.lane_p = index;
        }

        this.find_change(lane);
    }

    get_road( road ){
        if( !this.gotFRoad){
            this.startRoad = road;
            this.gotFRoad = true; 
        }
        this.present_road = road;
    }

    get_dist(p1, p2){
        return Math.abs( Math.sqrt(Math.pow( (p1.x - p2.x) , 2) + Math.pow( (p1.y - p2.y) , 2) ));
    }

    find_change(lane){
        if(this.endP != null){
            // console.log(" this end " + this.endP);
            // console.log(" lane end " + lane.endP);
            if(lane.endP.x != this.endP.x || lane.endP.y != this.endP.y ){
                this.need_change = true; 
            } else {
                this.need_change = false; 
            }
        }
    }

    draw( graphics){
        graphics.beginFill(0xDE3249, 1);
        graphics.drawCircle(this.x, this.y, this.radius);
        graphics.endFill();
        this.time++; 
    }

    draw_end(graphics){
        graphics.beginFill('#00FF00', 1);
        graphics.drawCircle(this.endP.x, this.endP.y, this.radius);
        graphics.endFill();
    }

    status(){
        console.log("       car: " + this.name);
        console.log("       x " + this.x + " y " + this.y);
        //console.log("       start " + this.startP.x + " " + this.startP.y);
        //console.log("       end " + this.endP.x + "  " + this.endP.y);
        //console.log("       car need lane change: " + this.need_change);
    }
} 

class CarManager{
    carCompleted = 0; 
    conncurrent_cars = 0;
    carGoal = 10; 
    on_screen_cars = 1;
    make_pause = 40;
    wait = 0;


    constructor( given_Goal, con_cars){
        this.carGoal = given_Goal;
        this.conncurrent_cars = con_cars;
    } 

    update_completed(x){

        this.carCompleted = this.carCompleted + x;
        console.log( "cars comp " + this.carCompleted );
    }

    make_more(){
        if( this.on_screen_cars < this.conncurrent_cars && this.wait > this.make_pause && current_car < this.carGoal){
            console.log(this.on_screen_cars );
            this.on_screen_cars++;
            this.wait = 0;
            return true; 
        } else {
            this.wait++;
            return false; 
        }
    }

    should_reset(){
        if(this.carCompleted < this.carGoal){
            return true;
        } else {
            return false;
        }
    }


    
}