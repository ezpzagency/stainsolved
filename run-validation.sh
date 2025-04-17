#!/bin/bash

# Run the main seed data script
echo "Running seed-guides.ts script..."
npx tsx seed-guides.ts

# Run the extended seed data script
echo "Running seed-guides-extended.ts script..."
npx tsx seed-guides-extended.ts

# Run the additional seed data script
echo "Running seed-guides-additional.ts script..."
npx tsx seed-guides-additional.ts

# Run the validation script to check all guides
echo "Running validation script..."
npx tsx validate-guides.ts

echo "All done! Completed seeding and validation of all stain removal guides."