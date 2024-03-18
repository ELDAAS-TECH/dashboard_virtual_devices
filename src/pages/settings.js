// src/pages/settings.js
import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import {
  Box,
  Container,
  Stack,
  Typography,
  Button,
  Grid,
  Tabs,
  Tab,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  TextField,
} from "@mui/material";
import { SettingsNotifications } from "src/sections/settings/settings-notifications";
import { SettingsPassword } from "src/sections/settings/settings-password";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { useRouter } from "next/router";
import { ChromePicker } from "react-color";
import Slider from "@mui/material/Slider";
import { AccountProfile } from "src/sections/account/account-profile";
import { AccountProfileDetails } from "src/sections/account/account-profile-details";
import PropTypes from "prop-types";
import axios from "axios";
import FileUploadComponent from "src/sections/settings/FileUploadComponent";
import { useAuthContext } from "src/contexts/auth-context";
import getGlobalDeviceSettings from "src/services/settings/getGlobalDeviceSettings";
import AlertPopup from "src/components/alert-popups/AlertPopup";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Page = () => {
  const [userId, setUserId] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [beaconData, setBeaconData] = useState({
    color: { r: 0, g: 0, b: 0, a: 1 },
    onTime: "",
    offTime: "",
    duration: "",
    brightness: "",
  });

  const [buzzerData, setBuzzerData] = useState({
    onTime: "",
    offTime: "",
    duration: "",
  });

  // const [brightness, setBrightness] = useState(50);
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    if (newValue === 1) {
    }
    setValue(newValue);
  };
  const router = useRouter();
  const { username, email } = router.query;

  const handleBeconClick = () => {
    router.push("/settings/beacon");
  };

  const handleGaragePuckClick = () => {
    router.push("/settings/garagepuck");
  };

  const handleUserSettingsClick = () => {
    router.push("/settings/usersetting");
  };

  const handleColorChange = (color) => {
    setBeaconData((prevData) => ({
      ...prevData,
      color: color.rgb,
    }));
  };

  const handleBrightnessChange = (event, newValue) => {
    setBeaconData((prevData) => ({
      ...prevData,
      brightness: newValue,
    }));
  };

  const [chargeControlData, setChargeControlData] = useState({
    minBatteryPercentage: "",
  });

  const handleInputChange = (event, section, field) => {
    const value = event.target.value;
    switch (section) {
      case "beacon":
        setBeaconData((prevData) => ({
          ...prevData,
          [field]: value,
        }));
        break;
      case "buzzer":
        setBuzzerData((prevData) => ({
          ...prevData,
          [field]: value,
        }));
        break;
      case "chargeControl":
        setChargeControlData((prevData) => ({
          ...prevData,
          [field]: value,
        }));
        break;
      default:
        break;
    }
  };

  const handleSave = (section) => {
    // Handle saving data or API calls here based on section
    switch (section) {
      case "beacon":
        console.log("Saving Beacon Data:", beaconData);
        break;
      case "buzzer":
        console.log("Saving Buzzer Data:", buzzerData);
        break;
      case "chargeControl":
        console.log("Saving Charge Control Data:", chargeControlData.minBatteryPercentage);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getGlobalDeviceSettings();

        const responseBody = response?.data?.current_settings;
        setBeaconData({
          color: {
            r: responseBody?.[0]?.R,
            g: responseBody?.[0]?.G,
            b: responseBody?.[0]?.B,
            a: 1,
          },
          onTime: responseBody?.[0]?.ON_TIME,
          offTime: responseBody?.[0]?.OFF_TIME,
          duration: responseBody?.[0]?.DURATION,
          brightness: responseBody?.[0]?.BRIGHTNESS,
        });
        setBuzzerData({
          onTime: responseBody?.[1].ON_TIME,
          offTime: responseBody?.[1].OFF_TIME,
          duration: responseBody?.[1].DURATION,
        });
        setChargeControlData({
          minBatteryPercentage: responseBody?.[1].charge_control,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const idToken = localStorage.getItem("idToken");

      const dataToSend = {
        user_id: userId,
        Individual: false,
        R: beaconData.color.r,
        G: beaconData.color.g,
        B: beaconData.color.b,
        led_BRIGHTNESS: beaconData?.brightness,
        led_ON_TIME: beaconData.onTime,
        led_OFF_TIME: beaconData.offTime,
        led_DURATION: beaconData.duration,
        buzz_ON_TIME: buzzerData.onTime,
        buzz_OFF_TIME: buzzerData.offTime,
        buzz_DURATION: buzzerData.duration,
        charge_control: chargeControlData.minBatteryPercentage,
      };

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `https://m1kiyejux4.execute-api.us-west-1.amazonaws.com/dev/api/v1/devices/storeDeviceProps/`,
        headers: {
          authorization: `Bearer ${idToken}`,
        },
        data: dataToSend,
      };

      const response = await axios.request(config);

      if (response) {
        setSnackbarMessage("Device Settings Updated Successfully ");
        setSnackbarOpen(true);
      }
      if (response.status !== 200) {
        throw new Error("Failed to save data");
      }
    } catch (error) {
      setSnackbarMessage("Error Updating data:");
      setSnackbarOpen(true);
      console.error("Error saving data:", error);
    }
  };

  return (
    <>
      <Head>
        <title>Settings | MyHomeBeacon</title>
      </Head>

      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="none"
            aria-label="basic tabs example"
          >
            <Tab
              label="Profile "
              {...a11yProps(0)}
              sx={{
                backgroundColor: value === 0 ? "rgba(229, 228, 226,0.7)" : "inherit",
                width: "15vw",
                padding: "5px",
                border: value === 0 ? "1px solid rgb(169, 169, 169)" : "transparent",
                borderTopLeftRadius: value === 0 ? "10px" : "0",
                borderTopRightRadius: value === 0 ? "10px" : "0",
                borderBottom: value === 0 ? "0" : "1px solid rgb(169, 169, 169)",
              }}
            />
            <Tab
              label="Global Device Settings"
              {...a11yProps(1)}
              sx={{
                backgroundColor: value === 1 ? "rgba(229, 228, 226,0.7)" : "inherit",
                width: "15vw",
                padding: "5px",
                border: value === 1 ? "1px solid rgb(169, 169, 169)" : "transparent",
                borderTopLeftRadius: value === 1 ? "10px" : "0",
                borderTopRightRadius: value === 1 ? "10px" : "0",
                borderBottom: value === 1 ? "0" : "1px solid rgb(169, 169, 169)",
              }}
            />
            <Tab
              label="Upload Tuya credentials"
              {...a11yProps(2)}
              sx={{
                backgroundColor: value === 2 ? "rgba(229, 228, 226,0.7)" : "inherit",
                width: "15vw",
                padding: "5px",
                border: value === 2 ? "1px solid rgb(169, 169, 169)" : "transparent",
                borderTopLeftRadius: value === 2 ? "10px" : "0",
                borderTopRightRadius: value === 2 ? "10px" : "0",
                borderBottom: value === 2 ? "0" : "1px solid rgb(169, 169, 169)",
              }}
            />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <Container maxWidth="lg">
            <Stack spacing={3}>
              <Grid container spacing={3}>
                <Grid xs={12} md={6} lg={8}>
                  <AccountProfileDetails />
                </Grid>
                <Grid xs={12} md={6} lg={4}>
                  {/* <AccountProfile /> */}
                </Grid>
              </Grid>
            </Stack>
          </Container>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
            }}
          >
            <Stack spacing={1}>
              <Container sx={{ display: "-webkit-flex" }}>
                <Card>
                  <CardHeader
                    title="Beacon"
                    sx={{ paddingTop: 2, paddingRight: 3, paddingBottom: 2 }}
                  />
                  {/* <Divider /> */}
                  <CardContent sx={{ display: "flex", paddingBottom: 0, paddingTop: 0 }}>
                    <ChromePicker color={beaconData.color} onChange={handleColorChange} />
                    <Stack spacing={1} paddingLeft={5} sx={{ maxWidth: 700 }}>
                      <Box
                        sx={{
                          width: 400,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography fontSize={20} fontWeight="bold">
                          LED :
                        </Typography>
                      </Box>
                      <Box sx={{ width: 400 }}>
                        <Typography>Brightness:</Typography>
                        <Stack spacing={1} direction="row">
                          <Slider
                            value={beaconData.brightness}
                            onChange={handleBrightnessChange}
                            aria-label="Default"
                            valueLabelDisplay="auto"
                          />
                          <Typography>{beaconData.brightness}</Typography>
                        </Stack>
                      </Box>
                      <TextField
                        label="Pattern On-Time (ms)"
                        value={beaconData.onTime}
                        onChange={(e) => handleInputChange(e, "beacon", "onTime")}
                      />
                      <TextField
                        label="Pattern Off-Time (ms)"
                        value={beaconData.offTime}
                        onChange={(e) => handleInputChange(e, "beacon", "offTime")}
                      />
                      <TextField
                        label="Active Duration (sec)"
                        value={beaconData.duration}
                        onChange={(e) => handleInputChange(e, "beacon", "duration")}
                      />
                    </Stack>
                    <Stack spacing={1} paddingLeft={5} sx={{ maxWidth: 700 }}>
                      <Box
                        sx={{
                          width: 400,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography fontSize={20} fontWeight="bold">
                          Buzzer :
                        </Typography>
                      </Box>
                      <TextField
                        label="On-Time (ms)"
                        value={buzzerData.onTime}
                        onChange={(e) => handleInputChange(e, "buzzer", "onTime")}
                      />
                      <TextField
                        label="Off-Time (ms)"
                        value={buzzerData.offTime}
                        onChange={(e) => handleInputChange(e, "buzzer", "offTime")}
                      />
                      <TextField
                        label="Duration"
                        value={buzzerData.duration}
                        onChange={(e) => handleInputChange(e, "buzzer", "duration")}
                      />
                    </Stack>
                  </CardContent>
                  <Card>
                    <CardHeader
                      title="Charge Control"
                      sx={{ paddingTop: 2, paddingRight: 3, paddingBottom: 2 }}
                    />
                    {/* <Divider /> */}
                    <CardContent sx={{ paddingBottom: 0, paddingTop: 0 }}>
                      <Stack spacing={1} sx={{ maxWidth: 700 }}>
                        <TextField
                          label="Minimum battery percentage to start charge"
                          value={chargeControlData.minBatteryPercentage}
                          onChange={(e) =>
                            handleInputChange(e, "chargeControl", "minBatteryPercentage")
                          }
                        />
                      </Stack>
                    </CardContent>
                    {/* <Divider /> */}
                    {/* <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button variant="contained" onClick={() => handleSave('chargeControl')}>
                    Save
                  </Button>
                </CardActions> */}
                  </Card>
                  {/* <Divider /> */}
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      onClick={() => {
                        handleSave("beacon");
                        handleSubmit();
                      }}
                    >
                      Save
                    </Button>
                  </CardActions>
                </Card>
              </Container>
            </Stack>
          </Box>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <FileUploadComponent />
        </CustomTabPanel>
      </Box>
      {snackbarOpen && (
        <AlertPopup
          snackbarOpen={snackbarOpen}
          handleSnackbarClose={handleSnackbarClose}
          snackbarMessage={snackbarMessage}
        />
      )}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
