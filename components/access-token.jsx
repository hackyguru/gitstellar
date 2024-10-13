import { useSession, signIn, signOut } from "next-auth/react"
import axios from 'axios';
import { useState, useEffect } from 'react';
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Bitcoin, BookCopy, File, GitGraph, Github, Gitlab, Network, Settings, Users, X } from "lucide-react"
import { MultiStepLoader } from "./multi-step-loader";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import * as StellarSdk from 'stellar-sdk';



export default function AccessToken() {

  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [getKey, setGetKey] = useState('');
  const [getValue, setGetValue] = useState('');
  const [error, setError] = useState('');

  const rpc = new StellarSdk.SorobanRpc.Server('https://soroban-testnet.stellar.org');
  const contractId = 'CAZRTOYAMPPVKYBHEFGWLFYV2NVBCMHSQINLDX7C7DEAR6KFCO5WUI62';
  const contract = new StellarSdk.Contract(contractId);
  const accountPublicKey = 'GAN6C4YWK7B4DVXCG6KPWH4CBIQTSSFZ6XRPREHAYVLBAXAYTUP2XE7I';
  const accountSecretKey = 'SCOVOOJWZGG6NNUXLRHKGXETC2RW6DUKTP3TDUZSVLCJLSED4AWBNFPM'; // don't do this in production
  const accountKeypair = StellarSdk.Keypair.fromSecret(accountSecretKey);

  const handleSet = async (e) => {
    e.preventDefault();
    try {
      const inputKey = StellarSdk.nativeToScVal(key, { type: "symbol" });
      const inputValue = StellarSdk.nativeToScVal(value, { type: "symbol" });
      const account = await rpc.getAccount(accountPublicKey);
      const tx = new StellarSdk.TransactionBuilder(account, {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase: StellarSdk.Networks.TESTNET,
        })
        .addOperation(contract.call("set", inputKey, inputValue))
        .setTimeout(30)
        .build();
      const preparedTx = await rpc.prepareTransaction(tx);
      preparedTx.sign(accountKeypair);
      const txResult = await rpc.sendTransaction(preparedTx);
      console.log('txResult', txResult);
      setKey('');
      setValue('');
    } catch (err) {
      setError('Failed to set value: ' + err.message);
    }
  };

  const handleGet = async (e) => {
    e.preventDefault();
    try {
      const inputGetKey = StellarSdk.nativeToScVal(getKey, { type: "symbol" });
      const account = await rpc.getAccount(accountPublicKey);
      const tx = new StellarSdk.TransactionBuilder(account, {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase: StellarSdk.Networks.TESTNET,
        })
        .addOperation(contract.call("get", inputGetKey))
        .setTimeout(30)
        .build();
      rpc.simulateTransaction(tx).then((sim) => {
        const decoded = StellarSdk.scValToNative(sim.result?.retval);
        setGetValue(decoded);
      });
    } catch (err) {
      setError('Failed to get value: ' + err.message);
    }
  };
  
  const { data } = useSession()
  const { accessToken } = data

  const [repos, setRepos] = useState([]);



  useEffect(() => {
    const fetchRepos = async () => {
      if (accessToken) {
        try {
          const response = await axios.get('https://api.github.com/user/repos', {
            headers: {
              'Accept': 'application/vnd.github+json',
              'Authorization': `Bearer ${accessToken}`,
              'X-GitHub-Api-Version': '2022-11-28'
            },
            params: {
              per_page: 100
            }
          });

          setRepos(response.data);
        } catch (error) {
          console.error('Error fetching repositories:', error);
        }
      } else {
        console.error('Access token is missing.');
      }
    };

    fetchRepos();
  }, [accessToken]);



  const createFile = async (owner, repo) => {
    try {
      const responsetwo = await axios.put(
        `https://api.github.com/repos/${owner}/${repo}/contents/backup.js`,
        {
          message: 'Added workflow',
          content: 'Y29uc3QgbGlnaHRob3VzZSA9IHJlcXVpcmUoJ0BsaWdodGhvdXNlLXdlYjMvc2RrJyk7CmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7Cgphc3luYyBmdW5jdGlvbiBtYWluKCkgewogIC8vIEdldCB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSAocm9vdCBvZiB0aGUgcmVwb3NpdG9yeSkKICBjb25zdCByZXBvUm9vdCA9IHByb2Nlc3MuY3dkKCk7CgogIGNvbnN0IHVwbG9hZFJlc3BvbnNlID0gYXdhaXQgbGlnaHRob3VzZS51cGxvYWQoCiAgICByZXBvUm9vdCwgCiAgICAnMmZjMzU3ZjcuZjk1MjAyMGEyMGJkNGU5N2FmYTdhY2E4ODIyMTExNmQnCiAgKTsKCiAgY29uc29sZS5sb2codXBsb2FkUmVzcG9uc2UpOwogIGNvbnN0IGNpZCA9IHVwbG9hZFJlc3BvbnNlLmRhdGEuSGFzaDsKICBjb25zb2xlLmxvZyhgVXBsb2FkZWQgdG8gSVBGUyA6ICR7Y2lkfWApOwogIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGA6OnNldC1vdXRwdXQgbmFtZT1jaWQ6OiR7Y2lkfWApOwp9CgptYWluKCkuY2F0Y2goKGVycm9yKSA9PiB7CiAgY29uc29sZS5lcnJvcihlcnJvcik7CiAgcHJvY2Vzcy5leGl0KDEpOwp9KTs='
        },
        {
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${accessToken}`,
            'X-GitHub-Api-Version': '2022-11-28'
          }
        }
      );

      console.log('Lighthouse pusher service created!');

      const response = await axios.put(
        `https://api.github.com/repos/${owner}/${repo}/contents/.github/workflows/backup.yml`,
        {
          message: 'Added workflow',
          content: 'bmFtZTogQmFja3VwIFJlcG9zaXRvcnkKCm9uOgogIHB1c2g6CiAgICBicmFuY2hlczoKICAgICAgLSBtYWluCiAgcHVsbF9yZXF1ZXN0OgogICAgYnJhbmNoZXM6CiAgICAgIC0gbWFpbgogICAgdHlwZXM6IFtjbG9zZWRdCgpqb2JzOgogIGJhY2t1cDoKICAgIHJ1bnMtb246IHVidW50dS1sYXRlc3QKCiAgICBzdGVwczoKICAgIC0gbmFtZTogQ2hlY2tvdXQgcmVwb3NpdG9yeQogICAgICB1c2VzOiBhY3Rpb25zL2NoZWNrb3V0QHYzCgogICAgLSBuYW1lOiBTZXQgdXAgTm9kZS5qcwogICAgICB1c2VzOiBhY3Rpb25zL3NldHVwLW5vZGVAdjMKICAgICAgd2l0aDoKICAgICAgICBub2RlLXZlcnNpb246IDIwLngKCiAgICAtIG5hbWU6IFVwbG9hZCB0byBMaWdodGhvdXNlLnN0b3JhZ2UKICAgICAgcnVuOiB8CiAgICAgICAgbnBtIGluc3RhbGwgQGxpZ2h0aG91c2Utd2ViMy9zZGsKICAgICAgICBub2RlIGJhY2t1cC5qcwoKICAgIC0gbmFtZTogU3RvcmUgQ0lECiAgICAgIHJ1bjogZWNobyAiJHt7IHN0ZXBzLnVwbG9hZC5vdXRwdXRzLmNpZCB9fSIgPiBjaWQudHh0'
        },
        {
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${accessToken}`,
            'X-GitHub-Api-Version': '2022-11-28'
          }
        }
      );

      console.log('Workflow file created!');

    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  const [loading, setLoading] = useState(false);


  const loadingStates = [
    {
      text: "Accessing the repository",
    },
    {
      text: "Creating the workflow file",
    },
    {
      text: "Creating the backup script",
    },
    {
      text: "Triggering the github action",
    },
    {
      text: "Automatic peer to peer backups is successfully setup",
    },
  ];

  return <div className="space-y-10">
    <MultiStepLoader loadingStates={loadingStates} loading={loading} duration={2000} />
    {loading && (
      <button
        className="fixed top-4 right-4 text-black dark:text-white z-[120]"
        onClick={() => setLoading(false)}
      >
        <X className="h-10 w-10" />
      </button>)
    }

    <div>
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map((repo) => (
            <>
              <Card className="w-full" key={repo.id}>
                <CardHeader className="grid  items-start gap-4 space-y-0">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center mb-5">
                      <Link href={repo.html_url}>
                        <CardTitle className=" text-lg">{repo.name}</CardTitle>
                      </Link>
                      <Dialog>
                        <DialogTrigger><Network className="h-5 w-5" /></DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="mb-5">{repo.name}</DialogTitle>
                            <DialogDescription>
                              Node ID : {repo.node_id}
                              <br/>
                              Size : {repo.size}
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <CardDescription className="h-12">
                      {repo.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400 items-center justify-between">
                    <div className="flex space-x-4">

                      <div className="flex items-center">
                        <CircleDotIcon className="mr-1 h-3 w-3 fill-gray-900 text-gray-900" />
                        {repo.language}
                      </div>
                      <div>Updated {repo.updated_at}</div>
                    </div>
                    <button onClick={async() => {
                      setLoading(true);
                      await createFile(repo.owner.login, repo.name); 
                    }} className="border border-gray-600 border-opacity-50 rounded-md p-1 px-2 text-black bg-[#D4FB84]">Backup</button>
                  </div>
                </CardContent>
              </Card>
            </>
          ))}
        </div>
      </div>
    </div>
          <MultiStepLoader loadingStates={loadingStates} loading={loading} duration={2000} />
  </div>
}



function CircleDotIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  )
}
