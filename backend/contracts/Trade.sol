// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract Trade {
    address public seller;
    address public buyer;
    uint256 public units;
    uint256 public price; // wei per unit or total depending on frontend
    bool public isSettled;

    event TradeDeployed(
        address indexed seller,
        address indexed buyer,
        uint256 units,
        uint256 price
    );
    event TradeSettled(address indexed buyer, uint256 value);

    constructor(
        address _seller,
        address _buyer,
        uint256 _units,
        uint256 _price
    ) payable {
        seller = _seller;
        buyer = _buyer;
        units = _units;
        price = _price;
        emit TradeDeployed(_seller, _buyer, _units, _price);
    }

    function settle() external payable {
        require(!isSettled, "Already settled");
        require(msg.sender == buyer, "Only buyer");
        require(msg.value >= price, "Insufficient payment");
        isSettled = true;
        (bool ok, ) = payable(seller).call{value: msg.value}("");
        require(ok, "Transfer failed");
        emit TradeSettled(msg.sender, msg.value);
    }
}
