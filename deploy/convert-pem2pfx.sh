#! /bin/bash
if [ "$1" == "" ]; then
	echo "Usage: ./cert-renew <cert-dir>"
	echo "Example: ./cert-renew /etc/letsencrypt/live/analysim.tech/"
	exit -1
fi
openssl pkcs12 -inkey $1/privkey.pem -in $1/fullchain.pem -export -out $1/fullchain.pfx -password pass:analysim
