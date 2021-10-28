#!/bin/bash
export NODE_ENV=${APP_ENV}
npm run-script start:${APP_ENV}
