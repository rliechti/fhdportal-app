# Encryption with FEGA

FEGA encryption is based on [Crypt4GH](https://crypt4gh.readthedocs.io/en/latest/), a standard for secure genomic data encryption.

## Installation

Install the Python implementation of Crypt4GH using `pip`:

```sh
pip install crypt4gh
```

Or install the latest version directly from GitHub:

```sh
pip install git+https://github.com/EGA-archive/crypt4gh.git
```

## Key Setup

Once your data access request is approved, all files in the dataset will be encrypted using your public Crypt4GH key.

If you do not yet have a Crypt4GH key pair, generate one as follows:

```sh
crypt4gh-keygen --sk alice.sec --pk alice.pub
```

This command creates two files:

- `alice.sec` — your private key (keep this secure and never share it)
- `alice.pub` — your public key

## Upload Your Public Key

Upload your public key (`alice.pub`) using the form below to enable dataset encryption for your account.