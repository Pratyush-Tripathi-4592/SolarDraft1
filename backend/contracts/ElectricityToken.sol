// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ElectricityToken is ERC20, Ownable(msg.sender) {
    // Mapping to store electricity unit details (e.g., metadata, generation source)
    // For simplicity, we'll just use a basic ERC20 token representing units.
    // For unique units, consider ERC-721 or ERC-1155.

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        // Mint initial tokens or allow only specific entities to mint
    }

    // Function to allow a government entity to mint new electricity tokens (e.g., representing generated units)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Function to allow a seller to transfer electricity units to a buyer
    function transferUnits(
        address _from,
        address _to,
        uint256 _amount
    ) public returns (bool) {
        // Additional logic can be added here, e.g., checking if _from is a registered seller
        require(balanceOf(_from) >= _amount, "Insufficient balance");
        _transfer(_from, _to, _amount);
        return true;
    }
}
