# temporalio-hello-world-mtls-rest-ts

This guide is the a fork of [Temporal Hello World MTLS](https://github.com/temporalio/samples-typescript/tree/main/hello-world-mtls).

## Prerequisite

- [Temporal Cloud](https://pages.temporal.io/cloud-early-access)

## Getting Started

1. Use the 🐳 [Temporal.io Client Certificate Generation](https://hub.docker.com/r/temporalio/client-certificate-generation) to generate both CA and End-Entity certificate.

2. Upload the contents of the `CA.pem` file to Temporal.

3. Add the End-Entity Certificate files to `tls` folder.

4. Copy the `.env-example` file and rename it to `.env`.

5. Fill in the .env with the following:

| key                       | value               |
|---------------------------|---------------------|
| TEMPORAL_ADDRESS          | foo.bar.tmprl.cloud |
| TEMPORAL_NAMESPACE        | foo.bar             |
| TEMPORAL_CLIENT_CERT_PATH | ./tls/ca.pem        |
| TEMPORAL_CLIENT_KEY_PATH  | ./tls/ca.key        |

Reference: [Connecting to Temporal Cloud (with mTLS)](https://docs.temporal.io/typescript/security?lang=ts#connecting-to-temporal-cloud-with-mtls)

6. Execute the following command:

```sh
npm install
```

7. Execute the following command:

```sh
npm start
```

8. In another shell, execute the following command:

```sh
npm run workflow
```

9. It should print out `Hello, Temporal!`.