# OpenVPN Session ![OpenVPN](https://openvpn.net/favicon.ico)

Setup a OpenVPN connection for the session of your Action's job with automatic setup & cleanup.

## Usage

```yml
- uses: NexRX/OpenVPN-Session@v1
  with:
    ovpn-client: "/path/to/file.ovpn" # Required or `ovpn-client-b64`, Filepath to a `.ovpn` client

    ovpn-client-b64: "<base64>" # Required or `ovpn-client`, Base64 `.ovpn` file contents

    timeout-address: "10.8.0.1" # Required, The (private) hostname or ip for timeout testing connection to

    log-save-as: "Artifact Name" # Specifiy a name to save the OpenVPN logs as an artifact

    log-filepath: "/tmp/openvpn.log" # Filepath for saving the OpenVPN logs to [Example is default]

    timeout-seconds: 180 # Seconds before assuming the session & connection has failed [Example is default]
```
You may be wondering why `timeout-address` is required. This is to be abosolutely certain that a connection (to a device) is guarented if this actions main run succeeds. You can choose the server itself and that is enough. The server is usually at `10.8.0.1` by default.

## Issues?
If you have any issues, feel free to make a issue in the github section.
