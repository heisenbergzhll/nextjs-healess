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
            <div className="bg-black">
              <Containers className="justify-between lg:px-[6.625rem] hidden w-full px-0 pt-12 pb-16 md:flex">
                <Grid>
                  <Stack spacing={2}>
                    {/* <div aria-label="unineed">
                      <Link href="/" aria-label="Go to search" passHref>
                        <Image
                          decoding="auto"
                          priority={true}
                          src="/assets/img/uni-logo.svg"
                          alt={storeData?.logo_alt || 'unineed'}
                          height={21}
                          width={186}
                        />
                      </Link>
                    </div> */}
                    {/* <Typography
                      variant="body1"
                      component="p"
                      className="text-sm duration-200 text-white cta hover:text-brand max-w-fit"
                    >
                      Follow US
                    </Typography>
                    <FooterIcon /> */}
                    <Typography
                      variant="body1"
                      component="p"
                      className="font-semibold uppercase text-white"
                    >
                      Contact us
                    </Typography>
                    <Typography
                      variant="body1"
                      component="p"
                      className="text-sm duration-200 text-white cta hover:text-brand max-w-fit"
                    >
                      +44(0) 141 673 0063
                    </Typography>
                    <Typography
                      variant="body1"
                      component="p"
                      className="font-semibold uppercase text-white"
                    >
                      Head Office:
                    </Typography>
                    <Typography
                      variant="body1"
                      component="p"
                      className="text-sm duration-200 text-white cta hover:text-brand max-w-fit"
                    >
                      33 Lynedoch Street Glasgow G3 6AA
                    </Typography>
                    <Typography
                      variant="body1"
                      component="p"
                      className="font-semibold uppercase text-white"
                    >
                      Warehouse:
                    </Typography>
                    <Typography
                      variant="body1"
                      component="p"
                      className="text-sm duration-200 text-white cta hover:text-brand max-w-fit"
                    >

                      240 Seaward Street
                      Glasgow G41 1NG
                    </Typography>


                  </Stack>
                </Grid>

                {data?.footerLinks.map((footerLink) => (
                  <Grid key={footerLink.uid}>
                    <Stack spacing={2}>
                      <Typography
                        variant="body1"
                        component="p"
                        className="font-semibold uppercase text-white"
                      >
                        {footerLink.title}
                      </Typography>
                      {isValidArray(footerLink.subLinks) && (
                        <Stack spacing={2}>
                          {footerLink.subLinks.map((option) => (
                            <Typography
                              key={option.uid}
                              variant="body1"
                              component="p"
                              className="text-sm duration-200 text-white cta hover:text-brand max-w-fit"
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
              <Containers className="-md:!mx-0 md:hidden -md:!px-0 px-0 pt-12 pb-3">
                <Accordion
                  className=" shadow-[unset] my-0 bg-black"
                  elevation={0}
                  defaultExpanded
                >
                  <AccordionSummary
                    className="mx-0"
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography variant="body1" className="font-semibold text-white/90">
                      Explore More
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className="p-0 bg-black">
                    <div className="px-5 pb-4">
                      {isValidArray(data?.footerLinks) && (
                        <Grid container className="grid items-start justify-between grid-cols-2 gap-4">
                          <Grid
                            size={{
                              xs: 6,
                              lg: 3
                            }}
                          >
                            <Stack spacing={2}>
                              <Typography
                                variant="body1"
                                component="p"
                                className="font-semibold uppercase text-white"
                              >
                                Contact us
                              </Typography>
                              <Typography
                                variant="body1"
                                component="p"
                                className="text-sm duration-200 text-white cta hover:text-brand max-w-fit"
                              >
                                +44(0) 141 673 0063
                              </Typography>
                              <Typography
                                variant="body1"
                                component="p"
                                className="font-semibold uppercase text-white"
                              >
                                Head Office:
                              </Typography>
                              <Typography
                                variant="body1"
                                component="p"
                                className="text-sm duration-200 text-white cta hover:text-brand max-w-fit"
                              >
                                33 Lynedoch Street Glasgow G3 6AA
                              </Typography>
                              <Typography
                                variant="body1"
                                component="p"
                                className="font-semibold uppercase text-white"
                              >
                                Warehouse:
                              </Typography>
                              <Typography
                                variant="body1"
                                component="p"
                                className="text-sm duration-200 text-white cta hover:text-brand max-w-fit"
                              >

                                240 Seaward Street
                                Glasgow G41 1NG
                              </Typography>


                            </Stack>
                          </Grid>
                          {data?.footerLinks.map((footerLink) => (
                            <Grid key={footerLink.uid}
                              size={{
                                xs: 6,
                                lg: 3
                              }}>
                              <Stack spacing={2}>
                                <Typography
                                  variant="body1"
                                  component="p"
                                  className="font-semibold uppercase text-white/90"
                                >
                                  {footerLink.title}
                                </Typography>
                                {isValidArray(footerLink.subLinks) && (
                                  <Stack spacing={0.5}>
                                    {footerLink.subLinks.map((option) => (
                                      <Typography
                                        key={option.uid}
                                        variant="body1"
                                        className="text-sm duration-200 text-white cta hover:text-brand max-w-fit"
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
                  </AccordionDetails>
                </Accordion>
              </Containers>
            </div>
          </ErrorBoundary>
        </ErrorBoundary>
      )}
    </footer>
  );
};

export default Footer;
