class Intersection{
    name = "inter " + Math.floor(Math.random() * (200 - 2)) + (2);
    x = 0;
    y = 0;
    roads = [];
    stop = '#DE3249';
    green = '#32DE49';
    yellow = '#F7B500 ';
    lanes = [false, false, true, true];
    bounds = [];
    roads = [];
    time = 0;
    switchT = Math.floor(Math.random() * (200 - 180)) + (180); 
    need_draw = false;
    offest = 0;
    road_lanes_x = 2; 
    road_lanes_y = 2; 
    has_lights = true;

    constructor(given_x, given_y, offset){
        this.x = given_x - 4; 
        this.y = given_y - 4;
        this.bounds[0] = given_x - offset;
        this.bounds[1] = given_x + offset;
        this.bounds[2] = given_y - offset;
        this.bounds[3] = given_y + offset;
        this.offest = offset;
    }

    set_lights( lights){
        this.has_lights = lights; 
    }

    accept_road( road){
        this.roads.push(road);
        if( road.horizontal){
            this.road_lanes_x = (road.num_lanes * 2);
        } else {
            this.road_lanes_y = (road.num_lanes * 2);
        }
    }

    road_go(i){
        return false;
    }

    check_bounds(i){
        return this.bounds[i];
    }

    check_in_bounds(x, y){
        let val = false;
        //console.log(this.bounds);
        if( this.bounds[0] <= x && x <= this.bounds[1]
             && this.bounds[2] <= y && y <= this.bounds[3] ) {
            val = true;
        }
        return val; 
    }

    car_check_in_bounds(){
        let inInter = false; 
        this.roads.forEach(road => {
            road.lanes.forEach(lane => {
                lane.cars.forEach(lane_car => {
                    if( this.bounds[0] <= lane_car.x && lane_car.x <= this.bounds[1]
                        && this.bounds[2] <= lane_car.y && lane_car.y <= this.bounds[3] ) {
                        inInter = true;
                   }
                   if(inInter){
                    return;
                   }
                });
                if(inInter){
                    return;
                }
            });
            if(inInter){
                return;
            }
        });

        return inInter;
    }

    check_lanes(i){
        return this.lanes[i];
    }

