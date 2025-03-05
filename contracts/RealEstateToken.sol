// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RealEstateToken is ERC20, Ownable {
    mapping(uint256 => uint256) public propertyToSupply;
    mapping(uint256 => uint256) public propertyToPrice;
    mapping(uint256 => bool) public propertyExists;

    event PropertyTokenized(uint256 indexed propertyId, uint256 supply, uint256 pricePerToken);
    event TokensPurchased(address indexed buyer, uint256 indexed propertyId, uint256 amount);

    constructor() ERC20("Real Estate Token", "RET") {}

    function tokenizeProperty(
        uint256 propertyId,
        uint256 supply,
        uint256 pricePerToken
    ) external onlyOwner {
        require(!propertyExists[propertyId], "Property already tokenized");
        require(supply > 0, "Supply must be greater than 0");
        require(pricePerToken > 0, "Price must be greater than 0");

        propertyToSupply[propertyId] = supply;
        propertyToPrice[propertyId] = pricePerToken;
        propertyExists[propertyId] = true;

        _mint(address(this), supply);
        emit PropertyTokenized(propertyId, supply, pricePerToken);
    }

    function purchaseTokens(uint256 propertyId, uint256 amount) external payable {
        require(propertyExists[propertyId], "Property does not exist");
        require(amount > 0, "Amount must be greater than 0");
        require(
            balanceOf(address(this)) >= amount,
            "Not enough tokens available"
        );

        uint256 totalPrice = amount * propertyToPrice[propertyId];
        require(msg.value >= totalPrice, "Insufficient payment");

        _transfer(address(this), msg.sender, amount);
        
        // Return excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        emit TokensPurchased(msg.sender, propertyId, amount);
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    function getPropertyDetails(uint256 propertyId) external view returns (
        bool exists,
        uint256 supply,
        uint256 pricePerToken,
        uint256 availableTokens
    ) {
        return (
            propertyExists[propertyId],
            propertyToSupply[propertyId],
            propertyToPrice[propertyId],
            balanceOf(address(this))
        );
    }
} 