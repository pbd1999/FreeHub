const Fuse = require("fuse.js");

// initialising web3 provider, or connecting to established provider
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

var jobPostInstance = web3.eth.contract(JobPostAbi).at(JobPostAddr);
var accountInstance = web3.eth.contract(AccountAbi).at(AccountAddr);
var jobs = [];
var users = [];

function search(input, searchSpace, options) {

  var fuse = new Fuse(searchSpace, options);

  var result = fuse.search(input);

  return result;

}

window.onload = function(event) {
  //getJobs();

  jobPostInstance.getJobCount.call(function(err, jobCount) {
    for (var i=0; i<jobCount; i++) {
      jobPostInstance.getJob(i, function(err, jobDetails) {
        var jobObj = {
          id: jobDetails[0],
          title: jobDetails[1],
          description: jobDetails[2],
          payment: web3.fromWei(jobDetails[3].toNumber())
          //status: status,
        };
        jobs.push(jobObj);
      })
    }
  });

  accountInstance.getAccounts.call(function(err, allAccounts) {
    for(var i in allAccounts) {
      accountAddr = allAccounts[i];
      accountInstance.getAccount.call(accountAddr, function(err, accountDetails) {
        var accountObj = {
          addr: accountDetails[4],
          firstName: web3.toAscii(accountDetails[0]).replace(/\u0000/g, ''),
          lastName: web3.toAscii(accountDetails[1]).replace(/\u0000/g, '')
        };
        users.push(accountObj)
      })
    }
  });


  document.getElementById('searchJobsButton').addEventListener('click', function(event) {

    event.preventDefault();

    var input = document.getElementById('searchInput').value;
    var options = {shouldSort: true, keys: [{name: 'title', weight: 0.5},
                                            {name: 'description', weight: 0.3},
                                            {name: 'payment', weight: 0.2}]}

    var searchResults = search(input, jobs, options);

    var urlData = "";
    for (var resultIndex in searchResults) {
      var result = searchResults[resultIndex];
      urlData += "&" + result.id;
    }

    window.location.href = "../searchResults.html?" + urlData;
  });

  document.getElementById('searchUsersButton').addEventListener('click', function(event) {

    event.preventDefault();

    var input = document.getElementById('searchInput').value;
    var options = {shouldSort: true, keys: [{name: 'addr', weight: 0.1},
                                            {name: 'firstName', weight: 0.45},
                                            {name: 'lastName', weight: 0.45}]}

    var searchResults = search(input, users, options);

    var urlData = "";
    for (var resultIndex in searchResults) {
      var result = searchResults[resultIndex];
      urlData += "&" + result.addr;
    }

    window.location.href = "../searchResults.html?" + urlData;
  })
};
