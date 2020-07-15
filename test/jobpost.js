var JobPost = artifacts.require("./JobPost.sol");

var title = "Job Test";
var description = "Description Test. This is a Test";
var payment = 1;

contract('JobPost', function(accounts){
  it("Should post a job and retrieve successfully", function(){
    return JobPost.deployed().then(function(instance){
      deployedJob = instance;
      var amount = parseFloat(web3.toWei(payment, 'ether'));
      return deployedJob.addJob(title, description, amount, {from: accounts[0], value: amount});
    }).then(function(jobTrans){
      return deployedJob.getJob.call(0);
    }).then(function(retrievedJob){
      assert.equal(retrievedJob[0], 0, "Id returned incorrect");
      assert.equal(retrievedJob[1], title, "Title returned incorrect");
      assert.equal(retrievedJob[2], description, "Description returned incorrect");
      assert.equal(web3.fromWei(retrievedJob[3]), payment, "Payment returned incorrect");
    })
  });

  it("Should return the correct count of posted Jobs", function(){
    return JobPost.deployed().then(function(instance){
      deployedJob = instance;
      return (deployedJob.getJobCount.call());
    }).then(function(jobCount){
      assert.equal(jobCount.toNumber(), 1, "Incorrect job count returned before job added");
      var amount = parseFloat(web3.toWei(payment, 'ether'));
      return deployedJob.addJob(title, description, amount, {from: accounts[0], value: amount});
    }).then(function(jobTrans){
      return (deployedJob.getJobCount.call());
    }).then(function(jobCount){
      assert.equal(jobCount, 2, "Incorrect job count after new job added");
    })
  });

  it("Should allocate a worker correctly", function(){
    return JobPost.deployed().then(function(instance){
      deployedJob = instance;
      return deployedJob.setWorker(0, accounts[1], {from: accounts[0]})
    }).then(function(workerTrans){
      return deployedJob.getWorker.call(0);
    }).then(function(worker){
      assert.equal(worker, accounts[1], "Incorrect worker address");
    })
  });

  it("Should apply users to a job", function(){
    return JobPost.deployed().then(function(instance){
      deployedJob = instance;
      deployedJob.applyToJob(0, {from: accounts[1]});
      deployedJob.applyToJob(1, {from: accounts[2]});
      return deployedJob.applyToJob(0, {from: accounts[2]})
    }).then(function(applicationTrans){
      return deployedJob.getApplicants(0);
    }).then(function(applicants){
      assert.equal(applicants[0], accounts[1], "Wrong first applicant");
      assert.equal(applicants[1], accounts[2], "Wrong second applicant");
    })
  });

  var beforeJobBalance;
  it("Should complete a job & pay a worker", function(){
    return JobPost.deployed().then(function(instance){
      deployedJob = instance;
      return deployedJob.isComplete.call(0);
    }).then(function(isCompleted){
      assert.equal(isCompleted, false, "job is complete before calling isComplete");
      return web3.eth.getBalance(accounts[1]);
    }).then(function(workerBalance){
      beforeJobBalance = workerBalance;
      return deployedJob.completeJob(0, {from: accounts[0]});
    }).then(function(completeTrans){
      return deployedJob.isComplete.call(0);
    }).then(function(isCompleted){
      assert.equal(isCompleted, true, "job is not complete after calling isComplete");
      return web3.eth.getBalance(accounts[1]);
    }).then(function(workerBalance){
      assert.equal(workerBalance.toNumber(), (parseInt(beforeJobBalance) + parseInt(web3.toWei(payment))), "worker balance has not been increased correctly after isComplete");
    })
  });

  it("Should cancel a job and return payment funds to the owner", function(){
    return JobPost.deployed().then(function(instance){
      deployedJob = instance;
      return web3.eth.getBalance(accounts[0]);
    }).then(function(ownerBalance){
      beforeJobBalance = ownerBalance;
      return deployedJob.cancelJob(1, {from:accounts[0]})
    }).then(function(cancelTrans){
      return web3.eth.getBalance(accounts[0]);
    }).then(function(workerBalance){
      assert(workerBalance.toNumber() > (parseInt(beforeJobBalance)));
    })
  })
});
