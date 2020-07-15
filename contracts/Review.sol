pragma solidity ^0.4.18;

contract Reviews {
    struct Review {
        address reviewee;
        uint jobID;
        string reviewText;
        uint stars;
        uint reviewID;
        address reviewer;
    }

    uint reviewCounter = 0;
    mapping (uint => Review) reviews;
    mapping (uint => uint[]) jobReviews; // Mapping of reviews to a specific job
    mapping (address => uint[]) reviewsSent; // Mapping of reviews sent by specific user
    mapping (address => uint[]) reviewsReceived; // Mapping of reviews recieved by specific user
    uint[] public allReviews;

    function postReview(address _reviewee, uint _jobID, string _reviewText, uint _stars) public {
        var review = reviews[reviewCounter];

        review.reviewee = _reviewee;
        review.jobID = _jobID;
        review.reviewText = _reviewText;
        review.stars = _stars;
        review.reviewID = reviewCounter;
        review.reviewer = msg.sender;

        allReviews.push(review.reviewID);
        jobReviews[review.jobID].push(review.reviewID);
        reviewsSent[msg.sender].push(review.reviewID);
        reviewsReceived[review.reviewee].push(review.reviewID);

        reviewCounter += 1;
    }

    // Returns a review
    function getReview(uint reviewID) public constant returns (address, uint, string, uint, uint, address) {
        return (reviews[reviewID].reviewee, reviews[reviewID].jobID, reviews[reviewID].reviewText, reviews[reviewID].stars, reviews[reviewID].reviewID, reviews[reviewID].reviewer);
    }

    // Returns the reviews recieved by a user
    function getReceivedReviews(address addr) public constant returns (uint[]) {
        return reviewsReceived[addr];
    }

    // Returns the reviews sent by a user
    function getSentReviews(address addr) public constant returns (uint[]) {
        return reviewsSent[addr];
    }


    // Returns reviews related to a job
    function getJobReviews(uint jobID) public constant returns (uint[]) {
        return jobReviews[jobID];
    }

    // Returns the total number of jobs
    function getReviewCount() public constant returns (uint) {
        return reviewCounter;
    }
}
