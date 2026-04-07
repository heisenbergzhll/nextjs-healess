import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useNavigationBlocker = (
  confirmMessage = 'Are you sure you want to leave this page? Unsaved changes may be lost.'
) => {
  const { t } = useTranslation('common');
  const router = useRouter();

  const [shouldBlock, setShouldBlock] = useState(false);
  const shouldBlockRef = useRef(false);
  // Track whether we're currently handling a popstate to avoid double-handling
  const isHandlingPopstateRef = useRef(false);
  // Store the path we want to protect so we can restore it
  const protectedPathRef = useRef(router.asPath);

  const updateBlocker = useCallback((value: boolean) => {
    shouldBlockRef.current = value;
    setShouldBlock(value);

    if (value) {
      // Save the current path as the protected path
      protectedPathRef.current = router.asPath;
      // Push a duplicate history entry so the back button triggers popstate
      // without immediately leaving the page
      window.history.pushState(null, '', router.asPath);
    }
  }, [router.asPath]);

  useEffect(() => {
    // --- 1. Handle tab close / refresh (beforeunload) ---
    // Note: Browsers always show their own generic message for security reasons.
    // Custom messages are ignored by modern browsers, but e.preventDefault() +
    // e.returnValue = '' is required to trigger the dialog.
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldBlockRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    // --- 2. Handle programmatic Next.js route changes ---
    // This catches router.push(), router.replace(), and <Link> clicks.
    const handleRouteChangeStart = (url: string) => {
      // Skip if we're already handling a popstate-triggered navigation
      if (isHandlingPopstateRef.current) return;

      if (router.asPath !== url && shouldBlockRef.current) {
        const confirmed = window.confirm(confirmMessage);
        if (!confirmed) {
          router.events.emit('routeChangeError');
          throw 'Route change aborted by user.';
        }
      }
    };

    // --- 3. Handle browser back/forward buttons (popstate) ---
    // This is the key fix: the browser's back button triggers popstate BEFORE
    // Next.js routeChangeStart. By the time routeChangeStart fires, the browser
    // has already updated window.location. If we throw to abort, the URL is
    // wrong. Instead, we intercept at the popstate level and restore the URL.
    const handlePopState = () => {
      if (!shouldBlockRef.current) return;

      // Prevent re-entrant handling
      if (isHandlingPopstateRef.current) return;
      isHandlingPopstateRef.current = true;

      const confirmed = window.confirm(confirmMessage);

      if (!confirmed) {
        // User cancelled — push the protected path back to restore the URL
        // This effectively "undoes" the back navigation
        window.history.pushState(null, '', protectedPathRef.current);
      }

      // Reset the flag after a tick to allow future handling
      setTimeout(() => {
        isHandlingPopstateRef.current = false;
      }, 0);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router, confirmMessage]);

  return updateBlocker;
};