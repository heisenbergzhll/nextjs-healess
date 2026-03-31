import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { TabsProp } from '@voguish/module-catalog/types';
import { ReactNode, SyntheticEvent, useEffect, useState } from 'react';
import { useHash, removeUrlHash } from '@packages/module-common/useHash';
import { useRouter } from 'next/router';

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

  console.log(items, '');
  return (
    <Box sx={{ width: '100%' }} className={`${right ? '' : 'py-0 my-0'}`}>
      <Box
        className={` mx-2 ${
          right ? '' : 'flex justify-center mx-auto max-w-[90rem] px-0 sm:px-6'
        }`}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          className={`!border-b border-solid border-gray-200 border-l-0 border-r-0 border-t-0 ${className}`}
        >
          {items.map((item) => (
            <Tab
              className={`my-0 ${
                value === item.id - 1 ? 'font-semibold' : 'font-normal'
              }`}
              aria-label={item.name}
              key={item.id}
              label={item.name}
              {...a11yProps(item.id - 1)}
            />
          ))}
        </Tabs>
      </Box>
      {items.map((item) => (
        <TabPanel right={right} value={value} index={item.id - 1} key={item.id}>
          {item.render()}
        </TabPanel>
      ))}
    </Box>
  );
}
