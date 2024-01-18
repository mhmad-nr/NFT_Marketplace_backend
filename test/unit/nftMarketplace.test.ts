import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { deployments, ethers, getNamedAccounts } from "hardhat"
import { NftMarketplace } from "../../typechain-types"
describe("NftMarketplace", () => {
    let NftMarketplace: NftMarketplace
    let NftContractAddress: string
    let TOKEN_OWNER: string
    let TOKEN_NOT_OWNER: HardhatEthersSigner
    const EXPECTED_PRICE = ethers.parseEther("1")
    const EXPECTED_PRICE_NEW = ethers.parseEther("11")
    const NOT_EXPECTED_PRICE = 0
    const TOKEN_APPROVED = 0
    const TOKEN_NOT_APPROVED = 1

    beforeEach(async () => {


        TOKEN_OWNER = (await getNamedAccounts()).deployer;
        TOKEN_NOT_OWNER = (await ethers.getSigners())[2]
        
        await deployments.fixture(["all"])


        // deploy  NFT Marketplace contract
        const nftMarketplace = await deployments.get("NftMarketplace");
        NftMarketplace = await (ethers as any).getContractAt(
            nftMarketplace.abi,
            nftMarketplace.address
        )

        // deploy  NFT contract
        const nft = await deployments.get("NFT");
        NftContractAddress = nft.address
        const NftContract = await (ethers as any).getContractAt(
            nft.abi,
            nft.address
        )

        // mint  NFTs
        await NftContract.mintNft()
        await NftContract.approve(nftMarketplace.address, TOKEN_APPROVED)
        await NftContract.mintNft()

    });
    const BuyItem = async () => {
        await NftMarketplace.listNFT(NftContractAddress, TOKEN_APPROVED, EXPECTED_PRICE)

        await NftMarketplace.connect(TOKEN_NOT_OWNER).buyItem(NftContractAddress, TOKEN_APPROVED, { value: EXPECTED_PRICE })

    }
    describe("function 'listNFT'", () => {
        it("must reverted if sender is not owner of nft with 'NftMarketplace__SenderIsNotTheOwner'", async () => {
            console.log("sadasd");

            await expect(
                NftMarketplace.connect(TOKEN_NOT_OWNER).listNFT(NftContractAddress, TOKEN_APPROVED, EXPECTED_PRICE)
            ).to.be.revertedWithCustomError(NftMarketplace, "NftMarketplace__SenderIsNotTheOwner")
        })
        it("must reverted if token pirce is equal to zero or less than zero with 'NftMarketplace__PriceMustBeMoreThenZero'", async () => {
            await expect(
                NftMarketplace.listNFT(NftContractAddress, TOKEN_APPROVED, NOT_EXPECTED_PRICE)
            ).to.be.revertedWithCustomError(NftMarketplace, "NftMarketplace__PriceMustBeMoreThenZero")
        })

        it("must reverted if token does not approved with 'NftMarketplace__TokenDoesNotApproved'", async () => {
            await expect(
                NftMarketplace.listNFT(NftContractAddress, TOKEN_NOT_APPROVED, EXPECTED_PRICE)
            ).to.be.revertedWithCustomError(NftMarketplace, "NftMarketplace__TokenDoesNotApproved")
        })

        it("must reverted if token is aleady listed with 'NftMarketplace__TokenAlreadyListed'", async () => {
            await NftMarketplace.listNFT(NftContractAddress, TOKEN_APPROVED, EXPECTED_PRICE)
            await expect(
                NftMarketplace.listNFT(NftContractAddress, TOKEN_APPROVED, EXPECTED_PRICE)
            ).to.be.revertedWithCustomError(NftMarketplace, "NftMarketplace__TokenAlreadyListed")
        })
        it("must emit an event 'tokenListed'", async () => {
            await expect(
                NftMarketplace.listNFT(NftContractAddress, TOKEN_APPROVED, EXPECTED_PRICE)
            ).to.be.emit(NftMarketplace, "tokenListed").withArgs(NftContractAddress, TOKEN_OWNER, TOKEN_APPROVED, EXPECTED_PRICE)
        })
    })

    describe("function 'buyItem'", () => {

        it("must reverted if token does not aleady listed with 'NftMarketplace__IsNotListed'", async () => {
            // await NftMarketplace.connect(TOKEN_OWNER).buyItem(NftContractAddress, TOKEN_APPROVED)
            await expect(
                NftMarketplace.connect(TOKEN_NOT_OWNER).buyItem(NftContractAddress, TOKEN_APPROVED)
            ).to.be.revertedWithCustomError(NftMarketplace, "NftMarketplace__IsNotListed")
        })

        it("must reverted if eth value is not enough with 'NftMarketplace__EthAmmountIsNotEnough'", async () => {
            await NftMarketplace.listNFT(NftContractAddress, TOKEN_APPROVED, EXPECTED_PRICE)
            await expect(
                NftMarketplace.connect(TOKEN_NOT_OWNER).buyItem(NftContractAddress, TOKEN_APPROVED)
            ).to.be.revertedWithCustomError(NftMarketplace, "NftMarketplace__EthAmmountIsNotEnough")
        })

        it("must emit an event 'ItemBought'", async () => {
            await NftMarketplace.listNFT(NftContractAddress, TOKEN_APPROVED, EXPECTED_PRICE)
            await expect(
                NftMarketplace.connect(TOKEN_NOT_OWNER).buyItem(NftContractAddress, TOKEN_APPROVED, { value: EXPECTED_PRICE })
            ).to.be.emit(NftMarketplace, "ItemBought").withArgs(TOKEN_NOT_OWNER.address, NftContractAddress, TOKEN_APPROVED, EXPECTED_PRICE)
        })

    })
    describe("function 'cancelItem'", () => {

        it("must reverted if sender is not owner of nft with 'NftMarketplace__SenderIsNotTheOwner'", async () => {

            await NftMarketplace.listNFT(NftContractAddress, TOKEN_APPROVED, EXPECTED_PRICE)

            await expect(
                NftMarketplace.connect(TOKEN_NOT_OWNER).cancelItem(NftContractAddress, TOKEN_APPROVED)
            ).to.be.revertedWithCustomError(NftMarketplace, "NftMarketplace__SenderIsNotTheOwner")
        })

        it("must reverted if token does not aleady listed with 'NftMarketplace__IsNotListed'", async () => {
            await expect(
                NftMarketplace.cancelItem(NftContractAddress, TOKEN_APPROVED)
            ).to.be.revertedWithCustomError(NftMarketplace, "NftMarketplace__IsNotListed")
        })


        it("must emit an event 'ItemBought'", async () => {
            await NftMarketplace.listNFT(NftContractAddress, TOKEN_APPROVED, EXPECTED_PRICE)
            await expect(
                NftMarketplace.cancelItem(NftContractAddress, TOKEN_APPROVED)
            ).to.be.emit(NftMarketplace, "ItemCancelled").withArgs(NftContractAddress, TOKEN_APPROVED)
        })

    })
    describe("function 'updateItem'", () => {

        it("must reverted if sender is not owner of nft with 'NftMarketplace__SenderIsNotTheOwner'", async () => {

            await NftMarketplace.listNFT(NftContractAddress, TOKEN_APPROVED, EXPECTED_PRICE)

            await expect(
                NftMarketplace.connect(TOKEN_NOT_OWNER).updateItem(NftContractAddress, TOKEN_APPROVED, EXPECTED_PRICE_NEW)
            ).to.be.revertedWithCustomError(NftMarketplace, "NftMarketplace__SenderIsNotTheOwner")
        })

        it("must reverted if token does not aleady listed with 'NftMarketplace__IsNotListed'", async () => {
            await expect(
                NftMarketplace.updateItem(NftContractAddress, TOKEN_APPROVED, EXPECTED_PRICE_NEW)
            ).to.be.revertedWithCustomError(NftMarketplace, "NftMarketplace__IsNotListed")
        })


        it("must emit an event 'tokenListed'", async () => {
            await NftMarketplace.listNFT(NftContractAddress, TOKEN_APPROVED, EXPECTED_PRICE)
            await expect(
                NftMarketplace.updateItem(NftContractAddress, TOKEN_APPROVED, EXPECTED_PRICE_NEW)
            ).to.be.emit(NftMarketplace, "tokenListed").withArgs(NftContractAddress, TOKEN_OWNER, TOKEN_APPROVED, EXPECTED_PRICE_NEW)
        })

    })

    describe("function 'withdrawProceeds'", () => {

        it("must reverted if proceeds is zero with 'NftMarketplaces__ProceedsIsZero'", async () => {
            await expect(
                NftMarketplace.withdrawProceeds()
            ).to.be.revertedWithCustomError(NftMarketplace, "NftMarketplaces__ProceedsIsZero")
        })
        it("must proceeds change Correctly", async () => {
            await BuyItem()

            await NftMarketplace.withdrawProceeds()
            const proceeds = await NftMarketplace.getProceeds(TOKEN_OWNER)

            assert.equal(proceeds, ethers.parseEther("0"))
        })
    })

    describe("function 'getListing'", () => {

        it("should return correct listing", async () => {

            await NftMarketplace.listNFT(NftContractAddress, TOKEN_APPROVED, EXPECTED_PRICE)
            const res = await NftMarketplace.getListing(NftContractAddress, TOKEN_APPROVED)

            assert.equal(res[0], EXPECTED_PRICE)
            assert.equal(res[1], TOKEN_OWNER)
        })
    })

    describe("function 'getProceeds'", () => {

        it("should return correct proceeds", async () => {

            await BuyItem()

            const proceeds = await NftMarketplace.getProceeds(TOKEN_OWNER)
            expect(proceeds).to.be.equal(EXPECTED_PRICE)
        })
    })

})