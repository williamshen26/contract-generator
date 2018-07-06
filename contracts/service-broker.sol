pragma solidity ^0.4.18;

// ----------------------------------------------------------------------------
// Transaction broker for ewallet service accounts
//
//
// Enjoy.
//
// (c) by William Shen STECH Solutions LTD. Canada 2018. The MIT Licence.
// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------
// Owned contract
// ----------------------------------------------------------------------------
contract Owned {
    address public owner;
    address public newOwner;

    event OwnershipTransferred(address indexed _from, address indexed _to);

    function Owned() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        newOwner = _newOwner;
    }
    function acceptOwnership() public {
        require(msg.sender == newOwner);
        OwnershipTransferred(owner, newOwner);
        owner = newOwner;
        newOwner = address(0);
    }
}


// ----------------------------------------------------------------------------
// ERC20 Token, with the addition of symbol, name and decimals and assisted
// token transfers
// ----------------------------------------------------------------------------
contract Broker is Owned {
    mapping(address => mapping(address => uint)) allowed;

    address[] public serviceAddress;


    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------
    function Broker() public {

    }

    function addService(address service) public onlyOwner returns (bool success) {
        serviceAddress.push(service);
        emit AddService(service);
        return true;
    }

    function removeService(address service) public onlyOwner returns (bool success) {
        for (uint i = 0; i<serviceAddress.length-1; i++){
            if (serviceAddress[i] == service) {
                emit RemoveService(service);
                return removeAtIndex(i);
            }
        }
        return false;
    }

    function removeAtIndex(uint index) private onlyOwner returns (bool success) {
        if (index >= serviceAddress.length) return false;

        for (uint i = index; i<serviceAddress.length-1; i++){
            serviceAddress[i] = serviceAddress[i+1];
        }
        delete serviceAddress[serviceAddress.length-1];
        serviceAddress.length--;
        return true;
    }


    // ------------------------------------------------------------------------
    // Returns the list of service addresses
    // ------------------------------------------------------------------------
    function serviceAddress() public constant returns (address[] services) {
        return serviceAddress;
    }

    // ------------------------------------------------------------------------
    // Accept ETH and distribute them to service addresses
    // deposit to a service address if the balance is less than 0.1 eth
    // ------------------------------------------------------------------------
    function () public payable {
        for (uint i = 0; i<serviceAddress.length; i++){
            if (serviceAddress[i].balance < 100000000000000000) {
                if (address(this).balance > 110000000000000000) {
                    serviceAddress[i].transfer(100000000000000000);
                }
            }
        }

        emit Receive(msg.sender, msg.value);
    }

    function distributeValue() public onlyOwner {
        for (uint i = 0; i<serviceAddress.length; i++){
            if (serviceAddress[i].balance < 100000000000000000) {
                if (address(this).balance > 110000000000000000) {
                    serviceAddress[i].transfer(100000000000000000);
                }
            }
        }
    }


    // ------------------------------------------------------------------------
    // Owner can transfer out any eth
    // ------------------------------------------------------------------------
    function transferEth(address tokenAddress, uint value) public onlyOwner returns (bool success) {
        require(address(this).balance > value);
        return tokenAddress.send(value);
    }

    function suicide() public onlyOwner returns (bool success) {
        selfdestruct(owner);
        return true;
    }

    event Receive(address indexed from, uint value);
    event AddService(address indexed service);
    event RemoveService(address indexed service);
}