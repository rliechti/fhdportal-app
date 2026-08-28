<script setup>
defineProps(['doa_bucket_name','doa_endpoint','doa_access_key','doa_secret_key','doa_session_token','doa_sts_token_expiration'])
</script>
<style>
  .markdown-body p{
    text-align: left !important;
  }
  #downloadModal p:has(>code){
    padding: 0.2em 0.4em;
    font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace; 
    background-color: rgba(27, 31, 35, 0.05); 
    font-size: 85%;
  }
  #downloadModal code{
    padding: 0;
    background-color: transparent
  }
</style>

### List and download objects from the bucket

<div id="downloadModal">
Use these credentials with any S3-compatible client to list and download objects from the bucket.

For example, using [AWS CLI](https://aws.amazon.com/cli/):

- export the environment variables substituting the following values:

  `export AWS_ACCESS_KEY_ID="`<span style="font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace; font-size: 85%;">{{ doa_access_key }}</span>`"`
  `export AWS_SECRET_ACCESS_KEY="`<span style="font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace; font-size: 85%;">{{ doa_secret_key }}</span>`"`
  `export AWS_SESSION_TOKEN="`<span style="font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;  font-size: 85%;">{{ doa_session_token }}</span>`"`

- to list the files in a bucket use the command:

  `aws s3 ls s3://`<span style="font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;  font-size: 85%;">{{ doa_bucket_name }}</span>`/ --endpoint-url `<span style="font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;  font-size: 85%;">{{ doa_endpoint }}</span>


- to download a file use the command:

  `aws s3 cp s3://`<span style="font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;  font-size: 85%;">{{ doa_bucket_name }}</span>`/<c4gh_file_name> <path_to_your_folder> --endpoint-url `<span style="font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;  font-size: 85%;">{{ doa_endpoint }}</span>  

---  
</div>
