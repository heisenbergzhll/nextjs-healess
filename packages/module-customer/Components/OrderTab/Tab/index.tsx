import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { removeUrlHash, useHash } from '@packages/module-common/useHash';
import { TabsProp } from '@voguish/module-catalog/types';
import { useRouter } from 'next/router';
import { ReactNode, SyntheticEvent, useEffect, useState } from 'react';

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
  right?: boolean;
}

function TabPanel(props: TabPanelProps) {
  const { right, children, value, index, ...other } = props;

  return (
    <div
      className={`  ${right ? 'px-1.5 py-3' : 'px-0 py-0 my-0'}`}
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box className={`${!right && 'py-0'} px-0 mx-0 border-none`}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function TabLayout({
  items,
  right = true,
  className,
  hash = false,
}: {
  items: TabsProp[];
  right?: boolean;
  className?: string;
  hash?: boolean;
}) {
  const router = useRouter();

  const [value, setValue] = useState(0);
  const hashValue = useHash(true);
  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (hash) {
      removeUrlHash(router);
    }
  };

  useEffect(() => {
    if (hash && hashValue) {
      items.forEach((element, index) => {
        if (
          element?.name?.toLocaleLowerCase() === hashValue?.toLocaleLowerCase()
        ) {
          setValue(index);
        }
      });
    }
  }, [hashValue]);

  return (
    <Box className={`${right ? '' : 'py-0 my-0'}`}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="basic tabs example"
        className={`  ${className}`}
        sx={{
          '& .MuiTab-root': {
            color: '#45556C',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            height: '36px',
            '&.Mui-selected': {
              color: '#fff',
              backgroundColor: '#101828!important',
            },
          },
          '& .MuiTabs-indicator': {
            display: 'none',
          },
        }}
      >
        {items.map((item) => (
          <Tab
            className={`my-0 mr-1 lg:mr-2 font-medium text-xs lg:text-sm`}
            aria-label={item.name}
            key={item.id}
            label={item.name}
            {...a11yProps(item.id - 1)}
          />
        ))}
      </Tabs>
    </Box>
  );
}
