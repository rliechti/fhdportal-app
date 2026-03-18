## Submission steps

1. Request **submitter role** on FEGA
2. Create an **SSH** key pair
3. Upload your **SSH public key**
   In order to authenticate on the sFTP server, the [public SSH key](https://www.ssh.com/academy/ssh/keygen) of the computer hosting the files to be uploaded must be provided.
4. Encrypt your files with **crypt4gh** using the FEGA public key
```
-----BEGIN CRYPT4GH PUBLIC KEY-----
iT9V6iGJCcS2kCOQtSlVGv3LUGQsDU4lYLi4CL7dJAo=
-----END CRYPT4GH PUBLIC KEY-----
```

5. In this demonstrator, encrypted files (*.c4gh) must be manually copied into subdirectories within the `sda-inbox` directory.

6. Create an inbox directory named after your registered email:

```bash
cd sda-inbox
mkdir your.email@example.com
```

7. Copy or move your `*.c4gh` files into this inbox:

```bash
cd your.email@example.com
cp ../../fhdportal-example/RCC/files/*.c4gh .
```

8. A cron job running every minute scans these directories and updates the FHDportal database accordingly. **Wait one minute before proceeding.**
9. Register the submission metadata using this portal.