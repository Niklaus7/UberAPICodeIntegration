var uberClientId = YOUR_CLIENT_ID;
var uberServerToken = YOUR_SERVER_TOKEN;
var uberClientSecret = YOUR_CLIENT_SECRET;

var userLat;
var userLong;
var token;

$(document).ready(function(){
    var objLocation = JSON.parse(localStorage.getItem('.json/userDestination.json'));
    var objToken = JSON.parse(localStorage.getItem('.json/userCredentials.json'));
    token = objToken.token;
    var objProductData = JSON.parse(localStorage.getItem('.json/productDataInfo.json'));    
    if(localStorage.getItem('.json/userSource.json') !== null)
    {
        var sourceLocation = JSON.parse(localStorage.getItem('.json/userSource.json'));
        userLat = sourceLocation.sourceLat;
        userLong = sourceLocation.sourceLong;
    }
    if(window.location.search.split("surge_confirmation_id=")[1] === undefined)
    {
        getRequestEstimate(objProductData.productInfo.product_id, objToken.token, objLocation.destLat, objLocation.destLong);        
    }else if(window.location.search.split("surge_confirmation_id=")[1] !== undefined)
    {
        console.log("Returned to page successfully after accepting higher surge rate ...");
        $('#loading').removeClass("showBooking");
        $('#loading').addClass("hideBooking");
        $('#bookingPage').removeClass("hideBooking");
        $('#bookingPage').addClass("showBooking");
        bookRideRequest(objProductData.productInfo.product_id, objToken.token, objLocation.destLat, objLocation.destLong, undefined, window.location.search.split("surge_confirmation_id=")[1]);
    }      
    $("#cancelRide").click(function(){
        cancelRideRequest(token);
    });
    $("#homeLink").click(function(){
        window.location.replace("https://devdattag.github.io/UberIntegration.html");
    });
});

