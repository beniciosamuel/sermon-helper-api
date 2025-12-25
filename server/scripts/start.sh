#!/bin/bash

# Server Development Start Script

echo "Building server..."
npm run build

echo "Starting server..."
nodemon -q -w dist .dist
