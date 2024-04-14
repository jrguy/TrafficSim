class Writer{
    fr = new FileReader();
    file = "";

    constructor(given_file){
        this.file = given_file;
    }

    read_average(){
        let result = {};
        let num_r = 0;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", "logs/" + this.file, false);
        xmlhttp.send();

        if (xmlhttp.status==200) {
            xmlhttp.responseText.split(/\r?\n/).forEach(line => {
                let val = line.split(",");
                let road = val[0];
                let num = val[1];
                if(road in result){
                    result[road] = result[road] + parseInt(num);
                    num_r++;
                } else {
                    result[road] = parseInt(num);
                }
            });
        }
        let div_b = num_r / Object.keys(result).length;
        console.log(div_b);
        let temp = result; 
        Object.keys(temp).forEach(key => {
            result[key] = temp[key] / div_b;
          });
        console.log(result);
        return result;
    }

    

    write_to_road_log(content){
        //not workings
        let val = [this.file, content[0],  content[1]];
        $.ajax({
            type: 'POST',
            //url: "python/write.py",
            //data: val,
            data : { file: this.file, road : content[0], num : content[1] },
            success: function (data) {
                console.log(" good ");
                console.log(data);
            },
            error: function (error) {
                console.log(" bad ");
                console.log(error);
            }
        });
    }
    



}
