#!/bin/bash

# Run the expanded seed data script
echo "Running seed-guides.ts script..."
npx tsx seed-guides.ts

# Run the validation script to check all guides
echo "Running validation script..."
npx tsx validate-guides.ts

echo "All done!"