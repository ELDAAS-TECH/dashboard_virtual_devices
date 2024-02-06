import { useMemo, useState, useEffect } from 'react';

import {
    Box, Typography, Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    Divider,
    Stack
} from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';

const Devicetable = () => {
    const [datafordevicetable, setDatafordevicetable] = useState({});
    const [firstName, setfirstName] = useState('');

    const fetchData = async () => {
        try {
            const idToken = localStorage.getItem('idToken');
            const {email } = router.query;
            if (!email) {
                console.error('Username not provided in the URL.');
                return;
            }

            const response = await axios.get('https://m1kiyejux4.execute-api.us-west-1.amazonaws.com/dev/api/v1/users/getUsers', {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            const user = response.data['AWS-result'].find(user => user.email === email);

            if (!user) {
                console.error(`User with username ${username} not found.`);
                return;
            }

            const userId = user.sub;
            const firstName = user.given_name;
            setfirstName(firstName || "N/A");

            const secondApiResponse = await axios.post(
                `https://m1kiyejux4.execute-api.us-west-1.amazonaws.com/dev/api/v1/devices/getAllProp/${userId}`,
                { user_id: userId },
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const dropdownData = secondApiResponse.data;
            setDatafordevicetable(dropdownData.tuya_data || {});
            console.log('datafordevicetable:', datafordevicetable);
        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const router = useRouter();

    return (
        <div style={{ display: "flex" }}>
            <Stack sx={{ width: "33.33%", overflowX: "scroll" }} textAlign='center'>
                <Typography variant="h6" sx={{ fontSize: "16px" }} gutterBottom component="div">
                {`${firstName}'s Hub` || "N/A"}
                </Typography>
                <Divider />
                {/* <Typography sx={{ fontSize: "12px" }} >
                    Home Hub
                </Typography> */}
                <Table size="small">
                    <TableRow >
                        <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>ID</TableCell>
                        <TableCell>{datafordevicetable.hh_id || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Slaves Connected</TableCell>
                        <TableCell>{datafordevicetable.slaves_connected || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Firmware Version</TableCell>
                        <TableCell >{datafordevicetable.hh_fw_ver}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Landline</TableCell>
                        <TableCell >{datafordevicetable.landline}</TableCell>
                    </TableRow>
                </Table>
            </Stack>
            <Stack sx={{ width: "33.33%", overflowX: "scroll"}} textAlign='center'>
                    <Typography variant="h6" sx={{ fontSize: "16px" }} gutterBottom component="div">
                    {`${firstName}'s Beacon` || "N/A"}
                    </Typography>
                    <Divider />
                    {/* <Typography sx={{ fontSize: "12px" }} >
                        Beacon
                    </Typography> */}

                    <Table size="medium" align="center">

                        <TableRow >
                            <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>ID</TableCell>
                            <TableCell>   {datafordevicetable.b_id}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Battery Level</TableCell>
                            <TableCell> {datafordevicetable.b_batt_lvl}</TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Solar Level</TableCell>
                            <TableCell>{datafordevicetable.b_solar_lvl !== undefined ? datafordevicetable.b_solar_lvl.toString() : "N/A"}</TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Temprature</TableCell>
                            <TableCell> {datafordevicetable.b_temp}</TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>RSSI</TableCell>
                            <TableCell> {datafordevicetable.b_rssi}</TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Firmware Version</TableCell>
                            <TableCell> {datafordevicetable.b_fw_ver}</TableCell>

                        </TableRow>
                    </Table>
            </Stack>
            <Stack sx={{ width: "33.33%", overflowX: "scroll" }} textAlign='center'>
                    <Typography variant="h6" sx={{ fontSize: "16px" }} gutterBottom component="div">
                    {`${firstName}'s Puck` || "N/A"}
                    </Typography>
                    <Divider />
                    {/* <Typography sx={{ fontSize: "12px" }} >
                        Puck
                    </Typography> */}
                    <Table size="small">
                        <TableRow >
                            <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>ID</TableCell>
                            <TableCell>{datafordevicetable.gp_id}</TableCell>

                        </TableRow>
                        <TableRow>
                            <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Battery Level</TableCell>
                            <TableCell>{datafordevicetable.g_batt_lvl}</TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>RSSI</TableCell>
                            <TableCell>{datafordevicetable.g_rssi}</TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Firmware Version</TableCell>
                            <TableCell >
                                {datafordevicetable.g_fw_ver}
                            </TableCell>
                        </TableRow>
                    </Table>
            </Stack>
        </div>
    );
};

export default Devicetable;
