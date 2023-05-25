import React, { useState, useEffect, ChangeEvent } from 'react';
import Head from 'next/head';
//import { BugAntIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useScaffoldContract } from '~~/hooks/scaffold-eth/useScaffoldContract';

import { BigNumber, ethers, Signer } from 'ethers';
import { useAccount, useBalance, useSigner } from 'wagmi';
import { useScaffoldContractWrite } from '~~/hooks/scaffold-eth';
import { ArrowUpIcon } from '@heroicons/react/20/solid';
import { ArrowDownIcon } from '@heroicons/react/24/outline';


const Home: React.FC = () => {
  const [selectedToken1, setSelectedToken1] = useState('');
  const [selectedToken2, setSelectedToken2] = useState('');
  const [token1Amount, setToken1Amount] = useState("0");
  const [token1InputRep, setToken1InputRep] = useState("0");
  const [token2Amount, setToken2Amount] = useState("0");
  const [tokenBalance, setTokenBalance] = useState<string | undefined>(undefined);
  const [connectedWalletTokenBalance, setConnectedWalletTokenBalance] = useState<string | undefined>(undefined);
  const [approvalStatus, setApprovalStatus] = useState(false);
  const [balanceUpdated, setBalanceUpdated] = useState(false);

  const handleToken1Change = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedToken1(event.target.value);
  };

  const handleToken2Change = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedToken2(event.target.value);
  };

  const handleToken1AmountChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    console.log('Token 1 Amount:', value);
 
  
    try {
      if (selectedToken1 && selectedToken2 && value) {
        console.log("Value: " + value);

        // Call the price function of the contract to calculate the price
        const weiValue = parseFloat(value) * 10**18;
        const stringWei = weiValue.toString();

        setToken1InputRep(value);
        setToken1Amount(stringWei);
        
  
        if (selectedToken1 === "STUBREW" && selectedToken2 === "ETH") {
          const xReservesPromise = studiBrewContract?.balanceOf(studiBrewDexContract?.address || '');
          const yReservesPromise = dexBalance;
  
          const [xReserves, yReserves] = await Promise.all([xReservesPromise, yReservesPromise]);

          const result = await studiBrewDexContract?.price(BigNumber.from(stringWei), BigNumber.from(xReserves?.toString()), BigNumber.from(yReserves?.value.toString()));

          setToken2Amount(ethers.utils.formatUnits(result));

        } 
        else if (selectedToken1 === "ETH" && selectedToken2 === "STUBREW") {
          const xReservesPromise = dexBalance;
          const yReservesPromise = studiBrewContract?.balanceOf(studiBrewDexContract?.address || '');
  
          const [xReserves, yReserves] = await Promise.all([xReservesPromise, yReservesPromise]);

          const result = await studiBrewDexContract?.price(BigNumber.from(stringWei), BigNumber.from(xReserves?.value.toString()), BigNumber.from(yReserves?.toString()));

          setToken2Amount(ethers.utils.formatUnits(result));
        }
      }
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };
  
  // const handleToken2AmountChange = (event: ChangeEvent<HTMLSelectElement>) => {
  //   setToken2Amount(event.target.value);
  // };

  const { data: signer} = useSigner();
  const { data: studiBrewContract } = useScaffoldContract({
    contractName: "StuBrew",
    signerOrProvider: signer as Signer,
  });

  const { data: studiBrewDexContract } = useScaffoldContract({
    contractName: "StudiBrewDEX",
  });

  const fetchConnectedWalletBalance = async () => {
    try {
      const account = connectedWalletAddr ?? '';
      const balance = await studiBrewContract?.balanceOf(account);

      if (balance){
        const formattedBalance = ethers.utils.formatUnits(balance, 18);
        setConnectedWalletTokenBalance(formattedBalance);
        setBalanceUpdated(true);
      }
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  };

  const fetchBalance = async () => {
    try {
      const account = studiBrewDexContract?.address ?? '';
      const balance = await studiBrewContract?.balanceOf(account);

      if (balance){
        const formattedBalance = ethers.utils.formatUnits(balance, 18);
        setTokenBalance(formattedBalance);
      }
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  };
  
  useEffect(() => {


    fetchBalance();
    fetchConnectedWalletBalance();
  }, [studiBrewContract]);

    // Implement your logic for token swapping here
    // You can access the selected tokens and their amounts using the variables:
    // selectedToken1, selectedToken2, token1Amount, token2Amount
    const { writeAsync} = useScaffoldContractWrite({
      contractName: "StudiBrewDEX",
      functionName: "tokenToEth",
      args: [BigNumber.from(token1Amount)]
    });

    const studiBrewToETH = async () => {
      await writeAsync();
      fetchConnectedWalletBalance();
      fetchBalance();
    };

    const { writeAsync: ethToStudiBrewSwapWrite } = useScaffoldContractWrite({
      contractName: "StudiBrewDEX",
      functionName: "ethToToken",
      value: token1InputRep.toString()
    });

    const ethToStudiBrewSwap = async () => {
      await ethToStudiBrewSwapWrite();
      fetchConnectedWalletBalance();
      fetchBalance();
    };

  const { data: dexBalance } = useBalance({
    address: studiBrewDexContract?.address,
  })

  const {address: connectedWalletAddr } = useAccount()

  const handleApprove = async () => {
    try {

      // Call the approve function  
      const approvalTx = await studiBrewContract?.approve(studiBrewDexContract?.address || '', BigNumber.from(token1Amount));

      // Wait for the transaction to be mined
      await approvalTx?.wait();
  
      // Update the approval status
      setApprovalStatus(true);
    } catch (error) {
      console.error('Error approving tokens:', error);
    }
  }; 

  const handleFlip = () => {
    setSelectedToken1(selectedToken2);
    setSelectedToken2(selectedToken1);
  };

  return (
    <>
      <Head>
        <title>StudiBrew</title>
        <meta name="description" content="Created with 🏗 scaffold-eth-2" />
      </Head>

      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">StudiBrew</span>
          </h1>
          <p className="text-center text-lg mb-9 mt-9">SWAP YOUR EARNED TOKENS!</p>
        </div>
        <p className='pt-6'>YOUR $STUBREW BALANCE</p>
        <h1 className="font-bold text-xl text-white rounded-md shadow-lg p-1 px-5 bg-gradient-to-r from-[#EDB260] via-[#EDB257] to-[#EDB367]"> {connectedWalletTokenBalance} </h1>

        <div className="flex-grow bg-[#3F433E]/75 w-full mt-16 px-8 py-12">
          
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">       
          <div className="flex justify-center items-center gap-1 flex-col sm:flex-col shadow-l">
          
          
          <p className='font-bold'>TOTAL LIQUIDITY</p>
          <p>$STUBREW Balance: {tokenBalance}</p>
          <p>ETH Balance: {dexBalance?.formatted} {dexBalance?.symbol}</p>

          <div className="flex flex-col bg-base-100 px-12 py-12 text-center items-center rounded-3xl">    <div className="flex flex-col gap-9 ml-3">
          
              <div className="flex items-center py-4 mx-4">
                <select
                  value={selectedToken1}
                  onChange={handleToken1Change}
                  className="py-3 px-3 rounded-md shadow-lg"                
                >
                  <option value="" disabled>Select Token</option>
                  <option value="STUBREW">STUBREW</option>
                  <option value="ETH">ETH</option>
                </select>
                <input
                  type="number"
                  value={token1InputRep}
                  onChange={handleToken1AmountChange}
                  className="py-3 px-3 rounded-md ml-4 shadow-lg"
                  placeholder="0"
                />
              </div>
              <button 
              className="flex py-1 px-1 rounded-md shadow-lg  mx-auto"
              onClick = {handleFlip}><ArrowDownIcon className='w-6 h-6 fill-secondary hover:h-8'/><ArrowUpIcon className='w-6 h-6 fill-[#EDB257] hover:h-8'/>
              </button>
              <div className="flex items-center mx-4 pb-5">
                <select
                  value={selectedToken2}
                  onChange={handleToken2Change}
                  className="py-3 px-3 rounded-md shadow-lg" 
                >

                  <option value="" disabled>Select Token</option>
                  <option value="STUBREW">STUBREW</option>
                  <option value="ETH">ETH</option>
                </select>

                <input
                  type="number"
                  value={token2Amount}
                  readOnly
                  className=" py-3 px-3 rounded-md ml-4 shadow-lg"
                  placeholder="0"
                />                            
              </div>

              {approvalStatus ? (
                <button
                onClick={() => {
                  if (selectedToken1 === 'STUBREW' && selectedToken2 === 'ETH') {
                    studiBrewToETH();
                  } else if (selectedToken1 === 'ETH' && selectedToken2 === 'STUBREW') {
                    ethToStudiBrewSwap();
                  } else {
                    // Handle other cases or display an error message
                  }
                }}
                className="py-2 rounded-md bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg text-white font-bold"
              >
                SWAP
              </button>
              ) : (
                <button
                  onClick={handleApprove}
                  className="py-2 rounded-md bg-gradient-to-r from-[#EDB260] via-[#EDB257] to-[#EDB367] shadow-lg text-white font-bold"
                >
                  APPROVE
                </button>
              )}
            </div>
          </div>
  
        </div>
        </div>
        </div>
        </div>
        </>
        );
        };

export default Home;