// SPDX-License-Identifier: MITs
pragma solidity ^0.8.0;

contract electionsSC{

  address public owner;

  // An array to store strings items
  string[] private ids;

  uint[] private votes; //Candidate A -> 1, Candidate B -> 2, Candidate C ->3

  // Mapping to store candidate names and their vote counts
  mapping(string => uint) private eligibleVoters; //0 -> nao eligivel, 1-> eligivel, 2-> added to blockchain

  //Status for the 3 phases of the voting process
  enum Status {
    Init,
    Voting,
    Counting
  }

  Status public currentStatus;

  constructor() {
    owner = msg.sender;
    currentStatus = Status.Init; //Set initial status
  }
  //Modifiers for Owner and Status
  modifier onlyOwner() {
    require(msg.sender == owner, "electionsSC: caller is not the owner");
    _;
  }
  modifier onlyInit() {
    require(currentStatus == Status.Init, "Function can only be called when Init");
    _; // Placeholder for function body
  }
  modifier onlyVoting() {
    require(currentStatus == Status.Voting, "Function can only be called when Voting");
    _; // Placeholder for function body
  }
  modifier onlyCounting() {
    require(currentStatus == Status.Counting, "Function can only be called when Couting");
    _; // Placeholder for function body
  }

//Functions to change currentStatus(Logic: Init -> Voting -> Counting)
  function statusVoting() public returns (Status){
    require(currentStatus == Status.Init,"Contract isn't in Init status");
    currentStatus = Status.Voting;
    return currentStatus;
  }
  function statusCounting() public returns (Status){
    require(currentStatus == Status.Voting,"Contract isn't in Voting status");
    currentStatus = Status.Counting;
    return currentStatus;
  }

  // Initialize mapping with eligible voters list
  function initializeVotersList(string[] memory keys) public onlyInit {
    for(uint i=0; i < keys.length; i++){
        eligibleVoters[keys[i]] = 1;
    }
  }

  // Function to check the id
  function checkId(string memory id) public view onlyVoting returns (uint) {
    return eligibleVoters[id];
  }
 
  // Function to add an id to list
  function addId(string memory id) public onlyVoting returns (bool){
    require(eligibleVoters[id] == 1,"The user is not eligible to vote (already voted or isn't eligible)");
    ids.push(id); //list
    eligibleVoters[id] = 2; //map
    return true; //-> se return true nao e necessario checkID
  }

  // Function to add a vote the list
  function addVote(uint vote) public onlyVoting {
    votes.push(vote);
  }

  function getCurrentStatus() public view returns (Status) {
    return currentStatus;
  }

  // Function to get the length of the list getListLength
  function getIdsLength() public view returns (uint) {
    return ids.length;
  }

  function getVotesLength() public view returns (uint) {
    return votes.length;
  }

  // Function to get List of Ids
  function getIdsList() public view onlyCounting returns (string[] memory) {
    return ids;
  }

  // Function to get List of Votes
  function getVotesList() public view onlyCounting returns (uint[] memory) {
    return votes;
  }
}
