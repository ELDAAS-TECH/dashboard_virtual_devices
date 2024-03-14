import { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Divider,
  Table,
  TableRow,
  TableCell,
  IconButton,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const UserTableDropDown = ({ row }) => {
  const [dropdownData, setDropdownData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDropdownData = async (userId) => {
    try {
      setIsLoading(true);
      const idToken = localStorage.getItem("idToken");
      const secondApiResponse = await axios.post(
        `https://m1kiyejux4.execute-api.us-west-1.amazonaws.com/dev/api/v1/devices/getAllProp/${userId}`,
        { user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const dropdownData = secondApiResponse.data;
      setDropdownData(dropdownData.tuya_data || null);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
      setDropdownData(null);
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <IconButton onClick={() => fetchDropdownData(row.original.sub)}>
        {isLoading ? <CircularProgress size={24} /> : <ExpandMoreIcon />}
      </IconButton>
      {dropdownData ? (
        <Stack direction="row" spacing={5}>
          <Stack sx={{ width: "33.33%", overflowX: "scroll" }} textAlign="center">
            <Typography variant="h6" sx={{ fontSize: "16px" }} gutterBottom component="div">
              {`${row.original.given_name}'s Hub` || "N/A"}
            </Typography>
            <Divider />
            <Table size="small">
              <TableRow>
                <TableCell variant="head" sx={{ backgroundColor: "#f3f3f3" }}>
                  ID
                </TableCell>
                <TableCell>{dropdownData.hh_id || "N/A"}</TableCell>
              </TableRow>
              {/* Additional table rows for Hub data */}
            </Table>
          </Stack>
          {/* Additional Stacks for Beacon and Puck data */}
        </Stack>
      ) : (
        <Typography variant="body2" color="textSecondary">
          No Devices available
        </Typography>
      )}
    </Box>
  );
};

export default UserTableDropDown;
