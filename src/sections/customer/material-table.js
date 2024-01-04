import { useMemo, useEffect, useState } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';

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
import { darken, lighten, useTheme } from '@mui/material';


import { useRouter } from 'next/router';

import ExpandableRowGrid from './table';
import ExpandTable from './table';
import axios from 'axios';

export let latitude = '';
export let longitude = '';

export const garageAliveMap = {};
export const beaconAliveMap = {};


const Materialtable = ({ onSelectedSubValuesChange }) => {
    const [data, setData] = useState([]);
    const [dropdownDataMap, setDropdownDataMap] = useState({});
    const [firstName, setfirstName] = useState('');
    const [rowBackgroundColors, setRowBackgroundColors] = useState({});
    const [hoveredRow, setHoveredRow] = useState(null);
    const [checkedRow, setCheckedRow] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const theme = useTheme();

    const handleMouseEnter = (row) => {
        setHoveredRow(row);
    };

    const handleMouseLeave = () => {
        setHoveredRow(null);
    };



    const fetchData = async () => {
        try {
            const idToken = localStorage.getItem('idToken');
            const response = await axios.get('https://m1kiyejux4.execute-api.us-west-1.amazonaws.com/dev/api/v1/users/getUsers', {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            const usersData = response.data['AWS-result'];
            usersData.forEach(user => {
                if (user.address) {
                    const address = user.address;
                    const pinCodePattern = /\b\d{6}\b|\b\d{5}\b/;
                    const match = address.match(pinCodePattern);
                    const pinCode = match ? match[0] : null;
                    const addressWithoutPinCode = address.replace(pinCodePattern, '').trim();
                    // console.log(`Pin Code for ${user.first_name} ${user.last_name}:`, pinCode);
                    user.pinCode = pinCode;
                    user.address = addressWithoutPinCode;

                    const cityPattern = /(?:[^,]+,\s*){1}([^,]+)(?=(,|$))/;
                    const matchcity = address.match(cityPattern);
                    const city = matchcity ? matchcity[1].trim() : null;
                    user.city = city;
                }
                if (user.phone_number) {
                            const phone_number = user.phone_number;
                            const cleanedNumber = phone_number.replace(/\D/g, '');
                            const phonePattern = /^(\d{1,4})(\d{3})(\d{3})(\d{4})$/;
                            // Use regular expressions to extract the country code, area code, and local number
                            const phonematch = cleanedNumber.match(phonePattern);
                            const formattedNumber = `+${phonematch[1]} (${phonematch[2]}) ${phonematch[3]}-${phonematch[4]}`;
                            user.phone_number = formattedNumber;
                        }
            });
            setData(usersData);

            const promises = usersData.map(async (user) => {
                const userId = user.sub;
                const firstName = user.given_name;
                setfirstName(firstName || "N/A");

                try {
                    const secondresponse = await axios.post(`https://m1kiyejux4.execute-api.us-west-1.amazonaws.com/dev/api/v1/devices/getDeviceStatus/${userId}`, {
                        user_id: userId,
                    }, {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    });

                    const apiData = secondresponse.data;
                    const isBeaconAlive = apiData && apiData.device_data && apiData.device_data.get_beacon_alive_status === false;
                    const isGarageAlive = apiData && apiData.device_data && apiData.device_data.get_garage_alive_status === false;
                    const backgroundColor = (isGarageAlive || isBeaconAlive) ? 'red' : 'inherit';

                    setRowBackgroundColors((prevColors) => ({
                        ...prevColors,
                        [userId]: backgroundColor,
                    }));
                } catch (error) {
                    console.error(`Error fetching data for user ${user.sub}:`, error.message);
                    setRowBackgroundColors((prevColors) => ({
                        ...prevColors,
                        [user.sub]: 'inherit',
                    }));

                }
            });


            const updatedData = usersData.map((user) => ({
                checked: false,
            }));
    
            setCheckedRow(updatedData);

            await Promise.all(promises);

        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    };

    const fetchDropdownData = async (userId, firstName) => {
        try {
            const idToken = localStorage.getItem('idToken');
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
            // console.log('Data:', dropdownData);
            // setDropdownData(dropdownData.tuya_data);
            // return dropdownData.tuya_data;

            setDropdownDataMap((prevDataMap) => ({
                ...prevDataMap,
                [userId]: dropdownData.tuya_data || null,
            }));
        } catch (error) {
            console.error('Error fetching dropdown data:', error.message);
            setDropdownDataMap((prevDataMap) => ({
                ...prevDataMap,
                [userId]: null,
            }));
        }
    };
    useEffect(() => {
        fetchData();
        setCheckedRow([]);
    }, []);


    const router = useRouter();

    const handleSelectAllClick = () => {
        setSelectAll(!selectAll);
    
        const updatedRows = selectAll
            ? []
            : data.map((user) => ({ sub: user.sub }));
    
        setCheckedRow(updatedRows);
        onSelectedSubValuesChange(updatedRows);
    };
    

    const columns = useMemo(
        () => [
            {
                accessorKey: 'checkbox',
                header: (
                    <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAllClick}
        />
                ),
                Cell: ({ row }) => (
                    <input
                        type="checkbox"
                        checked={checkedRow.some((item) => item.sub === row.original.sub)}
                        onChange={(event) => handleCheckboxClick(event, row)}
                        onClick={(event) => event.stopPropagation()}
                    />
                ),
            },
            {
                accessorKey: 'given_name',
                header: 'Firstname',
            },
            {
                accessorKey: 'family_name',
                header: 'Lastname',
            },
            {
                accessorKey: 'address',
                header: 'Address'
            },
            {
                accessorKey: 'city',
                header: 'City'
            },
            {
                accessorKey: 'pinCode',
                header: 'ZipCode',
            },
            {
                accessorKey: 'email',
                header: 'Email',
                // selector: row => row.email,
            },
            {
                accessorKey: 'phone_number',
                header: 'Contact number',
            },
            {
                // accessorFn: (originalRow) => new Date(originalRow.birthdate), //convert to date for sorting and filtering
                accessorKey: 'birthdate',
                header: 'Date of Birth',
                // filterVariant: 'date-range',
                // Cell: ({ cell }) => cell.getValue().toLocaleDateString(), // convert back to string for display
                filterVariant: 'range',
            },
            {
                accessorKey: 'os',
                header: 'Operating system',
            },

        ],
        [selectAll, checkedRow]
        //end
    );

    function getSubByEmail(email) {
        for (const entry of data) {
            if (entry.email === email) {
                return { sub: entry.sub, lat: entry['custom:latitude'], lon: entry['custom:longitude'] };
            }
        }
        return null;
    }

   

    const handleCheckboxClick = (event, row) => {
        event.stopPropagation();
        const userId = row.original.sub;
    
        setCheckedRow((prevCheckedRows) => {
            const isChecked = prevCheckedRows.some((item) => item.sub === userId);
            let updatedRows;
    
            if (isChecked) {
                updatedRows = prevCheckedRows.filter((item) => item.sub !== userId);
            } else {
                updatedRows = [...prevCheckedRows, { sub: userId }];
            }
    
            onSelectedSubValuesChange(updatedRows);
            return updatedRows;
        });
    };  
    
    
    
    const showCheckedDetails = (checkedRows) => {
        console.log("Checked Rows:", checkedRows);
        checkedRows.forEach((sub) => {
            console.log('Handling submit for userId:', sub);
            // Uncomment the line below when you want to use handleSubmit
            // handleSubmit(sub);
        });
    };   
    
    

    const handleRowClick = (row) => {
        const username = row.original.family_name;
        const email = row.original.email;
        const body = getSubByEmail(email);
        console.log(email, body);
        latitude = body.lat;
        longitude = body.lon;

        const idToken = localStorage.getItem('idToken');
        const userId = row.original.sub;
        axios
            .post(`https://m1kiyejux4.execute-api.us-west-1.amazonaws.com/dev/api/v1/devices/getDeviceStatus/${userId}`, {
                user_id: userId,
            }, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            })
            .then((response) => {
                const apiData = response.data;
                const isBeaconAlive = apiData && apiData.device_data && apiData.device_data.get_beacon_alive_status === false;
                const isGarageAlive = apiData && apiData.device_data && apiData.device_data.get_garage_alive_status === false;

                router.push({
                    pathname: `/user/${username}`,
                    query: { isBeaconAlive, isGarageAlive },
                });
            })
            .catch((error) => {
                console.error(`Error fetching data for user ${row.original.sub}:`, error.message);
                router.push({
                    pathname: `/user/${username}`,
                    query: { isBeaconAlive: false, isGarageAlive: false },
                });
            });
    };


    const getBackgroundColor = (user, isHovered) => {
        const backgroundColor = rowBackgroundColors[user.sub];

        return backgroundColor !== undefined ? backgroundColor : 'inherit';
    };

    const RenderDetailPanel = ({ row }) => {
        useEffect(() => {
            if (row.original.sub) {
                fetchDropdownData(row.original.sub);
            }
        }, [row.original.sub]);

        const dropdownData = dropdownDataMap[row.original.sub];

        return (
            <Box
                sx={{
                    width: '100%',
                }}
            >
                {dropdownData ? (
                    <Stack direction="row" spacing={5}>

                        <Stack sx={{ width: "33.33%", overflowX: "scroll" }} textAlign='center'>
                            <Typography variant="h6" sx={{ fontSize: "16px" }} gutterBottom component="div">
                                {`${row.original.given_name}'s Hub` || "N/A"}
                            </Typography>
                            <Divider />
                            {/* <Typography sx={{ fontSize: "12px" }} >
                                Home Hub
                            </Typography> */}

                            <Table size="small">
                                <TableRow >
                                    <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>ID</TableCell>
                                    <TableCell>{dropdownData.hh_id || "N/A"}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Slaves Connected</TableCell>
                                    <TableCell>{dropdownData.slaves_connected || "N/A"}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Firmware Version</TableCell>
                                    <TableCell >{dropdownData.hh_fw_ver}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Landline</TableCell>
                                    <TableCell >{dropdownData.landline}</TableCell>
                                </TableRow>
                            </Table>
                        </Stack>
                        <Stack sx={{ width: "33.33%", overflowX: "scroll" }} textAlign='center'>
                            <Box sx={{}}>
                                <Typography variant="h6" sx={{ fontSize: "16px" }} gutterBottom component="div">
                                    {`${row.original.given_name}'s Beacon` || "N/A"}
                                </Typography>
                                <Divider />
                                {/* <Typography sx={{ fontSize: "12px" }} >
                                    Beacon
                                </Typography> */}

                                <Table size="small" align="center">

                                    <TableRow >
                                        <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>ID</TableCell>
                                        <TableCell>   {dropdownData.b_id}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Battery Level</TableCell>
                                        <TableCell> {dropdownData.b_batt_lvl}</TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Solar Level</TableCell>
                                        <TableCell>{dropdownData.b_solar_lvl !== undefined ? dropdownData.b_solar_lvl.toString() : "N/A"}</TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Temprature</TableCell>
                                        <TableCell> {dropdownData.b_temp}</TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>RSSI</TableCell>
                                        <TableCell> {dropdownData.b_rssi}</TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Firmware Version</TableCell>
                                        <TableCell> {dropdownData.b_fw_ver}</TableCell>

                                    </TableRow>
                                </Table>
                            </Box>
                        </Stack>
                        <Stack sx={{ width: "33.33%", overflowX: "scroll" }} textAlign='center'>
                            <Box sx={{}}>
                                <Typography variant="h6" sx={{ fontSize: "16px" }} gutterBottom component="div">
                                    {`${row.original.given_name}'s Puck` || "N/A"}
                                </Typography>
                                <Divider />
                                {/* <Typography sx={{ fontSize: "12px" }} >
                                    Puck
                                </Typography> */}
                                <Table size="small">

                                    <TableRow >
                                        <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>ID</TableCell>
                                        <TableCell>{dropdownData.gp_id}</TableCell>

                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Battery Level</TableCell>
                                        <TableCell>{dropdownData.g_batt_lvl}</TableCell>
                                    </TableRow>

                                    {/* <TableRow>
                                <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Accelermeter</TableCell>
                                <TableCell>{row.original.puck[0].Accelerometer}</TableCell>
                            </TableRow> */}

                                    <TableRow>
                                        <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>RSSI</TableCell>
                                        <TableCell>{dropdownData.g_rssi}</TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell variant="head" sx={{ backgroundColor: '#f3f3f3' }}>Firmware Version</TableCell>
                                        <TableCell >
                                            {dropdownData.g_fw_ver}
                                        </TableCell>
                                    </TableRow>
                                </Table>
                            </Box>
                        </Stack>
                    </Stack>
                ) : (
                    <Typography variant="body2" color="textSecondary">
                        No data available.
                    </Typography>
                )}
            </Box >
        );
    }

    const table = useMaterialReactTable({
        columns,
        data,
        enableExpandAll: true, //hide expand all double arrow in column header
        enableExpanding: true,
        filterFromLeafRows: true, //apply filtering to all rows instead of just parent rows
        initialState: { expanded: false }, //expand all rows by default
        paginateExpandedRows: false, //When rows are expanded, do not count sub-rows as number of rows on the page towards pagination
        filterFromLeafRows: true,
        enableFullScreenToggle: false,
        columnFilterDisplayMode: 'popover',
        muiSearchTextFieldProps: {
            placeholder: 'Provide at least four characters',
            sx: { minWidth: '300px' },
            variant: 'outlined',
          },
        muiTableBodyRowProps: ({ row }) => ({
            onClick: (event) => {
                handleRowClick(row);
            },
            onMouseEnter: () => handleMouseEnter(row),
            onMouseLeave: handleMouseLeave,
            sx: {
                cursor: 'pointer',
                backgroundColor: getBackgroundColor(row.original),
            }
        }),
        RenderDetailPanel,

    });

    return <MaterialReactTable table={table} />;
};

export default Materialtable;
