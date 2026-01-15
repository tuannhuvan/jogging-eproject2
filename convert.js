const fs = require('fs');
const path = require('path');

const files = [
  'src/components/footer.tsx',
  'src/components/ui/collapsible.tsx',
  'src/components/ui/context-menu.tsx',
  'src/components/ui/dropdown-menu.tsx',
  'src/components/ui/kbd.tsx',
  'src/components/ui/menubar.tsx',
  'src/components/ui/sidebar.tsx',
  'src/components/ui/table.tsx',
  'src/components/ui/toggle-group.tsx',
  'src/components/ui/toggle.tsx',
  'src/components/ui/item.tsx',
  'src/components/ui/command.tsx',
  'src/components/ui/radio-group.tsx',
  'src/components/ui/breadcrumb.tsx',
  'src/components/ui/accordion.tsx',
  'src/components/ui/alert.tsx',
  'src/components/ui/calendar.tsx',
  'src/components/ui/drawer.tsx',
  'src/components/ui/empty.tsx',
  'src/components/ui/field.tsx',
  'src/components/ui/hover-card.tsx',
  'src/components/ui/navigation-menu.tsx',
  'src/components/ui/resizable.tsx',
  'src/components/ui/scroll-area.tsx',
  'src/components/ui/sheet.tsx',
  'src/components/ui/sonner.tsx',
  'src/components/ui/switch.tsx',
  'src/components/ui/tooltip.tsx',
  'src/components/ui/chart.tsx',
  'src/components/ui/alert-dialog.tsx',
  'src/components/ui/aspect-ratio.tsx',
  'src/components/ui/button-group.tsx',
  'src/components/ui/input-group.tsx',
  'src/components/ui/input-otp.tsx',
  'src/components/ui/pagination.tsx',
  'src/components/ui/popover.tsx',
  'src/components/ui/progress.tsx',
  'src/components/ui/slider.tsx',
  'src/components/ui/tabs.tsx'
];

function convert(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Basic TS to JS conversion using regex
  content = content
    // Remove imports of types
    .replace(/import type \{.*\} from '.*';?\n?/g, '')
    .replace(/import type .* from '.*';?\n?/g, '')
    // Remove type annotations in imports
    .replace(/import \{.*type .*,.*\} from '.*';?\n?/g, (match) => match.replace(/type\s+\w+,?\s*/g, ''))
    // Remove interfaces
    .replace(/interface\s+\w+\s*(\{[^}]*\}|extends\s+\w+\s*\{[^}]*\})/g, '')
    // Remove type aliases
    .replace(/type\s+\w+\s*=\s*[^;]+;?/g, '')
    // Remove type annotations in function parameters and variables
    // Handle : React.ComponentProps<typeof ...>
    .replace(/:\s*React\.ComponentProps<typeof\s+[^>]+>/g, '')
    // Handle : Type
    .replace(/:\s*[A-Z][\w<>[\]|& ]+(?=[,)=;])/g, '')
    // Handle <Type> in function calls or definitions (generics)
    .replace(/<[A-Z][\w<>[\]|& ]+>(?=[(])/g, '')
    // Remove "as Type"
    .replace(/\s+as\s+[A-Z][\w<>[\]|& ]+/g, '')
    // Remove generic parameters in React components
    .replace(/<[A-Z]\w*>/g, '')
    // Clean up empty lines left by interfaces/types
    .replace(/^\s*[\r\n]/gm, '');

  const newPath = filePath.replace(/\.tsx$/, '.js');
  fs.writeFileSync(newPath, content);
  console.log(`Converted ${filePath} to ${newPath}`);
  fs.unlinkSync(filePath);
}

files.forEach(convert);
