import { Module } from 'makeen';

class Admin extends Module {
  hooks = {
    'makeen.security.definePermissions': ({ permissionsManager }) => {
      permissionsManager
        .define('p21')
        .define('admin', {
          check: user => user.email === 'zamfir.victor@gmail.com',
          dependencies: ['p21'],
        })
        .define('p1');
    },
  };

  async setup() {
    await this.dependency('makeen.security');
  }
}

export default Admin;
