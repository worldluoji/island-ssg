
import fs from 'fs-extra';
import path from 'path';
import { loadConfigFromFile } from 'vite';
import { UserConfig } from '../shared/types/index';

type RawConfig =
  | UserConfig
  | Promise<UserConfig>
  | (() => UserConfig | Promise<UserConfig>);

function getUserConfigPath(root: string) {
    try {
      const supportConfigFiles = ['config.ts', 'config.js'];
      const configPath = supportConfigFiles
        .map((file) => path.resolve(root, file))
        .find(fs.pathExistsSync);
      return configPath;
    } catch (e) {
      console.error(`Failed to load user config: ${e}`);
      throw e;
    }
}

export async function resolveConfig(
    root: string,
    command: 'serve' | 'build',
    mode: 'development' | 'production'
  ) {
    // 1. 获取配置文件路径
    const configPath = getUserConfigPath(root);
    // 2. 读取配置文件的内容
    const result = await loadConfigFromFile({
        command, mode
    }, configPath, root);

    if (result) {
        const { config: rawConfig = {} as RawConfig } = result;
        // 三种情况:
        // 1. object
        // 2. promise
        // 3. function
        const userConfig = await (typeof rawConfig === 'function'
          ? rawConfig()
          : rawConfig);
        return [configPath, userConfig] as const;
    } else {
        return [configPath, {} as UserConfig] as const;
    }
}