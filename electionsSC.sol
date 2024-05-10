// SPDX-License-Identifier: MITs
pragma solidity ^0.8.0;

contract electionsSC{
  // An array to store strings items
  string[] public ids;

  uint[] public votes; //Candidate A -> 1, Candidate B -> 2, Candidate C ->3

  // Mapping to store candidate names and their vote counts
  mapping(string => uint) public eligibleVoters; //0 -> nao eligivel, 1-> eligivel, 2-> casted vote

  // Function to add a string to the list addItem
  function addId(string memory id) public {

    //CHECK IF ID IS ELEGIBLE && CHECK IF ID HAS VOTED
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
