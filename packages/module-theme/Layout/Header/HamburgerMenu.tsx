import styled from '@emotion/styled';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { useEffect } from 'react';

const StyledBurger = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 1rem;
  height: 1.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;

  &:focus {
    outline: none;
  }

  div {
    width: 1.5rem;
    height: 0.15rem;
    background: ${({ open }: { open: boolean }) =>
      open ? '#0D0C1D' : '#0D0C1D'};
    border-radius: 10px;
    transition: all 0.3s linear;
    position: relative;
    transform-origin: 1px;

    :first-of-type {
      transform: ${({ open }: { open: boolean }) =>
        open ? 'rotate(45deg)' : 'rotate(0)'};
    }

    :nth-of-type(2) {
      opacity: ${({ open }: { open: boolean }) => (open ? '0' : '1')};
      transform: ${({ open }: { open: boolean }) =>
        open ? 'translateX(20px)' : 'translateX(0)'};
    }

    :nth-of-type(3) {
      transform: ${({ open }: { open: boolean }) =>
        open ? 'rotate(-45deg)' : 'rotate(0)'};
    }
  }
`;

export const Burger = ({ open, setOpen }: { open: boolean; setOpen: any }) => {
  return (
    <ErrorBoundary>
      {' '}
      <StyledBurger open={open} onClick={() => setOpen(!open)}>
        <div />
        <div />
        <div />
      </StyledBurger>
    </ErrorBoundary>
  );
};

export const useOnClickOutside = (ref: any, handler: any) => {
  useEffect(() => {
    const listener = (event: { target: any }) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]);
};
