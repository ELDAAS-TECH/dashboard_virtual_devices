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

const UserDetails = () => {
    const [userId, setuserId] = useState('');
    const [firstName, setfirstName] = useState('');
    const [lastName, setlastName] = useState('');
    const [address, setaddress] = useState('');
    const [city, setcity] = useState('');
    const [pinCode, setpinCode] = useState('');
    const [email, setemail] = useState('');
    const [phoneNumber, setphoneNumber] = useState('');
    const [birthDate, setbirthDate] = useState('');
    const [os, setos] = useState('');

    const fetchData = async () => {
        try {
            const idToken = localStorage.getItem('idToken');
            const { email } = router.query;
            if (!email) {
                console.error('Username not provided in the URL.');
                return;
            }

            const response = await axios.get('https://m1kiyejux4.execute-api.us-west-1.amazonaws.com/dev/api/v1/users/getUsers', {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            // const user = response.data['AWS-result'].find(user => user.family_name === username);
            const user = response.data['AWS-result'].find(user => user.email === email);
            const address1 = user.address;
            const pinCodePattern = /\b\d{6}\b/;
            const match = address1.match(pinCodePattern);
            const pinCode = match ? match[0] : null;
            const address = address1.replace(pinCodePattern, '').trim();
            user.pinCode = pinCode;
            const cityPattern = /(?:[^,]+,\s*){3}([^,]+)(?=(,|$))/;
            const matchcity = address.match(cityPattern);
            const city = matchcity ? matchcity[1].trim() : null;
            user.city = city;

            if (!user) {
                console.error(`User with username ${username} not found.`);
                return;
            }

            const userId = user.sub;
            const firstName = user.given_name;
            const lastName = user.family_name;
            // const email = user.email;

            const phone_number = user.phone_number;
            const cleanedNumber = phone_number.replace(/\D/g, '');
            const phonePattern = /^(\d{1,4})(\d{3})(\d{3})(\d{4})$/;
            const phonematch = cleanedNumber.match(phonePattern);
            const phoneNumber = `+${phonematch[1]} (${phonematch[2]}) ${phonematch[3]}-${phonematch[4]}`;

            const birthDate = user.birthdate;
            const os = user.os;
            setuserId(userId || "N/A");
            setfirstName(firstName || "N/A");
            setlastName(lastName || "N/A");
            setaddress(address || "N/A");
            setcity(city || "N/A");
            setpinCode(pinCode || "N/A");
            setemail(email || "N/A");
            setphoneNumber(phoneNumber || "N/A");
            setbirthDate(birthDate || "N/A");
            setos(os || "N/A");

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
            <Stack textAlign='center' sx={{ width: "50%" }}>
                <Table>
                    <TableRow >
                        <TableCell variant="head" sx={{ backgroundColor: '#f7f7f7', width: "40%" }}>First Name</TableCell>
                        <TableCell>{firstName || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell variant="head" sx={{ backgroundColor: '#f7f7f7' }}>Last Name</TableCell>
                        <TableCell>{lastName || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell variant="head" sx={{ backgroundColor: '#f7f7f7' }}>Address</TableCell>
                        <TableCell >{address || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell variant="head" sx={{ backgroundColor: '#f7f7f7' }}>City</TableCell>
                        <TableCell >{city || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell variant="head" sx={{ backgroundColor: '#f7f7f7' }}>ZipCode</TableCell>
                        <TableCell >{pinCode || "N/A"}</TableCell>
                    </TableRow>
                </Table>
            </Stack>
            <Stack textAlign='center' sx={{ width: "50%" }}>
                <Table>
                    <TableRow>
                        <TableCell variant="head" sx={{ backgroundColor: '#f7f7f7' }}>Email</TableCell>
                        <TableCell >{email || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell variant="head" sx={{ backgroundColor: '#f7f7f7' }}>Phone Number</TableCell>
                        <TableCell >{phoneNumber || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell variant="head" sx={{ backgroundColor: '#f7f7f7' }}>Birthdate</TableCell>
                        <TableCell >{birthDate || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell variant="head" sx={{ backgroundColor: '#f7f7f7' }}>OS</TableCell>
                        <TableCell >{os || "N/A"}</TableCell>
                    </TableRow>
                </Table>
            </Stack>
        </div>
    );
};

export default UserDetails;
