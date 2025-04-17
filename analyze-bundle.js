import fs from 'fs';
import path from 'path';

// Analyze the CSS file
const analyzeCssBundle = () => {
  try {
    // Find the most recent CSS file in the dist directory
    const distDir = path.resolve('./dist/public/assets');
    const cssFiles = fs.readdirSync(distDir).filter(file => file.endsWith('.css'));
    
    if (cssFiles.length === 0) {
      console.log('No CSS files found in the dist directory');
      return;
    }
    
    const cssFile = cssFiles[0];
    const cssPath = path.join(distDir, cssFile);
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    console.log(`\n--- CSS Bundle Analysis (${cssFile}) ---`);
    console.log(`File Size: ${(fs.statSync(cssPath).size / 1024).toFixed(2)} KB`);
    
    // Count utility classes by prefix
    const classRegex = /\.(sm|md|lg|xl|2xl)?:([\w-]+)/g;
    const classes = {};
    let match;
    
    while ((match = classRegex.exec(cssContent)) !== null) {
      const prefix = match[1] || 'base';
      const className = match[2];
      
      if (!classes[prefix]) {
        classes[prefix] = {};
      }
      
      if (!classes[prefix][className]) {
        classes[prefix][className] = 0;
      }
      
      classes[prefix][className]++;
    }
    
    // Log breakdown by media query
    console.log('\nCSS Class Distribution by Media Query:');
    for (const prefix in classes) {
      const count = Object.keys(classes[prefix]).length;
      console.log(`- ${prefix === 'base' ? 'Base classes' : `${prefix}: breakpoint`}: ${count} unique classes`);
    }
    
    // Check for potential unused utilities
    console.log('\nPotential Optimization Targets:');
    
    // Check for less common utilities that might be unused
    const unusualUtils = ['scale', 'skew', 'rotate', 'translate', 'origin', 'perspective'];
    unusualUtils.forEach(util => {
      const count = Object.keys(classes['base'] || {}).filter(c => c.startsWith(util)).length;
      if (count > 0) {
        console.log(`- Found ${count} ${util}-* utilities (consider checking if all are needed)`);
      }
    });
    
  } catch (error) {
    console.error('Error analyzing CSS bundle:', error);
  }
};

// Analyze the JS bundle
const analyzeJsBundle = () => {
  try {
    // Find the most recent JS file in the dist directory
    const distDir = path.resolve('./dist/public/assets');
    const jsFiles = fs.readdirSync(distDir).filter(file => file.endsWith('.js'));
    
    if (jsFiles.length === 0) {
      console.log('No JS files found in the dist directory');
      return;
    }
    
    const jsFile = jsFiles[0];
    const jsPath = path.join(distDir, jsFile);
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    
    console.log(`\n--- JS Bundle Analysis (${jsFile}) ---`);
    console.log(`File Size: ${(fs.statSync(jsPath).size / 1024).toFixed(2)} KB`);
    
    // Count Shadcn components usage
    const shadcnComponentPattern = /@radix-ui\/react-([a-z-]+)/g;
    const componentMatches = {};
    let match;
    
    while ((match = shadcnComponentPattern.exec(jsContent)) !== null) {
      const component = match[1];
      if (!componentMatches[component]) {
        componentMatches[component] = 0;
      }
      componentMatches[component]++;
    }
    
    // Log component usage
    console.log('\nRadix UI Component Usage:');
    const components = Object.keys(componentMatches).sort();
    
    if (components.length === 0) {
      console.log('- No Radix UI components detected in the bundle');
    } else {
      for (const component of components) {
        console.log(`- @radix-ui/react-${component}: ${componentMatches[component]} occurrences`);
      }
    }
    
  } catch (error) {
    console.error('Error analyzing JS bundle:', error);
  }
};

// Run the analysis
console.log('=== Bundle Analysis Report ===');
analyzeCssBundle();
analyzeJsBundle();
console.log('\n=== Recommendations ===');
console.log('1. To reduce CSS bundle size:');
console.log('   - Update tailwind.config.ts to use the safelist option for critical selectors');
console.log('   - Consider auditing and removing unused responsive classes');
console.log('2. To reduce JS bundle size:');
console.log('   - Import specific components rather than entire packages');
console.log('   - Set up tree-shaking with "sideEffects: false" in package.json');