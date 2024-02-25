class Intersection{
    name = "inter " + Math.floor(Math.random() * (200 - 2)) + (2);
    x = 0;
    y = 0;
    roads = [];
    stop = '#DE3249';
    green = '#32DE49';
    lanes = [false, false, true, true];
    bounds = [];
    roads = [];
    time = 0;
    switchT = Math.floor(Math.random() * (200 - 180)) + (180); 
    need_draw = false;

    constructor(given_x, given_y){
        this.x = given_x - 4; 
        this.y = given_y - 4;
        this.bounds[0] = given_x - 10;
        this.bounds[1] = given_x + 10;
        this.bounds[2] = given_y - 10;
        this.bounds[3] = given_y + 10;
    }

    accept_road( road){
        this.roads.push(road);
    }

    road_go(i){
        return false;
    }

    check_bounds(i){
        return this.bounds[i];
    }

    check_in_bounds(x, y){
        let val = false;
        // console.log(" x " + x +" y " + y);
        // console.log(this.bounds);
        if( this.bounds[0] <= x && x <= this.bounds[1]
             && this.bounds[2] <= y && y <= this.bounds[3] ) {
            val = true;
        }
        return val; 
    }

    check_lanes(i){
        return this.lanes[i];
    }

    check_ends(end_point, car, x, y){
        let temp = false;
        this.roads.forEach(road => {
            road.lanes.forEach(lane => {
                if(lane.endP == end_point ){
                    if(lane.car_in_lane( car, x, y ) ){
                        temp = true;
                    }
                }
            });
        });
        return temp;
    }

    check_car_lane( car, x, y){
        let optVal = [];
        let secondOptVal = [];
        let devalueLane = [];
        this.roads.forEach(road => {
            road.lanes.forEach(lane => {
                let val = lane.get_dir();
                optVal.push( new road_point(x+val[0], y+val[1]));
                secondOptVal.push( new road_point(x+(val[0]*10), y+(val[1]*10)));
                if(car.present_road == road){
                    if( car.present_lane == lane ){
                        devalueLane.push([optVal.length-1, 2]);
                    } else {
                        devalueLane.push([optVal.length-1, 20]);
                    }
                }
            });
        });

        let best_opt = car.check_dir( optVal );
        let second = car.check_dir_deval( secondOptVal, devalueLane);

        return second;
    }

    switch_car_lane_goal(car){
        this.roads.forEach(road => {
            road.lanes.forEach(lane => {
                if(lane.endP == car.endP){
                    lane.add_car( car );
                    lane.update_car_pos( car );
                    car.get_lane( lane );
                    car.get_road( road );
                    road.accept_car( car, false );
                }
            });
        });
    }

    switch_car_lane(car, lane_v){
        let cur_lane = 0; 
        this.roads.forEach(road => {
            road.lanes.forEach(lane => {
                if( cur_lane == lane_v){
                    lane.add_car( car );
                    lane.update_car_pos( car );
                    car.get_lane( lane );
                    car.get_road( road );
                    road.accept_car( car, false );
                }
                cur_lane++;
            })
        });
    }

    switch(){
        for (let i = 0; i < this.lanes.length; i++) {
            this.lanes[i] = !this.lanes[i];
        }
        this.time = 0; 
        this.need_draw = true; 
    }

    update_time(delta){
        this.time = this.time + delta; 
        if( this.time > this.switchT){
            this.switch();
        }
    }

    draw( graphics ){
        if(this.lanes[0]){
            graphics.beginFill(this.green);
        } else {
            graphics.beginFill(this.stop);
        }
        graphics.drawRect(this.x-10, this.y, 6, 6);
        if(this.lanes[1]){
            graphics.beginFill(this.green);
        } else {
            graphics.beginFill(this.stop);
        }
        graphics.drawRect(this.x+10, this.y, 6, 6);
        if(this.lanes[2]){
            graphics.beginFill(this.green);
        } else {
            graphics.beginFill(this.stop);
        }
        graphics.drawRect(this.x, this.y-10, 6, 6);
        if(this.lanes[3]){
            graphics.beginFill(this.green);
        } else {
            graphics.beginFill(this.stop);
        }
        graphics.drawRect(this.x, this.y+10, 6, 6);
        graphics.endFill();
        this.need_draw = false; 
    }

    draw_background(graphics){
        graphics.beginFill('#87CEFA');
        graphics.drawRect(this.x-17, this.y-17, 42, 42);
    }

    status(){
        console.log("   inter: " + this.name);
        console.log("   x " + this.x + " y " + this.y);

    }
}

function FindIntersection( line1, line2){
    l1x1 = line1.start_x;
    l1y1 = line1.start_y; 
    line1Hor = false; 
    line1Ver = false; 

    if( line1.start_x == line1.end_x ) {
        line1Hor = true;
    } else if( line1.start_y == line1.start_y){
        line1Ver = true; 
    }

    line2Hor = false; 
    line2Ver = false; 

    if( line2.start_x == line2.end_x ) {
        line2Hor = true;
    } else if( line2.start_y == line2.start_y){
        line2Ver = true; 
    }

    if( (line1Hor && line2Ver) || (line1Ver && line2Hor) ){
        //some lines are vertical 
        if( line1Hor && line2Ver ){
            return [line2.start_x, line1.start_y];
        } else {
            return [line2.start_x, line1.start_y];
        }
 
    } else {
        //lines with slope 
        return [10,10];

    }

}
