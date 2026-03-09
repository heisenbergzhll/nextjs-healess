'use client';

import { Popover, PopoverButton, Transition } from '@headlessui/react';
import { IconAccount } from '@voguish/module-theme/components/elements/Icon';
import Link from 'next/link';
import { Fragment } from 'react';
import { Logout } from 'store';

type AccountDropdownProps = {
  profileUrl: string;
  isLoggedIn: boolean;
};

export default function AccountDropdown({
  profileUrl,
  isLoggedIn,
}: AccountDropdownProps) {
  return (
    <Popover className="relative">
      {({ close }) => (
        <>
          <PopoverButton
            type="button"
            aria-label="Open account menu"
            className="relative flex h-7 w-7 items-center justify-center cursor-pointer border-none bg-transparent p-0 outline-none hover:text-brand  md:h-8 md:w-8"
          >
            <IconAccount hover="stroke-black group-hover:stroke-brand duration-150" />
          </PopoverButton>

          <Transition
            as={Fragment}
            enter="transition ease-in duration-300"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute -right-4 z-[60] mt-3 w-[24rem] max-w-[calc(100vw-2rem)] origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-slate-200/70">
              <div className="absolute -top-[0.52rem] right-6 w-4 h-4 rotate-45 bg-white border-0 border-solid border-t border-l border-slate-200/80" />
              <div className="relative z-[1]">
                <div className="flex items-center justify-center gap-3 border-solid border-0 border-b border-[rgba(0,0,0,0.2)] px-6 py-5">
                  <span className="flex h-7 w-7 items-center justify-center">
                    <IconAccount />
                  </span>
                  <h3 className="m-0 text-xl font-semibold tracking-tight text-slate-900">
                    Your Account
                  </h3>
                </div>
                <div className="px-6 py-6">
                  {!isLoggedIn ? (
                    <div className="flex flex-col gap-3">
                      <Link
                        href="/customer/account/login"
                        className="no-underline"
                        onClick={() => close()}
                      >
                        <span className="flex w-full items-center justify-center rounded-full border-solid border-1 border-black px-6 py-4 text-sm font-semibold uppercase tracking-widest text-black">
                          Existing user? Login
                        </span>
                      </Link>

                      <Link
                        href="/customer/account/create"
                        className="no-underline"
                        onClick={() => close()}
                      >
                        <span className="flex w-full items-center justify-center rounded-full bg-brand px-6 py-4 text-sm font-semibold uppercase tracking-widest text-white">
                          Sign up, it&apos;s free!
                        </span>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <Link
                        href={profileUrl}
                        className="no-underline"
                        onClick={() => close()}
                      >
                        <span className="flex w-full items-center justify-center rounded-full border-2 border-slate-900 px-6 py-4 text-sm font-semibold uppercase tracking-widest text-slate-900">
                          My account
                        </span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          close();
                          Logout();
                        }}
                        className="flex w-full items-center justify-center rounded-full bg-brand px-6 py-4 text-sm font-semibold uppercase tracking-widest text-white"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

