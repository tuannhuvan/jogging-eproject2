const fs = require('fs');
const path = require('path');

const uiDir = path.join(process.cwd(), 'src/components/ui');

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Direct string replacements for common broken patterns
  content = content.replace(/import \*"react"/g, 'import * as React from "react"');
  content = content.replace(/import \*"@radix-ui\/react-dropdown-menu"/g, 'import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"');
  content = content.replace(/import \{ Drawer\} from "vaul"/g, 'import { Drawer as DrawerPrimitive } from "vaul"');
  
  // More generic fixes
  content = content.replace(/import \*"([^"]+)"/g, (match, p1) => {
     const name = p1.split('/').pop().replace('react-', '').replace(/-([a-z])/g, g => g[1].toUpperCase()) + 'Primitive';
     return `import * as ${name.charAt(0).toUpperCase() + name.slice(1)} from "${p1}"`;
  });

  // Remove type annotations
  content = content.replace(/:\s*React\.ComponentProps<[^>]+>/g, '');
  content = content.replace(/:\s*React\.ComponentPropsWithoutRef<[^>]+>/g, '');
  content = content.replace(/:\s*[A-Z][\w<>[\]|& ]+(?=[,)=;])/g, '');
  content = content.replace(/}\s*&\s*{[^}]*}/g, '}');

  fs.writeFileSync(filePath, content);
}

const files = fs.readdirSync(uiDir).filter(f => f.endsWith('.js'));
files.forEach(f => fixFile(path.join(uiDir, f)));
console.log('Fixed all files');
