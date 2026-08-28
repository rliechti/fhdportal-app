<script setup>
defineProps(['sda_c4gh_key', 'sda_sftp_port', 'email', 'sda_inbox_url'])
</script>

### Quick Start Guide

1. Encrypt your file with the Crypt4GH public key:

```bash
crypt4gh encrypt --recipient_pk fega.pubkey < file_to_encrypt > encrypted_file.c4gh
```

2. Compute its checksum:

```bash
sha256sum encrypted_file.c4gh > encrypted_file.c4gh.sha256
```

3. Upload both files to your sFTP inbox:
 <pre>sftp -P {{ sda_sftp_port }} {{ email }}@{{ sda_inbox_url }}</pre>

###### Crypt4GH Public Key

<pre>
{{ sda_c4gh_key }}
</pre>
