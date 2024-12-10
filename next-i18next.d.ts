// next-i18next.d.ts
import 'react-i18next';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof import('../public/locales/en/common.json');
    };
  }
}