function getRequestEstimate(productID, accessToken, destLat, destLong)
{
        console.log("Fetching request estimate...");
        var productId = productID;
        var dataString = '{"product_id":"' + productId + '","start_latitude":"' + userLat + '","start_longitude":"' + userLong + '","end_latitude":"' + destLat + '","end_longitude":"' + destLong + '"}';
            $.ajax({
            url: "https://sandbox-api.uber.com/v1.2/requests/estimate",

            type: "POST",
            crossDomain: true,
            headers: {
                Authorization: "Bearer "+accessToken,
                "Accept-Language": "en_US",
                "Content-Type" : "application/json"
            },
            data: dataString,
            success: function (result) {
                // alert("Got the info");
                console.log(JSON.stringify(result));
                $('#loading').removeClass("showBooking");
                $('#loading').addClass("hideBooking");
                $('#bookingPage').removeClass("hideBooking");
                $('#bookingPage').addClass("showBooking");
                if(result.hasOwnProperty("estimate"))
                {
                    console.log("Upfront fares not enabled... Checking for surge multiplier rate...");
                    console.log(result);
                    if(result.estimate.surge_confirmation_href === null)
                    {
                        bookRideRequest(productId, accessToken, destLat, destLong);                          
                    }else
                    {
                        console.log("Redirecting for surge confirmation");
                        window.location.href = result.estimate.surge_confirmation_href;
                        console.log("Surge confirmed by user");
                    }
                    
                    
                    // $(".modal-body #surgeMultiplierValue").html(result.estimate.surge_multiplier+"x");
                    // $('#myModal')
                    // .modal({ backdrop: 'static', keyboard: false })
                    // .one('click', '[data-value]', function (e) {                        
                    //     if($(this).data('value')) {
                    //         // alert('confirmed');
                    //         bookRideRequest(accessToken, destLat, destLong);
                    //     } else {
                    //         //alert('canceled');
                    //         window.location.replace("https://devdattag.github.io/UberIntegration.html");
                    //     }
                    // });
                }else
                {
                    $("#fareTypeEstimate").html("Upfront Fare Estimate")
                    $(".modal-body #surgeMultiplierValue").html(result.fare.display);
                    $('#myModal')
                    .modal({ backdrop: 'static', keyboard: false })
                    .one('click', '[data-value]', function (e) {                        
                        if($(this).data('value')) {                                                    
                            bookRideRequest(productId, accessToken, destLat, destLong, result.fare.fare_id);
                        } else {                            
                            window.location.replace("https://devdattag.github.io/UberIntegration.html");
                        }
                    });
                    
                }                
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

function bookRideRequest(productID, accessToken, destLat, destLong, fareId, surgeConfirmationId)
{
    console.log("Requesting Ride...");
    var dataString;
    if(fareId === undefined)
    {
        if(surgeConfirmationId === undefined)
        {
            dataString = '{"product_id":"' + productID + '","start_latitude":"' + userLat + '","start_longitude":"' + userLong + '","end_latitude":"' + destLat + '","end_longitude":"' + destLong + '"}';
        }else
        {
            dataString = '{"product_id":"' + productID + '","surge_confirmation_id":"' + surgeConfirmationId + '","start_latitude":"' + userLat + '","start_longitude":"' + userLong + '","end_latitude":"' + destLat + '","end_longitude":"' + destLong + '"}';
        }

    }else
    {
        dataString = '{"product_id":"' + productID + '","fare_id":"' + fareId + '","start_latitude":"' + userLat + '","start_longitude":"' + userLong + '","end_latitude":"' + destLat + '","end_longitude":"' + destLong + '"}';
    }
    
        $.ajax({
        url: "https://sandbox-api.uber.com/v1/requests",
        
        type: "POST",
        crossDomain: true,
        headers: {
                Authorization: "Bearer "+accessToken,
                "Accept-Language": "en_US",
                "Content-Type" : "application/json"
            },
        data: dataString,
        success: function (result) {
            console.log(JSON.stringify(result));
            $("#showRideStatus").html(result.status);
            console.log(result.status);        
            setTimeout(function() { autoAcceptRequest(token, result.request_id); },7000);    
            getRideRequestStatus(token, result.request_id);
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

function getRideRequestStatus(token, requestID)
{
    console.log("Getting ride request status...");
    var requestURL = "https://sandbox-api.uber.com/v1/requests/" + requestID;    


    var requestStatus = setInterval(function() {    
        $.ajax({
            url: requestURL,
            
            type: "GET",
            crossDomain: true,
            headers: {
                    Authorization: "Bearer "+token,
                    "Accept-Language": "en_US",
                    "Content-Type" : "application/json"
            },       
            success: function (result) {
                console.log(result);
                $("#showRideStatus").html(result.status);
                if(result.status === "accepted")
                {
                    var obj = {"tripData": result};
                    localStorage.setItem('.json/tripData.json', JSON.stringify(obj));
                    clearInterval(requestStatus);
                    getUserRideMap(result.request_id);
                    showTripDetails(result);
                }
                // $("#showRideStatus").html(result.status);
                // console.log(result.status);
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
    }, 3000);
}

function autoAcceptRequest(token, requestID)
{
    console.log("Accepting Request...");      
    var dataString = '{"status":"accepted"}';
    var requestURL = "https://sandbox-api.uber.com/v1/sandbox/requests/" + requestID;
        $.ajax({
        url: requestURL,        
        type: "PUT",
        crossDomain: true,
        headers: {
                Authorization: "Bearer "+token,
                "Content-Type" : "application/json"
        },      
        data:dataString,
        success: function (result) {
            console.log("Ride Accepted ...");          
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

function getRideReceiptData(token, requestID, trip)
{
    console.log("Getting trip status...");
    var requestURL = "https://sandbox-api.uber.com/v1/requests/" + requestID;    
    var requestId = requestID;
    var tripInfo = trip;

    var receiptStatus = setInterval(function() {    
        $.ajax({
            url: requestURL,
            
            type: "GET",
            crossDomain: true,
            headers: {
                    Authorization: "Bearer "+token,
                    "Accept-Language": "en_US",
                    "Content-Type" : "application/json"
            },       
            success: function (result) {
                console.log(result);     
                if(result.status === "arriving")
                {
                    $("#showRideStatus").html("Your Uber is arriving now");
                }
                if(result.status === "in_progress")
                {
                    $("#showRideStatus").html("On Trip");                                        
                }          
                if(result.status === "completed")
                {                    
                    clearInterval(receiptStatus);                    
                    generateRideReceipt(token,requestId, tripInfo);
                }
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
    }, 3000);
}

function generateRideReceipt(token, requestID, tripInfo)
{
    console.log("Generating Ride Receipt...");  
    var trip = tripInfo;       
    var requestURL = "https://sandbox-api.uber.com/v1/requests/" + requestID + "/receipt";
        $.ajax({
        url: requestURL,        
        type: "GET",
        crossDomain: true,
        headers: {
                Authorization: "Bearer "+token,
                "Content-Type" : "application/json"
        },              
        success: function (result) {
            console.log("Receipt Generated ...");
            console.log(result);
            var obj = {"receiptData": result};
            localStorage.setItem('.json/receiptData.json', JSON.stringify(obj));
            showUserReceipt(result, trip);
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

function showTripDetails(trip){    
    if(localStorage.getItem('.json/rideName.json') !== null)
    {
        var myRide = JSON.parse(localStorage.getItem('.json/rideName.json'));
        $("#showTripStatus").removeClass("hiddenEstimate");
        $("#showTripStatus").addClass("visibleEstimate");
        $("#cancelRideContainer").removeClass("hiddenEstimate");
        $("#cancelRideContainer").addClass("visibleEstimate");        
        $("#showRideStatus").html("Your Uber is arriving in "+ trip.eta +" min");
        $("#driverName").text(trip.driver.name.toUpperCase());
        $("#driverRating").text(trip.driver.rating);
        $("#driverPhone").text(trip.driver.phone_number);
        $("#rideType").text(myRide.rideProduct.toUpperCase());
        $("#driverImage").attr("src", trip.driver.picture_url);
        $("#rideMake").text(trip.vehicle.make.toUpperCase());
        $("#rideName").text(trip.vehicle.model.toUpperCase());
        $("#rideNumber").text(trip.vehicle.license_plate.toUpperCase());  
        setTimeout(function() { autoUpdateRequestStatus(token, trip.request_id, "arriving"); },10000);
        setTimeout(function() { autoUpdateRequestStatus(token, trip.request_id, "in_progress"); },13000); 
        setTimeout(function() { autoUpdateRequestStatus(token, trip.request_id, "completed"); },20000); 
        getRideReceiptData(token, trip.request_id, trip);
    } 
}

function getUserRideMap(requestID)
{
    console.log("Getting User Map ...");       
    // var dataString = '{"status":"accepted"}';
    var requestURL = "https://sandbox-api.uber.com/v1/requests/" + requestID + "/map";
        $.ajax({
        url: requestURL,        
        type: "GET",
        crossDomain: true,
        headers: {
                Authorization: "Bearer "+token,
                "Content-Type" : "application/json"
        },      
        // data:dataString,
        success: function (result) {
            console.log("User ride map received ..."); 
            console.log(result);
            showUserRideMap(result.href);
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

function showUserRideMap(mapLink)
{
    $("#showUberRideMap").removeClass("hiddenEstimate");
    $("#showUberRideMap").addClass("visibleEstimate");
    $("#showUberRideMap").attr("src", mapLink);
}

function autoUpdateRequestStatus(token, requestID, updateStatus)
{
    console.log("Changing Request Status to : "+ updateStatus +" ...");      
    var dataString = '{"status":"'+updateStatus+'"}';
    var requestURL = "https://sandbox-api.uber.com/v1/sandbox/requests/" + requestID;
        $.ajax({
        url: requestURL,        
        type: "PUT",
        crossDomain: true,
        headers: {
                Authorization: "Bearer "+token,
                "Content-Type" : "application/json"
        },      
        data:dataString,
        success: function (result) {
            console.log("Status changed to : "+ updateStatus);          
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

function showUserReceipt(receipt, trip)
{
        var myRide = JSON.parse(localStorage.getItem('.json/rideName.json'));
        $("#titleRow").html("Trip Receipt");
        $("#descriptionRow").html("Thank you for riding with us");
        $("#rideStatusRow").html("Receipt");
        $("#showRideStatus").html("Total : "+receipt.total_charged);
        $("#showTripStatus").removeClass("visibleEstimate");
        $("#showTripStatus").addClass("hiddenEstimate");
        $("#cancelRideContainer").removeClass("visibleEstimate");
        $("#cancelRideContainer").addClass("hiddenEstimate");
        $("#receiptPage").removeClass("hiddenEstimate");
        $("#receiptPage").addClass("visibleEstimate");
        $("#homeContainer").removeClass("hiddenEstimate");
        $("#homeContainer").addClass("visibleEstimate");

        $("#receiptRodeWith").html("You rode with "+trip.driver.name);

        $("#receiptDistance").text(receipt.distance + " " +receipt.distance_label);
        $("#receiptTime").text(receipt.duration);
        $("#receiptProduct").html(myRide.rideProduct.toUpperCase());
        $("#receiptVehicle").html(trip.vehicle.make + " " + trip.vehicle.model);

        receipt.charges.forEach(function(val){
            $("#showFareBreakdown").append("<div><p style='text-align:center; color:#6e6e6e; float:right;'><b>"+val.amount+"</b></p><p style='color:#6e6e6e;'><b>"+val.name+"</b></p></div>");
        });        
        receipt.charge_adjustments.forEach(function(val){
            $("#showFareBreakdown").append("<div><p style='text-align:center; color:#6e6e6e; float:right;'><b>"+val.amount+"</b></p><p style='color:#6e6e6e;'><b>"+val.name+"</b></p></div>");
        });
        $("#showFareBreakdown").append("<hr style='height:1px; border:none; color:#333; background-color:#333;' />");
        $("#showFareBreakdown").append("<div><p style='text-align:center; color:black; float:right;'><b id='receiptSubtotal'>"+receipt.total_charged+"</b></p><p style='color:black;'><b>Subtotal</b></p></div>");
}

function cancelRideRequest(token)
{
    console.log("Cancelling Ride...");    
    var objRide = JSON.parse(localStorage.getItem('.json/tripData.json'));
    var requestURL = "https://sandbox-api.uber.com/v1/requests/" + objRide.tripData.request_id;
        $.ajax({
        url: requestURL,
        
        type: "DELETE",
        crossDomain: true,
        headers: {
                Authorization: "Bearer "+token,
                "Accept-Language": "en_US",
                "Content-Type" : "application/json"
        },        
        success: function (result) {
            console.log("Ride cancelled successfully : "+result);
            window.location.replace("https://devdattag.github.io/UberIntegration.html");
            // $("#showRideStatus").html(result.status);
            // console.log(result.status);
        },
        error: function (response) {
            alert("Sorry, Some techincal error occured");
        },
        failure: function (response) {
            alert("Sorry, Some techincal error occured");
        }
    });
}
