// Set a provider (HttpProvider)
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

// Set the default Web3 account
web3.eth.defaultAccount = web3.eth.accounts[0];

// Get intances of hosted contracts
var jobPostInstance = web3.eth.contract(JobPostAbi).at(JobPostAddr);
var accountInstance = web3.eth.contract(AccountAbi).at(AccountAddr);

// Parse url for jobId or accountId
var url = (window.location.href).split("?");
var jobId = parseInt(url[1]);

// Post a job
function addJob(title, desc, pay) {

    var emptyAddr = '0x00000000000000000000000000000000';

    // check if the account has sufficient funds to post the job
    web3.eth.getBalance(web3.eth.accounts[0], function(err, balance) {
        if (web3.fromWei(balance) < pay) {
            alert("You have insufficient funds to post this job.");
        } else {
            if (profanityFilter(title) === true || profanityFilter(desc) === true) {
                alert("Your input contains profanities, please try again.");
            } else {
                accountInstance.getAccount(web3.eth.defaultAccount, function (err, accountInfo) {
                    // Check if the account is registered
                    if (accountInfo[0] !== emptyAddr) {
                        var amount = parseFloat(web3.toWei(pay, 'ether'));
                        // Add job to owners employerJobs list
                        jobPostInstance.getJobCount.call(function (error, jobCount) {
                            if (!error) {
                                accountInstance.addEmployerJob(web3.eth.defaultAccount, jobCount, function (err, result) {
                                    if (!err) {
                                        jobPostInstance.addJob(title, desc, amount, {
                                            from: web3.eth.defaultAccount,
                                            value: amount
                                        }, function (err, result) {
                                            if (!err) {
                                                console.log('Added to EmployerJobs');
                                                if(confirm('Job posted successfully')) window.location.href = "index.html";
                                            }
                                        });
                                    } else {
                                        console.log('Not added to EmployerJobs');
                                    }
                                });
                            }
                        });
                    } else {
                        alert('This account is not registered');
                    }
                });
            }
        }
    });
}

// Apply worker to a job
function applyToJob() {
    var emptyAddr = '0x00000000000000000000000000000000';

    accountInstance.getAccount(web3.eth.defaultAccount, function(err, accountInfo) {
        // check if the account is registered
        if (accountInfo[0] !== emptyAddr) {
            var url = (window.location.href).split("?");
            var jobId = parseInt(url[1]);
            jobPostInstance.getJob(jobId, function(err, job) {
                if (job[4] !== web3.eth.defaultAccount) {
                    jobPostInstance.getApplicants(jobId, function(err, applicants) {
                        var isUnique = true;
                        for (var i = 0; i < applicants.length; i++) {
                            if (applicants[i] === web3.eth.defaultAccount) {
                                alert('You can only apply to a job once!');
                                isUnique = false;
                            }
                        }
                        if (isUnique) {
                            jobPostInstance.applyToJob(jobId, function(err, result) {
                                if (err)
                                    console.log(err);
                                else {
                                    document.getElementById('applyButton').disabled = true;
                                    alert("Successfully applied to the job!");
                                }
                            });
                        }
                    });
                } else {
                    alert('You cannot apply to your own job!');
                }
            });
        } else {
            alert('This account is not registered!');
        }
    });
}

// Assign candidate to a job
function acceptApplicant(index) {
    var url = (window.location.href).split("?");
    var jobId = parseInt(url[1]);

    jobPostInstance.getApplicants(jobId, function(err, applicants) {
        if (confirm('Are you sure you want to accept this Applicant?')) {
            jobPostInstance.setWorker(jobId, applicants[index], function(setWorkerError, success) {
                if (!setWorkerError) {
                    accountInstance.addWorkerJob(applicants[index], jobId, function(err, result) {
                        if (!err) {
                            console.log('Added to workerJobs');
                        } else {
                            console.log('Not added to workerJobs');
                        }
                    });
                } else {
                    console.log('Worker not set: ' + setWorkerError);
                }
            });
        }
    });
}

