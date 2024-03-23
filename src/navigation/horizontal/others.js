export default [
  {
    title: 'Others',
    icon: { icon: 'bx-dots-horizontal-rounded' },
    children: [
      {
        title: 'Access Control',
        icon: { icon: 'bx-shield' },
        to: 'access-control',
        action: 'read',
        subject: 'AclDemo',
      },
      {
        title: 'Nav Levels',
        icon: { icon: 'bx-menu' },
        children: [
          {
            title: 'Level 2.1',
            to: null,
          },
          {
            title: 'Level 2.2',
            children: [
              {
                title: 'Level 3.1',
                to: null,
              },
              {
                title: 'Level 3.2',
                to: null,
              },
            ],
          },
        ],
      },
      {
        title: 'Disabled Menu',
        to: null,
        icon: { icon: 'bx-hide' },
        disable: true,
      },
      {
        title: 'Raise Support',
        href: '',
        icon: { icon: 'bx-support' },
        target: '_blank',
      },
      {
        title: 'Documentation',
        href: '',
        icon: { icon: 'bx-file' },
        target: '_blank',
      },
    ],
  },
]
