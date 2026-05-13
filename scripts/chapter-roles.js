(function () {
  'use strict';

  const grid = document.getElementById('roles-grid');
  const continueBtn = document.getElementById('roles-continue');
  const headerRole = document.getElementById('header-role');
  const headerRoleName = headerRole ? headerRole.querySelector('.header-role__name') : null;

  if (!grid) return;

  const { ROLES, ROLE_INDEX, iconNode } = window.TrickleRoles;

  function buildRoleCard(role, currentRoleId) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'card card--clickable role-card';
    btn.dataset.roleId = role.id;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(role.id === currentRoleId));
    if (role.id === currentRoleId) btn.classList.add('is-active');

    const iconWrap = document.createElement('div');
    iconWrap.className = 'role-card__icon';
    iconWrap.appendChild(iconNode(role.icon));

    const name = document.createElement('h3');
    name.className = 'role-card__name';
    name.textContent = role.name;

    const lede = document.createElement('p');
    lede.className = 'role-card__lede';
    lede.textContent = role.lede;

    const check = document.createElement('div');
    check.className = 'role-card__check';
    check.appendChild(iconNode('check'));

    btn.appendChild(iconWrap);
    btn.appendChild(name);
    btn.appendChild(lede);
    btn.appendChild(check);

    btn.addEventListener('click', () => {
      window.TrickleState.setRole(role.id);
      const next = document.getElementById('chapter-2');
      if (next) {
        setTimeout(() => {
          next.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 380);
      }
    });

    return btn;
  }

  function render(currentRoleId) {
    while (grid.firstChild) grid.removeChild(grid.firstChild);
    ROLES.forEach((role) => {
      grid.appendChild(buildRoleCard(role, currentRoleId));
    });
  }

  function syncHeader(roleId) {
    if (!headerRole || !headerRoleName) return;
    if (!roleId || !ROLE_INDEX[roleId]) {
      headerRole.hidden = true;
      return;
    }
    headerRole.hidden = false;
    headerRoleName.textContent = ROLE_INDEX[roleId].name;
  }

  function syncContinue(roleId) {
    if (!continueBtn) return;
    if (roleId) continueBtn.classList.add('is-visible');
    else continueBtn.classList.remove('is-visible');
  }

  function update(roleId) {
    Array.from(grid.querySelectorAll('.role-card')).forEach((el) => {
      const isActive = el.dataset.roleId === roleId;
      el.classList.toggle('is-active', isActive);
      el.setAttribute('aria-checked', String(isActive));
    });
    syncHeader(roleId);
    syncContinue(roleId);
  }

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      const next = document.getElementById('chapter-2');
      if (next) {
        next.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  const initial = window.TrickleState.getRole();
  render(initial);
  syncHeader(initial);
  syncContinue(initial);

  window.TrickleState.subscribe((roleId) => {
    update(roleId);
  });

  window.TrickleChapterRoles = { update, render };
})();