    check_ends(end_point, car, x, y){
        let temp = false;
        // console.log(" end point " + end_point);
        this.roads.forEach(road => {
            road.lanes.forEach(lane => {
                if(lane.endP == end_point ){
                    // console.log(" found end point");
                    if(lane.car_in_lane( car, x, y ) ){
                        // console.log(" car in lane and found end point");
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
                //need the direction of the lane that is within the intersection 
                //let val = lane.get_dir(car);
                let val = this.get_car_lane_dir(lane, car);
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
                    let foundP = this.get_point_in_inter(lane, car);
                    // console.log(" foundP found ");
                    // console.log(foundP);
                    lane.update_car_pos_inter( car, foundP );

                    car.get_lane( lane );
                    car.get_road( road );
                    road.accept_car( car, false );
                }
                cur_lane++;
            })
        });
    }

    get_point_in_inter(lane, car ){
        for (let i = 0; i < lane.lane_points.length; i++) {
            if(this.check_in_bounds(lane.lane_points[i].x, lane.lane_points[i].y)){
                //lane point in inter 
                return lane.lane_points[i];
            }  
        }

        let e_x = car.present_lane.endP.x;
        let e_y = car.present_lane.endP.y;
        if(this.check_in_bounds(e_x , e_y)){
            return car.present_lane.endP;
        }

        //look at point on line
        let car_x = car.x; 
        let car_y = car.y;
        let val = lane.get_dir( car);
        // console.log("val " + val);
        for (let i = 0; i < 10; i++) {
            if(this.check_in_bounds(car_x, car_y)){
                return new road_point(car_x, car_y);
            }
            car_x = car_x + val[0];
            car_y = car_y + val[1];
        }

        return new road_point(this.x, this.y);
    }


    get_section_in_inter(lane){
        for (let i = 0; i < lane.lane_points.length - 1; i++) {
            let p1 = lane.lane_points[i];
            let p2 = lane.lane_points[i + 1];

        }
    }

    get_car_lane_dir(lane, car ){

        let low_dis = 100;
        let index = -1;
        for (let i = 0; i < lane.lane_points.length - 1; i++) {
            let p1 = lane.lane_points[i];
            let p2 = lane.lane_points[i + 1];

            let product = (this.get_dist(p1, car) + this.get_dist(p2, car)) - this.get_dist(p1, p2);
            product = Math.abs(product);
            if(product < low_dis){
                index = i; 
                low_dis = product; 
                // console.log(" new lowest ");
                // console.log(product)
            }
        }
        if( index > -1){
            // console.log(" final dis ");
            // console.log(low_dis);
            // console.log(" index is " + index);
            return lane.get_dir_segment( index );
        }
        return [0, 0];
    }

    get_dist(p1, p2){
        return Math.abs( Math.sqrt(Math.pow( (p1.x - p2.x) , 2) + Math.pow( (p1.y - p2.y) , 2) ));
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
        this.draw_color(this.lanes[0], graphics);
        graphics.drawRect(this.x-(this.offest*(this.road_lanes_y-1)) , this.y, 
                    (Math.floor(this.offest)), (Math.floor(this.offest)));

        this.draw_color(this.lanes[1], graphics);
        graphics.drawRect(this.x+(this.offest*(this.road_lanes_y-1)), this.y, 
                    (Math.floor(this.offest)), (Math.floor(this.offest)));

        this.draw_color(this.lanes[2], graphics);
        graphics.drawRect(this.x, this.y-(this.offest*(this.road_lanes_x-1)), 
                    (Math.floor(this.offest)), (Math.floor(this.offest)));

        this.draw_color(this.lanes[3], graphics);
        graphics.drawRect(this.x, this.y+(this.offest*(this.road_lanes_x-1)),
                     (Math.floor(this.offest)), (Math.floor(this.offest)));
        graphics.endFill();
        this.need_draw = false; 
    }

    draw_color(light, graphics){
        if( light){
            if(this.time + 40 > this.switchT) {
                graphics.beginFill(this.yellow);
            } else {
                graphics.beginFill(this.green);
            }
        } else {
            graphics.beginFill(this.stop);
        }
    }

    draw_background(graphics){
        graphics.lineStyle(2, "#FFED0B");
        // graphics.beginFill('#87CEFA');
        graphics.drawRect(this.x-(this.offest*this.road_lanes_y), this.y-(this.offest*this.road_lanes_x), 
                (this.offest*(this.road_lanes_y*2)) + (this.offest/2), (this.offest*(this.road_lanes_x*2)) + (this.offest/2));
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

    if( line1.start_x == line1.end_x ) {0
        line1Hor = true;
    } else if( line1.start_y == line1.end_y){
        line1Ver = true; 
    }

    line2Hor = false; 
    line2Ver = false; 

    if( line2.start_x == line2.end_x ) {
        line2Hor = true;
    } else if( line2.start_y == line2.end_y){
        line2Ver = true; 
    }
    // console.log( "line1Hor " + line1Hor + "  line2Ver " + line2Ver);
    if( (line1Hor && line2Ver) || (line1Ver && line2Hor) ){
        //some lines are vertical 
        if( line1Hor && line2Ver ){
            return [line2.start_x, line1.start_y];
        } else {
            return [line2.start_x, line1.start_y];
        }
 
    } else {
        //road_points
        let inters = [];
        
        let p1 = line1.road_points[0];
        for (let i = 1; i < line1.road_points.length; i++) {
            let p2 = line1.road_points[i];
            let lineStand1 = FindStandardForm(p1, p2);
            // console.log("   NEW LINE");
            // console.log(" line stand form " + lineStand1);
            for (let l = 0; l < line2.road_points.length - 1; l++) {
                // console.log("   COMPARE seconday line point " + l);
                let p3 = line2.road_points[l];
                let p4 = line2.road_points[l + 1];
                let lineStand2 = FindStandardForm(p3, p4);
                // console.log(" lineStand2 stand form " + lineStand2);
                let inter = FindIntersectionForm(lineStand1, lineStand2);
                // console.log(" inter section find results " + inter);
                // inters.push(inter);
                if( CheckIfWithin(p3.x, p4.x, inter[0]) && CheckIfWithin(p3.y, p4.y, inter[1])
                    && CheckIfWithin(p1.x, p2.x, inter[0]) && CheckIfWithin(p1.y, p2.y, inter[1]) ){
                    // console.log("inter cound at ");
                    // console.log(inter);
                    inters.push(inter);
                }
            }
        }
        if( inters.length > 0){
            return inters;
        } else {
            return [10,10];
        }

    }
}

function FindSlope( p1, p2){
    let m = 0;
    let cy = (p2.y - p1.y);
    let cx = (p2.x - p1.x);
    m = cy / cx;
    return m;
}

function FindIntercept(p1, m){
    let b = p1.y - (m * p1.x);
    return b; 
}

function FindStandardForm(p1, p2){
    let a = (p2.y - p1.y);
    let b = (p1.x - p2.x);
    let c = (p1.y * (p2.x - p1.x)) - (p1.x * (p2.y - p1.y));
    return [a, b, c];
}

function FindIntersectionForm(e1, e2){
    let a1 = e1[0];
    let b1 = e1[1];
    let c1 = e1[2];
    let a2 = e2[0];
    let b2 = e2[1];
    let c2 = e2[2];

    let x = ((b1*c2)-(b2*c1))/((a1*b2)-(a2*b1));
    let y = ((a2*c1)-(a1*c2))/((a1*b2)-(a2*b1));
    return [x, y];
}

function CheckIfWithin(v1, v2, c){
    // console.log(" v1 " + v1 + " v2 " + v2 + " and c " + c);
    if( v1 < v2){
        return v1 <= c && c <= v2;
    } else {
        return v2 <= c && c <= v1;
    }
}

