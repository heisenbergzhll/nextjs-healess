import createEmotionServer from '@emotion/server/create-instance';
import { createEmotionCache } from '@voguish/module-theme/createEmotionCache';
import { AppType } from 'next/app';
import Document, {
  DocumentContext,
  DocumentProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import { ComponentProps, ComponentType } from 'react';
import { AppPropsWithLayout } from './_app';

interface MyDocumentProps extends DocumentProps {
  emotionStyleTags: JSX.Element[]; // eslint-disable-line
  direction: 'ltr' | 'rtl';
}

export default function MyDocument({
  emotionStyleTags,
  direction,
}: MyDocumentProps) {
  return (
    <Html lang="en" dir={direction}>
      <Head>
        {/* PWA primary color */}
        {/* <meta name="theme-color" content={theme.palette.primary.main} /> */}
        <meta name="emotion-insertion-point" content="" />
        <meta name="theme-color" content="#115E59" />
        <link rel="preconnect" href="https://devmagento.vachak.com" />
        {/* Preload Google Pay API for faster loading */}
        <link rel="preconnect" href="https://pay.google.com" />
        <script src="https://pay.google.com/gp/p/js/pay.js" async />
        {emotionStyleTags}
      </Head>
      <body aria-label="voguish">
        <Main />
        <div id="modals" />
        <div id="alerts" />
        <NextScript />
      </body>
    </Html>
  );
}

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const { locale } = ctx;
  const originalRenderPage = ctx.renderPage;

  // You can consider sharing the same Emotion cache between all the SSR requests to speed up performance.
  // However, be aware that it can have global side effects.
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (
        App: ComponentType<ComponentProps<AppType> & AppPropsWithLayout>
      ) =>
        function EnhanceApp(props) {
          return <App emotionCache={cache} {...props} />;
        },
    });

  const initialProps = await Document.getInitialProps(ctx);
  // This is important. It prevents Emotion to render invalid HTML.
  // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    direction: locale === 'ar' ? 'rtl' : 'ltr',
    emotionStyleTags,
  };
};
