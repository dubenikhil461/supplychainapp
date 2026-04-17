// filename: contracts/SupplyChain.sol
// purpose: Smart contract for blockchain-based product tracking.
// setup notes: Compile with Solidity 0.8.20 using Hardhat.
pragma solidity ^0.8.20;

contract SupplyChain {
    enum Role {
        None,
        Manufacturer,
        Distributor,
        Retailer
    }

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
    mapping(address => Role) public roles;
    address public admin;

    event ProductCreated(uint256 indexed id, string name, address indexed owner);
    event RoleAssigned(address indexed addr, Role role);
    event StepAdded(
        uint256 indexed productId,
        string location,
        string status,
        address indexed updatedBy
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyRole(Role _role) {
        require(roles[msg.sender] == _role, "Caller does not have required role");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function assignRole(address _addr, Role _role) external onlyAdmin {
        roles[_addr] = _role;
        emit RoleAssigned(_addr, _role);
    }

    function createProduct(
        uint256 _id,
        string memory _name
    ) external onlyRole(Role.Manufacturer) {
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
        require(
            roles[msg.sender] == Role.Distributor ||
                roles[msg.sender] == Role.Retailer,
            "Caller must be Distributor or Retailer"
        );

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

    function getRole(address _addr) external view returns (Role) {
        return roles[_addr];
    }
}
