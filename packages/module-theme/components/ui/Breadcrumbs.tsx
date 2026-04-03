import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import { isValidArray } from '@utils/Helper';
import { HTMLRenderer } from '@voguish/module-theme/components/HTMLRenderer';
import { PageOptions } from '@voguish/module-theme/page';
import { useTranslation } from 'next-i18next';
import ErrorBoundary from '../ErrorBoundary';
import Containers from './Container';
import Link from 'next/link';
const Breadcrumb = ({ title, breadCrumbs }: PageOptions) => {
  const { t } = useTranslation('common');

  return (
    <ErrorBoundary>
      {' '}
      <Containers className="w-full  lg:mt-3 md:mt-3 mt-4">
        <Breadcrumbs
          className="w-full text-left whitespace-nowrap overflow-ellipsis"
          separator="›"
          aria-label="breadcrumb"
        >
          <Link href="/" className="no-underline cta">
            <Typography className="hover-underline-animation" variant="body2">
              {t('Home')}
            </Typography>
          </Link>
          {isValidArray(breadCrumbs) ? (
            breadCrumbs?.map(({ uid, label, url }) =>
              url && url !== '' ? (
                <Link
                  key={uid + label + url}
                  href={`/${url}`}
                  className="no-underline cta max-w-fit"
                >
                  <Typography
                    className="flex flex-wrap w-full text-left !break-all whitespace-normal hover-underline-animation"
                    variant="body2"
                  >
                    {t(label)}
                  </Typography>
                </Link>
              ) : (
                <Typography
                  key={uid + label + url}
                  className="capitalize cursor-pointer max-w-fit cta"
                  variant="body2"
                >
                  <span className="flex flex-wrap w-full text-left !break-all whitespace-normal hover-underline-animation">
                    {HTMLRenderer({ htmlText: t(title) }) || t(title)}
                  </span>
                </Typography>
              )
            )
          ) : (
            <Typography
              className="capitalize break-all cursor-pointer max-w-fit cta"
              variant="body2"
            >
              <span className="flex flex-wrap w-full text-left !break-all whitespace-normal hover-underline-animation">
                {HTMLRenderer({ htmlText: t(title) }) || t(title)}
              </span>
            </Typography>
          )}
        </Breadcrumbs>
      </Containers>
    </ErrorBoundary>
  );
};
export default Breadcrumb;
