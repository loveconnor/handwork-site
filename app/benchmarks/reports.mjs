import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const directory = path.join(process.cwd(), 'public/benchmarks');

export async function reportNames() {
  const entries = await readdir(directory, { withFileTypes: true });
  const reports = await Promise.all(entries.filter(entry => entry.isDirectory()).map(async entry => {
    try {
      await readFile(path.join(directory, entry.name, 'REPORT.md'), 'utf8');
      return entry.name;
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }));
  return reports.filter(Boolean).sort();
}

export async function readReport(name) {
  if (!(await reportNames()).includes(name)) return null;
  const source = await readFile(path.join(directory, name, 'REPORT.md'), 'utf8');
  return {
    title: source.match(/^#\s+(.+)$/m)?.[1] ?? name,
    // Keep archived-report navigation on rendered pages; the source stays intact.
    markdown: source.replace(/(\]\()\/benchmarks\/([\w-]+)\/REPORT\.md(?=[)#])/g, '$1/benchmarks/$2/'),
  };
}
