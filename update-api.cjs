const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace fetch('/api/... with fetch(`${import.meta.env.VITE_API_URL}/api/...
    content = content.replace(/fetch\(['"]\/api\/(.*?)['"]/g, 'fetch(`${import.meta.env.VITE_API_URL}/api/$1`');
    
    // Replace fetch(`/api/... with fetch(`${import.meta.env.VITE_API_URL}/api/...
    content = content.replace(/fetch\(`\/api\/(.*?)`/g, 'fetch(`${import.meta.env.VITE_API_URL}/api/$1`');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
