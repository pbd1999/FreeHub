pragma solidity ^0.4.18;

contract JobPost{
    struct Job {
        uint id;
        string title;
        string description;
        uint payment;
        address owner;
        address[] applicants;
        address worker;
        bool workCompleted; // Indicates if the work has been marked as complete
        bool isCompleted; // Indicates if the job has been marked as complete
    }

    uint totalJobs = 0;
    mapping (uint => Job) allJobs;
    address[] public posterAccounts;

    // Add a job to list of all jobs
    function addJob(string title, string desc, uint pay) public payable {
        var job = allJobs[totalJobs];
        require(pay == msg.value);

        job.id = totalJobs;
        job.title = title;
        job.description = desc;
        job.payment = msg.value;
        job.owner = msg.sender;
        job.applicants;
        job.worker;
        job.workCompleted = false;
        job.isCompleted = false;

        totalJobs += 1;

        posterAccounts.push(msg.sender);
    }

    // Returns a job
    function getJob(uint i) public constant returns(uint,string,string, uint, address) {
        return (allJobs[i].id, allJobs[i].title, allJobs[i].description, allJobs[i].payment, allJobs[i].owner);
    }

    // Returns the job count
    function getJobCount() public constant returns (uint){
        return totalJobs;
    }

    // Adds a non owner account as an applicant
    function applyToJob(uint i) public {
        var job = allJobs[i];
        if (job.owner != msg.sender) {
            job.applicants.push(msg.sender);
        }
    }

    // Returns the list of applicants
    function getApplicants(uint i) public constant returns(address[]){
        return allJobs[i].applicants;
    }

    // Allows the owner to assign a worker
    function setWorker(uint jobId, address candidate) public {
        var job = allJobs[jobId];
        if (job.owner == msg.sender) {
            job.worker = candidate;
        }
    }

    // Returns worker of a job
    function getWorker(uint jobId) public constant returns (address) {
        var job = allJobs[jobId];
        return job.worker;
    }

    // Returns the owner of the job
    function getOwner(uint jobId) public constant returns (address) {
        var job = allJobs[jobId];
        return job.owner;
    }

    // Allows the worker to complete the job
    function completeWork(uint jobId) {
        var job = allJobs[jobId];
        if (job.worker == msg.sender) {
          job.workCompleted = true;
        }
    }

    // Returns if the worker has marked the job as complete
    function isWorkComplete(uint jobId) public constant returns (bool){
        var job = allJobs[jobId];
        return job.workCompleted;
    }

    // Allows the owner to complete the job and make payment
    function completeJob(uint jobId) public {
        var job = allJobs[jobId];
        if (job.owner == msg.sender) {
          (job.worker).transfer(job.payment);
          job.isCompleted = true;
        }
    }

    // Returns if the job is completed
    function isComplete(uint jobId) public constant returns (bool){
        var job = allJobs[jobId];
        return job.isCompleted;
    }

    // Allows the owner to cancel the job
    function cancelJob(uint jobId) public {
        var job = allJobs[jobId];
        if (job.owner == msg.sender) {
          job.isCompleted = true;
          job.owner.transfer(job.payment);
        }

    }

}
