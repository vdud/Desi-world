// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is Ownable {
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    IERC20 public currency;
    IERC721 public nft;

    mapping(uint256 => Listing) public listings;

    event ItemListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event ItemSold(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event ItemCanceled(uint256 indexed tokenId);

    constructor(address _currency, address _nft) Ownable(msg.sender) {
        currency = IERC20(_currency);
        nft = IERC721(_nft);
    }

    function list(uint256 tokenId, uint256 price) external {
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");
        require(nft.isApprovedForAll(msg.sender, address(this)) || nft.getApproved(tokenId) == address(this), "Not approved");

        listings[tokenId] = Listing(msg.sender, price, true);
        emit ItemListed(tokenId, msg.sender, price);
    }

    function buy(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(listing.active, "Not listed");
        require(currency.balanceOf(msg.sender) >= listing.price, "Insufficient balance");
        
        // Transfer currency
        currency.transferFrom(msg.sender, listing.seller, listing.price);
        
        // Transfer NFT
        nft.transferFrom(listing.seller, msg.sender, tokenId);
        
        delete listings[tokenId];
        emit ItemSold(tokenId, msg.sender, listing.price);
    }

    function cancel(uint256 tokenId) external {
        require(listings[tokenId].seller == msg.sender, "Not seller");
        delete listings[tokenId];
        emit ItemCanceled(tokenId);
    }
}
