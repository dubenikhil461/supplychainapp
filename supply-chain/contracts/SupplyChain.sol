// filename: contracts/SupplyChain.sol
// purpose: Smart contract for blockchain-based product tracking.
// setup notes: Compile with Solidity 0.8.20 using Hardhat.
pragma solidity ^0.8.20;

contract SupplyChain {
    struct Product {
        uint256 id;
        string name;
        address currentOwner;
        bool isCreated;
    }

    struct Step {
        string location;
        string status;
        uint256 timestamp;
        address updatedBy;
    }

    mapping(uint256 => Product) public products;
    mapping(uint256 => Step[]) public productHistory;

    event ProductCreated(uint256 indexed id, string name, address indexed owner);
    event StepAdded(
        uint256 indexed productId,
        string location,
        string status,
        address indexed updatedBy
    );

    function createProduct(uint256 _id, string memory _name) external {
        require(!products[_id].isCreated, "Product already exists");

        products[_id] = Product({
            id: _id,
            name: _name,
            currentOwner: msg.sender,
            isCreated: true
        });

        productHistory[_id].push(
            Step({
                location: "Factory",
                status: "Created",
                timestamp: block.timestamp,
                updatedBy: msg.sender
            })
        );

        emit ProductCreated(_id, _name, msg.sender);
    }

    function addStep(
        uint256 _productId,
        string memory _location,
        string memory _status
    ) external {
        require(products[_productId].isCreated, "Product does not exist");

        productHistory[_productId].push(
            Step({
                location: _location,
                status: _status,
                timestamp: block.timestamp,
                updatedBy: msg.sender
            })
        );

        products[_productId].currentOwner = msg.sender;

        emit StepAdded(_productId, _location, _status, msg.sender);
    }

    function getProduct(uint256 _id) external view returns (Product memory) {
        require(products[_id].isCreated, "Product does not exist");
        return products[_id];
    }

    function getProductHistory(uint256 _id) external view returns (Step[] memory) {
        require(products[_id].isCreated, "Product does not exist");
        return productHistory[_id];
    }
}
