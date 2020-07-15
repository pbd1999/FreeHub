// Display a list of accounts to the html page

// Initialising web3 provider, or connecting to established provider
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

// getting an intance of hosted contract
var accountInstance = web3.eth.contract(AccountAbi).at(AccountAddr);
var jobPostInstance = web3.eth.contract(JobPostAbi).at(JobPostAddr);
var reviewInstance = web3.eth.contract(ReviewAbi).at(ReviewAddr);


var url = (window.location.href).split("?");
var accountAddr = web3.eth.defaultAccount;
var defaultAcc = '0x0000000000000000000000000000000000000000';

if (url.length > 1) {
    accountAddr = url[1];
}

// ANGULAR

// angularjs to display all accounts
var app = angular.module('displayPage', []);

// controller to show all accounts uploaded to the blockchain for homepage
app.controller('showAllAccounts', function($scope){
    $scope.accounts = [];

    accountInstance.getAccounts.call(function(err, allAccounts){
        for (var i = 0; i < allAccounts.length; i++){
            accountInstance.getAccount.call(allAccounts[i], function(err,accountDetails){
                $scope.$apply(function(){
                    var accountObj = {
                        addr: accountDetails[4],
                        firstName: web3.toAscii(accountDetails[0]).replace(/\u0000/g, ''),
                        lastName: web3.toAscii(accountDetails[1]).replace(/\u0000/g, ''),
                        biography: accountDetails[5]
                    };
                    $scope.accounts.push(accountObj);
                })
            });
        }
    })
});


// Get all of the jobs associated with an account
app.controller('showAccountJobs', function($scope){
    $scope.employerJobs = [];
    $scope.workerJobs = [];

    // Get a list of all the jobs a user has created
    accountInstance.getEmployerJobs.call(accountAddr, function(err, employerJobs){
        for (i in employerJobs) {
            var jobId = employerJobs[i];
            jobPostInstance.getJob.call(jobId, function(err, result){
                jobPostInstance.getWorker.call(result[0], function(err, worker){
                    jobPostInstance.isComplete.call(result[0], function(err, isCompleted){
                        $scope.$apply(function() {
                            if (worker === defaultAcc && !isCompleted){
                              status = "Open";
                            } else if (worker !== defaultAcc && !isCompleted) {
                              status = "In Progress";
                            } else {
                              status = "Closed";
                            }
                            var jobObj = {
                                  id: result[0],
                                  title: result[1],
                                  description: result[2],
                                  payment:  web3.fromWei(result[3].toNumber()),
                                  status: status
                            };
                            $scope.employerJobs.push(jobObj);
                        });
                        var jobCard = document.getElementById('employerJobCard'+result[0]);
                        if (worker === defaultAcc && !isCompleted){
                            jobCard.className += " openJob";
                        } else if (worker !== defaultAcc && !isCompleted) {
                            jobCard.className += " inProgressJob";
                        } else {
                            jobCard.className += " closedJob";
                        }
                    });
                });
            });
        }
    });

    // Get a list of all the jobs a user has been assigned to
    accountInstance.getWorkerJobs.call(accountAddr, function(err, res){
        for (var i = 0; i < res.length; i++) {
            jobPostInstance.getJob.call(res[i], function(err, result){
                jobPostInstance.getWorker.call(result[0], function(err, worker){
                    jobPostInstance.isComplete.call(result[0], function(err, isCompleted){
                        $scope.$apply(function() {
                            if (worker === defaultAcc && !isCompleted){
                              status = "Open";
                            } else if (worker !== defaultAcc && !isCompleted) {
                              status = "In Progress";
                            } else {
                              status = "Closed";
                            }
                            var jobObj = {
                                id: result[0],
                                title: result[1],
                                description: result[2],
                                payment:  web3.fromWei(result[3].toNumber()),
                                status: status
                            };
                            $scope.workerJobs.push(jobObj);
                        });
                        var jobCard = document.getElementById('workerJobCard'+result[0]);
                        if (worker === defaultAcc && !isCompleted){
                            jobCard.className += " openJob";
                        } else if (worker !== defaultAcc && !isCompleted) {
                            jobCard.className += " inProgressJob";
                        } else {
                            jobCard.className += " closedJob";
                        }
                    });
                });
            });
        }
    });
});

app.controller('showAccount', function($scope){
    $scope.account = {};
    accountInstance.getAccount.call(accountAddr, function(err, accountDetails){
        $scope.$apply(function(){
            $scope.account = {
                addr: accountDetails[4],
                firstName: web3.toAscii(accountDetails[0]).replace(/\u0000/g, ''),
                lastName: web3.toAscii(accountDetails[1]).replace(/\u0000/g, ''),
                biography: accountDetails[5],
                email: accountDetails[6]
            };
        });
      });
});

app.controller('showAccountReviews', function($scope){
    $scope.reviews = [];
    reviewInstance.getReceivedReviews(accountAddr, function(err, reviews) {
        for (var i in reviews) {
            reviewInstance.getReview(reviews[i], function(err, review) {
                $scope.$apply(function () {
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
            });
        }
    });
});
