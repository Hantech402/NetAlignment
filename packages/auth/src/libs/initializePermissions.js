export function initializePermissions({ permissionsManager }) {
  permissionsManager.define('isAdmin', {
    check: user => user.role === 'admin',
  });

  return permissionsManager;
}
