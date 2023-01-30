/**
 * Imports
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import { Connection, WorkflowClient } from '@temporalio/client';
import { example } from './workflows';
import { Example_Request, Example_Response } from "./types";

/**
 * Clients
 */
const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT ? process.env.PORT : '3000';

const examplePostHandler = async(payload: Example_Request) => {
  try {
    const env = getEnv();
    const {taskQueue} = env;
    const client = await getTemporalClient(env);
    const result = await client.execute(example, {
      taskQueue,
      workflowId: `my-business-id-${Date.now()}`,
      args: [payload],
    });
    return result;
  } catch (e) {
    throw e;
  }
}

/**
 * Express Functions
 */

app.post('/example', async(request: any, response: any) => {
  const {body} = request;

  try {
    const result = await examplePostHandler(body);
    response.send(result);
  } catch(e) {
    console.error(e);
    response.send(e);
  }
});

app.listen(PORT, () => console.log(`Listening on ${PORT}.\nNode Environment is on ${process.env.NODE_ENV} mode.`));

/**
 * Temporal Functions
 */

const getTemporalClient = async ({
  address,
  namespace,
  clientCertPath,
  clientKeyPath,
  serverNameOverride,
  serverRootCACertificatePath
}: Env) => {
  let serverRootCACertificate: Buffer | undefined = undefined;
  if (serverRootCACertificatePath) {
    serverRootCACertificate = fs.readFileSync(serverRootCACertificatePath);
  }

  const connection = await Connection.connect({
    address,
    tls: {
      serverNameOverride,
      serverRootCACertificate,
      clientCertPair: {
        crt: fs.readFileSync(clientCertPath),
        key: fs.readFileSync(clientKeyPath),
      },
    },
  });
  const client = new WorkflowClient({ connection, namespace });
  return client;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ReferenceError(`${name} environment variable is not defined`);
  }
  return value;
}

/**
 * Types
 */

export interface Env {
  address: string;
  namespace: string;
  clientCertPath: string;
  clientKeyPath: string;
  serverNameOverride?: string; // not needed if connecting to Temporal Cloud
  serverRootCACertificatePath?: string; // not needed if connecting to Temporal Cloud
  taskQueue: string;
}

export function getEnv(): Env {
  return {
    address: requiredEnv('TEMPORAL_ADDRESS'),
    namespace: requiredEnv('TEMPORAL_NAMESPACE'),
    clientCertPath: requiredEnv('TEMPORAL_CLIENT_CERT_PATH'),
    clientKeyPath: requiredEnv('TEMPORAL_CLIENT_KEY_PATH'),
    serverNameOverride: process.env.TEMPORAL_SERVER_NAME_OVERRIDE,
    serverRootCACertificatePath: process.env.TEMPORAL_SERVER_ROOT_CA_CERT_PATH,
    taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'hello-world-mtls',
  };
}