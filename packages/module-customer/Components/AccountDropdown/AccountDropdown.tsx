'use client';

import { Popover, PopoverButton, Transition } from '@headlessui/react';
import Avatar from '@mui/material/Avatar';
import { stringAvatar } from '@utils/Helper';
import { AccountIcon, AddressIcon, IconAccount, LogoutIcon, OrderIcon, WishIcon } from '@voguish/module-theme/components/elements/Icon';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Fragment } from 'react';
import { Logout } from 'store';

type AccountDropdownProps = {
};

export default function AccountDropdown({
}: AccountDropdownProps) {
  const { data: session, status } = useSession();

  console.log('session', session)
  console.log('status', status)
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
            <Popover.Panel className="absolute -right-4 z-[100] mt-3 max-w-[calc(100vw-2rem)] origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-slate-200/70">
              <div className="absolute -top-[0.52rem] right-6 w-4 h-4 rotate-45 bg-white border-0 border-solid border-t border-l border-slate-200/80" />
              <Fragment>
                {
                  status !== "authenticated" ? <div className="relative z-50 w-[24rem]">
                    <div className="flex items-center justify-center gap-3 border-solid border-0 border-b border-[rgba(0,0,0,0.2)] px-6 py-5">
                      <span className="flex h-7 w-7 items-center justify-center">
                        <IconAccount />
                      </span>
                      <h3 className="m-0 text-xl font-semibold tracking-tight text-slate-900">
                        Your Account
                      </h3>
                    </div>
                    <div className="px-6 py-6">
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
                    </div>
                  </div> : <div className="relative z-50">
                    <div className="flex flex-col gap-1">
                      <div className="flex border-solid border-0 border-b border-[#E2E8F0] gap-3 p-6">
                        <Avatar
                          {...stringAvatar(session?.user?.firstname ?? 'U')}
                          className="w-[48px] h-[48px] bg-brand uppercase font-medium"
                        />
                        <div className="gap-y-2">
                          <p className="font-medium text-black">{session?.user?.firstname} {session?.user?.lastname}</p>
                          <p className="text-sm text-[#62748E]">{session?.user.email}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex gap-3 border-solid border-0  border-r-[3px]  border-[transparent] hover:border-brand hover:bg-[#F1F5F9]">
                          <Link
                            href={"/customer/account/"}
                            className="group w-full flex items-center px-6 py-3 no-underline gap-3"
                            onClick={() => close()}
                          >
                            <AccountIcon className="text-[#90A1B9] group-hover:text-brand duration-150 transition-colors" />
                            <span className="text-sm tracking-widest text-[#45556C] group-hover:text-brand duration-150 transition-colors">
                              My Profile
                            </span>
                          </Link>
                        </div>
                        <div className="flex gap-3 border-solid border-0  border-r-[3px]  border-[transparent] hover:border-brand hover:bg-[#F1F5F9]">
                          <Link
                            href={"/sales/order/history"}
                            className="group w-full flex items-center px-6 py-3 no-underline gap-3"
                            onClick={() => close()}
                          >
                            <OrderIcon className="text-[#90A1B9] group-hover:text-brand duration-150 transition-colors" />
                            <span className="text-sm tracking-widest text-[#45556C] group-hover:text-brand duration-150 transition-colors">
                              My Orders
                            </span>
                          </Link>
                        </div>
                        <div className="flex gap-3 border-solid border-0  border-r-[3px]  border-[transparent] hover:border-brand hover:bg-[#F1F5F9]">
                          <Link
                            href={"/customer/account/address"}
                            className="group w-full flex items-center px-6 py-3 no-underline gap-3"
                            onClick={() => close()}
                          >
                            <AddressIcon className="text-[#90A1B9] group-hover:text-brand duration-150 transition-colors" />
                            <span className="text-sm tracking-widest text-[#45556C] group-hover:text-brand duration-150 transition-colors">
                              My Addresses
                            </span>
                          </Link>
                        </div>
                        <div className="flex gap-3 border-solid border-0  border-r-[3px]  border-[transparent] hover:border-brand hover:bg-[#F1F5F9]">
                          <Link
                            href={"/wishlist"}
                            className="group w-full flex items-center px-6 py-3 no-underline gap-3"
                            onClick={() => close()}
                          >
                            <WishIcon className="text-[#90A1B9] group-hover:text-brand duration-150 transition-colors" />
                            <span className="text-sm tracking-widest text-[#45556C] group-hover:text-brand duration-150 transition-colors">
                              My Wishlist
                            </span>
                          </Link>
                        </div>
                      </div>
                      <div className="flex  px-6 py-4 gap-3 border-solid border-0 border-t border-[#E2E8F0]" onClick={() => {
                        close();
                        Logout();
                      }}>
                        <LogoutIcon />
                        <span className="text-sm tracking-widest text-[#FB2C36]">
                          Logout
                        </span>
                      </div>
                    </div>
                  </div>
                }
              </Fragment>

            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

