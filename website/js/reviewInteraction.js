// initialising web3 provider, or connecting to established provider
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

var reviewInstance = web3.eth.contract(ReviewAbi).at(ReviewAddr);


function completeRating(n) {
    document.getElementById("completeStarRating").innerHTML = n;
}

function workRating(n) {
    document.getElementById("workStarRating").innerHTML = n;
}


function postReview(reviewee, jobId, reviewText, stars) {
    var url = (window.location.href).split("?");
    stars = parseInt(stars);

    console.log(reviewee);
    console.log(jobId);
    console.log(reviewText);
    console.log(stars);

    reviewInstance.postReview(reviewee, jobId, reviewText, stars, function(err, res) {
        if (!err) {
            console.log("Review post success");
        } else {
            console.log("Review post failure");
        }
    });
}

// Check most recent review
reviewInstance.getReviewCount(function(err, count) {
    console.log("count: " + count);
    reviewInstance.getReview(count - 1, function(err, res) {
        console.log("Review: " + res);
    });
});
