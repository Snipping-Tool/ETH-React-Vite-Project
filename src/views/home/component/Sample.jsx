import React, { useContext, useState, useEffect } from "react";
import { SampleContext } from "@context/SampleContext";

const Sample = () => {
  const { connectWallet, account } = useContext(SampleContext);

  useEffect(() => {
    console.log(account);
    if (account) {
      setWalletAddress("Wallet: " + account);
    }
  }, [account]);

  const [walletAddress, setWalletAddress] = useState("Wallet: *");
  return (
    <>
      <div className="flex flex-col w-full h-screen justify-center items-center bg-gray-700">
        <p className="text-white text-center text-[30px] font-bold">
          {walletAddress}
        </p>
        <button
          className="bg-gray-500 p-3 rounded-md text-white font-bold transition hover:duration-700 hover:bg-gray-300 hover:text-black"
          onClick={() => {
            connectWallet();
          }}
        >
          Connect Wallet
        </button>
      </div>
    </>
  );
};

export default Sample;
