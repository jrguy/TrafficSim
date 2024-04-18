class IterationManager{
    running = true; 
    iteration_counter = 0;
    max_cars = [10, 15, 20, 25];
    intersection_types = ["basic", "greedy", "rate"];

    cars_i = 0;
    inter_i = 1;

    cycle_counter = [0, 0];
    cycle_max = [this.max_cars.length - 1, this.intersection_types.length - 1];


    constructor(){
    } 

    move_iter(){
        for (let i = this.cycle_counter.length - 1; i >= 0; i--) {
            if(this.cycle_counter[i] < this.cycle_max[i]){
                this.cycle_counter[i]++;
                break;
            }  else {
                this.cycle_counter[i] = 0;
            }
        }
        if(this.cycle_counter[0] >= this.cycle_max[0]){
            running = false;
        }
        console.log(this.cycle_counter);
        this.iteration_counter++;
    }

    get_cars(){
        return this.max_cars[this.cycle_counter[this.cars_i]];
    }

    get_intersection(){
        console.log(" interse type " + this.intersection_types[this.cycle_counter[this.inter_i]]);
        return this.intersection_types[this.cycle_counter[this.inter_i]];
    }

    get_mode_val(){
        return " max cars " + this.max_cars[this.cycle_counter[this.cars_i]] + 
        " interation type " + this.intersection_types[this.cycle_counter[this.inter_i]];
    }

}

class ReportManager{
    iteration = [];
    report_mode = [];
    report = [];

    constructor(){
    } 

    get_iter_val(given){
        this.iteration.push(given);
    }

    get_report(mode, car){
        let index = this.report_mode.indexOf(mode);
        if(index == -1){
            this.report_mode.push(mode);
            this.report.push([]);
        } else {
            this.report[index].push(car.report_array());
        }
        console.log(" report manager ");
        console.log(this.report_mode);
        console.log(this.report);
    }

    print_report(){
        let total_t = 0;
        let average = 0;
        for (let i = 0; i < this.report_mode.length; i++) {
            console.log(this.iteration[i]);
            console.log(this.report_mode[i]);
            total_t = 0;
            average = 0;
            this.report[i].forEach(report => {
                total_t = total_t + report[0];
                average = average + report[1];
            })
            console.log(" total trips " + total_t + " average " + (average/total_t));
        }
    }
}