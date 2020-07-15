// initialising web3 provider, or connecting to established provider
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

// getting an intance of hosted contract
var reviewInstance = web3.eth.contract(ReviewAbi).at(ReviewAddr);

// ANGULAR

// AngularJS to display reviews
var app = angular.module('displayReviewPage', []);

// Get jobId from URL
var url = (window.location.href).split("?");
var jobId = parseInt(url[1]);

// Controller to show all reviews linked with a job.
app.controller('showJobReviews', function($scope) {
    $scope.reviews = [];
    reviewInstance.getJobReviews.call(jobId, function(err, reviews) {
        for (i in reviews) {
            reviewInstance.getReview.call(reviews[i], function(err, review) {
                if (!err) {
                    $scope.$apply(function() {
                        var reviewObj = {
                            reviewee: review[0],
                            jobID: review[1],
                            reviewText: review[2],
                            stars: review[3],
                            reviewID: review[4],
                            reviewer: review[5]
                        };
                        $scope.reviews.push(reviewObj);
                    });
                }
            });
        }
    });
});
