import { useCallback, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Unstable_Grid2 as Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useAuthContext } from "src/contexts/auth-context";

const states = [
  {
    value: "alabama",
    label: "Alabama",
  },
  {
    value: "new-york",
    label: "New York",
  },
  {
    value: "san-francisco",
    label: "San Francisco",
  },
  {
    value: "los-angeles",
    label: "Los Angeles",
  },
];

export const AccountProfileDetails = () => {
  const { user } = useAuthContext();
  console.log(user?.phone_number);
  const [values, setValues] = useState({
    firstName: user?.given_name,
    lastName: user?.family_name,
    email: user?.email,
    phone: user?.phone_number.slice(1),
    address: user?.address,
  });

  const handleChange = useCallback((event) => {
    setValues((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  }, []);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <form autoComplete="off" noValidate onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Stack
          spacing={1}
          direction="row"
          sx={{ border: "1px solid #C9C9C9", p: 2, borderRadius: "5px" }}
        >
          <Typography variant="subtitle">First Name :</Typography>
          <Typography variant="body1">{values.firstName}</Typography>
        </Stack>
        <Stack
          spacing={1}
          direction="row"
          sx={{ border: "1px solid #C9C9C9", p: 2, borderRadius: "5px" }}
        >
          <Typography variant="subtitle">Last Name :</Typography>
          <Typography variant="body1">{values.lastName}</Typography>
        </Stack>
        <Stack
          spacing={1}
          direction="row"
          sx={{ border: "1px solid #C9C9C9", p: 2, borderRadius: "5px" }}
        >
          <Typography variant="subtitle">Email :</Typography>
          <Typography variant="body1">{values.email}</Typography>
        </Stack>
        <Stack
          spacing={1}
          direction="row"
          sx={{ border: "1px solid #C9C9C9", p: 2, borderRadius: "5px" }}
        >
          <Typography variant="subtitle">Phone Number :</Typography>
          <Typography variant="body1">{values.phone}</Typography>
        </Stack>
        <Stack
          spacing={1}
          direction="row"
          sx={{ border: "1px solid #C9C9C9", p: 2, borderRadius: "5px" }}
        >
          <Typography variant="subtitle">Address :</Typography>
          <Typography variant="body1">{values.address}</Typography>
        </Stack>
      </Stack>
    </form>
  );
};
