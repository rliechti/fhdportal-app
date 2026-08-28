<script setup>
defineProps(['sda_c4gh_key'])
</script>

### File Encryption Guide

Encryption for this inbox is based on [Crypt4GH](https://crypt4gh.readthedocs.io/en/latest/). Install the `crypt4gh` tool with:

```bash
pip install crypt4gh
```

or directly from the [GitHub repository](https://github.com/EGA-archive/crypt4gh):

```bash
pip install git+https://github.com/EGA-archive/crypt4gh.git
```

Save the following Crypt4GH public key into a file, e.g. `fega.pubkey`:

<pre>
{{ sda_c4gh_key }}
</pre>

Encrypt a given file with the following command:

```bash
crypt4gh encrypt --recipient_pk fega.pubkey < file_to_encrypt > encrypted_file.c4gh
```

This command reads the file from `stdin` (using `<`) and writes the encrypted version to `stdout` (using `>`).  
Replace `file_to_encrypt` and `encrypted_file.c4gh` with the appropriate filenames, but make sure not to use the same filename for both reading and writing — your shell would otherwise truncate both files before either is read or written.

Compute the SHA256 checksum of the encrypted file:

```bash
sha256sum encrypted_file.c4gh > encrypted_file.c4gh.sha256
```
