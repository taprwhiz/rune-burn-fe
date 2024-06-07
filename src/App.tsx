import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

import Unisat from "./assets/unisat.jpg"
import axios from 'axios';

const Wallet: React.FC = () => {
  const [accounts, setAccounts] = useState<string>("");
  const [pubkey, setPubkey] = useState<string>("");
  const [burningAmount, setBurningAmount] = useState<number>(0);
  const [feeRate, setFeeRate] = useState<number>(0);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [psbt, setpsbt] = useState<string>("");

  const connectUnisatWallet = async () => {
    try {
      const accounts = await (window as any).unisat.requestAccounts();
      const pubkey = await (window as any).unisat.getPublicKey();

      setAccounts(accounts);
      setPubkey(pubkey);
      setWalletConnected(true);

    } catch (err) {
      throw (err);
    }
  };

  const signPsbt = async (psbt: string) => {
    const signedPsbt = await (window as any).unisat.signPsbt(psbt);

    console.log("signedPsbt ====>", signedPsbt);

    const data = {
      signedPsbt: signedPsbt,
      psbt: psbt
    }

    const res = await axios.post(
      `http://localhost:5000/api/users/burnPsbt`, data
    );

  }

  const handleSubmit = async () => {
    if (pubkey == "" || accounts == "" || feeRate == 0 || burningAmount == 0) {
      return alert("Invalid inputs");
    }

    const data = {
      pubkey: pubkey,
      accounts: accounts,
      feeRate: feeRate,
      burningAmount: burningAmount
    };

    try {
      const res = await axios.post(
        `http://localhost:5000/api/users/signPsbt`, data
      );
      if (res.data.success == true) {
        setpsbt(res.data.psbt);
        console.log(res.data.psbt);

        await signPsbt(res.data.psbt);
      }
    } catch (error) {
      return alert(error);
    }
  }
  return (
    <div className="App">
      <header className="App-header test-[#FFFFFF]">
        {walletConnected
          ? <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <div className='flex gap-2'>
                <p>Account</p>
                <p>{accounts}</p>
              </div>
              <div className='flex gap-2'>
                <p>public key</p>
                <p>{pubkey}</p>
              </div>
              <div className='flex gap-2'>
                <p>Set Amount</p>
                <input type="number" className='text-slate-950' value={burningAmount} onChange={(e) => setBurningAmount(e.target.valueAsNumber)} />
              </div>
              <div className='flex gap-2'>
                <p>Set feerate</p>
                <input type="number" className='text-[#000000] bg-slate-100' value={feeRate} onChange={(e) => setFeeRate(e.target.valueAsNumber)} />
              </div>
            </div>
            <button onClick={handleSubmit}>Submit</button>
          </div>
          : <button
            className="flex hover:cursor-pointer bg-[#131417] broder-[#252B35] broder-1 flex-col items-center w-full px-4 py-8 rounded-xl gap-2"
            onClick={connectUnisatWallet}
          >
            <img src={Unisat} className="w-10 h-10 rounded-md " />
            <p className="font-bold text-[16px] leading-5">Unisat</p>
          </button>}
      </header>
    </div>
  );

}

export default Wallet;
