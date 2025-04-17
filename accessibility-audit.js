import fs from 'fs';
import path from 'path';

const COMPONENTS_DIR = './client/src/components';
const UI_COMPONENTS_DIR = path.join(COMPONENTS_DIR, 'ui');

// Common accessibility patterns to check for
const accessibilityChecks = [
  {
    name: 'aria-label',
    pattern: /aria-label=/,
    good: true,
    description: 'Provides accessible labels for elements'
  },
  {
    name: 'aria-describedby',
    pattern: /aria-describedby=/,
    good: true,
    description: 'Links elements with their descriptions'
  },
  {
    name: 'aria-labelledby',
    pattern: /aria-labelledby=/,
    good: true,
    description: 'Links elements with their labels'
  },
  {
    name: 'role',
    pattern: /role=/,
    good: true,
    description: 'Explicitly defines element roles'
  },
  {
    name: 'Tab index',
    pattern: /tabIndex=/,
    good: true,
    description: 'Controls keyboard navigation order'
  },
  {
    name: 'onClick without keyboard',
    pattern: /onClick=(?!.*onKey)/,
    good: false,
    description: 'onClick without corresponding keyboard handler'
  },
  {
    name: 'sr-only',
    pattern: /sr-only/,
    good: true,
    description: 'Screen reader only content'
  },
  {
    name: 'focus management',
    pattern: /(focus-visible|focus-within|focus:)/,
    good: true,
    description: 'Proper focus styling'
  },
  {
    name: 'aria-hidden',
    pattern: /aria-hidden=/,
    good: true, 
    description: 'Hides decorative elements from screen readers'
  },
  {
    name: 'aria-expanded',
    pattern: /aria-expanded=/,
    good: true,
    description: 'Indicates expandable components state'
  },
  {
    name: 'alt text',
    pattern: /<img[^>]+alt=/,
    good: true,
    description: 'Alt text for images'
  },
  {
    name: 'color contrast',
    pattern: /text-(white|black|gray-[89]00)/,
    good: true,
    description: 'High contrast text colors'
  },
  {
    name: 'reduced motion',
    pattern: /prefers-reduced-motion/,
    good: true,
    description: 'Respects user motion preferences'
  }
];

// Check all component files
const auditComponentFiles = (directory) => {
  const results = {
    filesChecked: 0,
    accessibilityFeatures: {},
    componentsWithKeyboardAccess: [],
    componentsNeededFocus: [],
    missingAriaAttributes: []
  };
  
  // Initialize results
  accessibilityChecks.forEach(check => {
    results.accessibilityFeatures[check.name] = { count: 0, files: [] };
  });

  const processFile = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    results.filesChecked++;
    
    // Check for keyboard handlers
    const hasOnClick = /onClick=/.test(content);
    const hasKeyboardHandler = /onKey(Down|Press|Up)=/.test(content);
    
    if (hasOnClick && hasKeyboardHandler) {
      results.componentsWithKeyboardAccess.push(fileName);
    } else if (hasOnClick && !hasKeyboardHandler) {
      // Only flag if it's not using a semantic element like button
      if (!/as="button"/.test(content) && !/<button/.test(content)) {
        results.componentsNeededFocus.push(fileName);
      }
    }
    
    // Check for other accessibility patterns
    accessibilityChecks.forEach(check => {
      if (check.pattern.test(content)) {
        results.accessibilityFeatures[check.name].count++;
        results.accessibilityFeatures[check.name].files.push(fileName);
      }
    });
    
    // Check for components that might need ARIA attributes
    if (
      (/<select|<input|<textarea/.test(content) && !/(aria-label|aria-labelledby)/.test(content)) ||
      (/<div[^>]+role=/.test(content) && !/(aria-label|aria-labelledby|aria-describedby)/.test(content))
    ) {
      results.missingAriaAttributes.push(fileName);
    }
  };
  
  const processDirectory = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        processFile(filePath);
      }
    });
  };
  
  processDirectory(directory);
  return results;
};

// Run the audit
console.log('=== Accessibility Audit ===');
console.log('Checking standard UI components...');
const uiResults = auditComponentFiles(UI_COMPONENTS_DIR);
console.log('Checking application components...');
const appResults = auditComponentFiles(COMPONENTS_DIR);

// Combine results
const totalFilesChecked = uiResults.filesChecked + appResults.filesChecked;
console.log(`\nExamined ${totalFilesChecked} component files\n`);

// Report findings
console.log('=== Accessibility Features Found ===');
for (const [feature, data] of Object.entries(uiResults.accessibilityFeatures)) {
  const check = accessibilityChecks.find(c => c.name === feature);
  const status = check?.good ? '✓' : '⚠️';
  console.log(`${status} ${feature}: ${data.count} occurrences`);
}

console.log('\n=== Keyboard Navigation ===');
console.log(`✓ ${uiResults.componentsWithKeyboardAccess.length + appResults.componentsWithKeyboardAccess.length} components with both mouse and keyboard handlers`);
if (uiResults.componentsNeededFocus.length + appResults.componentsNeededFocus.length > 0) {
  console.log(`⚠️ ${uiResults.componentsNeededFocus.length + appResults.componentsNeededFocus.length} components might need keyboard handlers:`);
  [...uiResults.componentsNeededFocus, ...appResults.componentsNeededFocus].forEach(file => {
    console.log(`  - ${file}`);
  });
}

console.log('\n=== ARIA Attributes ===');
if (uiResults.missingAriaAttributes.length + appResults.missingAriaAttributes.length > 0) {
  console.log(`⚠️ ${uiResults.missingAriaAttributes.length + appResults.missingAriaAttributes.length} components might need additional ARIA attributes:`);
  [...uiResults.missingAriaAttributes, ...appResults.missingAriaAttributes].forEach(file => {
    console.log(`  - ${file}`);
  });
} else {
  console.log('✓ All interactive components appear to have proper ARIA attributes');
}

console.log('\n=== Recommendations ===');
console.log('1. For keyboard navigation:');
console.log('   - Ensure all interactive elements can be accessed via Tab key');
console.log('   - Test focus indicators are visible for all focusable elements');
console.log('2. For screen readers:');
console.log('   - Verify that form labels are properly associated with inputs');
console.log('   - Ensure all images have meaningful alt text');
console.log('3. For motion sensitivity:');
console.log('   - Continue respecting prefers-reduced-motion media query');