import React, { useEffect, useState } from "react";
import { sampleContractABI, sampleContractAddress } from "@utils/constants";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

export const SampleContext = React.createContext();

// ========= WEB3 MODAL =========== //
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "your_infura_id", // required
    },
  },
};

const web3Modal = new Web3Modal({
  // network: "testnet",
  cacheProvider: true, // optional
  providerOptions, // required
});

const { ethereum } = window;

// ========= WEB3 CONTRACT CREATIONS =========== //

const createSampleContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const sample7Contract = new ethers.Contract(
    sampleContractAddress,
    sampleContractABI,
    provider
  );

  return sample7Contract;
};

export const SampleContextProvider = ({ children }) => {
  // ======== USESTATES ======== //
  const [disableConnect, setDisableConnect] = useState(false);
  const [nativeBalance, setNativeBalance] = useState(0);
  const [provider, setProvider] = useState();
  const [library, setLibrary] = useState();
  const [account, setAccount] = useState();
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [chainId, setChainId] = useState();
  const [network, setNetwork] = useState();
  const [message, setMessage] = useState("");
  const [signedMessage, setSignedMessage] = useState("");
  const [verified, setVerified] = useState();
  const [signer, setSigner] = useState();

  // ======== USEEFFECTS ======== //
  useEffect(async () => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  useEffect(() => {
    signature && verifyMessage();
  }, [signature]);

  /*===== GETS CALLED WHEN SIGNATURE IS VERIFIED ======
  useEffect(() => {
    if (account) {
      
    }
  }, [verified]);
  */

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts) => {
        // console.log("accountsChanged", accounts);
        if (accounts) setAccount(accounts[0]);
        location.reload();
      };

      const handleChainChanged = (_hexChainId) => {
        setChainId(_hexChainId);
        window.location.reload();
      };

      const handleDisconnect = () => {
        // console.log("disconnect", error);
        disconnect();
      };
      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider]);

  // =========== FUNCTIONS ============= //

  const makeSampleTransaction = async () => {
    const transaction = await SampleTransactionContract.connect(
      signer
    ).mintGenesisIncubator({
      value: ethers.utils.parseEther("0.01"),
      gasLimit: 300000,
      gasPrice: ethers.utils.parseUnits("20", "gwei"),
    });
    const transactionResult = await transaction.wait();

    if (transactionResult.status == 1) {
      // is called when transaction succeeds
    } else {
    }
  };

  // ======= USING WEB3MODAL WALLET CONNECTION ========
  const connectWallet = async () => {
    if (!ethereum) {
      if (
        confirm(
          "Your browser does not seem to have a metamask wallet extension, do you want to download Metamak Wallet?"
        )
      ) {
        return window.open("https://metamask.io/download/", "_blank");
      }
      return;
    } else {
      try {
        const provider = await web3Modal.connect();
        const library = new ethers.providers.Web3Provider(provider);
        const accounts = await library.listAccounts();
        const network = await library.getNetwork();
        const signer = library.getSigner();

        // set to desired Network(ChainID)
        switchNetwork(97);

        setSigner(signer);
        fetchWalletBalance(accounts[0]);
        setProvider(provider);
        setLibrary(library);
        setChainId(network.chainId);

        setAccount(accounts[0]);

        // ===== MAKE USER SIGN EVERY WALLET AUTHENTICATION ===//
        // if (localStorage.getItem("Metamask Wallet Address") != accounts[0]) {
        //   signMessage(library, accounts[0]);
        // } else {
        //   setAccount(accounts[0]);
        // }
      } catch (error) {
        setError(error);
      }
    }
  };

  const fetchWalletBalance = async (a) => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const nBalance = await provider.getBalance(a);
    const result = ethers.BigNumber.from(nBalance._hex);
    setNativeBalance(result);
  };

  const handleNetwork = (e) => {
    const id = e.target.value;
    setNetwork(Number(id));
  };

  const handleInput = (e) => {
    const msg = e.target.value;
    setMessage(msg);
  };

  const switchNetwork = async (network) => {
    if (ethereum.networkVersion != network) {
      try {
        ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x61", //97
              rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
              chainName: "Smart Chain - Testnet",
              nativeCurrency: {
                name: "BNB",
                symbol: "BNB",
                decimals: 18,
              },
              blockExplorerUrls: ["https://testnet.bscscan.com"],
            },
          ],
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const signMessage = async (library, account) => {
    setDisableConnect(true);
    // console.log("signing called");
    if (!library) return;
    try {
      const signature = await library.provider.request({
        method: "personal_sign",
        params: ["Sample Signed Authentication", account],
      });
      setSignedMessage(message);
      setSignature(signature);
      setAccount(account);
      localStorage.setItem("Metamask Wallet Address", account);
    } catch (error) {
      setError(error);
      alert(
        "There was an error logging in, Please sign your wallet authentication."
      );
    }
  };

  const verifyMessage = async () => {
    if (!library) return;
    try {
      const verify = await library.provider.request({
        method: "personal_ecRecover",
        params: [signedMessage, signature],
      });
      setVerified(verify === account);
      setDisableConnect(false);
    } catch (error) {
      setError(error);
      setAccount();
      alert(
        "There was an error logging in, Please sign your wallet authentication."
      );
    }
  };

  const refreshState = () => {
    setAccount();
    setChainId();
    setNetwork("");
    setMessage("");
    setSignature("");
    setVerified(undefined);
  };

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    refreshState();
  };

  //============== SAMPLE EIP-712 SIGNATURE ============//

  const signMessageEIP712 = async (id) => {
    let currentDate = Date.now();

    const typedData = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
          { name: "salt", type: "bytes32" },
        ],
        Sample: [
          { name: "timestamp", type: "uint256" },
          { name: "id", type: "uint256" },
          { name: "wallet", type: "address" },
        ],
      },
      primaryType: "Sample",
      domain: {
        name: "Sample EIP-712 Signing",
        version: "1",
        chainId: chainId,
        verifyingContract: sampleContractAddress,
        salt: "set_your_salt",
      },
      message: {
        timestamp: currentDate,
        id: intTokenId,
        wallet: account,
      },
    };

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const myAccount = await signer.getAddress();

    const signature = await signer.provider.send("eth_signTypedData_v4", [
      myAccount,
      JSON.stringify(typedData),
    ]);

    console.log(signature);
  };

  return (
    <SampleContext.Provider
      value={{
        account,
        nativeBalance,
        disableConnect,
        connectWallet,
      }}
    >
      {children}
    </SampleContext.Provider>
  );
};
