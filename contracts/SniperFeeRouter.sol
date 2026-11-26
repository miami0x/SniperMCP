// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IUniswapV2Router {
    function WETH() external pure returns (address);
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;
}

contract SniperFeeRouter {
    address public owner;
    address public feeRecipient;
    uint256 public feeBps = 50; // 0.50%
    uint256 public constant MAX_FEE_BPS = 200; // 2.00% hard cap

    event SnipeExecuted(
        address indexed user,
        address indexed tokenOut,
        uint256 ethIn,
        uint256 feeTaken
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _feeRecipient) {
        require(_feeRecipient != address(0), "Zero recipient");
        owner = msg.sender;
        feeRecipient = _feeRecipient;
    }

    function snipeETHForTokens(
        address dexRouter,
        address tokenOut,
        uint256 amountOutMin,
        uint256 deadline
    ) external payable {
        require(msg.value > 0, "Zero ETH");
        require(dexRouter != address(0) && tokenOut != address(0), "Invalid address");

        uint256 fee = (msg.value * feeBps) / 10_000;
        uint256 swapAmount = msg.value - fee;

        if (fee > 0) {
            (bool sent, ) = feeRecipient.call{value: fee}("");
            require(sent, "Fee transfer failed");
        }

        address[] memory path = new address[](2);
        path[0] = IUniswapV2Router(dexRouter).WETH();
        path[1] = tokenOut;

        IUniswapV2Router(dexRouter).swapExactETHForTokensSupportingFeeOnTransferTokens{
            value: swapAmount
        }(amountOutMin, path, msg.sender, deadline);

        emit SnipeExecuted(msg.sender, tokenOut, msg.value, fee);
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Zero recipient");
        feeRecipient = _feeRecipient;
    }

    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= MAX_FEE_BPS, "Exceeds max fee");
        feeBps = _feeBps;
    }
}
