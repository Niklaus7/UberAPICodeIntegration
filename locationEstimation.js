var uberClientId = YOUR_CLIENT_ID;
var uberServerToken = YOUR_SERVER_TOKEN;
var uberClientSecret = YOUR_CLIENT_SERCRET;

var timer;
$(document).ready(function(){
    var productName = window.location.search.split('?')[1];
    var carData = {"rideProduct": productName};
    localStorage.setItem('.json/rideName.json', JSON.stringify(carData));

    $("#requestRide").click(function(){
        if($("#destinationLatitude").val() === "" || $("#destinationLongitude").val() === "")
        {
            alert("Select Destination");
        }else
        {                   
            var obj = {"destLat": +$("#destinationLatitude").val(), "destLong": +$("#destinationLongitude").val()};
            localStorage.setItem('.json/userDestination.json', JSON.stringify(obj));
            window.location.href = "https://login.uber.com/oauth/v2/authorize?client_id=YOUR_CLIENT_ID&response_type=code&scope=request+profile+request_receipt";
        }
    });

    $("#fareEstimate").click(function(){
        if($("#destinationLatitude").val() === "" || $("#destinationLongitude").val() === "")
        {
            alert("Select Destination");
        }else
        {           
            var destLat = +$("#destinationLatitude").val();
            var destLong = +$("#destinationLongitude").val();     
            getUserLocation(destLat,destLong,productName);        
        }
    });    
});

function getUserLocation(destLat,destLong,productName)
{
    navigator.geolocation.watchPosition(function (position) {


    var userLatitude = position.coords.latitude;
    var userLongitude = position.coords.longitude;    

    if (typeof timer === typeof undefined) {
        timer = setInterval(function () {                    
            getEstimatesForUserLocation(userLatitude, userLongitude, +$("#destinationLatitude").val(), +$("#destinationLongitude").val(), productName); 
        }, 10000);            
        
        getEstimatesForUserLocation(userLatitude, userLongitude, +$("#destinationLatitude").val(), +$("#destinationLongitude").val(), productName);         
    }
});

}

function getEstimatesForUserLocation(latitude, longitude, destinationLatitude, destinationLongitude, productName) {

    console.log("Requesting updated time estimate...");
    var name = productName;
    $.ajax({
        url: "https://api.uber.com/v1/estimates/price",
        headers: {
            Authorization: "Token " + uberServerToken
        },
        data: {
            start_latitude: latitude,
            start_longitude: longitude,
            end_latitude: destinationLatitude,
            end_longitude: destinationLongitude
        },
        success: function (result) {
            var product = result.prices.filter(function(val){                
                 return val.localized_display_name == name;
            });
            console.log(product);
            $("#fareEstimatePanel").removeClass("hiddenEstimate");
            $("#fareEstimatePanel").addClass("visibleEstimate");
            $("#showFareEstimate").html(product[0].estimate);
        },
        error: function (response) {
            alert("Sorry, Some techincal error occured");
        },
        failure: function (response) {
            alert("Sorry, Some techincal error occured");
        }
    });
}