// Mark a job as completed and processes payment
function completeJob() {
    var url = (window.location.href).split("?");
    var jobId = parseInt(url[1]);

    var reviewText = document.getElementById('completeReviewTextInput').value;
    var stars = document.getElementById('completeStarRating').innerHTML;

    if (profanityFilter(reviewText) === true) {
        alert("Your review contains profanities, please try again.")
    } else {
        // Check if Job is already completed.
        jobPostInstance.isComplete.call(jobId, function(err, isCompleted) {
            // Check if the worker has marked the work as complete.
            jobPostInstance.isWorkComplete.call(jobId, function(err, isWorkComplete) {
                jobPostInstance.getWorker.call(jobId, function(err, reviewee) {
                    if (!err) {
                        if (isCompleted) {
                            alert('Job is already complete');
                        } else if (!isWorkComplete) {
                            alert('Worker has not marked the work as complete');
                        } else {
                            if (confirm('Are you sure you want to complete this job?')) {
                                jobPostInstance.completeJob(jobId, function(err, result) {
                                    postReview(reviewee, jobId, reviewText, stars);
                                    // Disable buttons.
                                    document.getElementById('completeModalButton').disabled = true;
                                    document.getElementById('completeJobButton').disabled = true;
                                    document.getElementById('cancelJobButton').disabled = true;
                                    // Close modal.
                                    $("#completeJobModal").modal("hide");
                                });
                            }
                        }
                    } else {
                        console.log('Couldn\'t get reviewee!');
                    }
                });
            });
        });
    }
}

// Marks a job as complete and returns payment to the owner.
function cancelJob() {
    var url = (window.location.href).split('?');
    var jobId = parseInt(url[1]);
    jobPostInstance.isComplete(jobId, function(err, isCompleted) {
        if (isCompleted) {
            alert('Job is already completed!');
        } else {
            if (confirm('Are you sure you want to cancel this job?')) {
                jobPostInstance.cancelJob(jobId, function(err, success) {
                    if (success) {
                        // Disable buttons
                        document.getElementById('completeJobButton').disabled = true;
                        document.getElementById('cancelJobButton').disabled = true;
                        document.getElementById('applyButton').disabled = true;
                    }
                })
            }
        }

    })
}

// Marks the work as completed.
function completeWork() {
    var url = (window.location.href).split("?");
    var jobId = parseInt(url[1]);

    var reviewText = document.getElementById('workReviewTextInput').value;
    var stars = document.getElementById('workStarRating').innerHTML;

    if (profanityFilter(reviewText) === true) {
        alert("Your review contains profanities, please try again.")
    } else {
        // Check if the work has already been marked as completed.
        jobPostInstance.isWorkComplete.call(jobId, function(err, isWorkComplete) {
            if (!isWorkComplete) {
                if (confirm("Are you sure you want to confirm your work is complete?")) {
                    jobPostInstance.completeWork(jobId, function(err, success) {
                        if (success) {
                            jobPostInstance.getOwner.call(jobId, function(err, reviewee) {
                                postReview(reviewee, jobId, reviewText, stars);

                                //Disable buttons
                                document.getElementById("completeWorkButton").disabled = true;
                                document.getElementById("confirmWorkButton").disabled = true;
                                // Close modal.
                                $("#completeWorkModal").modal("hide");

                            });
                        } else {
                            console.log("Failed to post job completion");
                        }
                    });
                }
            } else {
                alert("Work is already completed");
            }
        });
    }
}

window.addEventListener("load", function() {
  var url = (window.location.href).split("/");
  // listening for post button click when on postJob.html
  // validates that the inputs are of the correct type
  if (url[3] === "postJob.html") {
      document.getElementById('postButton').addEventListener('click', function(event) {
          event.preventDefault();
          var title = document.getElementById('titleInput').value;
          var description = document.getElementById('descriptionInput').value;
          try {
              var payment = parseFloat(document.getElementById('paymentInput').value);
          } catch (err) {
              alert("The payment must be a number")
          }


          if (typeof(title) !== "string") {
              alert("The title must be a string");
          } else if (typeof(description) !== "string") {
              alert("The description must be a string");
          } else if (typeof(payment) !== "number") {
              alert("The payment must be a number")
          } else if (payment < 0) {
              alert("The payment must be a positive number")
          } else {
              addJob(title, description, payment);
          }
      })
  }

  // Listening for button click on the job page
  if (url[3].split("?")[0] === "job.html") {
      document.getElementById('applyButton').addEventListener('click', function(event) {
          event.preventDefault();
          applyToJob();
      });

      document.getElementById('completeJobButton').addEventListener('click', function(event) {
          event.preventDefault();
          completeJob();
      });

      document.getElementById('cancelJobButton').addEventListener('click', function(event) {
          event.preventDefault();
          cancelJob();
      });

      document.getElementById('completeWorkButton').addEventListener('click', function(event) {
          event.preventDefault();
          completeWork();
      })
  }
});
