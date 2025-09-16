## Submission steps

1. Request **submitter role** on FEGA
2. Create an **SSH** key pair
3. Upload your **SSH public key**
4. Encrypt your files with **crypt4gh** using the FEGA public key
```
-----BEGIN CRYPT4GH PUBLIC KEY-----
iT9V6iGJCcS2kCOQtSlVGv3LUGQsDU4lYLi4CL7dJAo=
-----END CRYPT4GH PUBLIC KEY-----
```
5. Upload your encrypted files in your sFTP inbox (`sftp -P 32222 youremail@sda-inbox-swissfegadev.leomed.ethz.ch`)
6. Register the submission metadata using this portal.