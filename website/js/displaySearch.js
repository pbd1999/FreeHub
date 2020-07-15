// initialising web3 provider, or connecting to established provider
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}
var jobs = [];

// getting an intance of hosted contract
var jobPostInstance = web3.eth.contract(JobPostAbi).at(JobPostAddr);
var accountInstance = web3.eth.contract(AccountAbi).at(AccountAddr);

var app = angular.module('displaySearch', []);

app.controller('showResults', function($scope) {
  $scope.jobs;
  $scope.accounts;
  var defaultAcc = '0x0000000000000000000000000000000000000000';

  var url = (window.location.href).split("?");
  var splitUrl = url[1].split('&');
  splitUrl.shift();
  var firstItem = splitUrl[0];
  if (firstItem == null){
    return;
  } else {
    if (firstItem.substring(0, 2) === "0x") {
      showUsers(splitUrl);
    } else {
      showJobs(splitUrl);
    }
  }

  function showJobs(jobIds) {
    console.log(jobIds);
    $scope.jobs=[];

    for (var i in jobIds){
      jobId = jobIds[i];
      jobPostInstance.getJob.call(jobId,function(err,result){
        jobPostInstance.getWorker.call(result[0], function(err, worker){
          jobPostInstance.isComplete.call(result[0], function(err, isCompleted){
            //console.log(result);
            $scope.$apply(function(){
              if (worker === defaultAcc && !isCompleted){
                status = "Open";
              } else if (worker !== defaultAcc && !isCompleted) {
                console.log(worker);
                status = "In Progress";
              } else {
                status = "Closed";
              }
              var jobObj = {
                id: result[0],
                title: result[1],
                description: result[2],
                payment: web3.fromWei(result[3].toNumber()),
                status: status
              };
              console.log(jobObj);
              $scope.jobs.push(jobObj);
            });


            var jobCard = document.getElementById('jobCard'+result[0])
            var status;
            $scope.$apply(function(){
              if (worker === defaultAcc && !isCompleted){
                jobCard.className += " openJob";
              } else if (worker !== defaultAcc && !isCompleted) {
                jobCard.className += " inProgressJob";
              } else {
                jobCard.className += " closedJob";
              }
            })
          })
        })
      });
    }
  }

  function showUsers(accountAddrs) {
    $scope.accounts=[];
    for (var i in accountAddrs) {
      accountAddr = accountAddrs[i];
      accountInstance.getAccount.call(accountAddr, function(err, accountDetails) {
        $scope.$apply(function() {
          var accountObj = {
              addr: accountDetails[4],
              firstName: web3.toAscii(accountDetails[0]).replace(/\u0000/g, ''),
              lastName: web3.toAscii(accountDetails[1]).replace(/\u0000/g, '')
          };
          $scope.accounts.push(accountObj);
        })
      })
    }
  }
});
