//SPDX-License-Identifier:MIT
pragma solidity 0.8.8;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
contract fundMe{
    uint256 public constant minimumUsd=50*1e18;
    address[] public funders;
    mapping(address=>uint256) public addressToAmountFunded;
    address public immutable owner;
    AggregatorV3Interface public priceFeed;
    using PriceConverter for uint256;
    constructor(address priceFeedAddress){
        owner=msg.sender;
        priceFeed=AggregatorV3Interface(priceFeedAddress);
    }
    function fund() public payable{
         require(msg.value.getConversionRate(priceFeed)>minimumUsd,"Didn't send enough");
         funders.push(msg.sender);
         addressToAmountFunded[msg.sender]=msg.value;
    }
    
   
    function withdraw() public onlyOwner {
        for(uint256 fundIndex=0;fundIndex<funders.length;fundIndex++){
            address funder=funders[fundIndex];
            addressToAmountFunded[funder]=0;
        }
        funders= new address[](0);
        (bool callSuccess,)=payable(msg.sender).call{value:address(this).balance}("");
        require(callSuccess,"Call failed");
    }
    modifier onlyOwner{
        require(msg.sender==owner,"Sender is not owner");
        _;
    }
    receive() external payable{
        fund();
    }
    fallback() external payable{
        fund();
    }
}