#!/bin/bash

SOURCE_DIR="day00"

for i in {1..20}
do
  TARGET_DIR=$(printf "day%02d" $i)
  rm -rf "$TARGET_DIR"    # Remove target dir if it exists
  cp -rf "$SOURCE_DIR" "$TARGET_DIR"  # Force copy and overwrite
done