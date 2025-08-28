// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ElectricityToken.sol"; // Assuming ElectricityToken is in the same directory

contract TransactionManager is Ownable(msg.sender) {
    ElectricityToken public electricityToken;

    // Enum for transaction status
    enum TransactionStatus {
        Pending,
        Approved,
        Rejected,
        Completed
    }

    // Struct to store transaction details
    struct ElectricityTransaction {
        address seller;
        address buyer;
        uint256 amount; // Amount of electricity units
        uint256 price; // Price per unit (e.g., in Wei or a stablecoin)
        uint256 timestamp;
        TransactionStatus status;
        bool governmentVerified;
    }

    // Mapping to store all transactions by a unique ID
    mapping(uint256 => ElectricityTransaction) public transactions;
    uint256 public nextTransactionId;

    // Role-based access control (simplified for example)
    mapping(address => bool) public isSeller;
    mapping(address => bool) public isBuyer;
    address public governmentVerifier; // Address of the government entity

    event TransactionProposed(
        uint256 indexed transactionId,
        address indexed seller,
        address indexed buyer,
        uint256 amount,
        uint256 price
    );
    event TransactionVerified(
        uint256 indexed transactionId,
        address indexed verifier,
        bool approved
    );
    event TransactionCompleted(uint256 indexed transactionId);

    constructor(address _electricityTokenAddress) {
        electricityToken = ElectricityToken(_electricityTokenAddress);
        governmentVerifier = msg.sender; // Owner is initially the government verifier
    }

    // --- Role Management (Owner can set roles) ---
    function setSeller(address _seller, bool _status) public onlyOwner {
        isSeller[_seller] = _status;
    }

    function setBuyer(address _buyer, bool _status) public onlyOwner {
        isBuyer[_buyer] = _status;
    }

    function setGovernmentVerifier(address _newVerifier) public onlyOwner {
        governmentVerifier = _newVerifier;
    }

    // --- Seller Functionality ---
    function proposeTransaction(
        address _buyer,
        uint256 _amount,
        uint256 _price
    ) public returns (uint256) {
        require(isSeller[msg.sender], "Only sellers can propose transactions");
        require(isBuyer[_buyer], "Buyer is not registered");
        require(
            electricityToken.balanceOf(msg.sender) >= _amount,
            "Seller has insufficient electricity units"
        );

        uint256 transactionId = nextTransactionId++;
        transactions[transactionId] = ElectricityTransaction({
            seller: msg.sender,
            buyer: _buyer,
            amount: _amount,
            price: _price,
            timestamp: block.timestamp,
            status: TransactionStatus.Pending,
            governmentVerified: false
        });

        emit TransactionProposed(
            transactionId,
            msg.sender,
            _buyer,
            _amount,
            _price
        );
        return transactionId;
    }

    // --- Government Functionality ---
    function verifyPayment(uint256 _transactionId, bool _approved) public {
        require(
            msg.sender == governmentVerifier,
            "Only the government verifier can verify payments"
        );
        ElectricityTransaction storage tx = transactions[_transactionId];
        require(
            tx.status == TransactionStatus.Pending,
            "Transaction is not pending verification"
        );

        tx.governmentVerified = _approved;
        if (_approved) {
            tx.status = TransactionStatus.Approved;
        } else {
            tx.status = TransactionStatus.Rejected;
        }
        emit TransactionVerified(_transactionId, msg.sender, _approved);
    }

    // --- Buyer Functionality ---
    function completeTransaction(uint256 _transactionId) public payable {
        require(
            isBuyer[msg.sender],
            "Only registered buyers can complete transactions"
        );
        ElectricityTransaction storage tx = transactions[_transactionId];
        require(
            tx.buyer == msg.sender,
            "You are not the buyer for this transaction"
        );
        require(
            tx.status == TransactionStatus.Approved,
            "Transaction not approved by government"
        );
        require(msg.value == tx.amount * tx.price, "Incorrect payment amount");

        // Transfer electricity units from seller to buyer
        require(
            electricityToken.transferFrom(tx.seller, tx.buyer, tx.amount),
            "Electricity unit transfer failed"
        );

        // Transfer payment (Ether/Native currency) from buyer to seller
        payable(tx.seller).transfer(msg.value);

        tx.status = TransactionStatus.Completed;
        emit TransactionCompleted(_transactionId);
    }

    // Fallback func to receive Ether
    receive() external payable {}
}
