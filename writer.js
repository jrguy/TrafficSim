class Writer{
    fr = new FileReader();
    file = "";

    constructor(given_file){
        this.file = given_file;
    }

    read(){
        fr.onload = function () {
            console.log( fr.result );
        }
    }

    write_to_road_log(content){
        $.ajax({
            type: 'POST',
            url: "/python/write.py",
            data: content,
            success: function () {
                console.log(" good ");
            },
            error: function (error) {
                console.log(" bad ");
                console.log(error);
            }
        });
    }
    



}

