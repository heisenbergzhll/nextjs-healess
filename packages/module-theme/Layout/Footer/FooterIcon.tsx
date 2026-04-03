import dynamic from 'next/dynamic';
import Link from 'next/link';
import Button from '@mui/material/Button';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { getKeyFromStorage, STORE_CONFIG } from '@store/local-storage';
import XIcon from '@voguish/module-theme/components/elements/Icon';
import { WhatsApp } from '@mui/icons-material';

const iconComponents: Record<string, any> = {
  facebook_url: dynamic(() => import('@mui/icons-material/Facebook'), {
    ssr: false,
  }),
  instagram_url: dynamic(() => import('@mui/icons-material/Instagram'), {
    ssr: false,
  }),
  twitter_url: dynamic(() => import('@mui/icons-material/Twitter'), {
    ssr: false,
  }),
  linkedin_url: dynamic(() => import('@mui/icons-material/LinkedIn'), {
    ssr: false,
  }),
  youtube_url: dynamic(() => import('@mui/icons-material/YouTube'), {
    ssr: false,
  }),
  whatsapp_url: WhatsApp,
  tiktok_url: dynamic(
    () => import('@packages/module-theme/components/elements/TiktokIcon'),
    { ssr: false }
  ),
  threads_url: dynamic(
    () => import('@packages/module-theme/components/elements/ThreadsIcon'),
    { ssr: false }
  ),
  snapchat_url: dynamic(
    () => import('@packages/module-theme/components/elements/SnapChat'),
    { ssr: false }
  ),
  telegram_url: dynamic(() => import('@mui/icons-material/Telegram'), {
    ssr: false,
  }),
  reddit_url: dynamic(() => import('@mui/icons-material/Reddit'), {
    ssr: false,
  }),
  pinterest_url: dynamic(() => import('@mui/icons-material/Pinterest'), {
    ssr: false,
  }),
  bereal_url: dynamic(
    () => import('@packages/module-theme/components/elements/BeReal'),
    { ssr: false }
  ),
  discord_url: dynamic(
    () => import('@packages/module-theme/components/elements/DiscordIcon'),
    { ssr: false }
  ),
  clubhouse_url: dynamic(
    () => import('@packages/module-theme/components/elements/ClubHouse'),
    { ssr: false }
  ),
};

const socialPlatforms = [
  { key: 'facebook_url', label: 'Facebook' },
  { key: 'instagram_url', label: 'Instagram' },
  { key: 'twiter_url', label: 'X', overrideKey: 'twitter_url' },
  { key: 'linkedin_url', label: 'LinkedIn' },
  { key: 'youtube_url', label: 'YouTube' },
  { key: 'whatsapp_url', label: 'WhatsApp' },
  { key: 'tiktok_url', label: 'TikTok' },
  { key: 'threads_url', label: 'Threads' },
  { key: 'snapchat_url', label: 'Snapchat' },
  { key: 'telegram_url', label: 'Telegram' },
  { key: 'reddit_url', label: 'Reddit' },
  { key: 'pinterest_url', label: 'Pinterest' },
  { key: 'bereal_url', label: 'BeReal' },
  { key: 'discord_url', label: 'Discord' },
  { key: 'clubhouse_url', label: 'Clubhouse' },
];

export default function FooterIcon() {
  const getUrl = (key: string) => getKeyFromStorage(STORE_CONFIG, key);

  return (
    <ErrorBoundary>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
        {socialPlatforms.map(({ key, label, overrideKey }) => {
          const resolvedKey = overrideKey || key;
          const url = getUrl(key);
          if (!url) return null;

          const Icon =
            resolvedKey === 'twitter_url' ? XIcon : iconComponents[resolvedKey];
          if (!Icon) return null;

          return (
            <Link
              key={resolvedKey}
              href={url}
              target="_blank"
              className="no-underline"
            >
              <Button
                aria-label={label}
                title={label}
                variant="outlined"
                className="
                  text-white border border-white 
                  w-8 h-8 sm:w-10 sm:h-8 md:w-8 md:h-8 
                  flex items-center justify-center 
                  min-w-0 min-h-0 p-2   transition-all
                "
              >
                <Icon fontSize="small" />
              </Button>
            </Link>
          );
        })}
      </div>
    </ErrorBoundary>
  );
}
