// This script analyzes imports and suggests tree-shaking improvements
// without modifying the vite.config.ts, which is forbidden

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_SRC_DIR = path.join(__dirname, 'client', 'src');

// Components that are often imported individually but could be grouped
const COMPONENT_GROUPS = {
  'Form components': [
    '@/components/ui/form',
    '@/components/ui/input',
    '@/components/ui/textarea',
    '@/components/ui/label',
    '@/components/ui/select',
  ],
  'Navigation components': [
    '@/components/ui/navigation-menu',
    '@/components/ui/breadcrumb',
    '@/components/ui/pagination',
  ],
  'Dialog components': [
    '@/components/ui/dialog',
    '@/components/ui/alert-dialog',
    '@/components/ui/popover',
    '@/components/ui/tooltip',
  ]
};

// RegEx to find component imports
const IMPORT_REGEX = /import\s+(?:{([^}]+)})?\s+from\s+["']([^"']+)["']/g;

// Track all imports across files
const imports = {};
const files = {};

function traverseDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const isDirectory = fs.statSync(fullPath).isDirectory();
    
    if (isDirectory) {
      traverseDirectory(fullPath);
    } else if (item.endsWith('.tsx') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.js')) {
      analyzeFile(fullPath);
    }
  }
}

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(CLIENT_SRC_DIR, filePath);
    files[relativePath] = { imports: [] };
    
    let match;
    while ((match = IMPORT_REGEX.exec(content)) !== null) {
      const [_, importNames, importPath] = match;
      
      if (!importPath) continue;
      
      // Record this import
      if (!imports[importPath]) {
        imports[importPath] = { count: 0, files: [] };
      }
      
      imports[importPath].count++;
      imports[importPath].files.push(relativePath);
      files[relativePath].imports.push(importPath);
    }
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error.message);
  }
}

// Find potential barrel imports that could be consolidated
function analyzePotentialBarrelImports() {
  const barrelOpportunities = [];
  
  // For each component group, check if multiple components are imported in the same file
  for (const [groupName, paths] of Object.entries(COMPONENT_GROUPS)) {
    const filesUsingMultiple = {};
    
    for (const importPath of paths) {
      if (!imports[importPath]) continue;
      
      for (const file of imports[importPath].files) {
        if (!filesUsingMultiple[file]) {
          filesUsingMultiple[file] = [];
        }
        
        filesUsingMultiple[file].push(importPath);
      }
    }
    
    // If a file imports multiple components from the same group, suggest a barrel import
    for (const [file, usedPaths] of Object.entries(filesUsingMultiple)) {
      if (usedPaths.length > 1) {
        barrelOpportunities.push({
          file,
          group: groupName,
          components: usedPaths
        });
      }
    }
  }
  
  return barrelOpportunities;
}

// Find unused component imports, which might increase bundle size
function findUnusedComponents() {
  // Load the build output if it exists
  const buildOutputPath = path.join(__dirname, 'dist', 'public', 'assets');
  let buildFiles = [];
  
  try {
    buildFiles = fs.readdirSync(buildOutputPath);
  } catch (error) {
    // Build output might not exist yet
  }
  
  const unusedComponents = [];
  const potentiallyUnused = [];
  
  for (const [importPath, data] of Object.entries(imports)) {
    // Check if this is a UI component
    if (importPath.includes('@/components/ui/')) {
      const componentName = importPath.split('/').pop();
      
      // Look through the build output to see if the component appears
      if (buildFiles.length > 0) {
        let componentFound = false;
        
        for (const buildFile of buildFiles) {
          if (buildFile.endsWith('.js')) {
            const buildContent = fs.readFileSync(path.join(buildOutputPath, buildFile), 'utf8');
            
            // This is a very simplistic check - would need a proper AST analysis for accuracy
            if (buildContent.includes(componentName)) {
              componentFound = true;
              break;
            }
          }
        }
        
        if (!componentFound) {
          potentiallyUnused.push({
            component: componentName,
            importPath,
            files: data.files
          });
        }
      }
      
      // Check if the component is only imported but might not be used
      for (const file of data.files) {
        const content = fs.readFileSync(path.join(CLIENT_SRC_DIR, file), 'utf8');
        const componentRegex = new RegExp(`<${componentName}[\\s>]`);
        
        if (!componentRegex.test(content)) {
          unusedComponents.push({
            component: componentName,
            importPath,
            file
          });
        }
      }
    }
  }
  
  return { unusedComponents, potentiallyUnused };
}

// Run the analysis
console.log('Analyzing component imports...');
traverseDirectory(CLIENT_SRC_DIR);

console.log(`\nFound ${Object.keys(imports).length} unique imports across ${Object.keys(files).length} files`);

// Find ShadcnUI component imports
const shadcnImports = Object.keys(imports).filter(i => i.includes('@/components/ui/'));
console.log(`\nShadcn UI components imported (${shadcnImports.length}):`);
shadcnImports.forEach(i => {
  console.log(`- ${i}: imported in ${imports[i].count} files`);
});

// Find potential barrel import opportunities
const barrelOpportunities = analyzePotentialBarrelImports();
if (barrelOpportunities.length > 0) {
  console.log('\nPotential barrel import opportunities:');
  barrelOpportunities.forEach(({ file, group, components }) => {
    console.log(`\nFile: ${file}`);
    console.log(`Group: ${group}`);
    console.log('Currently imports:');
    components.forEach(c => console.log(`  ${c}`));
    console.log('Could use:');
    console.log(`  import { ${components.map(c => c.split('/').pop()).join(', ')} } from '@/components/${group.toLowerCase().replace(/\s+/g, '-')}'`);
  });
}

// Find potentially unused components
const { unusedComponents, potentiallyUnused } = findUnusedComponents();
if (unusedComponents.length > 0) {
  console.log('\nComponents imported but potentially not used:');
  unusedComponents.forEach(({ component, importPath, file }) => {
    console.log(`- ${component} imported in ${file} but might not be used`);
  });
}

// Generate tree-shaking recommendations
console.log('\n=== Bundle Optimization Recommendations ===');
console.log('1. Improve tree-shaking:');
console.log('   - Use named imports instead of default imports');
console.log('   - Add /* @__PURE__ */ annotation to utility functions');
console.log('   - Add "sideEffects: false" to package.json');
console.log('   - Import only the specific icons you need from lucide-react');

console.log('\n2. Reduce CSS bundle size:');
console.log('   - The tailwind.config.ts has been updated with safelist for critical classes');
console.log('   - Consider creating component-specific CSS modules for complex components');

console.log('\n3. Bundle Chunking Strategy:');
console.log('   - Group related component imports together');
console.log('   - Consider creating barrel imports for component categories');
console.log('   - Split vendor code from application code');

console.log('\n4. Accessibility Improvements:');
console.log('   - Input, Textarea, and Alert components have been updated with proper ARIA attributes');
console.log('   - Form components use proper label associations');
console.log('   - Ensure all interactive elements have keyboard support');