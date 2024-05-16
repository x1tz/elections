// SPDX-License-Identifier: MITs
pragma solidity ^0.8.0;

contract electionsSC{
  // An array to store strings items
  string[] public ids;

  uint[] public votes; //Candidate A -> 1, Candidate B -> 2, Candidate C ->3

  // Mapping to store candidate names and their vote counts
  mapping(string => uint) public eligibleVoters; //0 -> nao eligivel, 1-> eligivel, 2-> added to blockchain

  //TODO: Adicionar lista de elegible voters ao eligibleVoters hahsmap

  // Initialize mapping with eligible voters list
  // WARNING: Only execute 1 time at start of system
  function initializeVotersList(string[] memory keys) public{
    for(uint i=0; i < keys.length; i++){
        eligibleVoters[keys[i]] = 1;
    }
  }

  // Function to check the id
  function checkId(string memory id) public view returns (uint) {
    return eligibleVoters[id];
  }
 
  // Function to add an id to list
  function addId(string memory id) public {
    if(eligibleVoters[id] == 1){
        ids.push(id); //list
        eligibleVoters[id] = 2; //map
    }
  }

  // Function to add a vote the list
  function addVote(uint vote) public {
    votes.push(vote);
  }


  // Function to get the length of the list getListLength
  function getIdsLength() public view returns (uint) {
    return ids.length;
  }

  function getVotesLength() public view returns (uint) {
    return votes.length;
  }

  // Function to get List of Ids
  function getIdsList() public view returns (string[] memory) {
    return ids;
  }

  // Function to get List of Votes
  function getVotesList() public view returns (uint[] memory) {
    return votes;
  }
}
