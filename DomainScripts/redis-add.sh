#!/usr/bin/env bash

source DomainScripts/project.env.makefile
source DomainScripts/manage-etc-hosts.sh
source DomainScripts/tools.sh

#### fetch IP addresses of running containers ####
fetchRedisIP

IP=$REDIS_IP
DOMAIN=$PROJECT_REDIS_HOSTNAME
remove
add
redissettings

echo ""
