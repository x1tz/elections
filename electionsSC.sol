// SPDX-License-Identifier: MITs
pragma solidity ^0.8.0;

contract electionsSC{
  // An array to store strings
  string[] public items;

  // Function to add a string to the list
  function addItem(string memory newItem) public {
    items.push(newItem);
  }

  // Function to get the length of the list
  function getListLength() public view returns (uint) {
    return items.length;
  }

  function getList() public view returns (string[] memory) {
    return items;
  }
}
