var uberClientId = YOUR_CLIENT_ID;
var uberServerToken = YOUR_SERVER_TOKEN;
var uberClientSecret = YOUR_CLIENT_SECRET;

var userLatitude;
var userLongitude;


var timer;
$(document).ready(function(){
    console.log("Page Loaded !!!");    
    getUserLocation();
});

function getUserLocation()
{
    navigator.geolocation.watchPosition(function (position) {

    userLatitude = position.coords.latitude;
    userLongitude = position.coords.longitude;

    if (typeof timer === typeof undefined) {
        timer = setInterval(function () {
            var obj = {"sourceLat": userLatitude, "sourceLong": userLongitude};
            localStorage.setItem('.json/userSource.json', JSON.stringify(obj));
            getTimeEstimatesForUserLocation(userLatitude, userLongitude);
        }, 10000);

        var obj = {"sourceLat": userLatitude, "sourceLong": userLongitude};
        localStorage.setItem('.json/userSource.json', JSON.stringify(obj));
        getTimeEstimatesForUserLocation(userLatitude, userLongitude);
    }
});

}

function mapRides(result) {
    var strData = '';
    strData += '<div class = "row">';
    result.times.forEach(function (val) {        
            strData += '<div class="col-sm-6">'
            strData += '<div class="panel panel-primary text-center">'
            strData += '<div class="panel-heading"><p>'+ val.localized_display_name +'</p></div>'
            strData += '<div class="panel-body"><p>'+ Math.ceil(val.estimate/60) +' Min Away</p></div>'
            strData += '<div class="panel-footer"><a style="margin:0 auto" href="locationEstimation.html?'+ val.localized_display_name +'"><button type="button" class="btn btn-primary button text-center">Set Pickup Location</button></a></div>'          
            strData += '</div>'
            strData += '</div>'
     });

    strData += '</div>';
    $("#contentData").html(strData);
}

function getTimeEstimatesForUserLocation(latitude, longitude) {

    console.log("Requesting updated time estimate...");
    $.ajax({
        url: "https://api.uber.com/v1.2/estimates/time",
        headers: {
            Authorization: "Token " + uberServerToken
        },
        data: {
            start_latitude: latitude,
            start_longitude: longitude
        },
        success: function (result) {
            console.log(JSON.stringify(result));
            mapRides(result);
            var data = result["times"];
            if (typeof data != typeof undefined) {                
                data.sort(function (t0, t1) {
                    return t0.duration - t1.duration;
                });
                
                var shortest = data[0];
                if (typeof shortest != typeof undefined) {
                    console.log("Updating time estimate...");
                    $("#time").html("IN " + Math.ceil(shortest.duration / 60.0) + " MIN");
                }
            }
        },
        error: function (response) {
            alert("Sorry, Some techincal error occured");
        },
        failure: function (response) {
            alert("Sorry, Some techincal error occured");
        }
    });
}