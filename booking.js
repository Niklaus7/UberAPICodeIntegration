var uberClientId = YOUR_CLIENT_ID;
var uberServerToken = YOUR_SERVER_TOKEN;
var uberClientSecret = YOUR_CLIENT_SECRET;

var userLat;
var userLong;

$(document).ready(function(){
    var objLocation = JSON.parse(localStorage.getItem('.json/userDestination.json'));
    if(localStorage.getItem('.json/userSource.json') !== null && localStorage.getItem('.json/rideName.json') !== null)
    {
        var sourceLocation = JSON.parse(localStorage.getItem('.json/userSource.json'));
        userLat = sourceLocation.sourceLat;
        userLong = sourceLocation.sourceLong;
        var productNameData = JSON.parse(localStorage.getItem('.json/rideName.json'));
        getProductInformation(productNameData.rideProduct.toUpperCase(), userLat, userLong);
    }
    if(window.location.hash == "#_")
    {
        getAuthToken(window.location.search.split("code=")[1], objLocation.destLat, objLocation.destLong);
    }  
    // getLocation().then(function(response) {
    //     userLat = response.latitude;
    //     userLong = response.longitude;
          
    // });  
});

// function getLocation() {

//     return new Promise(function(resolve,reject) 
//         {              

//               if (!navigator.geolocation){
//                 alert("Not Allowed");
//                 return;
//               }

//               function success(position) {               
//                 resolve(position.coords);
//               }

//               function error() {
//                 alert("Error");
//                   reject('error');
//               }
//               navigator.geolocation.getCurrentPosition(success, error);
//         });
// }

function getAuthToken(authCode, destLat, destLong)
{
    console.log("Fetching Authentication Token...");
        $.ajax({
        url: "https://login.uber.com/oauth/v2/token",
        
        type: "POST",
        crossDomain: true,
        headers: {
            // Authorization: "Token " + uberServerToken
            // Accept: "application/json",
            // Content-Type : "application/x-www-form-urlencoded"
        },
        data: {
            client_secret: uberClientSecret,
            client_id: uberClientId,
            grant_type: "authorization_code",
            redirect_uri: "https://devdattag.github.io/booking.html",
            code: authCode
        },
        success: function (result) {
            console.log(JSON.stringify(result));
            var token = result.access_token;
            var obj = {"token": token};
            localStorage.setItem('.json/userCredentials.json', JSON.stringify(obj));
            window.location.replace("https://devdattag.github.io/bookUber.html");
        },
        error: function (response) {
            alert("Sorry, Some techincal error occured");
            window.location.replace("https://devdattag.github.io/UberIntegration.html");
        },
        failure: function (response) {
            alert("Sorry, Some techincal error occured");
            window.location.replace("https://devdattag.github.io/UberIntegration.html");
        }
    });
}

function getProductInformation(productName, lat, long){
    console.log("Fetching product information...");
    var name = productName;
    $.ajax({
        url: "https://api.uber.com/v1.2/products",
        headers: {
            Authorization: "Token " + uberServerToken
        },
        data: {
            latitude: lat,
            longitude: long
        },
        success: function (result) {
            var productData = result.products.filter(function(val){
                return val.display_name.toUpperCase() === productName.toUpperCase();
            });
            console.log(productData);
            var productInfoData = {"productInfo": productData[0]};
            localStorage.setItem('.json/productDataInfo.json', JSON.stringify(productInfoData));
        },
        error: function (response) {
            alert("Sorry, Some techincal error occured");
        },
        failure: function (response) {
            alert("Sorry, Some techincal error occured");
        }
    });

}


