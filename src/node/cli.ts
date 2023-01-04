import { cac } from 'cac';
import path from 'path';
import { build } from './build';

const version = '1.0.0';

const cli = cac('island').version(version).help();

cli.command('dev [root]', 'start dev server').action(async (root: string) => {
  root = root ? path.resolve(root) : process.cwd();
  const createServer = async () => {
    const { createDevServer } = await import('./dev.js');
    const server = await createDevServer(root, async () => {
      await server.close();
      await createServer();
    });
    await server.listen();
    server.printUrls();
  };
  await createServer();
});

cli
  .command('build [root]', 'build for production')
  .action(async (root: string) => {
    try {
      root = path.resolve(root);
      await build(root);
    } catch (e) {
      console.log(e);
    }
  });

cli.parse();
