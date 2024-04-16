export default [
  { heading: 'Người dùng' },
  {
    title: 'Người dùng',
    icon: { icon: 'bx-user' },
    children: [
      { title: 'Danh sách', to: 'apps-user-list' },
      // { title: 'View', to: { name: 'apps-user-view-id', params: { id: 21 } } },
    ],
  },
  { heading: 'Hệ thống' },
  {
    title: 'Quản trị hệ thống',
    icon: { icon: 'bx-file' },
    children: [
      { title: 'GPT', to: 'apps-invoice-list' },
      // { title: 'Banner', to: { name: 'apps-banner'} },
    ],
  },
  {
    title: 'GPT & DS',
    icon: { icon: 'bx-paint' },
    children: [
      { title: 'Config', to: 'apps-gptvsdfs' },
    ],
  },
  {
    title: 'Dịch vụ',
    icon: { icon: 'bxs-package' },
    children: [
      { title: 'Gói cước', to: 'apps-service-pack' },
      { title: 'Mã khuyến mại', to: 'apps-service-discount' },
    ],
  },
  {
    title: 'Prompt',
    icon: { icon: 'bxs-component' },
    children: [
      { title: 'Danh sách', to: 'apps-prompt-list' },
      { title: 'Chủ Đề', to: 'apps-prompt-chude' },
    ],
  },
  { heading: 'CSKH & BCSC' },
  {
    title: 'CSKH',
    icon: { icon: 'bx-support' },
    children: [
      { title: 'Ticket', to: 'apps-ticket' },

    ],
  },
  { heading: 'Khác' },
  {
    title: 'Doanh thu',
    icon: { icon: 'bxs-report' },
    children: [
      { title: 'Danh sách', to: 'apps-report' },

    ],
  },
  {
    title: 'Đại lý',
    icon: { icon: 'bxs-store' },
    children: [
      { title: 'Danh sách', to: 'apps-agency' },

    ],
  },
  // {
  //   title: 'CSKH',
  //   icon: { icon: 'bx-file' },
  //   children: [
  //     { title: 'List', to: 'apps-invoice-list' },
  //     { title: 'Preview', to: { name: 'apps-invoice-preview-id', params: { id: '5036' } } },
  //     { title: 'Edit', to: { name: 'apps-invoice-edit-id', params: { id: '5036' } } },
  //     { title: 'Add', to: 'apps-invoice-add' },
  //   ],
  // },
  // {
  //   title: 'Quản trị hệ thống',
  //   icon: { icon: 'bx-file' },
  //   children: [
  //     { title: 'List', to: 'apps-invoice-list' },
  //     { title: 'Preview', to: { name: 'apps-invoice-preview-id', params: { id: '5036' } } },
  //     { title: 'Edit', to: { name: 'apps-invoice-edit-id', params: { id: '5036' } } },
  //     { title: 'Add', to: 'apps-invoice-add' },
  //   ],
  // },
  // {
  //   title: 'Quản lý trợ lý',
  //   icon: { icon: 'bx-file' },
  //   children: [
  //     { title: 'List', to: 'apps-invoice-list' },
  //     { title: 'Preview', to: { name: 'apps-invoice-preview-id', params: { id: '5036' } } },
  //     { title: 'Edit', to: { name: 'apps-invoice-edit-id', params: { id: '5036' } } },
  //     { title: 'Add', to: 'apps-invoice-add' },
  //   ],
  // },
  // {
  //   title: 'Quản lý gói bán',
  //   icon: { icon: 'bx-file' },
  //   children: [
  //     { title: 'List', to: 'apps-invoice-list' },
  //     { title: 'Preview', to: { name: 'apps-invoice-preview-id', params: { id: '5036' } } },
  //     { title: 'Edit', to: { name: 'apps-invoice-edit-id', params: { id: '5036' } } },
  //     { title: 'Add', to: 'apps-invoice-add' },
  //   ],
  // },
]
