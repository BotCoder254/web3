// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RealEstateNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct PropertyMetadata {
        string propertyId;
        uint256 price;
        bool isForSale;
        address propertyOwner;
    }

    mapping(uint256 => PropertyMetadata) public properties;
    mapping(string => uint256) public propertyToTokenId;

    event PropertyMinted(
        uint256 tokenId,
        string propertyId,
        uint256 price,
        address owner
    );
    event PropertySold(
        uint256 tokenId,
        string propertyId,
        address from,
        address to,
        uint256 price
    );

    constructor() ERC721("RealEstate NFT", "RENFT") {}

    function mintProperty(
        string memory _propertyId,
        string memory _tokenURI,
        uint256 _price
    ) external onlyOwner returns (uint256) {
        require(propertyToTokenId[_propertyId] == 0, "Property already minted");
        require(_price > 0, "Price must be greater than 0");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        properties[newTokenId] = PropertyMetadata({
            propertyId: _propertyId,
            price: _price,
            isForSale: true,
            propertyOwner: msg.sender
        });

        propertyToTokenId[_propertyId] = newTokenId;

        emit PropertyMinted(newTokenId, _propertyId, _price, msg.sender);

        return newTokenId;
    }

    function purchaseProperty(uint256 _tokenId) external payable {
        PropertyMetadata storage property = properties[_tokenId];
        require(_exists(_tokenId), "Property does not exist");
        require(property.isForSale, "Property not for sale");
        require(msg.value >= property.price, "Insufficient payment");

        address seller = ownerOf(_tokenId);
        
        // Transfer ownership
        _transfer(seller, msg.sender, _tokenId);
        property.propertyOwner = msg.sender;
        property.isForSale = false;

        // Transfer payment to seller
        payable(seller).transfer(msg.value);

        emit PropertySold(
            _tokenId,
            property.propertyId,
            seller,
            msg.sender,
            property.price
        );
    }

    function setPropertyForSale(uint256 _tokenId, uint256 _price) external {
        require(_exists(_tokenId), "Property does not exist");
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(_price > 0, "Price must be greater than 0");

        properties[_tokenId].isForSale = true;
        properties[_tokenId].price = _price;
    }

    function getPropertyMetadata(uint256 _tokenId)
        external
        view
        returns (PropertyMetadata memory)
    {
        require(_exists(_tokenId), "Property does not exist");
        return properties[_tokenId];
    }
} 