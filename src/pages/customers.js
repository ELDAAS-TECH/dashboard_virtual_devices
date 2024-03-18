import * as React from "react";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Box, Button, Container, Stack, SvgIcon, Typography } from "@mui/material";
import {
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  TextField,
} from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { ChromePicker } from "react-color";
import Materialtable from "src/sections/customer/material-table";
import CogIcon from "@heroicons/react/24/solid/CogIcon";
import { styled } from "@mui/material/styles";
import Slider from "@mui/material/Slider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import getGlobalDeviceSettings from "src/services/settings/getGlobalDeviceSettings";

const now = new Date();

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const Page = () => {
  const [open, setOpen] = React.useState(false);
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState("lg");
  const router = useRouter();
  const { username } = router.query;

  const [selectedSubValues, setSelectedSubValues] = useState([]);

  const [defaultSettings, setDefaultSettings] = useState(null);

  const [value, setValue] = React.useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleBrightnessChange = (event, newValue) => {
    setBeaconData((prevData) => ({
      ...prevData,
      brightness: newValue,
    }));
  };

  const [beaconData, setBeaconData] = useState({
    color: { r: 0, g: 0, b: 0, a: 1 },
    brightness: "50",
    onTime: "",
    offTime: "",
    duration: "",
  });

  const [buzzerData, setBuzzerData] = useState({
    onTime: "",
    offTime: "",
    duration: "",
  });

  const handleColorChange = (color) => {
    setBeaconData((prevData) => ({
      ...prevData,
      color: color.rgb,
    }));
  };

  const [chargeControlData, setChargeControlData] = useState({
    minBatteryPercentage: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idToken = localStorage.getItem("idToken");
        const { username } = router.query;

        if (!username) {
          console.error("Username not provided in the URL.");
          return;
        }
        const response = await axios.get(
          "https://m1kiyejux4.execute-api.us-west-1.amazonaws.com/dev/api/v1/users/getUsers",
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        const user = response.data["AWS-result"].find((user) => user.family_name === username);

        if (!user) {
          console.error(`User with username ${username} not found.`);
          return;
        }

        const obtainedUserId = user.sub;
        setUserId(obtainedUserId);

        const responseSettings = await axios.post(
          `https://m1kiyejux4.execute-api.us-west-1.amazonaws.com/dev/api/v1/devices/getCurrentSettings/${obtainedUserId}`,
          {
            user_id: obtainedUserId,
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        if (responseSettings.data && responseSettings.data.success) {
          setDefaultSettings(responseSettings.data.current_settings);
        } else {
          console.error("Failed to fetch default settings.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [username]);

  useEffect(() => {
    if (defaultSettings) {
      const beaconDefaultSettings = defaultSettings.find((setting) => setting.Beacon === "LED");

      const buzzerDefaultSettings = defaultSettings.find((setting) => setting.Beacon === "Buzzer");

      const chargeControlDefaultSettings = defaultSettings.find(
        (setting) => setting.Beacon === "Buzzer"
      );

      if (beaconDefaultSettings) {
        setBeaconData({
          color: {
            r: beaconDefaultSettings.R,
            g: beaconDefaultSettings.G,
            b: beaconDefaultSettings.B,
            a: 1,
          },
          brightness: beaconDefaultSettings.BRIGHTNESS,
          onTime: beaconDefaultSettings.ON_TIME,
          offTime: beaconDefaultSettings.OFF_TIME,
          duration: beaconDefaultSettings.DURATION,
        });
      }

      if (buzzerDefaultSettings) {
        setBuzzerData({
          onTime: buzzerDefaultSettings.ON_TIME,
          offTime: buzzerDefaultSettings.OFF_TIME,
          duration: buzzerDefaultSettings.DURATION,
        });
      }

      if (chargeControlDefaultSettings) {
        setChargeControlData({
          minBatteryPercentage: chargeControlDefaultSettings.charge_control,
        });
      }
    }
  }, [defaultSettings]);

  const handleSelectedSubValuesChange = (subValues) => {
    setSelectedSubValues(subValues);
  };

  const handleSubmit = async (sub) => {
    try {
      const idToken = localStorage.getItem("idToken");

      const dataToSend = {
        user_id: sub,
        Individual: true,
        R: beaconData.color.r,
        G: beaconData.color.g,
        B: beaconData.color.b,
        led_BRIGHTNESS: beaconData.brightness,
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

      console.log("Data to send:", dataToSend);

      const response = await axios.request(config);
      console.log("API Response:", response);

      if (response.status !== 200) {
        throw new Error("Failed to save data");
      }
      setSnackbarMessage("Device settings updated successfully");
      setSnackbarOpen(true);
      console.log("Data saved successfully");
    } catch (error) {
      setSnackbarMessage("Error saving data");
      setSnackbarOpen(true);
      console.error("Error saving data:", error);
    }
  };

  const handleSaveButtonClick = () => {
    const validSubValues = selectedSubValues.filter(
      (sub) => sub.sub !== undefined && sub.sub !== null
    );

    validSubValues.forEach((sub) => {
      handleSubmit(sub.sub);
      handleClose();
    });
  };

  const handleInputChange = (event, section, field) => {
    const value = event.target.value;
    const numericValue = value === "" ? "" : parseFloat(value);
    switch (section) {
      case "beacon":
        setBeaconData((prevData) => ({
          ...prevData,
          [field]: numericValue,
        }));
        break;
      case "buzzer":
        setBuzzerData((prevData) => ({
          ...prevData,
          [field]: numericValue,
        }));
        break;
      case "chargeControl":
        setChargeControlData((prevData) => ({
          ...prevData,
          [field]: numericValue,
        }));
        break;
      default:
        break;
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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

  return (
    <>
      <Head>
        <title>Customers | MyHomeBeacon</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Typography variant="h4">Users</Typography>
              {selectedSubValues?.some((data) => data.sub) && (
                <SvgIcon fontSize="large" style={{ cursor: "pointer" }} onClick={handleClickOpen}>
                  <CogIcon color="black" />
                </SvgIcon>
              )}
              <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
                fullWidth={fullWidth}
                maxWidth={maxWidth}
              >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                  User Device Settings
                </DialogTitle>
                <IconButton
                  aria-label="close"
                  onClick={handleClose}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <DialogContent dividers>
                  <Stack spacing={1}>
                    <Container sx={{ display: "-webkit-flex" }}>
                      <Card>
                        {/* <CardHeader title="Beacon" sx={{ paddingTop: 2, paddingRight: 3, paddingBottom: 2 }} /> */}
                        {/* <Divider /> */}
                        <CardContent sx={{ display: "flex", paddingBottom: 0, paddingTop: 0 }}>
                          <Stack spacing={1} sx={{ maxWidth: 500 }}>
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                              <Typography fontSize={20} fontWeight="bold">
                                Beacon
                              </Typography>
                            </Box>
                            <ChromePicker color={beaconData.color} onChange={handleColorChange} />
                          </Stack>
                          <Stack spacing={1} paddingLeft={5} sx={{ maxWidth: 500 }}>
                            <Box
                              sx={{
                                width: 400,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Typography fontSize={20} fontWeight="bold">
                                LED:
                              </Typography>
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
                            <Box sx={{ width: 300 }}>
                              <Typography>Brightness:</Typography>
                              <Stack direction="row" spacing={1}>
                                <Slider
                                  value={beaconData.brightness}
                                  onChange={handleBrightnessChange}
                                  aria-label="Default"
                                  valueLabelDisplay="auto"
                                />
                                <Typography>{beaconData.brightness}</Typography>
                              </Stack>
                            </Box>
                          </Stack>
                          <Stack spacing={1} paddingLeft={5} sx={{ maxWidth: 500 }}>
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
                              label="Pattern On-Time (ms)"
                              value={buzzerData.onTime}
                              onChange={(e) => handleInputChange(e, "buzzer", "onTime")}
                            />
                            <TextField
                              label="Pattern Off-Time (ms)"
                              value={buzzerData.offTime}
                              onChange={(e) => handleInputChange(e, "buzzer", "offTime")}
                            />
                            <TextField
                              label="Active Duration (sec)"
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
                          {/* <Divider />
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button variant="contained" onClick={() => handleSave('chargeControl')}>
                    Save
                  </Button>
                </CardActions> */}
                        </Card>
                        <Divider />
                        {/* <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button variant="contained" onClick={() => {
                    handleSubmit();
                  }}>
                    Save
                  </Button>
                </CardActions> */}
                      </Card>
                    </Container>
                    <Container></Container>
                  </Stack>
                </DialogContent>
                <DialogActions>
                  <Button
                    variant="contained"
                    onClick={() => {
                      handleSaveButtonClick();
                    }}
                  >
                    Save
                  </Button>
                </DialogActions>
              </BootstrapDialog>
              <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000} // Adjust the duration as needed
                onClose={handleSnackbarClose}
              >
                <MuiAlert
                  elevation={6}
                  variant="filled"
                  onClose={handleSnackbarClose}
                  severity={snackbarMessage.includes("Error") ? "error" : "success"}
                >
                  {snackbarMessage}
                </MuiAlert>
              </Snackbar>
            </Stack>

            <Materialtable onSelectedSubValuesChange={handleSelectedSubValuesChange} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
