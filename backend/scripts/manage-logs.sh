#!/bin/bash

# Directory containing log files
LOG_DIR="logs"

# Number of days to keep logs
DAYS_TO_KEEP=30

# Create logs directory if it doesn't exist
mkdir -p $LOG_DIR

# Remove old log files
find $LOG_DIR -type f -name "*.log" -mtime +$DAYS_TO_KEEP -exec rm {} \;

# Compress logs older than 1 day
find $LOG_DIR -type f -name "*.log" -mtime +1 ! -name "*.gz" -exec gzip {} \; 