import * as React from 'react';

import PermissionsCard, {
  PermissionsCardBase,
} from 'amo/components/PermissionsCard';
import { createInternalVersion } from 'core/reducers/versions';
import {
  dispatchClientMetadata,
  fakeI18n,
  fakePlatformFile,
  fakeVersion,
  shallowUntilTarget,
} from 'tests/unit/helpers';
import Button from 'ui/components/Button';
import Permission from 'ui/components/Permission';

describe(__filename, () => {
  let store;

  beforeEach(() => {
    store = dispatchClientMetadata().store;
  });

  const createVersionWithPermissions = ({
    optional = [],
    required = [],
  } = {}) => {
    return createInternalVersion({
      ...fakeVersion,
      files: [
        {
          ...fakePlatformFile,
          optional_permissions: optional,
          permissions: required,
        },
      ],
    });
  };

  function render(props = {}) {
    return shallowUntilTarget(
      <PermissionsCard
        version={props.version || createInternalVersion(fakeVersion)}
        i18n={fakeI18n()}
        store={store}
        {...props}
      />,
      PermissionsCardBase,
    );
  }

  describe('no permissions', () => {
    it('renders nothing without a version', () => {
      const root = render({ version: null });
      expect(root).not.toHaveClassName('PermissionsCard');
    });

    it('renders nothing for a version with no permissions', () => {
      const root = render({ version: createVersionWithPermissions() });
      expect(root).not.toHaveClassName('PermissionsCard');
    });

    it('renders nothing for a version with no displayable permissions', () => {
      const root = render({
        version: createVersionWithPermissions({
          optional: ['activeTab'],
          required: ['activeTab'],
        }),
      });
      expect(root).not.toHaveClassName('PermissionsCard');
    });
  });

  describe('with permissions', () => {
    it('renders learn more button', () => {
      const permission = 'bookmarks';
      const root = render({
        version: createVersionWithPermissions({ required: [permission] }),
      });
      expect(root).toHaveClassName('PermissionsCard');
      expect(root.find(Button)).toHaveClassName('PermissionCard-learn-more');
      expect(root.find(Button)).toHaveProp('externalDark', true);
    });

    it('renders required permissions only', () => {
      const permission = 'bookmarks';
      const root = render({
        version: createVersionWithPermissions({ required: [permission] }),
      });
      expect(root).toHaveClassName('PermissionsCard');
      expect(root.find('p')).toHaveClassName(
        'PermissionsCard-subhead--required',
      );
      expect(root.find('ul')).toHaveClassName('PermissionsCard-list--required');
      expect(root.find(Permission)).toHaveProp('type', permission);
      expect(root.find('.PermissionsCard-subhead--optional')).toHaveLength(0);
      expect(root.find('.PermissionsCard-list--optional')).toHaveLength(0);
    });

    it('renders optional permissions only', () => {
      const permission = 'bookmarks';
      const root = render({
        version: createVersionWithPermissions({ optional: [permission] }),
      });
      expect(root).toHaveClassName('PermissionsCard');
      expect(root.find('p')).toHaveClassName(
        'PermissionsCard-subhead--optional',
      );
      expect(root.find('ul')).toHaveClassName('PermissionsCard-list--optional');
      expect(root.find(Permission)).toHaveProp('type', permission);
      expect(root.find('.PermissionsCard-subhead--required')).toHaveLength(0);
      expect(root.find('.PermissionsCard-list--required')).toHaveLength(0);
    });

    it('renders both optional and required permissions', () => {
      const optionalPermission = 'bookmarks';
      const requiredPermission = 'history';
      const root = render({
        version: createVersionWithPermissions({
          optional: [optionalPermission],
          required: [requiredPermission],
        }),
      });
      expect(root).toHaveClassName('PermissionsCard');
      expect(root.find('p').at(0)).toHaveClassName(
        'PermissionsCard-subhead--required',
      );
      expect(
        root.find('.PermissionsCard-list--required').find(Permission),
      ).toHaveProp('type', requiredPermission);
      expect(root.find('p').at(1)).toHaveClassName(
        'PermissionsCard-subhead--optional',
      );
      expect(
        root.find('.PermissionsCard-list--optional').find(Permission),
      ).toHaveProp('type', optionalPermission);
    });
  });
});
