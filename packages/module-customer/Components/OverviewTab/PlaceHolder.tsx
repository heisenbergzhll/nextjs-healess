import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Containers from '@voguish/module-theme/components/ui/Container';
export const PlaceHolder = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sx={{ mt: 1 }}>
        <Paper variant="outlined" sx={{ p: 1 }}>
          <Stack direction="row">
            <Box component="div" sx={{ p: 1 }}>
              <Skeleton variant="rounded" height={77} width={77}></Skeleton>
            </Box>
            <Box component="div" width={300}>
              <Skeleton variant="rounded" sx={{ my: 2, width: 1 / 2 }} />
              <Skeleton variant="rounded" sx={{ width: 1 }} />
            </Box>
          </Stack>
        </Paper>
      </Grid>

      {[...Array(4)].map((x, i) => (
        <Grid key={i} item lg={4} md={6} sm={6} xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row">
              <Box component="div">
                <Skeleton variant="rounded" width={20} />
              </Box>
              <Box component="div" width={700} sx={{ px: 1 }}>
                <Skeleton variant="rounded" height={24} />
                <Skeleton variant="rounded" sx={{ my: 0.5, width: 1 }} />
                <Skeleton variant="rounded" />
              </Box>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export const UserProfilePlaceHolder = () => {
  return (
    <div className=" flex flex-col md:flex-row  animate-pulse">
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 lg:p-4 md:p-4 p-0 lg:!pl-0 md:pl-0">
        <div className="grid grid-cols-1 gap-4 border-b border-gray-200 pb-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-300 rounded-md" />
          ))}
        </div>
      </aside>

      <main className="flex-1 mt-4 space-y-6">
        <div className="space-y-4">
          <div className="h-48 bg-gray-300 rounded"></div>
          <div className="h-6 bg-gray-300 rounded w-5/6"></div>
          <div className="h-6 bg-gray-300 rounded w-2/3"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="h-40 bg-gray-300 rounded"></div>
          <div className="h-40 bg-gray-300 rounded"></div>
        </div>
      </main>
    </div>
  );
};
