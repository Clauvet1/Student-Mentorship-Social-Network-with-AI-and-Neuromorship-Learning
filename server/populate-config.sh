#!/bin/bash

# Set the template file and output file
TEMPLATE_FILE="firebase.config.template.json"
OUTPUT_FILE="config.yaml"

# Populate the template file with environment variables
envsubst < "$TEMPLATE_FILE" > "$OUTPUT_FILE"