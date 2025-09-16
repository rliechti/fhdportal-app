### Encrypting your files

The FEGA encryption of this inbox is based on [Crypt4GH](https://crypt4gh.readthedocs.io/en/latest/). You can install a python implementation of it, with

```bash
pip install crypt4gh
```

or directly from the [Github repository](https://github.com/EGA-archive/crypt4gh)

```bash
pip install git+https://github.com/EGA-archive/crypt4gh.git
```

Save now the following Crypt4GH public key, into a file, say `ingestion.pubkey.`

```bash
-----BEGIN CRYPT4GH PUBLIC KEY-----
iT9V6iGJCcS2kCOQtSlVGv3LUGQsDU4lYLi4CL7dJAo=
-----END CRYPT4GH PUBLIC KEY-----
```

Encrypt a given file with the following command:

```bash
crypt4gh encrypt --recipient_pk ingestion.pubkey < file_to_encrypt > encrypted_file.c4gh
```

The command reads the file from `stdin` (with `<` ) and output the encrypted version to `stdout` (with `>` ).  
Replace `file_to_encrypt` and `encrypted_file.c4gh` with the appropriate filenames but make sure to not use the same filename for both reading and writing because your SHELL would then truncate both files before you even read or write.