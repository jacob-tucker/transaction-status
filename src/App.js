import './App.css';
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { useEffect, useState } from 'react';
import { readNumberScript } from './cadence/scripts';
import { updateNumberTx } from './cadence/transactions';
import Transaction from './Transaction.js';

fcl.config()
  .put("accessNode.api", "https://testnet.onflow.org")
  .put("discovery.wallet", "https://flow-wallet-testnet.blocto.app/authn")
  // .put("accessNode.api", "https://mainnet.onflow.org")
  // .put("discovery.wallet", "https://flow-wallet.blocto.app/authn")
  .put("0xSimpleTest", "0x6c0d53c676256e8c")


function App() {
  const [user, setUser] = useState();
  const [txId, setTxId] = useState();
  const [txInProgress, setTxInProgress] = useState(false);
  const [txStatus, setTxStatus] = useState(-1);
  const [txStatusCode, setTxStatusCode] = useState(0);

  useEffect(() => {
    fcl.currentUser().subscribe(setUser);
  }, []);

  const readNumber = async () => {
    const result = await fcl.send([
      fcl.script(readNumberScript),
      fcl.args([])
    ]).then(fcl.decode);

    console.log(result);
  }

  const updateNumber = async () => {
    setTxInProgress(true);
    setTxStatus(-1);
    const transactionId = await fcl.send([
      fcl.transaction(updateNumberTx),
      fcl.args([
        fcl.arg(5, t.Int)
      ]),
      fcl.payer(fcl.authz),
      fcl.proposer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(999)
    ]).then(fcl.decode);

    setTxId(transactionId);
    fcl.tx(transactionId).subscribe(res => {
      setTxStatus(res.status);
      setTxStatusCode(res.statusCode);
      console.log(res);
    });
  }

  return (
    <div className="App">
      <h1>User's Address: {user?.addr}</h1>
      <div className="actions">
        <button onClick={() => fcl.authenticate()}>Connect</button>
        <button onClick={() => fcl.unauthenticate()}>Disconnect</button>
        <button onClick={readNumber}>Read</button>
        <button onClick={updateNumber}>Update</button>
      </div>
      <Transaction txId={txId} txInProgress={txInProgress} txStatus={txStatus} txStatusCode={txStatusCode} />
    </div>
  );
}

export default App;
