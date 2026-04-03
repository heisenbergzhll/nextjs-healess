import { useQuery } from '@apollo/client';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { STORE_CONFIG, getKeyFromStorage } from '@store/local-storage';
import { isValidArray } from '@utils/Helper';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import Containers from '@voguish/module-theme/components/ui/Container';
import { FooterPlaceHolder } from '@voguish/module-theme/components/widgets/placeholders/FooterPlaceHolder';
import Footer_Query from '@voguish/module-theme/graphql/footer.graphql';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FooterLinksResult, SubLinks } from './type';
const FooterIcon = dynamic(() => import('./FooterIcon'), {
  loading: () => (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 bg-slate-400 animate-pulse" />
      <div className="w-4 h-4 bg-slate-400 animate-pulse" />
      <div className="w-4 h-4 bg-slate-400 animate-pulse" />
      <div className="w-4 h-4 bg-slate-400 animate-pulse" />
    </div>
  ),
});

const StoreSwitcher = dynamic(
  () => import('@voguish/module-store/StoreSwitcher')
);

const parseLink = (option: SubLinks) => {
  if (option.type === 'category') {
    return `/catalog/category/${option.url_key}`;
  }

  if (option.type === 'page') {
    return `/${option.url_key}.html`;
  }

  return `/${option.url_key}`;
};

const Footer = () => {
  const { t } = useTranslation('common');

  const { data, loading } = useQuery<FooterLinksResult>(Footer_Query);
  const requiredKey = 'copyright';
  const storeData = getKeyFromStorage(STORE_CONFIG, requiredKey) || {};

  return (
    <footer>
      {loading ? (
        <FooterPlaceHolder />
      ) : (
        <ErrorBoundary>
          <div className="flex-col hidden w-full max-w-2xl gap-y-4 gap-x-10 md:flex-row-reverse md:justify-between" />
          <ErrorBoundary>
            <Containers className="justify-between hidden w-full px-0 pt-12 pb-16 md:flex">
              {data?.footerLinks.map((footerLink) => (
                <Grid key={footerLink.uid} item>
                  <Stack spacing={2}>
                    <Typography
                      variant="body1"
                      component="p"
                      className="font-semibold uppercase"
                    >
                      {footerLink.title}
                    </Typography>
                    {isValidArray(footerLink.subLinks) && (
                      <Stack spacing={0.5}>
                        {footerLink.subLinks.map((option) => (
                          <Typography
                            key={option.uid}
                            variant="body1"
                            component="p"
                            className="text-sm duration-200 text-slate-500 cta hover:text-brand max-w-fit"
                          >
                            <Link
                              className="hover:brand"
                              href={parseLink(option)}
                              rel="noopener noreferrer"
                              target={option?.open_new_tab ? '_blank' : '_self'}
                            >
                              {option.title}
                            </Link>
                          </Typography>
                        ))}
                        {footerLink.title === 'About' && (
                          <Typography
                            variant="body1"
                            component="p"
                            className="text-sm duration-200 text-slate-500 cta hover:text-brand max-w-fit"
                          >
                            <Link
                              className="hover-underline-animation"
                              href="/sitemaps.xml"
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              {t('Sitemap')}
                            </Link>
                          </Typography>
                        )}
                      </Stack>
                    )}
                  </Stack>
                </Grid>
              ))}
            </Containers>
            <div className="hidden w-full px-6 py-3 md:flex bg-secondary">
              <div className="flex flex-row items-center justify-between w-full text-white -sm:flex-col">
                <div className="flex w-full -md:justify-center">
                  <Typography className="-sm:text-center text-[0.875rem]">
                    {storeData ? storeData : ''}
                  </Typography>
                </div>
                <div className="flex items-center justify-center w-full gap-4 -md:pt-4 md:justify-end">
                  <div className="-lg:hidden">
                    <StoreSwitcher />
                  </div>
                  <div className="flex items-center -md:grid gap-1.5 -md:flex-row -sm:flex -lg:flex-col">
                    <Typography className="text-[0.875rem] lg:inline md:inline hidden  whitespace-nowrap">
                      {t('FIND US ON :')}
                    </Typography>

                    <FooterIcon />
                  </div>
                </div>
              </div>
            </div>
            <Containers className="-md:!mx-0 md:hidden -md:!px-0 px-0 pt-12 pb-3">
              <Accordion
                className=" shadow-[unset] my-0"
                elevation={0}
                defaultExpanded
              >
                <AccordionSummary
                  className="mx-0"
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography variant="body1" className="font-semibold">
                    Explore More
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className="p-0">
                  <div className="px-5 pb-4">
                    {isValidArray(data?.footerLinks) && (
                      <Grid className="grid items-start justify-between grid-cols-2 gap-4">
                        {data?.footerLinks.map((footerLink) => (
                          <Grid key={footerLink.uid} item xs={6} lg={3}>
                            <Stack spacing={2}>
                              <Typography
                                variant="body1"
                                component="p"
                                className="font-semibold uppercase"
                              >
                                {footerLink.title}
                              </Typography>
                              {isValidArray(footerLink.subLinks) && (
                                <Stack spacing={0.5}>
                                  {footerLink.subLinks.map((option) => (
                                    <Typography
                                      key={option.uid}
                                      variant="body1"
                                      className="text-sm duration-200 text-slate-500 cta hover:text-brand max-w-fit"
                                    >
                                      <Link
                                        className=""
                                        href={parseLink(option)}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                      >
                                        {option.title}
                                      </Link>
                                    </Typography>
                                  ))}
                                </Stack>
                              )}
                            </Stack>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </div>
                  <div className="flex w-full px-6 py-3 bg-secondary">
                    <div className="flex flex-row items-center justify-between w-full text-white -sm:flex-col">
                      <div className="flex w-full -md:justify-center">
                        <Typography className="-sm:text-center text-[0.875rem]">
                          {storeData ? storeData : ''}
                        </Typography>
                      </div>
                      <div className="flex items-center justify-center w-full gap-4 -md:pt-4 md:justify-end">
                        <div className="-lg:hidden">
                          <StoreSwitcher />
                        </div>
                        <div className="flex items-center -md:grid gap-1.5 -md:flex-row -sm:flex -lg:flex-col">
                          <Typography className="text-[0.875rem]">
                            {t('FIND US ON :')}
                          </Typography>
                          <FooterIcon />
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
            </Containers>
          </ErrorBoundary>
        </ErrorBoundary>
      )}
    </footer>
  );
};

export default Footer;
