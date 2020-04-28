#!/bin/bash
if [[ $PATH != *"$(npm bin)"* ]]; then
	export PATH="$(npm bin):$PATH"
fi