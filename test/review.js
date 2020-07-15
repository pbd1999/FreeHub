var Review = artifacts.require("./Reviews.sol");

var jobID = 123;
var reviewText = "Grand Job";
var stars = 5;
var reviewID = 0;

contract('Review', function(accounts) {
    it("should post a review", function() {
        return Review.deployed().then(function(instance) {
            deployedReview = instance;
            return deployedReview.postReview(accounts[1], jobID, reviewText, stars, {from: accounts[0]});
        }).then(function(postedReview) {
            return deployedReview.getReview.call(0);
        }).then(function(retrievedReview){
            assert.equal(retrievedReview[0], accounts[1], "The returned reviewee address is different");
            assert.equal(retrievedReview[1], jobID, "The returned job ID is wrong");
            assert.equal(retrievedReview[2], reviewText, "The review text is different");
            assert.equal(retrievedReview[3], stars, "The stars are different");
            assert.equal(retrievedReview[4].toNumber(), reviewID, "The reviewID is wrong");
            assert.equal(retrievedReview[5], accounts[0], "The returned sender address is different");
        })
    });

    it("should return the correct number of posted reviews", function() {
        return Review.deployed().then(function(instance) {
            deployedReview = instance;
            return deployedReview.getReviewCount.call();
        }).then(function(reviewCount) {
            assert.equal(reviewCount.toNumber(), 1, "Incorrect review count before review posted");
            return deployedReview.postReview(accounts[1], jobID, reviewText, stars, {from: accounts[0]});
        }).then(function(reviewPost) {
            return deployedReview.getReviewCount.call();
        }).then(function(reviewCount) {
            assert.equal(reviewCount, 2, "Incorrect review count after new review posted");
        })
    });
});