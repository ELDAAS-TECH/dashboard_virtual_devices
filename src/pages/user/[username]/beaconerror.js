// pages/user/[username]/[logType].js

import { useRouter } from 'next/router';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import Head from 'next/head';
import Beaconerrortable from './beaconerror-table';

const LogPage = () => {
  const router = useRouter();
  const { username, email } = router.query;


  return (
    <div>
      {/* <h1>User Page: {username}</h1> */}
      <Head>
        <title>
          Customers | MyHomeBeacon
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={4}
            >

              <Stack spacing={1}>
                <Typography variant="h4">
                  Beacon Errors : {username}
                </Typography>

              </Stack>
            </Stack>
    


            <Stack spacing={1}>
              {/* <Typography variant="h6">Beacon Errors</Typography> */}
              <Beaconerrortable />
            </Stack>


      

          </Stack>
        </Container>
      </Box>

    </div>
  );
};

LogPage.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);
export default LogPage;

