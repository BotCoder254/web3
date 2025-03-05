// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract RealEstateToken is ERC20, Ownable, Pausable {
    struct Property {
        string propertyId;
        uint256 totalSupply;
        uint256 price;
        bool isActive;
        address propertyOwner;
    }

    mapping(string => Property) public properties;
    mapping(string => mapping(address => uint256)) public propertyBalances;

    event PropertyTokenized(
        string propertyId,
        uint256 totalSupply,
        uint256 price,
        address propertyOwner
    );
    event TokensPurchased(
        string propertyId,
        address buyer,
        uint256 amount,
        uint256 cost
    );

    constructor() ERC20("RealEstate Token", "REST") {}

    function tokenizeProperty(
        string memory _propertyId,
        uint256 _totalSupply,
        uint256 _price
    ) external onlyOwner {
        require(!properties[_propertyId].isActive, "Property already tokenized");
        require(_totalSupply > 0, "Total supply must be greater than 0");
        require(_price > 0, "Price must be greater than 0");

        properties[_propertyId] = Property({
            propertyId: _propertyId,
            totalSupply: _totalSupply,
            price: _price,
            isActive: true,
            propertyOwner: msg.sender
        });

        _mint(address(this), _totalSupply);

        emit PropertyTokenized(_propertyId, _totalSupply, _price, msg.sender);
    }

    function purchaseTokens(string memory _propertyId, uint256 _amount)
        external
        payable
        whenNotPaused
    {
        Property storage property = properties[_propertyId];
        require(property.isActive, "Property not found or inactive");
        require(_amount > 0, "Amount must be greater than 0");
        require(
            balanceOf(address(this)) >= _amount,
            "Not enough tokens available"
        );

        uint256 cost = _amount * property.price;
        require(msg.value >= cost, "Insufficient payment");

        _transfer(address(this), msg.sender, _amount);
        propertyBalances[_propertyId][msg.sender] += _amount;

        // Refund excess payment
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }

        emit TokensPurchased(_propertyId, msg.sender, _amount, cost);
    }

    function getPropertyTokenBalance(string memory _propertyId, address _owner)
        external
        view
        returns (uint256)
    {
        return propertyBalances[_propertyId][_owner];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
} 