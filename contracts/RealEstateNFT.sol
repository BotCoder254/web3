// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RealEstateNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Property {
        string location;
        uint256 price;
        bool isForSale;
        address owner;
    }

    mapping(uint256 => Property) public properties;

    event PropertyMinted(uint256 indexed tokenId, string location, uint256 price);
    event PropertyListedForSale(uint256 indexed tokenId, uint256 price);
    event PropertySold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);

    constructor() ERC721("Real Estate NFT", "RENFT") {}

    function mintProperty(
        address to,
        string memory location,
        uint256 price,
        string memory tokenURI
    ) external onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        properties[newTokenId] = Property({
            location: location,
            price: price,
            isForSale: false,
            owner: to
        });

        emit PropertyMinted(newTokenId, location, price);
        return newTokenId;
    }

    function listPropertyForSale(uint256 tokenId, uint256 price) external {
        require(_exists(tokenId), "Property does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than 0");

        properties[tokenId].isForSale = true;
        properties[tokenId].price = price;

        emit PropertyListedForSale(tokenId, price);
    }

    function buyProperty(uint256 tokenId) external payable {
        require(_exists(tokenId), "Property does not exist");
        require(properties[tokenId].isForSale, "Property not for sale");
        require(msg.value >= properties[tokenId].price, "Insufficient payment");
        require(msg.sender != ownerOf(tokenId), "Already the owner");

        address seller = ownerOf(tokenId);
        uint256 price = properties[tokenId].price;

        properties[tokenId].isForSale = false;
        properties[tokenId].owner = msg.sender;

        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(price);

        // Return excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        emit PropertySold(tokenId, seller, msg.sender, price);
    }

    function getProperty(uint256 tokenId) external view returns (
        string memory location,
        uint256 price,
        bool isForSale,
        address owner
    ) {
        require(_exists(tokenId), "Property does not exist");
        Property memory property = properties[tokenId];
        return (
            property.location,
            property.price,
            property.isForSale,
            property.owner
        );
    }

    function cancelListing(uint256 tokenId) external {
        require(_exists(tokenId), "Property does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(properties[tokenId].isForSale, "Property not listed for sale");

        properties[tokenId].isForSale = false;
        emit PropertyListedForSale(tokenId, 0);
    }
} 