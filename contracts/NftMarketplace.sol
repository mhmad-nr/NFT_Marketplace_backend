// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "hardhat/console.sol";
error NftMarketplace__PriceMustBeMoreThenZero();
error NftMarketplace__TokenDoesNotApproved(
    address contractAddress,
    uint256 tokenId
);
error NftMarketplace__TokenAlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__SenderIsNotTheOwner();
error NftMarketplace__IsNotListed(address nftAddress, uint256 tokenId);
error NftMarketplace__EthAmmountIsNotEnough(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);
error NftMarketplaces__ProceedsIsZero();
error NftMarketplace__TransferFailed();

contract NftMarketplace {
    ////////////////
    ////events /////
    ////////////////

    event tokenListed(
        address indexed nftAddress,
        address indexed seller,
        uint256 indexed tokenId,
        uint256 price
    );
    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    event ItemCancelled(address indexed buyer, uint256 indexed tokenId);

    struct Listing {
        uint256 price;
        address seller;
    }
    ////////////////
    ///variables ///
    ////////////////

    mapping(address => mapping(uint256 => Listing)) s_tokenListing;
    mapping(address => uint256) private s_proceeds;

    ////////////////
    ///modifier ////
    ////////////////
    modifier alreadyListed(address nftAddress, uint256 tokenId) {
        Listing memory newListing = s_tokenListing[nftAddress][tokenId];
        if (newListing.price > 0) {
            revert NftMarketplace__TokenAlreadyListed(nftAddress, tokenId);
        }
        _;
    }
    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (owner != spender) {
            revert NftMarketplace__SenderIsNotTheOwner();
        }
        _;
    }

    modifier notListed(address nftAddress, uint256 tokenId) {
        Listing memory newListing = s_tokenListing[nftAddress][tokenId];
        if (newListing.price <= 0) {
            revert NftMarketplace__IsNotListed(nftAddress, tokenId);
        }
        _;
    }

    ////////////////
    ///functions ///
    ////////////////

    function listNFT(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        isOwner(nftAddress, tokenId, msg.sender)
        alreadyListed(nftAddress, tokenId)
    {
        if (price <= 0) {
            revert NftMarketplace__PriceMustBeMoreThenZero();
        }
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketplace__TokenDoesNotApproved(nftAddress, tokenId);
        }
        s_tokenListing[nftAddress][tokenId] = Listing(price, msg.sender);
        emit tokenListed(nftAddress, msg.sender, tokenId, price);
    }

    function buyItem(
        address nftAddress,
        uint256 tokenId
    ) external payable notListed(nftAddress, tokenId) {
        Listing memory item = s_tokenListing[nftAddress][tokenId];
        if (msg.value < item.price) {
            revert NftMarketplace__EthAmmountIsNotEnough(
                nftAddress,
                tokenId,
                item.price
            );
        }

        s_proceeds[item.seller] += msg.value;
        delete (s_tokenListing[nftAddress][tokenId]);

        IERC721(nftAddress).safeTransferFrom(item.seller, msg.sender, tokenId);

        emit ItemBought(msg.sender, nftAddress, tokenId, item.price);
    }

    function cancelItem(
        address nftAddress,
        uint256 tokenId
    )
        external
        notListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        delete (s_tokenListing[nftAddress][tokenId]);
        emit ItemCancelled(nftAddress, tokenId);
    }

    function updateItem(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        notListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        s_tokenListing[nftAddress][tokenId].price = newPrice;
        emit tokenListed(nftAddress, msg.sender, tokenId, newPrice);
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NftMarketplaces__ProceedsIsZero();
        }
        s_proceeds[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert NftMarketplace__TransferFailed();
        }
    }

    ////////////////
    ///get funs ////
    ////////////////
    function getListing(
        address nftAddress,
        uint256 tokenId
    ) public view returns (Listing memory) {


        return s_tokenListing[nftAddress][tokenId];
    }

    function getProceeds(address account) public view returns (uint256) {
        return s_proceeds[account];
    }
}
