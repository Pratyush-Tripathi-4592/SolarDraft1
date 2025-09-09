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
    event ContractDeployed(uint256 indexed transactionId, address contractAddress);

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
        ElectricityTransaction storage txData = transactions[_transactionId];
        require(
            txData.status == TransactionStatus.Pending,
            "Transaction is not pending verification"
        );

        txData.governmentVerified = _approved;
        if (_approved) {
            txData.status = TransactionStatus.Approved;
        } else {
            txData.status = TransactionStatus.Rejected;
        }
        emit TransactionVerified(_transactionId, msg.sender, _approved);
    }

    // --- Buyer Functionality ---
    function completeTransaction(uint256 _transactionId) public payable {
        require(
            isBuyer[msg.sender],
            "Only registered buyers can complete transactions"
        );
        ElectricityTransaction storage txData = transactions[_transactionId];
        require(
            txData.buyer == msg.sender,
            "You are not the buyer for this transaction"
        );
        require(
            txData.status == TransactionStatus.Approved,
            "Transaction not approved by government"
        );
        require(msg.value == txData.amount * txData.price, "Incorrect payment amount");

        // Transfer electricity units from seller to buyer
        require(
            electricityToken.transferFrom(txData.seller, txData.buyer, txData.amount),
            "Electricity unit transfer failed"
        );

        // Transfer payment (Ether/Native currency) from buyer to seller
        payable(txData.seller).transfer(msg.value);

        txData.status = TransactionStatus.Completed;
        emit TransactionCompleted(_transactionId);
    }

    // Get transaction details
    function getTransaction(uint256 _transactionId) public view returns (
        address seller,
        address buyer,
        uint256 amount,
        uint256 price,
        TransactionStatus status,
        bool governmentVerified
    ) {
        ElectricityTransaction storage txData = transactions[_transactionId];
        return (
            txData.seller,
            txData.buyer,
            txData.amount,
            txData.price,
            txData.status,
            txData.governmentVerified
        );
    }

    // Get all transactions for a user
    function getUserTransactions(address user) public view returns (uint256[] memory) {
        uint256[] memory userTxs = new uint256[](nextTransactionId);
        uint256 count = 0;
        
        for (uint256 i = 0; i < nextTransactionId; i++) {
            if (transactions[i].seller == user || transactions[i].buyer == user) {
                userTxs[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userTxs[i];
        }
        
        return result;
    }

    // Fallback func to receive Ether
    receive() external payable {}
}
