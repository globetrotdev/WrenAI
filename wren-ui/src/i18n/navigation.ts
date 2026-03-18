import { NextRouter } from 'next/router';

export const pushWithLocale = async (router: NextRouter, href: string) => {
  /* Use the current locale when navigating to ensure the user stays in their preferred language */
  return router.push(href, href, { locale: router.locale });
};
