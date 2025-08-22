import React, { createContext, useContext, useState, useEffect } from "react";
import Web3 from 'web3';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [networkId, setNetworkId] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
      });
      window.ethereum.on('chainChanged', (chainId) => {
        setNetworkId(chainId);
      });
    }
  }, []);

  const connect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not available');
    }
    const provider = window.ethereum;
    await provider.request({ method: 'eth_requestAccounts' });
    const w3 = new Web3(provider);
    setWeb3(w3);
    const accounts = await w3.eth.getAccounts();
    setAccount(accounts[0]);
    const netId = await w3.eth.net.getId();
    setNetworkId(netId);
    return { web3: w3, account: accounts[0], networkId: netId };
  };

  const loadContract = (abi, address) => {
    if (!web3) throw new Error('Web3 not initialized');
    return new web3.eth.Contract(abi, address);
  };

  return (
    <Web3Context.Provider value={{ web3, account, networkId, connect, loadContract }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
